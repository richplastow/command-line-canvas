/**
 * @typedef {import('../../clc-types.js').Bounds} Bounds
 * @typedef {import('../../models/color/color.js').Color} Color
 */

import {
    validateBounds,
    validateColorDepth,
    validatePixels,
} from '../../models/canvas/canvas-validators.js';

const BRAILLE_BASE = 0x2800;
const CHANNEL_THRESHOLD = 127;
const DOT_LOWER_ALPHA = 0x80;
const DOT_LOWER_BLUE = 0x40;
const DOT_LOWER_GREEN = 0x20;
const DOT_LOWER_RED = 0x04;
const DOT_UPPER_ALPHA = 0x10;
const DOT_UPPER_BLUE = 0x02;
const DOT_UPPER_GREEN = 0x08;
const DOT_UPPER_RED = 0x01;

/** #### Encodes a 2D array of pixels into Unicode Braille characters
 * - Each character represents a vertical pair of pixels
 * @param {Bounds} bounds The pixel bounds to encode within
 * @param {'256color'|'8color'|'monochrome'|'truecolor'} colorDepth Desired colour depth
 * @param {Color[][]} pixels 2D array of pixels to encode
 * @param {string} [xpx='encodeBraille():'] Exception prefix, e.g. 'fn():'
 * @param {boolean} [skipValidation=false]
 *     If true, skips validation when inputs already verified
 * @returns {string} Unicode string composed of Braille characters
 */
export const encodeBraille = (
    bounds,
    colorDepth,
    pixels,
    xpx = 'encodeBraille():',
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

    if (colorDepth !== '8color' && colorDepth !== 'monochrome') throw RangeError(
        `${xpx} colorDepth '${colorDepth}' not supported for Braille`);

    const lines = [];
    for (let y = bounds.yMin; y < bounds.yMax; y += 2) {
        const upperRow = pixels[y];
        const lowerRow = pixels[y + 1];
        if (!upperRow) throw Error(
            `${xpx} missing upper pixel row at y=${y}`);
        if (!lowerRow) throw Error(
            `${xpx} missing lower pixel row at y=${y + 1}`);
        const chars = [];
        for (let x = bounds.xMin; x < bounds.xMax; x++) {
            chars.push(toBrailleChar(upperRow[x], lowerRow[x]));
        }
        lines.push(chars.join(''));
    }

    return lines.join('\n');
};

/** #### Converts a pair of pixels into a Braille character code point
 * @param {Color} upperPixel The pixel rendered in the upper half
 * @param {Color} lowerPixel The pixel rendered in the lower half
 * @returns {string} Single Braille character covering both pixels
 */
function toBrailleChar(upperPixel, lowerPixel) {
    let mask = 0;
    if (upperPixel.r > CHANNEL_THRESHOLD) mask |= DOT_UPPER_RED;
    if (upperPixel.g > CHANNEL_THRESHOLD) mask |= DOT_UPPER_GREEN;
    if (upperPixel.b > CHANNEL_THRESHOLD) mask |= DOT_UPPER_BLUE;
    if (hasAlphaCoverage(upperPixel)) mask |= DOT_UPPER_ALPHA;
    if (lowerPixel.r > CHANNEL_THRESHOLD) mask |= DOT_LOWER_RED;
    if (lowerPixel.g > CHANNEL_THRESHOLD) mask |= DOT_LOWER_GREEN;
    if (lowerPixel.b > CHANNEL_THRESHOLD) mask |= DOT_LOWER_BLUE;
    if (hasAlphaCoverage(lowerPixel)) mask |= DOT_LOWER_ALPHA;
    return String.fromCodePoint(BRAILLE_BASE + mask);
}

/** #### Retrieves a pixel alpha channel as 0-255
 * - Accepts 0-1 or 0-255 alpha if present
 * @param {Color} pixel The pixel to inspect
 * @returns {number} Alpha expressed 0-255
 */
function getAlphaByte(pixel) {
    if (!pixel) return 255;
    const withAlpha = /** @type {any} */ (pixel);
    if (typeof withAlpha.a !== 'number') return 255;
    const alpha = withAlpha.a;
    return alpha <= 1 ? alpha * 255 : alpha;
}

/** #### Determines whether a pixel should set its alpha dot
 * @param {Color} pixel The pixel to inspect
 * @returns {boolean} True if alpha exceeds the threshold
 */
function hasAlphaCoverage(pixel) {
    return getAlphaByte(pixel) > CHANNEL_THRESHOLD;
}
