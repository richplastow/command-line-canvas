import { deepEqual as eq } from 'node:assert';
import { Canvas } from '../../src/models/canvas/canvas.js';
import { Color } from '../../src/models/color/color.js';
import { Pixel } from '../../src/models/pixel/pixel.js';
import { Primitive } from '../../src/models/primitive/primitive.js';
import { Shape } from '../../src/models/shape/shape.js';

/** #### Creates a shape with a rotated and flipped triangle
 * - No stroke, for clarity.
 */
const makeShapeWithRotatedFlippedTriangle = (primitiveRotate) => {
    const primitive = new Primitive(
        null,                          // debugPrimitiveAabb
        'flip-y',                      // flip
        'union',                       // joinMode
        'triangle-right',              // kind
        primitiveRotate,               // rotate
        1,                             // scale
        { x: 0, y: 0 },                // translate
    );
    return new Shape(
        'normal',                      // blendMode
        new Color(255, 255, 255, 255), // debugShapeAabb white
        'no-flip',                     // flip
        new Color(0, 0, 255, 255),     // ink blue
        new Color(255, 0, 0, 255),     // paper red
        'breton',                      // pattern
        0.5,                           // patternRatio
        2,                             // patternScale
        'pixel',                       // patternUnit
        [ primitive ],                 // primitives
        0,                             // rotate
        3.333,                         // scale
        new Color(0, 255, 0, 0),       // strokeColor transparent (no stroke)
        'center',                      // strokePosition
        'pixel',                       // strokeUnit
        0,                             // strokeWidth (disabled)
        { x: 0, y: 0 },                // translate
    );
};

/** #### Renders a rotated primitive on a fresh canvas */
const renderShape = (primitiveRotate, useBraille) => {
    const canvas = new Canvas(new Pixel(10, 10, 10), 40, 40);
    const shape = makeShapeWithRotatedFlippedTriangle(primitiveRotate);
    canvas.addShape(shape);
    return useBraille
        ? canvas.render('8color', 'braille')
        : canvas.render('monochrome', 'ansi');
};


// TESTS

// With primitiveRotate = 0.3 radians.
eq(
    renderShape(0.3, false),
    '                                        \n' +
    '                                        \n' +
    '                                        \n' +
    '                                        \n' +
    '         ██████████████████████         \n' +
    '         █▄▀███████████████████         \n' +
    '         ██  ▀█████████████████         \n' +
    '         ██▄   ▀███████████████         \n' +
    '         ███     ██████████████         \n' +
    '         ████      ████████████         \n' +
    '         ████▄      ▀██████████         \n' +
    '         █████        ▀████████         \n' +
    '         █████▄         ▀██████         \n' +
    '         ██████           ▀████         \n' +
    '         ███████            ▀██         \n' +
    '         ███████▄           ▄▄█         \n' +
    '         ████████    ▄▄▄▄██████         \n' +
    '         ██████████████████████         \n' +
    '                                        \n' +
    '                                        ',
);
eq(
    renderShape(0.3, true),
    '⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐\n' +
    '⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐\n' +
    '⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐\n' +
    '⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐\n' +
    '⢐⢐⢐⢐⢐⢐⢐⢐⢐⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢐⢐⢐⢐⢐⢐⢐⢐⢐\n' +
    '⢐⢐⢐⢐⢐⢐⢐⢐⢐⣿⢖⢟⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢐⢐⢐⢐⢐⢐⢐⢐⢐\n' +
    '⢐⢐⢐⢐⢐⢐⢐⢐⢐⣿⣿⢖⢖⢟⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢐⢐⢐⢐⢐⢐⢐⢐⢐\n' +
    '⢐⢐⢐⢐⢐⢐⢐⢐⢐⣿⣿⣶⢖⢖⢖⢟⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢐⢐⢐⢐⢐⢐⢐⢐⢐\n' +
    '⢐⢐⢐⢐⢐⢐⢐⢐⢐⣿⣿⣿⢖⢖⢖⢖⢖⢟⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢐⢐⢐⢐⢐⢐⢐⢐⢐\n' +
    '⢐⢐⢐⢐⢐⢐⢐⢐⢐⣿⣿⣿⣿⢖⢖⢖⢖⢖⢖⢟⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢐⢐⢐⢐⢐⢐⢐⢐⢐\n' +
    '⢐⢐⢐⢐⢐⢐⢐⢐⢐⣿⣿⣿⣿⢖⢖⢖⢖⢖⢖⢖⢟⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢐⢐⢐⢐⢐⢐⢐⢐⢐\n' +
    '⢐⢐⢐⢐⢐⢐⢐⢐⢐⣿⣿⣿⣿⣿⢖⢖⢖⢖⢖⢖⢖⢖⢟⣿⣿⣿⣿⣿⣿⣿⣿⢐⢐⢐⢐⢐⢐⢐⢐⢐\n' +
    '⢐⢐⢐⢐⢐⢐⢐⢐⢐⣿⣿⣿⣿⣿⣶⢖⢖⢖⢖⢖⢖⢖⢖⢖⢟⣿⣿⣿⣿⣿⣿⢐⢐⢐⢐⢐⢐⢐⢐⢐\n' +
    '⢐⢐⢐⢐⢐⢐⢐⢐⢐⣿⣿⣿⣿⣿⣿⢖⢖⢖⢖⢖⢖⢖⢖⢖⢖⢖⢟⣿⣿⣿⣿⢐⢐⢐⢐⢐⢐⢐⢐⢐\n' +
    '⢐⢐⢐⢐⢐⢐⢐⢐⢐⣿⣿⣿⣿⣿⣿⣿⢖⢖⢖⢖⢖⢖⢖⢖⢖⢖⢖⢖⢟⣿⣿⢐⢐⢐⢐⢐⢐⢐⢐⢐\n' +
    '⢐⢐⢐⢐⢐⢐⢐⢐⢐⣿⣿⣿⣿⣿⣿⣿⣶⢖⢖⢖⢖⢖⢖⢖⢖⢖⢖⢖⣶⣶⣿⢐⢐⢐⢐⢐⢐⢐⢐⢐\n' +
    '⢐⢐⢐⢐⢐⢐⢐⢐⢐⣿⣿⣿⣿⣿⣿⣿⣿⢖⢖⢖⢖⣶⣶⣶⣶⣿⣿⣿⣿⣿⣿⢐⢐⢐⢐⢐⢐⢐⢐⢐\n' +
    '⢐⢐⢐⢐⢐⢐⢐⢐⢐⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢐⢐⢐⢐⢐⢐⢐⢐⢐\n' +
    '⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐\n' +
    '⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐',
);

console.log('All rotate-and-flip e2e tests passed.');
