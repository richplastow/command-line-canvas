/**
 * @typedef {import('../../clc-types.js').Bounds} Bounds
 * @typedef {import('../../models/color/color.js').Color} Color
 */

import {
    validateBounds,
    validateColorDepth,
    validatePixels,
} from '../../models/canvas/canvas-validators.js';

/** #### Encodes a pixel buffer to a flat Uint8Array buffer
 * - Each pixel becomes four consecutive bytes: R, G, B, A (0-255)
 * - The buffer contains rows within `bounds` in row-major order.
 * @param {Bounds} bounds The pixel bounds to encode within
 * @param {number} canvasWidth The width of the canvas in pixels
 * @param {'256color'|'8color'|'monochrome'|'truecolor'} colorDepth The color depth (kept for API parity)
 * @param {Uint8ClampedArray} pixels Pixel buffer to encode
 * @param {string} [xpx='encodeBuffer():'] Exception prefix, e.g. 'fn():'
 * @param {boolean} [skipValidation=false]
 *     If true, skips validation - useful for tight loops, where args are known to be good
 * @returns {Uint8Array} Flat RGBA buffer (width * height * 4 bytes)
 */
export const encodeBuffer = (
    bounds,
    canvasWidth,
    colorDepth,
    pixels,
    xpx = 'encodeBuffer():',
    skipValidation = false
) => {
    if (!skipValidation) {
        validateBounds(bounds, `${xpx} bounds`);
        validateColorDepth(colorDepth, `${xpx} colorDepth`);
        validatePixels(pixels, `${xpx} pixels`);
        const extentX = canvasWidth;
        const extentY = pixels.length / (canvasWidth * 4);
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
            throw Error( // reachable if validation skipped
                `${xpx} cannot skip invalid colorDepth`);
    }

    const xMin = Math.floor(bounds.xMin);
    const xMax = Math.ceil(bounds.xMax);
    const yMin = Math.floor(bounds.yMin);
    const yMax = Math.ceil(bounds.yMax);

    const width = xMax - xMin;
    const height = yMax - yMin;
    const buffer = new Uint8Array(width * height * 4);

    for (let y = 0; y < height; y++) {
        const srcY = yMin + y;
        const srcStart = (srcY * canvasWidth + xMin) * 4;
        const srcEnd = srcStart + width * 4;
        const dstStart = y * width * 4;

        // Copy row.
        buffer.set(pixels.subarray(srcStart, srcEnd), dstStart);
    }

    return buffer;
};

