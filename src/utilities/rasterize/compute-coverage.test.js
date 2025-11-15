import { strictEqual as eq } from 'node:assert';
import { Color } from '../../models/color/color.js';
import { computeFillCoverage, computeStrokeCoverage } from './compute-coverage.js';

// `computeFillCoverage()` returns 0 outside AA region.
const aaRegion = 1.0;
const aaHalf = 0.5;
eq(computeFillCoverage(aaRegion, aaHalf, aaHalf), 0);
eq(computeFillCoverage(aaRegion, aaHalf, 1), 0);

// Returns 0.5 at distance 0 (formula: (aaHalf - 0) / aaRegion).
eq(computeFillCoverage(aaRegion, aaHalf, 0), 0.5);

// Returns 0.25 at aaHalf/2 distance (formula: (0.5 - 0.25) / 1.0).
eq(computeFillCoverage(aaRegion, aaHalf, 0.25), 0.25);

// Returns 0 for negative distances less than -aaHalf (clamped).
eq(computeFillCoverage(aaRegion, aaHalf, -aaHalf), 1);

// `computeStrokeCoverage()` returns 0 for zero width or transparent stroke.
eq(computeStrokeCoverage(aaHalf, 0, 1, new Color(0, 0, 0, 0), 'center',
    'pixel', 1, 1), 0);
eq(computeStrokeCoverage(aaHalf, 0, 1, new Color(0, 0, 0, 1), 'center',
    'pixel', 0, 1), 0);

// Returns 1 inside stroke band (center position).
const strokeColor = new Color(0, 0, 0, 1);
eq(computeStrokeCoverage(aaHalf, 0, 1, strokeColor, 'center', 'pixel', 2, 1), 1);

// Returns falloff outside band within AA region.
eq(computeStrokeCoverage(aaHalf, 1.25, 1, strokeColor, 'center', 'pixel', 2, 1), 0.5);

// Returns 1 inside outside-positioned stroke band.
eq(computeStrokeCoverage(aaHalf, 0.5, 1, strokeColor, 'outside', 'pixel', 2, 1), 1);

// Returns 1 inside inside-positioned stroke band.
eq(computeStrokeCoverage(aaHalf, -0.5, 1, strokeColor, 'inside', 'pixel', 2, 1), 1);

// Returns 0 beyond AA region.
eq(computeStrokeCoverage(aaHalf, 5, 1, strokeColor, 'center', 'pixel', 2, 1), 0);

console.log('All compute coverage tests passed.');
