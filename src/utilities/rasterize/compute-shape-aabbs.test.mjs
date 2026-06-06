import { strictEqual as eq } from 'node:assert';
import { Color } from '../../models/color/color.mjs';
import { Primitive } from '../../models/primitive/primitive.mjs';
import { Shape } from '../../models/shape/shape.mjs';
import { computeShapeAABBs } from './compute-shape-aabbs.mjs';


const runComputeShapeAabbsCases = () => {

    const ink = new Color(255, 0, 255, 1);
    const paper = new Color(0, 0, 0, 0);
    const stroke = new Color(0, 0, 0, 1);

    const makeShape = (/** @type {any} */ opts) => new Shape(
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
    eq(bounds.xMin, 1, 'computeShapeAABBs() should place the circle minimum x at one world unit left of centre');
    eq(bounds.xMax, 3, 'computeShapeAABBs() should place the circle maximum x at one world unit right of centre');
    eq(bounds.yMin, -2, 'computeShapeAABBs() should place the circle minimum y at one world unit below centre');
    eq(bounds.yMax, 0, 'computeShapeAABBs() should place the circle maximum y at one world unit above centre');

    // Anti-alias region expands box.
    aabbs = computeShapeAABBs(0.5, [{ id: 2, shape: shape1 }], 1);
    bounds = aabbs[0].bounds;
    eq(bounds.xMin, 0.5, 'computeShapeAABBs() should expand xMin by the anti-aliasing region');
    eq(bounds.xMax, 3.5, 'computeShapeAABBs() should expand xMax by the anti-aliasing region');

    // Outside stroke expands box.
    const shape2 = makeShape({
        primitives: [circle],
        strokeWidth: 2,
        strokePosition: 'outside',
    });
    aabbs = computeShapeAABBs(0, [{ id: 3, shape: shape2 }], 0.5);
    bounds = aabbs[0].bounds;
    eq(bounds.xMin, 0, 'computeShapeAABBs() should expand xMin for an outside stroke');
    eq(bounds.xMax, 4, 'computeShapeAABBs() should expand xMax for an outside stroke');

    // Center stroke expands box by half stroke width.
    const shape3 = makeShape({
        primitives: [circle],
        strokeWidth: 2,
        strokePosition: 'center',
    });
    aabbs = computeShapeAABBs(0, [{ id: 4, shape: shape3 }], 0.5);
    bounds = aabbs[0].bounds;
    eq(bounds.xMin, 0.5, 'computeShapeAABBs() should expand xMin by half the centred stroke width');
    eq(bounds.xMax, 3.5, 'computeShapeAABBs() should expand xMax by half the centred stroke width');

    // Inside stroke does not expand box.
    const shape4 = makeShape({
        primitives: [circle],
        strokeWidth: 2,
        strokePosition: 'inside',
    });
    aabbs = computeShapeAABBs(0, [{ id: 5, shape: shape4 }], 0.5);
    bounds = aabbs[0].bounds;
    eq(bounds.xMin, 1, 'computeShapeAABBs() should leave xMin unchanged for an inside stroke');
    eq(bounds.xMax, 3, 'computeShapeAABBs() should leave xMax unchanged for an inside stroke');

    // Multiple primitives union their boxes.
    const tri = new Primitive(null, 'no-flip', 'union', 'triangle-right', 0, 1, { x: -4, y: 3 });
    const shape5 = makeShape({
        primitives: [circle, tri],
        scale: 2,
        translate: { x: 1, y: 1 },
    });
    aabbs = computeShapeAABBs(0, [{ id: 6, shape: shape5 }], 1);
    bounds = aabbs[0].bounds;
    eq(bounds.xMin, -8, 'computeShapeAABBs() should union translated primitive bounds for xMin');
    eq(bounds.xMax, 7, 'computeShapeAABBs() should union translated primitive bounds for xMax');
    eq(bounds.yMin, -3, 'computeShapeAABBs() should union translated primitive bounds for yMin');
    eq(bounds.yMax, 9, 'computeShapeAABBs() should union translated primitive bounds for yMax');

    // Empty primitives returns huge fallback box.
    const shape6 = makeShape({ primitives: [] });
    aabbs = computeShapeAABBs(0, [{ id: 7, shape: shape6 }], 1);
    bounds = aabbs[0].bounds;
    eq(bounds.xMin, -1e6, 'computeShapeAABBs() should return the fallback minimum x for empty shapes');
    eq(bounds.xMax, 1e6, 'computeShapeAABBs() should return the fallback maximum x for empty shapes');

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
    eq(bounds.xMin, 0, 'computeShapeAABBs() should scale shape-unit stroke width with shape scale at xMin');
    eq(bounds.xMax, 8, 'computeShapeAABBs() should scale shape-unit stroke width with shape scale at xMax');

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
    eq(bounds.xMin, 1.5, 'computeShapeAABBs() should use world stroke units directly at xMin');
    eq(bounds.xMax, 6.5, 'computeShapeAABBs() should use world stroke units directly at xMax');

    // Primitive debug boxes are captured when colours are set.
    const dbgColor = new Color(10, 240, 80, 0.5);
    const debugPrim = new Primitive(dbgColor, 'no-flip', 'union', 'circle', 0, 1,
        { x: 0, y: 0 });
    const debugShape = makeShape({ primitives: [debugPrim] });
    aabbs = computeShapeAABBs(0, [{ id: 10, shape: debugShape }], 1);
    eq(aabbs[0].primitiveDebugAabbs.length, 1, 'computeShapeAABBs() should capture one primitive debug box when one debug colour is present');
    const debugEntry = aabbs[0].primitiveDebugAabbs[0];
    eq(debugEntry.color, dbgColor, 'computeShapeAABBs() should preserve the primitive debug colour reference');
    eq(debugEntry.bounds.xMin, -1, 'computeShapeAABBs() should record the primitive debug minimum x bound');
    eq(debugEntry.bounds.xMax, 1, 'computeShapeAABBs() should record the primitive debug maximum x bound');

};

export const testComputeShapeAabbs = () => {
    runComputeShapeAabbsCases();
    console.log('OK: All computeShapeAABBs() tests passed!');
};
