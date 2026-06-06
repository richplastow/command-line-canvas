# Phase 02 — Port pure-value models

> **Status:** ready

## Context

- Port `Color`, `Primitive`, `Shape`, and `Canvas` plus their validators from
  `src/models/` to `rust/models/`.
- These are the foundation types used by every other module, so they land first.
- Files to port (each gets a Rust counterpart at the parallel path):

| JS | Rust |
|----|------|
| `src/models/color/color.mjs` | `rust/models/color/mod.rs` |
| `src/models/color/color-validators.mjs` | `rust/models/color/validators.rs` |
| `src/models/color/color.test.mjs` | inline `mod tests` in `mod.rs` |
| `src/models/color/color-validators.test.mjs` | inline `mod tests` in `validators.rs` |
| `src/models/primitive/...` | `rust/models/primitive/...` |
| `src/models/shape/...` | `rust/models/shape/...` |
| `src/models/canvas/...` | `rust/models/canvas/...` |

## Naming conventions

- JS: `xExtent`, `xpx`, `strokeWidth`. Rust: `x_extent`, `xpx` (kept short
  identifiers as-is when widely used; rename only when ambiguous),
  `stroke_width`.
- JS classes (`PascalCase`) → Rust structs (`PascalCase`).
- JS class methods → Rust impl methods on the struct.
- JS exported free functions (`compute-coverage.mjs`) → Rust free `pub fn`.

## Test parity

For every JS test function `testFooBar()`, write a Rust
`#[test] fn foo_bar_<scenario>()` covering the same assertion. The
"OK: All … tests passed!" log line is unique to the JS test runner and has no
Rust analogue — `cargo test` already prints `test result: ok. N passed`. Do
not try to replicate the JS log format in Rust.

The "every assertion has a 3rd-arg message" rule in JS becomes Rust's
`assert_eq!(actual, expected, "should …")` form (the optional message
arg). Apply it to every assertion.

## Acceptance criteria

- [ ] Every JS model file has a 1-to-1 Rust counterpart at the same
      relative path.
- [ ] Every JS test assertion has a Rust test asserting the same outcome.
- [ ] `cargo test` passes.
- [ ] `cargo clippy --all-targets -- -D warnings` is clean (clippy is part
      of the `rustup` default toolchain — no extra dep).
- [ ] No new JS source has been written.
- [ ] `command_line_canvas::Color`, `Primitive`, `Shape`, and `Canvas` are
      importable by a downstream Rust caller (re-exports in `rust/lib.rs`
      compile without error).

## Decisions

1. **Brand symbols become Rust types** — the JS runtime brand check becomes a
   compile-time guarantee in Rust.

   JS:
   ```js
   this[COLOR_BRAND] = true;
   ```

   Rust:
   ```rust
   // No brand needed — `Color` is a distinct type in Rust's nominal type system.
   pub struct Color { pub r: u8, pub g: u8, pub b: u8, pub a: u8 }
   ```

2. **Validators return structured `Result` values** — JS validators throw an
   `Error` from a path string; Rust mirrors this with
   `Result<T, ValidationError>` and a shared error type.

   Declared in `rust/clc_errors.rs` (see Decision 9):
   ```rust
   #[derive(Debug, PartialEq, Eq)]
   pub struct ValidationError {
       pub path: String,    // e.g. "Color: r (red)"
       pub message: String, // e.g. "must be an integer 0..=255"
   }
   ```

   Validators become free functions matching the JS signature:

   ```rust
   pub fn validate_rgba(value: i32, path: &str) -> Result<u8, ValidationError> { ... }
   ```

   The `Color::new(r, g, b, a)` constructor calls each validator and returns
   `Result<Color, ValidationError>`. JS `throw` semantics map to the `?`
   operator in Rust.

3. **Default values stay semantically identical** — model defaults should match
   the JS constructors.

   JS `Color`:
   ```js
   r = 0; g = 0; b = 0; a = 255;
   ```

   Rust:
   ```rust
   impl Default for Color {
       fn default() -> Self { Color { r: 0, g: 0, b: 0, a: 255 } }
   }
   ```

4. **`Pattern` becomes an enum with string helpers** — preserve the JS string
   literals but model them as a Rust enum with `as_str() -> &'static str` and
   `from_str(s: &str) -> Option<Pattern>` for wasm round-tripping.

   ```rust
   #[derive(Debug, Clone, Copy, PartialEq, Eq)]
   pub enum Pattern { AllInk, AllPaper, Breton, Pinstripe }
   ```

5. **`Bounds` becomes a Rust struct** — translate the typedef into a typed value
   with snake_case field names.

   JS:
   ```js
   { xMin, xMax, yMin, yMax }   // all f64
   ```

   Rust:
   ```rust
   #[derive(Debug, Clone, Copy, PartialEq)]
   pub struct Bounds { pub x_min: f64, pub x_max: f64, pub y_min: f64, pub y_max: f64 }
   ```

6. **Rust naming follows Rust conventions without obscuring the mapping** — use
   `x_extent` and `stroke_width`, but keep short shared identifiers such as
   `xpx` where the codebase already relies on them.
7. **`Canvas` stores an owned RGBA buffer and uses two constructors** — avoid a
   single `Option<Vec<u8>>` parameter in native Rust.
   JS:
   ```js
   new Canvas(antiAliasRegion, background, xExtent, yExtent, pixels?)
   ```

   Rust:
   ```rust
   pub struct Canvas {
       pub anti_alias_region: f64,
       pub background: Color,
       pub x_extent: u32,
       pub y_extent: u32,
       pub pixels: Vec<u8>,         // RGBA, length = x_extent * y_extent * 4
   }
   impl Canvas {
       pub fn new(/* args */) -> Result<Canvas, ValidationError> { ... }
       pub fn with_pixels(/* args including pixels */) -> Result<Canvas, ValidationError> { ... }
   }
   ```

   Two constructors avoid an `Option<Vec<u8>>` parameter. The wasm shim in phase
   4 maps both to `new CommandLineCanvas({ pixels?, ... })`.
8. **Test parity matters more than log-format parity** — for every JS test
   function `testFooBar()`, write a Rust `#[test] fn foo_bar_<scenario>()`
   covering the same assertion, but do not try to replicate the JS console log
   output. Apply explicit assertion messages in Rust too.
9. `ValidationError` should live in a dedicated `rust/clc_errors.rs` to allow
   the error surface to grow. Don't keep it in  `rust/clc_constants.rs`.


## Implementation

### Step order

- Run `cargo test` after each step; do not move on with a red bar.
- Keep `cargo clippy --all-targets -- -D warnings` clean after each step.
- Update `rust/lib.rs` to `pub use` each model and `rust/models/mod.rs` to
  `pub mod` each sub-module as they are added.
- Run `nvm use && npm run ok` once all steps are complete.

1. `Color` + `validators` (smallest, used by everything).
2. `Pattern` enum and `Bounds` struct in `clc_types.rs`.
3. `Primitive` + validators.
4. `Shape` + validators.
5. `Canvas` + validators.

### Step 1: Port `Color` and its validators

Start with `Color` and `validate_rgba()` because they are the smallest pieces
and everything else depends on them.

- It should create `rust/models/color/mod.rs` and
  `rust/models/color/validators.rs` as direct counterparts to the JS modules.
- It should preserve the JS default RGBA behaviour.
- It should return `ValidationError` values carrying both `path` and `message`
  when validation fails.

### Step 2: Add `Pattern` and `Bounds` to `clc_types.rs`

Port the shared lightweight types used by later model and utility code.

- It should model `'all-ink' | 'all-paper' | 'breton' | 'pinstripe'` as a Rust
  enum with round-trippable string helpers.
- It should model bounds with typed `x_min`, `x_max`, `y_min`, and `y_max`
  fields.

### Step 3: Port `Primitive` and its validators

Follow the same 1-to-1 file structure and test-parity approach used for `Color`.

- It should create direct Rust counterparts for the JS primitive modules and
  their tests.
- It should preserve the same validation outcomes as the JS implementation.
  _(inferred)_

### Step 4: Port `Shape` and its validators

Translate the shape model and validation logic once the lower-level types are in
place.

- It should create direct Rust counterparts for the JS shape modules and their
  tests.
- It should preserve the same constructor and validator semantics as the JS
  implementation. _(inferred)_

### Step 5: Port `Canvas` and its validators

Translate `Canvas` last because it depends on the earlier model types.

- It should store pixels as RGBA bytes with length `x_extent * y_extent * 4`.
- It should support both generated pixels and supplied pixel buffers via
  separate constructors.
- It should keep the Rust API ready for the wasm options object planned in phase
  4.
- It should reject a caller-supplied pixel buffer in `with_pixels()` whose
  length does not equal `x_extent * y_extent * 4`.

### Step 6: Re-export the ported models from `rust/lib.rs`

Update `rust/lib.rs` to `pub use` each model so `command_line_canvas::Color` and
related imports work naturally.

- It should let native Rust callers use `command_line_canvas::Color`,
  `Primitive`, `Shape`, and `Canvas` directly.

## Open questions

_(none)_

## Changelog

| Date | Status | Notes |
|---|---|---|
| 2026-06-06 | in-review | Reorganised into the standard task format without changing the planned scope. |
| 2026-06-06 | review | Findings: Steps 7–8 are process rules not implementation steps; lib.rs re-exports untested in AC; ValidationError location ambiguous in Decision 2; `from_str()` return type unspecified; Canvas pixel-buffer validation unspecified; `rust/models/mod.rs` wiring unmentioned; `xpx` exception vague. Changes: merge Steps 7–8 into preamble and remove them; add AC for re-export reachability; reference `rust/clc_errors.rs` in Decision 2; specify `from_str()` return type; add pixel-buffer length criterion to Step 5; add mod.rs wiring note to preamble; tighten `xpx` naming exception. |
| 2026-06-06 | update | Applied reviewer feedback: merged Steps 7–8 into step-order preamble and removed as numbered steps; added re-export reachability AC item; added `rust/clc_errors.rs` reference to Decision 2 snippet; narrowed `from_str()` to `Option<Pattern>` in Decision 4; added pixel-buffer length validation criterion to Step 5; added `rust/models/mod.rs` wiring note to preamble; tightened `xpx` naming exception to name it as the sole current exception. |

## Risks / notes

- **f64 vs JS Number:** JS treats integers and floats interchangeably. Rust does
  not. Decide per-field whether a field is `u8`, `u32`, `i32`, `f64`, etc. This
  is a one-time cost that pays off forever.
- **NaN propagation:** `f64::NAN` follows IEEE-754 rules in Rust just like in
  JS, so coverage maths should behave the same. Validators should reject NaN
  explicitly where appropriate (`value.is_finite()`).
- **Don't add features.** Resist the temptation to "improve" anything in the
  port. Phase 5 verifies pixel-exact equivalence — divergences will show up
  there and are easier to debug if the ports were faithful.
