/** #### Fills a pixel grid with a background colour
 * - For efficiency, does not recreate any Pixel or array instances.
 * @param {Object} background The background color object with r, g, b properties
 * @param {Uint8ClampedArray} pixels Pixel buffer to be reset
 */
export const resetPixelGrid = (background, pixels) => {
    const { r, g, b, a } = background;
    for (let i = 0; i < pixels.length; i += 4) {
        pixels[i] = r;
        pixels[i + 1] = g;
        pixels[i + 2] = b;
        pixels[i + 3] = a;
    }
}
