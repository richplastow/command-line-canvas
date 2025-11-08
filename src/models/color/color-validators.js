import { Color } from "./color.js";

/** #### Checks that an alpha channel is a number between 0 and 1 inclusive
 * - Note that alpha values do not have to be integers
 * @param {number} alpha The alpha value to check
 * @param {string} [xpx='alpha'] Exception prefix, e.g. 'Color: a (alpha)'
 */
export const validateAlpha = (alpha, xpx = 'alpha') => {
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
export const validateRgb = (rgb, xpx = 'rgb') => {
    if (typeof rgb !== 'number') throw TypeError(
        `${xpx} type is '${typeof rgb}' not 'number'`);
    if (Number.isNaN(rgb)) throw RangeError(
        `${xpx} ${rgb} is not a valid number`);
    if (rgb < 0) throw RangeError(
        `${xpx} ${rgb} is less than 0`);
    if (rgb > 255) throw RangeError(
        `${xpx} ${rgb} is greater than 255`);
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
