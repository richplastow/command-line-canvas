import { throws, deepEqual as eq } from 'node:assert';
import { Pixel } from '../pixel/pixel.js';
import { Canvas } from './canvas.js';


// `new Canvas` invalid.

const px = new Pixel(12, 34, 56);

// @ts-expect-error
throws(() => new Canvas(), {
    message: /^Canvas: background is type 'undefined' not 'object'$/ });
// @ts-expect-error
throws(() => new Canvas(new Set([])), {
    message: /^Canvas: background is an instance of 'Set' not 'Pixel'$/ });
// @ts-expect-error
throws(() => new Canvas(px), {
    message: /^Canvas: xExtent type is 'undefined' not 'number'$/ });
throws(() => new Canvas(px, 256, 0), {
    message: /^Canvas: xExtent 256 is greater than 255$/ });
// @ts-expect-error
throws(() => new Canvas(px, 12, '34'), {
    message: /^Canvas: yExtent type is 'string' not 'number'$/ });
throws(() => new Canvas(px, 12, -1), {
    message: /^Canvas: yExtent -1 is less than 1$/ });


// `new Canvas` valid.

eq(new Canvas(px, 12, 34), {
  background: {
    b: 56,
    g: 34,
    r: 12
  },
  xExtent: 12,
  yExtent: 34
});

console.log(`All Canvas tests passed.`);
