/**
 * @typedef {import('../../clc-types.js').Bounds} Bounds
 * @typedef {import('../../models/color/color.js').Color} Color
 */

import {
    validateBounds,
    validateColorDepth,
    validatePixels,
} from '../../models/canvas/canvas-validators.js';

/** #### Renders a pixel buffer to an HTML string
 * - Note that only the `min` bounds are inclusive, so `xMax` and `yMax` are
 *   not encoded. If the `pixels` array has dimensions 3x2, `bounds` should be
 *   `{ xMin: 0, xMax: 3, yMin: 0, yMax: 2 }` to encode the whole canvas.
 * @param {Bounds} bounds The pixel bounds to encode within
 * @param {number} canvasWidth The width of the canvas in pixels
 * @param {'256color'|'8color'|'monochrome'|'truecolor'} colorDepth The color depth to encode at
 * @param {Uint8ClampedArray} pixels Pixel buffer to encode
 * @param {string} [xpx='encodeHtml():'] Exception prefix, e.g. 'fn():'
 * @param {boolean} [skipValidation=false]
 *     If true, skips validation - useful for tight loops, where args are known to be good
 */
export const encodeHtml = (
    bounds,
    canvasWidth,
    colorDepth,
    pixels,
    xpx = 'encodeHtml():',
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

    // If monochrome, the pixels will be encoded with Unicode 'Block Elements'
    // characters (plus space), and no HTML markup - handy for unit tests.
    //
    // Otherwise, pixels are encoded using the Unicode U+2584 'Lower Half Block'
    // character. This is styled using inline CSS to set the background (upper)
    // and foreground (lower) colours.
    let lineReset;
    let colorGetter;
    switch (colorDepth) {
        case '256color':
            lineReset = '';
            colorGetter = getHtml256Color;
            break;
        case '8color':
            lineReset = '';
            colorGetter = getHtml8Color;
            break;
        case 'monochrome':
            colorGetter = getMonochrome;
            lineReset = '';
            break;
        case 'truecolor':
            lineReset = '';
            colorGetter = getHtmlTruecolor;
            break;
        default:
            throw Error( // reachable if validation skipped
                `${xpx} cannot skip invalid colorDepth`);
    }

    // Each character cell represents two pixels: an upper and a lower half.
    const charCanvas = [];
    for (let y = bounds.yMin; y < bounds.yMax; y += 2) {
        const row = [];
        for (let x = bounds.xMin; x < bounds.xMax; x++) {
            const iUpper = (y * canvasWidth + x) * 4;
            const iLower = ((y + 1) * canvasWidth + x) * 4;
            const char = colorGetter(
                pixels[iUpper], pixels[iUpper + 1], pixels[iUpper + 2],
                pixels[iLower], pixels[iLower + 1], pixels[iLower + 2]
            );
            row.push(char);
        }
        charCanvas.push(row.join('') + lineReset);
    }
    return charCanvas.join('\n');
};

/** #### Gets the HTML markup for a pair of pixels in 256-colour mode
 * @param {number} ur Upper red
 * @param {number} ug Upper green
 * @param {number} ub Upper blue
 * @param {number} lr Lower red
 * @param {number} lg Lower green
 * @param {number} lb Lower blue
 * @returns {string} The Unicode 'Lower Half Block' character, wrapped in HTML
 */
function getHtml256Color(ur, ug, ub, lr, lg, lb) {
    const upperIndex = 16
        + (36 * Math.round(ur / 51))
        + (6 * Math.round(ug / 51))
        + Math.round(ub / 51);
    const lowerIndex = 16
        + (36 * Math.round(lr / 51))
        + (6 * Math.round(lg / 51))
        + Math.round(lb / 51);
    
    // Convert 256-color indices back to RGB for inline styles.
    const upperRGB = index256ToRGB(upperIndex);
    const lowerRGB = index256ToRGB(lowerIndex);
    
    return `<b style="background:rgb(${upperRGB.r},${upperRGB.g},${upperRGB.b});`
        + `color:rgb(${lowerRGB.r},${lowerRGB.g},${lowerRGB.b})">▄</b>`;
}

/** #### Gets the HTML markup for a pair of pixels in 8-colour mode
 * @param {number} ur Upper red
 * @param {number} ug Upper green
 * @param {number} ub Upper blue
 * @param {number} lr Lower red
 * @param {number} lg Lower green
 * @param {number} lb Lower blue
 * @returns {string} The Unicode 'Lower Half Block' character, wrapped in HTML
 */
function getHtml8Color(ur, ug, ub, lr, lg, lb) {
    const ur8 = ur >= 128 ? 255 : 0;
    const ug8 = ug >= 128 ? 255 : 0;
    const ub8 = ub >= 128 ? 255 : 0;
    const lr8 = lr >= 128 ? 255 : 0;
    const lg8 = lg >= 128 ? 255 : 0;
    const lb8 = lb >= 128 ? 255 : 0;
    return `<b style="background:rgb(${ur8},${ug8},${ub8});`
        + `color:rgb(${lr8},${lg8},${lb8})">▄</b>`;
}

/** #### Gets the Unicode 'Block Elements' character for rendering in monochrome
 * @param {number} ur Upper red
 * @param {number} ug Upper green
 * @param {number} ub Upper blue
 * @param {number} lr Lower red
 * @param {number} lg Lower green
 * @param {number} lb Lower blue
 * @returns {string} The Unicode 'Block Elements' character, or space
 */
function getMonochrome(ur, ug, ub, lr, lg, lb) {
    // Use an integer-only luminance approximation to be fast and portable to
    // environments like Rust or WGSL. Coefficients sum to 256 so we can shift
    // by 8 instead of dividing: (54*R + 183*G + 19*B) >> 8
    const lumUpper = (54 * ur + 183 * ug + 19 * ub) >> 8;
    const lumLower = (54 * lr + 183 * lg + 19 * lb) >> 8;
    return lumUpper > 128
        ? lumLower > 128
            ? '\u2588' // Full block
            : '\u2580' // Upper half block
    : lumLower > 128
            ? '\u2584' // Lower half block
            : ' ' // space - a refinement would be to use U+3000 (IDEOGRAPHIC SPACE), maybe even followed by U+2060 (WORD JOINER)
    ;
}

/** #### Gets the HTML markup for a pair of pixels in Truecolor
 * @param {number} ur Upper red
 * @param {number} ug Upper green
 * @param {number} ub Upper blue
 * @param {number} lr Lower red
 * @param {number} lg Lower green
 * @param {number} lb Lower blue
 * @returns {string} The Unicode 'Lower Half Block' character, wrapped in HTML
 */
function getHtmlTruecolor(ur, ug, ub, lr, lg, lb) {
    return `<b style="background:rgb(${ur},${ug},${ub});`
        + `color:rgb(${lr},${lg},${lb})">▄</b>`;
}

/** #### Converts a 256-color palette index to RGB values
 * @param {number} index The 256-color palette index (0-255)
 * @returns {{r: number, g: number, b: number}} RGB values (0-255)
 */
function index256ToRGB(index) {
    // Standard 256-color palette mapping.
    // 0-15: system colors (approximate as grayscale for simplicity here).
    if (index < 16) {
        const gray = Math.round(index * 255 / 15);
        return { r: gray, g: gray, b: gray };
    }
    // 16-231: 6x6x6 RGB cube using the actual ANSI color values.
    if (index < 232) {
        const i = index - 16;
        const r = Math.floor(i / 36);
        const g = Math.floor(i / 6) % 6;
        const b = i % 6;
        // The 6x6x6 cube uses these specific values, not a linear progression
        const levels = [0, 95, 135, 175, 215, 255];
        return { 
            r: levels[r], 
            g: levels[g], 
            b: levels[b] 
        };
    }
    // 232-255: grayscale ramp.
    const gray = 8 + (index - 232) * 10;
    return { r: gray, g: gray, b: gray };
}
