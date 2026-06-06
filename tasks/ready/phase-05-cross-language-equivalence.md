# Phase 05 — Cross-language equivalence tests

> **Status:** ready

## Context

- Prove that the Rust port produces **byte-identical output** to the JS
  implementation for every scene the e2e tests cover.
- Treat this phase as the correctness gate for the port: benchmarking only
  starts after it passes.
- Put shared golden fixtures under `e2e/equivalence/` so both the JS and Rust
  sides execute against the same canonical inputs and expected outputs.

Drive the initial rasterize fixture set from the existing e2e tests:

| Existing JS test | Fixture |
|------------------|---------|
| `e2e/rotate/rotate-shape.test.mjs` | `rotate-shape.json` |
| `e2e/rotate/rotate-and-flip-shape.test.mjs` | `rotate-and-flip-shape.json` |
| `e2e/rotate/rotate-triangle.test.mjs` | `rotate-triangle.json` |
| `e2e/rotate/rotate-and-flip-triangle.test.mjs` | `rotate-and-flip-triangle.json` |
| `e2e/stroke/stroke-circle.test.mjs` | `stroke-circle.json` |

## Decisions

1. **Use committed shared fixtures** — each scene lives as JSON plus a committed
   golden output file generated from the JS implementation.

   ```jsonc
   // e2e/equivalence/fixtures/circle-on-blue.json
   {
     "antiAliasRegion": 1.5,
     "background": [0, 0, 64, 255],
     "xExtent": 80,
     "yExtent": 24,
     "shapes": [ /* ... canonical shape JSON ... */ ]
   }
   ```

   Each rasterize fixture has a sibling `.expected.bin` containing the raw RGBA
   bytes produced by the canonical JS implementation.

2. **Regenerate goldens on demand only** — `scripts/regen-equivalence-goldens.mjs`
   loads every fixture, runs the JS renderer, and writes `<name>.expected.bin`.
   It is invoked manually via `npm run regen-goldens`, never automatically.
3. **Keep JS and Rust tests symmetrical** — JS iterates the fixtures and checks
   them against committed goldens; Rust does the same from `rust/tests/` via
   paths rooted at `CARGO_MANIFEST_DIR`.

   ```rust
   #[test]
   fn circle_on_blue_matches_js_golden() {
       let fixture = load_fixture("circle-on-blue.json");
       let expected = load_golden("circle-on-blue.expected.bin");
       let actual = render(&fixture);
       assert_eq!(actual, expected, "Rust output must match JS golden");
   }
   ```

4. **Avoid `build.rs` codegen for v1** — even though compile-time test discovery
   is possible, the v1 suite should keep one explicit test per fixture rather
   than introducing macro-heavy machinery.
5. **Test encoders explicitly as well as pixels** — add golden outputs for
   ANSI, HTML, Braille, and buffer encoding because encoder drift is at least as
   likely as rasterizer drift.

## Implementation

### Step 1: Create the shared rasterize fixtures

Create `e2e/equivalence/fixtures/` with the canonical scene JSON files and
their committed `.expected.bin` siblings.

- It should create at least 5 rasterize fixtures, each with a committed
  `.expected.bin`.
- It should keep each fixture in a canonical JSON form both languages can read.
- It should derive the initial fixture set from the existing rotate/stroke e2e
  coverage.

### Step 2: Add `scripts/regen-equivalence-goldens.mjs`

The script should:

1. Load every `.json` fixture.
2. Run the JS `rasterize` against it.
3. Write the resulting pixel buffer to `<name>.expected.bin`.

- It should regenerate committed goldens on demand via `npm run regen-goldens`.
- It should add a `"regen-goldens"` entry to `package.json`'s `scripts` object pointing to the new script.
- It should not run automatically as part of normal test or build flows.

### Step 3: Add the JS-side equivalence suite

Create `e2e/equivalence/equivalence.js.test.mjs` that iterates the fixtures,
renders each scene, reads the committed `.expected.bin`, and asserts equality.

- It should make `npm test` run the JS-side golden checks and pass.
- It should be registered in the top-level `test.mjs` runner via an imported `testEquivalence()` call.
- It should catch JS regressions against the committed rasterize goldens.

### Step 4: Add the Rust-side equivalence suite

Create `rust/tests/equivalence.rs` that iterates the same fixtures, renders
them via the Rust pipeline, reads the committed goldens, and asserts equality.

- It should make `cargo test` run the Rust-side golden checks and pass.
- It should resolve fixture paths relative to `CARGO_MANIFEST_DIR`.
- It should register the integration test in `Cargo.toml` via
  `[[test]] name = "equivalence" path = "rust/tests/equivalence.rs"` because
  `rust/tests/` is not the standard Cargo auto-discovery path (`tests/` at the crate root is the convention).
- It should keep one explicit Rust test per fixture for v1 rather than relying
  on `build.rs` code generation.

### Step 5: Add encoder equivalence fixtures and assertions

Add a single shared scene JSON (e.g. `e2e/equivalence/fixtures/encode-scene.json`) to
drive all four encoder golden outputs. Each encoder's golden file captures the byte-exact
output of the JS encoder for that format:

```text
encode-scene.json           ← shared input scene
encode-ansi.expected.txt    ← raw ANSI escape sequence bytes
encode-html.expected.html   ← UTF-8 HTML string bytes
encode-braille.expected.txt ← UTF-8 Braille dot bytes
encode-buffer.expected.bin  ← raw RGBA pixel buffer (distinct from rasterize goldens)
```

- It should add `encode-scene.json` as the single canonical input driving all four
  encoder goldens, keeping scene definition in one place.
- It should extend `scripts/regen-equivalence-goldens.mjs` to write all four
  encoder golden files alongside the rasterize goldens.
- It should add JS-side encoder assertions to `e2e/equivalence/equivalence.js.test.mjs`,
  loading each golden and asserting byte-identical output from the JS encoders.
- It should add Rust-side encoder assertions to `rust/tests/equivalence.rs`, loading
  each golden and asserting byte-identical output from the Rust encoders.
- It should add at least 1 committed golden file per encoder (4 total).
- It should cover the output formats most likely to diverge, including UTF-8
  multi-byte sequences and ANSI escape sequences.
- It should document in a comment why `encode-buffer.expected.bin` is separate from
  rasterize goldens (different scene dimensions or content).

### Step 6: Run `nvm use && npm run ok`

_(no testable behaviour)_

## Open questions

- Should the existing rotate/stroke e2e tests be fully refactored to consume
  the new JSON fixtures, or should fixture generation stay a one-off migration
  step? _TBD_
- If platform libm differences show up in trigonometric code, should the suite
  relax to ±1 ULP per pixel for that fixture, or keep strict byte equality and
  treat the platform difference as a blocker? _TBD_

## Changelog

| Date | Status | Notes |
|---|---|---|
| 2026-06-06 | in-review | Reorganised into the standard task format without changing the planned scope. |
| 2026-06-06 | review/update | Findings: Step 2 missing `package.json` scripts entry; Step 3 missing top-level `test.mjs` runner registration; Step 5 ambiguous on input scene, JS/Rust split, and buffer golden distinction. Changes: added `package.json` criterion to Step 2; added `testEquivalence()` runner criterion to Step 3; expanded Step 5 with `encode-scene.json` input, separate JS/Rust criteria, golden regeneration extension, and buffer disambiguation comment requirement. |
| 2026-06-06 | review-alignment | Findings: Step 4 placed the integration test at `rust/tests/equivalence.rs`, a non-standard path that Cargo does not auto-discover (`tests/` at the crate root is the convention). Changes: added `[[test]]` Cargo.toml registration criterion to Step 4. |

## Risks / notes

- **Floating-point determinism:** IEEE-754 arithmetic is bit-identical across
  JS V8 and Rust LLVM **provided** the operations are the same (no FMA
  differences, same operation order). The literal port is designed to keep
  operation order identical, so this should hold.
- **Endianness:** Rust on x86_64 / aarch64 is little-endian, like JS
  TypedArrays. Pixel buffers and encoder outputs are byte streams, so
  endianness is irrelevant here.
- **`Uint8ClampedArray` saturation vs `u8` cast:** the Rust `to_byte()` helper
  from phase 3 explicitly clamps to `0..=255` to match `Uint8ClampedArray`
  saturation semantics. Verify the helper is used at every write site.
