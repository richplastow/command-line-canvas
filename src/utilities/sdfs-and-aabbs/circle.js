/**
 * @fileoverview
 * Signed distance function (SDF) and rough vertices for a circle.
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

/** #### Rough vertices of a circle with 1-unit radius
 * - Samples 8 points around perimeter for rotation-invariant coverage.
 * - Useful for generating an AABB.
 * TODO extend to support other radii.
 * @returns {{x:number,y:number}[]}
 */
export const verticesCircle = () => {
    const vertices = [];
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * 2 * Math.PI;
        vertices.push({
            x: Math.cos(angle),
            y: Math.sin(angle),
        });
    }
    return vertices;
};
