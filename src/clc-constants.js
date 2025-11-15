/** @fileoverview constant values used throughout command-line-canvas */

/** #### Feature flag to toggle bounding-box culling
 *
 * When enabled, the renderer will skip expensive SDF calculations for shapes
 * whose world-space axis-aligned bounding box doesn't contain the pixel being
 * shaded. This is a conservative optimization: bounding boxes are chosen to
 * never exclude a pixel that the shape could affect (they may be slightly
 * larger than the true shape), so correctness is preserved.
 *
 * @type {boolean}
 */
export const ENABLE_BOX_CULLING = true;

/** #### The canvas's shorter side, when measured in world units
 *
 * The fixed virtual size of the smaller canvas dimension in world units.
 *
 * The renderer maps the smaller side of the pixel grid to, for example, 10.0
 * world units, so shape maths can run in a resolution‑independent 'world' space.
 *
 * - 10.0 makes coordinates and SDF sizes intuitive and stable across different
 *   pixel resolutions.
 * 
 * Effect of changing 10.0:
 * - Larger value → more world units per pixel → shapes render larger on screen.
 * - Smaller value → everything shrinks in pixels.
 * - Changing this value is equivalent to zooming in/out on the canvas.
 * 
 * Example: for 80×24 canvas:
 * - min = 24 → worldUnitsPerPixel = 10 / 24 ≈ 0.4167
 * - aspectRatio = 80/24 ≈ 3.33 → xExtentWorld = 33.33, yExtentWorld = 10.0
 *
 * Why "10.0" not "10"?
 * - Using a float makes it explicit that world units are floating-point.
 * - Improves readability and intent for future maintainers.
 *
 * @type {number}
 */
export const SIDE_IN_WORLD_UNITS = 10.0;
