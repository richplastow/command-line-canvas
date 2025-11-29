import { throws, deepEqual as eq } from 'node:assert';
import { Color } from '../color/color.js';
import { Primitive } from './primitive.js';


// `new Primitive` invalid.

// @ts-expect-error
throws(() => new Primitive(), {
    message: /^Primitive: debugPrimitiveAabb is type 'undefined' not 'object'$/ });
// @ts-expect-error
throws(() => new Primitive('not-a-color', 'no-flip', 'union', 'circle', 0, 1,
    { x: 0, y: 0 }), {
    message: /^Primitive: debugPrimitiveAabb is type 'string' not 'object'$/ });
// @ts-expect-error
throws(() => new Primitive(null, 'nope', 'union', 'circle', 0, 1,
    { x: 0, y: 0 }), {
    message: /^Primitive: flip is not one of 'flip-x'\|'flip-x-and-y'\|'flip-y'\|'no-flip'$/ });
// @ts-expect-error
throws(() => new Primitive(null, 'no-flip', 'invalid', 'circle', 0, 1,
    { x: 0, y: 0 }), {
    message: /^Primitive: joinMode is not one of 'union'\|'difference'$/ });
// @ts-expect-error
throws(() => new Primitive(null, 'no-flip', 'union', 'pentagon', 0, 1,
    { x: 0, y: 0 }), {
    message: /^Primitive: kind is not one of 'circle'\|'square'\|'triangle-right'$/ });
// @ts-expect-error
throws(() => new Primitive(null, 'no-flip', 'union', 'circle', '0', 1,
    { x: 0, y: 0 }), {
    message: /^Primitive: rotate type is 'string' not 'number'$/ });
throws(() => new Primitive(null, 'no-flip', 'union', 'circle', NaN, 1,
    { x: 0, y: 0 }), {
    message: /^Primitive: rotate NaN is not a valid number$/ });
throws(() => new Primitive(null, 'no-flip', 'union', 'circle', 0, null,
    { x: 0, y: 0 }), {
    message: /^Primitive: scale is type 'object' not 'number'$/ });
throws(() => new Primitive(null, 'no-flip', 'union', 'circle', 0, -1,
    { x: 0, y: 0 }), {
    message: /^Primitive: scale -1 is less than 0$/ });
throws(() => new Primitive(null, 'no-flip', 'union', 'circle', 0, 1, null), {
    message: /^Primitive: translate is null, not an object$/ });
throws(() => new Primitive(null, 'no-flip', 'union', 'circle', 0, 1,
    { x: NaN, y: 0 }), {
    message: /^Primitive: translate\.x NaN is not a valid number$/ });


// `new Primitive` valid.

const debugBlue = new Color(0, 0, 255, 128);

eq(new Primitive(debugBlue, 'flip-y', 'union', 'circle', 0, 1,
    { x: 0, y: 0 }), {
    debugPrimitiveAabb: debugBlue,
    flip: 'flip-y',
    joinMode: 'union',
    kind: 'circle',
    rotate: 0,
    scale: 1,
    translate: { x: 0, y: 0 },
});

eq(new Primitive(null, 'flip-x-and-y', 'difference', 'triangle-right', 3.14159,
    2.5, { x: -10, y: 20 }), {
    debugPrimitiveAabb: null,
    flip: 'flip-x-and-y',
    joinMode: 'difference',
    kind: 'triangle-right',
    rotate: 3.14159,
    scale: 2.5,
    translate: { x: -10, y: 20 },
});

eq(new Primitive(null, 'no-flip', 'union', 'square', -1.5, 0,
    { x: 100, y: -50 }), {
    debugPrimitiveAabb: null,
    flip: 'no-flip',
    joinMode: 'union',
    kind: 'square',
    rotate: -1.5,
    scale: 0,
    translate: { x: 100, y: -50 },
});


console.log('All Primitive tests passed.');
