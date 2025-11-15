import { strictEqual as eq } from 'node:assert';
import { Color } from '../../models/color/color.js';
import { Shape } from '../../models/shape/shape.js';
import { samplePatternColor } from './sample-pattern-color.js';

const ink = new Color(10, 20, 30, 1);
const paper = new Color(200, 210, 220, 1);
const stroke = new Color(0, 0, 0, 1);

const makeShape = (pattern) => new Shape(
    'normal', 'no-flip', ink, paper, pattern, [], 0, 1, stroke, 'center',
    'pixel', 0, { x: 0, y: 0 }
);

// Returns paper for 'all-paper' pattern.
eq(samplePatternColor(makeShape('all-paper')), paper);

// Returns ink for 'all-ink' pattern.
eq(samplePatternColor(makeShape('all-ink')), ink);

console.log('All samplePatternColor() tests passed.');
