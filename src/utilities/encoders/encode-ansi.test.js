import { throws, deepEqual as eq } from 'node:assert';
import { encodeAnsi } from './encode-ansi.js';


const good2x5Pixels = new Uint8ClampedArray([
    // Black and white.
    0, 0, 0, 255,         255, 255, 255, 255,
    // Yellow and red.
    255, 255, 0, 255,     255, 0, 0, 255,
    // Both green, left just above, right just below monochrome-threshold.
    0, 181, 0, 255,       0, 179, 0, 255,
    // Both grey, just above and just below monochrome-threshold.
    128, 128, 128, 255,   129, 129, 129, 255,
    // And an extra row, out of bounds, to ensure it's ignored.
    255, 0, 255, 255,     0, 255, 255, 255,
]);


// `encodeAnsi()` invalid.

throws(() => encodeAnsi(
    { xMin: 0, xMax: 1.5, yMin: 0, yMax: 1.23 },
    2,
    'monochrome',
    good2x5Pixels,
    'myFn():'
), { message: /^myFn\(\): bounds\.xMax 1\.5 is not an integer$/ });
eq(encodeAnsi(
    { xMin: 0, xMax: 1.5, yMin: 0, yMax: 0.123 }, // despite invalid bounds...
    2,
    'monochrome',
    good2x5Pixels,
    'myFn():',
    true, // ...skips validation...
), '▄▀'); // ...so this works

throws(() => encodeAnsi(
    { xMin: 0, xMax: 2, yMin: 0, yMax: 2 },
    2,
    // @ts-expect-error
    'nope!',
    good2x5Pixels,
    'myFn():',
    true,
), { message: /^myFn\(\): cannot skip invalid colorDepth$/ });

throws(() => encodeAnsi(
    { xMin: 0, xMax: 2, yMin: 0, yMax: 2 },
    2,
    // @ts-expect-error
    'nope',
    good2x5Pixels,
), { message: /^encodeAnsi\(\): colorDepth is not one of '256color'\|'8color'\|'monochrome'\|'truecolor'$/ });

throws(() => encodeAnsi(
    { xMin: 0, xMax: 2, yMin: 0, yMax: 2 },
    2,
    '256color',
    // @ts-expect-error
    [[new Date(), {}], [{}, {}]],
), { message: /^encodeAnsi\(\): pixels is an array, not a Uint8ClampedArray$/ });

throws(() => encodeAnsi(
    { xMin: 2, xMax: 4, yMin: 0, yMax: 2 },
    2,
    'monochrome',
    good2x5Pixels,
    'test():'
), { message: /^test\(\): bounds\.xMin 2 exceeds pixels extentX 2$/ });

throws(() => encodeAnsi(
    { xMin: 0, xMax: 3, yMin: 0, yMax: 2 },
    2,
    'monochrome',
    good2x5Pixels,
    'test():'
), { message: /^test\(\): bounds\.xMax 3 exceeds pixels extentX 2$/ });

throws(() => encodeAnsi(
    { xMin: 0, xMax: 1, yMin: 6, yMax: 8 },
    2,
    'monochrome',
    good2x5Pixels,
    'test():'
), { message: /^test\(\): bounds\.yMin 6 exceeds pixels extentY 5$/ });

throws(() => encodeAnsi(
    { xMin: 0, xMax: 1, yMin: 1, yMax: 7 },
    2,
    'monochrome',
    good2x5Pixels,
    'test():'
), { message: /^test\(\): bounds\.yMax 7 exceeds pixels extentY 5$/ });


// `encodeAnsi()` valid.

eq(encodeAnsi(
    { xMin: 0, xMax: 2, yMin: 0, yMax: 4 },
    2,
    'monochrome',
    good2x5Pixels,
),`
▄▀
▀▄
`.trim());

eq(encodeAnsi(
    { xMin: 0, xMax: 2, yMin: 0, yMax: 4 },
    2,
    '256color',
    good2x5Pixels,
), `
\x1B[48;5;16m\x1B[38;5;226m▄\x1B[48;5;231m\x1B[38;5;196m▄\x1B[0m
\x1B[48;5;40m\x1B[38;5;145m▄\x1B[48;5;40m\x1B[38;5;145m▄\x1B[0m
`.trim());

eq(encodeAnsi(
    { xMin: 0, xMax: 2, yMin: 0, yMax: 4 },
    2,
    '8color',
    good2x5Pixels,
), `
\x1B[40m\x1B[33m▄\x1B[47m\x1B[31m▄\x1B[0m
\x1B[42m\x1B[37m▄\x1B[42m\x1B[37m▄\x1B[0m
`.trim());

eq(encodeAnsi(
    { xMin: 0, xMax: 2, yMin: 0, yMax: 4 },
    2,
    'truecolor',
    good2x5Pixels,
), `
\x1B[48;2;0;0;0m\x1B[38;2;255;255;0m▄\x1B[48;2;255;255;255m\x1B[38;2;255;0;0m▄\x1B[0m
\x1B[48;2;0;181;0m\x1B[38;2;128;128;128m▄\x1B[48;2;0;179;0m\x1B[38;2;129;129;129m▄\x1B[0m
`.trim());


console.log('All encodeAnsi() tests passed.');
