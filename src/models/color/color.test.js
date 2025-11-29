import { throws, deepEqual as eq } from 'node:assert';
import { Color } from './color.js';


// `new Color` invalid.

// @ts-expect-error
throws(() => new Color(), {
    message: /^Color: r \(red\) type is 'undefined' not 'number'$/ });
throws(() => new Color(256, 0, 0, 1), {
    message: /^Color: r \(red\) 256 is greater than 255$/ });
// @ts-expect-error
throws(() => new Color(0, '77', 0, 1), {
    message: /^Color: g \(green\) type is 'string' not 'number'$/ });
throws(() => new Color(0, -0.001, 0, 1), {
    message: /^Color: g \(green\) -0\.001 is less than 0$/ });
throws(() => new Color(0, 0, NaN, 1), {
    message: /^Color: b \(blue\) NaN is not a valid number$/ });
// @ts-expect-error
throws(() => new Color(0, 0, 0), {
    message: /^Color: a \(alpha\) type is 'undefined' not 'number'$/ });
throws(() => new Color(0, 0, 0, 255.001), {
    message: /^Color: a \(alpha\) 255\.001 is greater than 255$/ });
throws(() => new Color(0, 0, 0, -0.1), {
    message: /^Color: a \(alpha\) -0\.1 is less than 0$/ });


// `new Color` valid.

eq(new Color(0, 12.34, 255, 128), { r: 0, g: 12.34, b: 255, a: 128 });
eq(new Color(100, 150, 200, 0), { r: 100, g: 150, b: 200, a: 0 });
eq(new Color(255, 255, 255, 255), { r: 255, g: 255, b: 255, a: 255 });


console.log('All Color tests passed.');
