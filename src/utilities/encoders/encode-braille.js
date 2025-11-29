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

/** #### Encodes a pixel buffer into Unicode Braille characters
 * - Each character represents a vertical pair of pixels
 * @param {Bounds} bounds The pixel bounds to encode within
 * @param {number} canvasWidth The width of the canvas in pixels
 * @param {'256color'|'8color'|'monochrome'|'truecolor'} colorDepth Desired colour depth
 * @param {Uint8ClampedArray} pixels Pixel buffer to encode
 * @param {string} [xpx='encodeBraille():'] Exception prefix, e.g. 'fn():'
 * @param {boolean} [skipValidation=false]
 *     If true, skips validation when inputs already verified
 * @returns {string} Unicode string composed of Braille characters
 */
export const encodeBraille = (
    bounds,
    canvasWidth,
    colorDepth,
    pixels,
    xpx = 'encodeBraille():',
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

    if (colorDepth !== '8color' && colorDepth !== 'monochrome') throw RangeError(
        `${xpx} colorDepth '${colorDepth}' not supported for Braille`);

    const lines = [];
    for (let y = bounds.yMin; y < bounds.yMax; y += 2) {
        const chars = [];
        for (let x = bounds.xMin; x < bounds.xMax; x++) {
            const iUpper = (y * canvasWidth + x) * 4;
            const iLower = ((y + 1) * canvasWidth + x) * 4;
            chars.push(toBrailleChar(
                pixels[iUpper], pixels[iUpper + 1], pixels[iUpper + 2], pixels[iUpper + 3],
                pixels[iLower], pixels[iLower + 1], pixels[iLower + 2], pixels[iLower + 3]
            ));
        }
        lines.push(chars.join(''));
    }

    return lines.join('\n');
};

/** #### Converts a pair of pixels into a Braille character code point
 * @param {number} ur Upper red
 * @param {number} ug Upper green
 * @param {number} ub Upper blue
 * @param {number} ua Upper alpha
 * @param {number} lr Lower red
 * @param {number} lg Lower green
 * @param {number} lb Lower blue
 * @param {number} la Lower alpha
 * @returns {string} Single Braille character covering both pixels
 */
function toBrailleChar(ur, ug, ub, ua, lr, lg, lb, la) {
    let mask = 0;
    if (ur > CHANNEL_THRESHOLD) mask |= DOT_UPPER_RED;
    if (ug > CHANNEL_THRESHOLD) mask |= DOT_UPPER_GREEN;
    if (ub > CHANNEL_THRESHOLD) mask |= DOT_UPPER_BLUE;
    if (ua > CHANNEL_THRESHOLD) mask |= DOT_UPPER_ALPHA;
    if (lr > CHANNEL_THRESHOLD) mask |= DOT_LOWER_RED;
    if (lg > CHANNEL_THRESHOLD) mask |= DOT_LOWER_GREEN;
    if (lb > CHANNEL_THRESHOLD) mask |= DOT_LOWER_BLUE;
    if (la > CHANNEL_THRESHOLD) mask |= DOT_LOWER_ALPHA;
    return String.fromCodePoint(BRAILLE_BASE + mask);
}


