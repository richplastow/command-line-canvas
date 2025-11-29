/**
 * @typedef {import('../../clc-types.js').Bounds} Bounds
 * @typedef {import('../../models/color/color.js').Color} Color
 */

import {
    validateBounds,
    validateColorDepth,
    validatePixels,
} from '../../models/canvas/canvas-validators.js';

/** #### Encodes a 2D array of pixels to a flat Uint8Array buffer
 * - Each pixel becomes four consecutive bytes: R, G, B, A (0-255)
 * - The buffer contains rows within `bounds` in row-major order.
 * @param {Bounds} bounds The pixel bounds to encode within
 * @param {'256color'|'8color'|'monochrome'|'truecolor'} colorDepth The color depth (kept for API parity)
 * @param {Color[][]} pixels 2D array of pixels to encode
 * @param {string} [xpx='encodeBuffer():'] Exception prefix, e.g. 'fn():'
 * @param {boolean} [skipValidation=false]
 *     If true, skips validation - useful for tight loops, where args are known to be good
 * @returns {Uint8Array} Flat RGBA buffer (width * height * 4 bytes)
 */
export const encodeBuffer = (
    bounds,
    colorDepth,
    pixels,
    xpx = 'encodeBuffer():',
    skipValidation = false
) => {
    if (!skipValidation) {
        validateBounds(bounds, `${xpx} bounds`);
        validateColorDepth(colorDepth, `${xpx} colorDepth`);
        validatePixels(pixels, `${xpx} pixels`);
        const extentX = pixels[0].length;
        const extentY = pixels.length;
        if (bounds.xMin > extentX - 1) throw RangeError(
            `${xpx} bounds.xMin ${bounds.xMin} exceeds pixels extentX ${extentX}`);
        if (bounds.xMax > extentX) throw RangeError(
            `${xpx} bounds.xMax ${bounds.xMax} exceeds pixels extentX ${extentX}`);
        if (bounds.yMin > extentY - 1) throw RangeError(
            `${xpx} bounds.yMin ${bounds.yMin} exceeds pixels extentY ${extentY}`);
        if (bounds.yMax > extentY) throw RangeError(
            `${xpx} bounds.yMax ${bounds.yMax} exceeds pixels extentY ${extentY}`);
    }

    // If validation was skipped we still need to ensure the colorDepth string
    // is one of the supported values. This mirrors the behavior of the other
    // encoders where callers may skip full validation but an invalid
    // colorDepth should still produce a clear error.
    switch (colorDepth) {
        case '256color':
        case '8color':
        case 'monochrome':
        case 'truecolor':
            break;
        default:
            throw Error(`${xpx} cannot skip invalid colorDepth`);
    }

    // Use integer pixel coordinates for allocation and iteration. If callers
    // passed non-integer bounds but requested skipValidation, follow the same
    // semantics as the other encoders: treat min as floor and max as ceil so
    // the iteration covers the same integer pixel indices the for-loops will
    // visit.
    const xMinInt = Math.floor(bounds.xMin);
    const xMaxInt = Math.ceil(bounds.xMax);
    const yMinInt = Math.floor(bounds.yMin);
    const yMaxInt = Math.ceil(bounds.yMax);

    const width = xMaxInt - xMinInt;
    const height = yMaxInt - yMinInt;
    const out = new Uint8Array(width * height * 4);

    let di = 0;
    for (let y = yMinInt; y < yMaxInt; y++) {
        const row = pixels[y];
        for (let x = xMinInt; x < xMaxInt; x++) {
            const p = row[x];
            out[di++] = p.r;
            out[di++] = p.g;
            out[di++] = p.b;
            out[di++] = 255; // TODO support transparent backgrounds
        }
    }

    return out;
};
