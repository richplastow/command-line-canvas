import { validateChannel } from "./pixel-validators.js";

/** #### A pixel in an ANSI canvas */
export class Pixel {
    /** #### Red value (0-255)
     * @type {number} */
    r = 0;

    /** #### Green value (0-255)
     * @type {number} */
    g = 0;

    /** #### Blue value (0-255)
     * @type {number} */
    b = 0;

    /**
     * @param {number} r The red value (0-255)
     * @param {number} g The green value (0-255)
     * @param {number} b The blue value (0-255)
     */
    constructor(r, g, b) {
        validateChannel(r, 'Pixel: r (red)');
        validateChannel(g, 'Pixel: g (green)');
        validateChannel(b, 'Pixel: b (blue)');

        this.r = r;
        this.g = g;
        this.b = b;
    }
}
