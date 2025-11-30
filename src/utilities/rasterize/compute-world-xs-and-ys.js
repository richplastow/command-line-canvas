import { SIDE_IN_WORLD_UNITS } from '../../clc-constants.js';

/** #### Computes world-space X and Y coordinates for each pixel column and row
 *
 * These values are constant for every pixel, so precalculating them here avoids
 * repeated work (division/multiplication) inside hot loops.
 *
 * @param {number} xExtent Width of the pixel grid
 * @param {number} yExtent Height of the pixel grid
 */
export function computeWorldXsAndYs(xExtent, yExtent) {

    // Calculate the canvas width and height in world units.
    const aspectRatio = xExtent / yExtent;
    const xExtentWorld = aspectRatio >= 1
        ? SIDE_IN_WORLD_UNITS * aspectRatio
        : SIDE_IN_WORLD_UNITS;
    const yExtentWorld = aspectRatio >= 1
        ? SIDE_IN_WORLD_UNITS
        : SIDE_IN_WORLD_UNITS / aspectRatio;

    // Calculate the world X coordinate for every column and the world Y
    // coordinate for every row.
    const worldXs = new Array(xExtent);
    for (let x = 0; x < xExtent; x++) {
        worldXs[x] = ((x + 0.5) / xExtent - 0.5) * xExtentWorld;
    }
    const worldYs = new Array(yExtent);
    for (let y = 0; y < yExtent; y++) {
        worldYs[y] = ((y + 0.5) / yExtent - 0.5) * yExtentWorld;
    }

    return { worldXs, worldYs };
}
