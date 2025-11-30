import { Color } from './color.js';

/** #### Checks that an RGBA channel is a number between 0 and 255 inclusive
 * - Note that RGBA values do not have to be integers
 * @param {number} rgba The RGBA value to check
 * @param {string} [xpx='rgba'] Exception prefix, e.g. 'Color: r (red)'
 */
export const validateRgba = (rgba, xpx = 'rgba') => {
    if (typeof rgba !== 'number') throw TypeError(
        `${xpx} type is '${typeof rgba}' not 'number'`);
    if (Number.isNaN(rgba)) throw RangeError(
        `${xpx} ${rgba} is not a valid number`);
    if (rgba < 0) throw RangeError(
        `${xpx} ${rgba} is less than 0`);
    if (rgba > 255) throw RangeError(
        `${xpx} ${rgba} is greater than 255`);
};

/** #### Checks that a Color instance is valid
 * @param {Color} color The Color instance to check
 * @param {string} [xpx='color'] Exception prefix, e.g. 'Shape: ink'
 */
export const validateColor = (color, xpx = 'color') => {
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
}
