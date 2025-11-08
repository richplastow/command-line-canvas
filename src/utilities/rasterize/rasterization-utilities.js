/**
 * @fileoverview
 * Miscellaneous small utilities for rasterization.
 */

export const blendChannel = (mode, src, dst) => {
    switch (mode) {
        case 'multiply':
            return clamp01(src * dst);
        case 'screen':
            return clamp01(1 - ((1 - clamp01(src)) * (1 - clamp01(dst))));
        case 'overlay': {
            const base = clamp01(dst);
            const top = clamp01(src);
            return base <= 0.5
                ? clamp01(2 * base * top)
                : clamp01(1 - (2 * (1 - base) * (1 - top)));
        }
        case 'normal':
        default:
            return clamp01(src);
    }
};

export const clamp01 = (value) => {
    if (value <= 0) return 0;
    if (value >= 1) return 1;
    return value;
};

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

export const toByte = (value) => Math.round(clamp01(value) * 255);
