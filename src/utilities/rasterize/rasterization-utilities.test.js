import { strictEqual as eq } from 'node:assert';
import { blendChannel, clamp01, toByte } from './rasterization-utilities.js';

// `blendChannel()` normal returns clamped source.
eq(blendChannel('normal', 0.8, 0.2), 0.8);
eq(blendChannel('normal', 1.2, 0.5), 1);
eq(blendChannel('normal', -0.1, 0.5), 0);

// `blendChannel()` multiply returns src * dst.
eq(blendChannel('multiply', 0.5, 0.5), 0.25);
eq(blendChannel('multiply', 0.8, 0.5), 0.4);

// `blendChannel()` screen returns 1 - (1-src)*(1-dst).
eq(blendChannel('screen', 0.5, 0.5), 0.75);
eq(blendChannel('screen', 0, 0), 0);

// `blendChannel()` overlay uses multiply for dst <= 0.5.
eq(blendChannel('overlay', 0.5, 0.25), 0.25);

// `blendChannel()` overlay uses screen for dst > 0.5.
eq(blendChannel('overlay', 0.5, 0.75), 0.75);

// `blendChannel()` overlay at dst=0.5 returns src.
eq(blendChannel('overlay', 0.8, 0.5), 0.8);
eq(blendChannel('overlay', 0.2, 0.5), 0.2);

// `clamp01()` clamps values to 0..1 range.
eq(clamp01(-1), 0);
eq(clamp01(-0.001), 0);
eq(clamp01(0), 0);
eq(clamp01(0.5), 0.5);
eq(clamp01(1), 1);
eq(clamp01(1.001), 1);
eq(clamp01(2), 1);

// `toByte()` converts 0..1 floats to 0..255 integers.
eq(toByte(0), 0);
eq(toByte(0.5), 128);
eq(toByte(1), 255);
eq(toByte(-0.1), 0);
eq(toByte(1.1), 255);

console.log('All rasterization utilities tests passed.');
