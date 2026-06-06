import { throws, deepEqual as eq } from 'node:assert';
import { Color } from '../../models/color/color.mjs';
import { encodeHtml } from './encode-html.mjs';


const runEncodeHtmlCases = () => {

    const good2x5Pixels = new Uint8ClampedArray([
        // Black and white.
        0, 0, 0, 255,          255, 255, 255, 255,
        // Yellow and red.
        255, 255, 0, 255,      255, 0, 0, 255,
        // Both green, left just above, right just below threshold.
        0, 181, 0, 255,        0, 179, 0, 255,
        // Both grey, just above and just below threshold.
        128, 128, 128, 255,    129, 129, 129, 255,
        // And an extra row, out of bounds, to ensure it's ignored.
        255, 0, 255, 255,      0, 255, 255, 255,
    ]);


    // `encodeHtml()` invalid.

    throws(() => encodeHtml(
        { xMin: 0, xMax: 1.5, yMin: 0, yMax: 1.23 },
        2,
        'monochrome',
        good2x5Pixels,
        'myFn():'
    ), { message: /^myFn\(\): bounds\.xMax 1\.5 is not an integer$/ }, 'encodeHtml() should reject non-integer bounds during validation');
    eq(encodeHtml(
        { xMin: 0, xMax: 1.5, yMin: 0, yMax: 0.123 }, // despite invalid bounds...
        2,
        'monochrome',
        good2x5Pixels,
        'myFn():',
        true, // ...skips validation...
    ), '▄▀', 'encodeHtml() should render even with invalid bounds when validation is skipped'); // ...so this works

    throws(() => encodeHtml(
        { xMin: 0, xMax: 2, yMin: 0, yMax: 2 },
        2,
        // @ts-expect-error
        'nope!',
        good2x5Pixels,
        'myFn():',
        true,
    ), { message: /^myFn\(\): cannot skip invalid colorDepth$/ }, 'encodeHtml() should not allow validation skipping with an invalid color depth');

    throws(() => encodeHtml(
        { xMin: 0, xMax: 2, yMin: 0, yMax: 2 },
        2,
        // @ts-expect-error
        'nope',
        good2x5Pixels,
    ), { message: /^encodeHtml\(\): colorDepth is not one of '256color'\|'8color'\|'monochrome'\|'truecolor'$/ }, 'encodeHtml() should reject unsupported color depths');

    throws(() => encodeHtml(
        { xMin: 0, xMax: 2, yMin: 0, yMax: 2 },
        2,
        '256color',
        // @ts-expect-error
        [[new Date(), {}], [{}, {}]],
    ), { message: /^encodeHtml\(\): pixels is an array, not a Uint8ClampedArray$/ }, 'encodeHtml() should require pixels to be a Uint8ClampedArray');

    throws(() => encodeHtml(
        { xMin: 2, xMax: 4, yMin: 0, yMax: 2 },
        2,
        'monochrome',
        good2x5Pixels,
        'test():'
    ), { message: /^test\(\): bounds\.xMin 2 exceeds pixels extentX 2$/ }, 'encodeHtml() should reject bounds whose xMin exceeds the pixel width');

    throws(() => encodeHtml(
        { xMin: 0, xMax: 3, yMin: 0, yMax: 2 },
        2,
        'monochrome',
        good2x5Pixels,
        'test():'
    ), { message: /^test\(\): bounds\.xMax 3 exceeds pixels extentX 2$/ }, 'encodeHtml() should reject bounds whose xMax exceeds the pixel width');

    throws(() => encodeHtml(
        { xMin: 0, xMax: 1, yMin: 6, yMax: 8 },
        2,
        'monochrome',
        good2x5Pixels,
        'test():'
    ), { message: /^test\(\): bounds\.yMin 6 exceeds pixels extentY 5$/ }, 'encodeHtml() should reject bounds whose yMin exceeds the pixel height');

    throws(() => encodeHtml(
        { xMin: 0, xMax: 1, yMin: 1, yMax: 7 },
        2,
        'monochrome',
        good2x5Pixels,
        'test():'
    ), { message: /^test\(\): bounds\.yMax 7 exceeds pixels extentY 5$/ }, 'encodeHtml() should reject bounds whose yMax exceeds the pixel height');


    // `encodeHtml()` valid.

    eq(encodeHtml(
        { xMin: 0, xMax: 2, yMin: 0, yMax: 4 },
        2,
        'monochrome',
        good2x5Pixels,
    ),`
▄▀
▀▄
`.trim(), 'encodeHtml() should encode monochrome pixels as half-block characters');

    eq(encodeHtml(
        { xMin: 0, xMax: 2, yMin: 0, yMax: 4 },
        2,
        '256color',
        good2x5Pixels,
    ), `
<b style="background:rgb(0,0,0);color:rgb(255,255,0)">▄</b><b style="background:rgb(255,255,255);color:rgb(255,0,0)">▄</b>
<b style="background:rgb(0,215,0);color:rgb(175,175,175)">▄</b><b style="background:rgb(0,215,0);color:rgb(175,175,175)">▄</b>
`.trim(), 'encodeHtml() should encode 256-color pixels with quantized HTML styles');

    eq(encodeHtml(
        { xMin: 0, xMax: 2, yMin: 0, yMax: 4 },
        2,
        '8color',
        good2x5Pixels,
    ), `
<b style="background:rgb(0,0,0);color:rgb(255,255,0)">▄</b><b style="background:rgb(255,255,255);color:rgb(255,0,0)">▄</b>
<b style="background:rgb(0,255,0);color:rgb(255,255,255)">▄</b><b style="background:rgb(0,255,0);color:rgb(255,255,255)">▄</b>
`.trim(), 'encodeHtml() should encode 8-color pixels with HTML styles');

    eq(encodeHtml(
        { xMin: 0, xMax: 2, yMin: 0, yMax: 4 },
        2,
        'truecolor',
        good2x5Pixels,
    ), `
<b style="background:rgb(0,0,0);color:rgb(255,255,0)">▄</b><b style="background:rgb(255,255,255);color:rgb(255,0,0)">▄</b>
<b style="background:rgb(0,181,0);color:rgb(128,128,128)">▄</b><b style="background:rgb(0,179,0);color:rgb(129,129,129)">▄</b>
`.trim(), 'encodeHtml() should preserve truecolor channel values in HTML output');

};

export const testEncodeHtml = () => {
    runEncodeHtmlCases();
    console.log('OK: All encodeHtml() tests passed!');
};
