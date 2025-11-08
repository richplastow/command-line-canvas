import { throws } from 'node:assert';
import {
    validateFlip,
    validateJoinMode,
    validateKind,
    validatePrimitive,
    validateRotate,
    validateScale,
    validateTranslate,
} from './primitive-validators.js';
import { Primitive } from './primitive.js';


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

// `validateJoinMode()` invalid.

// @ts-expect-error
throws(() => validateJoinMode(), {
    message: /^joinMode is type 'undefined' not 'string'$/ });
// @ts-expect-error
throws(() => validateJoinMode(123), {
    message: /^joinMode is type 'number' not 'string'$/ });
// @ts-expect-error
throws(() => validateJoinMode('invalid'), {
    message: /^joinMode is not one of 'union'\|'difference'$/ });


// `validateJoinMode()` valid.

validateJoinMode('union');
validateJoinMode('difference');


// `validateKind()` invalid.

// @ts-expect-error
throws(() => validateKind(), {
    message: /^kind is type 'undefined' not 'string'$/ });
// @ts-expect-error
throws(() => validateKind({}), {
    message: /^kind is type 'object' not 'string'$/ });
// @ts-expect-error
throws(() => validateKind('hexagon'), {
    message: /^kind is not one of 'circle'\|'square'\|'triangle-right'$/ });


// `validateKind()` valid.

validateKind('circle');
validateKind('square');
validateKind('triangle-right');


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
validateRotate(-3.14159);
validateRotate(10);


// `validateScale()` invalid.

// @ts-expect-error
throws(() => validateScale(), {
    message: /^scale is type 'undefined' not 'number'$/ });
// @ts-expect-error
throws(() => validateScale('1'), {
    message: /^scale is type 'string' not 'number'$/ });
throws(() => validateScale(NaN), {
    message: /^scale NaN is not a valid number$/ });
throws(() => validateScale(-0.001), {
    message: /^scale -0\.001 is less than 0$/ });


// `validateScale()` valid.

validateScale(0);
validateScale(1);
validateScale(2.5);


// `validateTranslate()` invalid.

// @ts-expect-error
throws(() => validateTranslate(), {
    message: /^translate is type 'undefined' not 'object'$/ });
throws(() => validateTranslate(null), {
    message: /^translate is null, not an object$/ });
// @ts-expect-error
throws(() => validateTranslate([]), {
    message: /^translate is an array, not an object$/ });
// @ts-expect-error
throws(() => validateTranslate({ x: 'not a number', y: 0 }), {
    message: /^translate\.x is type 'string' not 'number'$/ });
throws(() => validateTranslate({ x: NaN, y: 0 }), {
    message: /^translate\.x NaN is not a valid number$/ });
// @ts-expect-error
throws(() => validateTranslate({ x: 0, y: true }), {
    message: /^translate\.y is type 'boolean' not 'number'$/ });
throws(() => validateTranslate({ x: 0, y: NaN }), {
    message: /^translate\.y NaN is not a valid number$/ });


// `validateTranslate()` valid.

validateTranslate({ x: 0, y: 0 });
validateTranslate({ x: -100, y: 200 });
validateTranslate({ x: 1.5, y: -2.5 });


// `validatePrimitive()` invalid.

// @ts-expect-error
throws(() => validatePrimitive(), {
    message: /^primitive is type 'undefined' not 'object'$/ });
throws(() => validatePrimitive(null), {
    message: /^primitive is null, not an object$/ });
// @ts-expect-error
throws(() => validatePrimitive([]), {
    message: /^primitive is an array, not an object$/ });
// @ts-expect-error
throws(() => validatePrimitive({}), {
    message: /^primitive is an instance of 'Object' not 'Primitive'$/ });
// @ts-expect-error
throws(() => validatePrimitive(new Map(), 'test:'), {
    message: /^test: is an instance of 'Map' not 'Primitive'$/ });


// `validatePrimitive()` valid.

validatePrimitive(new Primitive('flip-x', 'union', 'circle', 0, 1,
    { x: 0, y: 0 }));
validatePrimitive(new Primitive('no-flip', 'difference', 'triangle-right', -1.5, 0,
    { x: -10, y: 10 }));


console.log('All primitive-validators tests passed.');
