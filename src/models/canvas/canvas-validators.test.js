import { throws, deepStrictEqual as eq } from 'node:assert/strict';
import { Color } from '../color/color.js';
import {
    validateBounds,
    validateCanvas,
    validateCanvasExtent,
    validateColorDepth,
    validateOutputFormat,
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
throws(() => validateCanvasExtent(3841, 'too big'),
    { message: /^too big 3841 is greater than 3840$/});


// validateCanvasExtent() valid.

eq(validateCanvasExtent(1, 'min():'), void 0);
eq(validateCanvasExtent(123), void 0);
eq(validateCanvasExtent(3840, 'max'), void 0);


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

const bg = new Color(12, 34, 56, 255);
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
    { message: /^myColorDepth is not one of '256color'\|'8color'\|'monochrome'\|'truecolor'$/});


// validateColorDepth() valid.

eq(validateColorDepth('256color'), void 0);
eq(validateColorDepth('8color', 'canvas.render(): colorDepth'), void 0);
eq(validateColorDepth('monochrome'), void 0);
eq(validateColorDepth('truecolor'), void 0);


// validateOutputFormat() invalid.

// @ts-expect-error
throws(() => validateOutputFormat(),
    { message: /^outputFormat is type 'undefined' not 'string'$/});
// @ts-expect-error
throws(() => validateOutputFormat(123, 'formatCheck'),
    { message: /^formatCheck is type 'number' not 'string'$/});
// @ts-expect-error
throws(() => validateOutputFormat('jpg', 'myOutputFormat'),
    { message: /^myOutputFormat is not one of 'ansi'\|'braille'\|'buffer'\|'html'$/});


// validateOutputFormat() valid.

eq(validateOutputFormat('ansi'), void 0);
eq(validateOutputFormat('braille'), void 0);
eq(validateOutputFormat('buffer', 'canvas.render(): outputFormat'), void 0);
eq(validateOutputFormat('html'), void 0);


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
const p = new Color(1, 2, 3, 255);
throws(() => validatePixels([[p, null, p]], 'myPixels'),
    { message: /^myPixels\[0\]\[1\] is null, not an object$/});
// @ts-expect-error
throws(() => validatePixels([[p, p], [p, p], [[p], p]], 'arr'),
    { message: /^arr\[2\]\[0\] is an array, not an object$/});
// @ts-expect-error
throws(() => validatePixels([[p, p, 'abc']], 'canvas.render(): pixels'),
    { message: /^canvas\.render\(\): pixels\[0\]\[2\] is type 'string' not 'object'$/});
// @ts-expect-error
throws(() => validatePixels([[{}]]),
    { message: /^pixels\[0\]\[0\] is an instance of 'Object' not 'Color'$/});
throws(() => validatePixels([[]]),
    { message: /^pixels extentX is zero$/});
const over3840X = Array(3841).fill(null).map(() => new Color(0, 0, 0, 255));
throws(() => validatePixels([over3840X]),
    { message: /^pixels extentX 3841 is greater than 3840$/});
throws(() => validatePixels([]),
    { message: /^pixels extentY is zero$/});
const over3840Y = Array(3841).fill(null).map(() => [new Color(0, 0, 0, 255)]);
throws(() => validatePixels(over3840Y),
    { message: /^pixels extentY 3841 is greater than 3840$/});
const px = new Color(0, 0, 0, 255);
throws(() => validatePixels([[px, px], [px], [px, px]], 'myPixels'),
    { message: /^myPixels\[1\] extentX 1 !== first row 2$/});


// validatePixels() valid.

const validPixels = [
    [new Color(0, 0, 0, 255), new Color(10, 10, 10, 255)],
    [new Color(20, 20, 20, 255), new Color(30, 30, 30, 255)],
    [new Color(40, 40, 40, 255), new Color(50, 50, 50, 255)],
];
eq(validatePixels(validPixels, 'testPixels'), void 0);


console.log('All canvas-validators.js tests passed.');
