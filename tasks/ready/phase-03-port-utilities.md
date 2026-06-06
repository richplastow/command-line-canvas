# Phase 03 — Port utilities (rasterize, SDFs, encoders)

> **Status:** ready

## Context

- Port the rendering pipeline from `src/utilities/` to `rust/utilities/`.
- This is the bulk of the algorithmic work and the part where performance
  matters most.
- Mirror these JS modules, file-by-file, into Rust:

```text
src/utilities/encoders/{encode-ansi, encode-braille, encode-buffer, encode-html}.mjs
src/utilities/rasterize/
  compute-coverage.mjs
  compute-final-pixel-value.mjs
  compute-shape-aabbs.mjs
  compute-world-xs-and-ys.mjs
  rasterization-utilities.mjs
  rasterize.mjs
  reset-pixel-grid.mjs
  sample-pattern-color.mjs
src/utilities/sdfs-and-aabbs/
  circle.mjs
  compound.mjs
  sdf-utilities.mjs
  triangle-right.mjs
```

## Observations

### `xpx` exception prefix

JS passes `xpx = 'rasterize():'` so error messages can locate themselves
without a stack trace. Rust uses `Result<_, ValidationError>` with a
`path` field already (see phase 2). Plumb the `xpx` string through the
same way the JS does — it's purely a string-concat for error context, no
algorithmic difference.

### Hot-loop performance

Resist optimising during the port. Write **the literal Rust translation**
first; phase 5 proves equivalence; phase 7 adds benchmarks; only then,
optimise where measurements say to. The whole point of having an
identical algorithmic structure is that any divergence is a bug, not a
"clever" Rust idiom.

### Encoders

`encode_html` produces UTF-8 text. Use `String::push_str` and `format!`
with `&str` writers; do **not** allocate per-pixel. If the JS uses
template literals, the Rust idiom is `write!` against a `String` (with
`std::fmt::Write`), which avoids the allocation cost of `format!` in a
loop.

`encode_ansi` and `encode_braille` are likewise hot paths — same advice.

`encode_buffer` is mechanical (returns a raw `Uint8Array` — flat RGBA
bytes extracted row-by-row from within the given `Bounds`, with no
base64 encoding — match the JS exactly).

### Tests

Each Rust module gets the same test cases as its JS sibling. Test cases
should use **the same hard-coded expected values** wherever possible, so
the parity is provable just by reading the test files side by side.

Tests live in inline `#[cfg(test)]` modules at the bottom of each `.rs`
file — not in a separate `tests/` directory — so they remain directly
comparable with the co-located JS `.test.mjs` siblings.

For floating-point assertions:

- JS `eq(a, b)` on a number is exact equality.
- Rust `assert_eq!(a, b)` on `f64` is exact equality and rejects NaN.
- Where the JS test uses approximate equality (rare), match it with
  `assert!((a - b).abs() < 1e-9, ...)`.

## Acceptance criteria

- [ ] Every JS utility file has a Rust counterpart at the parallel path.
- [ ] Every JS test case has a Rust counterpart with the same expected
      values.
- [ ] `cargo test` passes.
- [ ] `cargo clippy --all-targets -- -D warnings` is clean.
- [ ] **No optimisations beyond what JS already does.** Defer perf work
      to phase 7.
- [ ] No JS source files have been changed.
- [ ] Every new `.rs` file is declared in its parent `mod.rs` so
      `cargo test` compiles the full module tree.
- [ ] `xpx` error-context strings appear in every error path that has a
      JS counterpart.

## Decisions

1. **Port leaf modules before their callers** — keep the dependency order
   explicit.

   ```text
   sdfs-and-aabbs/* ────────┐
                            ├──> rasterize/* ────> command-line-canvas (phase 4)
   encoders/* ──────────────┘
   ```

2. **Use `Vec<u8>` plus a clamping helper for pixels** — mirror
   `Uint8ClampedArray` semantics explicitly.

   ```rust
   #[inline] pub fn to_byte(value_0_to_1: f64) -> u8 {
       (value_0_to_1 * 255.0).clamp(0.0, 255.0) as u8
   }
   ```

   This mirrors `toByte()` in `rasterization-utilities.mjs`.
3. **Carry `xpx` through unchanged as error context** — the JS prefix string
   still matters for locating failures, even though Rust now has structured
   validation errors.
4. **Represent shape lists as borrowed slices** — translate `{id, shape}[]` to
   a `ShapeEntry` struct and accept `&[ShapeEntry]` in the hot path.

   ```rust
   pub struct ShapeEntry { pub id: u32, pub shape: Shape }
   pub fn rasterize(/* ... */, shapes: &[ShapeEntry], /* ... */) { ... }
   ```
   `ShapeEntry` is defined in `rust/utilities/rasterize/rasterize.rs`; it is
   used only within the rasterisation pipeline and does not belong in
   `clc_types.rs`.
5. **Do a literal port before any optimisation** — phase 5 proves
   equivalence; phase 7 measures and justifies performance changes.

   The **inner `for y / for x` double loop** in `rasterize.rs` is the obvious
   hot spot. Use:

   - `for x in 0..x_extent` (Rust idiom, not the JS C-style loop).
   - `let i = ((y * x_extent + x) * 4) as usize;` so `i` indexes a `Vec<u8>`.
   - `unsafe { pixels.get_unchecked_mut(i..i + 4) }` is a possible
      optimisation **deferred to phase 7** — start with safe indexing.
6. **Encoder ports should avoid per-pixel allocation** — `encode_html`,
   `encode_ansi`, and `encode_braille` are hot enough that their Rust ports
   should use `String::push_str` or `write!` rather than `format!` in a loop.
   `encode_buffer` stays mechanical and matches the JS output exactly.
7. **Tests should stay side-by-side comparable** — use the same hard-coded
   expected values as the JS tests wherever possible. Exact equality stays the
   default for floating-point assertions unless the JS test already uses an
   approximation.

## Implementation

### Step 1: Port the SDF and AABB leaves

Port `sdf_utilities.rs`, then `circle.rs`, then `triangle_right.rs`, then
`compound.rs`.

- It should create a Rust counterpart for each JS module under
  `src/utilities/sdfs-and-aabbs/`.
- It should preserve the same hard-coded expected values used by the JS tests.
- It should keep the algorithmic structure literal rather than introducing
  performance-driven rewrites. _(inferred)_
- Run `cargo test && cargo clippy --all-targets -- -D warnings` before moving
  to the next step.

### Step 2: Port the rasterization helpers

Port `rasterization-utilities.rs` first, including helpers such as `to_byte()`.

- It should preserve `Uint8ClampedArray`-style saturation semantics through the
  Rust helper.
- It should keep helper behaviour directly comparable with the JS originals.
- Run `cargo test && cargo clippy --all-targets -- -D warnings` before moving
  to the next step.

### Step 3: Port the dependent rasterize modules

Port `compute_world_xs_and_ys.rs`, `reset_pixel_grid.rs`,
`sample_pattern_color.rs`, `compute_coverage.rs`,
`compute_final_pixel_value.rs`, and `compute_shape_aabbs.rs`.

- It should create direct Rust counterparts for each named JS module.
- It should plumb the `xpx` context string through the same call paths used in
  JS.
- It should keep the same expected values in the Rust tests as in the JS test
  files.
- Run `cargo test && cargo clippy --all-targets -- -D warnings` before moving
  to the next step.

### Step 4: Port `rasterize.rs`

Port the top-level rendering pipeline once its dependencies are in place.

- It should accept borrowed shape entries rather than forcing new owned vectors
  at each call site.
- It should preserve the current safe-indexing behaviour and defer any
  `get_unchecked` optimisation to phase 7.
- It should remain algorithmically identical enough that phase 5 can prove
  output equivalence. _(inferred)_
- Run `cargo test && cargo clippy --all-targets -- -D warnings` before moving
  to the next step.

### Step 5: Port the encoders

Port `encode-ansi`, `encode-braille`, `encode-buffer`, and `encode-html`.

- It should create a Rust counterpart for each encoder module.
- It should produce the same output shape and expected values as the JS tests.
- It should avoid per-pixel string allocation in the text encoders.
- Run `cargo test && cargo clippy --all-targets -- -D warnings` before moving
  to the next step.

### Step 6: Run `nvm use && npm run ok`

_(no testable behaviour)_

## Changelog

| Date | Status | Notes |
|---|---|---|
| 2026-06-06 | in-review | Reorganised into the standard task format without changing the planned scope. |
| 2026-06-06 | review | Findings: Step 6 misplaced, mod-tree wiring absent from AC, encode_buffer format unresolved, Pattern type ownership unstated, ShapeEntry home unspecified. Changes: embed Step 6 into per-step bullets, add lib.rs criterion, pin encode_buffer format, name Pattern source module, declare ShapeEntry ownership. |
| 2026-06-06 | update | Applied reviewer feedback: fixed encode_buffer description (raw RGBA bytes, no base64); added inline #[cfg(test)] test structure note; added mod-tree wiring and xpx AC items; declared ShapeEntry home in Decision 4; named Pattern variants and source module in Risks; dissolved Step 6 into per-step trailing bullets and renumbered Step 7 to Step 6. |
| 2026-06-06 | review-alignment | Findings: Steps 1 and 3 used hyphenated Rust filenames (`sdf-utilities.rs`, `triangle-right.rs`, `compute-world-xs-and-ys.rs`, etc.) which are invalid as Rust module identifiers. Changes: replaced all hyphenated `.rs` filenames with underscored equivalents (`sdf_utilities.rs`, `triangle_right.rs`, `compute_world_xs_and_ys.rs`, etc.). |

## Risks / notes

- **Pattern matching:** the four `Pattern` variants (`AllInk`, `AllPaper`,
  `Breton`, `Pinstripe`) are defined in `rust/clc_types.rs` (phase 2) and
  need `match` arms in `sample_pattern_color.rs`. Use exhaustive matches
  with no `_ =>` arm so adding a new variant is a compile error in every
  consumer.
- **Cyclic dep risk:** Rust does not allow cyclic `mod` dependencies, but
  it does allow `use crate::...` cycles via `pub use` re-exports. The JS
  code already avoids cycles using BRAND symbols; the Rust port avoids
  them via the type system, which is even stricter — if the JS code
  doesn't cycle, the Rust port won't either.
- **`Vec<u8>` ownership at the wasm boundary:** phase 4 problem; here we
  just take `&mut [u8]` so the function is agnostic to ownership.
