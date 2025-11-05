import { throws, deepStrictEqual as eq } from 'node:assert/strict';
import { validateChannel, validatePixel } from './pixel-validators.js';
import { Pixel } from './pixel.js';


// validateChannel() invalid.

// @ts-expect-error
throws(() => validateChannel(),
    { message: /^channel type is 'undefined' not 'number'$/});
// @ts-expect-error
throws(() => validateChannel('123', 'Pixel: r (red)'),
    { message: /^Pixel: r \(red\) type is 'string' not 'number'$/});
throws(() => validateChannel(parseInt('abc'), 'input'),
    { message: /^input NaN is not a valid number$/});
throws(() => validateChannel(-1, 'negative():'),
    { message: /^negative\(\): -1 is less than 0$/});
throws(() => validateChannel(255.00001, 'too big'),
    { message: /^too big 255\.00001 is greater than 255$/});


// validateChannel() valid.

eq(validateChannel(0, 'min():'), void 0);
eq(validateChannel(123), void 0);
eq(validateChannel(255, 'max'), void 0);


// validatePixel() invalid.

throws(() => validatePixel(null, 'invalidPixel'),
    { message: /^invalidPixel is null, not an object$/});
// @ts-expect-error
throws(() => validatePixel([]),
    { message: /^pixel is an array, not an object$/});
// @ts-expect-error
throws(() => validatePixel(),
    { message: /^pixel is type 'undefined' not 'object'$/});
// @ts-expect-error
throws(() => validatePixel('notPixel', 'fn(): px'),
    { message: /^fn\(\): px is type 'string' not 'object'$/});
// @ts-expect-error
throws(() => validatePixel(new Date(), 'nope'),
    { message: /^nope is an instance of 'Date' not 'Pixel'$/});

// validatePixel() valid.

eq(validatePixel(new Pixel(0, 12.34, 255), 'validPixel'), void 0);


console.log('All pixel-validators.js tests passed.');
