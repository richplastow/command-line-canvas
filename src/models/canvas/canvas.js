import { SIDE_IN_WORLD_UNITS } from '../../clc-constants.js';
import { encodeAnsi } from '../../utilities/encoders/encode-ansi.js';
import { encodeBraille } from '../../utilities/encoders/encode-braille.js';
import { encodeBuffer } from '../../utilities/encoders/encode-buffer.js';
import { encodeHtml } from '../../utilities/encoders/encode-html.js';
import { rasterize } from '../../utilities/rasterize/rasterize.js';
import { validateColor } from '../color/color-validators.js';
import { Color } from '../color/color.js';
import {
    validateAntiAliasRegion,
    validateCanvasExtent,
    validateColorDepth,
    validateOutputFormat,
    validatePixels,
} from './canvas-validators.js';

/**
 * @typedef {import('../shape/shape.js').Shape} Shape
 */

/** #### An ANSI canvas */
export class Canvas {
    /** #### Anti-aliasing region width in pixels
     * @type {number} */
    antiAliasRegion = 0;

    /** A color to clone across the canvas's background
     * @type {Color} */
    background = null;

    /** #### The canvas's width
     * @type {number} */
    xExtent = 0;

    /** #### The canvas's height
     * @type {number} */
    yExtent = 0;

    /** #### ID of the most recently added shape
     * @type {number} */
    #lastShapeId = 0;

    /** #### `true` if `pixels` needs to be recomposed before rendering
     * - If `false`, the existing `pixels` can be rerendered as-is
     * - `needsUpdate` will be set to `true` after most changes to the canvas
     * @type {boolean} */
    #needsUpdate = false;

    /** #### Private array of bytes containing the canvas's pixels (RGBA)
     * - Can be a reference to an HTML Canvas context's pixel buffer, passed in 
     *   to the constructor (in which case it's not truly private)
     * - Or if not, will be created internally (in which case it is private)
     * - Mutated in-place by `rasterize()`
     * @type {Uint8ClampedArray} */
    #pixels = null;

    /** #### Private list of Shapes
     * - In the order that they should be composited
     * @type {{id: number, shape: Shape}[]} */
    #shapes = [];

    /** World units per pixel
     * @type {number} */
    #worldUnitsPerPixel = 0;

    /**
     * @param {number} antiAliasRegion Anti-aliasing region width in pixels
     * @param {Color} background A color to clone across the canvas's background
     * @param {number} xExtent The canvas's width
     * @param {number} yExtent The canvas's height
     * @param {Uint8ClampedArray} [pixels] Optional existing pixel buffer
     */
    constructor(antiAliasRegion, background, xExtent, yExtent, pixels) {
        validateAntiAliasRegion(antiAliasRegion, 'Canvas: antiAliasRegion');
        validateColor(background, 'Canvas: background');
        validateCanvasExtent(xExtent, 'Canvas: xExtent');
        validateCanvasExtent(yExtent, 'Canvas: yExtent');
        if (pixels) {
            validatePixels(pixels, 'Canvas: pixels');
            if (pixels.length !== xExtent * yExtent * 4) throw RangeError(
                `Canvas: pixels length ${pixels.length} does not match ` +
                `dimensions ${xExtent}x${yExtent}x4`)}

        this.antiAliasRegion = antiAliasRegion;
        this.background = background;
        this.#worldUnitsPerPixel = SIDE_IN_WORLD_UNITS / Math.min(xExtent, yExtent);
        this.xExtent = xExtent;
        this.yExtent = yExtent;
        this.#pixels = pixels
            ? pixels
            : new Uint8ClampedArray(xExtent * yExtent * 4);

        // Fill the pixel buffer with background color, whether or not it was
        // passed in externally.
        for (let i = 0; i < this.#pixels.length; i += 4) {
            this.#pixels[i] = background.r;
            this.#pixels[i + 1] = background.g;
            this.#pixels[i + 2] = background.b;
            this.#pixels[i + 3] = background.a;
        }
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

    /** #### Request that the canvas be re-rasterized on next render()
     * - Useful when external code mutates Shapes directly.
     * 
     * @todo replace this with setters on Shape properties?
     */
    requestUpdate() {
        this.#needsUpdate = true;
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
                this.antiAliasRegion,
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
            this.xExtent,
            colorDepth,
            this.#pixels,
            xpx,
        );
    }
}
