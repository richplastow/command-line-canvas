import { throws, deepStrictEqual as eq } from 'node:assert/strict';
import { Pixel } from '../pixel/pixel.js';
import {
    validateBounds,
    validateCanvasExtent,
    validateCanvas,
    validateColorDepth,
    validatePixels,
} from './canvas-validators.js';
import { Canvas } from './canvas.js';


// validateBounds() invalid.

throws(() => validateBounds(null, 'myBounds'),
    { message: /^myBounds is null, not an object$/});
// @ts-expect-error
throws(() => validateBounds([]),
    { message: /^bounds is an array, not an object$/});
// @ts-expect-error
throws(() => validateBounds('notAnObject', 'fn(): bounds'),
    { message: /^fn\(\): bounds is type 'string' not 'object'$/});
// @ts-expect-error
throws(() => validateBounds(12345),
    { message: /^bounds is type 'number' not 'object'$/});
// @ts-expect-error
throws(() => validateBounds({}, 'input'),
    { message: /^input.xMin is type 'undefined' not 'number'$/});
// @ts-expect-error
throws(() => validateBounds({ xMin: 0, xMax: 10, yMin: 0, yMax: '20' }, 'testBounds'),
    { message: /^testBounds\.yMax is type 'string' not 'number'$/});
throws(() => validateBounds({ xMin: 0, xMax: 10.5, yMin: 0, yMax: 20 }, 'myBounds'),
    { message: /^myBounds\.xMax 10\.5 is not an integer$/});
throws(() => validateBounds({ xMin: 5, xMax: 4, yMin: 0, yMax: 20 }, 'boundsCheck'),
    { message: /^boundsCheck\.xMax 4 is less than or equal to xMin 5$/});
throws(() => validateBounds({ xMin: 5, xMax: 5, yMin: 0, yMax: 20 }, 'boundsCheck'),
    { message: /^boundsCheck\.xMax 5 is less than or equal to xMin 5$/});
throws(() => validateBounds({ xMin: 0, xMax: 10, yMin: -1, yMax: 20 }, 'negativeYMin'),
    { message: /^negativeYMin\.yMin -1 is less than 0$/});
throws(() => validateBounds({ xMin: 0, xMax: 10, yMin: 0, yMax: -5 }, 'badYMax'),
    { message: /^badYMax\.yMax -5 is less than or equal to yMin 0$/});
throws(() => validateBounds({ xMin: 0, xMax: 10, yMin: 0, yMax: 0 }, 'badYMax'),
    { message: /^badYMax\.yMax 0 is less than or equal to yMin 0$/});

// validateCanvasExtent() invalid.

// @ts-expect-error
throws(() => validateCanvasExtent(),
    { message: /^extent type is 'undefined' not 'number'$/});
// @ts-expect-error
throws(() => validateCanvasExtent('123', 'Canvas: width'),
    { message: /^Canvas: width type is 'string' not 'number'$/});
throws(() => validateCanvasExtent(12.34, 'input'),
    { message: /^input 12\.34 is not an integer$/});
throws(() => validateCanvasExtent(NaN),
    { message: /^extent NaN is not an integer$/});
throws(() => validateCanvasExtent(0, 'zero:'),
    { message: /^zero: 0 is less than 1$/});
throws(() => validateCanvasExtent(256, 'too big'),
    { message: /^too big 256 is greater than 255$/});


// validateCanvasExtent() valid.

eq(validateCanvasExtent(1, 'min():'), void 0);
eq(validateCanvasExtent(123), void 0);
eq(validateCanvasExtent(255, 'max'), void 0);


// validateCanvas() invalid.

throws(() => validateCanvas(null, 'invalidCanvas'),
    { message: /^invalidCanvas is null, not an object$/});
// @ts-expect-error
throws(() => validateCanvas([]),
    { message: /^canvas is an array, not an object$/});
// @ts-expect-error
throws(() => validateCanvas(),
    { message: /^canvas is type 'undefined' not 'object'$/});
// @ts-expect-error
throws(() => validateCanvas('notCanvas', 'fn(): canvas'),
    { message: /^fn\(\): canvas is type 'string' not 'object'$/});
// @ts-expect-error
throws(() => validateCanvas(new Date(), 'nope'),
    { message: /^nope is an instance of 'Date' not 'Canvas'$/});


// validateCanvas() valid.

const bg = new Pixel(12, 34, 56);
eq(validateCanvas(new Canvas(bg, 12, 34), 'validCanvas'), void 0);


// validateColorDepth() invalid.

// @ts-expect-error
throws(() => validateColorDepth(),
    { message: /^colorDepth is type 'undefined' not 'string'$/});
// @ts-expect-error
throws(() => validateColorDepth(24, 'depthCheck'),
    { message: /^depthCheck is type 'number' not 'string'$/});
// @ts-expect-error
throws(() => validateColorDepth('16color', 'myColorDepth'),
    { message: /^myColorDepth is not one of 'monochrome'\|'256color'\|'truecolor'$/});


// validateColorDepth() valid.

eq(validateColorDepth('monochrome'), void 0);
eq(validateColorDepth('256color', 'Canvas.render(): colorDepth'), void 0);
eq(validateColorDepth('truecolor'), void 0);


// validatePixels() invalid.

throws(() => validatePixels(null),
    { message: /^pixels is null, not an object$/});
// @ts-expect-error
throws(() => validatePixels(123),
    { message: /^pixels is type 'number' not 'object'$/});
// @ts-expect-error
throws(() => validatePixels({}),
    { message: /^pixels is not an array$/});
throws(() => validatePixels([null]),
    { message: /^pixels\[0\] is null, not an object$/});
// @ts-expect-error
throws(() => validatePixels(['abc']),
    { message: /^pixels\[0\] is type 'string' not 'object'$/});
// @ts-expect-error
throws(() => validatePixels([new Date()]),
    { message: /^pixels\[0\] is not an array$/});
const p = new Pixel(1, 2, 3);
throws(() => validatePixels([[p, null, p]], 'myPixels'),
    { message: /^myPixels\[0\]\[1\] is null, not an object$/});
// @ts-expect-error
throws(() => validatePixels([[p, p], [p, p], [[p], p]], 'arr'),
    { message: /^arr\[2\]\[0\] is an array, not an object$/});
// @ts-expect-error
throws(() => validatePixels([[p, p, 'abc']], 'Canvas.render(): pixels'),
    { message: /^Canvas\.render\(\): pixels\[0\]\[2\] is type 'string' not 'object'$/});
// @ts-expect-error
throws(() => validatePixels([[{}]]),
    { message: /^pixels\[0\]\[0\] is an instance of 'Object' not 'Pixel'$/});
throws(() => validatePixels([[]]),
    { message: /^pixels extentX is zero$/});
const over255X = Array(256).fill(null).map(() => new Pixel(0, 0, 0));
throws(() => validatePixels([over255X]),
    { message: /^pixels extentX 256 is greater than 255$/});
throws(() => validatePixels([]),
    { message: /^pixels extentY is zero$/});
const over255Y = Array(256).fill(null).map(() => [new Pixel(0, 0, 0)]);
throws(() => validatePixels(over255Y),
    { message: /^pixels extentY 256 is greater than 255$/});
const px = new Pixel(0, 0, 0);
throws(() => validatePixels([[px, px], [px], [px, px]], 'myPixels'),
    { message: /^myPixels\[1\] extentX 1 !== first row 2$/});


// validatePixels() valid.

const validPixels = [
    [new Pixel(0, 0, 0), new Pixel(10, 10, 10)],
    [new Pixel(20, 20, 20), new Pixel(30, 30, 30)],
    [new Pixel(40, 40, 40), new Pixel(50, 50, 50)],
];
eq(validatePixels(validPixels, 'testPixels'), void 0);


console.log('All canvas-validators.js tests passed.');
