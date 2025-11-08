import { Pixel } from '../../models/pixel/pixel.js';
import { aabbCompound, sdfCompound } from '../sdfs-and-aabbs/compound.js';
import {
    blendChannel,
    clamp01,
    samplePatternColor,
    toByte,
} from './rasterization-utilities.js';

// Feature flag to toggle bounding-box culling. When enabled, the renderer
// will skip expensive SDF calculations for shapes whose world-space axis-
// aligned bounding box doesn't contain the pixel being shaded. This is a
// conservative optimization: bounding boxes are chosen to never exclude a
// pixel that the shape could affect (they may be slightly larger than the
// true shape), so correctness is preserved.
const ENABLE_BOX_CULLING = true;

/** #### Draws an array of shapes into the pixel grid
 * - Mutates the provided pixels-array in-place.
 * @param {Pixel} background
 * @param {Pixel[][]} pixels
 * @param {{id:number,shape:object}[]} shapes
 * @param {number} xExtent
 * @param {number} yExtent
 * @param {string} [xpx='rasterize():'] Exception prefix
 */
export function rasterize(
    background,
    pixels,
    shapes,
    xExtent,
    yExtent,
    xpx = 'rasterize():',
) {
    const { r, g, b } = background;

    // Reset the pixel grid to the background color, without recreating
    // any Pixel or array instances.
    for (let y = 0; y < yExtent; y++) {
        for (let x = 0; x < xExtent; x++) {
            const pixel = pixels[y][x];
            pixel.r = r;
            pixel.g = g;
            pixel.b = b;
        }
    }

    // Convert an anti-aliasing width specified in pixels to world-space
    // units. The renderer maps the smaller canvas dimension to 10.0 world
    // units, so one world unit per pixel is 10.0 / min(xExtent,yExtent).
    // Use aaRegionPixels to control how many screen pixels the AA band covers.
    const worldUnitsPerPixel = 10.0 / Math.min(xExtent, yExtent);
    const aaRegionPixels = 0.85; // anti-alias region width in pixels (1 would be a little too soft)
    const aaRegion = aaRegionPixels * worldUnitsPerPixel;

    // Precompute conservative axis-aligned bounding boxes (AABB) for each
    // shape in world-space. These boxes are expanded by the anti-aliasing
    // region so that edge pixels aren't incorrectly culled. We compute them
    // once here so the inner pixel loop can cheaply skip shapes that cannot
    // possibly affect a given pixel.
    // Use helper functions colocated with SDFs to compute conservative AABBs
    // for each shape. These helpers are in `src/sdf-and-aabbs/` and mirror
    // the previous inline logic; keeping them next to SDFs helps maintain
    // consistency when shapes change.
    const shapeBoxes = shapes.map(({ shape }) => { // `id` is not needed here
        // Base AA expansion in world units.
        // Also expand outward for strokes that lie outside or are centred on
        // the shape boundary so we don't accidentally cull stroke pixels.
        const strokePx = typeof shape.strokeWidth === 'number' ? shape.strokeWidth : 0;
        const strokeWorld = strokePx * worldUnitsPerPixel;
        let outwardExtension;
        switch (shape.strokePosition) {
            case 'outside':
                outwardExtension = strokeWorld;
                break;
            case 'inside':
                outwardExtension = 0;
                break;
            case 'center':
            default: // default to 'center' semantics if strokePosition is missing
                outwardExtension = strokeWorld / 2;
                break;
        }
        const expand = aaRegion + outwardExtension; // conservative expand
        // Use an aggregate AABB which unions all primitive AABBs.
        return aabbCompound(shape, expand);
    });

    // Determine each pixel's color.
    // Precompute values that are constant across pixels to avoid repeated
    // work inside the nested loops.
    const aspectRatio = xExtent / yExtent;
    const worldWidth = aspectRatio >= 1 ? 10.0 * aspectRatio : 10.0;
    const worldHeight = aspectRatio >= 1 ? 10.0 : 10.0 / aspectRatio;
    const invCanvasWidth = 1.0 / xExtent;
    const invCanvasHeight = 1.0 / yExtent;

    // Precompute the world X coordinate for every column and the world Y
    // coordinate for every row. This moves the division/multiplication out
    // of the inner pixel loop which is executed for every pixel.
    const worldXs = new Array(xExtent);
    for (let i = 0; i < xExtent; i++) {
        worldXs[i] = ((i + 0.5) * invCanvasWidth - 0.5) * worldWidth;
    }
    const worldYs = new Array(yExtent);
    for (let j = 0; j < yExtent; j++) {
        worldYs[j] = ((j + 0.5) * invCanvasHeight - 0.5) * worldHeight;
    }

    const inv255 = 1 / 255;

    for (let y = 0; y < yExtent; y++) {
        for (let x = 0; x < xExtent; x++) {
            // Look up the precomputed world coordinates for this pixel and
            // grab the backing pixel. We normalise to 0..1 so the blend
            // math stays stable while multiple shapes accumulate colour.
            const worldX = worldXs[x];
            const worldY = worldYs[y];
            const pixel = pixels[y][x];

            let dstR = pixel.r * inv255;
            let dstG = pixel.g * inv255;
            let dstB = pixel.b * inv255;

            // Step through each shape in paint order, applying stroke, fill
            // and blend processing whenever the SDF says the pixel is hit.
            for (let si = 0; si < shapes.length; si++) {
                const shape = shapes[si].shape;
                // Quick axis-aligned bounding-box culling. If enabled and the
                // pixel's world coordinate lies outside the (conservative)
                // box for this shape, skip SDF evaluation entirely.
                if (ENABLE_BOX_CULLING) {
                    const box = shapeBoxes[si];
                    if (worldX < box.xMin || worldX > box.xMax || worldY < box.yMin || worldY > box.yMax) {
                        continue; // shape cannot affect this pixel
                    }
                }
                // Evaluate the composite signed distance for this Shape. Note
                // that Shapes are composed of multiple primitives (union/
                // difference).
                const distance = sdfCompound(shape, worldX, worldY);

                // Resolve the sampled fill colour/pattern once and convert
                // SDF distance into an anti-aliased coverage factor.
                const fillColor = samplePatternColor(shape);
                let fillCoverage = 0;
                if (distance < aaRegion / 2) {
                    fillCoverage = Math.max(0, Math.min(1, (-distance + aaRegion / 2) / aaRegion));
                }

                const strokeColor = shape.strokeColor;
                let strokeCoverage = 0;
                if (typeof shape.strokeWidth === 'number' && shape.strokeWidth > 0 && strokeColor) {
                    // Convert the stroke definition (stored in pixel units)
                    // into world units, then work out how far the SDF sample
                    // lies from the stroke band.
                    const strokeWidthWorld = shape.strokeWidth * worldUnitsPerPixel;

                    let bandMin = 0;
                    let bandMax = 0;
                    switch (shape.strokePosition) {
                        case 'inside':
                            bandMin = -strokeWidthWorld;
                            bandMax = 0;
                            break;
                        case 'outside':
                            bandMin = 0;
                            bandMax = strokeWidthWorld;
                            break;
                        case 'center':
                        default:
                            bandMin = -strokeWidthWorld / 2;
                            bandMax = strokeWidthWorld / 2;
                            break;
                    }

                    let distToBand = 0;
                    if (distance < bandMin) distToBand = bandMin - distance;
                    else if (distance > bandMax) distToBand = distance - bandMax;
                    else distToBand = 0;

                    const aaEdge = aaRegion / 2;
                    if (distToBand === 0) strokeCoverage = 1;
                    else if (distToBand < aaEdge) strokeCoverage = 1 - (distToBand / aaEdge);
                    else strokeCoverage = 0;
                }

                // Translate coverage into opacity by multiplying by the
                // source alpha channel. Zero opacity lets us skip the blend.
                const fillOpacity = fillCoverage * (fillColor?.a ?? 0);
                const strokeOpacity = strokeCoverage * (strokeColor?.a ?? 0);

                if (fillOpacity <= 0 && strokeOpacity <= 0) continue;

                const fillR = fillOpacity > 0 ? fillColor.r * inv255 : 0;
                const fillG = fillOpacity > 0 ? fillColor.g * inv255 : 0;
                const fillB = fillOpacity > 0 ? fillColor.b * inv255 : 0;

                const strokeR = strokeOpacity > 0 ? strokeColor.r * inv255 : 0;
                const strokeG = strokeOpacity > 0 ? strokeColor.g * inv255 : 0;
                const strokeB = strokeOpacity > 0 ? strokeColor.b * inv255 : 0;

                const oneMinusStrokeOpacity = 1 - strokeOpacity;
                const srcAlpha = clamp01(strokeOpacity + (fillOpacity * oneMinusStrokeOpacity));
                if (srcAlpha <= 0) continue;

                const premulR = (strokeR * strokeOpacity) + (fillR * fillOpacity * oneMinusStrokeOpacity);
                const premulG = (strokeG * strokeOpacity) + (fillG * fillOpacity * oneMinusStrokeOpacity);
                const premulB = (strokeB * strokeOpacity) + (fillB * fillOpacity * oneMinusStrokeOpacity);

                const srcR = premulR / srcAlpha;
                const srcG = premulG / srcAlpha;
                const srcB = premulB / srcAlpha;

                // TODO optimise known no-ops (multiply/white, screen/black, overlay/0.5 grey).
                const blendMode = shape.blendMode;
                const blendedR = blendChannel(blendMode, srcR, dstR);
                const blendedG = blendChannel(blendMode, srcG, dstG);
                const blendedB = blendChannel(blendMode, srcB, dstB);

                // Store the blended result as the new destination. Staying in
                // float space delays rounding until every shape is applied.
                dstR = clamp01((blendedR * srcAlpha) + (dstR * (1 - srcAlpha)));
                dstG = clamp01((blendedG * srcAlpha) + (dstG * (1 - srcAlpha)));
                dstB = clamp01((blendedB * srcAlpha) + (dstB * (1 - srcAlpha)));
            }

            // Convert the accumulated float back into byte channels for
            // downstream rendering.
            pixel.r = toByte(dstR);
            pixel.g = toByte(dstG);
            pixel.b = toByte(dstB);
        }
    }
}
