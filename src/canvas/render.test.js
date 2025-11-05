import { throws, deepEqual as eq } from 'node:assert';
import { Pixel } from '../pixel/pixel.js';
import { render } from './render.js';


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


// `render()` invalid.

throws(() => render(
    { xMin: 0, xMax: 1.5, yMin: 0, yMax: 1.23 },
    'monochrome',
    good2x5Pixels,
    'myFn():'
), { message: /^myFn\(\): bounds\.xMax 1\.5 is not an integer$/ });
eq(render(
    { xMin: 0, xMax: 1.5, yMin: 0, yMax: 0.123 }, // despite invalid bounds...
    'monochrome',
    good2x5Pixels,
    'myFn():',
    true, // ...skips validation...
), '▄▀'); // ...so this works

throws(() => render(
    { xMin: 0, xMax: 2, yMin: 0, yMax: 2 },
    // @ts-expect-error
    'nope!',
    good2x5Pixels,
    'myFn():',
    true,
), { message: /^myFn\(\): cannot skip invalid colorDepth$/ });

throws(() => render(
    { xMin: 0, xMax: 2, yMin: 0, yMax: 2 },
    // @ts-expect-error
    'nope',
    good2x5Pixels,
), { message: /^render\(\): colorDepth is not one of 'monochrome'\|'256color'\|'truecolor'$/ });

throws(() => render(
    { xMin: 0, xMax: 2, yMin: 0, yMax: 2 },
    '256color',
    // @ts-expect-error
    [[new Date(), {}], [{}, {}]],
), { message: /^render\(\): pixels\[0\]\[0\] is an instance of 'Date' not 'Pixel'$/ });

throws(() => render(
    { xMin: 2, xMax: 4, yMin: 0, yMax: 2 },
    'monochrome',
    good2x5Pixels,
    'test():'
), { message: /^test\(\): bounds\.xMin 2 exceeds pixels extentX 2$/ });

throws(() => render(
    { xMin: 0, xMax: 3, yMin: 0, yMax: 2 },
    'monochrome',
    good2x5Pixels,
    'test():'
), { message: /^test\(\): bounds\.xMax 3 exceeds pixels extentX 2$/ });

throws(() => render(
    { xMin: 0, xMax: 1, yMin: 6, yMax: 8 },
    'monochrome',
    good2x5Pixels,
    'test():'
), { message: /^test\(\): bounds\.yMin 6 exceeds pixels extentY 5$/ });

throws(() => render(
    { xMin: 0, xMax: 1, yMin: 1, yMax: 7 },
    'monochrome',
    good2x5Pixels,
    'test():'
), { message: /^test\(\): bounds\.yMax 7 exceeds pixels extentY 5$/ });


// `render()` valid.

eq(render(
    { xMin: 0, xMax: 2, yMin: 0, yMax: 4 },
    'monochrome',
    good2x5Pixels,
),`
▄▀
▀▄
`.trim());

eq(render(
    { xMin: 0, xMax: 2, yMin: 0, yMax: 4 },
    '256color',
    good2x5Pixels,
), `
\x1B[48;5;16m\x1B[38;5;226m▄\x1B[48;5;231m\x1B[38;5;196m▄\x1B[0m
\x1B[48;5;40m\x1B[38;5;145m▄\x1B[48;5;40m\x1B[38;5;145m▄\x1B[0m
`.trim());

eq(render(
    { xMin: 0, xMax: 2, yMin: 0, yMax: 4 },
    'truecolor',
    good2x5Pixels,
), `
\x1B[48;2;0;0;0m\x1B[38;2;255;255;0m▄\x1B[48;2;255;255;255m\x1B[38;2;255;0;0m▄\x1B[0m
\x1B[48;2;0;181;0m\x1B[38;2;128;128;128m▄\x1B[48;2;0;179;0m\x1B[38;2;129;129;129m▄\x1B[0m
`.trim());


console.log('All render() tests passed.');
