import { deepEqual as eq, strictEqual as se } from 'node:assert';
import { Color } from '../../models/color/color.mjs';
import { resetPixelGrid } from './reset-pixel-grid.mjs';


const runResetPixelGridCases = () => {

    const makePixels = (/** @type {number} */ w, /** @type {number} */ h, /** @type {number} */ r, /** @type {number} */ g, /** @type {number} */ b) => {
        const out = new Uint8ClampedArray(w * h * 4);
        for (let i = 0; i < out.length; i += 4) {
            out[i] = r;
            out[i + 1] = g;
            out[i + 2] = b;
            out[i + 3] = 255;
        }
        return out;
    };

    const toRgba = (/** @type {Uint8ClampedArray} */ pixels, /** @type {number} */ width) => {
        const out = [];
        const height = pixels.length / (width * 4);
        for (let y = 0; y < height; y++) {
            const row = [];
            for (let x = 0; x < width; x++) {
                const i = (y * width + x) * 4;
                row.push({ r: pixels[i], g: pixels[i + 1], b: pixels[i + 2], a: pixels[i + 3] });
            }
            out.push(row);
        }
        return out;
    };

    // Fills rectangular grid.
    const pixels1 = makePixels(2, 3, 9, 9, 9);
    resetPixelGrid(new Color(1, 2, 3, 255), pixels1);
    eq(toRgba(pixels1, 2), [
        [{ r: 1, g: 2, b: 3, a: 255 }, { r: 1, g: 2, b: 3, a: 255 }],
        [{ r: 1, g: 2, b: 3, a: 255 }, { r: 1, g: 2, b: 3, a: 255 }],
        [{ r: 1, g: 2, b: 3, a: 255 }, { r: 1, g: 2, b: 3, a: 255 }],
    ], 'resetPixelGrid() should fill every pixel in a rectangular grid with the background colour');

    // Fills single-row grid.
    const pixels2 = makePixels(3, 1, 0, 0, 0);
    resetPixelGrid(new Color(10, 20, 30, 255), pixels2);
    eq(toRgba(pixels2, 3), [
        [{ r: 10, g: 20, b: 30, a: 255 }, { r: 10, g: 20, b: 30, a: 255 }, { r: 10, g: 20, b: 30, a: 255 }],
    ], 'resetPixelGrid() should fill every pixel in a single-row grid with the background colour');

    // Mutates pixels in-place (preserves array identity).
    const pixels3 = makePixels(1, 1, 4, 5, 6);
    const ref = pixels3;
    resetPixelGrid(new Color(7, 8, 9, 255), pixels3);
    se(pixels3, ref, 'resetPixelGrid() should mutate the original pixel array in place');
    eq(toRgba(pixels3, 1), [[{ r: 7, g: 8, b: 9, a: 255 }]], 'resetPixelGrid() should update in-place pixels to the supplied background colour');

    // Accepts plain object as background.
    const pixels4 = makePixels(1, 1, 0, 0, 0);
    resetPixelGrid(/** @type {*} */ ({ r: 99, g: 98, b: 97, a: 255 }), pixels4);
    eq(toRgba(pixels4, 1), [[{ r: 99, g: 98, b: 97, a: 255 }]], 'resetPixelGrid() should accept plain background-like objects');

};

export const testResetPixelGrid = () => {
    runResetPixelGridCases();
    console.log('OK: All resetPixelGrid() tests passed!');
};
