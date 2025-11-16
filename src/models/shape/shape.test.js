import { throws, deepEqual as eq } from 'node:assert';
import { Color } from '../color/color.js';
import { Primitive } from '../primitive/primitive.js';
import { Shape } from './shape.js';


// `new Shape` invalid.

const ink = new Color(0, 0, 0, 1);
const paper = new Color(1, 1, 1, 1);
const stroke = new Color(1, 0, 0, 1);
const primitive = new Primitive(null, 'no-flip', 'union', 'circle', 0, 1, { x: 0, y: 0 });

/** @type {{
    blendMode: 'multiply'|'normal'|'overlay'|'screen',
    debugShapeAabb: Color|null,
    flip: 'flip-x'|'flip-x-and-y'|'flip-y'|'no-flip',
    ink: Color,
    paper: Color,
    pattern: 'all-ink'|'all-paper'|'breton'|'pinstripe',
    patternRatio: number,
    patternScale: number,
    patternUnit: 'pixel'|'shape'|'world',
    primitives: Primitive[],
    rotate: number,
    scale: number,
    strokeColor: Color,
    strokePosition: 'inside'|'center'|'outside',
    strokeUnit: 'pixel'|'shape'|'world',
    strokeWidth: number,
    translate: { x: number, y: number },
}} */
const defaults = {
    blendMode: 'normal',
    debugShapeAabb: null,
    flip: 'no-flip',
    ink,
    paper,
    pattern: 'all-ink',
    patternRatio: 0.5,
    patternScale: 1,
    patternUnit: 'pixel',
    primitives: [primitive],
    rotate: 0,
    scale: 1,
    strokeColor: stroke,
    strokePosition: 'center',
    strokeUnit: 'pixel',
    strokeWidth: 0,
    translate: { x: 0, y: 0 },
};

const makeShape = (overrides = {}) => {
    const opts = { ...defaults, ...overrides };
    return new Shape(
        opts.blendMode,
        opts.debugShapeAabb,
        opts.flip,
        opts.ink,
        opts.paper,
        opts.pattern,
        opts.patternRatio,
        opts.patternScale,
        opts.patternUnit,
        opts.primitives,
        opts.rotate,
        opts.scale,
        opts.strokeColor,
        opts.strokePosition,
        opts.strokeUnit,
        opts.strokeWidth,
        opts.translate,
    );
};

// @ts-expect-error
throws(() => new Shape(), {
    message: /^Shape: blendMode is type 'undefined' not 'string'$/ });
throws(() => makeShape({ blendMode: 'invalid' }), {
    message: /^Shape: blendMode is not one of 'multiply'\|'normal'\|'overlay'\|'screen'$/ });
throws(() => makeShape({ debugShapeAabb: 123 }), {
    message: /^Shape: debugShapeAabb is type 'number' not 'object'$/ });
throws(() => makeShape({ flip: 'nope' }), {
    message: /^Shape: flip is not one of 'flip-x'\|'flip-x-and-y'\|'flip-y'\|'no-flip'$/ });
throws(() => makeShape({ ink: null }), {
    message: /^Shape: ink is null, not an object$/ });
throws(() => makeShape({ paper: 'not-a-color' }), {
    message: /^Shape: paper is type 'string' not 'object'$/ });
throws(() => makeShape({ pattern: 'not-a-pattern' }), {
    message: /^Shape: pattern is not one of 'all-ink'\|'all-paper'\|'breton'\|'pinstripe'$/ });
throws(() => makeShape({ patternRatio: 'large' }), {
    message: /^Shape: patternRatio is type 'string' not 'number'$/ });
throws(() => makeShape({ patternRatio: 1.1 }), {
    message: /^Shape: patternRatio 1.1 is not between 0 and 1$/ });
throws(() => makeShape({ patternRatio: -0.1 }), {
    message: /^Shape: patternRatio -0.1 is not between 0 and 1$/ });
throws(() => makeShape({ patternScale: 'big' }), {
    message: /^Shape: patternScale is type 'string' not 'number'$/ });
throws(() => makeShape({ patternScale: 0 }), {
    message: /^Shape: patternScale 0 is not greater than 0$/ });
throws(() => makeShape({ patternUnit: 5 }), {
    message: /^Shape: patternUnit is type 'number' not 'string'$/ });
throws(() => makeShape({ patternUnit: 'nope' }), {
    message: /^Shape: patternUnit is not one of 'pixel'\|'shape'\|'world'$/ });
throws(() => makeShape({ primitives: null }), {
    message: /^Shape: primitives is null, not an object$/ });
throws(() => makeShape({ rotate: Number.NaN }), {
    message: /^Shape: rotate NaN is not a valid number$/ });
throws(() => makeShape({ scale: null }), {
    message: /^Shape: scale is type 'object' not 'number'$/ });
throws(() => makeShape({ strokeColor: [] }), {
    message: /^Shape: strokeColor is an array, not an object$/ });
throws(() => makeShape({ strokePosition: 'top' }), {
    message: /^Shape: strokePosition is not one of 'inside'\|'center'\|'outside'$/ });
throws(() => makeShape({ strokeUnit: 'invalid' }), {
    message: /^Shape: strokeUnit is not one of 'pixel'\|'shape'\|'world'$/ });
throws(() => makeShape({ strokeWidth: -1 }), {
    message: /^Shape: strokeWidth -1 is less than 0$/ });
throws(() => makeShape({ translate: null }), {
    message: /^Shape: translate is null, not an object$/ });


// `new Shape` valid.

const shape = makeShape();

eq(shape.blendMode, defaults.blendMode);
eq(shape.flip, defaults.flip);
eq(shape.ink, defaults.ink);
eq(shape.paper, defaults.paper);
eq(shape.pattern, defaults.pattern);
eq(shape.patternRatio, defaults.patternRatio);
eq(shape.patternScale, defaults.patternScale);
eq(shape.patternUnit, defaults.patternUnit);
eq(shape.primitives, defaults.primitives);
eq(shape.rotate, defaults.rotate);
eq(shape.scale, defaults.scale);
eq(shape.strokeColor, defaults.strokeColor);
eq(shape.strokePosition, defaults.strokePosition);
eq(shape.strokeUnit, defaults.strokeUnit);
eq(shape.strokeWidth, defaults.strokeWidth);
eq(shape.translate, defaults.translate);

// debugShapeAabb stored.
const dbg = new Color(10, 20, 30, 0.75);
const sDbg = makeShape({ debugShapeAabb: dbg });
eq(sDbg.debugShapeAabb, dbg);


console.log('All Shape tests passed.');