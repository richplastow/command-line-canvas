import { strictEqual as eq, ok } from 'node:assert';
import { computeWorldXsAndYs } from './compute-world-xs-and-ys.mjs';


const runComputeWorldXsAndYsCases = () => {

    // Square canvas has equal-length coordinate arrays.
    let { worldXs, worldYs } = computeWorldXsAndYs(4, 4);
    eq(worldXs.length, 4, 'computeWorldXsAndYs() should return one x coordinate per canvas column');
    eq(worldYs.length, 4, 'computeWorldXsAndYs() should return one y coordinate per canvas row');

    // Coordinates are centered around zero.
    ok(worldXs[1] < 0 && worldXs[2] > 0, 'computeWorldXsAndYs() should centre x coordinates around zero');
    ok(worldYs[1] < 0 && worldYs[2] > 0, 'computeWorldXsAndYs() should centre y coordinates around zero');

    // Coordinates increase left-to-right and top-to-bottom.
    ok(worldXs[0] < worldXs[1], 'computeWorldXsAndYs() should order x coordinates from left to right');
    ok(worldYs[0] < worldYs[1], 'computeWorldXsAndYs() should order y coordinates from top to bottom');

    // Wide canvas has more X coordinates than Y.
    ({ worldXs, worldYs } = computeWorldXsAndYs(8, 2));
    eq(worldXs.length, 8, 'computeWorldXsAndYs() should return all x coordinates for a wide canvas');
    eq(worldYs.length, 2, 'computeWorldXsAndYs() should return all y coordinates for a wide canvas');

    // Tall canvas has more Y coordinates than X.
    ({ worldXs, worldYs } = computeWorldXsAndYs(2, 8));
    eq(worldXs.length, 2, 'computeWorldXsAndYs() should return all x coordinates for a tall canvas');
    eq(worldYs.length, 8, 'computeWorldXsAndYs() should return all y coordinates for a tall canvas');

    // Single pixel canvas has one coordinate near zero for each axis.
    ({ worldXs, worldYs } = computeWorldXsAndYs(1, 1));
    eq(worldXs.length, 1, 'computeWorldXsAndYs() should return one x coordinate for a single pixel canvas');
    eq(worldYs.length, 1, 'computeWorldXsAndYs() should return one y coordinate for a single pixel canvas');
    ok(Math.abs(worldXs[0]) < 0.01, 'computeWorldXsAndYs() should centre the single x coordinate near zero');
    ok(Math.abs(worldYs[0]) < 0.01, 'computeWorldXsAndYs() should centre the single y coordinate near zero');

};

export const testComputeWorldXsAndYs = () => {
    runComputeWorldXsAndYsCases();
    console.log('OK: All computeWorldXsAndYs() tests passed!');
};
