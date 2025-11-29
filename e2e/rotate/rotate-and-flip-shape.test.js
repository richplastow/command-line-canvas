import { deepEqual as eq } from 'node:assert';
import { Canvas } from '../../src/models/canvas/canvas.js';
import { Color } from '../../src/models/color/color.js';
import { Primitive } from '../../src/models/primitive/primitive.js';
import { Shape } from '../../src/models/shape/shape.js';

/** #### Creates a rotated and flipped shape
 * - Contains a right-angle triangle, to show rotation and flip working.
 */
const makeRotatedFlippedShape = (shapeFlip, withStroke) => {
    const primitive = new Primitive(
        null,                          // debugPrimitiveAabb
        'no-flip',                     // flip
        'union',                       // joinMode
        'triangle-right',              // kind
        0,                             // rotate
        1,                             // scale
        { x: 0, y: 0 },                // translate
    );
    return new Shape(
        'normal',                      // blendMode
        new Color(255, 255, 255, 255), // debugShapeAabb white
        shapeFlip,                     // flip
        new Color(0, 0, 255, 255),     // ink blue
        new Color(255, 0, 0, 255),     // paper red
        'breton',                      // pattern
        0.5,                           // patternRatio
        2,                             // patternScale
        'pixel',                       // patternUnit
        [ primitive ],                 // primitives
        Math.PI + 0.25,                // rotate
        3.333,                         // scale
        new Color(0, 255, 0, 255),     // strokeColor green
        'center',                    // strokePosition
        'pixel',                     // strokeUnit
        withStroke ? 4.125 : 0,      // strokeWidth
        { x: 0, y: 0 },              // translate
    );
};

/** #### Renders a rotated and flipped shape on a fresh canvas */
const renderShape = (shape, useBraille) => {
    const canvas = new Canvas(new Color(10, 10, 10, 255), 40, 40);
    canvas.addShape(shape);
    return useBraille
        ? canvas.render('8color', 'braille')
        : canvas.render('monochrome', 'ansi');
};


// TESTS

// With flip = flip-y, no stroke.
eq(
    renderShape(makeRotatedFlippedShape('flip-y', false), false),
    '                                        \n' +
    '                                        \n' +
    '         ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄         \n' +
    '         ██████▀▀▀▀    ▀███████         \n' +
    '         ██▀            ███████         \n' +
    '         ███▄           ▀██████         \n' +
    '         █████           ██████         \n' +
    '         ██████▄         ▀█████         \n' +
    '         ████████▄        █████         \n' +
    '         ██████████▄      ▀████         \n' +
    '         ████████████      ████         \n' +
    '         █████████████▄    ▀███         \n' +
    '         ███████████████▄   ███         \n' +
    '         █████████████████▄ ▀██         \n' +
    '         ███████████████████ ██         \n' +
    '         ██████████████████████         \n' +
    '                                        \n' +
    '                                        \n' +
    '                                        \n' +
    '                                        ',
);

// With flip = flip-x-and-y, with stroke.
eq(
    renderShape(makeRotatedFlippedShape('flip-x-and-y', true), true),
    '⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐\n' +
    '⢐⢐⢐⢐⢐⢐⢐⣴⣴⣴⣴⣴⣴⣴⣴⣴⢰⢰⣴⣴⣴⣴⣴⣴⣴⣴⣴⣴⣴⣴⣴⣴⣴⢐⢐⢐⢐⢐⢐⢐\n' +
    '⢐⢐⢐⢐⢐⢐⢐⣿⣿⣿⣿⣿⣿⣿⢻⢸⢸⢸⢸⢸⢸⢸⢻⢻⢻⢻⣿⣿⣿⣿⣿⣿⣿⢐⢐⢐⢐⢐⢐⢐\n' +
    '⢐⢐⢐⢐⢐⢐⢐⣿⣿⣿⣿⣿⣿⣿⢸⢸⢸⢸⢸⢸⢸⢸⢸⢸⢸⢸⢸⢸⢸⢸⢻⢻⣿⢐⢐⢐⢐⢐⢐⢐\n' +
    '⢐⢐⢐⢐⢐⢐⢐⣿⣿⣿⣿⣿⣿⢻⢸⢸⢸⢸⣑⣑⣘⣘⣘⣘⢸⢸⢸⢸⢸⢸⢸⢸⣿⢐⢐⢐⢐⢐⢐⢐\n' +
    '⢐⢐⢐⢐⢐⢐⢐⣿⣿⣿⣿⣿⣿⢸⢸⢸⢸⢸⣑⣑⣑⣑⣑⣑⢱⢸⢸⢸⢸⢸⣼⣿⣿⢐⢐⢐⢐⢐⢐⢐\n' +
    '⢐⢐⢐⢐⢐⢐⢐⣿⣿⣿⣿⣿⢻⢸⢸⢸⢸⣑⣑⣑⣑⣑⣑⢸⢸⢸⢸⢸⢸⣼⣿⣿⣿⢐⢐⢐⢐⢐⢐⢐\n' +
    '⢐⢐⢐⢐⢐⢐⢐⣿⣿⣿⣿⣿⢸⢸⢸⢸⢸⣑⣑⣑⣑⢱⢸⢸⢸⢸⢸⣼⣿⣿⣿⣿⣿⢐⢐⢐⢐⢐⢐⢐\n' +
    '⢐⢐⢐⢐⢐⢐⢐⣿⣿⣿⣿⢻⢸⢸⢸⢸⣑⣑⣑⢱⢸⢸⢸⢸⢸⣼⣿⣿⣿⣿⣿⣿⣿⢐⢐⢐⢐⢐⢐⢐\n' +
    '⢐⢐⢐⢐⢐⢐⢐⣿⣿⣿⣿⢸⢸⢸⢸⢸⣑⢱⢸⢸⢸⢸⢸⣼⣿⣿⣿⣿⣿⣿⣿⣿⣿⢐⢐⢐⢐⢐⢐⢐\n' +
    '⢐⢐⢐⢐⢐⢐⢐⣿⣿⣿⢻⢸⢸⢸⢸⣑⢱⢸⢸⢸⢸⢸⣼⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢐⢐⢐⢐⢐⢐⢐\n' +
    '⢐⢐⢐⢐⢐⢐⢐⣿⣿⣿⢸⢸⢸⢸⢸⢸⢸⢸⢸⢸⣼⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢐⢐⢐⢐⢐⢐⢐\n' +
    '⢐⢐⢐⢐⢐⢐⢐⣿⣿⢻⢸⢸⢸⢸⢸⢸⢸⢸⣼⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢐⢐⢐⢐⢐⢐⢐\n' +
    '⢐⢐⢐⢐⢐⢐⢐⣿⣿⢸⢸⢸⢸⢸⢸⢸⢸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢐⢐⢐⢐⢐⢐⢐\n' +
    '⢐⢐⢐⢐⢐⢐⢐⣿⢻⢸⢸⢸⢸⢸⢸⣼⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢐⢐⢐⢐⢐⢐⢐\n' +
    '⢐⢐⢐⢐⢐⢐⢐⣿⢸⢸⢸⢸⢸⣼⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢐⢐⢐⢐⢐⢐⢐\n' +
    '⢐⢐⢐⢐⢐⢐⢐⣿⣼⣼⢸⣼⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢐⢐⢐⢐⢐⢐⢐\n' +
    '⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐\n' +
    '⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐\n' +
    '⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐',
);

console.log('All rotate-and-flip-shape e2e tests passed.');
