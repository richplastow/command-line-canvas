import { Shape } from '../../models/shape/shape.js';
import { aabbCompound, aabbPrimitiveInShape } from '../sdfs-and-aabbs/compound.js';

/** #### Computes axis-aligned bounding boxes (AABBs) for shapes in world-space
 * - These AABBs are 'conservative', meaning they err on the side of being too
 *   large rather than too small, to avoid incorrectly culling pixels that the
 *   shape could affect.
 * - Uses the AABB functions colocated with SDFs to compute the boxes.
 * @param {number} aaRegion Anti-alias region in world units
 * @param {{id:number,shape:Shape}[]} shapes List of shapes to rasterize
 * @param {number} worldUnitsPerPixel World units per pixel
 * @param {string} [xpx='computeShapeAABBs():'] Exception prefix
 */
export const computeShapeAABBs = (
    aaRegion,
    shapes,
    worldUnitsPerPixel,
    xpx = 'computeShapeAABBs():',
) =>
    shapes.map(({ shape }) => { // `id` is not needed here
        // Start by expanding boxes by the anti-alias region, so that edge
        // pixels aren't culled.
        let expand = aaRegion;

        // Calculate stroke width in world units based on strokeUnit.
        let strokeWidthWorld = 0;
        switch (shape.strokeUnit) {
            case 'pixel':
                strokeWidthWorld = shape.strokeWidth * worldUnitsPerPixel;
                break;
            case 'shape':
                strokeWidthWorld = shape.strokeWidth * worldUnitsPerPixel * shape.scale;
                break;
            case 'world':
                strokeWidthWorld = shape.strokeWidth;
                break;
        }

        // Expand outward for strokes that lie outside or are centred on the
        // shape boundary so we don't accidentally cull stroke pixels.
        switch (shape.strokePosition) {
            case 'center':
                expand += strokeWidthWorld / 2;
                break;
            case 'inside': // no further expansion needed
                break;
            case 'outside':
                expand += strokeWidthWorld;
                break;
            default: // should be unreachable, if validateStrokePosition() was used
                throw Error(`${xpx} invalid strokePosition`);
        }

        // Use an aggregate AABB which unions all primitive AABBs.
        const bounds = aabbCompound(shape, expand);

        // Collect debug AABBs for primitives that request them.
        const primitiveDebugAabbs = [];
        for (let pi = 0; pi < shape.primitives.length; pi++) {
            const primitive = shape.primitives[pi];
            if (primitive.debugPrimitiveAabb === null) continue;

            const primBox = aabbPrimitiveInShape(expand, primitive, shape);
            if (primBox === null) continue;

            primitiveDebugAabbs.push({
                bounds: primBox,
                color: primitive.debugPrimitiveAabb,
            });
        }

        return {
            bounds,
            primitiveDebugAabbs,
        };
    });
