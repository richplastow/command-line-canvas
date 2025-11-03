import { validatePixel } from '../pixel/pixel-validators.js';
import { Pixel } from '../pixel/pixel.js';
import { validateCanvasExtent } from './canvas-validators.js';

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

    /** #### Private 2D array containing the canvas's pixels
     * @type {Pixel[][]} */
    #pixels = [];

    /**
     * @param {Pixel} background A pixel to clone across the canvas's background
     * @param {number} xExtent The canvas's width
     * @param {number} yExtent The canvas's height
     */
    constructor(background, xExtent, yExtent) {
        validatePixel(background, 'Canvas: background');
        validateCanvasExtent(xExtent, 'Canvas: xExtent');
        validateCanvasExtent(yExtent, 'Canvas: yExtent');

        this.background = background;
        this.xExtent = xExtent;
        this.yExtent = yExtent;

        // Create a canvas of pixels with the specified dimensions, and fill it
        // with the background colour.
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
}
