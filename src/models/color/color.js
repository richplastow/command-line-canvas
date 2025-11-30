import { validateRgba } from './color-validators.js';

/** #### A color with RGBA values */
export class Color {
    /** #### Red value (0-255)
     * @type {number} */
    r = 0;

    /** #### Green value (0-255)
     * @type {number} */
    g = 0;

    /** #### Blue value (0-255)
     * @type {number} */
    b = 0;

    /** #### Alpha value (0-255)
     * @type {number} */
    a = 255;

    /**
     * @param {number} r The red value (0-255)
     * @param {number} g The green value (0-255)
     * @param {number} b The blue value (0-255)
     * @param {number} a The alpha value (0-255)
     */
    constructor(r, g, b, a) {
        validateRgba(r, 'Color: r (red)');
        validateRgba(g, 'Color: g (green)');
        validateRgba(b, 'Color: b (blue)');
        validateRgba(a, 'Color: a (alpha)');

        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }
}
