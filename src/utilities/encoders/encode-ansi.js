/**
 * @typedef {import('../../clc-types.js').Bounds} Bounds
 * @typedef {import('../../models/pixel/pixel.js').Pixel} Pixel
 */

import {
    validateBounds,
    validateColorDepth,
    validatePixels,
} from '../../models/canvas/canvas-validators.js';

/** #### Renders a 2D array of pixels to an ANSI string
 * - Note that only the `min` bounds are inclusive, so `xMax` and `yMax` are
 *   not encoded. If the `pixels` array has dimensions 3x2, `bounds` should be
 *   `{ xMin: 0, xMax: 3, yMin: 0, yMax: 2 }` to encode the whole canvas.
 * @param {Bounds} bounds The pixel bounds to encode within
 * @param {'monochrome'|'256color'|'truecolor'} colorDepth The color depth to encode at
 * @param {Pixel[][]} pixels 2D array of pixels to encode
 * @param {string} [xpx='encodeAnsi():'] Exception prefix, e.g. 'fn():'
 * @param {boolean} [skipValidation=false]
 *     If true, skips validation - useful for tight loops, where args are known to be good
 */
export const encodeAnsi = (
    bounds,
    colorDepth,
    pixels,
    xpx = 'encodeAnsi():',
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

    // If monochrome, the pixels will be encoded with Unicode 'Block Elements'
    // characters (plus space), and no ANSI escape codes - handy for unit tests.
    //
    // Otherwise, pixels are encoded using the Unicode U+2584 'Lower Half Block'
    // character. This is coloured using ANSI escape codes to set the background
    // (upper) and foreground (lower) colours.
    let lineReset;
    let colorGetter;
    switch (colorDepth) {
        case 'monochrome':
            colorGetter = getMonochrome;
            lineReset = '';
            break;
        case '256color':
            lineReset = '\u001b[0m'; // reset ANSI color at end of each line
            colorGetter = getAnsi256Color;
            break;
        case 'truecolor':
            lineReset = '\u001b[0m';
            colorGetter = getAnsiTruecolor;
            break;
        default:
            throw Error( // reachable if validation skipped
                `${xpx} cannot skip invalid colorDepth`);
    }

    // Each character cell represents two pixels: an upper and a lower half.
    const charCanvas = [];
    for (let y = bounds.yMin; y < bounds.yMax; y += 2) {
        const row = [];
        const upperPixelRow = pixels[y];
        const lowerPixelRow = pixels[y + 1];
        if (!upperPixelRow) throw Error(
            `${xpx} missing upper pixel row at y=${y}`);
        if (!lowerPixelRow) throw Error(
            `${xpx} missing lower pixel row at y=${y + 1}`);
        for (let x = bounds.xMin; x < bounds.xMax; x++) {
            const upper = upperPixelRow[x];
            const lower = lowerPixelRow[x];
            const char = colorGetter(upper, lower);
            row.push(char);
        }
        charCanvas.push(row.join('') + lineReset);
    }
    return charCanvas.join('\n');
};

/** #### Gets the ANSI escape code for a pair of pixels in 256-colour mode
 * @param {Pixel} upper The upper half color
 * @param {Pixel} lower The lower half color
 * @returns {string} The Unicode 'Lower Half Block' character, preceded by ANSI escape codes
 */
function getAnsi256Color(upper, lower) {
    const upperIndex = 16
        + (36 * Math.round(upper.r / 51))
        + (6 * Math.round(upper.g / 51))
        + Math.round(upper.b / 51);
    const lowerIndex = 16
        + (36 * Math.round(lower.r / 51))
        + (6 * Math.round(lower.g / 51))
        + Math.round(lower.b / 51);
    return `\u001b[48;5;${upperIndex}m` // "48" for background, "5" for 256-colour
        + `\u001b[38;5;${lowerIndex}m`
        + '\u2584';
}

/** #### Gets the ANSI escape code for a pair of pixels in Truecolor
 * @param {Pixel} upper The upper half color
 * @param {Pixel} lower The lower half color
 * @returns {string} The Unicode 'Lower Half Block' character, preceded by ANSI escape codes
 */
function getAnsiTruecolor(upper, lower) {
    return `\u001b[48;2;${upper.r};${upper.g};${upper.b}m`
        + `\u001b[38;2;${lower.r};${lower.g};${lower.b}m`
        + '\u2584';
}

/** #### Gets the Unicode 'Block Elements' character for rendering in monochrome
 * @param {Pixel} upper The upper half color
 * @param {Pixel} lower The lower half color
 * @returns {string} The Unicode 'Block Elements' character, or space
 */
function getMonochrome(upper, lower) {
    // Use an integer-only luminance approximation to be fast and portable to
    // environments like Rust or WGSL. Coefficients sum to 256 so we can shift
    // by 8 instead of dividing: (54*R + 183*G + 19*B) >> 8
    const lumUpper = (54 * upper.r + 183 * upper.g + 19 * upper.b) >> 8;
    const lumLower = (54 * lower.r + 183 * lower.g + 19 * lower.b) >> 8;
    return lumUpper > 128
        ? lumLower > 128
            ? '\u2588' // Full block
            : '\u2580' // Upper half block
    : lumLower > 128
            ? '\u2584' // Lower half block
            : ' ' // space - a refinement would be to use U+3000 (IDEOGRAPHIC SPACE), maybe even followed by U+2060 (WORD JOINER)
    ;
}
