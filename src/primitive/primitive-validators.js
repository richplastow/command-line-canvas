import { Primitive } from "./primitive.js";

/** #### Checks that a joinMode value is valid
 * @param {'union'|'difference'} joinMode The join mode to check
 * @param {string} [xpx='joinMode'] Exception prefix
 */
export const validateJoinMode = (joinMode, xpx = 'joinMode') => {
    const validModes = ['union', 'difference'];
    if (typeof joinMode !== 'string') throw TypeError(
        `${xpx} is type '${typeof joinMode}' not 'string'`);
    if (!validModes.includes(joinMode)) throw RangeError(
        `${xpx} is not one of '${validModes.join("'|'")}'`);
};

/** #### Checks that a kind value is valid
 * @param {'circle'|'square'|'triangle'} kind The kind to check
 * @param {string} [xpx='kind'] Exception prefix
 */
export const validateKind = (kind, xpx = 'kind') => {
    const validKinds = ['circle', 'square', 'triangle'];
    if (typeof kind !== 'string') throw TypeError(
        `${xpx} is type '${typeof kind}' not 'string'`);
    if (!validKinds.includes(kind)) throw RangeError(
        `${xpx} is not one of '${validKinds.join("'|'")}'`);
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

/** #### Checks that a scale object is valid
 * @param {{ x: number, y: number }} scale The scale object to check
 * @param {string} [xpx='scale'] Exception prefix
 */
export const validateScale = (scale, xpx = 'scale') => {
    if (scale === null) throw TypeError(
        `${xpx} is null, not an object`);
    if (Array.isArray(scale)) throw TypeError(
        `${xpx} is an array, not an object`);
    if (typeof scale !== 'object') throw TypeError(
        `${xpx} is type '${typeof scale}' not 'object'`);
    if (typeof scale.x !== 'number') throw TypeError(
        `${xpx}.x is type '${typeof scale.x}' not 'number'`);
    if (Number.isNaN(scale.x)) throw RangeError(
        `${xpx}.x ${scale.x} is not a valid number`);
    if (scale.x < 0) throw RangeError(
        `${xpx}.x ${scale.x} is less than 0`);
    if (typeof scale.y !== 'number') throw TypeError(
        `${xpx}.y is type '${typeof scale.y}' not 'number'`);
    if (Number.isNaN(scale.y)) throw RangeError(
        `${xpx}.y ${scale.y} is not a valid number`);
    if (scale.y < 0) throw RangeError(
        `${xpx}.y ${scale.y} is less than 0`);
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

/** #### Checks that a Primitive instance is valid
 * @param {Primitive} primitive The Primitive instance to check
 * @param {string} [xpx='primitive'] Exception prefix
 */
export const validatePrimitive = (primitive, xpx = 'primitive') => {
    if (primitive === null) throw TypeError(
        `${xpx} is null, not an object`);
    if (Array.isArray(primitive)) throw TypeError(
        `${xpx} is an array, not an object`);
    if (typeof primitive !== 'object') throw TypeError(
        `${xpx} is type '${typeof primitive}' not 'object'`);
    if (!(primitive instanceof Primitive)) {
        /** @type {{}} **/ const notPrimitive = primitive;
        const notPrimitiveName = notPrimitive.constructor.name;
        throw TypeError(
            `${xpx} is an instance of '${notPrimitiveName}' not 'Primitive'`);
    }
}
