import { strictEqual as eq, ok } from 'node:assert';
import { Color } from '../../models/color/color.js';
import { Shape } from '../../models/shape/shape.js';
import {
    computePatternCycleLocal,
    computeStripeCoverage,
    mixPatternColors,
    samplePatternColor,
    toPatternSpace,
} from './sample-pattern-color.js';

const ink = new Color(10, 20, 30, 1);
const paper = new Color(200, 210, 220, 1);
const stroke = new Color(0, 0, 0, 1);

const makeShape = (overrides = {}) => {
    return new Shape(
        overrides.blendMode ?? 'normal',
        null,
        overrides.flip ?? 'no-flip',
        overrides.ink ?? ink,
        overrides.paper ?? paper,
        overrides.pattern ?? 'all-ink',
        overrides.patternRatio ?? 0.5,
        overrides.patternScale ?? 1,
        overrides.patternUnit ?? 'pixel',
        overrides.primitives ?? [],
        overrides.rotate ?? 0,
        overrides.scale ?? 1,
        overrides.strokeColor ?? stroke,
        overrides.strokePosition ?? 'center',
        overrides.strokeUnit ?? 'pixel',
        overrides.strokeWidth ?? 0,
        overrides.translate ?? { x: 0, y: 0 },
    );
};

const approx = (actual, expected, eps = 1e-6) => {
    ok(Math.abs(actual - expected) <= eps,
        `expected ${actual} ≈ ${expected}`);
};

const approxColor = (color, expected) => {
    approx(color.r, expected.r);
    approx(color.g, expected.g);
    approx(color.b, expected.b);
    approx(color.a, expected.a);
};

// `toPatternSpace()` applies translate, flip, and scale.
const flipped = makeShape({
    flip: 'flip-y',
    scale: 2,
    translate: { x: 1, y: -2 },
});
const patternSpace = toPatternSpace(flipped, 3, 0);
approx(patternSpace.x, 1);
approx(patternSpace.y, -1);

// `computePatternCycleLocal()` converts different units.
const pixelUnit = makeShape({ patternScale: 4, patternUnit: 'pixel', scale: 2 });
approx(computePatternCycleLocal(pixelUnit, 1), 2);
const shapeUnit = makeShape({ patternScale: 3, patternUnit: 'shape', scale: 2 });
approx(computePatternCycleLocal(shapeUnit, 1), 3);
const worldUnit = makeShape({ patternScale: 5, patternUnit: 'world', scale: 2 });
approx(computePatternCycleLocal(worldUnit, 1), 2.5);

// `computeStripeCoverage()` handles partial, full, and zero coverage.
approx(computeStripeCoverage(0, 1, 4, 0.5), 0.5);
approx(computeStripeCoverage(1, 1, 4, 0.5), 1);
approx(computeStripeCoverage(3, 1, 4, 0.5), 0);

// `mixPatternColors()` preserves extremes and blends mid coverage.
eq(mixPatternColors(ink, paper, 0), paper);
eq(mixPatternColors(ink, paper, 1), ink);
const mixed = mixPatternColors(ink, paper, 0.5);
approxColor(mixed, {
    r: (ink.r + paper.r) / 2,
    g: (ink.g + paper.g) / 2,
    b: (ink.b + paper.b) / 2,
    a: (ink.a + paper.a) / 2,
});

// Returns paper for 'all-paper' pattern.
// TODO sample more pixel locations to be sure
const allPaper = makeShape({ pattern: 'all-paper' });
eq(samplePatternColor(allPaper, 0, 0, 1), paper);

// Returns ink for 'all-ink' pattern.
// TODO sample more pixel locations to be sure
const allInk = makeShape({ pattern: 'all-ink' });
eq(samplePatternColor(allInk, 0, 0, 1), ink);

// Breton stripes blend ink and paper based on coverage.
// TODO remove the approxColor() helper and test more thoroughly
const breton = makeShape({ pattern: 'breton', patternScale: 4, patternUnit: 'pixel' });
const bretonColour = samplePatternColor(breton, 0, 0, 1);
approxColor(bretonColour, {
    r: (ink.r + paper.r) / 2,
    g: (ink.g + paper.g) / 2,
    b: (ink.b + paper.b) / 2,
    a: (ink.a + paper.a) / 2,
});

// Pinstripes align vertically and respect shape units.
// TODO test more thoroughly
const pinstripe = makeShape({
    pattern: 'pinstripe',
    patternRatio: 0.25,
    patternScale: 2,
    patternUnit: 'shape',
    scale: 2,
});
eq(samplePatternColor(pinstripe, 0.5, 0, 1), ink);
eq(samplePatternColor(pinstripe, 1.5, 0, 1), paper);


console.log('All samplePatternColor() tests passed.');
