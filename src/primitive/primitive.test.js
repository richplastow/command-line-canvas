import { throws, deepEqual as eq } from 'node:assert';
import { Primitive } from './primitive.js';


// `new Primitive` invalid.

// @ts-expect-error
throws(() => new Primitive(), {
    message: /^Primitive: joinMode is type 'undefined' not 'string'$/ });
// @ts-expect-error
throws(() => new Primitive('invalid', 'circle', 0, { x: 1, y: 1 },
    { x: 0, y: 0 }), {
    message: /^Primitive: joinMode is not one of 'union'\|'difference'$/ });
// @ts-expect-error
throws(() => new Primitive('union', 'pentagon', 0, { x: 1, y: 1 },
    { x: 0, y: 0 }), {
    message: /^Primitive: kind is not one of 'circle'\|'square'\|'triangle'$/ });
// @ts-expect-error
throws(() => new Primitive('union', 'circle', '0', { x: 1, y: 1 },
    { x: 0, y: 0 }), {
    message: /^Primitive: rotate type is 'string' not 'number'$/ });
throws(() => new Primitive('union', 'circle', NaN, { x: 1, y: 1 },
    { x: 0, y: 0 }), {
    message: /^Primitive: rotate NaN is not a valid number$/ });
throws(() => new Primitive('union', 'circle', 0, null, { x: 0, y: 0 }), {
    message: /^Primitive: scale is null, not an object$/ });
throws(() => new Primitive('union', 'circle', 0, { x: -1, y: 1 },
    { x: 0, y: 0 }), {
    message: /^Primitive: scale\.x -1 is less than 0$/ });
throws(() => new Primitive('union', 'circle', 0, { x: 1, y: 1 }, null), {
    message: /^Primitive: translate is null, not an object$/ });
throws(() => new Primitive('union', 'circle', 0, { x: 1, y: 1 },
    { x: NaN, y: 0 }), {
    message: /^Primitive: translate\.x NaN is not a valid number$/ });


// `new Primitive` valid.

eq(new Primitive('union', 'circle', 0, { x: 1, y: 1 }, { x: 0, y: 0 }), {
    joinMode: 'union',
    kind: 'circle',
    rotate: 0,
    scale: { x: 1, y: 1 },
    translate: { x: 0, y: 0 },
});

eq(new Primitive('difference', 'triangle', 3.14159, { x: 2.5, y: 0.5 },
    { x: -10, y: 20 }), {
    joinMode: 'difference',
    kind: 'triangle',
    rotate: 3.14159,
    scale: { x: 2.5, y: 0.5 },
    translate: { x: -10, y: 20 },
});

eq(new Primitive('union', 'square', -1.5, { x: 0, y: 3 }, { x: 100, y: -50 }), {
    joinMode: 'union',
    kind: 'square',
    rotate: -1.5,
    scale: { x: 0, y: 3 },
    translate: { x: 100, y: -50 },
});


console.log('All Primitive tests passed.');
