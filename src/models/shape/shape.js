import { Color } from '../color/color.js';
import { Primitive } from '../primitive/primitive.js';
import {
    validateBlendMode,
    validateColor,
    validateDebugShapeAabb,
    validateFlip,
    validatePattern,
    validatePatternRatio,
    validatePatternScale,
    validatePatternUnit,
    validatePrimitives,
    validateRotate,
    validateScale,
    validateStrokePosition,
    validateStrokeUnit,
    validateStrokeWidth,
    validateTranslate,
} from './shape-validators.js';

/**
 * @typedef {import('../../clc-types.js').Pattern} Pattern
 */

/** #### Combines a list of primitives, with rendering instructions */
export class Shape {
    /** #### How this shape blends with underlying shapes
     * @type {'multiply'|'normal'|'overlay'|'screen'} */
    blendMode = 'normal';

    /** #### The colour to use when debugging the shape's bounding box
     * - If `null`, no debug bounding box will be drawn
     * @type {Color|null} */
    debugShapeAabb = null;

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

    /** #### The visual balance between ink and paper in patterns
     * - 0.0 = all paper, 1.0 = all ink, 0.5 = equal
     * @type {number} */
    patternRatio = 0.5;

    /** #### The scale of the pattern
     * @type {number} */
    patternScale = 1;

    /** #### Which unit to use when drawing patterns
     * @type {'pixel'|'shape'|'world'} */
    patternUnit = 'pixel';

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

    /** #### Which unit `strokeWidth` is measured in
     * @type {'pixel'|'shape'|'world'} */
    strokeUnit = 'pixel';

    /** #### Width of the outline in pixels
     * @type {number} */
    strokeWidth = 0;

    /** #### Translation offset for x and y axes
     * @type {{ x: number, y: number }} */
    translate = { x: 0, y: 0 };

    /**
     * @param {'multiply'|'normal'|'overlay'|'screen'} blendMode Blend mode
     * @param {Color|null} debugShapeAabb Debug bounding box color
     * @param {'flip-x'|'flip-x-and-y'|'flip-y'|'no-flip'} flip Reflection
     * @param {Color} ink Foreground/fill color
     * @param {Color} paper Background color
     * @param {Pattern} pattern Fill pattern
     * @param {number} patternRatio Fill ratio for pattern
     * @param {number} patternScale Fill scale for pattern
     * @param {'pixel'|'shape'|'world'} patternUnit Pattern width unit
     * @param {Primitive[]} primitives Array of primitives
     * @param {number} rotate Rotation in radians
     * @param {number} scale Uniform scale factor
     * @param {Color} strokeColor Stroke/outline color
     * @param {'inside'|'center'|'outside'} strokePosition Stroke position
     * @param {'pixel'|'shape'|'world'} strokeUnit Stroke width unit
     * @param {number} strokeWidth Stroke width in pixels
     * @param {{ x: number, y: number }} translate Translation offset
     */
    constructor(
        blendMode,
        debugShapeAabb,
        flip,
        ink,
        paper,
        pattern,
        patternRatio,
        patternScale,
        patternUnit,
        primitives,
        rotate,
        scale,
        strokeColor,
        strokePosition,
        strokeUnit,
        strokeWidth,
        translate,
    ) {
        validateBlendMode(blendMode, 'Shape: blendMode');
        validateDebugShapeAabb(debugShapeAabb, 'Shape: debugShapeAabb');
        validateFlip(flip, 'Shape: flip');
        validateColor(ink, 'Shape: ink');
        validateColor(paper, 'Shape: paper');
        validatePattern(pattern, 'Shape: pattern');
        validatePatternRatio(patternRatio, 'Shape: patternRatio');
        validatePatternScale(patternScale, 'Shape: patternScale');
        validatePatternUnit(patternUnit, 'Shape: patternUnit');
        validatePrimitives(primitives, 'Shape: primitives');
        validateRotate(rotate, 'Shape: rotate');
        validateScale(scale, 'Shape: scale');
        validateColor(strokeColor, 'Shape: strokeColor');
        validateStrokePosition(strokePosition, 'Shape: strokePosition');
        validateStrokeUnit(strokeUnit, 'Shape: strokeUnit');
        validateStrokeWidth(strokeWidth, 'Shape: strokeWidth');
        validateTranslate(translate, 'Shape: translate');

        this.blendMode = blendMode;
        this.debugShapeAabb = debugShapeAabb;
        this.flip = flip;
        this.ink = ink;
        this.paper = paper;
        this.pattern = pattern;
        this.patternRatio = patternRatio;
        this.patternScale = patternScale;
        this.patternUnit = patternUnit;
        this.primitives = primitives;
        this.rotate = rotate;
        this.scale = scale;
        this.strokeColor = strokeColor;
        this.strokePosition = strokePosition;
        this.strokeUnit = strokeUnit;
        this.strokeWidth = strokeWidth;
        this.translate = translate;
    }
}
