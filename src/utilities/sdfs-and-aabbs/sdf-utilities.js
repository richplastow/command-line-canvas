/**
 * @fileoverview
 * Miscellaneous small utilities for signed distance functions.
 */

/**
 * #### Distance from a point to a line segment
 * - Returns the shortest Euclidean distance from point (px,py) to the
 *   segment defined by (ax,ay)-(bx,by).
 * @param {number} px
 * @param {number} py
 * @param {number} ax
 * @param {number} ay
 * @param {number} bx
 * @param {number} by
 * @returns {number}
 */
export const segmentDistance = (px, py, ax, ay, bx, by) => {
    const vx = bx - ax;
    const vy = by - ay;
    const wx = px - ax;
    const wy = py - ay;
    const denom = vx * vx + vy * vy;
    const t = denom === 0
        ? 0
        : Math.max(0, Math.min(1, (wx * vx + wy * vy) / denom));
    const dx = ax + vx * t - px;
    const dy = ay + vy * t - py;
    return Math.hypot(dx, dy);
};
