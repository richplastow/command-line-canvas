import { strictEqual as eq, ok } from 'node:assert';
import { computeWorldXsAndYs } from './compute-world-xs-and-ys.js';

// Square canvas has equal-length coordinate arrays.
let { worldXs, worldYs } = computeWorldXsAndYs(4, 4);
eq(worldXs.length, 4);
eq(worldYs.length, 4);

// Coordinates are centered around zero.
ok(worldXs[1] < 0 && worldXs[2] > 0);
ok(worldYs[1] < 0 && worldYs[2] > 0);

// Coordinates increase left-to-right and top-to-bottom.
ok(worldXs[0] < worldXs[1]);
ok(worldYs[0] < worldYs[1]);

// Wide canvas has more X coordinates than Y.
({ worldXs, worldYs } = computeWorldXsAndYs(8, 2));
eq(worldXs.length, 8);
eq(worldYs.length, 2);

// Tall canvas has more Y coordinates than X.
({ worldXs, worldYs } = computeWorldXsAndYs(2, 8));
eq(worldXs.length, 2);
eq(worldYs.length, 8);

// Single pixel canvas has one coordinate near zero for each axis.
({ worldXs, worldYs } = computeWorldXsAndYs(1, 1));
eq(worldXs.length, 1);
eq(worldYs.length, 1);
ok(Math.abs(worldXs[0]) < 0.01);
ok(Math.abs(worldYs[0]) < 0.01);

console.log('All computeWorldXsAndYs tests passed.');

console.log('All computeWorldXsAndYs tests passed.');
