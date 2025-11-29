import { throws, deepEqual as eq } from 'node:assert';
import { encodeBraille } from './encode-braille.js';


const good2x4Pixels = new Uint8ClampedArray([
    0, 0, 0, 255,         255, 255, 255, 255,
    255, 0, 0, 255,       0, 255, 0, 255,
    0, 0, 255, 255,       255, 255, 0, 255,
    255, 255, 255, 255,   0, 0, 0, 255,
]);


// `encodeBraille()` invalid.

throws(() => encodeBraille(
    { xMin: 2, xMax: 4, yMin: 0, yMax: 2 },
    2,
    'monochrome',
    good2x4Pixels,
    'test():'
), { message: /^test\(\): bounds\.xMin 2 exceeds pixels extentX 2$/ });

throws(() => encodeBraille(
    { xMin: 0, xMax: 2, yMin: 0, yMax: 5 },
    2,
    'monochrome',
    good2x4Pixels,
    'encodeBraille():'
), { message: /^encodeBraille\(\): bounds height 5 is not even$/ });

throws(() => encodeBraille(
    { xMin: 0, xMax: 1, yMin: 0, yMax: 2 },
    2,
    'monochrome',
    // @ts-expect-error
    [[new Date()], [{}]],
), { message: /^encodeBraille\(\): pixels is an array, not a Uint8ClampedArray$/ });

throws(() => encodeBraille(
    { xMin: 0, xMax: 2, yMin: 0, yMax: 2 },
    2,
    '256color',
    good2x4Pixels,
), { message: /^encodeBraille\(\): colorDepth '256color' not supported for Braille$/ });


// `encodeBraille()` valid.

const expected = [
    [0x94, 0xBB],
    [0xF6, 0x99],
].map((row) => row
    .map((mask) => String.fromCodePoint(0x2800 + mask))
    .join('')
).join('\n');

eq(encodeBraille(
    { xMin: 0, xMax: 2, yMin: 0, yMax: 4 },
    2,
    '8color',
    good2x4Pixels,
), expected);

eq(encodeBraille(
    { xMin: 0, xMax: 2, yMin: 0, yMax: 4 },
    2,
    'monochrome',
    good2x4Pixels,
), expected);

const examplePixels = new Uint8ClampedArray([
    129, 120, 255, 255,
    255, 200, 255, 255
]);

eq(encodeBraille(
    { xMin: 0, xMax: 1, yMin: 0, yMax: 2 },
    1,
    'monochrome',
    examplePixels,
), String.fromCodePoint(0x2800 + 0xF7));

console.log('All encodeBraille() tests passed.');
