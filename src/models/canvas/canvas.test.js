import { throws, deepEqual as eq } from 'node:assert';
import { Color } from '../color/color.js';
import { Canvas } from './canvas.js';

// Fixtures: a common valid Color instance, and a 2x4 `pixels` array.
const px = new Color(12, 255, 56, 200);
const externalPixels = new Uint8ClampedArray(2 * 4 * 4);
externalPixels.fill(255); // White


// `new Canvas` invalid.

// @ts-expect-error
throws(() => new Canvas(), {
    message: /^Canvas: background is type 'undefined' not 'object'$/ });
// @ts-expect-error
throws(() => new Canvas(new Set([])), {
    message: /^Canvas: background is an instance of 'Set' not 'Color'$/ });
// @ts-expect-error
throws(() => new Canvas(px), {
    message: /^Canvas: xExtent type is 'undefined' not 'number'$/ });
throws(() => new Canvas(px, 3841, 0), {
    message: /^Canvas: xExtent 3841 is greater than 3840$/ });
// @ts-expect-error
throws(() => new Canvas(px, 12, '34'), {
    message: /^Canvas: yExtent type is 'string' not 'number'$/ });
throws(() => new Canvas(px, 12, -1), {
    message: /^Canvas: yExtent -1 is less than 1$/ });
// @ts-expect-error
throws(() => new Canvas(px, 12, 34, []), {
    message: /^Canvas: pixels is an array, not a Uint8ClampedArray$/ });
throws(() => new Canvas(px, 2, 4, new Uint8ClampedArray(10)), {
    message: /^Canvas: pixels length 10 is not a multiple of 4$/ });
throws(() => new Canvas(px, 2, 4, new Uint8ClampedArray(12)), {
    message: /^Canvas: pixels length 12 does not match dimensions 2x4x4$/ });


// `new Canvas` with own pixels, valid.

const canvasWithOwnPixels = new Canvas(px, 2, 4);

eq(canvasWithOwnPixels, {
    background: {
        r: 12,
        g: 255,
        b: 56,
        a: 200,
    },
    xExtent: 2,
    yExtent: 4,
});


// `new Canvas` with external pixels, valid.

eq(externalPixels[0], 255);

const canvasWithExternalPixels = new Canvas(px, 2, 4, externalPixels);

eq(externalPixels[0], 12); // `new Canvas` has filled it with background color

eq(canvasWithExternalPixels.render('monochrome', 'ansi'), `
██
██
`.trim());


// `canvas.render()` invalid.

// @ts-expect-error
throws(() => canvasWithOwnPixels.render(), {
    message: /^Canvas render\(\): colorDepth is type 'undefined' not 'string'$/ });
// @ts-expect-error
throws(() => canvasWithOwnPixels.render(24, 'ansi', 'myRender():'), {
    message: /^myRender\(\): colorDepth is type 'number' not 'string'$/ });
// @ts-expect-error
throws(() => canvasWithOwnPixels.render('16color', 'ansi', 'myRender():'), {
    message: /^myRender\(\): colorDepth is not one of '256color'\|'8color'\|'monochrome'\|'truecolor'$/ });
// @ts-expect-error
throws(() => canvasWithOwnPixels.render('256color'), {
    message: /^Canvas render\(\): outputFormat is type 'undefined' not 'string'$/ });
// @ts-expect-error
throws(() => canvasWithOwnPixels.render('256color', [], 'myRender():'), {
    message: /^myRender\(\): outputFormat is type 'object' not 'string'$/ });
// @ts-expect-error
throws(() => canvasWithOwnPixels.render('256color', 'invalid', 'myRender():'), {
    message: /^myRender\(\): outputFormat is not one of 'ansi'\|'braille'\|'buffer'\|'html'$/ });


// `canvas.render()` valid.

eq(canvasWithOwnPixels.render('monochrome', 'ansi'), `
██
██
`.trim());

eq(canvasWithOwnPixels.render('256color', 'ansi'), `
\x1B[48;5;47m\x1B[38;5;47m▄\x1B[48;5;47m\x1B[38;5;47m▄\x1B[0m
\x1B[48;5;47m\x1B[38;5;47m▄\x1B[48;5;47m\x1B[38;5;47m▄\x1B[0m
`.trim());

eq(canvasWithOwnPixels.render('8color', 'ansi'), `
\x1B[42m\x1B[32m▄\x1B[42m\x1B[32m▄\x1B[0m
\x1B[42m\x1B[32m▄\x1B[42m\x1B[32m▄\x1B[0m
`.trim());

eq(canvasWithOwnPixels.render('truecolor', 'ansi'), `
\x1B[48;2;12;255;56m\x1B[38;2;12;255;56m▄\x1B[48;2;12;255;56m\x1B[38;2;12;255;56m▄\x1B[0m
\x1B[48;2;12;255;56m\x1B[38;2;12;255;56m▄\x1B[48;2;12;255;56m\x1B[38;2;12;255;56m▄\x1B[0m
`.trim());

eq(canvasWithOwnPixels.render('monochrome', 'braille'), `
⢸⢸
⢸⢸
`.trim());

eq(canvasWithOwnPixels.render('8color', 'braille'), `
⢸⢸
⢸⢸
`.trim());

eq(canvasWithOwnPixels.render('monochrome', 'buffer'), new Uint8Array([
     12, 255,  56, 200, 12, 255,  56, 200,      12, 255,  56, 200,  12, 255,  56, 200,
     12, 255,  56, 200, 12, 255,  56, 200,      12, 255,  56, 200,  12, 255,  56, 200,
]));

eq(canvasWithOwnPixels.render('8color', 'buffer'), new Uint8Array([
     12, 255,  56, 200, 12, 255,  56, 200,      12, 255,  56, 200,  12, 255,  56, 200,
     12, 255,  56, 200, 12, 255,  56, 200,      12, 255,  56, 200,  12, 255,  56, 200,
]));

eq(canvasWithOwnPixels.render('monochrome', 'html'), `
██
██
`.trim());

eq(canvasWithOwnPixels.render('256color', 'html'), `
<b style="background:rgb(0,255,95);color:rgb(0,255,95)">▄</b><b style="background:rgb(0,255,95);color:rgb(0,255,95)">▄</b>
<b style="background:rgb(0,255,95);color:rgb(0,255,95)">▄</b><b style="background:rgb(0,255,95);color:rgb(0,255,95)">▄</b>
`.trim());

eq(canvasWithOwnPixels.render('8color', 'html'), `
<b style="background:rgb(0,255,0);color:rgb(0,255,0)">▄</b><b style="background:rgb(0,255,0);color:rgb(0,255,0)">▄</b>
<b style="background:rgb(0,255,0);color:rgb(0,255,0)">▄</b><b style="background:rgb(0,255,0);color:rgb(0,255,0)">▄</b>
`.trim());

eq(canvasWithOwnPixels.render('truecolor', 'html'), `
<b style="background:rgb(12,255,56);color:rgb(12,255,56)">▄</b><b style="background:rgb(12,255,56);color:rgb(12,255,56)">▄</b>
<b style="background:rgb(12,255,56);color:rgb(12,255,56)">▄</b><b style="background:rgb(12,255,56);color:rgb(12,255,56)">▄</b>
`.trim());


console.log('All Canvas tests passed.');
