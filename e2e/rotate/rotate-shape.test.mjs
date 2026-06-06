import { deepEqual as eq } from 'node:assert';
import { Canvas } from '../../src/models/canvas/canvas.mjs';
import { Color } from '../../src/models/color/color.mjs';
import { Primitive } from '../../src/models/primitive/primitive.mjs';
import { Shape } from '../../src/models/shape/shape.mjs';


const runRotateShapeCases = () => {

    /** #### Creates a rotated shape
     * - Contains a right-angle triangle, to show rotation working.
     * - With stroke, to check stroke rotation.
     */
    const makeRotatedShape = (/** @type {number} */ shapeRotate) => {
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
            'no-flip',                     // flip
            new Color(0, 0, 255, 255),     // ink blue
            new Color(255, 0, 0, 255),     // paper red
            'breton',                      // pattern
            0.5,                           // patternRatio
            2,                             // patternScale
            'pixel',                       // patternUnit
            [ primitive ],                 // primitives
            shapeRotate,                   // rotate
            3.333,                         // scale
            new Color(0, 255, 0, 255),     // strokeColor green
            'center',                      // strokePosition
            'pixel',                       // strokeUnit
            4.125,                         // strokeWidth
            { x: 0, y: 0 },                // translate
        );
    };

    /** #### Renders a rotated shape on a fresh canvas */
    const renderShape = (/** @type {number} */ rotate) => {
        const canvas = new Canvas(0.85, new Color(10, 10, 10, 255), 40, 40);
        const shape = makeRotatedShape(rotate);
        canvas.addShape(shape);
        return canvas.render('8color', 'braille');
    };


    // TESTS

    // With rotate = π * 2 - 0.1 (slight anti-clockwise rotation).
    eq(
        renderShape(Math.PI * 2 - 0.1),
        '⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐\n' +
        '⢐⢐⢐⢐⢐⢐⢐⢐⢐⣴⣴⣴⣴⣴⣴⣴⣴⣴⣴⣴⣴⣴⣴⣴⣴⣴⣴⣴⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐\n' +
        '⢐⢐⢐⢐⢐⢐⢐⢐⢐⣿⣿⢻⢻⢻⢻⢻⢻⢻⢸⢸⢸⢸⢸⢸⢸⢸⢸⢻⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐\n' +
        '⢐⢐⢐⢐⢐⢐⢐⢐⢐⣿⢸⢸⢸⢸⢸⢸⢸⢸⢸⢸⢸⢸⢸⢸⢸⢸⢸⣼⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐\n' +
        '⢐⢐⢐⢐⢐⢐⢐⢐⢐⣿⢸⢸⢸⢸⢸⢜⢜⢜⢜⢜⢜⢜⢸⢸⢸⢸⣼⣿⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐\n' +
        '⢐⢐⢐⢐⢐⢐⢐⢐⢐⣿⢸⢸⢸⢸⢸⢖⢖⢖⢖⢖⢖⢸⢸⢸⢸⢸⣿⣿⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐\n' +
        '⢐⢐⢐⢐⢐⢐⢐⢐⢐⣿⢸⢸⢸⢸⢸⢖⢖⢖⢖⢖⢸⢸⢸⢸⢸⣿⣿⣿⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐\n' +
        '⢐⢐⢐⢐⢐⢐⢐⢐⢐⣿⣼⢸⢸⢸⢸⢖⢖⢖⢖⢲⢸⢸⢸⢸⣼⣿⣿⣿⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐\n' +
        '⢐⢐⢐⢐⢐⢐⢐⢐⢐⣿⣿⢸⢸⢸⢸⢖⢖⢖⢖⢸⢸⢸⢸⣼⣿⣿⣿⣿⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐\n' +
        '⢐⢐⢐⢐⢐⢐⢐⢐⢐⣿⣿⢸⢸⢸⢸⢲⢖⢖⢸⢸⢸⢸⢸⣿⣿⣿⣿⣿⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐\n' +
        '⢐⢐⢐⢐⢐⢐⢐⢐⢐⣿⣿⢸⢸⢸⢸⢸⢖⢸⢸⢸⢸⢸⣿⣿⣿⣿⣿⣿⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐\n' +
        '⢐⢐⢐⢐⢐⢐⢐⢐⢐⣿⣿⢸⢸⢸⢸⢸⢲⢸⢸⢸⢸⣿⣿⣿⣿⣿⣿⣿⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐\n' +
        '⢐⢐⢐⢐⢐⢐⢐⢐⢐⣿⣿⣼⢸⢸⢸⢸⢸⢸⢸⢸⣼⣿⣿⣿⣿⣿⣿⣿⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐\n' +
        '⢐⢐⢐⢐⢐⢐⢐⢐⢐⣿⣿⣿⢸⢸⢸⢸⢸⢸⢸⢸⣿⣿⣿⣿⣿⣿⣿⣿⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐\n' +
        '⢐⢐⢐⢐⢐⢐⢐⢐⢐⣿⣿⣿⢸⢸⢸⢸⢸⢸⢸⣿⣿⣿⣿⣿⣿⣿⣿⣿⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐\n' +
        '⢐⢐⢐⢐⢐⢐⢐⢐⢐⣿⣿⣿⢸⢸⢸⢸⢸⢸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐\n' +
        '⢐⢐⢐⢐⢐⢐⢐⢐⢐⣿⣿⣿⢸⢸⢸⢸⢸⣼⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐\n' +
        '⢐⢐⢐⢐⢐⢐⢐⢐⢐⣿⣿⣿⣼⢸⢸⢸⣼⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐\n' +
        '⢐⢐⢐⢐⢐⢐⢐⢐⢐⢛⢛⢛⢛⢛⢛⢛⢛⢛⢛⢛⢛⢛⢛⢛⢛⢛⢛⢛⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐\n' +
        '⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐',
        'rotate-shape e2e should render the expected near-360-degree rotation',
    );

    // With rotate = π/4 (45 degrees).
    eq(
        renderShape(0.785398163),
        '⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐\n' +
        '⢐⢐⢐⣴⣴⣴⣴⣴⣴⣴⣴⣴⣴⣴⣴⣴⣴⣴⣴⣴⣴⣴⣴⣴⣴⣴⣴⣴⣴⣴⣴⣴⣴⣴⣴⣴⣴⢐⢐⢐\n' +
        '⢐⢐⢐⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢻⢸⢸⢸⢸⢻⣿⣿⣿⣿⣿⣿⣿⣿⣿⢐⢐⢐\n' +
        '⢐⢐⢐⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢻⢸⢸⢸⢸⢸⢸⢸⢸⢻⣿⣿⣿⣿⣿⣿⣿⢐⢐⢐\n' +
        '⢐⢐⢐⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢻⢸⢸⢸⢸⢸⢜⢸⢸⢸⢸⢸⢸⢻⣿⣿⣿⣿⣿⢐⢐⢐\n' +
        '⢐⢐⢐⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢻⢸⢸⢸⢸⢸⢜⢖⢖⢖⢜⢸⢸⢸⢸⢸⢸⢻⣿⣿⣿⢐⢐⢐\n' +
        '⢐⢐⢐⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢻⢸⢸⢸⢸⢸⢜⢖⢖⢖⢖⢖⢖⢖⢜⢸⢸⢸⢸⢸⢸⢻⣿⢐⢐⢐\n' +
        '⢐⢐⢐⣿⣿⣿⣿⣿⣿⣿⣿⣿⢻⢸⢸⢸⢸⢸⢜⢖⢖⢖⢖⢖⢖⢖⢲⢲⢲⢸⢸⢸⢸⢸⢸⢸⣿⢐⢐⢐\n' +
        '⢐⢐⢐⣿⣿⣿⣿⣿⣿⣿⢻⢸⢸⢸⢸⢸⢜⢖⢖⢖⢲⢲⢲⢸⢸⢸⢸⢸⢸⢸⢸⢸⢸⢸⢸⣼⣿⢐⢐⢐\n' +
        '⢐⢐⢐⣿⣿⣿⣿⣿⢻⢸⢸⢸⢸⢸⢸⢲⢲⢸⢸⢸⢸⢸⢸⢸⢸⢸⢸⢸⢸⣼⣼⣼⣿⣿⣿⣿⣿⢐⢐⢐\n' +
        '⢐⢐⢐⣿⣿⣿⢻⢸⢸⢸⢸⢸⢸⢸⢸⢸⢸⢸⢸⢸⢸⢸⢸⣼⣼⣼⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢐⢐⢐\n' +
        '⢐⢐⢐⣿⢻⢸⢸⢸⢸⢸⢸⢸⢸⢸⢸⢸⢸⣼⣼⣼⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢐⢐⢐\n' +
        '⢐⢐⢐⣿⢸⢸⢸⢸⢸⢸⢸⣼⣼⣼⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢐⢐⢐\n' +
        '⢐⢐⢐⣿⣼⣼⣼⣼⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢐⢐⢐\n' +
        '⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐\n' +
        '⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐\n' +
        '⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐\n' +
        '⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐\n' +
        '⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐\n' +
        '⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐⢐',
        'rotate-shape e2e should render the expected 45-degree rotation',
    );

};

export const testRotateShape = () => {
    runRotateShapeCases();
    console.log('OK: All rotate-shape e2e tests passed!');
};
