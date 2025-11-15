/** #### Chooses the colour from a shape according to its pattern.
 * @param {import('../../models/shape/shape.js').Shape} shape Shape object.
 * @returns {import('../../models/color/color.js').Color} Chosen colour.
 */
export const samplePatternColor = (shape) => {
    switch (shape.pattern) {
        case 'all-paper':
            return shape.paper;
        case 'all-ink':
        default:
            // TODO support patterned fills (breton, pinstripe).
            return shape.ink;
    }
};
