/** @fileoverview constant values used throughout command-line-canvas */


/** #### The canvas's shorter side, when measured in world units
 *
 * The fixed virtual size of the smaller canvas dimension in world units.
 *
 * The renderer maps the smaller side of the pixel grid to, for example, 10.0
 * world units, so shape maths can run in a resolution‑independent 'world' space.
 *
 * - 10.0 makes coordinates and SDF sizes intuitive and stable across different
 *   pixel resolutions.
 * 
 * Effect of changing 10.0:
 * - Larger value → more world units per pixel → shapes render larger on screen.
 * - Smaller value → everything shrinks in pixels.
 * - Changing this value is equivalent to zooming in/out on the canvas.
 * 
 * Example: for 80×24 canvas:
 * - min = 24 → worldUnitsPerPixel = 10 / 24 ≈ 0.4167
 * - aspectRatio = 80/24 ≈ 3.33 → xExtentWorld = 33.33, yExtentWorld = 10.0
 *
 * Why "10.0" not "10"?
 * - Using a float makes it explicit that world units are floating-point.
 * - Improves readability and intent for future maintainers.
 *
 * @type {number}
 */
const SIDE_IN_WORLD_UNITS = 10.0;

/** #### Checks that a pixel channel is a number between 0 and 255 inclusive
 * - Note that channel values do not have to be integers
 * @param {number} channel The channel value to check
 * @param {string} [xpx='channel'] Exception prefix, e.g. 'Pixel: r (red)'
 */
const validateChannel = (channel, xpx = 'channel') => {
    if (typeof channel !== 'number') throw TypeError(
        `${xpx} type is '${typeof channel}' not 'number'`);
    if (Number.isNaN(channel)) throw RangeError(
        `${xpx} ${channel} is not a valid number`);
    if (channel < 0) throw RangeError(
        `${xpx} ${channel} is less than 0`);
    if (channel > 255) throw RangeError(
        `${xpx} ${channel} is greater than 255`);
};

/** #### Checks that a Pixel instance is valid
 * @param {Pixel} pixel The Pixel instance to check
 * @param {string} [xpx='pixel'] Exception prefix, e.g. 'Canvas: background'
 */
const validatePixel = (pixel, xpx = 'pixel') => {
    if (pixel === null) throw TypeError(
        `${xpx} is null, not an object`);
    if (Array.isArray(pixel)) throw TypeError(
        `${xpx} is an array, not an object`);
    if (typeof pixel !== 'object') throw TypeError(
        `${xpx} is type '${typeof pixel}' not 'object'`);
    if (!(pixel instanceof Pixel)) {
        /** @type {{}} **/ const notPixel = pixel;
        const notPixelName = notPixel.constructor.name;
        throw TypeError(
            `${xpx} is an instance of '${notPixelName}' not 'Pixel'`);
    }
};

/** #### A pixel in an ANSI canvas */
class Pixel {
    /** #### Red value (0-255)
     * @type {number} */
    r = 0;

    /** #### Green value (0-255)
     * @type {number} */
    g = 0;

    /** #### Blue value (0-255)
     * @type {number} */
    b = 0;

    /**
     * @param {number} r The red value (0-255)
     * @param {number} g The green value (0-255)
     * @param {number} b The blue value (0-255)
     */
    constructor(r, g, b) {
        validateChannel(r, 'Pixel: r (red)');
        validateChannel(g, 'Pixel: g (green)');
        validateChannel(b, 'Pixel: b (blue)');

        this.r = r;
        this.g = g;
        this.b = b;
    }
}

/**
 * @typedef {import('../../clc-types.js').Bounds} Bounds
 */

/** #### Checks that a 'bounds' object is valid
 * @param {Bounds} bounds The bounds object to check
 * @param {string} [xpx='bounds'] Exception prefix, e.g. 'canvas.render(): bounds'
 */
const validateBounds = (bounds, xpx = 'bounds') => {
    if (bounds === null) throw TypeError(
        `${xpx} is null, not an object`);
    if (Array.isArray(bounds)) throw TypeError(
        `${xpx} is an array, not an object`);
    if (typeof bounds !== 'object') throw TypeError(
        `${xpx} is type '${typeof bounds}' not 'object'`);
    const requiredProps = ['xMin', 'xMax', 'yMin', 'yMax'];
    for (const prop of requiredProps) {
        if (typeof bounds[prop] !== 'number') throw TypeError(
            `${xpx}.${prop} is type '${typeof bounds[prop]}' not 'number'`);
        if (!Number.isInteger(bounds[prop])) throw RangeError(
            `${xpx}.${prop} ${bounds[prop]} is not an integer`);
    }
    const { xMin, xMax, yMin, yMax } = bounds;
    if (xMin < 0) throw RangeError(
        `${xpx}.xMin ${xMin} is less than 0`);
    if (xMax <= xMin) throw RangeError(
        `${xpx}.xMax ${xMax} is less than or equal to xMin ${xMin}`);
    if (yMin < 0) throw RangeError(
        `${xpx}.yMin ${yMin} is less than 0`);
    if (yMax <= yMin) throw RangeError(
        `${xpx}.yMax ${yMax} is less than or equal to yMin ${yMin}`);
    if ((yMax - yMin) % 2 !== 0) throw RangeError(
        `${xpx} height ${yMax - yMin} is not even`);
};

/** #### Checks that the width of height of a canvas is an integer from 1 to 256 inclusive
 * @param {number} extent The canvas extent (width or height) to check
 * @param {string} [xpx='extent'] Exception prefix, e.g. 'Canvas: xExtent'
 */
const validateCanvasExtent = (extent, xpx = 'extent') => {
    if (typeof extent !== 'number') throw TypeError(
        `${xpx} type is '${typeof extent}' not 'number'`);
    if (!Number.isInteger(extent)) throw RangeError(
        `${xpx} ${extent} is not an integer`);
    if (extent < 1) throw RangeError(
        `${xpx} ${extent} is less than 1`);
    if (extent > 3840) throw RangeError(
        `${xpx} ${extent} is greater than 3840`);
};

/** #### Checks that a color depth value is valid
 * @param {'monochrome'|'256color'|'truecolor'} colorDepth The color depth to check
 * @param {string} [xpx='colorDepth'] Exception prefix, e.g. 'canvas.render(): colorDepth'
 */
const validateColorDepth = (colorDepth, xpx = 'colorDepth') => {
    const validDepths = ['monochrome', '256color', 'truecolor'];
    if (typeof colorDepth !== 'string') throw TypeError(
        `${xpx} is type '${typeof colorDepth}' not 'string'`);
    if (!validDepths.includes(colorDepth)) throw RangeError(
        `${xpx} is not one of '${validDepths.join("'|'")}'`);
};

/** #### Checks that an output format is valid
 * @param {'ansi'|'braille'|'buffer'|'html'} outputFormat The output format to check
 * @param {string} [xpx='outputFormat'] Exception prefix, e.g. 'canvas.render(): outputFormat'
 */
const validateOutputFormat = (outputFormat, xpx = 'outputFormat') => {
    const validFormats = ['ansi', 'braille', 'buffer', 'html'];
    if (typeof outputFormat !== 'string') throw TypeError(
        `${xpx} is type '${typeof outputFormat}' not 'string'`);
    if (!validFormats.includes(outputFormat)) throw RangeError(
        `${xpx} is not one of '${validFormats.join("'|'")}'`);
};

/** #### Checks that a 2D array of pixels is valid
 * @param {Pixel[][]} pixels The 2D array of pixels to check
 * @param {string} [xpx='pixels'] Exception prefix, e.g. 'canvas.render(): pixels'
 */
const validatePixels = (pixels, xpx = 'pixels') => {
    // Validate the outer-array.
    if (pixels === null) throw TypeError(
        `${xpx} is null, not an object`);
    if (typeof pixels !== 'object') throw TypeError(
        `${xpx} is type '${typeof pixels}' not 'object'`);
    if (!Array.isArray(pixels)) throw TypeError(
        `${xpx} is not an array`);

    // Validate the inner-arrays.
    let extentX;
    let y;
    for (y = 0; y < pixels.length; y++) {
        const row = pixels[y];
        if (row === null) throw TypeError(
            `${xpx}[${y}] is null, not an object`);
        if (typeof row !== 'object') throw TypeError(
            `${xpx}[${y}] is type '${typeof row}' not 'object'`);
        if (!Array.isArray(row)) throw TypeError(
            `${xpx}[${y}] is not an array`);
        if (y === 0) {
            extentX = row.length; // first row sets the 2D array width
        } else if (row.length !== extentX) {
            throw RangeError(
                `${xpx}[${y}] extentX ${row.length} !== first row ${extentX}`);
        }
        for (let x = 0; x < row.length; x++) {

            // Validate each pixel.
            const pixel = row[x];
            if (!(pixel instanceof Pixel)) {
                if (pixel === null) throw TypeError(
                    `${xpx}[${y}][${x}] is null, not an object`);
                if (Array.isArray(pixel)) throw TypeError(
                    `${xpx}[${y}][${x}] is an array, not an object`);
                if (typeof pixel !== 'object') throw TypeError(
                    `${xpx}[${y}][${x}] is type '${typeof pixel}' not 'object'`);
                /** @type {{}} **/ const notPixel = pixel;
                const notPixelName = notPixel.constructor.name;
                throw TypeError(
                    `${xpx}[${y}][${x}] is an instance of '${notPixelName}' not 'Pixel'`);
            }
        }
    }

    // Validate the width and height.
    const extentY = y;
    if (extentX < 1) throw RangeError(
        `${xpx} extentX is zero`);
    if (extentX > 3840) throw RangeError(
        `${xpx} extentX ${extentX} is greater than 3840`);
    if (extentY < 1) throw RangeError(
        `${xpx} extentY is zero`);
    if (extentY > 3840) throw RangeError(
        `${xpx} extentY ${extentY} is greater than 3840`);
};

/**
 * @typedef {import('../../clc-types.js').Bounds} Bounds
 * @typedef {import('../../models/pixel/pixel.js').Pixel} Pixel
 */


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
const encodeAnsi = (
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
            colorGetter = getMonochrome$1;
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
function getMonochrome$1(upper, lower) {
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

/**
 * @typedef {import('../../clc-types.js').Bounds} Bounds
 * @typedef {import('../../models/pixel/pixel.js').Pixel} Pixel
 */


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
 * @param {'monochrome'|'256color'|'truecolor'} colorDepth Desired colour depth
 * @param {Pixel[][]} pixels 2D array of pixels to encode
 * @param {string} [xpx='encodeBraille():'] Exception prefix, e.g. 'fn():'
 * @param {boolean} [skipValidation=false]
 *     If true, skips validation when inputs already verified
 * @returns {string} Unicode string composed of Braille characters
 */
const encodeBraille = (
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

    if (colorDepth !== 'monochrome') throw RangeError(
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
 * @param {Pixel} upperPixel The pixel rendered in the upper half
 * @param {Pixel} lowerPixel The pixel rendered in the lower half
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
 * @param {Pixel} pixel The pixel to inspect
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
 * @param {Pixel} pixel The pixel to inspect
 * @returns {boolean} True if alpha exceeds the threshold
 */
function hasAlphaCoverage(pixel) {
    return getAlphaByte(pixel) > CHANNEL_THRESHOLD;
}

/**
 * @typedef {import('../../clc-types.js').Bounds} Bounds
 * @typedef {import('../../models/pixel/pixel.js').Pixel} Pixel
 */


/** #### Encodes a 2D array of pixels to a flat Uint8Array buffer
 * - Each pixel becomes four consecutive bytes: R, G, B, A (0-255)
 * - The buffer contains rows within `bounds` in row-major order.
 * @param {Bounds} bounds The pixel bounds to encode within
 * @param {'monochrome'|'256color'|'truecolor'} colorDepth The color depth (kept for API parity)
 * @param {Pixel[][]} pixels 2D array of pixels to encode
 * @param {string} [xpx='encodeBuffer():'] Exception prefix, e.g. 'fn():'
 * @param {boolean} [skipValidation=false]
 *     If true, skips validation - useful for tight loops, where args are known to be good
 * @returns {Uint8Array} Flat RGBA buffer (width * height * 4 bytes)
 */
const encodeBuffer = (
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
        case 'monochrome':
        case '256color':
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

/**
 * @typedef {import('../../clc-types.js').Bounds} Bounds
 * @typedef {import('../../models/pixel/pixel.js').Pixel} Pixel
 */


/** #### Renders a 2D array of pixels to an HTML string
 * - Note that only the `min` bounds are inclusive, so `xMax` and `yMax` are
 *   not encoded. If the `pixels` array has dimensions 3x2, `bounds` should be
 *   `{ xMin: 0, xMax: 3, yMin: 0, yMax: 2 }` to encode the whole canvas.
 * @param {Bounds} bounds The pixel bounds to encode within
 * @param {'monochrome'|'256color'|'truecolor'} colorDepth The color depth to encode at
 * @param {Pixel[][]} pixels 2D array of pixels to encode
 * @param {string} [xpx='encodeHtml():'] Exception prefix, e.g. 'fn():'
 * @param {boolean} [skipValidation=false]
 *     If true, skips validation - useful for tight loops, where args are known to be good
 */
const encodeHtml = (
    bounds,
    colorDepth,
    pixels,
    xpx = 'encodeHtml():',
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
    // characters (plus space), and no HTML markup - handy for unit tests.
    //
    // Otherwise, pixels are encoded using the Unicode U+2584 'Lower Half Block'
    // character. This is styled using inline CSS to set the background (upper)
    // and foreground (lower) colours.
    let lineReset;
    let colorGetter;
    switch (colorDepth) {
        case 'monochrome':
            colorGetter = getMonochrome;
            lineReset = '';
            break;
        case '256color':
            lineReset = '';
            colorGetter = getHtml256Color;
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

/** #### Gets the HTML markup for a pair of pixels in 256-colour mode
 * @param {Pixel} upper The upper half color
 * @param {Pixel} lower The lower half color
 * @returns {string} The Unicode 'Lower Half Block' character, wrapped in HTML
 */
function getHtml256Color(upper, lower) {
    const upperIndex = 16
        + (36 * Math.round(upper.r / 51))
        + (6 * Math.round(upper.g / 51))
        + Math.round(upper.b / 51);
    const lowerIndex = 16
        + (36 * Math.round(lower.r / 51))
        + (6 * Math.round(lower.g / 51))
        + Math.round(lower.b / 51);
    
    // Convert 256-color indices back to RGB for inline styles.
    const upperRGB = index256ToRGB(upperIndex);
    const lowerRGB = index256ToRGB(lowerIndex);
    
    return `<b style="background:rgb(${upperRGB.r},${upperRGB.g},${upperRGB.b});`
        + `color:rgb(${lowerRGB.r},${lowerRGB.g},${lowerRGB.b})">▄</b>`;
}

/** #### Gets the HTML markup for a pair of pixels in Truecolor
 * @param {Pixel} upper The upper half color
 * @param {Pixel} lower The lower half color
 * @returns {string} The Unicode 'Lower Half Block' character, wrapped in HTML
 */
function getHtmlTruecolor(upper, lower) {
    return `<b style="background:rgb(${upper.r},${upper.g},${upper.b});`
        + `color:rgb(${lower.r},${lower.g},${lower.b})">▄</b>`;
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

/** #### Checks that an alpha channel is a number between 0 and 1 inclusive
 * - Note that alpha values do not have to be integers
 * @param {number} alpha The alpha value to check
 * @param {string} [xpx='alpha'] Exception prefix, e.g. 'Color: a (alpha)'
 */
const validateAlpha = (alpha, xpx = 'alpha') => {
    if (typeof alpha !== 'number') throw TypeError(
        `${xpx} type is '${typeof alpha}' not 'number'`);
    if (Number.isNaN(alpha)) throw RangeError(
        `${xpx} ${alpha} is not a valid number`);
    if (alpha < 0) throw RangeError(
        `${xpx} ${alpha} is less than 0`);
    if (alpha > 1) throw RangeError(
        `${xpx} ${alpha} is greater than 1`);
};

/** #### Checks that an RGB channel is a number between 0 and 255 inclusive
 * - Note that RGB values do not have to be integers
 * @param {number} rgb The RGB value to check
 * @param {string} [xpx='rgb'] Exception prefix, e.g. 'Color: r (red)'
 */
const validateRgb = (rgb, xpx = 'rgb') => {
    if (typeof rgb !== 'number') throw TypeError(
        `${xpx} type is '${typeof rgb}' not 'number'`);
    if (Number.isNaN(rgb)) throw RangeError(
        `${xpx} ${rgb} is not a valid number`);
    if (rgb < 0) throw RangeError(
        `${xpx} ${rgb} is less than 0`);
    if (rgb > 255) throw RangeError(
        `${xpx} ${rgb} is greater than 255`);
};

/** #### A color with RGBA values */
class Color {
    /** #### Red value (0-255)
     * @type {number} */
    r = 0;

    /** #### Green value (0-255)
     * @type {number} */
    g = 0;

    /** #### Blue value (0-255)
     * @type {number} */
    b = 0;

    /** #### Alpha value (0-1)
     * @type {number} */
    a = 1;

    /**
     * @param {number} r The red value (0-255)
     * @param {number} g The green value (0-255)
     * @param {number} b The blue value (0-255)
     * @param {number} a The alpha value (0-1)
     */
    constructor(r, g, b, a) {
        validateRgb(r, 'Color: r (red)');
        validateRgb(g, 'Color: g (green)');
        validateRgb(b, 'Color: b (blue)');
        validateAlpha(a, 'Color: a (alpha)');

        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }
}

/** #### Checks that a flip value is valid
 * @TODO move all shared validators to a common location
 * @param {'flip-x'|'flip-x-and-y'|'flip-y'|'no-flip'} flip reflect-mode to check
 * @param {string} [xpx='flip'] Exception prefix
 */
const validateFlip$1 = (flip, xpx = 'flip') => {
    const validFlips = ['flip-x', 'flip-x-and-y', 'flip-y', 'no-flip'];
    if (typeof flip !== 'string') throw TypeError(
        `${xpx} is type '${typeof flip}' not 'string'`);
    if (!validFlips.includes(flip)) throw RangeError(
        `${xpx} is not one of '${validFlips.join("'|'")}'`);
};

/** #### Checks that a joinMode value is valid
 * @param {'union'|'difference'} joinMode The join mode to check
 * @param {string} [xpx='joinMode'] Exception prefix
 */
const validateJoinMode = (joinMode, xpx = 'joinMode') => {
    const validModes = ['union', 'difference'];
    if (typeof joinMode !== 'string') throw TypeError(
        `${xpx} is type '${typeof joinMode}' not 'string'`);
    if (!validModes.includes(joinMode)) throw RangeError(
        `${xpx} is not one of '${validModes.join("'|'")}'`);
};

/** #### Checks that a kind value is valid
 * @param {'circle'|'square'|'triangle-right'} kind The kind to check
 * @param {string} [xpx='kind'] Exception prefix
 */
const validateKind = (kind, xpx = 'kind') => {
    const validKinds = ['circle', 'square', 'triangle-right'];
    if (typeof kind !== 'string') throw TypeError(
        `${xpx} is type '${typeof kind}' not 'string'`);
    if (!validKinds.includes(kind)) throw RangeError(
        `${xpx} is not one of '${validKinds.join("'|'")}'`);
};

/** #### Checks that a rotate value is valid
 * @param {number} rotate The rotation value to check
 * @param {string} [xpx='rotate'] Exception prefix
 */
const validateRotate$1 = (rotate, xpx = 'rotate') => {
    if (typeof rotate !== 'number') throw TypeError(
        `${xpx} type is '${typeof rotate}' not 'number'`);
    if (Number.isNaN(rotate)) throw RangeError(
        `${xpx} ${rotate} is not a valid number`);
};

/** #### Checks that a uniform scale value is valid
 * @param {number} scale The scale factor to check
 * @param {string} [xpx='scale'] Exception prefix
 */
const validateScale$1 = (scale, xpx = 'scale') => {
    if (typeof scale !== 'number') throw TypeError(
        `${xpx} is type '${typeof scale}' not 'number'`);
    if (Number.isNaN(scale)) throw RangeError(
        `${xpx} ${scale} is not a valid number`);
    if (scale < 0) throw RangeError(
        `${xpx} ${scale} is less than 0`);
};

/** #### Checks that a translate object is valid
 * @param {{ x: number, y: number }} translate The translate object to check
 * @param {string} [xpx='translate'] Exception prefix
 */
const validateTranslate$1 = (translate, xpx = 'translate') => {
    if (translate === null) throw TypeError(
        `${xpx} is null, not an object`);
    if (Array.isArray(translate)) throw TypeError(
        `${xpx} is an array, not an object`);
    if (typeof translate !== 'object') throw TypeError(
        `${xpx} is type '${typeof translate}' not 'object'`);
    if (typeof translate.x !== 'number') throw TypeError(
        `${xpx}.x is type '${typeof translate.x}' not 'number'`);
    if (Number.isNaN(translate.x)) throw RangeError(
        `${xpx}.x ${translate.x} is not a valid number`);
    if (typeof translate.y !== 'number') throw TypeError(
        `${xpx}.y is type '${typeof translate.y}' not 'number'`);
    if (Number.isNaN(translate.y)) throw RangeError(
        `${xpx}.y ${translate.y} is not a valid number`);
};

/** #### A primitive shape that can be combined to form complex shapes */
class Primitive {
    /** #### How to reflect this primitive, if at all
     * @type {'flip-x'|'flip-x-and-y'|'flip-y'|'no-flip'} */
    flip = 'no-flip';

    /** #### How this primitive combines with the previous primitive
     * @type {'union'|'difference'} */
    joinMode = 'union';

    /** #### The kind of primitive shape
     * @type {'circle'|'square'|'triangle-right'} */
    kind = 'circle';

    /** #### Rotation in radians
     * @type {number} */
    rotate = 0;

    /** #### Uniform scale factor
     * @type {number} */
    scale = 1;

    /** #### Translation offset for x and y axes
     * @type {{ x: number, y: number }} */
    translate = { x: 0, y: 0 };

    /**
     * @param {'flip-x'|'flip-x-and-y'|'flip-y'|'no-flip'} flip Reflection
     * @param {'union'|'difference'} joinMode How to combine with previous
     * @param {'circle'|'square'|'triangle-right'} kind The primitive shape type
     * @param {number} rotate Rotation in radians
    * @param {number} scale Uniform scale factor
     * @param {{ x: number, y: number }} translate Translation offset
     */
    constructor(flip, joinMode, kind, rotate, scale, translate) {
        validateFlip$1(flip, 'Primitive: flip');
        validateJoinMode(joinMode, 'Primitive: joinMode');
        validateKind(kind, 'Primitive: kind');
        validateRotate$1(rotate, 'Primitive: rotate');
        validateScale$1(scale, 'Primitive: scale');
        validateTranslate$1(translate, 'Primitive: translate');

        this.flip = flip;
        this.joinMode = joinMode;
        this.kind = kind;
        this.rotate = rotate;
        this.scale = scale;
        this.translate = translate;
    }
}

/**
 * @typedef {import('../../clc-types.js').Pattern} Pattern
 */

/** #### Checks that a blendMode value is valid
 * @param {'multiply'|'normal'|'overlay'|'screen'} blendMode The blend mode
 * @param {string} [xpx='blendMode'] Exception prefix
 */
const validateBlendMode = (blendMode, xpx = 'blendMode') => {
    const validModes = ['multiply', 'normal', 'overlay', 'screen'];
    if (typeof blendMode !== 'string') throw TypeError(
        `${xpx} is type '${typeof blendMode}' not 'string'`);
    if (!validModes.includes(blendMode)) throw RangeError(
        `${xpx} is not one of '${validModes.join("'|'")}'`);
};

/** #### Checks that a Color instance is valid
 * @param {Color} color The Color instance to check
 * @param {string} [xpx='color'] Exception prefix
 */
const validateColor = (color, xpx = 'color') => {
    if (color === null) throw TypeError(
        `${xpx} is null, not an object`);
    if (Array.isArray(color)) throw TypeError(
        `${xpx} is an array, not an object`);
    if (typeof color !== 'object') throw TypeError(
        `${xpx} is type '${typeof color}' not 'object'`);
    if (!(color instanceof Color)) {
        /** @type {{}} **/ const notColor = color;
        const notColorName = notColor.constructor.name;
        throw TypeError(
            `${xpx} is an instance of '${notColorName}' not 'Color'`);
    }
};

/** #### Checks that a flip value is valid
 * @TODO move all shared validators to a common location
 * @param {'flip-x'|'flip-x-and-y'|'flip-y'|'no-flip'} flip reflect-mode to check
 * @param {string} [xpx='flip'] Exception prefix
 */
const validateFlip = (flip, xpx = 'flip') => {
    const validFlips = ['flip-x', 'flip-x-and-y', 'flip-y', 'no-flip'];
    if (typeof flip !== 'string') throw TypeError(
        `${xpx} is type '${typeof flip}' not 'string'`);
    if (!validFlips.includes(flip)) throw RangeError(
        `${xpx} is not one of '${validFlips.join("'|'")}'`);
};

/** #### Checks that a pattern value is valid
 * @param {Pattern} pattern The pattern to check
 * @param {string} [xpx='pattern'] Exception prefix
 */
const validatePattern = (pattern, xpx = 'pattern') => {
    const validPatterns = ['all-ink', 'all-paper', 'breton', 'pinstripe'];
    if (typeof pattern !== 'string') throw TypeError(
        `${xpx} is type '${typeof pattern}' not 'string'`);
    if (!validPatterns.includes(pattern)) throw RangeError(
        `${xpx} is not one of '${validPatterns.join("'|'")}'`);
};

/** #### Checks that a patternRatio value is valid
 * @param {number} patternRatio The pattern ratio to check
 * @param {string} [xpx='patternRatio'] Exception prefix
 */
const validatePatternRatio = (patternRatio, xpx = 'patternRatio') => {
    if (typeof patternRatio !== 'number') throw TypeError(
        `${xpx} is type '${typeof patternRatio}' not 'number'`);
    if (Number.isNaN(patternRatio)) throw RangeError(
        `${xpx} ${patternRatio} is not a valid number`);
    if (patternRatio < 0 || patternRatio > 1) throw RangeError(
        `${xpx} ${patternRatio} is not between 0 and 1`);
};

/** #### Checks that a patternScale value is valid
 * @param {number} patternScale The pattern scale to check
 * @param {string} [xpx='patternScale'] Exception prefix
 */
const validatePatternScale = (patternScale, xpx = 'patternScale') => {
    if (typeof patternScale !== 'number') throw TypeError(
        `${xpx} is type '${typeof patternScale}' not 'number'`);
    if (Number.isNaN(patternScale)) throw RangeError(
        `${xpx} ${patternScale} is not a valid number`);
    if (patternScale <= 0) throw RangeError(
        `${xpx} ${patternScale} is not greater than 0`);
};

/** #### Checks that a patternUnit value is valid
 * @param {'pixel'|'shape'|'world'} patternUnit The pattern unit to check
 * @param {string} [xpx='patternUnit'] Exception prefix
 */
const validatePatternUnit = (patternUnit, xpx = 'patternUnit') => {
    const validUnits = ['pixel', 'shape', 'world'];
    if (typeof patternUnit !== 'string') throw TypeError(
        `${xpx} is type '${typeof patternUnit}' not 'string'`);
    if (!validUnits.includes(patternUnit)) throw RangeError(
        `${xpx} is not one of '${validUnits.join("'|'")}'`);
};

/** #### Checks that an array of primitives is valid
 * @param {Primitive[]} primitives The array of primitives to check
 * @param {string} [xpx='primitives'] Exception prefix
 */
const validatePrimitives = (primitives, xpx = 'primitives') => {
    if (primitives === null) throw TypeError(
        `${xpx} is null, not an object`);
    if (typeof primitives !== 'object') throw TypeError(
        `${xpx} is type '${typeof primitives}' not 'object'`);
    if (!Array.isArray(primitives)) throw TypeError(
        `${xpx} is not an array`);
    
    for (let i = 0; i < primitives.length; i++) {
        const primitive = primitives[i];
        if (!(primitive instanceof Primitive)) {
            if (primitive === null) throw TypeError(
                `${xpx}[${i}] is null, not an object`);
            if (Array.isArray(primitive)) throw TypeError(
                `${xpx}[${i}] is an array, not an object`);
            if (typeof primitive !== 'object') throw TypeError(
                `${xpx}[${i}] is type '${typeof primitive}' not 'object'`);
            /** @type {{}} **/ const notPrimitive = primitive;
            const notPrimitiveName = notPrimitive.constructor.name;
            throw TypeError(
                `${xpx}[${i}] is an instance of '${notPrimitiveName}' not 'Primitive'`);
        }
    }
};

/** #### Checks that a rotate value is valid
 * @param {number} rotate The rotation value to check
 * @param {string} [xpx='rotate'] Exception prefix
 */
const validateRotate = (rotate, xpx = 'rotate') => {
    if (typeof rotate !== 'number') throw TypeError(
        `${xpx} type is '${typeof rotate}' not 'number'`);
    if (Number.isNaN(rotate)) throw RangeError(
        `${xpx} ${rotate} is not a valid number`);
};

/** #### Checks that a uniform scale value is valid
 * @param {number} scale The scale factor to check
 * @param {string} [xpx='scale'] Exception prefix
 */
const validateScale = (scale, xpx = 'scale') => {
    if (typeof scale !== 'number') throw TypeError(
        `${xpx} is type '${typeof scale}' not 'number'`);
    if (Number.isNaN(scale)) throw RangeError(
        `${xpx} ${scale} is not a valid number`);
    if (scale < 0) throw RangeError(
        `${xpx} ${scale} is less than 0`);
};

/** #### Checks that a strokePosition value is valid
 * @param {'inside'|'center'|'outside'} strokePosition The stroke position
 * @param {string} [xpx='strokePosition'] Exception prefix
 */
const validateStrokePosition = (strokePosition,
    xpx = 'strokePosition') => {
    const validPositions = ['inside', 'center', 'outside'];
    if (typeof strokePosition !== 'string') throw TypeError(
        `${xpx} is type '${typeof strokePosition}' not 'string'`);
    if (!validPositions.includes(strokePosition)) throw RangeError(
        `${xpx} is not one of '${validPositions.join("'|'")}'`);
};

/** #### Checks that a strokeUnit value is valid
 * @param {'pixel'|'shape'|'world'} strokeUnit The stroke unit
 * @param {string} [xpx='strokeUnit'] Exception prefix
 */
const validateStrokeUnit = (strokeUnit, xpx = 'strokeUnit') => {
    const validUnits = ['pixel', 'shape', 'world'];
    if (typeof strokeUnit !== 'string') throw TypeError(
        `${xpx} is type '${typeof strokeUnit}' not 'string'`);
    if (!validUnits.includes(strokeUnit)) throw RangeError(
        `${xpx} is not one of '${validUnits.join("'|'")}'`);
};

/** #### Checks that a strokeWidth value is valid
 * @param {number} strokeWidth The stroke width to check
 * @param {string} [xpx='strokeWidth'] Exception prefix
 */
const validateStrokeWidth = (strokeWidth, xpx = 'strokeWidth') => {
    if (typeof strokeWidth !== 'number') throw TypeError(
        `${xpx} type is '${typeof strokeWidth}' not 'number'`);
    if (Number.isNaN(strokeWidth)) throw RangeError(
        `${xpx} ${strokeWidth} is not a valid number`);
    if (strokeWidth < 0) throw RangeError(
        `${xpx} ${strokeWidth} is less than 0`);
};

/** #### Checks that a translate object is valid
 * @param {{ x: number, y: number }} translate The translate object to check
 * @param {string} [xpx='translate'] Exception prefix
 */
const validateTranslate = (translate, xpx = 'translate') => {
    if (translate === null) throw TypeError(
        `${xpx} is null, not an object`);
    if (Array.isArray(translate)) throw TypeError(
        `${xpx} is an array, not an object`);
    if (typeof translate !== 'object') throw TypeError(
        `${xpx} is type '${typeof translate}' not 'object'`);
    if (typeof translate.x !== 'number') throw TypeError(
        `${xpx}.x is type '${typeof translate.x}' not 'number'`);
    if (Number.isNaN(translate.x)) throw RangeError(
        `${xpx}.x ${translate.x} is not a valid number`);
    if (typeof translate.y !== 'number') throw TypeError(
        `${xpx}.y is type '${typeof translate.y}' not 'number'`);
    if (Number.isNaN(translate.y)) throw RangeError(
        `${xpx}.y ${translate.y} is not a valid number`);
};

/**
 * @typedef {import('../../clc-types.js').Pattern} Pattern
 */

/** #### Combines a list of primitives, with rendering instructions */
class Shape {
    /** #### How this shape blends with underlying shapes
     * @type {'multiply'|'normal'|'overlay'|'screen'} */
    blendMode = 'normal';

    /** #### How to reflect this shape, if at all
     * @type {'flip-x'|'flip-x-and-y'|'flip-y'|'no-flip'} */
    flip = 'no-flip';

    /** #### The foreground color
     * @type {Color} */
    ink = null;

    /** #### The background color
     * @type {Color} */
    paper = null;

    /** #### The fill texture
     * @type {Pattern} */
    pattern = 'all-ink';

    /** #### The visual balance between ink and paper in patterns
     * - 0.0 = all paper, 1.0 = all ink, 0.5 = equal
     * @type {number} */
    patternRatio = 0.5;

    /** #### The scale of the pattern
     * @type {number} */
    patternScale = 1;

    /** #### Which unit to use when drawing patterns
     * @type {'pixel'|'shape'|'world'} */
    patternUnit = 'pixel';

    /** #### Array of primitives that compose this shape
     * @type {Primitive[]} */
    primitives = [];

    /** #### Rotation in radians
     * @type {number} */
    rotate = 0;

    /** #### Uniform scale factor
     * @type {number} */
    scale = 1;

    /** #### The outline color
     * @type {Color} */
    strokeColor = null;

    /** #### Where the outline is positioned relative to the shape edge
     * @type {'inside'|'center'|'outside'} */
    strokePosition = 'center';

    /** #### Which unit `strokeWidth` is measured in
     * @type {'pixel'|'shape'|'world'} */
    strokeUnit = 'pixel';

    /** #### Width of the outline in pixels
     * @type {number} */
    strokeWidth = 0;

    /** #### Translation offset for x and y axes
     * @type {{ x: number, y: number }} */
    translate = { x: 0, y: 0 };

    /**
     * @param {'multiply'|'normal'|'overlay'|'screen'} blendMode Blend mode
     * @param {'flip-x'|'flip-x-and-y'|'flip-y'|'no-flip'} flip Reflection
     * @param {Color} ink Foreground/fill color
     * @param {Color} paper Background color
     * @param {Pattern} pattern Fill pattern
     * @param {number} patternRatio Fill ratio for pattern
     * @param {number} patternScale Fill scale for pattern
     * @param {'pixel'|'shape'|'world'} patternUnit Pattern width unit
     * @param {Primitive[]} primitives Array of primitives
     * @param {number} rotate Rotation in radians
     * @param {number} scale Uniform scale factor
     * @param {Color} strokeColor Stroke/outline color
     * @param {'inside'|'center'|'outside'} strokePosition Stroke position
     * @param {'pixel'|'shape'|'world'} strokeUnit Stroke width unit
     * @param {number} strokeWidth Stroke width in pixels
     * @param {{ x: number, y: number }} translate Translation offset
     */
    constructor(
        blendMode,
        flip,
        ink,
        paper,
        pattern,
        patternRatio,
        patternScale,
        patternUnit,
        primitives,
        rotate,
        scale,
        strokeColor,
        strokePosition,
        strokeUnit,
        strokeWidth,
        translate,
    ) {
        validateBlendMode(blendMode, 'Shape: blendMode');
        validateFlip(flip, 'Shape: flip');
        validateColor(ink, 'Shape: ink');
        validateColor(paper, 'Shape: paper');
        validatePattern(pattern, 'Shape: pattern');
        validatePatternRatio(patternRatio, 'Shape: patternRatio');
        validatePatternScale(patternScale, 'Shape: patternScale');
        validatePatternUnit(patternUnit, 'Shape: patternUnit');
        validatePrimitives(primitives, 'Shape: primitives');
        validateRotate(rotate, 'Shape: rotate');
        validateScale(scale, 'Shape: scale');
        validateColor(strokeColor, 'Shape: strokeColor');
        validateStrokePosition(strokePosition, 'Shape: strokePosition');
        validateStrokeUnit(strokeUnit, 'Shape: strokeUnit');
        validateStrokeWidth(strokeWidth, 'Shape: strokeWidth');
        validateTranslate(translate, 'Shape: translate');

        this.blendMode = blendMode;
        this.flip = flip;
        this.ink = ink;
        this.paper = paper;
        this.pattern = pattern;
        this.patternRatio = patternRatio;
        this.patternScale = patternScale;
        this.patternUnit = patternUnit;
        this.primitives = primitives;
        this.rotate = rotate;
        this.scale = scale;
        this.strokeColor = strokeColor;
        this.strokePosition = strokePosition;
        this.strokeUnit = strokeUnit;
        this.strokeWidth = strokeWidth;
        this.translate = translate;
    }
}

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
const sdfCircle = (tx, ty, r) =>
    Math.sqrt(tx * tx + ty * ty) - r;

/** #### Axis-aligned bounding box for a circle
 * @param {number} tx // center position (translate) x, in world-space units
 * @param {number} ty // center position (translate) y, in world-space units
 * @param {number} r // radius, in world-space units
 * @param {number} expand World units to expand the box (e.g. for anti-aliasing)
 * @returns {Bounds}
 */
const aabbCircle = (tx, ty, r, expand) => {
    const expandedR = Math.abs(r) + expand;
    return {
        xMin: tx - expandedR,
        xMax: tx + expandedR,
        yMin: ty - expandedR,
        yMax: ty + expandedR,
    };
};

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
const segmentDistance = (px, py, ax, ay, bx, by) => {
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

/**
 * Signed distance function (SDF) and axis-aligned bounding box (AABB) for
 * a right triangle.
 */


/** #### Signed distance function for a right triangle
 * @param {number} tx // center position (translate) x, in world-space units
 * @param {number} ty // center position (translate) y, in world-space units
 * @param {number} lx // horizontal side length, in world-space units
 * @param {number} ly // vertical side length, in world-space units
 * @returns {number}
 */
const sdfTriangleRight = (tx, ty, lx, ly) => {
    const absLx = Math.abs(lx);
    const absLy = Math.abs(ly);
    const halfLx = absLx / 2;
    const halfLy = absLy / 2;

    const ax = -halfLx;
    const ay = -halfLy;
    const bx = halfLx;
    const by = -halfLy;
    const cx = -halfLx;
    const cy = halfLy;

    const crossAB = (bx - ax) * (ty - ay) - (by - ay) * (tx - ax);
    const crossBC = (cx - bx) * (ty - by) - (cy - by) * (tx - bx);
    const crossCA = (ax - cx) * (ty - cy) - (ay - cy) * (tx - cx);
    const inside = crossAB >= 0 && crossBC >= 0 && crossCA >= 0;

    const dAB = segmentDistance(tx, ty, ax, ay, bx, by);
    const dBC = segmentDistance(tx, ty, bx, by, cx, cy);
    const dCA = segmentDistance(tx, ty, cx, cy, ax, ay);
    const dist = Math.min(dAB, dBC, dCA);

    return inside ? -dist : dist;
};

/** #### Axis-aligned bounding box for a right triangle
 * @param {number} tx // center position (translate) x, in world-space units
 * @param {number} ty // center position (translate) y, in world-space units
 * @param {number} lx // horizontal side length, in world-space units
 * @param {number} ly // vertical side length, in world-space units
 * @param {number} expand World units to expand the box (e.g. for AA)
 * @returns {Bounds}
 */
const aabbTriangleRight = (tx, ty, lx, ly, expand) => {
    const halfLx = Math.abs(lx) / 2;
    const halfLy = Math.abs(ly) / 2;
    return {
        xMin: tx - halfLx - expand,
        xMax: tx + halfLx + expand,
        yMin: ty - halfLy - expand,
        yMax: ty + halfLy + expand,
    };
};

/**
 * Signed distance function (SDF) and axis-aligned bounding box (AABB) for
 * an aggregated array of primitives.
 */


const FLIP_SIGNS$1 = Object.freeze({
    'no-flip': Object.freeze({ x: 1, y: 1 }),
    'flip-x': Object.freeze({ x: -1, y: 1 }),
    'flip-y': Object.freeze({ x: 1, y: -1 }),
    'flip-x-and-y': Object.freeze({ x: -1, y: -1 }),
});

/**
 * @typedef {import('../../clc-types.js').Bounds} Bounds
 * @typedef {import('../../models/shape/shape.js').Shape} Shape
 */

/** #### Composite signed distance function for a Shape made from primitives
 * Combines primitive SDFs left-to-right using join modes:
 * - 'union' -> min(a,b)
 * - 'difference' -> difference(a,b) == max(a, -b)
 * @param {Shape} shape
 * @param {number} worldX
 * @param {number} worldY
 * @returns {number}
 */
const sdfCompound = (shape, worldX, worldY) => {
    if (shape.primitives.length === 0) return 1e6;

    const shapeScale = shape.scale || 1;
    if (shapeScale === 0) return 1e6;

    const shapeTx = shape.translate.x;
    const shapeTy = shape.translate.y;
    const shapeFlip = FLIP_SIGNS$1[shape.flip] || FLIP_SIGNS$1['no-flip'];

    const shapeLocalX = (worldX - shapeTx) * shapeFlip.x / shapeScale;
    const shapeLocalY = (worldY - shapeTy) * shapeFlip.y / shapeScale;

    let acc = null;

    for (let i = 0; i < shape.primitives.length; i++) {
        const p = shape.primitives[i];

        const primScale = p.scale || 1;
        if (primScale === 0) continue;

        const primFlip = FLIP_SIGNS$1[p.flip] || FLIP_SIGNS$1['no-flip'];
        const totalScale = shapeScale * primScale;

        const localX = (shapeLocalX - p.translate.x) * primFlip.x / primScale;
        const localY = (shapeLocalY - p.translate.y) * primFlip.y / primScale;

        let dWorld = 1e6;
        switch (p.kind) {
            case 'circle': {
                const dLocal = sdfCircle(localX, localY, 1);
                dWorld = dLocal * totalScale;
                break;
            }
            case 'triangle-right': {
                // Use hard-coded local side lengths lx=1, ly=2.
                const dLocal = sdfTriangleRight(localX, localY, 1, 2);
                dWorld = dLocal * totalScale;
                break;
            }
            default:
                dWorld = 1e6;
        }

        if (acc === null) {
            acc = dWorld;
        } else if (p.joinMode === 'union') {
            acc = Math.min(acc, dWorld);
        } else {
            acc = Math.max(acc, -dWorld);
        }
    }

    return acc === null ? 1e6 : acc;
};

/** #### Axis-aligned bounding box for a composite shape
 * Unions primitive AABBs (converted to world-space by adding the shape's
 * position to each primitive's offset).
 * @param {Shape} shape
 * @param {number} expand Amount to expand each primitive's box (world units)
 * @returns {Bounds}
 */
const aabbCompound = (shape, expand) => {

    // Initialise to an 'inverted box', that any real AABB will intersect.
    let out = { xMin: 1e9, xMax: -1e9, yMin: 1e9, yMax: -1e9 };

    const shapeScale = shape.scale || 1;
    if (shapeScale === 0) return { xMin: -1e6, xMax: 1e6, yMin: -1e6, yMax: 1e6 };

    const shapeFlip = FLIP_SIGNS$1[shape.flip] || FLIP_SIGNS$1['no-flip'];

    for (let i = 0; i < shape.primitives.length; i++) {
        const p = shape.primitives[i];
        const primScale = p.scale || 1;
        if (primScale === 0) continue;

        const totalScale = shapeScale * primScale;
        const primCenterX = shape.translate.x + (p.translate.x * shapeScale * shapeFlip.x);
        const primCenterY = shape.translate.y + (p.translate.y * shapeScale * shapeFlip.y);

        let box;
        switch (p.kind) {
            case 'circle': {
                const scaledRadius = Math.abs(totalScale);
                box = aabbCircle(primCenterX, primCenterY, scaledRadius, expand);
                break;
            }
            case 'triangle-right': {
                const lx = totalScale * 1;
                const ly = totalScale * 2;
                box = aabbTriangleRight(primCenterX, primCenterY, lx, ly, expand);
                break;
            }
            default:
                box = { xMin: -1e6, xMax: 1e6, yMin: -1e6, yMax: 1e6 };
        }

        out.xMin = Math.min(out.xMin, box.xMin);
        out.xMax = Math.max(out.xMax, box.xMax);
        out.yMin = Math.min(out.yMin, box.yMin);
        out.yMax = Math.max(out.yMax, box.yMax);
    }

    // If no primitives were processed, return a huge box.
    if (out.xMin > out.xMax) return { xMin: -1e6, xMax: 1e6, yMin: -1e6, yMax: 1e6 };

    return out;
};

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
const blendChannel = (mode, overlay, under) => {
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
const clamp01 = (value) => {
    if (value <= 0) return 0;
    if (value >= 1) return 1;
    return value;
};

/** #### Converts a 0..1 float to a byte (0..255 integer).
 * @param {number} value Input value between 0 and 1.
 * @returns {number} Value between 0 and 255.
 */
const toByte = (value) =>
    Math.round(clamp01(value) * 255);

/** #### Calculates anti-aliased fill coverage from an SDF distance.
 * @param {number} aaRegion The anti-alias region, in world units
 * @param {number} aaRegionHalf Half the anti-alias region, in world units
 * @param {number} distance Signed distance sample
 * @returns {number} fill-coverage factor, between 0 and 1
 */
function computeFillCoverage(aaRegion, aaRegionHalf, distance) {
    if (distance >= aaRegionHalf) return 0;
    return clamp01((aaRegionHalf - distance) / aaRegion);
}

/** #### Calculates anti-aliased stroke coverage from an SDF distance.
 * @param {number} aaRegionHalf Half the anti-alias region, in world units
 * @param {number} distance Signed distance sample
 * @param {number} shapeScale The shape's uniform scale factor
 * @param {Color} strokeColor Stroke colour
 * @param {'inside'|'center'|'outside'} strokePosition Stroke position
 * @param {'pixel'|'shape'|'world'} strokeUnit Stroke width unit
 * @param {number} strokeWidth Stroke weight in pixels
 * @param {number} worldUnitsPerPixel World units per pixel
 * @param {string} [xpx='computeStrokeCoverage():'] Exception prefix for errors
 * @returns {number} stroke-coverage factor, between 0 and 1
 */
function computeStrokeCoverage(
    aaRegionHalf,
    distance,
    shapeScale,
    strokeColor,
    strokePosition,
    strokeUnit,
    strokeWidth,
    worldUnitsPerPixel,
    xpx = 'computeStrokeCoverage():',
) {
    // Short-circuit if there's no stroke to draw.
    if (strokeWidth === 0 || strokeColor.a === 0) return 0;

    // Calculate stroke width in world units based on strokeUnit.
    // TODO move this out of the hot loop and maybe support world-width strokes, e.g. in the Shape itself
    let strokeWidthWorld;
    switch (strokeUnit) {
        case 'pixel':
            // Default behavior: stroke width in pixels, unaffected by scale.
            strokeWidthWorld = strokeWidth * worldUnitsPerPixel;
            break;
        case 'shape':
            // Stroke scales with both shape scale and world scale.
            strokeWidthWorld = strokeWidth * worldUnitsPerPixel * shapeScale;
            break;
        case 'world':
            // Stroke in world units, scales with world but not shape scale.
            strokeWidthWorld = strokeWidth;
            break;
        default:
            throw Error(`${xpx} invalid strokeUnit '${strokeUnit}'`);
    }

    // Get the minimum and maximum bounds of the 'stroke band'.
    // TODO move this out of the hot loop
    let bandMin = 0;
    let bandMax = 0;
    switch (strokePosition) {
        case 'center':
            bandMin = -strokeWidthWorld / 2;
            bandMax = strokeWidthWorld / 2;
            break;
        case 'inside':
            bandMin = -strokeWidthWorld;
            bandMax = 0;
            break;
        case 'outside':
            bandMin = 0;
            bandMax = strokeWidthWorld;
            break;
        default: // should be unreachable, if validateStrokePosition() was used
            throw Error(`${xpx} invalid strokePosition`);
    }

    // Calculate how far the SDF sample lies from the stroke band.
    const isGreaterThanBandMin = distance > bandMin;
    const isLessThanBandMax = distance < bandMax;

    // If the distance is inside the stroke band, coverage is 100%.
    if (isGreaterThanBandMin && isLessThanBandMax) return 1;

    // Get the normalised (always positive) distance to the stroke band.
    const distToBand = isLessThanBandMax
        ? bandMin - distance
        : distance - bandMax;

    // If the distance to the band is outside the AA region, coverage is 0%.
    if (distToBand >= aaRegionHalf) return 0;

    // Compute coverage, falling off linearly to 0% at the edge of the AA region.
    return 1 - (distToBand / aaRegionHalf);
}

/** #### Computes the blended pixel colour from stroke and fill inputs
 * - Combines source channels with destination, using a blend-mode
 * @param {'multiply'|'normal'|'overlay'|'screen'} blendMode How pixels blend
 * @param {number} dstB Destination blue channel, normalised 0..1
 * @param {number} dstG Destination green channel, normalised 0..1
 * @param {number} dstR Destination red channel, normalised 0..1
 * @param {Object} fillColor Fill colour object with channel data
 * @param {number} fillOpacity Fill coverage multiplied by alpha
 * @param {Color} strokeColor Stroke colour object, including alpha channel
 * @param {number} strokeOpacity Stroke coverage multiplied by alpha
 * @returns {{r:number,g:number,b:number}} Blended colour, normalised 0..1
 */
const computeFinalPixelValue = (
    blendMode,
    dstB,
    dstG,
    dstR,
    fillColor,
    fillOpacity,
    strokeColor,
    strokeOpacity,
) => {
    // Normalise fill and stroke colours from 0..255 to 0..1 range.
    const fillR = fillOpacity > 0 ? fillColor.r / 255 : 0;
    const fillG = fillOpacity > 0 ? fillColor.g / 255 : 0;
    const fillB = fillOpacity > 0 ? fillColor.b / 255 : 0;
    const strokeR = strokeOpacity > 0 ? strokeColor.r / 255 : 0;
    const strokeG = strokeOpacity > 0 ? strokeColor.g / 255 : 0;
    const strokeB = strokeOpacity > 0 ? strokeColor.b / 255 : 0;

    // Compute composite source alpha for stroke over fill.
    const oneMinusStrokeOpacity = 1 - strokeOpacity;
    const srcAlpha = clamp01(strokeOpacity + (fillOpacity * oneMinusStrokeOpacity));
    if (srcAlpha <= 0) return { r: dstR, g: dstG, b: dstB };

    // Compute pre-multiplied source channels by combining stroke and fill.
    const preMulR = (strokeR * strokeOpacity) + (fillR * fillOpacity * oneMinusStrokeOpacity);
    const preMulG = (strokeG * strokeOpacity) + (fillG * fillOpacity * oneMinusStrokeOpacity);
    const preMulB = (strokeB * strokeOpacity) + (fillB * fillOpacity * oneMinusStrokeOpacity);

    // Un-premultiply to recover straight (non pre-multiplied) source channels.
    const srcR = preMulR / srcAlpha;
    const srcG = preMulG / srcAlpha;
    const srcB = preMulB / srcAlpha;

    // Apply the blend mode per-channel against the destination.
    // TODO optimise known no-ops (multiply/white, screen/black, overlay/0.5 grey).
    const blendedR = blendChannel(blendMode, srcR, dstR);
    const blendedG = blendChannel(blendMode, srcG, dstG);
    const blendedB = blendChannel(blendMode, srcB, dstB);

    // Composite blended source over destination using src alpha.
    // Staying in float space delays rounding until every shape is done.
    return {
        r: clamp01((blendedR * srcAlpha) + (dstR * (1 - srcAlpha))),
        g: clamp01((blendedG * srcAlpha) + (dstG * (1 - srcAlpha))),
        b: clamp01((blendedB * srcAlpha) + (dstB * (1 - srcAlpha))),
    };
};

/** #### Computes axis-aligned bounding boxes (AABBs) for shapes in world-space
 * - These AABBs are 'conservative', meaning they err on the side of being too
 *   large rather than too small, to avoid incorrectly culling pixels that the
 *   shape could affect.
 * - Uses the AABB functions colocated with SDFs to compute the boxes.
 * @param {number} aaRegion Anti-alias region in world units
 * @param {{id:number,shape:Shape}[]} shapes List of shapes to rasterize
 * @param {number} worldUnitsPerPixel World units per pixel
 * @param {string} [xpx='computeShapeAABBs():'] Exception prefix
 */
const computeShapeAABBs = (
    aaRegion,
    shapes,
    worldUnitsPerPixel,
    xpx = 'computeShapeAABBs():',
) =>
    shapes.map(({ shape }) => { // `id` is not needed here
        // Start by expanding boxes by the anti-alias region, so that edge
        // pixels aren't culled.
        let expand = aaRegion;

        // Calculate stroke width in world units based on strokeUnit.
        let strokeWidthWorld = 0;
        switch (shape.strokeUnit) {
            case 'pixel':
                strokeWidthWorld = shape.strokeWidth * worldUnitsPerPixel;
                break;
            case 'shape':
                strokeWidthWorld = shape.strokeWidth * worldUnitsPerPixel * shape.scale;
                break;
            case 'world':
                strokeWidthWorld = shape.strokeWidth;
                break;
        }

        // Expand outward for strokes that lie outside or are centred on the
        // shape boundary so we don't accidentally cull stroke pixels.
        switch (shape.strokePosition) {
            case 'center':
                expand += strokeWidthWorld / 2;
                break;
            case 'inside': // no further expansion needed
                break;
            case 'outside':
                expand += strokeWidthWorld;
                break;
            default: // should be unreachable, if validateStrokePosition() was used
                throw Error(`${xpx} invalid strokePosition`);
        }

        // Use an aggregate AABB which unions all primitive AABBs.
        return aabbCompound(shape, expand);
    });

/** #### Computes world-space X and Y coordinates for each pixel column and row
 *
 * These values are constant for every pixel, so precalculating them here avoids
 * repeated work (division/multiplication) inside hot loops.
 *
 * @param {number} xExtent Width of the pixel grid
 * @param {number} yExtent Height of the pixel grid
 */
function computeWorldXsAndYs(xExtent, yExtent) {

    // Calculate the canvas width and height in world units.
    const aspectRatio = xExtent / yExtent;
    const xExtentWorld = aspectRatio >= 1
        ? SIDE_IN_WORLD_UNITS * aspectRatio
        : SIDE_IN_WORLD_UNITS;
    const yExtentWorld = aspectRatio >= 1
        ? SIDE_IN_WORLD_UNITS
        : SIDE_IN_WORLD_UNITS / aspectRatio;

    // Calculate the world X coordinate for every column and the world Y
    // coordinate for every row.
    const worldXs = new Array(xExtent);
    for (let x = 0; x < xExtent; x++) {
        worldXs[x] = ((x + 0.5) / xExtent - 0.5) * xExtentWorld;
    }
    const worldYs = new Array(yExtent);
    for (let y = 0; y < yExtent; y++) {
        worldYs[y] = ((y + 0.5) / yExtent - 0.5) * yExtentWorld;
    }

    return { worldXs, worldYs };
}

/** #### Fills a pixel grid with a background colour
 * - For efficiency, does not recreate any Pixel or array instances.
 * @param {Object} background The background color object with r, g, b properties
 * @param {Array} pixels 2D array of pixel objects to be reset
 * @param {number} xExtent The width of the pixel grid
 * @param {number} yExtent The height of the pixel grid
 */
const resetPixelGrid = (background, pixels, xExtent, yExtent) => {
    const { r, g, b } = background;
    for (let y = 0; y < yExtent; y++) {
        for (let x = 0; x < xExtent; x++) {
            const pixel = pixels[y][x];
            pixel.r = r;
            pixel.g = g;
            pixel.b = b;
        }
    }
};

/** @typedef {import('../../models/shape/shape.js').Shape} Shape */

/** #### FLIP_SIGNS
 * - Mapping of human-readable flip modes to the numeric sign factors.
 * - Used when converting world coordinates into shape-local space.
 */
const FLIP_SIGNS = Object.freeze({
    'no-flip': Object.freeze({ x: 1, y: 1 }),
    'flip-x': Object.freeze({ x: -1, y: 1 }),
    'flip-y': Object.freeze({ x: 1, y: -1 }),
    'flip-x-and-y': Object.freeze({ x: -1, y: -1 }),
});

/** #### Computes a positive modulo of `value` with respect to `period`
 * - Guarantees a result in the range 0..period, even for negative `value`.
 * @param {number} value The value to wrap into the period.
 * @param {number} period Wrap period; if zero returns 0 to avoid division/modulo by 0.
 * @returns {number} Number in 0..period when period > 0, otherwise 0.
 */
const positiveMod = (value, period) => {
    if (period === 0) return 0;
    const mod = value % period;
    return mod < 0 ? mod + period : mod;
};

/** #### Calculates how much of a stripe pattern interval is covered by ink
 * - Compute the length of overlap between a one-dimensional interval
 *   [offset, offset + length] and an "ink" segment [0, inkLength].
 * - Used by the stripe-coverage algorithm to accumulate how much of a
 *   pixel footprint overlaps the ink portion of a pattern cycle.
 * @param {number} offset Start coordinate of the interval relative to the ink start (0).
 * @param {number} length Length of the interval to test for overlap.
 * @param {number} inkLength Length of the ink portion inside the repeating cycle.
 * @returns {number} Length of the overlap (>= 0). Returns 0 for non-positive lengths.
 */
const partialStripeCoverage = (offset, length, inkLength) => {
    if (length <= 0) return 0;
    const overlapStart = Math.max(offset, 0);
    const overlapEnd = Math.min(offset + length, inkLength);
    if (overlapEnd <= overlapStart) return 0;
    return overlapEnd - overlapStart;
};

/** #### Converts world coordinates into shape-pattern space
 * - Converts a sample point given in world coordinates into the coordinate
 *   system used by a shape's pattern.
 * - The conversion applies translation, optional flipping, and inverse scaling
 *   so patterns are defined in a stable "shape-local" space independent of
 *   world scaling.
 * @param {Shape} shape The shape whose transform/flip/scale are used.
 * @param {number} worldX X coordinate in world units.
 * @param {number} worldY Y coordinate in world units.
 * @returns {{x:number,y:number}}
 *   Object with numeric `x` and `y` fields representing the sample point in shape-local (pattern) space.
 */
const toPatternSpace = (shape, worldX, worldY) => {
    const flip = FLIP_SIGNS[shape.flip] || FLIP_SIGNS['no-flip'];
    const scale = shape.scale || 1;
    const invScale = scale === 0 ? 0 : 1 / scale;
    return {
        x: (worldX - shape.translate.x) * flip.x * invScale,
        y: (worldY - shape.translate.y) * flip.y * invScale,
    };
};

// 
/** #### Used by computePatternCycleLocal() to cache results on shape instances
 * - Symbol used as a hidden property key on `Shape` instances to store a
 *   tiny cache object for the computed pattern cycle length.
 * - Avoids recomputing identical values in the inner raster loop while keeping
 *   the cache non-enumerable and collision-free.
 */
const PATTERN_CYCLE_CACHE = Symbol('patternCycleCache');

/** #### Calculates the pattern cycle length in shape-local units
 * - Computes the repeating cycle length of a shape's pattern expressed in
 *   shape-local units. The cycle depends on the shape's `patternScale`, the
 *   `patternUnit` (which may be in pixels, shape units, or world units), the
 *   shape's scale, and the current `worldUnitsPerPixel` used for sampling.
 * - To avoid repeated, expensive recomputation inside the raster loop this
 *   function stores a tiny cache object on the `shape` instance keyed by a
 *   Symbol. The cache is best-effort and silently skipped for frozen or
 *   non-extensible shapes.
 *
 * Edge cases handled:
 * - `patternUnit === 'pixel'` converts `patternScale` to world units by
 *   multiplying with `worldUnitsPerPixel` before transforming to local space.
 * - `patternUnit === 'shape'` treats `patternScale` as relative to the
 *   absolute shape scale.
 * - Non-finite or non-positive computed periods yield `0`.
 *
 * @param {Shape} shape
 *   Shape instance containing `patternScale`, `patternUnit`, and `scale`.
 * @param {number} worldUnitsPerPixel
 *   How many world units correspond to a single screen pixel at the current raster resolution.
 * @returns {number}
 *   Cycle length (number) in shape-local units. */
const computePatternCycleLocal = (shape, worldUnitsPerPixel) => {
    // Use a tiny per-shape cache to avoid recomputing the cycle on every pixel.
    // Cache key consists of the inputs that affect the cycle.
    const scale = Math.abs(shape.scale) || 1;
    const key = {
        patternScale: shape.patternScale,
        patternUnit: shape.patternUnit,
        scale,
        worldUnitsPerPixel,
    };

    const cached = shape[PATTERN_CYCLE_CACHE];
    if (cached && cached.patternScale === key.patternScale
        && cached.patternUnit === key.patternUnit
        && cached.scale === key.scale
        && cached.worldUnitsPerPixel === key.worldUnitsPerPixel) {
        return cached.cycleLocal;
    }

    let periodWorld;
    switch (shape.patternUnit) {
        case 'pixel':
            periodWorld = shape.patternScale * worldUnitsPerPixel;
            break;
        case 'shape':
            periodWorld = shape.patternScale * scale;
            break;
        case 'world':
        default:
            periodWorld = shape.patternScale;
            break;
    }
    if (!Number.isFinite(periodWorld) || periodWorld <= 0) return 0;
    const cycleLocal = periodWorld / scale;

    // Store into cache on the shape instance (hidden via Symbol).
    try {
        Object.defineProperty(shape, PATTERN_CYCLE_CACHE, {
            value: {
                patternScale: key.patternScale,
                patternUnit: key.patternUnit,
                scale: key.scale,
                worldUnitsPerPixel: key.worldUnitsPerPixel,
                cycleLocal,
            },
            configurable: true,
            writable: true,
        });
    } catch (e) {
        // If shape is frozen or non-extensible, just skip caching.
    }

    return cycleLocal;
};

/** #### Computes ink coverage for a striped pattern over a pixel footprint
 * - Computes the fraction of a pixel footprint that is covered by the ink
 *   portion of a repeating stripe pattern.
 * - The stripe pattern repeats with period `cycleLocal` and the ink occupies
 *   the first `patternRatio` portion of each cycle.
 * - The function integrates coverage across a one-dimensional interval that
 *   represents the pixel footprint projected into the pattern axis. This
 *   approach gives sub-pixel anti-aliased coverage for thin patterns.
 * 
 * Edge cases handled:
 * - Non-finite inputs fall back to a best-effort clamped `patternRatio`.
 * - Zero or negative `cycleLocal` yields a constant coverage equal to
 *   clamped `patternRatio`.
 * 
 * @param {number} coordCenter
 *   Center coordinate of the pixel footprint in pattern-local units along the stripe axis (either x or y after transformation).
 * @param {number} pixelWidthLocal
 *   Width of the pixel footprint expressed in the same local units (may be zero for degenerate cases).
 * @param {number} cycleLocal
 *   Repeating cycle length in local units; must be > 0 to perform stripe math.
 * @param {number} patternRatio
 *   Proportion of each cycle occupied by ink (clamped to [0,1]).
 * @returns {number}
 *   Number in [0,1] representing the fraction of the pixel covered by ink.
 */
const computeStripeCoverage = (
    coordCenter,
    pixelWidthLocal,
    cycleLocal,
    patternRatio,
) => {
    if (!Number.isFinite(coordCenter) || !Number.isFinite(pixelWidthLocal)) return clamp01(patternRatio);
    if (!Number.isFinite(cycleLocal) || cycleLocal <= 0) return clamp01(patternRatio);

    const ratio = clamp01(patternRatio);
    if (ratio <= 0) return 0;
    if (ratio >= 1) return 1;

    const inkLength = cycleLocal * ratio;
    const footprint = Math.max(pixelWidthLocal, 0);
    if (footprint === 0) return ratio;

    const half = footprint / 2;
    const start = coordCenter - half;
    const intervalLength = footprint;

    const startMod = positiveMod(start, cycleLocal);
    const firstSpan = Math.min(intervalLength, cycleLocal - startMod);
    let covered = partialStripeCoverage(startMod, firstSpan, inkLength);

    let remaining = intervalLength - firstSpan;
    if (remaining > 0) {
        const fullCycles = Math.floor(remaining / cycleLocal);
        covered += fullCycles * inkLength;
        remaining -= fullCycles * cycleLocal;
        covered += partialStripeCoverage(0, remaining, inkLength);
    }

    return clamp01(covered / intervalLength);
};

/** #### Blends ink and paper colours using the supplied coverage
 * - Produces a new `Color` by linearly interpolating between `paper` and
 *   `ink` according to `coverage` where `coverage === 0` yields `paper` and
 *   `coverage === 1` yields `ink`.
 * - The function handles early exit cases for 0 and 1 coverage to avoid
 *   unnecessary object allocations in hot code paths.
 * @param {import('../../models/color/color.js').Color} ink
 *   Color used for the ink portion of the pattern.
 * @param {import('../../models/color/color.js').Color} paper
 *   Background/paper color used where there is no ink.
 * @param {number} coverage
 *   Fraction of the pixel covered by ink, which will be clamped to 0..1.
 * @returns {import('../../models/color/color.js').Color}
 *   A newly constructed `Color` instance representing the blended result.
 */
const mixPatternColors = (ink, paper, coverage) => {
    if (coverage <= 0) return paper;
    if (coverage >= 1) return ink;
    const inkWeight = coverage;
    const paperWeight = 1 - coverage;
    return new Color(
        (ink.r * inkWeight) + (paper.r * paperWeight),
        (ink.g * inkWeight) + (paper.g * paperWeight),
        (ink.b * inkWeight) + (paper.b * paperWeight),
        (ink.a * inkWeight) + (paper.a * paperWeight),
    );
};

/** #### Chooses the colour from a shape according to its pattern
 * - Computes an anti-aliased coverage value, and blends the `ink` and `paper`
 *   colours accordingly.
 * - If `shape.pattern` is `all-ink` or `all-paper` returns the corresponding
 *   colour immediately.
 * - For stripe patterns the function:
 *   - Converts the world sample point into pattern space using
 *     `toPatternSpace()`.
 *   - Computes the repeating cycle length in local units using
 *     `computePatternCycleLocal()`.
 *   - Computes the pixel footprint width in local units and uses
 *     `computeStripeCoverage()` to obtain a coverage value.
 *   - Blends `ink` and `paper` with `mixPatternColors()` using the computed
 *     coverage and returns the result.
 * @param {Shape} shape The shape being sampled.
 * @param {number} worldX X coordinate in world units for the sample.
 * @param {number} worldY Y coordinate in world units for the sample.
 * @param {number} worldUnitsPerPixel
 *   How many world units correspond to one screen pixel at the current raster resolution.
 * @returns {import('../../models/color/color.js').Color}
 *   Sampled colour for the shape at the supplied world sample location.
 */
const samplePatternColor = (
    shape,
    worldX,
    worldY,
    worldUnitsPerPixel,
) => {
    if (shape.pattern === 'all-ink') return shape.ink;
    if (shape.pattern === 'all-paper') return shape.paper;

    const patternSpace = toPatternSpace(shape, worldX, worldY);
    const cycleLocal = computePatternCycleLocal(shape, worldUnitsPerPixel);
    const pixelWidthLocal = (worldUnitsPerPixel / (Math.abs(shape.scale) || 1));

    let coverage = clamp01(shape.patternRatio);
    switch (shape.pattern) {
        case 'breton':
            coverage = computeStripeCoverage(
                patternSpace.y,
                pixelWidthLocal,
                cycleLocal,
                shape.patternRatio,
            );
            break;
        case 'pinstripe':
            coverage = computeStripeCoverage(
                patternSpace.x,
                pixelWidthLocal,
                cycleLocal,
                shape.patternRatio,
            );
            break;
    }

    return mixPatternColors(shape.ink, shape.paper, coverage);
};

/** #### Draws an array of shapes into the pixel grid
 * - Mutates the provided pixels-array in-place.
 * @param {number} aaRegionPixels Anti-alias region width in pixels
 * @param {Pixel} background Background color pixel
 * @param {Pixel[][]} pixels Pixel grid to rasterize into
 * @param {{id:number,shape:Shape}[]} shapes List of shapes to rasterize
 * @param {number} worldUnitsPerPixel World units per pixel
 * @param {number} xExtent Width of the pixel grid
 * @param {number} yExtent Height of the pixel grid
 * @param {string} [xpx='rasterize():'] Exception prefix
 */
function rasterize(
    aaRegionPixels,
    background,
    pixels,
    shapes,
    worldUnitsPerPixel,
    xExtent,
    yExtent,
    xpx = 'rasterize():',
) {
    // Reset pixel grid to background.
    resetPixelGrid(background, pixels, xExtent, yExtent);

    // Convert an anti-aliasing width specified in pixels to world-space units.
    // The renderer maps the smaller canvas dimension to SIDE_IN_WORLD_UNITS.
    // If that's 10, then one world unit per pixel is `10/min(xExtent,yExtent)`.
    // aaRegionPixels controls how many screen pixels the AA band covers.
    // Avoid repeated division, by computing half-region once.
    const aaRegion = aaRegionPixels * worldUnitsPerPixel;
    const aaRegionHalf = aaRegion / 2;

    // Precompute conservative axis-aligned bounding boxes (AABB) for each shape,
    // so the inner pixel loop can cheaply skip shapes that can't affect a pixel.
    const shapeBoxes = computeShapeAABBs(aaRegion, shapes, worldUnitsPerPixel);

    // Precompute world-space X/Y coordinates for every canvas column/row.
    const { worldXs, worldYs } = computeWorldXsAndYs(xExtent, yExtent);

    for (let y = 0; y < yExtent; y++) {
        for (let x = 0; x < xExtent; x++) {
            // Look up the precomputed world coordinates for this pixel and
            // grab the backing pixel. We normalise to 0..1 so the blend
            // math stays stable while multiple shapes accumulate colour.
            const worldX = worldXs[x];
            const worldY = worldYs[y];
            const pixel = pixels[y][x];

            let dstR = pixel.r / 255;
            let dstG = pixel.g / 255;
            let dstB = pixel.b / 255;

            // Step through each shape in paint order, applying stroke, fill
            // and blend processing whenever the SDF says the pixel is hit.
            for (let si = 0; si < shapes.length; si++) {
                const shape = shapes[si].shape;
                // Quick axis-aligned bounding-box culling. If enabled and the
                // pixel's world coordinate lies outside the (conservative)
                // box for this shape, skip SDF evaluation entirely.
                {
                    const box = shapeBoxes[si];
                    if (worldX < box.xMin || worldX > box.xMax || worldY < box.yMin || worldY > box.yMax) {
                        continue; // shape cannot affect this pixel
                    }
                }

                // Evaluate the composite signed distance for this Shape. Note
                // that Shapes are composed of multiple primitives (union/
                // difference).
                const distance = sdfCompound(shape, worldX, worldY);

                // Get the fill colour for this shape at this pixel.
                const fillColor = samplePatternColor(
                    shape,
                    worldX,
                    worldY,
                    worldUnitsPerPixel,
                );

                // Compute fill and stroke coverage from the SDF distance.
                const fillCoverage = computeFillCoverage(
                    aaRegion,
                    aaRegionHalf,
                    distance,
                );
                const strokeCoverage = computeStrokeCoverage(
                    aaRegionHalf,
                    distance,
                    shape.scale,
                    shape.strokeColor,
                    shape.strokePosition,
                    shape.strokeUnit,
                    shape.strokeWidth,
                    worldUnitsPerPixel,
                    xpx,
                );

                // Translate coverage into opacity by multiplying by the
                // source alpha channel.
                const fillOpacity = fillCoverage * (fillColor?.a ?? 0);
                const strokeOpacity = strokeCoverage * (shape.strokeColor?.a ?? 0);

                // Skip the (expensive) blend, if they're both zero opacity.
                if (fillOpacity <= 0 && strokeOpacity <= 0) continue;

                // Modify the destination pixel by blending this shape's pixel.
                const finalPixelValue = computeFinalPixelValue(
                    shape.blendMode,
                    dstB,
                    dstG,
                    dstR,
                    fillColor,
                    fillOpacity,
                    shape.strokeColor,
                    strokeOpacity,
                );
                dstR = finalPixelValue.r;
                dstG = finalPixelValue.g;
                dstB = finalPixelValue.b;
            }

            // Convert the accumulated floats back into byte channels for
            // downstream rendering.
            pixel.r = toByte(dstR);
            pixel.g = toByte(dstG);
            pixel.b = toByte(dstB);
        }
    }
}

/**
 * @typedef {import('../shape/shape.js').Shape} Shape
 */

/** #### An ANSI canvas */
class Canvas {
    /** A pixel to clone across the canvas's background
     * @type {Pixel} */
    background = null;

    /** #### The canvas's width
     * @type {number} */
    xExtent = 0;

    /** #### The canvas's height
     * @type {number} */
    yExtent = 0;

    /** Anti-aliasing region width in pixels
     * @type {number} */
    #aaRegionPixels = 0;

    /** #### ID of the most recently added shape
     * @type {number} */
    #lastShapeId = 0;

    /** #### `true` if `pixels` needs to be recomposed before rendering
     * - If `false`, the existing `pixels` can be rerendered as-is
     * - `needsUpdate` will be set to `true` after most changes to the canvas
     * @type {boolean} */
    #needsUpdate = false;

    /** #### Private 2D array containing the canvas's pixels
     * @type {Pixel[][]} */
    #pixels = [];

    /** #### Private list of Shapes
     * - In the order that they should be composited
     * @type {{id: number, shape: Shape}[]} */
    #shapes = [];

    /** World units per pixel
     * @type {number} */
    #worldUnitsPerPixel = 0;

    /**
     * @param {Pixel} background A pixel to clone across the canvas's background
     * @param {number} xExtent The canvas's width
     * @param {number} yExtent The canvas's height
     */
    constructor(background, xExtent, yExtent) {
        validatePixel(background, 'Canvas: background');
        validateCanvasExtent(xExtent, 'Canvas: xExtent');
        validateCanvasExtent(yExtent, 'Canvas: yExtent');

        this.#aaRegionPixels = 0.85; // anti-alias region width in pixels (1 would be a little too soft)
        this.background = background;
        this.#worldUnitsPerPixel = SIDE_IN_WORLD_UNITS / Math.min(xExtent, yExtent);
        this.xExtent = xExtent;
        this.yExtent = yExtent;

        // Create a canvas of pixels with the specified dimensions, and fill
        // it with the background colour.
        this.#pixels = Array.from({ length: yExtent }, () =>
            Array.from({ length: xExtent }, () =>
                new Pixel(
                    background.r,
                    background.g,
                    background.b,
                )
            )
        );
    }

    /** #### Appends a shape to the canvas
     * @param {Shape} shape The shape to add
     * @returns {number} The shape's ID - can be used to edit it later
     */
    addShape(shape) {
        const id = this.#lastShapeId;
        this.#shapes.push({ id, shape });
        this.#needsUpdate = true; // TODO optimise by only setting this if shape can affect pixels
        this.#lastShapeId = id + 1; // ready for the next shape
        return id;
    }

    /** #### Rasterises the canvas, and then encodes the pixels ready for display
     * - For 'ansi', 'braille', and 'html' output formats, encoded output will be a string
     * - For 'buffer', the encoded output will be a Uint8Array
     * @param {'monochrome'|'256color'|'truecolor'} colorDepth
     *     Determines colours per channel (ignored for 'buffer' output)
    * @param {'ansi'|'braille'|'buffer'|'html'} outputFormat
     *     The output format to use
     * @param {string} [xpx='Canvas render():']
     *     Optional exception prefix, e.g. 'fn():'
     * @returns {string | Uint8Array<ArrayBufferLike>}
     *     The encoded output, in the requested format
     */
    render(colorDepth, outputFormat, xpx = 'Canvas render():') {
        // Validate parameters.
        validateColorDepth(colorDepth, `${xpx} colorDepth`);
        validateOutputFormat(outputFormat, `${xpx} outputFormat`);

        // Ensure the pixel grid is up to date. Skip this work if no changes
        // have occurred since the last time render() was called.
        if (this.#needsUpdate) {
            rasterize(
                this.#aaRegionPixels,
                this.background,
                this.#pixels,
                this.#shapes,
                this.#worldUnitsPerPixel,
                this.xExtent,
                this.yExtent,
                xpx,
            );
            this.#needsUpdate = false;
        }

        let encoder;
        switch (outputFormat) {
            case 'ansi':
                encoder = encodeAnsi;
                break;
            case 'braille':
                encoder = encodeBraille;
                break;
            case 'buffer':
                encoder = encodeBuffer;
                break;
            case 'html':
                encoder = encodeHtml;
                break;
            default: // should be unreachable, if validateOutputFormat() worked
                throw Error(`${xpx} invalid outputFormat`);
        }

        // Encode the pixel grid as an ANSI string, ArrayBuffer, or HTML.
        return encoder(
            {
                xMin: 0,
                xMax: this.xExtent,
                yMin: 0,
                yMax: this.yExtent,
            },
            colorDepth,
            this.#pixels,
            xpx,
        );
    }
}

export { Canvas, Color, Pixel, Primitive, Shape };
