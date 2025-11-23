/**
 * Signed distance function (SDF) and axis-aligned bounding box (AABB) for
 * an aggregated array of primitives.
 */

import { sdfCircle, verticesCircle } from './circle.js';
import { sdfTriangleRight, verticesTriangleRight } from './triangle-right.js';

const FLIP_SIGNS = Object.freeze({
    'no-flip': Object.freeze({ x: 1, y: 1 }),
    'flip-x': Object.freeze({ x: -1, y: 1 }),
    'flip-y': Object.freeze({ x: 1, y: -1 }),
    'flip-x-and-y': Object.freeze({ x: -1, y: -1 }),
});

/**
 * @typedef {import('../../clc-types.js').Bounds} Bounds
 * @typedef {import('../../models/primitive/primitive.js').Primitive} Primitive
 * @typedef {import('../../models/shape/shape.js').Shape} Shape
 */

/** #### Composite signed distance function for a Shape made from primitives
 * Combines primitive SDFs left-to-right using join modes:
 * - 'union' -> min(a,b)
 * - 'difference' -> difference(a,b) == max(a, -b)
 * @param {Shape} shape
 * @param {number} worldX
 * @param {number} worldY
 * @returns {number}
 */
export const sdfCompound = (shape, worldX, worldY) => {
    if (shape.primitives.length === 0) return 1e6;

    const shapeScale = shape.scale || 1;
    if (shapeScale === 0) return 1e6;

    const shapeTx = shape.translate.x;
    const shapeTy = shape.translate.y;
    const shapeFlip = FLIP_SIGNS[shape.flip] || FLIP_SIGNS['no-flip'];
    const shapeRotate = shape.rotate || 0;

    // Translate to shape origin.
    let shapeLocalX = (worldX - shapeTx) * shapeFlip.x / shapeScale;
    let shapeLocalY = (worldY - shapeTy) * shapeFlip.y / shapeScale;

    // Apply shape rotation.
    if (shapeRotate !== 0) {
        const cos = Math.cos(-shapeRotate);
        const sin = Math.sin(-shapeRotate);
        const rotX = shapeLocalX * cos - shapeLocalY * sin;
        const rotY = shapeLocalX * sin + shapeLocalY * cos;
        shapeLocalX = rotX;
        shapeLocalY = rotY;
    }

    let acc = null;

    for (let i = 0; i < shape.primitives.length; i++) {
        const p = shape.primitives[i];

        const primScale = p.scale || 1;
        if (primScale === 0) continue;

        const primFlip = FLIP_SIGNS[p.flip] || FLIP_SIGNS['no-flip'];
        const totalScale = shapeScale * primScale;
        const primRotate = p.rotate || 0;

        // Translate to primitive origin.
        let localX = (shapeLocalX - p.translate.x) * primFlip.x / primScale;
        let localY = (shapeLocalY - p.translate.y) * primFlip.y / primScale;

        // Apply primitive rotation.
        if (primRotate !== 0) {
            const cos = Math.cos(-primRotate);
            const sin = Math.sin(-primRotate);
            const rotX = localX * cos - localY * sin;
            const rotY = localX * sin + localY * cos;
            localX = rotX;
            localY = rotY;
        }

        let dWorld = 1e6;
        switch (p.kind) {
            case 'circle': {
                // User hard-coded local radius r=1.
                // TODO extend to support other radii.
                const dLocal = sdfCircle(localX, localY, 1);
                dWorld = dLocal * totalScale;
                break;
            }
            case 'triangle-right': {
                // Use hard-coded local side lengths lx=1, ly=2.
                // TODO extend to support other sizes.
                const dLocal = sdfTriangleRight(localX, localY, 1, 2);
                dWorld = dLocal * totalScale;
                break;
            }
            default:
                dWorld = 1e6;
        }

        if (acc === null) {
            acc = dWorld;
        } else if (p.joinMode === 'union') {
            acc = Math.min(acc, dWorld);
        } else {
            acc = Math.max(acc, -dWorld);
        }
    }

    return acc === null ? 1e6 : acc;
};

/** #### Axis-aligned bounding box for a composite shape
 * Unions primitive AABBs (converted to world-space by adding the shape's
 * position to each primitive's offset).
 * @param {Shape} shape
 * @param {number} expand Amount to expand each primitive's box (world units)
 * @returns {Bounds}
 */
export const aabbCompound = (shape, expand) => {

    // Initialise to an 'inverted box', that any real AABB will intersect.
    let out = { xMin: 1e9, xMax: -1e9, yMin: 1e9, yMax: -1e9 };

    const shapeScale = shape.scale || 1;
    if (shapeScale === 0) return { xMin: -1e6, xMax: 1e6, yMin: -1e6, yMax: 1e6 };

    const shapeFlip = FLIP_SIGNS[shape.flip] || FLIP_SIGNS['no-flip'];

    for (let i = 0; i < shape.primitives.length; i++) {
        const p = shape.primitives[i];
        const box = computePrimitiveWorldAabb(
            expand,
            p,
            shape,
            shapeFlip,
            shapeScale,
        );
        if (box === null) continue;

        out.xMin = Math.min(out.xMin, box.xMin);
        out.xMax = Math.max(out.xMax, box.xMax);
        out.yMin = Math.min(out.yMin, box.yMin);
        out.yMax = Math.max(out.yMax, box.yMax);
    }

    // If no primitives were processed, return a huge box.
    if (out.xMin > out.xMax) return { xMin: -1e6, xMax: 1e6, yMin: -1e6, yMax: 1e6 };

    return out;
};

/** #### Axis-aligned bounding box for a primitive within a shape context
 * - Returns `null` when the primitive's scale is zero.
 * @param {number} expand Amount to expand the box (world units)
 * @param {Primitive} primitive Primitive to measure
 * @param {Shape} shape Shape that owns the primitive
 * @returns {Bounds|null}
 */
export const aabbPrimitiveInShape = (expand, primitive, shape) => {
    const shapeScale = shape.scale || 1;
    if (shapeScale === 0) return null;

    const shapeFlip = FLIP_SIGNS[shape.flip] || FLIP_SIGNS['no-flip'];

    return computePrimitiveWorldAabb(
        expand,
        primitive,
        shape,
        shapeFlip,
        shapeScale,
    );
};

/** #### Compute world-space AABB for a primitive within a shape context
 * Transforms actual vertices (not bounding box corners) through the full
 * transformation pipeline, then computes the AABB of the result.
 * - Returns `null` when the primitive's scale is zero.
 * @param {number} expand Amount to expand the box (world units)
 * @param {Primitive} primitive Primitive to measure
 * @param {Shape} shape Shape that owns the primitive
 * @param {{x:number,y:number}} shapeFlip Flip signs of the shape
 * @param {number} shapeScale Scale of the shape
 * @returns {Bounds|null}
 */
const computePrimitiveWorldAabb = (
    expand,
    primitive,
    shape,
    shapeFlip,
    shapeScale,
) => {
    const primScale = primitive.scale || 1;
    if (primScale === 0) return null;

    const primFlip = FLIP_SIGNS[primitive.flip] || FLIP_SIGNS['no-flip'];
    const shapeRotate = shape.rotate || 0;
    const primRotate = primitive.rotate || 0;

    // Get local vertices (actual shape vertices, not bounding box corners).
    // Using actual vertices is critical: for non-rectangular shapes like triangles,
    // transforming bounding box corners produces incorrect AABBs after rotation.
    let vertices;
    switch (primitive.kind) {
        case 'circle': {
            // TODO extend to support other radii.
            vertices = verticesCircle();
            break;
        }
        case 'triangle-right': {
            // TODO extend to support other sizes.
            vertices = verticesTriangleRight();
            break;
        }
        default:
            return { xMin: -1e6, xMax: 1e6, yMin: -1e6, yMax: 1e6 };
    }

    // Transform vertices through:
    // primitive scale → primitive rotate → primitive flip → primitive translate
    //   → shape scale →     shape rotate →     shape flip →     shape translate.
    // TODO caching, and use only one loop, if performance is an issue...
    // TODO ...or maybe optimize by combining transforms into matrices

    // 1. Apply primitive scale.
    for (let i = 0; i < vertices.length; i++) {
        vertices[i].x *= primScale;
        vertices[i].y *= primScale;
    }

    // 2. Apply primitive rotation.
    if (primRotate !== 0) {
        const cos = Math.cos(primRotate);
        const sin = Math.sin(primRotate);
        for (let i = 0; i < vertices.length; i++) {
            const x = vertices[i].x;
            const y = vertices[i].y;
            vertices[i].x = x * cos - y * sin;
            vertices[i].y = x * sin + y * cos;
        }
    }

    // 3. Apply primitive flip.
    for (let i = 0; i < vertices.length; i++) {
        vertices[i].x *= primFlip.x;
        vertices[i].y *= primFlip.y;
    }

    // 4. Translate by primitive offset (in shape-local space).
    for (let i = 0; i < vertices.length; i++) {
        vertices[i].x += primitive.translate.x;
        vertices[i].y += primitive.translate.y;
    }

    // 5. Apply shape scale.
    for (let i = 0; i < vertices.length; i++) {
        vertices[i].x *= shapeScale;
        vertices[i].y *= shapeScale;
    }

    // 6. Apply shape rotation.
    if (shapeRotate !== 0) {
        const cos = Math.cos(shapeRotate);
        const sin = Math.sin(shapeRotate);
        for (let i = 0; i < vertices.length; i++) {
            const x = vertices[i].x;
            const y = vertices[i].y;
            vertices[i].x = x * cos - y * sin;
            vertices[i].y = x * sin + y * cos;
        }
    }

    // 7. Apply shape flip.
    for (let i = 0; i < vertices.length; i++) {
        vertices[i].x *= shapeFlip.x;
        vertices[i].y *= shapeFlip.y;
    }

    // 8. Translate by shape position (to world space).
    for (let i = 0; i < vertices.length; i++) {
        vertices[i].x += shape.translate.x;
        vertices[i].y += shape.translate.y;
    }

    // Compute AABB from transformed vertices.
    let xMin = vertices[0].x;
    let xMax = vertices[0].x;
    let yMin = vertices[0].y;
    let yMax = vertices[0].y;
    for (let i = 1; i < vertices.length; i++) {
        if (vertices[i].x < xMin) xMin = vertices[i].x;
        if (vertices[i].x > xMax) xMax = vertices[i].x;
        if (vertices[i].y < yMin) yMin = vertices[i].y;
        if (vertices[i].y > yMax) yMax = vertices[i].y;
    }

    return {
        xMin: xMin - expand,
        xMax: xMax + expand,
        yMin: yMin - expand,
        yMax: yMax + expand,
    };
};
