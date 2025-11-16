import { strictEqual as eq } from 'node:assert';
import { Color } from '../../models/color/color.js';
import { Primitive } from '../../models/primitive/primitive.js';
import { Shape } from '../../models/shape/shape.js';
import { computeShapeAABBs } from './compute-shape-aabbs.js';

const ink = new Color(255, 0, 255, 1);
const paper = new Color(0, 0, 0, 0);
const stroke = new Color(0, 0, 0, 1);

const makeShape = (opts) => new Shape(
    opts.blendMode ?? 'normal',
    null,
    opts.flip ?? 'no-flip',
    opts.ink ?? ink,
    opts.paper ?? paper,
    opts.pattern ?? 'all-ink',
    opts.patternRatio ?? 0.5,
    opts.patternScale ?? 1,
    opts.patternUnit ?? 'pixel',
    opts.primitives ?? [],
    0,
    opts.scale ?? 1,
    opts.strokeColor ?? stroke,
    opts.strokePosition ?? 'center',
    opts.strokeUnit ?? 'pixel',
    opts.strokeWidth ?? 0,
    opts.translate ?? { x: 0, y: 0 },
);

// Circle at (2, -1) with radius 1 (scale=1).
const circle = new Primitive(null, 'no-flip', 'union', 'circle', 0, 1, { x: 2, y: -1 });
const shape1 = makeShape({ primitives: [circle] });
let aabbs = computeShapeAABBs(0, [{ id: 1, shape: shape1 }], 1);
let bounds = aabbs[0].bounds;
eq(bounds.xMin, 1);
eq(bounds.xMax, 3);
eq(bounds.yMin, -2);
eq(bounds.yMax, 0);

// Anti-alias region expands box.
aabbs = computeShapeAABBs(0.5, [{ id: 2, shape: shape1 }], 1);
bounds = aabbs[0].bounds;
eq(bounds.xMin, 0.5);
eq(bounds.xMax, 3.5);

// Outside stroke expands box.
const shape2 = makeShape({
    primitives: [circle],
    strokeWidth: 2,
    strokePosition: 'outside',
});
aabbs = computeShapeAABBs(0, [{ id: 3, shape: shape2 }], 0.5);
bounds = aabbs[0].bounds;
eq(bounds.xMin, 0);
eq(bounds.xMax, 4);

// Center stroke expands box by half stroke width.
const shape3 = makeShape({
    primitives: [circle],
    strokeWidth: 2,
    strokePosition: 'center',
});
aabbs = computeShapeAABBs(0, [{ id: 4, shape: shape3 }], 0.5);
bounds = aabbs[0].bounds;
eq(bounds.xMin, 0.5);
eq(bounds.xMax, 3.5);

// Inside stroke does not expand box.
const shape4 = makeShape({
    primitives: [circle],
    strokeWidth: 2,
    strokePosition: 'inside',
});
aabbs = computeShapeAABBs(0, [{ id: 5, shape: shape4 }], 0.5);
bounds = aabbs[0].bounds;
eq(bounds.xMin, 1);
eq(bounds.xMax, 3);

// Multiple primitives union their boxes.
const tri = new Primitive(null, 'no-flip', 'union', 'triangle-right', 0, 1, { x: -4, y: 3 });
const shape5 = makeShape({
    primitives: [circle, tri],
    scale: 2,
    translate: { x: 1, y: 1 },
});
aabbs = computeShapeAABBs(0, [{ id: 6, shape: shape5 }], 1);
bounds = aabbs[0].bounds;
eq(bounds.xMin, -8);
eq(bounds.xMax, 7);
eq(bounds.yMin, -3);
eq(bounds.yMax, 9);

// Empty primitives returns huge fallback box.
const shape6 = makeShape({ primitives: [] });
aabbs = computeShapeAABBs(0, [{ id: 7, shape: shape6 }], 1);
bounds = aabbs[0].bounds;
eq(bounds.xMin, -1e6);
eq(bounds.xMax, 1e6);

// strokeUnit='shape' scales stroke with shape.scale.
const shape7 = makeShape({
    primitives: [circle],
    scale: 2,
    strokeWidth: 1,
    strokePosition: 'outside',
    strokeUnit: 'shape',
});
aabbs = computeShapeAABBs(0, [{ id: 8, shape: shape7 }], 1);
bounds = aabbs[0].bounds;
eq(bounds.xMin, 0);
eq(bounds.xMax, 8);

// strokeUnit='world' uses world units directly.
const shape8 = makeShape({
    primitives: [circle],
    scale: 2,
    strokeWidth: 1,
    strokePosition: 'center',
    strokeUnit: 'world',
});
aabbs = computeShapeAABBs(0, [{ id: 9, shape: shape8 }], 2);
bounds = aabbs[0].bounds;
eq(bounds.xMin, 1.5);
eq(bounds.xMax, 6.5);

// Primitive debug boxes are captured when colours are set.
const dbgColor = new Color(10, 240, 80, 0.5);
const debugPrim = new Primitive(dbgColor, 'no-flip', 'union', 'circle', 0, 1,
    { x: 0, y: 0 });
const debugShape = makeShape({ primitives: [debugPrim] });
aabbs = computeShapeAABBs(0, [{ id: 10, shape: debugShape }], 1);
eq(aabbs[0].primitiveDebugAabbs.length, 1);
const debugEntry = aabbs[0].primitiveDebugAabbs[0];
eq(debugEntry.color, dbgColor);
eq(debugEntry.bounds.xMin, -1);
eq(debugEntry.bounds.xMax, 1);


console.log('All computeShapeAABBs() tests passed.');
