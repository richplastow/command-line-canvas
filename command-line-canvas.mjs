import { COMMAND_LINE_CANVAS_BRAND } from './src/clc-constants.mjs';
import { Canvas } from './src/models/canvas/canvas.mjs';
import { Color } from './src/models/color/color.mjs';
import { Primitive } from './src/models/primitive/primitive.mjs';
import { Shape } from './src/models/shape/shape.mjs';

const VERSION = '0.0.1';

/** @typedef CommandLineCanvasOptions
 * @property {number} antiAliasRegion Anti-aliasing region width in pixels.
 * @property {Color} background A colour to fill across the canvas's background.
 * @property {Uint8ClampedArray} [pixels] Optional existing pixel buffer.
 * @property {number} xExtent The canvas's width in pixels.
 * @property {number} yExtent The canvas's height in pixels.
 */

/** #### Main JavaScript entry point for CommandLineCanvas
 * - Exposes `Color`, `Primitive`, and `Shape` as static properties.
 * - Instantiates an internal `Canvas` accessible via the `canvas` property.
 */
export class CommandLineCanvas {

    static Color = Color;
    static Primitive = Primitive;
    static Shape = Shape;
    static version = VERSION;

    /** @type {Canvas} */
    canvas;

    constructor(/** @type {CommandLineCanvasOptions} */ options = /** @type {*} */ ({})) {
        const { antiAliasRegion, background, pixels, xExtent, yExtent } = options;
        // Brand this instance so src/ modules can verify it without importing
        // this module (which would create a circular dependency).
        this[COMMAND_LINE_CANVAS_BRAND] = true;

        this.canvas = new Canvas(
            antiAliasRegion,
            background,
            xExtent,
            yExtent,
            pixels,
        );
    }
}
