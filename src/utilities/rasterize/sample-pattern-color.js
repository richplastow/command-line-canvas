import { Color } from '../../models/color/color.js';
import { clamp01 } from './rasterization-utilities.js';

/** @typedef {import('../../models/shape/shape.js').Shape} Shape */

/** #### FLIP_SIGNS
 * - Mapping of human-readable flip modes to the numeric sign factors.
 * - Used when converting world coordinates into shape-local space.
 */
const FLIP_SIGNS = Object.freeze({
    'no-flip': Object.freeze({ x: 1, y: 1 }),
    'flip-x': Object.freeze({ x: -1, y: 1 }),
    'flip-y': Object.freeze({ x: 1, y: -1 }),
    'flip-x-and-y': Object.freeze({ x: -1, y: -1 }),
});

/** #### Computes a positive modulo of `value` with respect to `period`
 * - Guarantees a result in the range 0..period, even for negative `value`.
 * @param {number} value The value to wrap into the period.
 * @param {number} period Wrap period; if zero returns 0 to avoid division/modulo by 0.
 * @returns {number} Number in 0..period when period > 0, otherwise 0.
 */
const positiveMod = (value, period) => {
    if (period === 0) return 0;
    const mod = value % period;
    return mod < 0 ? mod + period : mod;
};

/** #### Calculates how much of a stripe pattern interval is covered by ink
 * - Compute the length of overlap between a one-dimensional interval
 *   [offset, offset + length] and an "ink" segment [0, inkLength].
 * - Used by the stripe-coverage algorithm to accumulate how much of a
 *   pixel footprint overlaps the ink portion of a pattern cycle.
 * @param {number} offset Start coordinate of the interval relative to the ink start (0).
 * @param {number} length Length of the interval to test for overlap.
 * @param {number} inkLength Length of the ink portion inside the repeating cycle.
 * @returns {number} Length of the overlap (>= 0). Returns 0 for non-positive lengths.
 */
const partialStripeCoverage = (offset, length, inkLength) => {
    if (length <= 0) return 0;
    const overlapStart = Math.max(offset, 0);
    const overlapEnd = Math.min(offset + length, inkLength);
    if (overlapEnd <= overlapStart) return 0;
    return overlapEnd - overlapStart;
};

/** #### Converts world coordinates into shape-pattern space
 * - Converts a sample point given in world coordinates into the coordinate
 *   system used by a shape's pattern.
 * - The conversion applies translation, optional flipping, and inverse scaling
 *   so patterns are defined in a stable "shape-local" space independent of
 *   world scaling.
 * @param {Shape} shape The shape whose transform/flip/scale are used.
 * @param {number} worldX X coordinate in world units.
 * @param {number} worldY Y coordinate in world units.
 * @returns {{x:number,y:number}}
 *   Object with numeric `x` and `y` fields representing the sample point in shape-local (pattern) space.
 */
export const toPatternSpace = (shape, worldX, worldY) => {
    const flip = FLIP_SIGNS[shape.flip] || FLIP_SIGNS['no-flip'];
    const scale = shape.scale || 1;
    const invScale = scale === 0 ? 0 : 1 / scale;
    return {
        x: (worldX - shape.translate.x) * flip.x * invScale,
        y: (worldY - shape.translate.y) * flip.y * invScale,
    };
};

/** #### Used by computePatternCycleLocal() to cache results on shape instances
 * - Symbol used as a hidden property key on `Shape` instances to store a
 *   tiny cache object for the computed pattern cycle length.
 * - Avoids recomputing identical values in the inner raster loop while keeping
 *   the cache non-enumerable and collision-free.
 */
const PATTERN_CYCLE_CACHE = Symbol('patternCycleCache');

/** #### Calculates the pattern cycle length in shape-local units
 * - Computes the repeating cycle length of a shape's pattern expressed in
 *   shape-local units. The cycle depends on the shape's `patternScale`, the
 *   `patternUnit` (which may be in pixels, shape units, or world units), the
 *   shape's scale, and the current `worldUnitsPerPixel` used for sampling.
 * - To avoid repeated, expensive recomputation inside the raster loop this
 *   function stores a tiny cache object on the `shape` instance keyed by a
 *   Symbol. The cache is best-effort and silently skipped for frozen or
 *   non-extensible shapes.
 *
 * Edge cases handled:
 * - `patternUnit === 'pixel'` converts `patternScale` to world units by
 *   multiplying with `worldUnitsPerPixel` before transforming to local space.
 * - `patternUnit === 'shape'` treats `patternScale` as relative to the
 *   absolute shape scale.
 * - Non-finite or non-positive computed periods yield `0`.
 *
 * @param {Shape} shape
 *   Shape instance containing `patternScale`, `patternUnit`, and `scale`.
 * @param {number} worldUnitsPerPixel
 *   How many world units correspond to a single screen pixel at the current raster resolution.
 * @returns {number}
 *   Cycle length (number) in shape-local units. */
export const computePatternCycleLocal = (shape, worldUnitsPerPixel) => {
    // Use a tiny per-shape cache to avoid recomputing the cycle on every pixel.
    // Cache key consists of the inputs that affect the cycle.
    const scale = Math.abs(shape.scale) || 1;
    const key = {
        patternScale: shape.patternScale,
        patternUnit: shape.patternUnit,
        scale,
        worldUnitsPerPixel,
    };

    const cached = shape[PATTERN_CYCLE_CACHE];
    if (cached && cached.patternScale === key.patternScale
        && cached.patternUnit === key.patternUnit
        && cached.scale === key.scale
        && cached.worldUnitsPerPixel === key.worldUnitsPerPixel) {
        return cached.cycleLocal;
    }

    let periodWorld;
    switch (shape.patternUnit) {
        case 'pixel':
            periodWorld = shape.patternScale * worldUnitsPerPixel;
            break;
        case 'shape':
            periodWorld = shape.patternScale * scale;
            break;
        case 'world':
        default:
            periodWorld = shape.patternScale;
            break;
    }
    if (!Number.isFinite(periodWorld) || periodWorld <= 0) return 0;
    const cycleLocal = periodWorld / scale;

    // Store into cache on the shape instance (hidden via Symbol).
    try {
        Object.defineProperty(shape, PATTERN_CYCLE_CACHE, {
            value: {
                patternScale: key.patternScale,
                patternUnit: key.patternUnit,
                scale: key.scale,
                worldUnitsPerPixel: key.worldUnitsPerPixel,
                cycleLocal,
            },
            configurable: true,
            writable: true,
        });
    } catch (e) {
        // If shape is frozen or non-extensible, just skip caching.
    }

    return cycleLocal;
};

/** #### Computes ink coverage for a striped pattern over a pixel footprint
 * - Computes the fraction of a pixel footprint that is covered by the ink
 *   portion of a repeating stripe pattern.
 * - The stripe pattern repeats with period `cycleLocal` and the ink occupies
 *   the first `patternRatio` portion of each cycle.
 * - The function integrates coverage across a one-dimensional interval that
 *   represents the pixel footprint projected into the pattern axis. This
 *   approach gives sub-pixel anti-aliased coverage for thin patterns.
 *
 * Edge cases handled:
 * - Non-finite inputs fall back to a best-effort clamped `patternRatio`.
 * - Zero or negative `cycleLocal` yields a constant coverage equal to
 *   clamped `patternRatio`.
 *
 * @param {number} coordCenter
 *   Center coordinate of the pixel footprint in pattern-local units along the stripe axis (either x or y after transformation).
 * @param {number} pixelWidthLocal
 *   Width of the pixel footprint expressed in the same local units (may be zero for degenerate cases).
 * @param {number} cycleLocal
 *   Repeating cycle length in local units; must be > 0 to perform stripe math.
 * @param {number} patternRatio
 *   Proportion of each cycle occupied by ink (clamped to [0,1]).
 * @returns {number}
 *   Number in [0,1] representing the fraction of the pixel covered by ink.
 */
export const computeStripeCoverage = (
    coordCenter,
    pixelWidthLocal,
    cycleLocal,
    patternRatio,
) => {
    if (!Number.isFinite(coordCenter) || !Number.isFinite(pixelWidthLocal)) return clamp01(patternRatio);
    if (!Number.isFinite(cycleLocal) || cycleLocal <= 0) return clamp01(patternRatio);

    const ratio = clamp01(patternRatio);
    if (ratio <= 0) return 0;
    if (ratio >= 1) return 1;

    const inkLength = cycleLocal * ratio;
    const footprint = Math.max(pixelWidthLocal, 0);
    if (footprint === 0) return ratio;

    const half = footprint / 2;
    const start = coordCenter - half;
    const intervalLength = footprint;

    const startMod = positiveMod(start, cycleLocal);
    const firstSpan = Math.min(intervalLength, cycleLocal - startMod);
    let covered = partialStripeCoverage(startMod, firstSpan, inkLength);

    let remaining = intervalLength - firstSpan;
    if (remaining > 0) {
        const fullCycles = Math.floor(remaining / cycleLocal);
        covered += fullCycles * inkLength;
        remaining -= fullCycles * cycleLocal;
        covered += partialStripeCoverage(0, remaining, inkLength);
    }

    return clamp01(covered / intervalLength);
};

/** #### Blends ink and paper colours using the supplied coverage
 * - Produces a new `Color` by linearly interpolating between `paper` and
 *   `ink` according to `coverage` where `coverage === 0` yields `paper` and
 *   `coverage === 1` yields `ink`.
 * - The function handles early exit cases for 0 and 1 coverage to avoid
 *   unnecessary object allocations in hot code paths.
 * @param {import('../../models/color/color.js').Color} ink
 *   Color used for the ink portion of the pattern.
 * @param {import('../../models/color/color.js').Color} paper
 *   Background/paper color used where there is no ink.
 * @param {number} coverage
 *   Fraction of the pixel covered by ink, which will be clamped to 0..1.
 * @returns {import('../../models/color/color.js').Color}
 *   A newly constructed `Color` instance representing the blended result.
 */
export const mixPatternColors = (ink, paper, coverage) => {
    if (coverage <= 0) return paper;
    if (coverage >= 1) return ink;
    const inkWeight = coverage;
    const paperWeight = 1 - coverage;
    return new Color(
        (ink.r * inkWeight) + (paper.r * paperWeight),
        (ink.g * inkWeight) + (paper.g * paperWeight),
        (ink.b * inkWeight) + (paper.b * paperWeight),
        (ink.a * inkWeight) + (paper.a * paperWeight),
    );
};

/** #### Chooses the colour from a shape according to its pattern
 * - Computes an anti-aliased coverage value, and blends the `ink` and `paper`
 *   colours accordingly.
 * - If `shape.pattern` is `all-ink` or `all-paper` returns the corresponding
 *   colour immediately.
 * - For stripe patterns the function:
 *   - Converts the world sample point into pattern space using
 *     `toPatternSpace()`.
 *   - Computes the repeating cycle length in local units using
 *     `computePatternCycleLocal()`.
 *   - Computes the pixel footprint width in local units and uses
 *     `computeStripeCoverage()` to obtain a coverage value.
 *   - Blends `ink` and `paper` with `mixPatternColors()` using the computed
 *     coverage and returns the result.
 * @param {Shape} shape The shape being sampled.
 * @param {number} worldX X coordinate in world units for the sample.
 * @param {number} worldY Y coordinate in world units for the sample.
 * @param {number} worldUnitsPerPixel
 *   How many world units correspond to one screen pixel at the current raster resolution.
 * @returns {import('../../models/color/color.js').Color}
 *   Sampled colour for the shape at the supplied world sample location.
 */
export const samplePatternColor = (
    shape,
    worldX,
    worldY,
    worldUnitsPerPixel,
) => {
    if (shape.pattern === 'all-ink') return shape.ink;
    if (shape.pattern === 'all-paper') return shape.paper;

    const patternSpace = toPatternSpace(shape, worldX, worldY);
    const cycleLocal = computePatternCycleLocal(shape, worldUnitsPerPixel);
    const pixelWidthLocal = (worldUnitsPerPixel / (Math.abs(shape.scale) || 1));

    let coverage = clamp01(shape.patternRatio);
    switch (shape.pattern) {
        case 'breton':
            coverage = computeStripeCoverage(
                patternSpace.y,
                pixelWidthLocal,
                cycleLocal,
                shape.patternRatio,
            );
            break;
        case 'pinstripe':
            coverage = computeStripeCoverage(
                patternSpace.x,
                pixelWidthLocal,
                cycleLocal,
                shape.patternRatio,
            );
            break;
        default:
            break;
    }

    return mixPatternColors(shape.ink, shape.paper, coverage);
};
