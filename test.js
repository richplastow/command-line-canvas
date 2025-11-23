/** @fileoverview Runs all unit tests */

// Canvas.
import './src/models/canvas/canvas-validators.test.js';
import './src/models/canvas/canvas.test.js';
import './src/utilities/encoders/encode-ansi.test.js';
import './src/utilities/encoders/encode-html.test.js';
import './src/utilities/encoders/encode-buffer.test.js';

// Color.
import './src/models/color/color-validators.test.js';
import './src/models/color/color.test.js';

// Pixel.
import './src/models/pixel/pixel-validators.test.js';
import './src/models/pixel/pixel.test.js';

// Primitive.
import './src/models/primitive/primitive-validators.test.js';
import './src/models/primitive/primitive.test.js';

// Shape.
import './src/models/shape/shape-validators.test.js';
import './src/models/shape/shape.test.js';

// Rasterize.
import './src/utilities/rasterize/compute-coverage.test.js';
import './src/utilities/rasterize/compute-shape-aabbs.test.js';
import './src/utilities/rasterize/rasterization-utilities.test.js';
import './src/utilities/rasterize/compute-final-pixel-value.test.js';
import './src/utilities/rasterize/sample-pattern-color.test.js';
import './src/utilities/rasterize/compute-world-xs-and-ys.test.js';
import './src/utilities/rasterize/rasterize.test.js';
import './src/utilities/rasterize/reset-pixel-grid.test.js';

// SDFs and AABBs.
import './src/utilities/sdfs-and-aabbs/compound.test.js';

// End-to-end tests.
// TODO add thorough e2e tests once src/ is stable
import './e2e/rotate/rotate-and-flip-shape.test.js';
import './e2e/rotate/rotate-and-flip-triangle.test.js';
import './e2e/rotate/rotate-shape.test.js';
import './e2e/rotate/rotate-triangle.test.js';
import './e2e/stroke/stroke-circle.test.js';