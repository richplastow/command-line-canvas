import { deepEqual as deep, strictEqual as eq } from 'node:assert';
import { readFileSync } from 'node:fs';
import { CommandLineCanvas } from './command-line-canvas.mjs';
import { Color } from './src/models/color/color.mjs';
import { Primitive } from './src/models/primitive/primitive.mjs';
import { Shape } from './src/models/shape/shape.mjs';


const testCommandLineCanvasStatics = () => {
    const packageJson = JSON.parse(
        readFileSync(new URL('./package.json', import.meta.url), 'utf8'),
    );

    eq(
        CommandLineCanvas.version,
        packageJson.version,
        'CommandLineCanvas.version should match the package.json version',
    );
    eq(
        CommandLineCanvas.Color,
        Color,
        'CommandLineCanvas.Color should expose the Color model class',
    );
    eq(
        CommandLineCanvas.Primitive,
        Primitive,
        'CommandLineCanvas.Primitive should expose the Primitive model class',
    );
    eq(
        CommandLineCanvas.Shape,
        Shape,
        'CommandLineCanvas.Shape should expose the Shape model class',
    );
};

const testCommandLineCanvasConstruction = () => {
    const background = new Color(12, 34, 56, 78);
    const pixels = new Uint8ClampedArray(3 * 2 * 4);
    const commandLineCanvas = new CommandLineCanvas({
        antiAliasRegion: 0.85,
        background,
        pixels,
        xExtent: 3,
        yExtent: 2,
    });

    eq(
        commandLineCanvas.canvas.antiAliasRegion,
        0.85,
        'CommandLineCanvas should pass antiAliasRegion through to the internal canvas',
    );
    eq(
        commandLineCanvas.canvas.background,
        background,
        'CommandLineCanvas should reuse the supplied background on the internal canvas',
    );
    eq(
        commandLineCanvas.canvas.xExtent,
        3,
        'CommandLineCanvas should pass xExtent through to the internal canvas',
    );
    eq(
        commandLineCanvas.canvas.yExtent,
        2,
        'CommandLineCanvas should pass yExtent through to the internal canvas',
    );
    const renderedBuffer = commandLineCanvas.canvas.render('truecolor', 'buffer');

    if (!(renderedBuffer instanceof Uint8Array)) {
        throw Error('CommandLineCanvas should render Uint8Array output for buffer format');
    }

    deep(
        Array.from(renderedBuffer),
        Array.from(pixels),
        'CommandLineCanvas should wire the supplied pixel buffer into the internal canvas',
    );
    deep(
        Array.from(pixels),
        [
            12, 34, 56, 78, 12, 34, 56, 78, 12, 34, 56, 78,
            12, 34, 56, 78, 12, 34, 56, 78, 12, 34, 56, 78,
        ],
        'CommandLineCanvas should initialise the supplied pixel buffer from the background colour',
    );
};

export const testCommandLineCanvas = () => {
    testCommandLineCanvasStatics();
    testCommandLineCanvasConstruction();
    console.log('OK: All CommandLineCanvas tests passed!');
};