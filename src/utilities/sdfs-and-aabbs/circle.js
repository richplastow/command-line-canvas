/**
 * Signed distance function (SDF) and axis-aligned bounding box (AABB) for
 * a circle.
 */

/**
 * @typedef {import('../../clc-types.js').Bounds} Bounds
 */

/** #### Signed distance function for a circle
 * @param {number} tx // center position (translate) x, in world-space units
 * @param {number} ty // center position (translate) y, in world-space units
 * @param {number} r // radius, in world-space units
 * @returns {number}
 */
export const sdfCircle = (tx, ty, r) =>
    Math.sqrt(tx * tx + ty * ty) - r;

/** #### Axis-aligned bounding box for a circle
 * @param {number} tx // center position (translate) x, in world-space units
 * @param {number} ty // center position (translate) y, in world-space units
 * @param {number} r // radius, in world-space units
 * @param {number} expand World units to expand the box (e.g. for anti-aliasing)
 * @returns {Bounds}
 */
export const aabbCircle = (tx, ty, r, expand) => {
    const expandedR = Math.abs(r) + expand;
    return {
        xMin: tx - expandedR,
        xMax: tx + expandedR,
        yMin: ty - expandedR,
        yMax: ty + expandedR,
    };
};
