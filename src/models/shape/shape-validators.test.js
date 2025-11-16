import { throws } from 'node:assert';
import { Color } from '../color/color.js';
import { Primitive } from '../primitive/primitive.js';
import {
    validateBlendMode,
    validateColor,
    validateDebugShapeAabb,
    validateFlip,
    validatePattern,
    validatePatternRatio,
    validatePatternScale,
    validatePatternUnit,
    validatePrimitives,
    validateRotate,
    validateScale,
    validateShape,
    validateStrokePosition,
    validateStrokeUnit,
    validateStrokeWidth,
    validateTranslate,
} from './shape-validators.js';
import { Shape } from './shape.js';


// `validateBlendMode()` invalid.

// @ts-expect-error
throws(() => validateBlendMode(), {
    message: /^blendMode is type 'undefined' not 'string'$/ });
// @ts-expect-error
throws(() => validateBlendMode(123), {
    message: /^blendMode is type 'number' not 'string'$/ });
// @ts-expect-error
throws(() => validateBlendMode('invalid'), {
    message: /^blendMode is not one of 'multiply'\|'normal'\|'overlay'\|'screen'$/ });


// `validateBlendMode()` valid.

validateBlendMode('multiply');
validateBlendMode('normal');
validateBlendMode('overlay');
validateBlendMode('screen');


// `validateColor()` invalid.

// @ts-expect-error
throws(() => validateColor(), {
    message: /^color is type 'undefined' not 'object'$/ });
throws(() => validateColor(null), {
    message: /^color is null, not an object$/ });
// @ts-expect-error
throws(() => validateColor([]), {
    message: /^color is an array, not an object$/ });
// @ts-expect-error
throws(() => validateColor({}), {
    message: /^color is an instance of 'Object' not 'Color'$/ });


// `validateColor()` valid.

validateColor(new Color(0, 0, 0, 0));
validateColor(new Color(255, 255, 255, 1));


// `validateDebugShapeAabb()` invalid.

// @ts-expect-error
throws(() => validateDebugShapeAabb([]), {
    message: /^debugShapeAabb is an array, not an object$/ });
// @ts-expect-error
throws(() => validateDebugShapeAabb({}), {
    message: /^debugShapeAabb is an instance of 'Object' not 'Color'$/ });


// `validateDebugShapeAabb()` valid.

validateDebugShapeAabb(null);
validateDebugShapeAabb(new Color(0, 0, 0, 0));
validateDebugShapeAabb(new Color(255, 255, 255, 1));


// `validateFlip()` invalid.

// @ts-expect-error
throws(() => validateFlip(), {
    message: /^flip is type 'undefined' not 'string'$/ });
// @ts-expect-error
throws(() => validateFlip(123), {
    message: /^flip is type 'number' not 'string'$/ });
// @ts-expect-error
throws(() => validateFlip('invalid'), {
    message: /^flip is not one of 'flip-x'\|'flip-x-and-y'\|'flip-y'\|'no-flip'$/ });

// `validateFlip()` valid.

validateFlip('flip-x');
validateFlip('flip-x-and-y');
validateFlip('flip-y');
validateFlip('no-flip');


// `validatePattern()` invalid.

// @ts-expect-error
throws(() => validatePattern(), {
    message: /^pattern is type 'undefined' not 'string'$/ });
// @ts-expect-error
throws(() => validatePattern(42), {
    message: /^pattern is type 'number' not 'string'$/ });
// @ts-expect-error
throws(() => validatePattern('invalid'), {
    message: /^pattern is not one of 'all-ink'\|'all-paper'\|'breton'\|'pinstripe'$/ });


// `validatePattern()` valid.

validatePattern('all-ink');
validatePattern('all-paper');
validatePattern('breton');
validatePattern('pinstripe');


// `validatePatternRatio()` invalid.

// @ts-expect-error
throws(() => validatePatternRatio(), {
    message: /^patternRatio is type 'undefined' not 'number'$/ });
// @ts-expect-error
throws(() => validatePatternRatio('half'), {
    message: /^patternRatio is type 'string' not 'number'$/ });
throws(() => validatePatternRatio(NaN), {
    message: /^patternRatio NaN is not a valid number$/ });
throws(() => validatePatternRatio(-0.001), {
    message: /^patternRatio -0\.001 is not between 0 and 1$/ });
throws(() => validatePatternRatio(1.5), {
    message: /^patternRatio 1\.5 is not between 0 and 1$/ });


// `validatePatternRatio()` valid.

validatePatternRatio(0);
validatePatternRatio(0.25);
validatePatternRatio(1);


// `validatePatternScale()` invalid.

// @ts-expect-error
throws(() => validatePatternScale(), {
    message: /^patternScale is type 'undefined' not 'number'$/ });
// @ts-expect-error
throws(() => validatePatternScale('big'), {
    message: /^patternScale is type 'string' not 'number'$/ });
throws(() => validatePatternScale(NaN), {
    message: /^patternScale NaN is not a valid number$/ });
throws(() => validatePatternScale(0), {
    message: /^patternScale 0 is not greater than 0$/ });


// `validatePatternScale()` valid.

validatePatternScale(0.5);
validatePatternScale(1);
validatePatternScale(10);


// `validatePatternUnit()` invalid.

// @ts-expect-error
throws(() => validatePatternUnit(), {
    message: /^patternUnit is type 'undefined' not 'string'$/ });
// @ts-expect-error
throws(() => validatePatternUnit(123), {
    message: /^patternUnit is type 'number' not 'string'$/ });
// @ts-expect-error
throws(() => validatePatternUnit('invalid'), {
    message: /^patternUnit is not one of 'pixel'\|'shape'\|'world'$/ });


// `validatePatternUnit()` valid.

validatePatternUnit('pixel');
validatePatternUnit('shape');
validatePatternUnit('world');


// `validatePrimitives()` invalid.

// @ts-expect-error
throws(() => validatePrimitives(), {
    message: /^primitives is type 'undefined' not 'object'$/ });
throws(() => validatePrimitives(null), {
    message: /^primitives is null, not an object$/ });
// @ts-expect-error
throws(() => validatePrimitives({}), {
    message: /^primitives is not an array$/ });
throws(() => validatePrimitives([null]), {
    message: /^primitives\[0\] is null, not an object$/ });
// @ts-expect-error
throws(() => validatePrimitives([{}]), {
    message: /^primitives\[0\] is an instance of 'Object' not 'Primitive'$/ });


// `validatePrimitives()` valid.

const p = new Primitive(
    null, // debugPrimitiveAabb
    'flip-x', // flip
    'union', // joinMode
    'circle', // kind
    0, // rotate
    1, // scale
    { x: 0, y: 0 }, // translate
);
validatePrimitives([]);
validatePrimitives([p]);
validatePrimitives([p, p]);


// `validateRotate()` invalid.

// @ts-expect-error
throws(() => validateRotate(), {
    message: /^rotate type is 'undefined' not 'number'$/ });
// @ts-expect-error
throws(() => validateRotate('3.14'), {
    message: /^rotate type is 'string' not 'number'$/ });
throws(() => validateRotate(NaN), {
    message: /^rotate NaN is not a valid number$/ });


// `validateRotate()` valid.

validateRotate(0);
validateRotate(-3.14);
validateRotate(10);


// `validateScale()` invalid.

// @ts-expect-error
throws(() => validateScale(), {
    message: /^scale is type 'undefined' not 'number'$/ });
// @ts-expect-error
throws(() => validateScale('2'), {
    message: /^scale is type 'string' not 'number'$/ });
throws(() => validateScale(NaN), {
    message: /^scale NaN is not a valid number$/ });
throws(() => validateScale(-1), {
    message: /^scale -1 is less than 0$/ });


// `validateScale()` valid.

validateScale(0);
validateScale(1);
validateScale(3.5);


// `validateStrokePosition()` invalid.

// @ts-expect-error
throws(() => validateStrokePosition(), {
    message: /^strokePosition is type 'undefined' not 'string'$/ });
// @ts-expect-error
throws(() => validateStrokePosition(true), {
    message: /^strokePosition is type 'boolean' not 'string'$/ });
// @ts-expect-error
throws(() => validateStrokePosition('top'), {
    message: /^strokePosition is not one of 'inside'\|'center'\|'outside'$/ });


// `validateStrokePosition()` valid.

validateStrokePosition('inside');
validateStrokePosition('center');
validateStrokePosition('outside');


// `validateStrokeUnit()` invalid.

// @ts-expect-error
throws(() => validateStrokeUnit(), {
    message: /^strokeUnit is type 'undefined' not 'string'$/ });
// @ts-expect-error
throws(() => validateStrokeUnit(123), {
    message: /^strokeUnit is type 'number' not 'string'$/ });
// @ts-expect-error
throws(() => validateStrokeUnit('invalid'), {
    message: /^strokeUnit is not one of 'pixel'\|'shape'\|'world'$/ });


// `validateStrokeUnit()` valid.

validateStrokeUnit('pixel');
validateStrokeUnit('shape');
validateStrokeUnit('world');


// `validateStrokeWidth()` invalid.

// @ts-expect-error
throws(() => validateStrokeWidth(), {
    message: /^strokeWidth type is 'undefined' not 'number'$/ });
// @ts-expect-error
throws(() => validateStrokeWidth('2'), {
    message: /^strokeWidth type is 'string' not 'number'$/ });
throws(() => validateStrokeWidth(NaN), {
    message: /^strokeWidth NaN is not a valid number$/ });
throws(() => validateStrokeWidth(-0.001), {
    message: /^strokeWidth -0\.001 is less than 0$/ });


// `validateStrokeWidth()` valid.

validateStrokeWidth(0);
validateStrokeWidth(1.5);
validateStrokeWidth(100);


// `validateTranslate()` invalid.

// @ts-expect-error
throws(() => validateTranslate(), {
    message: /^translate is type 'undefined' not 'object'$/ });
throws(() => validateTranslate(null), {
    message: /^translate is null, not an object$/ });
// @ts-expect-error
throws(() => validateTranslate([]), {
    message: /^translate is an array, not an object$/ });
throws(() => validateTranslate({ x: NaN, y: 0 }), {
    message: /^translate\.x NaN is not a valid number$/ });


// `validateTranslate()` valid.

validateTranslate({ x: 0, y: 0 });
validateTranslate({ x: -100, y: 200 });
validateTranslate({ x: 1.5, y: -2.5 });


// `validateShape()` invalid.

// @ts-expect-error
throws(() => validateShape(), {
    message: /^shape is type 'undefined' not 'object'$/ });
throws(() => validateShape(null), {
    message: /^shape is null, not an object$/ });
// @ts-expect-error
throws(() => validateShape([]), {
    message: /^shape is an array, not an object$/ });
// @ts-expect-error
throws(() => validateShape({}), {
    message: /^shape is an instance of 'Object' not 'Shape'$/ });
// @ts-expect-error
throws(() => validateShape(new WeakMap(), 'test:'), {
    message: /^test: is an instance of 'WeakMap' not 'Shape'$/ });


// `validateShape()` valid.

const c = new Color(0, 0, 0, 1);
validateShape(
    new Shape(
        'normal', // blendMode
        null, // debugShapeAabb
        'flip-x', // flip
        c, // ink
        c, // paper
        'all-ink', // pattern
        0.5, // patternRatio
        1, // patternScale
        'pixel', // patternUnit
        [p], // primitives
        0, // rotate
        1, // scale
        c, // strokeColor
        'center', // strokePosition
        'pixel', // strokeUnit
        0, // strokeWidth
        { x: 0, y: 0 }, // translate
    )
);


console.log('All shape-validators tests passed.');
