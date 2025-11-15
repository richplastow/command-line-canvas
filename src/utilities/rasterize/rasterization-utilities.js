/**
 * @fileoverview
 * Miscellaneous small utilities for rasterization.
 */

/** #### Modifies the 'top' colour-channel of a pair of colour-channels
 * - The result depends on the given blend-mode.
 * @param {'multiply'|'screen'|'overlay'|'normal'} mode How to blend the colours.
 * @param {number} overlay Top/source channel value in range 0..1.
 * @param {number} under Bottom/destination channel value in range 0..1.
 * @returns {number} Resulting channel value (clamped 0..1).
 */
export const blendChannel = (mode, overlay, under) => {
    switch (mode) {
        case 'multiply':
            return clamp01(overlay * under);
        case 'screen':
            return clamp01(1 - ((1 - clamp01(overlay)) * (1 - clamp01(under))));
        case 'overlay': {
            const under01 = clamp01(under);
            const overlay01 = clamp01(overlay);
            return under01 <= 0.5
                ? clamp01(2 * under01 * overlay01)
                : clamp01(1 - (2 * (1 - under01) * (1 - overlay01)));
        }
        case 'normal':
        default:
            return clamp01(overlay);
    }
};

/** #### Clamps a number to the 0..1 range.
 * @param {number} value Input value.
 * @returns {number} Clamped value between 0 and 1.
 */
export const clamp01 = (value) => {
    if (value <= 0) return 0;
    if (value >= 1) return 1;
    return value;
};

/** #### Converts a 0..1 float to a byte (0..255 integer).
 * @param {number} value Input value between 0 and 1.
 * @returns {number} Value between 0 and 255.
 */
export const toByte = (value) =>
    Math.round(clamp01(value) * 255);
