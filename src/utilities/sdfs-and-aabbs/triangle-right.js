/**
 * Signed distance function (SDF) and axis-aligned bounding box (AABB) for
 * a right triangle.
 */

/**
 * @typedef {import('../../clc-types.js').Bounds} Bounds
 */
import { segmentDistance } from './sdf-utilities.js';

/** #### Signed distance function for a right triangle
 * @param {number} tx // center position (translate) x, in world-space units
 * @param {number} ty // center position (translate) y, in world-space units
 * @param {number} lx // horizontal side length, in world-space units
 * @param {number} ly // vertical side length, in world-space units
 * @returns {number}
 */
export const sdfTriangleRight = (tx, ty, lx, ly) => {
    const absLx = Math.abs(lx);
    const absLy = Math.abs(ly);
    const halfLx = absLx / 2;
    const halfLy = absLy / 2;

    const ax = -halfLx;
    const ay = -halfLy;
    const bx = halfLx;
    const by = -halfLy;
    const cx = -halfLx;
    const cy = halfLy;

    const crossAB = (bx - ax) * (ty - ay) - (by - ay) * (tx - ax);
    const crossBC = (cx - bx) * (ty - by) - (cy - by) * (tx - bx);
    const crossCA = (ax - cx) * (ty - cy) - (ay - cy) * (tx - cx);
    const inside = crossAB >= 0 && crossBC >= 0 && crossCA >= 0;

    const dAB = segmentDistance(tx, ty, ax, ay, bx, by);
    const dBC = segmentDistance(tx, ty, bx, by, cx, cy);
    const dCA = segmentDistance(tx, ty, cx, cy, ax, ay);
    const dist = Math.min(dAB, dBC, dCA);

    return inside ? -dist : dist;
};

/** #### Axis-aligned bounding box for a right triangle
 * @param {number} tx // center position (translate) x, in world-space units
 * @param {number} ty // center position (translate) y, in world-space units
 * @param {number} lx // horizontal side length, in world-space units
 * @param {number} ly // vertical side length, in world-space units
 * @param {number} expand World units to expand the box (e.g. for AA)
 * @returns {Bounds}
 */
export const aabbTriangleRight = (tx, ty, lx, ly, expand) => {
    const halfLx = Math.abs(lx) / 2;
    const halfLy = Math.abs(ly) / 2;
    return {
        xMin: tx - halfLx - expand,
        xMax: tx + halfLx + expand,
        yMin: ty - halfLy - expand,
        yMax: ty + halfLy + expand,
    };
};


