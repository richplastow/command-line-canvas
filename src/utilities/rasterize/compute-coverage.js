import { Color } from '../../models/color/color.js';
import { clamp01 } from './rasterization-utilities.js';

/** #### Calculates anti-aliased fill coverage from an SDF distance.
 * @param {number} aaRegion The anti-alias region, in world units
 * @param {number} aaRegionHalf Half the anti-alias region, in world units
 * @param {number} distance Signed distance sample
 * @returns {number} fill-coverage factor, between 0 and 1
 */
export function computeFillCoverage(aaRegion, aaRegionHalf, distance) {
    if (distance >= aaRegionHalf) return 0;
    return clamp01((aaRegionHalf - distance) / aaRegion);
}

/** #### Calculates anti-aliased stroke coverage from an SDF distance.
 * @param {number} aaRegionHalf Half the anti-alias region, in world units
 * @param {number} distance Signed distance sample
 * @param {number} shapeScale The shape's uniform scale factor
 * @param {Color} strokeColor Stroke colour
 * @param {'inside'|'center'|'outside'} strokePosition Stroke position
 * @param {'pixel'|'shape'|'world'} strokeUnit Stroke width unit
 * @param {number} strokeWidth Stroke weight in pixels
 * @param {number} worldUnitsPerPixel World units per pixel
 * @param {string} [xpx='computeStrokeCoverage():'] Exception prefix for errors
 * @returns {number} stroke-coverage factor, between 0 and 1
 */
export function computeStrokeCoverage(
    aaRegionHalf,
    distance,
    shapeScale,
    strokeColor,
    strokePosition,
    strokeUnit,
    strokeWidth,
    worldUnitsPerPixel,
    xpx = 'computeStrokeCoverage():',
) {
    // Short-circuit if there's no stroke to draw.
    if (strokeWidth === 0 || strokeColor.a === 0) return 0;

    // Calculate stroke width in world units based on strokeUnit.
    // TODO move this out of the hot loop and maybe support world-width strokes, e.g. in the Shape itself
    let strokeWidthWorld;
    switch (strokeUnit) {
        case 'pixel':
            // Default behavior: stroke width in pixels, unaffected by scale.
            strokeWidthWorld = strokeWidth * worldUnitsPerPixel;
            break;
        case 'shape':
            // Stroke scales with both shape scale and world scale.
            strokeWidthWorld = strokeWidth * worldUnitsPerPixel * shapeScale;
            break;
        case 'world':
            // Stroke in world units, scales with world but not shape scale.
            strokeWidthWorld = strokeWidth;
            break;
        default:
            throw Error(`${xpx} invalid strokeUnit '${strokeUnit}'`);
    }

    // Get the minimum and maximum bounds of the 'stroke band'.
    // TODO move this out of the hot loop
    let bandMin = 0;
    let bandMax = 0;
    switch (strokePosition) {
        case 'center':
            bandMin = -strokeWidthWorld / 2;
            bandMax = strokeWidthWorld / 2;
            break;
        case 'inside':
            bandMin = -strokeWidthWorld;
            bandMax = 0;
            break;
        case 'outside':
            bandMin = 0;
            bandMax = strokeWidthWorld;
            break;
        default: // should be unreachable, if validateStrokePosition() was used
            throw Error(`${xpx} invalid strokePosition`);
    }

    // Calculate how far the SDF sample lies from the stroke band.
    const isGreaterThanBandMin = distance > bandMin;
    const isLessThanBandMax = distance < bandMax;

    // If the distance is inside the stroke band, coverage is 100%.
    if (isGreaterThanBandMin && isLessThanBandMax) return 1;

    // Get the normalised (always positive) distance to the stroke band.
    const distToBand = isLessThanBandMax
        ? bandMin - distance
        : distance - bandMax;

    // If the distance to the band is outside the AA region, coverage is 0%.
    if (distToBand >= aaRegionHalf) return 0;

    // Compute coverage, falling off linearly to 0% at the edge of the AA region.
    return 1 - (distToBand / aaRegionHalf);
}
