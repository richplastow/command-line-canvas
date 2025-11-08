import { throws, deepEqual as eq } from 'node:assert';
import { Pixel } from '../pixel/pixel.js';
import { Canvas } from './canvas.js';


// `new Canvas` invalid.

const px = new Pixel(12, 255, 56);

// @ts-expect-error
throws(() => new Canvas(), {
    message: /^Canvas: background is type 'undefined' not 'object'$/ });
// @ts-expect-error
throws(() => new Canvas(new Set([])), {
    message: /^Canvas: background is an instance of 'Set' not 'Pixel'$/ });
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


// `new Canvas` valid.

const canvas = new Canvas(px, 2, 4);

eq(canvas, {
    background: {
        r: 12,
        g: 255,
        b: 56,
    },
    xExtent: 2,
    yExtent: 4,
    // #pixels: [
    //     [ { r: 12, g: 34, b: 56 }, { r: 12, g: 34, b: 56 } ],
    //     [ { r: 12, g: 34, b: 56 }, { r: 12, g: 34, b: 56 } ],
    //     [ { r: 12, g: 34, b: 56 }, { r: 12, g: 34, b: 56 } ],
    //     [ { r: 12, g: 34, b: 56 }, { r: 12, g: 34, b: 56 } ],
    // ],
});


// `canvas.render()` invalid.

// @ts-expect-error
throws(() => canvas.render(), {
    message: /^Canvas render\(\): colorDepth is type 'undefined' not 'string'$/ });
// @ts-expect-error
throws(() => canvas.render(24, 'ansi', 'myRender():'), {
    message: /^myRender\(\): colorDepth is type 'number' not 'string'$/ });
// @ts-expect-error
throws(() => canvas.render('16color', 'ansi', 'myRender():'), {
    message: /^myRender\(\): colorDepth is not one of 'monochrome'\|'256color'\|'truecolor'$/ });
// @ts-expect-error
throws(() => canvas.render('256color'), {
    message: /^Canvas render\(\): outputFormat is type 'undefined' not 'string'$/ });
// @ts-expect-error
throws(() => canvas.render('256color', [], 'myRender():'), {
    message: /^myRender\(\): outputFormat is type 'object' not 'string'$/ });
// @ts-expect-error
throws(() => canvas.render('256color', 'invalid', 'myRender():'), {
    message: /^myRender\(\): outputFormat is not one of 'ansi'\|'buffer'\|'html'$/ });


// `canvas.render()` valid.

eq(canvas.render('monochrome', 'ansi'), `
██
██
`.trim());

eq(canvas.render('256color', 'ansi'), `
\x1B[48;5;47m\x1B[38;5;47m▄\x1B[48;5;47m\x1B[38;5;47m▄\x1B[0m
\x1B[48;5;47m\x1B[38;5;47m▄\x1B[48;5;47m\x1B[38;5;47m▄\x1B[0m
`.trim());

eq(canvas.render('truecolor', 'ansi'), `
\x1B[48;2;12;255;56m\x1B[38;2;12;255;56m▄\x1B[48;2;12;255;56m\x1B[38;2;12;255;56m▄\x1B[0m
\x1B[48;2;12;255;56m\x1B[38;2;12;255;56m▄\x1B[48;2;12;255;56m\x1B[38;2;12;255;56m▄\x1B[0m
`.trim());

eq(canvas.render('monochrome', 'buffer'), new Uint8Array([
     12, 255,  56, 255, 12, 255,  56, 255,      12, 255,  56, 255,  12, 255,  56, 255,
     12, 255,  56, 255, 12, 255,  56, 255,      12, 255,  56, 255,  12, 255,  56, 255,
]));

eq(canvas.render('monochrome', 'html'), `
██
██
`.trim());

eq(canvas.render('256color', 'html'), `
<b style="background:rgb(0,255,95);color:rgb(0,255,95)">▄</b><b style="background:rgb(0,255,95);color:rgb(0,255,95)">▄</b>
<b style="background:rgb(0,255,95);color:rgb(0,255,95)">▄</b><b style="background:rgb(0,255,95);color:rgb(0,255,95)">▄</b>
`.trim());

eq(canvas.render('truecolor', 'html'), `
<b style="background:rgb(12,255,56);color:rgb(12,255,56)">▄</b><b style="background:rgb(12,255,56);color:rgb(12,255,56)">▄</b>
<b style="background:rgb(12,255,56);color:rgb(12,255,56)">▄</b><b style="background:rgb(12,255,56);color:rgb(12,255,56)">▄</b>
`.trim());


console.log('All Canvas tests passed.');
