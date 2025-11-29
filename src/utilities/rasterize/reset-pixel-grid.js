/** #### Fills a pixel grid with a background colour
 * - For efficiency, does not recreate any Pixel or array instances.
 * @param {Object} background The background color object with r, g, b properties
 * @param {Array} pixels 2D array of pixel objects to be reset
 * @param {number} xExtent The width of the pixel grid
 * @param {number} yExtent The height of the pixel grid
 */
export const resetPixelGrid = (background, pixels, xExtent, yExtent) => {
    const { r, g, b, a } = background;
    for (let y = 0; y < yExtent; y++) {
        for (let x = 0; x < xExtent; x++) {
            const pixel = pixels[y][x];
            pixel.r = r;
            pixel.g = g;
            pixel.b = b;
            pixel.a = a;
        }
    }
}
