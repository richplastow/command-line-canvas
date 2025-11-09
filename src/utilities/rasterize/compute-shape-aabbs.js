import { aabbCompound } from '../sdfs-and-aabbs/compound.js';

/** #### Computes axis-aligned bounding boxes (AABBs) for shapes in world-space
 *
 * - These AABBs are 'conservative', meaning they err on the side of being too
 *   large rather than too small, to avoid incorrectly culling pixels that the
 *   shape could affect.
 * - Uses the AABB functions colocated with SDFs to compute the boxes.
 *
 * @param {number} aaRegion Anti-alias region in world units
 * @param {{id:number,shape:object}[]} shapes List of shapes to rasterize
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

        // Expand outward for strokes that lie outside or are centred on the
        // shape boundary so we don't accidentally cull stroke pixels.
        // Expansion is in world units, so convert stroke width from pixels.
        switch (shape.strokePosition) {
            case 'outside':
                expand += shape.strokeWidth * worldUnitsPerPixel;
                break;
            case 'inside': // no further expansion needed
                break;
            case 'center':
                expand += shape.strokeWidth * worldUnitsPerPixel / 2;
                break;
            default: // should be unreachable, if validateStrokePosition() was used
                throw Error(`${xpx} invalid strokePosition`);
        }

        // Use an aggregate AABB which unions all primitive AABBs.
        return aabbCompound(shape, expand);
    });
