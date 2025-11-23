/**
 * @fileoverview
 * Signed distance function (SDF) and vertices for a right triangle.
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

/** #### Vertices for a right triangle
 * - Right triangle vertices (lx=1, ly=2): bottom-left, bottom-right, top-left.
 * - Useful for generating an AABB.
 * - TODO extend to support other sizes.
 * @returns {{x:number,y:number}[]}
 */
export const verticesTriangleRight = () => {
    const halfLx = 0.5;
    const halfLy = 1;
    return [
        { x: -halfLx, y: -halfLy }, // bottom-left
        { x: halfLx, y: -halfLy },  // bottom-right
        { x: -halfLx, y: halfLy },  // top-left
    ];
};
