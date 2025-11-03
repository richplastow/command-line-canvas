import { throws, deepEqual as eq } from 'node:assert';
import { Pixel } from './pixel.js';


// `new Pixel` invalid.

// @ts-expect-error
throws(() => new Pixel(), {
    message: /^Pixel: r \(red\) type is 'undefined' not 'number'$/ });
throws(() => new Pixel(256, 0, 0), {
    message: /^Pixel: r \(red\) 256 is greater than 255$/ });
// @ts-expect-error
throws(() => new Pixel(0, '77', 0), {
    message: /^Pixel: g \(green\) type is 'string' not 'number'$/ });
throws(() => new Pixel(0, -0.001, 0), {
    message: /^Pixel: g \(green\) -0\.001 is less than 0$/ });
throws(() => new Pixel(0, 0, NaN), {
    message: /^Pixel: b \(blue\) NaN is not a valid number$/ });


// `new Pixel` valid.

eq(new Pixel(0, 12.34, 255), { r: 0, g: 12.34, b: 255 });

console.log(`All Pixel tests passed.`);
