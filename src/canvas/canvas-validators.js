import { Canvas } from "./canvas.js";

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
    if (extent > 255) throw RangeError(
        `${xpx} ${extent} is greater than 255`);
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
