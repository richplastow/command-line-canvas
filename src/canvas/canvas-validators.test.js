import { throws, deepStrictEqual as eq } from 'node:assert/strict';
import { Pixel } from '../pixel/pixel.js';
import { validateCanvasExtent, validateCanvas } from './canvas-validators.js';
import { Canvas } from './canvas.js';


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


console.log(`All canvas-validators.js tests passed.`);
