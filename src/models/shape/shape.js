import { Color } from '../color/color.js';
import { Primitive } from '../primitive/primitive.js';
import {
    validateBlendMode,
    validateColor,
    validateFlip,
    validatePattern,
    validatePrimitives,
    validateRotate,
    validateScale,
    validateStrokePosition,
    validateStrokeWidth,
    validateTranslate,
} from "./shape-validators.js";

/**
 * @typedef {import('../../clc-types.js').Pattern} Pattern
 */

/** #### Combines a list of primitives, with rendering instructions */
export class Shape {
    /** #### How this shape blends with underlying shapes
     * @type {'multiply'|'normal'|'overlay'|'screen'} */
    blendMode = 'normal';

    /** #### How to reflect this shape, if at all
     * @type {'flip-x'|'flip-x-and-y'|'flip-y'|'no-flip'} */
    flip = 'no-flip';

    /** #### The foreground color
     * @type {Color} */
    ink = null;

    /** #### The background color
     * @type {Color} */
    paper = null;

    /** #### The fill texture
     * @type {Pattern} */
    pattern = 'all-ink';

    /** #### Array of primitives that compose this shape
     * @type {Primitive[]} */
    primitives = [];

    /** #### Rotation in radians
     * @type {number} */
    rotate = 0;

    /** #### Uniform scale factor
     * @type {number} */
    scale = 1;

    /** #### The outline color
     * @type {Color} */
    strokeColor = null;

    /** #### Where the outline is positioned relative to the shape edge
     * @type {'inside'|'center'|'outside'} */
    strokePosition = 'center';

    /** #### Width of the outline in pixels
     * @type {number} */
    strokeWidth = 0;

    /** #### Translation offset for x and y axes
     * @type {{ x: number, y: number }} */
    translate = { x: 0, y: 0 };

    /**
     * @param {'multiply'|'normal'|'overlay'|'screen'} blendMode Blend mode
     * @param {'flip-x'|'flip-x-and-y'|'flip-y'|'no-flip'} flip Reflection
     * @param {Color} ink Foreground/fill color
     * @param {Color} paper Background color
     * @param {Pattern} pattern Fill pattern
     * @param {Primitive[]} primitives Array of primitives
     * @param {number} rotate Rotation in radians
     * @param {number} scale Uniform scale factor
     * @param {Color} strokeColor Stroke/outline color
     * @param {'inside'|'center'|'outside'} strokePosition Stroke position
     * @param {number} strokeWidth Stroke width in pixels
     * @param {{ x: number, y: number }} translate Translation offset
     */
    constructor(
        blendMode,
        flip,
        ink,
        paper,
        pattern,
        primitives,
        rotate,
        scale,
        strokeColor,
        strokePosition,
        strokeWidth,
        translate,
    ) {
        validateBlendMode(blendMode, 'Shape: blendMode');
        validateFlip(flip, 'Shape: flip');
        validateColor(ink, 'Shape: ink');
        validateColor(paper, 'Shape: paper');
        validatePattern(pattern, 'Shape: pattern');
        validatePrimitives(primitives, 'Shape: primitives');
        validateRotate(rotate, 'Shape: rotate');
        validateScale(scale, 'Shape: scale');
        validateColor(strokeColor, 'Shape: strokeColor');
        validateStrokePosition(strokePosition, 'Shape: strokePosition');
        validateStrokeWidth(strokeWidth, 'Shape: strokeWidth');
        validateTranslate(translate, 'Shape: translate');

        this.blendMode = blendMode;
        this.flip = flip;
        this.ink = ink;
        this.paper = paper;
        this.pattern = pattern;
        this.primitives = primitives;
        this.rotate = rotate;
        this.scale = scale;
        this.strokeColor = strokeColor;
        this.strokePosition = strokePosition;
        this.strokeWidth = strokeWidth;
        this.translate = translate;
    }
}
