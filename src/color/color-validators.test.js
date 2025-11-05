import { throws } from 'node:assert';
import {
    validateAlpha,
    validateRgb,
    validateColor,
} from './color-validators.js';
import { Color } from './color.js';


// `validateAlpha()` invalid.

// @ts-expect-error
throws(() => validateAlpha(), {
    message: /^alpha type is 'undefined' not 'number'$/ });
// @ts-expect-error
throws(() => validateAlpha('0.5'), {
    message: /^alpha type is 'string' not 'number'$/ });
throws(() => validateAlpha(NaN), {
    message: /^alpha NaN is not a valid number$/ });
throws(() => validateAlpha(-0.001), {
    message: /^alpha -0\.001 is less than 0$/ });
throws(() => validateAlpha(1.001), {
    message: /^alpha 1\.001 is greater than 1$/ });
throws(() => validateAlpha(2, 'test:'), {
    message: /^test: 2 is greater than 1$/ });


// `validateAlpha()` valid.

validateAlpha(0);
validateAlpha(0.5);
validateAlpha(1);


// `validateRgb()` invalid.

// @ts-expect-error
throws(() => validateRgb(), {
    message: /^rgb type is 'undefined' not 'number'$/ });
// @ts-expect-error
throws(() => validateRgb('128'), {
    message: /^rgb type is 'string' not 'number'$/ });
throws(() => validateRgb(NaN), {
    message: /^rgb NaN is not a valid number$/ });
throws(() => validateRgb(-0.001), {
    message: /^rgb -0\.001 is less than 0$/ });
throws(() => validateRgb(255.001), {
    message: /^rgb 255\.001 is greater than 255$/ });
throws(() => validateRgb(256, 'test:'), {
    message: /^test: 256 is greater than 255$/ });


// `validateRgb()` valid.

validateRgb(0);
validateRgb(127.5);
validateRgb(255);


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
validateColor(new Color(128, 128, 128, 0.5));
validateColor(new Color(255, 255, 255, 1));


console.log('All color-validators tests passed.');
