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
import './src/utilities/rasterize/rasterize.test.js';

// SDFs and AABBs.
import './src/utilities/sdfs-and-aabbs/compound.test.js';
