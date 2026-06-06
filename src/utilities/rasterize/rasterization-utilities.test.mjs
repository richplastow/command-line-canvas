import { strictEqual as eq } from 'node:assert';
import { blendChannel, clamp01, toByte } from './rasterization-utilities.mjs';


const runRasterizationUtilitiesCases = () => {

    // `blendChannel()` normal returns clamped source.
    eq(blendChannel('normal', 0.8, 0.2), 0.8, 'blendChannel() should return the unclamped source for normal mode within range');
    eq(blendChannel('normal', 1.2, 0.5), 1, 'blendChannel() should clamp normal mode values above one');
    eq(blendChannel('normal', -0.1, 0.5), 0, 'blendChannel() should clamp normal mode values below zero');

    // `blendChannel()` multiply returns src * dst.
    eq(blendChannel('multiply', 0.5, 0.5), 0.25, 'blendChannel() should multiply source and destination in multiply mode');
    eq(blendChannel('multiply', 0.8, 0.5), 0.4, 'blendChannel() should scale multiply mode output by both channels');

    // `blendChannel()` screen returns 1 - (1-src)*(1-dst).
    eq(blendChannel('screen', 0.5, 0.5), 0.75, 'blendChannel() should apply the screen formula to both channels');
    eq(blendChannel('screen', 0, 0), 0, 'blendChannel() should return zero when both screen inputs are zero');

    // `blendChannel()` overlay uses multiply for dst <= 0.5.
    eq(blendChannel('overlay', 0.5, 0.25), 0.25, 'blendChannel() should use multiply behaviour for overlay when destination is dark');

    // `blendChannel()` overlay uses screen for dst > 0.5.
    eq(blendChannel('overlay', 0.5, 0.75), 0.75, 'blendChannel() should use screen behaviour for overlay when destination is light');

    // `blendChannel()` overlay at dst=0.5 returns src.
    eq(blendChannel('overlay', 0.8, 0.5), 0.8, 'blendChannel() should return the source when overlay destination is mid-grey');
    eq(blendChannel('overlay', 0.2, 0.5), 0.2, 'blendChannel() should preserve lower source values at mid-grey overlay');

    // `clamp01()` clamps values to 0..1 range.
    eq(clamp01(-1), 0, 'clamp01() should clamp large negative values to zero');
    eq(clamp01(-0.001), 0, 'clamp01() should clamp small negative values to zero');
    eq(clamp01(0), 0, 'clamp01() should keep zero unchanged');
    eq(clamp01(0.5), 0.5, 'clamp01() should keep in-range values unchanged');
    eq(clamp01(1), 1, 'clamp01() should keep one unchanged');
    eq(clamp01(1.001), 1, 'clamp01() should clamp slightly oversized values to one');
    eq(clamp01(2), 1, 'clamp01() should clamp large oversized values to one');

    // `toByte()` converts 0..1 floats to 0..255 integers.
    eq(toByte(0), 0, 'toByte() should map zero to byte zero');
    eq(toByte(0.5), 128, 'toByte() should round mid-grey to byte 128');
    eq(toByte(1), 255, 'toByte() should map one to byte 255');
    eq(toByte(-0.1), 0, 'toByte() should clamp negative inputs before conversion');
    eq(toByte(1.1), 255, 'toByte() should clamp oversized inputs before conversion');

};

export const testRasterizationUtilities = () => {
    runRasterizationUtilitiesCases();
    console.log('OK: All rasterization utilities tests passed!');
};
