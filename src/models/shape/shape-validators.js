import { Color } from '../color/color.js';
import { Primitive } from '../primitive/primitive.js';
import { Shape } from './shape.js';

/**
 * @typedef {import('../../clc-types.js').Pattern} Pattern
 */

/** #### Checks that a blendMode value is valid
 * @param {'multiply'|'normal'|'overlay'|'screen'} blendMode The blend mode
 * @param {string} [xpx='blendMode'] Exception prefix
 */
export const validateBlendMode = (blendMode, xpx = 'blendMode') => {
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
};

/** #### Checks that a debugShapeAabb value is valid
 * @param {Color|null} debugShapeAabb The background color for the debug box, or null
 * @param {string} [xpx='debugShapeAabb'] Exception prefix
 */
export const validateDebugShapeAabb = (debugShapeAabb,
    xpx = 'debugShapeAabb') => {
    if (debugShapeAabb === null) return; // null is valid
    if (Array.isArray(debugShapeAabb)) throw TypeError(
        `${xpx} is an array, not an object`);
    if (typeof debugShapeAabb !== 'object') throw TypeError(
        `${xpx} is type '${typeof debugShapeAabb}' not 'object'`);
    if (!(debugShapeAabb instanceof Color)) {
        /** @type {{}} **/ const notColor = debugShapeAabb;
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
export const validateFlip = (flip, xpx = 'flip') => {
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
export const validatePattern = (pattern, xpx = 'pattern') => {
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
export const validatePatternRatio = (patternRatio, xpx = 'patternRatio') => {
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
export const validatePatternScale = (patternScale, xpx = 'patternScale') => {
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
export const validatePatternUnit = (patternUnit, xpx = 'patternUnit') => {
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
export const validatePrimitives = (primitives, xpx = 'primitives') => {
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
export const validateRotate = (rotate, xpx = 'rotate') => {
    if (typeof rotate !== 'number') throw TypeError(
        `${xpx} type is '${typeof rotate}' not 'number'`);
    if (Number.isNaN(rotate)) throw RangeError(
        `${xpx} ${rotate} is not a valid number`);
};

/** #### Checks that a uniform scale value is valid
 * @param {number} scale The scale factor to check
 * @param {string} [xpx='scale'] Exception prefix
 */
export const validateScale = (scale, xpx = 'scale') => {
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
export const validateStrokePosition = (strokePosition,
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
export const validateStrokeUnit = (strokeUnit, xpx = 'strokeUnit') => {
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
export const validateStrokeWidth = (strokeWidth, xpx = 'strokeWidth') => {
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
export const validateTranslate = (translate, xpx = 'translate') => {
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

/** #### Checks that a Shape instance is valid
 * @param {Shape} shape The Shape instance to check
 * @param {string} [xpx='shape'] Exception prefix
 */
export const validateShape = (shape, xpx = 'shape') => {
    if (shape === null) throw TypeError(
        `${xpx} is null, not an object`);
    if (Array.isArray(shape)) throw TypeError(
        `${xpx} is an array, not an object`);
    if (typeof shape !== 'object') throw TypeError(
        `${xpx} is type '${typeof shape}' not 'object'`);
    if (!(shape instanceof Shape)) {
        /** @type {{}} **/ const notShape = shape;
        const notShapeName = notShape.constructor.name;
        throw TypeError(
            `${xpx} is an instance of '${notShapeName}' not 'Shape'`);
    }
}
