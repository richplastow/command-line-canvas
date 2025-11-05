import {
    validateJoinMode,
    validateKind,
    validateRotate,
    validateScale,
    validateTranslate,
} from "./primitive-validators.js";

/** #### A primitive shape that can be combined to form complex shapes */
export class Primitive {
    /** #### How this primitive combines with the previous primitive
     * @type {'union'|'difference'} */
    joinMode = 'union';

    /** #### The kind of primitive shape
     * @type {'circle'|'square'|'triangle'} */
    kind = 'circle';

    /** #### Rotation in radians
     * @type {number} */
    rotate = 0;

    /** #### Scale factors for x and y axes
     * @type {{ x: number, y: number }} */
    scale = { x: 1, y: 1 };

    /** #### Translation offset for x and y axes
     * @type {{ x: number, y: number }} */
    translate = { x: 0, y: 0 };

    /**
     * @param {'union'|'difference'} joinMode How to combine with previous
     * @param {'circle'|'square'|'triangle'} kind The primitive shape type
     * @param {number} rotate Rotation in radians
     * @param {{ x: number, y: number }} scale Scale factors
     * @param {{ x: number, y: number }} translate Translation offset
     */
    constructor(joinMode, kind, rotate, scale, translate) {
        validateJoinMode(joinMode, 'Primitive: joinMode');
        validateKind(kind, 'Primitive: kind');
        validateRotate(rotate, 'Primitive: rotate');
        validateScale(scale, 'Primitive: scale');
        validateTranslate(translate, 'Primitive: translate');

        this.joinMode = joinMode;
        this.kind = kind;
        this.rotate = rotate;
        this.scale = scale;
        this.translate = translate;
    }
}
