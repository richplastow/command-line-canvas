import { ok, strictEqual as eq } from 'node:assert';
import { Color } from '../../models/color/color.js';
import { Primitive } from '../../models/primitive/primitive.js';
import { Shape } from '../../models/shape/shape.js';
import { aabbCompound, sdfCompound } from './compound.js';

/** @typedef {'flip-x'|'flip-x-and-y'|'flip-y'|'no-flip'} Flip */

const ink = new Color(255, 0, 255, 1);
const paper = new Color(0, 0, 0, 0);
const stroke = new Color(0, 0, 0, 1);

/**
 * @param {Flip} flip
 * @param {Primitive[]} primitives
 */
const makeShape = (flip, primitives) => new Shape(
    'normal',
    flip,
    ink,
    paper,
    'all-ink',
    primitives,
    0,
    1,
    stroke,
    'outside',
    'pixel',
    0,
    { x: 0, y: 0 },
);

/**
 * @param {number} tx
 * @param {number} ty
 * @param {Flip} flip
 */
const sampleInside = (tx, ty, flip) => {
    const sx = flip === 'flip-x' || flip === 'flip-x-and-y' ? 1 : -1;
    const sy = flip === 'flip-y' || flip === 'flip-x-and-y' ? 1 : -1;
    return {
        x: tx + (0.4 * sx),
        y: ty + (0.8 * sy),
    };
};

/**
 * @param {number} tx
 * @param {number} ty
 * @param {Flip} flip
 */
const sampleOutside = (tx, ty, flip) => {
    const sx = flip === 'flip-x' || flip === 'flip-x-and-y' ? -1 : 1;
    const sy = flip === 'flip-y' || flip === 'flip-x-and-y' ? -1 : 1;
    return {
        x: tx + (0.4 * sx),
        y: ty + (0.8 * sy),
    };
};

/** @type {{ flip: Flip, translate: { x: number, y: number } }[]} */
const primFlips = [
    { flip: 'flip-x-and-y', translate: { x: -3, y: -2 } },
    { flip: 'flip-x', translate: { x: 3, y: -2 } },
    { flip: 'flip-y', translate: { x: -3, y: 2 } },
    { flip: 'no-flip', translate: { x: 3, y: 2 } },
];

const primitives = primFlips.map(({ flip, translate }) => new Primitive(
    flip,
    'union',
    'triangle-right',
    0,
    1,
    translate,
));

const shapeNoFlip = makeShape('no-flip', primitives);

for (const { flip, translate } of primFlips) {
    const inside = sampleInside(translate.x, translate.y, flip);
    ok(
        sdfCompound(shapeNoFlip, inside.x, inside.y) < 0,
        `triangle-right ${flip} contains interior sample`,
    );

    const outside = sampleOutside(translate.x, translate.y, flip);
    ok(
        sdfCompound(shapeNoFlip, outside.x, outside.y) > 0,
        `triangle-right ${flip} excludes mirrored exterior sample`,
    );
}

const shapeFlipX = makeShape('flip-x', [
    new Primitive('no-flip', 'union', 'triangle-right', 0, 1, { x: 3, y: 0 }),
]);

const insideFlipped = sampleInside(-3, 0, 'flip-x');
ok(
    sdfCompound(shapeFlipX, insideFlipped.x, insideFlipped.y) < 0,
    'shape flip-x mirrors primitive placement',
);

const boxFlipped = aabbCompound(shapeFlipX, 0);
eq(boxFlipped.xMin, -3.5);
eq(boxFlipped.xMax, -2.5);

console.log('All compound tests passed.');
