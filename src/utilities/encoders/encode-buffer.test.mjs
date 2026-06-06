import { throws, deepEqual as eq, notStrictEqual as neq } from 'node:assert';
import { encodeBuffer } from './encode-buffer.mjs';


const runEncodeBufferCases = () => {

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
    ), { message: /^myFn\(\): bounds\.xMax 1\.5 is not an integer$/ }, 'encodeBuffer() should reject non-integer bounds during validation');
    eq(encodeBuffer(
        { xMin: 0, xMax: 1.5, yMin: 0, yMax: 0.123 }, // despite invalid bounds...
        2,
        'monochrome',
        good2x5Pixels,
        'myFn():',
        true, // ...skips validation...
    ), new Uint8Array([0,0,0,255, 255,255,255,255]), 'encodeBuffer() should slice out pixels even when validation is skipped'); // ...so this works

    throws(() => encodeBuffer(
        { xMin: 0, xMax: 2, yMin: 0, yMax: 2 },
        2,
        // @ts-expect-error
        'nope!',
        good2x5Pixels,
        'myFn():',
        true,
    ), { message: /^myFn\(\): cannot skip invalid colorDepth$/ }, 'encodeBuffer() should not allow validation skipping with an invalid color depth');

    throws(() => encodeBuffer(
        { xMin: 0, xMax: 2, yMin: 0, yMax: 2 },
        2,
        // @ts-expect-error
        'nope',
        good2x5Pixels,
    ), { message: /^encodeBuffer\(\): colorDepth is not one of '256color'\|'8color'\|'monochrome'\|'truecolor'$/ }, 'encodeBuffer() should reject unsupported color depths');

    throws(() => encodeBuffer(
        { xMin: 0, xMax: 2, yMin: 0, yMax: 2 },
        2,
        '256color',
        // @ts-expect-error
        [[new Date(), {}], [{}, {}]],
    ), { message: /^encodeBuffer\(\): pixels is an array, not a Uint8ClampedArray$/ }, 'encodeBuffer() should require pixels to be a Uint8ClampedArray');

    throws(() => encodeBuffer(
        { xMin: 2, xMax: 4, yMin: 0, yMax: 2 },
        2,
        'monochrome',
        good2x5Pixels,
        'test():'
    ), { message: /^test\(\): bounds\.xMin 2 exceeds pixels extentX 2$/ }, 'encodeBuffer() should reject bounds whose xMin exceeds the pixel width');

    throws(() => encodeBuffer(
        { xMin: 0, xMax: 3, yMin: 0, yMax: 2 },
        2,
        'monochrome',
        good2x5Pixels,
        'test():'
    ), { message: /^test\(\): bounds\.xMax 3 exceeds pixels extentX 2$/ }, 'encodeBuffer() should reject bounds whose xMax exceeds the pixel width');

    throws(() => encodeBuffer(
        { xMin: 0, xMax: 1, yMin: 6, yMax: 8 },
        2,
        'monochrome',
        good2x5Pixels,
        'test():'
    ), { message: /^test\(\): bounds\.yMin 6 exceeds pixels extentY 5$/ }, 'encodeBuffer() should reject bounds whose yMin exceeds the pixel height');

    throws(() => encodeBuffer(
        { xMin: 0, xMax: 1, yMin: 1, yMax: 7 },
        2,
        'monochrome',
        good2x5Pixels,
        'test():'
    ), { message: /^test\(\): bounds\.yMax 7 exceeds pixels extentY 5$/ }, 'encodeBuffer() should reject bounds whose yMax exceeds the pixel height');


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
    eq(buf instanceof Uint8Array, true, 'encodeBuffer() should return a Uint8Array for truecolor output');
    eq(buf.length, 2 * 4 * 4, 'encodeBuffer() should return one RGBA quadruplet per sampled pixel');
    eq(buf8 instanceof Uint8Array, true, 'encodeBuffer() should return a Uint8Array for 8-color output');
    eq(buf8.length, buf.length, 'encodeBuffer() should keep buffer length consistent across color depths');
    eq(Array.from(buf8), Array.from(buf), 'encodeBuffer() should preserve pixel bytes across supported color depths');

    // First row: black and white.
    eq(buf[0], 0, 'encodeBuffer() should preserve the first pixel red channel'); // first pixel R
    eq(buf[1], 0, 'encodeBuffer() should preserve the first pixel green channel'); // first pixel G
    eq(buf[2], 0, 'encodeBuffer() should preserve the first pixel blue channel'); // first pixel B
    eq(buf[3], 255, 'encodeBuffer() should preserve the first pixel alpha channel'); // first pixel A

    eq(buf[4], 255, 'encodeBuffer() should preserve the second pixel red channel'); // second pixel R
    eq(buf[5], 255, 'encodeBuffer() should preserve the second pixel green channel'); // second pixel G
    eq(buf[6], 255, 'encodeBuffer() should preserve the second pixel blue channel'); // second pixel B
    eq(buf[7], 255, 'encodeBuffer() should preserve the second pixel alpha channel'); // second pixel A

    // Second row (y=1): yellow and red.
    eq(buf[8], 255, 'encodeBuffer() should preserve the third pixel red channel'); // third pixel R (yellow)
    eq(buf[9], 255, 'encodeBuffer() should preserve the third pixel green channel'); // third pixel G
    eq(buf[10], 0, 'encodeBuffer() should preserve the third pixel blue channel'); // third pixel B
    eq(buf[11], 255, 'encodeBuffer() should preserve the third pixel alpha channel'); // third pixel A

    eq(buf[12], 255, 'encodeBuffer() should preserve the fourth pixel red channel'); // fourth pixel R (red)
    eq(buf[13], 0, 'encodeBuffer() should preserve the fourth pixel green channel'); // fourth pixel G
    eq(buf[14], 0, 'encodeBuffer() should preserve the fourth pixel blue channel'); // fourth pixel B
    eq(buf[15], 255, 'encodeBuffer() should preserve the fourth pixel alpha channel'); // fourth pixel A

    // Third row (y=2): both green, left just above, right just below threshold.
    eq(buf[16], 0, 'encodeBuffer() should preserve the fifth pixel red channel');   // fifth pixel R
    eq(buf[17], 181, 'encodeBuffer() should preserve the fifth pixel green channel'); // fifth pixel G
    eq(buf[18], 0, 'encodeBuffer() should preserve the fifth pixel blue channel');   // fifth pixel B
    eq(buf[19], 255, 'encodeBuffer() should preserve the fifth pixel alpha channel'); // fifth pixel A

    eq(buf[20], 0, 'encodeBuffer() should preserve the sixth pixel red channel');   // sixth pixel R
    eq(buf[21], 179, 'encodeBuffer() should preserve the sixth pixel green channel'); // sixth pixel G
    eq(buf[22], 0, 'encodeBuffer() should preserve the sixth pixel blue channel');   // sixth pixel B
    eq(buf[23], 255, 'encodeBuffer() should preserve the sixth pixel alpha channel'); // sixth pixel A

    // Fourth row (y=3): both grey, just above and just below threshold.
    eq(buf[24], 128, 'encodeBuffer() should preserve the seventh pixel red channel'); // seventh pixel R
    eq(buf[25], 128, 'encodeBuffer() should preserve the seventh pixel green channel'); // seventh pixel G
    eq(buf[26], 128, 'encodeBuffer() should preserve the seventh pixel blue channel'); // seventh pixel B
    eq(buf[27], 255, 'encodeBuffer() should preserve the seventh pixel alpha channel'); // seventh pixel A

    eq(buf[28], 129, 'encodeBuffer() should preserve the eighth pixel red channel'); // eighth pixel R
    eq(buf[29], 129, 'encodeBuffer() should preserve the eighth pixel green channel'); // eighth pixel G
    eq(buf[30], 129, 'encodeBuffer() should preserve the eighth pixel blue channel'); // eighth pixel B
    eq(buf[31], 255, 'encodeBuffer() should preserve the eighth pixel alpha channel'); // eighth pixel A

    eq(buf[32], undefined, 'encodeBuffer() should not expose bytes beyond the sampled pixel range'); // no more pixels

};

export const testEncodeBuffer = () => {
    runEncodeBufferCases();
    console.log('OK: All encodeBuffer() tests passed!');
};
