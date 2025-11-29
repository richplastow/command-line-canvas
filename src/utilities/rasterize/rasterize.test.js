import { deepEqual as eq } from 'node:assert';
import { Color } from '../../models/color/color.js';
import { Pixel } from '../../models/pixel/pixel.js';
import { Primitive } from '../../models/primitive/primitive.js';
import { Shape } from '../../models/shape/shape.js';
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

const circleShape = (options) => {
    const blendMode = options.blendMode ?? 'normal';
    const debugPrimitiveAabb = options.debugPrimitiveAabb ?? null;
    const debugShapeAabb = options.debugShapeAabb ?? null;
    const flip = 'no-flip';
    const ink = options.ink;
    const paper = options.paper ?? options.ink;
    const pattern = options.pattern ?? 'all-ink';
    const patternRatio = options.patternRatio ?? 0.5;
    const patternScale = options.patternScale ?? 1;
    const patternUnit = options.patternUnit ?? 'pixel';
    const prim = new Primitive(
        debugPrimitiveAabb,
        'no-flip',
        'union',
        'circle',
        0,
        1,
        { x: 0, y: 0 },
    );
    const scale = options.scale ?? 3;
    const strokeColor = options.strokeColor ?? new Color(0, 0, 0, 0);
    const strokePosition = options.strokePosition ?? 'center';
    const strokeUnit = options.strokeUnit ?? 'pixel';
    const strokeWidth = options.strokeWidth ?? 0;
    const translate = options.translate ?? { x: 0, y: 0 };

    return new Shape(
        blendMode,
        debugShapeAabb,
        flip,
        ink,
        paper,
        pattern,
        patternRatio,
        patternScale,
        patternUnit,
        [ prim ],
        0,
        scale,
        strokeColor,
        strokePosition,
        strokeUnit,
        strokeWidth,
        translate,
    );
};


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
const inkColor = new Color(255, 0, 0, 255);
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
const paperInk = new Color(200, 10, 10, 255);
const paperColor = new Color(0, 255, 0, 255);
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
    strokeColor: new Color(0, 0, 123, 255),
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
    ink: new Color(128, 128, 128, 255),
    paper: new Color(128, 128, 128, 255),
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
    ink: new Color(128, 128, 128, 255),
    paper: new Color(128, 128, 128, 255),
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
    ink: new Color(128, 128, 128, 255),
    paper: new Color(128, 128, 128, 255),
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


// `rasterize()` debugShapeAabb background blend.
const dbgBg = new Pixel(50, 60, 70);
const dbgPixels = makePixels(1, 1, 50, 60, 70);
const dbgColor = new Color(200, 100, 50, 128); // semi-transparent debug box
const dbgShape = circleShape({
    ink: new Color(0, 0, 0, 0),
    paper: new Color(0, 0, 0, 0),
    debugShapeAabb: dbgColor,
    translate: { x: 0, y: 0 },
    scale: 1,
});

// Add shape but ensure its AABB covers the pixel. Use large scale to be safe.
dbgShape.primitives = [ new Primitive(null, 'no-flip', 'union', 'circle', 0, 10, { x: 0, y: 0 }) ];

rasterize(0.85, dbgBg, dbgPixels, [ { id: 99, shape: dbgShape } ], 10, 1, 1);

// expected blended channel: dst = bg*(1-alpha) + debug*(alpha)
const a = dbgColor.a / 255;
const expR = Math.round(((50/255) * (1 - a) + (dbgColor.r/255) * a) * 255);
const expG = Math.round(((60/255) * (1 - a) + (dbgColor.g/255) * a) * 255);
const expB = Math.round(((70/255) * (1 - a) + (dbgColor.b/255) * a) * 255);

eq(toRgb(dbgPixels), [[{ r: expR, g: expG, b: expB }]]);


// `rasterize()` debugPrimitiveAabb background blend.
const dbgPrimBg = new Pixel(20, 30, 40);
const dbgPrimPixels = makePixels(1, 1, 20, 30, 40);
const dbgPrimColor = new Color(50, 200, 250, 102);
const dbgPrimShape = circleShape({
    ink: new Color(0, 0, 0, 0),
    paper: new Color(0, 0, 0, 0),
    debugPrimitiveAabb: dbgPrimColor,
    translate: { x: 0, y: 0 },
    scale: 1,
});

dbgPrimShape.primitives = [ new Primitive(
    dbgPrimColor,
    'no-flip',
    'union',
    'circle',
    0,
    10,
    { x: 0, y: 0 },
) ];

rasterize(0.85, dbgPrimBg, dbgPrimPixels,
    [ { id: 100, shape: dbgPrimShape } ], 10, 1, 1);

const alphaPrim = dbgPrimColor.a / 255;
const expPrimR = Math.round(((20/255) * (1 - alphaPrim)
    + (dbgPrimColor.r/255) * alphaPrim) * 255);
const expPrimG = Math.round(((30/255) * (1 - alphaPrim)
    + (dbgPrimColor.g/255) * alphaPrim) * 255);
const expPrimB = Math.round(((40/255) * (1 - alphaPrim)
    + (dbgPrimColor.b/255) * alphaPrim) * 255);

eq(toRgb(dbgPrimPixels), [[{ r: expPrimR, g: expPrimG, b: expPrimB }]]);


console.log('All rasterize() tests passed.');
