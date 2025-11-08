import { Pixel } from "./pixel.js";

/** #### Checks that a pixel channel is a number between 0 and 255 inclusive
 * - Note that channel values do not have to be integers
 * @param {number} channel The channel value to check
 * @param {string} [xpx='channel'] Exception prefix, e.g. 'Pixel: r (red)'
 */
export const validateChannel = (channel, xpx = 'channel') => {
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
export const validatePixel = (pixel, xpx = 'pixel') => {
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
}
