import { Color } from "../../models/color/color.js";
import { blendChannel, clamp01 } from "./rasterization-utilities.js";

/** #### Computes the blended pixel colour from stroke and fill inputs
 * - Combines source channels with destination, using a blend-mode
 * @param {'multiply'|'normal'|'overlay'|'screen'} blendMode How pixels blend
 * @param {number} dstB Destination blue channel, normalised 0..1
 * @param {number} dstG Destination green channel, normalised 0..1
 * @param {number} dstR Destination red channel, normalised 0..1
 * @param {Object} fillColor Fill colour object with channel data
 * @param {number} fillOpacity Fill coverage multiplied by alpha
 * @param {Color} strokeColor Stroke colour object, including alpha channel
 * @param {number} strokeOpacity Stroke coverage multiplied by alpha
 * @returns {{r:number,g:number,b:number}} Blended colour, normalised 0..1
 */
export const computeFinalPixelValue = (
    blendMode,
    dstB,
    dstG,
    dstR,
    fillColor,
    fillOpacity,
    strokeColor,
    strokeOpacity,
) => {
    // Normalise fill and stroke colours from 0..255 to 0..1 range.
    const fillR = fillOpacity > 0 ? fillColor.r / 255 : 0;
    const fillG = fillOpacity > 0 ? fillColor.g / 255 : 0;
    const fillB = fillOpacity > 0 ? fillColor.b / 255 : 0;
    const strokeR = strokeOpacity > 0 ? strokeColor.r / 255 : 0;
    const strokeG = strokeOpacity > 0 ? strokeColor.g / 255 : 0;
    const strokeB = strokeOpacity > 0 ? strokeColor.b / 255 : 0;

    // Compute composite source alpha for stroke over fill.
    const oneMinusStrokeOpacity = 1 - strokeOpacity;
    const srcAlpha = clamp01(strokeOpacity + (fillOpacity * oneMinusStrokeOpacity));
    if (srcAlpha <= 0) return { r: dstR, g: dstG, b: dstB };

    // Compute pre-multiplied source channels by combining stroke and fill.
    const preMulR = (strokeR * strokeOpacity) + (fillR * fillOpacity * oneMinusStrokeOpacity);
    const preMulG = (strokeG * strokeOpacity) + (fillG * fillOpacity * oneMinusStrokeOpacity);
    const preMulB = (strokeB * strokeOpacity) + (fillB * fillOpacity * oneMinusStrokeOpacity);

    // Un-premultiply to recover straight (non pre-multiplied) source channels.
    const srcR = preMulR / srcAlpha;
    const srcG = preMulG / srcAlpha;
    const srcB = preMulB / srcAlpha;

    // Apply the blend mode per-channel against the destination.
    // TODO optimise known no-ops (multiply/white, screen/black, overlay/0.5 grey).
    const blendedR = blendChannel(blendMode, srcR, dstR);
    const blendedG = blendChannel(blendMode, srcG, dstG);
    const blendedB = blendChannel(blendMode, srcB, dstB);

    // Composite blended source over destination using src alpha.
    // Staying in float space delays rounding until every shape is done.
    return {
        r: clamp01((blendedR * srcAlpha) + (dstR * (1 - srcAlpha))),
        g: clamp01((blendedG * srcAlpha) + (dstG * (1 - srcAlpha))),
        b: clamp01((blendedB * srcAlpha) + (dstB * (1 - srcAlpha))),
    };
}