import { throws, deepEqual as eq, notStrictEqual as neq } from 'node:assert';
import { encodeBuffer } from './encode-buffer.js';


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


// `encodeBuffer()` invalid.

throws(() => encodeBuffer(
    { xMin: 0, xMax: 1.5, yMin: 0, yMax: 1.23 },
    2,
    'monochrome',
    good2x5Pixels,
    'myFn():'
), { message: /^myFn\(\): bounds\.xMax 1\.5 is not an integer$/ });
eq(encodeBuffer(
    { xMin: 0, xMax: 1.5, yMin: 0, yMax: 0.123 }, // despite invalid bounds...
    2,
    'monochrome',
    good2x5Pixels,
    'myFn():',
    true, // ...skips validation...
), new Uint8Array([0,0,0,255, 255,255,255,255])); // ...so this works

throws(() => encodeBuffer(
    { xMin: 0, xMax: 2, yMin: 0, yMax: 2 },
    2,
    // @ts-expect-error
    'nope!',
    good2x5Pixels,
    'myFn():',
    true,
), { message: /^myFn\(\): cannot skip invalid colorDepth$/ });

throws(() => encodeBuffer(
    { xMin: 0, xMax: 2, yMin: 0, yMax: 2 },
    2,
    // @ts-expect-error
    'nope',
    good2x5Pixels,
), { message: /^encodeBuffer\(\): colorDepth is not one of '256color'\|'8color'\|'monochrome'\|'truecolor'$/ });

throws(() => encodeBuffer(
    { xMin: 0, xMax: 2, yMin: 0, yMax: 2 },
    2,
    '256color',
    // @ts-expect-error
    [[new Date(), {}], [{}, {}]],
), { message: /^encodeBuffer\(\): pixels is an array, not a Uint8ClampedArray$/ });

throws(() => encodeBuffer(
    { xMin: 2, xMax: 4, yMin: 0, yMax: 2 },
    2,
    'monochrome',
    good2x5Pixels,
    'test():'
), { message: /^test\(\): bounds\.xMin 2 exceeds pixels extentX 2$/ });

throws(() => encodeBuffer(
    { xMin: 0, xMax: 3, yMin: 0, yMax: 2 },
    2,
    'monochrome',
    good2x5Pixels,
    'test():'
), { message: /^test\(\): bounds\.xMax 3 exceeds pixels extentX 2$/ });

throws(() => encodeBuffer(
    { xMin: 0, xMax: 1, yMin: 6, yMax: 8 },
    2,
    'monochrome',
    good2x5Pixels,
    'test():'
), { message: /^test\(\): bounds\.yMin 6 exceeds pixels extentY 5$/ });

throws(() => encodeBuffer(
    { xMin: 0, xMax: 1, yMin: 1, yMax: 7 },
    2,
    'monochrome',
    good2x5Pixels,
    'test():'
), { message: /^test\(\): bounds\.yMax 7 exceeds pixels extentY 5$/ });


// `encodeBuffer()` valid.

const buf = encodeBuffer(
    { xMin: 0, xMax: 2, yMin: 0, yMax: 4 },
    2,
    'truecolor',
    good2x5Pixels,
);

const buf8 = encodeBuffer(
    { xMin: 0, xMax: 2, yMin: 0, yMax: 4 },
    2,
    '8color',
    good2x5Pixels,
);

// Check that this is a buffer not an array, and the length.
eq(buf instanceof Uint8Array, true);
eq(buf.length, 2 * 4 * 4);
eq(buf8 instanceof Uint8Array, true);
eq(buf8.length, buf.length);
eq(Array.from(buf8), Array.from(buf));

// First row: black and white.
eq(buf[0], 0); // first pixel R
eq(buf[1], 0); // first pixel G
eq(buf[2], 0); // first pixel B
eq(buf[3], 255); // first pixel A

eq(buf[4], 255); // second pixel R
eq(buf[5], 255); // second pixel G
eq(buf[6], 255); // second pixel B
eq(buf[7], 255); // second pixel A

// Second row (y=1): yellow and red.
eq(buf[8], 255); // third pixel R (yellow)
eq(buf[9], 255); // third pixel G
eq(buf[10], 0); // third pixel B
eq(buf[11], 255); // third pixel A

eq(buf[12], 255); // fourth pixel R (red)
eq(buf[13], 0); // fourth pixel G
eq(buf[14], 0); // fourth pixel B
eq(buf[15], 255); // fourth pixel A

// Third row (y=2): both green, left just above, right just below threshold.
eq(buf[16], 0);   // fifth pixel R
eq(buf[17], 181); // fifth pixel G
eq(buf[18], 0);   // fifth pixel B
eq(buf[19], 255); // fifth pixel A

eq(buf[20], 0);   // sixth pixel R
eq(buf[21], 179); // sixth pixel G
eq(buf[22], 0);   // sixth pixel B
eq(buf[23], 255); // sixth pixel A

// Fourth row (y=3): both grey, just above and just below threshold.
eq(buf[24], 128); // seventh pixel R
eq(buf[25], 128); // seventh pixel G
eq(buf[26], 128); // seventh pixel B
eq(buf[27], 255); // seventh pixel A

eq(buf[28], 129); // eighth pixel R
eq(buf[29], 129); // eighth pixel G
eq(buf[30], 129); // eighth pixel B
eq(buf[31], 255); // eighth pixel A

eq(buf[32], undefined); // no more pixels


console.log('All encodeBuffer() tests passed.');
