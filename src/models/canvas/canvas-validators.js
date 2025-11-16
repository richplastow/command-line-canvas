import { Canvas } from "./canvas.js";
import { Pixel } from "../pixel/pixel.js";

/**
 * @typedef {import('../../clc-types.js').Bounds} Bounds
 */

/** #### Checks that a 'bounds' object is valid
 * @param {Bounds} bounds The bounds object to check
 * @param {string} [xpx='bounds'] Exception prefix, e.g. 'canvas.render(): bounds'
 */
export const validateBounds = (bounds, xpx = 'bounds') => {
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
}

/** #### Checks that the width of height of a canvas is an integer from 1 to 256 inclusive
 * @param {number} extent The canvas extent (width or height) to check
 * @param {string} [xpx='extent'] Exception prefix, e.g. 'Canvas: xExtent'
 */
export const validateCanvasExtent = (extent, xpx = 'extent') => {
    if (typeof extent !== 'number') throw TypeError(
        `${xpx} type is '${typeof extent}' not 'number'`);
    if (!Number.isInteger(extent)) throw RangeError(
        `${xpx} ${extent} is not an integer`);
    if (extent < 1) throw RangeError(
        `${xpx} ${extent} is less than 1`);
    if (extent > 3840) throw RangeError(
        `${xpx} ${extent} is greater than 3840`);
};

/** #### Checks that a Canvas instance is valid
 * @param {Canvas} canvas The Canvas instance to check
 * @param {string} [xpx='canvas'] Exception prefix, e.g. 'Fn(): canvas'
 */
export const validateCanvas = (canvas, xpx = 'canvas') => {
    if (canvas === null) throw TypeError(
        `${xpx} is null, not an object`);
    if (Array.isArray(canvas)) throw TypeError(
        `${xpx} is an array, not an object`);
    if (typeof canvas !== 'object') throw TypeError(
        `${xpx} is type '${typeof canvas}' not 'object'`);
    if (!(canvas instanceof Canvas)) {
        /** @type {{}} **/ const notCanvas = canvas;
        const notCanvasName = notCanvas.constructor.name;
        throw TypeError(
            `${xpx} is an instance of '${notCanvasName}' not 'Canvas'`);
    }
}

/** #### Checks that a color depth value is valid
 * @param {'monochrome'|'256color'|'truecolor'} colorDepth The color depth to check
 * @param {string} [xpx='colorDepth'] Exception prefix, e.g. 'canvas.render(): colorDepth'
 */
export const validateColorDepth = (colorDepth, xpx = 'colorDepth') => {
    const validDepths = ['monochrome', '256color', 'truecolor'];
    if (typeof colorDepth !== 'string') throw TypeError(
        `${xpx} is type '${typeof colorDepth}' not 'string'`);
    if (!validDepths.includes(colorDepth)) throw RangeError(
        `${xpx} is not one of '${validDepths.join("'|'")}'`);
}

/** #### Checks that an output format is valid
 * @param {'ansi'|'braille'|'buffer'|'html'} outputFormat The output format to check
 * @param {string} [xpx='outputFormat'] Exception prefix, e.g. 'canvas.render(): outputFormat'
 */
export const validateOutputFormat = (outputFormat, xpx = 'outputFormat') => {
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
export const validatePixels = (pixels, xpx = 'pixels') => {
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
}
