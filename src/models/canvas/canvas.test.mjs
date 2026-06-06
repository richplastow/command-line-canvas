import { throws, deepEqual as eq } from 'node:assert';
import { Color } from '../color/color.mjs';
import { Canvas } from './canvas.mjs';


const runCanvasCases = () => {

    // Fixtures: a common valid Color instance, and a 2x4 `pixels` array.
    const px = new Color(12, 255, 56, 200);
    const externalPixels = new Uint8ClampedArray(2 * 4 * 4);
    externalPixels.fill(255); // White


    // `new Canvas` invalid.

    // @ts-expect-error
    throws(() => new Canvas(), {
        message: /^Canvas: antiAliasRegion type is 'undefined' not 'number'$/ }, 'Canvas should require antiAliasRegion');
    throws(() => new Canvas(-1, px, 12, 34), {
        message: /^Canvas: antiAliasRegion -1 is less than 0$/ }, 'Canvas should reject negative antiAliasRegion values');
    // @ts-expect-error
    throws(() => new Canvas(0.85), {
        message: /^Canvas: background is type 'undefined' not 'object'$/ }, 'Canvas should require a background color');
    // @ts-expect-error
    throws(() => new Canvas(0.85, new Set([])), {
        message: /^Canvas: background is an instance of 'Set' not 'Color'$/ }, 'Canvas should reject non-Color backgrounds');
    // @ts-expect-error
    throws(() => new Canvas(0.85, px), {
        message: /^Canvas: xExtent type is 'undefined' not 'number'$/ }, 'Canvas should require xExtent');
    throws(() => new Canvas(0.85, px, 3841, 0), {
        message: /^Canvas: xExtent 3841 is greater than 3840$/ }, 'Canvas should reject xExtent values above the maximum');
    // @ts-expect-error
    throws(() => new Canvas(0.85, px, 12, '34'), {
        message: /^Canvas: yExtent type is 'string' not 'number'$/ }, 'Canvas should require numeric yExtent values');
    throws(() => new Canvas(0.85, px, 12, -1), {
        message: /^Canvas: yExtent -1 is less than 1$/ }, 'Canvas should reject yExtent values below one');
    // @ts-expect-error
    throws(() => new Canvas(0.85, px, 12, 34, []), {
        message: /^Canvas: pixels is an array, not a Uint8ClampedArray$/ }, 'Canvas should require external pixels to be a Uint8ClampedArray');
    throws(() => new Canvas(0.85, px, 2, 4, new Uint8ClampedArray(10)), {
        message: /^Canvas: pixels length 10 is not a multiple of 4$/ }, 'Canvas should reject pixel arrays whose length is not a multiple of four');
    throws(() => new Canvas(0.85, px, 2, 4, new Uint8ClampedArray(12)), {
        message: /^Canvas: pixels length 12 does not match dimensions 2x4x4$/ }, 'Canvas should reject pixel arrays whose length does not match the canvas dimensions');


    // `new Canvas` with own pixels, valid.

    const canvasWithOwnPixels = new Canvas(0.85, px, 2, 4);

    eq(canvasWithOwnPixels, {
        antiAliasRegion: 0.85,
        background: {
            r: 12,
            g: 255,
            b: 56,
            a: 200,
        },
        xExtent: 2,
        yExtent: 4,
    }, 'Canvas should expose the provided anti-alias region, background, and extents');


    // `new Canvas` with external pixels, valid.

    eq(externalPixels[0], 255, 'Canvas should not mutate external pixels before construction');

    const canvasWithExternalPixels = new Canvas(0.85, px, 2, 4, externalPixels);

    eq(externalPixels[0], 12, 'Canvas should fill external pixels with the background color during construction'); // `new Canvas` has filled it with background color

    eq(canvasWithExternalPixels.render('monochrome', 'ansi'), `
██
██
`.trim(), 'Canvas render() should encode external pixels to monochrome ANSI output');


    // `canvas.render()` invalid.

    // @ts-expect-error
    throws(() => canvasWithOwnPixels.render(), {
        message: /^Canvas render\(\): colorDepth is type 'undefined' not 'string'$/ }, 'Canvas render() should require colorDepth');
    // @ts-expect-error
    throws(() => canvasWithOwnPixels.render(24, 'ansi', 'myRender():'), {
        message: /^myRender\(\): colorDepth is type 'number' not 'string'$/ }, 'Canvas render() should reject non-string colorDepth values');
    // @ts-expect-error
    throws(() => canvasWithOwnPixels.render('16color', 'ansi', 'myRender():'), {
        message: /^myRender\(\): colorDepth is not one of '256color'\|'8color'\|'monochrome'\|'truecolor'$/ }, 'Canvas render() should reject unsupported color depths');
    // @ts-expect-error
    throws(() => canvasWithOwnPixels.render('256color'), {
        message: /^Canvas render\(\): outputFormat is type 'undefined' not 'string'$/ }, 'Canvas render() should require outputFormat');
    // @ts-expect-error
    throws(() => canvasWithOwnPixels.render('256color', [], 'myRender():'), {
        message: /^myRender\(\): outputFormat is type 'object' not 'string'$/ }, 'Canvas render() should reject non-string output formats');
    // @ts-expect-error
    throws(() => canvasWithOwnPixels.render('256color', 'invalid', 'myRender():'), {
        message: /^myRender\(\): outputFormat is not one of 'ansi'\|'braille'\|'buffer'\|'html'$/ }, 'Canvas render() should reject unsupported output formats');


    // `canvas.render()` valid.

    eq(canvasWithOwnPixels.render('monochrome', 'ansi'), `
██
██
`.trim(), 'Canvas render() should encode monochrome ANSI output from owned pixels');

    eq(canvasWithOwnPixels.render('256color', 'ansi'), `
\x1B[48;5;47m\x1B[38;5;47m▄\x1B[48;5;47m\x1B[38;5;47m▄\x1B[0m
\x1B[48;5;47m\x1B[38;5;47m▄\x1B[48;5;47m\x1B[38;5;47m▄\x1B[0m
`.trim(), 'Canvas render() should encode 256-color ANSI output from owned pixels');

    eq(canvasWithOwnPixels.render('8color', 'ansi'), `
\x1B[42m\x1B[32m▄\x1B[42m\x1B[32m▄\x1B[0m
\x1B[42m\x1B[32m▄\x1B[42m\x1B[32m▄\x1B[0m
`.trim(), 'Canvas render() should encode 8-color ANSI output from owned pixels');

    eq(canvasWithOwnPixels.render('truecolor', 'ansi'), `
\x1B[48;2;12;255;56m\x1B[38;2;12;255;56m▄\x1B[48;2;12;255;56m\x1B[38;2;12;255;56m▄\x1B[0m
\x1B[48;2;12;255;56m\x1B[38;2;12;255;56m▄\x1B[48;2;12;255;56m\x1B[38;2;12;255;56m▄\x1B[0m
`.trim(), 'Canvas render() should encode truecolor ANSI output from owned pixels');

    eq(canvasWithOwnPixels.render('monochrome', 'braille'), `
⢸⢸
⢸⢸
`.trim(), 'Canvas render() should encode monochrome Braille output from owned pixels');

    eq(canvasWithOwnPixels.render('8color', 'braille'), `
⢸⢸
⢸⢸
`.trim(), 'Canvas render() should encode 8-color Braille output from owned pixels');

    eq(canvasWithOwnPixels.render('monochrome', 'buffer'), new Uint8Array([
         12, 255,  56, 200, 12, 255,  56, 200,      12, 255,  56, 200,  12, 255,  56, 200,
         12, 255,  56, 200, 12, 255,  56, 200,      12, 255,  56, 200,  12, 255,  56, 200,
    ]), 'Canvas render() should encode monochrome buffer output from owned pixels');

    eq(canvasWithOwnPixels.render('8color', 'buffer'), new Uint8Array([
         12, 255,  56, 200, 12, 255,  56, 200,      12, 255,  56, 200,  12, 255,  56, 200,
         12, 255,  56, 200, 12, 255,  56, 200,      12, 255,  56, 200,  12, 255,  56, 200,
    ]), 'Canvas render() should encode 8-color buffer output from owned pixels');

    eq(canvasWithOwnPixels.render('monochrome', 'html'), `
██
██
`.trim(), 'Canvas render() should encode monochrome HTML output from owned pixels');

    eq(canvasWithOwnPixels.render('256color', 'html'), `
<b style="background:rgb(0,255,95);color:rgb(0,255,95)">▄</b><b style="background:rgb(0,255,95);color:rgb(0,255,95)">▄</b>
<b style="background:rgb(0,255,95);color:rgb(0,255,95)">▄</b><b style="background:rgb(0,255,95);color:rgb(0,255,95)">▄</b>
`.trim(), 'Canvas render() should encode 256-color HTML output from owned pixels');

    eq(canvasWithOwnPixels.render('8color', 'html'), `
<b style="background:rgb(0,255,0);color:rgb(0,255,0)">▄</b><b style="background:rgb(0,255,0);color:rgb(0,255,0)">▄</b>
<b style="background:rgb(0,255,0);color:rgb(0,255,0)">▄</b><b style="background:rgb(0,255,0);color:rgb(0,255,0)">▄</b>
`.trim(), 'Canvas render() should encode 8-color HTML output from owned pixels');

    eq(canvasWithOwnPixels.render('truecolor', 'html'), `
<b style="background:rgb(12,255,56);color:rgb(12,255,56)">▄</b><b style="background:rgb(12,255,56);color:rgb(12,255,56)">▄</b>
<b style="background:rgb(12,255,56);color:rgb(12,255,56)">▄</b><b style="background:rgb(12,255,56);color:rgb(12,255,56)">▄</b>
`.trim(), 'Canvas render() should encode truecolor HTML output from owned pixels');

};

export const testCanvas = () => {
    runCanvasCases();
    console.log('OK: All Canvas tests passed!');
};
