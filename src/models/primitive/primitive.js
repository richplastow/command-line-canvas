import {
    validateFlip,
    validateJoinMode,
    validateKind,
    validateRotate,
    validateScale,
    validateTranslate,
} from "./primitive-validators.js";

/** #### A primitive shape that can be combined to form complex shapes */
export class Primitive {
    /** #### How to reflect this primitive, if at all
     * @type {'flip-x'|'flip-x-and-y'|'flip-y'|'no-flip'} */
    flip = 'no-flip';

    /** #### How this primitive combines with the previous primitive
     * @type {'union'|'difference'} */
    joinMode = 'union';

    /** #### The kind of primitive shape
     * @type {'circle'|'square'|'triangle-right'} */
    kind = 'circle';

    /** #### Rotation in radians
     * @type {number} */
    rotate = 0;

    /** #### Uniform scale factor
     * @type {number} */
    scale = 1;

    /** #### Translation offset for x and y axes
     * @type {{ x: number, y: number }} */
    translate = { x: 0, y: 0 };

    /**
     * @param {'flip-x'|'flip-x-and-y'|'flip-y'|'no-flip'} flip Reflection
     * @param {'union'|'difference'} joinMode How to combine with previous
     * @param {'circle'|'square'|'triangle-right'} kind The primitive shape type
     * @param {number} rotate Rotation in radians
    * @param {number} scale Uniform scale factor
     * @param {{ x: number, y: number }} translate Translation offset
     */
    constructor(flip, joinMode, kind, rotate, scale, translate) {
        validateFlip(flip, 'Primitive: flip');
        validateJoinMode(joinMode, 'Primitive: joinMode');
        validateKind(kind, 'Primitive: kind');
        validateRotate(rotate, 'Primitive: rotate');
        validateScale(scale, 'Primitive: scale');
        validateTranslate(translate, 'Primitive: translate');

        this.flip = flip;
        this.joinMode = joinMode;
        this.kind = kind;
        this.rotate = rotate;
        this.scale = scale;
        this.translate = translate;
    }
}
