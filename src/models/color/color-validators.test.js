import { throws } from 'node:assert';
import {
    validateRgba,
    validateColor,
} from './color-validators.js';
import { Color } from './color.js';


// `validateRgba()` invalid.

// @ts-expect-error
throws(() => validateRgba(), {
    message: /^rgba type is 'undefined' not 'number'$/ });
// @ts-expect-error
throws(() => validateRgba('128'), {
    message: /^rgba type is 'string' not 'number'$/ });
throws(() => validateRgba(NaN), {
    message: /^rgba NaN is not a valid number$/ });
throws(() => validateRgba(-0.001), {
    message: /^rgba -0\.001 is less than 0$/ });
throws(() => validateRgba(255.001), {
    message: /^rgba 255\.001 is greater than 255$/ });
throws(() => validateRgba(256, 'test:'), {
    message: /^test: 256 is greater than 255$/ });


// `validateRgba()` valid.

validateRgba(0);
validateRgba(127.5);
validateRgba(255);


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
// @ts-expect-error
throws(() => validateColor(new Set(), 'test:'), {
    message: /^test: is an instance of 'Set' not 'Color'$/ });


// `validateColor()` valid.

validateColor(new Color(0, 0, 0, 0));
validateColor(new Color(128, 128, 128, 128));
validateColor(new Color(255, 255, 255, 255));


console.log('All color-validators tests passed.');
