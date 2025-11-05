import { throws, deepEqual as eq } from 'node:assert';
import { Color } from '../color/color.js';
import { Primitive } from '../primitive/primitive.js';
import { Shape } from './shape.js';


// `new Shape` invalid.

const c = new Color(0, 0, 0, 1);
const p = new Primitive('union', 'circle', 0, { x: 1, y: 1 }, { x: 0, y: 0 });

// @ts-expect-error
throws(() => new Shape(), {
    message: /^Shape: blendMode is type 'undefined' not 'string'$/ });
// @ts-expect-error
throws(() => new Shape('invalid', c, c, 'all-ink', [p], 0, { x: 1, y: 1 },
    c, 'center', 0, { x: 0, y: 0 }), {
    message: /^Shape: blendMode is not one of 'multiply'\|'normal'\|'overlay'\|'screen'$/ });
throws(() => new Shape('normal', null, c, 'all-ink', [p], 0, { x: 1, y: 1 },
    c, 'center', 0, { x: 0, y: 0 }), {
    message: /^Shape: ink is null, not an object$/ });
// @ts-expect-error
throws(() => new Shape('normal', c, 'not a color', 'all-ink', [p], 0,
    { x: 1, y: 1 }, c, 'center', 0, { x: 0, y: 0 }), {
    message: /^Shape: paper is type 'string' not 'object'$/ });
// @ts-expect-error
throws(() => new Shape('normal', c, c, 'invalid', [p], 0, { x: 1, y: 1 },
    c, 'center', 0, { x: 0, y: 0 }), {
    message: /^Shape: pattern is not one of 'all-ink'\|'all-paper'\|'breton'\|'pinstripe'$/ });
throws(() => new Shape('normal', c, c, 'all-ink', null, 0, { x: 1, y: 1 },
    c, 'center', 0, { x: 0, y: 0 }), {
    message: /^Shape: primitives is null, not an object$/ });
throws(() => new Shape('normal', c, c, 'all-ink', [p], NaN, { x: 1, y: 1 },
    c, 'center', 0, { x: 0, y: 0 }), {
    message: /^Shape: rotate NaN is not a valid number$/ });
throws(() => new Shape('normal', c, c, 'all-ink', [p], 0, null,
    c, 'center', 0, { x: 0, y: 0 }), {
    message: /^Shape: scale is null, not an object$/ });
throws(() => new Shape('normal', c, c, 'all-ink', [p], 0, { x: 1, y: 1 },
// @ts-expect-error
    [], 'center', 0, { x: 0, y: 0 }), {
    message: /^Shape: strokeColor is an array, not an object$/ });
throws(() => new Shape('normal', c, c, 'all-ink', [p], 0, { x: 1, y: 1 },
// @ts-expect-error
    c, 'top', 0, { x: 0, y: 0 }), {
    message: /^Shape: strokePosition is not one of 'inside'\|'center'\|'outside'$/ });
throws(() => new Shape('normal', c, c, 'all-ink', [p], 0, { x: 1, y: 1 },
    c, 'center', -1, { x: 0, y: 0 }), {
    message: /^Shape: strokeWidth -1 is less than 0$/ });
throws(() => new Shape('normal', c, c, 'all-ink', [p], 0, { x: 1, y: 1 },
    c, 'center', 0, null), {
    message: /^Shape: translate is null, not an object$/ });


// `new Shape` valid.

const shape1 = new Shape('normal', c, c, 'all-ink', [p], 0, { x: 1, y: 1 },
    c, 'center', 0, { x: 0, y: 0 });

eq(shape1.blendMode, 'normal');
eq(shape1.ink, c);
eq(shape1.paper, c);
eq(shape1.pattern, 'all-ink');
eq(shape1.primitives, [p]);
eq(shape1.rotate, 0);
eq(shape1.scale, { x: 1, y: 1 });
eq(shape1.strokeColor, c);
eq(shape1.strokePosition, 'center');
eq(shape1.strokeWidth, 0);
eq(shape1.translate, { x: 0, y: 0 });

const ink = new Color(255, 0, 0, 1);
const paper = new Color(0, 255, 0, 0.5);
const stroke = new Color(0, 0, 255, 1);
const p1 = new Primitive('union', 'square', 1.5, { x: 2, y: 2 },
    { x: 10, y: 20 });
const p2 = new Primitive('difference', 'circle', 0, { x: 1, y: 1 },
    { x: 5, y: 5 });

const shape2 = new Shape('overlay', ink, paper, 'breton', [p1, p2], 3.14,
    { x: 0.5, y: 2 }, stroke, 'outside', 2.5, { x: -10, y: 30 });

eq(shape2.blendMode, 'overlay');
eq(shape2.ink, ink);
eq(shape2.paper, paper);
eq(shape2.pattern, 'breton');
eq(shape2.primitives, [p1, p2]);
eq(shape2.rotate, 3.14);
eq(shape2.scale, { x: 0.5, y: 2 });
eq(shape2.strokeColor, stroke);
eq(shape2.strokePosition, 'outside');
eq(shape2.strokeWidth, 2.5);
eq(shape2.translate, { x: -10, y: 30 });


console.log('All Shape tests passed.');
