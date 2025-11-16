import { throws, deepEqual as eq } from 'node:assert';
import { Pixel } from '../../models/pixel/pixel.js';
import { encodeHtml } from './encode-html.js';


const good2x5Pixels = [
    // Black and white.
    [ new Pixel(  0,   0,   0), new Pixel(255, 255, 255)],
    // Yellow and red.
    [ new Pixel(255, 255,   0), new Pixel(255,   0,   0)],
    // Both green, left just above, right just below threshold.
    [ new Pixel(  0, 181,   0), new Pixel(  0, 179,   0)],
    // Both grey, just above and just below threshold.
    [ new Pixel(128, 128, 128), new Pixel(129, 129, 129)],
    // And an extra row, out of bounds, to ensure it's ignored.
    [ new Pixel(255,   0, 255), new Pixel(  0, 255, 255)],
];


// `encodeHtml()` invalid.

throws(() => encodeHtml(
    { xMin: 0, xMax: 1.5, yMin: 0, yMax: 1.23 },
    'monochrome',
    good2x5Pixels,
    'myFn():'
), { message: /^myFn\(\): bounds\.xMax 1\.5 is not an integer$/ });
eq(encodeHtml(
    { xMin: 0, xMax: 1.5, yMin: 0, yMax: 0.123 }, // despite invalid bounds...
    'monochrome',
    good2x5Pixels,
    'myFn():',
    true, // ...skips validation...
), '▄▀'); // ...so this works

throws(() => encodeHtml(
    { xMin: 0, xMax: 2, yMin: 0, yMax: 2 },
    // @ts-expect-error
    'nope!',
    good2x5Pixels,
    'myFn():',
    true,
), { message: /^myFn\(\): cannot skip invalid colorDepth$/ });

throws(() => encodeHtml(
    { xMin: 0, xMax: 2, yMin: 0, yMax: 2 },
    // @ts-expect-error
    'nope',
    good2x5Pixels,
), { message: /^encodeHtml\(\): colorDepth is not one of '256color'\|'8color'\|'monochrome'\|'truecolor'$/ });

throws(() => encodeHtml(
    { xMin: 0, xMax: 2, yMin: 0, yMax: 2 },
    '256color',
    // @ts-expect-error
    [[new Date(), {}], [{}, {}]],
), { message: /^encodeHtml\(\): pixels\[0\]\[0\] is an instance of 'Date' not 'Pixel'$/ });

throws(() => encodeHtml(
    { xMin: 2, xMax: 4, yMin: 0, yMax: 2 },
    'monochrome',
    good2x5Pixels,
    'test():'
), { message: /^test\(\): bounds\.xMin 2 exceeds pixels extentX 2$/ });

throws(() => encodeHtml(
    { xMin: 0, xMax: 3, yMin: 0, yMax: 2 },
    'monochrome',
    good2x5Pixels,
    'test():'
), { message: /^test\(\): bounds\.xMax 3 exceeds pixels extentX 2$/ });

throws(() => encodeHtml(
    { xMin: 0, xMax: 1, yMin: 6, yMax: 8 },
    'monochrome',
    good2x5Pixels,
    'test():'
), { message: /^test\(\): bounds\.yMin 6 exceeds pixels extentY 5$/ });

throws(() => encodeHtml(
    { xMin: 0, xMax: 1, yMin: 1, yMax: 7 },
    'monochrome',
    good2x5Pixels,
    'test():'
), { message: /^test\(\): bounds\.yMax 7 exceeds pixels extentY 5$/ });


// `encodeHtml()` valid.

eq(encodeHtml(
    { xMin: 0, xMax: 2, yMin: 0, yMax: 4 },
    'monochrome',
    good2x5Pixels,
),`
▄▀
▀▄
`.trim());

eq(encodeHtml(
    { xMin: 0, xMax: 2, yMin: 0, yMax: 4 },
    '256color',
    good2x5Pixels,
), `
<b style="background:rgb(0,0,0);color:rgb(255,255,0)">▄</b><b style="background:rgb(255,255,255);color:rgb(255,0,0)">▄</b>
<b style="background:rgb(0,215,0);color:rgb(175,175,175)">▄</b><b style="background:rgb(0,215,0);color:rgb(175,175,175)">▄</b>
`.trim());

eq(encodeHtml(
    { xMin: 0, xMax: 2, yMin: 0, yMax: 4 },
    '8color',
    good2x5Pixels,
), `
<b style="background:rgb(0,0,0);color:rgb(255,255,0)">▄</b><b style="background:rgb(255,255,255);color:rgb(255,0,0)">▄</b>
<b style="background:rgb(0,255,0);color:rgb(255,255,255)">▄</b><b style="background:rgb(0,255,0);color:rgb(255,255,255)">▄</b>
`.trim());

eq(encodeHtml(
    { xMin: 0, xMax: 2, yMin: 0, yMax: 4 },
    'truecolor',
    good2x5Pixels,
), `
<b style="background:rgb(0,0,0);color:rgb(255,255,0)">▄</b><b style="background:rgb(255,255,255);color:rgb(255,0,0)">▄</b>
<b style="background:rgb(0,181,0);color:rgb(128,128,128)">▄</b><b style="background:rgb(0,179,0);color:rgb(129,129,129)">▄</b>
`.trim());


console.log('All encodeHtml() tests passed.');
