import { ENABLE_BOX_CULLING } from '../../clc-constants.js';
import { Color } from '../../models/color/color.js';
import { Shape } from '../../models/shape/shape.js';
import { sdfCompound } from '../sdfs-and-aabbs/compound.js';
import {
    computeFillCoverage,
    computeStrokeCoverage,
} from './compute-coverage.js';
import { computeFinalPixelValue } from './compute-final-pixel-value.js';
import { computeShapeAABBs } from './compute-shape-aabbs.js';
import { computeWorldXsAndYs } from './compute-world-xs-and-ys.js';
import { toByte } from './rasterization-utilities.js';
import { resetPixelGrid } from './reset-pixel-grid.js';
import { samplePatternColor } from './sample-pattern-color.js';

/** #### Draws an array of shapes into the pixel grid
 * - Mutates the provided pixels-array in-place.
 * @param {number} aaRegionPixels Anti-alias region width in pixels
 * @param {Color} background Background color pixel
 * @param {Color[][]} pixels Pixel grid to rasterize into
 * @param {{id:number,shape:Shape}[]} shapes List of shapes to rasterize
 * @param {number} worldUnitsPerPixel World units per pixel
 * @param {number} xExtent Width of the pixel grid
 * @param {number} yExtent Height of the pixel grid
 * @param {string} [xpx='rasterize():'] Exception prefix
 */
export function rasterize(
    aaRegionPixels,
    background,
    pixels,
    shapes,
    worldUnitsPerPixel,
    xExtent,
    yExtent,
    xpx = 'rasterize():',
) {
    // Reset pixel grid to background.
    resetPixelGrid(background, pixels, xExtent, yExtent);

    // Convert an anti-aliasing width specified in pixels to world-space units.
    // The renderer maps the smaller canvas dimension to SIDE_IN_WORLD_UNITS.
    // If that's 10, then one world unit per pixel is `10/min(xExtent,yExtent)`.
    // aaRegionPixels controls how many screen pixels the AA band covers.
    // Avoid repeated division, by computing half-region once.
    const aaRegion = aaRegionPixels * worldUnitsPerPixel;
    const aaRegionHalf = aaRegion / 2;

    // Precompute conservative axis-aligned bounding boxes (AABB) for each shape,
    // so the inner pixel loop can cheaply skip shapes that can't affect a pixel.
    const shapeBoxes = computeShapeAABBs(aaRegion, shapes, worldUnitsPerPixel);

    // Precompute world-space X/Y coordinates for every canvas column/row.
    const { worldXs, worldYs } = computeWorldXsAndYs(xExtent, yExtent);

    for (let y = 0; y < yExtent; y++) {
        for (let x = 0; x < xExtent; x++) {
            // Look up the precomputed world coordinates for this pixel and
            // grab the backing pixel. We normalise to 0..1 so the blend
            // math stays stable while multiple shapes accumulate colour.
            const worldX = worldXs[x];
            const worldY = worldYs[y];
            const pixel = pixels[y][x];

            let dstR = pixel.r / 255;
            let dstG = pixel.g / 255;
            let dstB = pixel.b / 255;

            // Step through each shape in paint order, applying stroke, fill
            // and blend processing whenever the SDF says the pixel is hit.
            for (let si = 0; si < shapes.length; si++) {
                const shape = shapes[si].shape;
                const shapeBox = shapeBoxes[si];
                // Quick axis-aligned bounding-box culling. If enabled and the
                // pixel's world coordinate lies outside the (conservative)
                // box for this shape, skip SDF evaluation entirely.
                if (ENABLE_BOX_CULLING) {
                    const box = shapeBox.bounds;
                    if (worldX < box.xMin || worldX > box.xMax
                        || worldY < box.yMin || worldY > box.yMax
                    ) continue; // shape cannot affect this pixel

                    // If `debugShapeAabb` is not null, its colour should appear
                    // as the bounding box background.
                    if (shape.debugShapeAabb !== null) {
                        const debugColor = shape.debugShapeAabb;
                        const alpha = debugColor.a / 255;
                        dstR = dstR * (1 - alpha) + (debugColor.r / 255) * alpha;
                        dstG = dstG * (1 - alpha) + (debugColor.g / 255) * alpha;
                        dstB = dstB * (1 - alpha) + (debugColor.b / 255) * alpha;
                    }
                }

                // If `primitiveDebugAabb` is not null for any primitives, their
                // colours should appear as the bounding box background.
                const primitiveDebugs = shapeBox.primitiveDebugAabbs;
                for (let di = 0; di < primitiveDebugs.length; di++) {
                    const entry = primitiveDebugs[di];
                    const primBox = entry.bounds;
                    if (worldX < primBox.xMin || worldX > primBox.xMax
                        || worldY < primBox.yMin || worldY > primBox.yMax
                    ) continue;

                    const dbgColor = entry.color;
                    const alpha = dbgColor.a / 255;
                    dstR = dstR * (1 - alpha) + (dbgColor.r / 255) * alpha;
                    dstG = dstG * (1 - alpha) + (dbgColor.g / 255) * alpha;
                    dstB = dstB * (1 - alpha) + (dbgColor.b / 255) * alpha;
                }

                // Evaluate the composite signed distance for this Shape. Note
                // that Shapes are composed of multiple primitives (union/
                // difference).
                const distance = sdfCompound(shape, worldX, worldY);

                // Get the fill colour for this shape at this pixel.
                const fillColor = samplePatternColor(
                    shape,
                    worldX,
                    worldY,
                    worldUnitsPerPixel,
                );

                // Compute fill and stroke coverage from the SDF distance.
                const fillCoverage = computeFillCoverage(
                    aaRegion,
                    aaRegionHalf,
                    distance,
                );
                const strokeCoverage = computeStrokeCoverage(
                    aaRegionHalf,
                    distance,
                    shape.scale,
                    shape.strokeColor,
                    shape.strokePosition,
                    shape.strokeUnit,
                    shape.strokeWidth,
                    worldUnitsPerPixel,
                    xpx,
                );

                // Translate coverage into opacity by multiplying by the
                // source alpha channel.
                const fillOpacity = fillCoverage * ((fillColor?.a ?? 0) / 255);
                const strokeOpacity = strokeCoverage * ((shape.strokeColor?.a ?? 0) / 255);

                // Skip the (expensive) blend, if they're both zero opacity.
                if (fillOpacity <= 0 && strokeOpacity <= 0) continue;

                // Modify the destination pixel by blending this shape's pixel.
                const finalPixelValue = computeFinalPixelValue(
                    shape.blendMode,
                    dstB,
                    dstG,
                    dstR,
                    fillColor,
                    fillOpacity,
                    shape.strokeColor,
                    strokeOpacity,
                );
                dstR = finalPixelValue.r;
                dstG = finalPixelValue.g;
                dstB = finalPixelValue.b;
            }

            // Convert the accumulated floats back into byte channels for
            // downstream rendering.
            pixel.r = toByte(dstR);
            pixel.g = toByte(dstG);
            pixel.b = toByte(dstB);
        }
    }
}
