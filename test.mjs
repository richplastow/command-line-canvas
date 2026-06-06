/** @fileoverview Runs all unit tests */

import { testCommandLineCanvas } from './command-line-canvas.test.mjs';

// Canvas.
import { testCanvasValidators } from './src/models/canvas/canvas-validators.test.mjs';
import { testCanvas } from './src/models/canvas/canvas.test.mjs';
import { testEncodeAnsi } from './src/utilities/encoders/encode-ansi.test.mjs';
import { testEncodeBraille } from './src/utilities/encoders/encode-braille.test.mjs';
import { testEncodeBuffer } from './src/utilities/encoders/encode-buffer.test.mjs';
import { testEncodeHtml } from './src/utilities/encoders/encode-html.test.mjs';

// Color.
import { testColorValidators } from './src/models/color/color-validators.test.mjs';
import { testColor } from './src/models/color/color.test.mjs';

// Primitive.
import { testPrimitiveValidators } from './src/models/primitive/primitive-validators.test.mjs';
import { testPrimitive } from './src/models/primitive/primitive.test.mjs';

// Shape.
import { testShapeValidators } from './src/models/shape/shape-validators.test.mjs';
import { testShape } from './src/models/shape/shape.test.mjs';

// Rasterize.
import { testComputeCoverage } from './src/utilities/rasterize/compute-coverage.test.mjs';
import { testComputeShapeAabbs } from './src/utilities/rasterize/compute-shape-aabbs.test.mjs';
import { testRasterizationUtilities } from './src/utilities/rasterize/rasterization-utilities.test.mjs';
import { testComputeFinalPixelValue } from './src/utilities/rasterize/compute-final-pixel-value.test.mjs';
import { testSamplePatternColor } from './src/utilities/rasterize/sample-pattern-color.test.mjs';
import { testComputeWorldXsAndYs } from './src/utilities/rasterize/compute-world-xs-and-ys.test.mjs';
import { testRasterize } from './src/utilities/rasterize/rasterize.test.mjs';
import { testResetPixelGrid } from './src/utilities/rasterize/reset-pixel-grid.test.mjs';

// SDFs and AABBs.
import { testCompound } from './src/utilities/sdfs-and-aabbs/compound.test.mjs';

// End-to-end tests.
// TODO add thorough e2e tests once src/ is stable
import { testRotateAndFlipShape } from './e2e/rotate/rotate-and-flip-shape.test.mjs';
import { testRotateAndFlipTriangle } from './e2e/rotate/rotate-and-flip-triangle.test.mjs';
import { testRotateShape } from './e2e/rotate/rotate-shape.test.mjs';
import { testRotateTriangle } from './e2e/rotate/rotate-triangle.test.mjs';
import { testStrokeCircle } from './e2e/stroke/stroke-circle.test.mjs';

testCommandLineCanvas();

// Canvas.
testCanvasValidators();
testCanvas();
testEncodeAnsi();
testEncodeBraille();
testEncodeBuffer();
testEncodeHtml();

// Color.
testColorValidators();
testColor();

// Primitive.
testPrimitiveValidators();
testPrimitive();

// Shape.
testShapeValidators();
testShape();

// Rasterize.
testComputeCoverage();
testComputeShapeAabbs();
testRasterizationUtilities();
testComputeFinalPixelValue();
testSamplePatternColor();
testComputeWorldXsAndYs();
testRasterize();
testResetPixelGrid();

// SDFs and AABBs.
testCompound();

// End-to-end tests.
testRotateAndFlipShape();
testRotateAndFlipTriangle();
testRotateShape();
testRotateTriangle();
testStrokeCircle();
