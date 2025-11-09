import { deepEqual as eq } from 'node:assert';
import { Color } from '../../models/color/color.js';
import { Pixel } from '../../models/pixel/pixel.js';
import { rasterize } from './rasterize.js';

const makePixels = (width, height, r, g, b) => {
    const out = [];
    for (let y = 0; y < height; y++) {
        const row = [];
        for (let x = 0; x < width; x++) {
            row.push(new Pixel(r, g, b));
        }
        out.push(row);
    }
    return out;
};

const toRgb = (pixels) => pixels.map((row) =>
    row.map((px) => ({ r: px.r, g: px.g, b: px.b })));

const pixelCenter = (x, y, width, height) => {
    const aspect = width / height;
    const worldW = aspect >= 1 ? 10 * aspect : 10;
    const worldH = aspect >= 1 ? 10 : 10 / aspect;
    const invW = 1 / width;
    const invH = 1 / height;
    return {
        x: ((x + 0.5) * invW - 0.5) * worldW,
        y: ((y + 0.5) * invH - 0.5) * worldH,
    };
};

const circleShape = (options) => ({
    blendMode: options.blendMode ?? 'normal',
    flip: 'no-flip',
    ink: options.ink,
    paper: options.paper ?? options.ink,
    pattern: options.pattern ?? 'all-ink',
    primitives: [
        {
            flip: 'no-flip',
            joinMode: 'union',
            kind: 'circle',
            rotate: 0,
            scale: 1,
            translate: { x: 0, y: 0 },
        },
    ],
    rotate: 0,
    scale: options.scale ?? 3,
    strokeColor: options.strokeColor ?? null,
    strokePosition: options.strokePosition ?? 'center',
    strokeWidth: options.strokeWidth ?? 0,
    translate: options.translate,
});


// `rasterize()` background reset.

const resetBg = new Pixel(12, 34, 56);
const resetPixels = makePixels(2, 2, 99, 88, 77);

rasterize(0.85, resetBg, resetPixels, [], 5, 2, 2);

eq(toRgb(resetPixels), [
    [
        { r: 12, g: 34, b: 56 },
        { r: 12, g: 34, b: 56 },
    ],
    [
        { r: 12, g: 34, b: 56 },
        { r: 12, g: 34, b: 56 },
    ],
]);


// `rasterize()` fills with ink.

const inkBg = new Pixel(0, 0, 0);
const inkPixels = makePixels(1, 1, 0, 0, 0);
const inkColor = new Color(255, 0, 0, 1);
const inkPaper = new Color(0, 0, 0, 0);
const inkCenter = pixelCenter(0, 0, 1, 1);
const inkShape = circleShape({
    ink: inkColor,
    paper: inkPaper,
    translate: inkCenter,
    scale: 5,
});

rasterize(0.85, inkBg, inkPixels, [ { id: 1, shape: inkShape } ], 10, 1, 1);

eq(toRgb(inkPixels), [
    [
        { r: 255, g: 0, b: 0 },
    ],
]);


// `rasterize()` honours paper pattern.

const paperBg = new Pixel(0, 0, 0);
const paperPixels = makePixels(1, 1, 0, 0, 0);
const paperInk = new Color(200, 10, 10, 1);
const paperColor = new Color(0, 255, 0, 1);
const paperCenter = pixelCenter(0, 0, 1, 1);
const paperShape = circleShape({
    ink: paperInk,
    paper: paperColor,
    pattern: 'all-paper',
    translate: paperCenter,
    scale: 5,
});

rasterize(0.85, paperBg, paperPixels, [ { id: 2, shape: paperShape } ], 10, 1, 1);

eq(toRgb(paperPixels), [
    [
        { r: 0, g: 255, b: 0 },
    ],
]);


// `rasterize()` applies outside stroke.

const strokeBg = new Pixel(10, 20, 30);
const strokePixels = makePixels(1, 1, 5, 5, 5);
const strokeShape = circleShape({
    ink: new Color(0, 0, 0, 0),
    paper: new Color(0, 0, 0, 0),
    strokeColor: new Color(0, 0, 123, 1),
    strokePosition: 'outside',
    strokeWidth: 1,
    translate: { x: 5, y: 0 },
    scale: 3,
});

rasterize(0.85, strokeBg, strokePixels, [ { id: 3, shape: strokeShape } ], 10, 1, 1);

eq(toRgb(strokePixels), [
    [
        { r: 0, g: 0, b: 123 },
    ],
]);


// `rasterize()` multiply blend.

const mulBg = new Pixel(128, 128, 128);
const mulPixels = makePixels(1, 1, 128, 128, 128);
const mulShape = circleShape({
    blendMode: 'multiply',
    ink: new Color(128, 128, 128, 1),
    paper: new Color(128, 128, 128, 1),
    translate: pixelCenter(0, 0, 1, 1),
    scale: 5,
});

rasterize(0.85, mulBg, mulPixels, [ { id: 4, shape: mulShape } ], 10, 1, 1);

eq(toRgb(mulPixels), [
    [
        { r: 64, g: 64, b: 64 },
    ],
]);


// `rasterize()` screen blend.

const screenBg = new Pixel(128, 128, 128);
const screenPixels = makePixels(1, 1, 128, 128, 128);
const screenShape = circleShape({
    blendMode: 'screen',
    ink: new Color(128, 128, 128, 1),
    paper: new Color(128, 128, 128, 1),
    translate: pixelCenter(0, 0, 1, 1),
    scale: 5,
});

rasterize(0.85, screenBg, screenPixels,
    [ { id: 5, shape: screenShape } ], 10, 1, 1);

eq(toRgb(screenPixels), [
    [
        { r: 192, g: 192, b: 192 },
    ],
]);


// `rasterize()` overlay blend.

const overlayBg = new Pixel(128, 128, 128);
const overlayPixels = makePixels(1, 1, 128, 128, 128);
const overlayShape = circleShape({
    blendMode: 'overlay',
    ink: new Color(128, 128, 128, 1),
    paper: new Color(128, 128, 128, 1),
    translate: pixelCenter(0, 0, 1, 1),
    scale: 5,
});

rasterize(0.85, overlayBg, overlayPixels,
    [ { id: 6, shape: overlayShape } ], 10, 1, 1);

eq(toRgb(overlayPixels), [
    [
        { r: 128, g: 128, b: 128 },
    ],
]);


console.log('All rasterize() tests passed.');
