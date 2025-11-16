/**
 * Signed distance function (SDF) and axis-aligned bounding box (AABB) for
 * an aggregated array of primitives.
 */

import { aabbCircle, sdfCircle } from './circle.js';
import { aabbTriangleRight, sdfTriangleRight } from './triangle-right.js';

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

    const shapeLocalX = (worldX - shapeTx) * shapeFlip.x / shapeScale;
    const shapeLocalY = (worldY - shapeTy) * shapeFlip.y / shapeScale;

    let acc = null;

    for (let i = 0; i < shape.primitives.length; i++) {
        const p = shape.primitives[i];

        const primScale = p.scale || 1;
        if (primScale === 0) continue;

        const primFlip = FLIP_SIGNS[p.flip] || FLIP_SIGNS['no-flip'];
        const totalScale = shapeScale * primScale;

        const localX = (shapeLocalX - p.translate.x) * primFlip.x / primScale;
        const localY = (shapeLocalY - p.translate.y) * primFlip.y / primScale;

        let dWorld = 1e6;
        switch (p.kind) {
            case 'circle': {
                const dLocal = sdfCircle(localX, localY, 1);
                dWorld = dLocal * totalScale;
                break;
            }
            case 'triangle-right': {
                // Use hard-coded local side lengths lx=1, ly=2.
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

    const totalScale = shapeScale * primScale;
    const primCenterX = shape.translate.x
        + (primitive.translate.x * shapeScale * shapeFlip.x);
    const primCenterY = shape.translate.y
        + (primitive.translate.y * shapeScale * shapeFlip.y);

    switch (primitive.kind) {
        case 'circle': {
            const scaledRadius = Math.abs(totalScale);
            return aabbCircle(primCenterX, primCenterY, scaledRadius, expand);
        }
        case 'triangle-right': {
            const lx = totalScale * 1;
            const ly = totalScale * 2;
            return aabbTriangleRight(primCenterX, primCenterY, lx, ly,
                expand);
        }
        default:
            return { xMin: -1e6, xMax: 1e6, yMin: -1e6, yMax: 1e6 };
    }
};
