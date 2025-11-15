import { deepEqual as eq, ok } from 'node:assert';
import { Color } from '../../models/color/color.js';
import { computeFinalPixelValue } from './compute-final-pixel-value.js';

// Helper to normalize RGB bytes to 0..1 floats.
const norm = (r, g, b) => ({ r: r / 255, g: g / 255, b: b / 255 });

// No source alpha returns destination unchanged.
const dst1 = norm(10, 20, 30);
const res1 = computeFinalPixelValue('normal', dst1.b, dst1.g, dst1.r,
    { r: 0, g: 0, b: 0 }, 0, new Color(0, 0, 0, 0), 0);
eq(res1, dst1);

// Fill only, full coverage over black.
const res2 = computeFinalPixelValue('normal', 0, 0, 0,
    { r: 255, g: 0, b: 0 }, 1, new Color(0, 0, 0, 0), 0);
eq(res2, { r: 1, g: 0, b: 0 });

// Stroke only, half opacity over black.
const res3 = computeFinalPixelValue('normal', 0, 0, 0,
    { r: 0, g: 0, b: 0 }, 0, new Color(0, 255, 0, 1), 0.5);
eq(res3, { r: 0, g: 0.5, b: 0 });

// Stroke over fill composites correctly.
const res4 = computeFinalPixelValue('normal', 0, 0, 0,
    { r: 255, g: 0, b: 0 }, 1, new Color(0, 0, 255, 1), 0.5);
ok(res4.r > 0 && res4.b > 0);

// Multiply blend darkens.
const res5 = computeFinalPixelValue('multiply', 0.5, 0.5, 0.5,
    { r: 128, g: 128, b: 128 }, 1, new Color(0, 0, 0, 0), 0);
ok(res5.r < 0.5 && res5.g < 0.5 && res5.b < 0.5);

// Screen blend lightens.
const res6 = computeFinalPixelValue('screen', 0.5, 0.5, 0.5,
    { r: 128, g: 128, b: 128 }, 1, new Color(0, 0, 0, 0), 0);
ok(res6.r > 0.5 && res6.g > 0.5 && res6.b > 0.5);

// Overlay blend at mid-grey equals source.
const res7 = computeFinalPixelValue('overlay', 0.5, 0.5, 0.5,
    { r: 200, g: 100, b: 50 }, 1, new Color(0, 0, 0, 0), 0);
eq(res7.r, 200 / 255);

console.log('All computeFinalPixelValue() tests passed.');
