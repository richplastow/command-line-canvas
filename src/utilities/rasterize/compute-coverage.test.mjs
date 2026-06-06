import { strictEqual as eq } from 'node:assert';
import { Color } from '../../models/color/color.mjs';
import { computeFillCoverage, computeStrokeCoverage } from './compute-coverage.mjs';


const runComputeCoverageCases = () => {

    // `computeFillCoverage()` returns 0 outside AA region.
    const aaRegion = 1.0;
    const aaHalf = 0.5;
    eq(computeFillCoverage(aaRegion, aaHalf, aaHalf), 0, 'computeFillCoverage() should return zero at the anti-aliasing boundary');
    eq(computeFillCoverage(aaRegion, aaHalf, 1), 0, 'computeFillCoverage() should return zero outside the anti-aliasing region');

    // Returns 0.5 at distance 0 (formula: (aaHalf - 0) / aaRegion).
    eq(computeFillCoverage(aaRegion, aaHalf, 0), 0.5, 'computeFillCoverage() should return half coverage at distance zero');

    // Returns 0.25 at aaHalf/2 distance (formula: (0.5 - 0.25) / 1.0).
    eq(computeFillCoverage(aaRegion, aaHalf, 0.25), 0.25, 'computeFillCoverage() should taper linearly within the anti-aliasing region');

    // Returns 0 for negative distances less than -aaHalf (clamped).
    eq(computeFillCoverage(aaRegion, aaHalf, -aaHalf), 1, 'computeFillCoverage() should clamp interior coverage to one');

    // `computeStrokeCoverage()` returns 0 for zero width or transparent stroke.
    eq(computeStrokeCoverage(aaHalf, 0, 1, new Color(0, 0, 0, 0), 'center',
        'pixel', 1, 1), 0, 'computeStrokeCoverage() should return zero for a transparent stroke');
    eq(computeStrokeCoverage(aaHalf, 0, 1, new Color(0, 0, 0, 1), 'center',
        'pixel', 0, 1), 0, 'computeStrokeCoverage() should return zero for zero stroke width');

    // Returns 1 inside stroke band (center position).
    const strokeColor = new Color(0, 0, 0, 1);
    eq(computeStrokeCoverage(aaHalf, 0, 1, strokeColor, 'center', 'pixel', 2, 1), 1, 'computeStrokeCoverage() should return full coverage inside a centred stroke band');

    // Returns falloff outside band within AA region.
    eq(computeStrokeCoverage(aaHalf, 1.25, 1, strokeColor, 'center', 'pixel', 2, 1), 0.5, 'computeStrokeCoverage() should taper coverage within the anti-aliasing region');

    // Returns 1 inside outside-positioned stroke band.
    eq(computeStrokeCoverage(aaHalf, 0.5, 1, strokeColor, 'outside', 'pixel', 2, 1), 1, 'computeStrokeCoverage() should cover distances inside an outside-positioned stroke band');

    // Returns 1 inside inside-positioned stroke band.
    eq(computeStrokeCoverage(aaHalf, -0.5, 1, strokeColor, 'inside', 'pixel', 2, 1), 1, 'computeStrokeCoverage() should cover distances inside an inside-positioned stroke band');

    // Returns 0 beyond AA region.
    eq(computeStrokeCoverage(aaHalf, 5, 1, strokeColor, 'center', 'pixel', 2, 1), 0, 'computeStrokeCoverage() should return zero beyond the anti-aliasing region');

};

export const testComputeCoverage = () => {
    runComputeCoverageCases();
    console.log('OK: All computeCoverage() tests passed!');
};
