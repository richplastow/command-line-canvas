import { deepEqual as eq, strictEqual as se } from 'node:assert';
import { Pixel } from '../../models/pixel/pixel.js';
import { resetPixelGrid } from './reset-pixel-grid.js';

const makePixels = (w, h, r, g, b) => {
    const out = [];
    for (let y = 0; y < h; y++) {
        const row = [];
        for (let x = 0; x < w; x++) {
            row.push(new Pixel(r, g, b));
        }
        out.push(row);
    }
    return out;
};

const toRgb = (pixels) => pixels.map((row) =>
    row.map((px) => ({ r: px.r, g: px.g, b: px.b })));

// Fills rectangular grid.
const pixels1 = makePixels(2, 3, 9, 9, 9);
resetPixelGrid(new Pixel(1, 2, 3), pixels1, 2, 3);
eq(toRgb(pixels1), [
    [{ r: 1, g: 2, b: 3 }, { r: 1, g: 2, b: 3 }],
    [{ r: 1, g: 2, b: 3 }, { r: 1, g: 2, b: 3 }],
    [{ r: 1, g: 2, b: 3 }, { r: 1, g: 2, b: 3 }],
]);

// Fills single-row grid.
const pixels2 = makePixels(3, 1, 0, 0, 0);
resetPixelGrid(new Pixel(10, 20, 30), pixels2, 3, 1);
eq(toRgb(pixels2), [
    [{ r: 10, g: 20, b: 30 }, { r: 10, g: 20, b: 30 }, { r: 10, g: 20, b: 30 }],
]);

// Mutates pixels in-place (preserves object identity).
const pixels3 = makePixels(1, 1, 4, 5, 6);
const ref = pixels3[0][0];
resetPixelGrid(new Pixel(7, 8, 9), pixels3, 1, 1);
se(pixels3[0][0], ref);
eq(toRgb(pixels3), [[{ r: 7, g: 8, b: 9 }]]);

// Accepts plain object as background.
const pixels4 = makePixels(1, 1, 0, 0, 0);
resetPixelGrid({ r: 99, g: 98, b: 97 }, pixels4, 1, 1);
eq(toRgb(pixels4), [[{ r: 99, g: 98, b: 97 }]]);

console.log('All resetPixelGrid() tests passed.');
