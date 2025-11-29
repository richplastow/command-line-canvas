# Feasibility Study: Advanced Rendering Features for Command Line Canvas

- Created: 29th November 2025
- Author: Copilot Claude Opus 4.5 (Preview)

## Prompt:

Please write me a feasibility study for implementing the following new features:

1. Add `patternRotate` and `patternTranslate` to Shape, for more control of
   pattern rendering
2. Let `ink` and `paper` each be a gradient (linear or radial, with multiple
   'stops', and a little noise to help with low colour depths)
3. `glowOuter`, `glowInner`, `shadowOuter`, `shadowInner`, `bevelInner`,
   `bevelOuter` — each with its own blend mode ('multiply' shadows look great) —
   and consider a global 'light source'
4. Where 2 Primitives in a Shape overlap, adjust the 'blend' — this is pretty
   easy with SDFs

## Executive Summary

This study evaluates four proposed feature enhancements for the Command Line
Canvas library. The codebase is well-structured with a clean SDF-based rendering
pipeline, making most features feasible with moderate effort.

| Feature                        | Feasibility | Complexity    | Estimated Effort |
| ------------------------------ | ----------- | ------------- | ---------------- |
| 1. Pattern Transform           | ✅ High     | Low-Medium    | 1-2 days         |
| 2. Gradient Support            | ✅ High     | Medium        | 3-5 days         |
| 3. Effects (Glow/Shadow/Bevel) | ⚠️ Medium   | High          | 1-2 weeks        |
| 4. Primitive Blend Overlap     | ✅ High     | Medium-High   | 3-5 days         |

## 1. Pattern Transform: `patternRotate` and `patternTranslate`

### Current Architecture

The pattern system is already well-designed for this extension:

- `Shape` has `patternScale`, `patternRatio`, and `patternUnit` properties
- `toPatternSpace()` in sample-pattern-color.js transforms world coordinates to
  pattern-local space
- Pattern sampling uses the transformed coordinates for stripe coverage
  calculation

### Implementation Strategy

**Minimal changes required:**

1. **Add properties to `Shape`:**
   ```js
   patternRotate = 0;        // radians
   patternTranslate = { x: 0, y: 0 };
   ```

2. **Modify `toPatternSpace()`** to apply rotation and translation:
   ```js
   export const toPatternSpace = (shape, worldX, worldY) => {
       const flip = FLIP_SIGNS[shape.flip] || FLIP_SIGNS['no-flip'];
       const scale = shape.scale || 1;
       const invScale = scale === 0 ? 0 : 1 / scale;
       
       // Current transform
       let x = (worldX - shape.translate.x) * flip.x * invScale;
       let y = (worldY - shape.translate.y) * flip.y * invScale;
       
       // NEW: Apply pattern translation
       x -= shape.patternTranslate.x;
       y -= shape.patternTranslate.y;
       
       // NEW: Apply pattern rotation (inverse)
       if (shape.patternRotate !== 0) {
           const cos = Math.cos(-shape.patternRotate);
           const sin = Math.sin(-shape.patternRotate);
           const rx = x * cos - y * sin;
           const ry = x * sin + y * cos;
           x = rx;
           y = ry;
       }
       
       return { x, y };
   };
   ```

3. **Add validators** in `shape-validators.js`

### Risk Assessment
- **Low risk**: Isolated change to existing function
- **No performance impact**: Adds 1 conditional rotation per pixel (already done
  for shapes)

### Feasibility: ✅ HIGH — Straightforward extension of existing pattern system

---

## 2. Gradient Support for `ink` and `paper`

### Current Architecture

- `ink` and `paper` are currently `Color` objects (RGBA 0-255)
- `samplePatternColor()` returns a blended `Color` based on pattern coverage
- The pipeline expects `Color` objects throughout

### Implementation Strategy

**A. Define Gradient Types:**

```js
// New types in clc-types.js

/**
 * @typedef {{
 *     offset: number,  // 0-1 position along gradient
 *     color: Color,
 * }} GradientStop
 *
 * @typedef {{
 *     type: 'linear',
 *     angle: number,           // radians
 *     stops: GradientStop[],
 *     noise: number,           // 0-1, dithering amount for low color depths
 *     unit: 'pixel'|'shape'|'world',
 * }} LinearGradient
 *
 * @typedef {{
 *     type: 'radial',
 *     center: { x: number, y: number },
 *     radius: number,
 *     stops: GradientStop[],
 *     noise: number,
 *     unit: 'pixel'|'shape'|'world',
 * }} RadialGradient
 *
 * @typedef {Color | LinearGradient | RadialGradient} ColorOrGradient
 */
```

**B. Create Gradient Sampling Function:**

```js
// New file: src/utilities/rasterize/sample-gradient.js

export const sampleGradient = (gradient, worldX, worldY, shape, worldUnitsPerPixel) => {
    if (gradient instanceof Color) return gradient;
    
    // Transform to appropriate coordinate space
    let x = worldX, y = worldY;
    if (gradient.unit === 'shape') {
        const local = toPatternSpace(shape, worldX, worldY);
        x = local.x; y = local.y;
    }
    
    let t; // 0-1 position along gradient
    if (gradient.type === 'linear') {
        const cos = Math.cos(gradient.angle);
        const sin = Math.sin(gradient.angle);
        t = (x * cos + y * sin + 0.5); // Project onto gradient axis
    } else { // radial
        const dx = x - gradient.center.x;
        const dy = y - gradient.center.y;
        t = Math.hypot(dx, dy) / gradient.radius;
    }
    
    // Apply noise for dithering
    if (gradient.noise > 0) {
        t += (Math.random() - 0.5) * gradient.noise * 0.1;
    }
    
    t = clamp01(t);
    
    // Interpolate between stops
    return interpolateStops(gradient.stops, t);
};

const interpolateStops = (stops, t) => {
    // Find surrounding stops and lerp
    // ... standard gradient interpolation
};
```

**C. Modify `samplePatternColor()`:**

```js
export const samplePatternColor = (shape, worldX, worldY, worldUnitsPerPixel) => {
    // Sample ink/paper as gradients instead of direct colors
    const inkColor = sampleGradient(shape.ink, worldX, worldY, shape, worldUnitsPerPixel);
    const paperColor = sampleGradient(shape.paper, worldX, worldY, shape, worldUnitsPerPixel);
    
    if (shape.pattern === 'all-ink') return inkColor;
    if (shape.pattern === 'all-paper') return paperColor;
    
    // ... rest of pattern sampling, using inkColor/paperColor
    return mixPatternColors(inkColor, paperColor, coverage);
};
```

### Noise/Dithering for Low Color Depths

The `noise` parameter adds subtle randomness to prevent banding:

```js
// Ordered dithering would be more deterministic:
const bayer4x4 = [
    [0, 8, 2, 10], [12, 4, 14, 6],
    [3, 11, 1, 9], [15, 7, 13, 5]
];
const ditherOffset = bayer4x4[y % 4][x % 4] / 16 - 0.5;
t += ditherOffset * gradient.noise * 0.1;
```

### Risk Assessment
- **Medium risk**: Requires changes to type system and validation
- **Performance**: Additional gradient sampling per pixel (~10-20% overhead for
  gradient shapes)
- **Breaking change**: `ink`/`paper` type changes from `Color` to
  `ColorOrGradient`

### Feasibility: ✅ HIGH — Well-understood technique, clean integration path

---

## 3. Effects: Glow, Shadow, Bevel

### Current Architecture

- SDF distance is computed once per pixel via `sdfCompound()`
- Coverage is calculated from distance for fill and stroke
- Blend modes exist: `'multiply'|'normal'|'overlay'|'screen'`

### Implementation Strategy

**A. Add Effect Properties to Shape:**

```js
// In Shape class
/** @type {EffectConfig|null} */
glowOuter = null;
glowInner = null;
shadowOuter = null;
shadowInner = null;
bevelOuter = null;
bevelInner = null;

// Effect configuration type
/**
 * @typedef {{
 *     color: Color,
 *     size: number,              // world units or pixels based on unit
 *     unit: 'pixel'|'shape'|'world',
 *     blur: number,              // softness, 0-1
 *     blendMode: 'multiply'|'normal'|'overlay'|'screen',
 *     offset?: { x: number, y: number },  // for shadows
 * }} EffectConfig
 *
 * @typedef {{
 *     color: Color,
 *     size: number,
 *     unit: 'pixel'|'shape'|'world',
 *     angle: number,             // light source angle (radians)
 *     depth: number,             // bevel height
 *     blendMode: 'multiply'|'normal'|'overlay'|'screen',
 * }} BevelConfig
 */
```

**B. Global Light Source:**

```js
// In Canvas class or as a render parameter
lightSource = {
    angle: Math.PI / 4,    // 45° default
    elevation: 0.7,        // 0=horizon, 1=overhead
};
```

**C. Effect Rendering in `rasterize()`:**

Effects require multiple SDF samples or modified distance calculations:

```js
// In rasterize(), after computing base distance:
const distance = sdfCompound(shape, worldX, worldY);

// Outer glow: use distance directly (positive = outside)
if (shape.glowOuter) {
    const glowDist = distance; // positive outside shape
    const glowCoverage = computeGlowCoverage(glowDist, shape.glowOuter);
    // Blend glow color with blendMode
}

// Inner glow: use negative distance (inside shape)
if (shape.glowInner) {
    const innerDist = -distance; // positive inside shape
    const glowCoverage = computeGlowCoverage(innerDist, shape.glowInner);
}

// Shadow: offset sample point, then compute distance
if (shape.shadowOuter) {
    const shadowDist = sdfCompound(shape, 
        worldX - shape.shadowOuter.offset.x,
        worldY - shape.shadowOuter.offset.y
    );
    const shadowCoverage = computeShadowCoverage(shadowDist, shape.shadowOuter);
}

// Bevel: use distance + gradient (normal) for lighting
if (shape.bevelInner || shape.bevelOuter) {
    // Compute SDF gradient (normal) via central differences
    const eps = worldUnitsPerPixel * 0.5;
    const nx = (sdfCompound(shape, worldX + eps, worldY) - 
                sdfCompound(shape, worldX - eps, worldY)) / (2 * eps);
    const ny = (sdfCompound(shape, worldX, worldY + eps) - 
                sdfCompound(shape, worldX, worldY - eps)) / (2 * eps);
    
    // Dot with light direction for shading
    const lightDot = nx * Math.cos(lightAngle) + ny * Math.sin(lightAngle);
    // Apply highlight/shadow based on lightDot
}
```

**D. Effect Coverage Functions:**

```js
const computeGlowCoverage = (distance, config) => {
    const sizeWorld = convertToWorld(config.size, config.unit, ...);
    if (distance >= sizeWorld) return 0;
    if (distance <= 0) return 1;
    
    // Smooth falloff
    const t = distance / sizeWorld;
    return Math.pow(1 - t, 2 + config.blur * 3); // Quadratic falloff
};

const computeBevelShading = (lightDot, config) => {
    // lightDot: -1 to 1 (facing away vs facing light)
    // Return highlight (positive) or shadow (negative) intensity
    return lightDot * config.depth;
};
```

### Render Order Considerations

Effects must be rendered in the correct order:
1. **Outer shadow** (behind shape)
2. **Outer glow** (behind/around shape)
3. **Fill** (shape interior)
4. **Inner shadow** (inside shape edge)
5. **Inner glow** (inside shape)
6. **Inner bevel** (inside edge highlight/shadow)
7. **Outer bevel** (edge highlight/shadow)
8. **Stroke** (on top)

This requires restructuring the render loop to accumulate layers.

### Performance Concerns

- **Bevel**: Requires 4 additional SDF evaluations per pixel (gradient
  computation)
- **Shadow with offset**: Requires 1 additional SDF evaluation per pixel
- **Glow**: No additional SDF evaluations (reuses existing distance)

**Mitigation**: 
- Cache SDF gradient computation
- Use AABB culling (already implemented) — expand AABB by effect size
- Make effects optional (null = disabled)

### Risk Assessment
- **High complexity**: Significant changes to render loop
- **Performance impact**: 2-5x slower for shapes with bevels
- **Testing**: Many edge cases with overlapping effects

### Feasibility: ⚠️ MEDIUM — Achievable but requires careful architecture

---

## 4. Primitive Blend Overlap (SDF Smooth Blending)

### Current Architecture

The `sdfCompound()` function currently uses hard union/difference:

```js
if (p.joinMode === 'union') {
    acc = Math.min(acc, dWorld);  // Hard union
} else {
    acc = Math.max(acc, -dWorld); // Hard difference
}
```

### Implementation Strategy

SDF smooth blending is a well-known technique. The key operations:

**A. Add Blend Properties to Primitive:**

```js
// In Primitive class
/** @type {'hard'|'smooth'} */
blendType = 'hard';

/** @type {number} Smoothing radius for soft blends */
blendRadius = 0.1;
```

**B. Implement Smooth SDF Operations:**

```js
// Smooth minimum (for soft union)
const smin = (a, b, k) => {
    if (k <= 0) return Math.min(a, b);
    const h = Math.max(k - Math.abs(a - b), 0) / k;
    return Math.min(a, b) - h * h * h * k * (1/6);
};

// Smooth maximum (for soft difference/intersection)
const smax = (a, b, k) => {
    return -smin(-a, -b, k);
};
```

**C. Modify `sdfCompound()`:**

```js
if (acc === null) {
    acc = dWorld;
} else if (p.joinMode === 'union') {
    if (p.blendType === 'smooth') {
        const blendWorld = p.blendRadius * totalScale;
        acc = smin(acc, dWorld, blendWorld);
    } else {
        acc = Math.min(acc, dWorld);
    }
} else { // difference
    if (p.blendType === 'smooth') {
        const blendWorld = p.blendRadius * totalScale;
        acc = smax(acc, -dWorld, blendWorld);
    } else {
        acc = Math.max(acc, -dWorld);
    }
}
```

### Visual Examples

```
Hard union:          Smooth union (smin):
  ●●                    ●●
 ●  ●                  ●~~●
●    ●   +   ●        ●~~~~●
 ●  ●   ●●●  ●        ●~~~~●
  ●●   ●   ●●          ●~~●
        ●●              ●●
        
(Sharp intersection)  (Blended organic form)
```

### AABB Considerations

Smooth blending can slightly expand the shape boundary. The existing `expand`
parameter in `aabbCompound()` should account for this:

```js
// When computing AABB, add blend radius
const effectiveExpand = expand + maxBlendRadius;
```

### Risk Assessment
- **Low-medium risk**: Well-understood SDF technique
- **Minimal performance impact**: Slightly more complex math per SDF evaluation
- **No breaking changes**: Default `blendType: 'hard'` preserves existing
  behavior

### Feasibility: ✅ HIGH — Classic SDF technique, clean integration

---

## Implementation Roadmap

### Phase 1: Low-Hanging Fruit (1 week)
1. **Pattern Transform** — `patternRotate`, `patternTranslate`
2. **Primitive Blend Overlap** — smooth union/difference

### Phase 2: Gradients (1 week)
3. **Gradient Support** — Linear and radial gradients for `ink`/`paper`
4. **Dithering/Noise** — For low color depth output

### Phase 3: Effects (2-3 weeks)
5. **Glow Effects** — `glowOuter`, `glowInner`
6. **Shadow Effects** — `shadowOuter`, `shadowInner`
7. **Bevel Effects** — `bevelOuter`, `bevelInner`
8. **Global Light Source** — Unified lighting for bevels

---

## Technical Recommendations

### 1. Type System

Consider using TypeScript or enhancing JSDoc types for the new gradient/effect
types. The current codebase has excellent JSDoc coverage.

### 2. Validation

Each new property needs validators. The existing pattern in
`shape-validators.js` and `primitive-validators.js` provides a good template.

### 3. Performance

- Use feature flags (like `ENABLE_BOX_CULLING`) for effects
- Consider a "simple mode" that disables all effects for preview rendering
- Profile gradient sampling to ensure acceptable overhead

### 4. Testing

The existing test structure (`*.test.js` files alongside implementations) should
be extended for each new feature. E2E tests in e2e should cover visual
regression.

### 5. Documentation

The `docs/example-*.html` files provide an excellent pattern for demonstrating
new features.

---

## Conclusion

All four proposed features are **feasible** within the current architecture:

1. **Pattern Transform**: Trivial extension, 1-2 days
2. **Gradients**: Moderate effort, clean integration, 3-5 days  
3. **Effects**: Most complex, requires render loop refactoring, 1-2 weeks
4. **Primitive Blending**: Classic SDF technique, 2-3 days

The codebase is well-structured for these extensions, with clear separation
between models, validators, and rendering utilities. The SDF-based approach is
particularly well-suited for effects like glow and bevel, which naturally emerge
from distance field manipulation.
