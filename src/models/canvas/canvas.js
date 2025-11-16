import { SIDE_IN_WORLD_UNITS } from '../../clc-constants.js';
import { encodeAnsi } from '../../utilities/encoders/encode-ansi.js';
import { encodeBraille } from '../../utilities/encoders/encode-braille.js';
import { encodeBuffer } from '../../utilities/encoders/encode-buffer.js';
import { encodeHtml } from '../../utilities/encoders/encode-html.js';
import { rasterize } from '../../utilities/rasterize/rasterize.js';
import { validatePixel } from '../pixel/pixel-validators.js';
import { Pixel } from '../pixel/pixel.js';
import {
    validateCanvasExtent,
    validateColorDepth,
    validateOutputFormat,
} from './canvas-validators.js';

/**
 * @typedef {import('../shape/shape.js').Shape} Shape
 */

/** #### An ANSI canvas */
export class Canvas {
    /** A pixel to clone across the canvas's background
     * @type {Pixel} */
    background = null;

    /** #### The canvas's width
     * @type {number} */
    xExtent = 0;

    /** #### The canvas's height
     * @type {number} */
    yExtent = 0;

    /** Anti-aliasing region width in pixels
     * @type {number} */
    #aaRegionPixels = 0;

    /** #### ID of the most recently added shape
     * @type {number} */
    #lastShapeId = 0;

    /** #### `true` if `pixels` needs to be recomposed before rendering
     * - If `false`, the existing `pixels` can be rerendered as-is
     * - `needsUpdate` will be set to `true` after most changes to the canvas
     * @type {boolean} */
    #needsUpdate = false;

    /** #### Private 2D array containing the canvas's pixels
     * @type {Pixel[][]} */
    #pixels = [];

    /** #### Private list of Shapes
     * - In the order that they should be composited
     * @type {{id: number, shape: Shape}[]} */
    #shapes = [];

    /** World units per pixel
     * @type {number} */
    #worldUnitsPerPixel = 0;

    /**
     * @param {Pixel} background A pixel to clone across the canvas's background
     * @param {number} xExtent The canvas's width
     * @param {number} yExtent The canvas's height
     */
    constructor(background, xExtent, yExtent) {
        validatePixel(background, 'Canvas: background');
        validateCanvasExtent(xExtent, 'Canvas: xExtent');
        validateCanvasExtent(yExtent, 'Canvas: yExtent');

        this.#aaRegionPixels = 0.85; // anti-alias region width in pixels (1 would be a little too soft)
        this.background = background;
        this.#worldUnitsPerPixel = SIDE_IN_WORLD_UNITS / Math.min(xExtent, yExtent);
        this.xExtent = xExtent;
        this.yExtent = yExtent;

        // Create a canvas of pixels with the specified dimensions, and fill
        // it with the background colour.
        this.#pixels = Array.from({ length: yExtent }, () =>
            Array.from({ length: xExtent }, () =>
                new Pixel(
                    background.r,
                    background.g,
                    background.b,
                )
            )
        );
    }

    /** #### Appends a shape to the canvas
     * @param {Shape} shape The shape to add
     * @returns {number} The shape's ID - can be used to edit it later
     */
    addShape(shape) {
        const id = this.#lastShapeId;
        this.#shapes.push({ id, shape });
        this.#needsUpdate = true; // TODO optimise by only setting this if shape can affect pixels
        this.#lastShapeId = id + 1; // ready for the next shape
        return id;
    }

    /** #### Rasterises the canvas, and then encodes the pixels ready for display
     * - For 'ansi', 'braille', and 'html' output formats, encoded output will be a string
     * - For 'buffer', the encoded output will be a Uint8Array
     * @param {'256color'|'8color'|'monochrome'|'truecolor'} colorDepth
     *     Determines colours per channel (ignored for 'buffer' output)
    * @param {'ansi'|'braille'|'buffer'|'html'} outputFormat
     *     The output format to use
     * @param {string} [xpx='Canvas render():']
     *     Optional exception prefix, e.g. 'fn():'
     * @returns {string | Uint8Array<ArrayBufferLike>}
     *     The encoded output, in the requested format
     */
    render(colorDepth, outputFormat, xpx = 'Canvas render():') {
        // Validate parameters.
        validateColorDepth(colorDepth, `${xpx} colorDepth`);
        validateOutputFormat(outputFormat, `${xpx} outputFormat`);

        // Ensure the pixel grid is up to date. Skip this work if no changes
        // have occurred since the last time render() was called.
        if (this.#needsUpdate) {
            rasterize(
                this.#aaRegionPixels,
                this.background,
                this.#pixels,
                this.#shapes,
                this.#worldUnitsPerPixel,
                this.xExtent,
                this.yExtent,
                xpx,
            );
            this.#needsUpdate = false;
        }

        let encoder;
        switch (outputFormat) {
            case 'ansi':
                encoder = encodeAnsi;
                break;
            case 'braille':
                encoder = encodeBraille;
                break;
            case 'buffer':
                encoder = encodeBuffer;
                break;
            case 'html':
                encoder = encodeHtml;
                break;
            default: // should be unreachable, if validateOutputFormat() worked
                throw Error(`${xpx} invalid outputFormat`);
        }

        // Encode the pixel grid as an ANSI string, ArrayBuffer, or HTML.
        return encoder(
            {
                xMin: 0,
                xMax: this.xExtent,
                yMin: 0,
                yMax: this.yExtent,
            },
            colorDepth,
            this.#pixels,
            xpx,
        );
    }
}
