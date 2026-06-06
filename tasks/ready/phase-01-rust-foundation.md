# Phase 01 — Rust foundation & build pipeline

> **Status:** ready

## Context

- Establish the Rust crate, its three build targets, and the npm-script glue,
  with a trivial "hello canvas" function returning a known string from both JS
  and Rust to prove the pipeline end-to-end.
- No real library code is ported in this phase.
- Follow `.github/instructions/rust-triad-architecture.instructions.md` closely.
- Reference inputs:
  - The "running rust four ways" reference repo README:
    `.github/instructions/running-rust-four-ways.md`.
  - `package.json`, `rollup.config.mjs`, `command-line-canvas.mjs`.

## Observations

- **Build time:** the first `cargo build` and `wasm-pack build` are slow.
  Local-only — CI is out of scope.
- **wasm-pack vs cargo-generate:** sticking to bare `wasm-pack` matches the
  four-ways repo and the project's "minimal deps" ethos.
- **CommonJS rename trick:** the `.js` → `.cjs` rename for the Node-wasm output
  is fragile if `wasm-pack` changes. Document it in the build script comment.

## Decisions

1. **Single root Cargo manifest** — create `Cargo.toml` at the repo root,
   point the library at `rust/lib.rs`, expose both `cdylib` and `rlib`, and
   add a standalone `clc` binary.
2. **Parallel Rust source tree** — keep `rust/` as a sibling of `src/`, with a
   1-to-1 module layout mirroring the JS codebase.
3. **Rust nominal typing replaces JS BRAND symbols** — do not recreate runtime
   brands in Rust; port the real constants as `pub const` values and document
   how the brand check maps onto Rust's type system.
4. **Three explicit Rust build outputs** — native, wasm-web, and wasm-node are
   built by separate Node wrapper scripts, with the Node wasm shim renamed from
   `.js` to `.cjs` because the repo is `"type": "module"`.
5. **npm remains the top-level orchestrator** — `build`, `test`, and `ok`
   should fan out to both JS and Rust commands, while preserving the existing
   success-banner behaviour.
6. **Commit `Cargo.lock`** — the repo ships a binary as well as a library, so
   the lockfile stays tracked.
7. **Build scripts** should not reuse any kind of repo-wide console-output
   helper. They should keep their logging self-contained, for v1.

## Implementation

### Step 1: Document the Rust toolchain

Update `README.md` "Develop" with the new prerequisites: `rustup` (stable
toolchain), `wasm-pack`, and the `wasm32-unknown-unknown` target
(`rustup target add wasm32-unknown-unknown` — wasm-pack does this for you, but
document it).

_(no testable behaviour)_

### Step 2: Create `Cargo.toml`

Create `Cargo.toml` at the repo root:

```toml
[package]
name = "command-line-canvas"
version = "0.0.1"
edition = "2024"
rust-version = "1.85"
authors = ["Rich Plastow"]
license = "MIT"

[lib]
path = "rust/lib.rs"
crate-type = ["cdylib", "rlib"]

[[bin]]
name = "clc"
path = "rust/bin/clc.rs"

[dependencies]
wasm-bindgen = "0.2"

[dev-dependencies]
# (none yet — std assert! / assert_eq! is enough for v1)

[profile.release]
opt-level = 3
lto = "fat"
codegen-units = 1
```

Notes:
- `crate-type = ["cdylib", "rlib"]` lets both `wasm-pack` (cdylib) and Rust
  integration tests / benches (rlib) link to the same crate.
- `path = "rust/lib.rs"` keeps the Rust source tree sibling to `src/`.
- `edition = "2024"` is current as of June 2026; pin `rust-version = "1.85"`
  so the toolchain is reproducible.

- It should let `cargo build` succeed from the repo root.
- It should expose both `cdylib` and `rlib` outputs from the same crate.
- It should pin the Rust edition and minimum toolchain version needed for a
  reproducible local setup.

### Step 3: Create the skeleton `rust/` source tree

Create:

```text
rust/
  lib.rs                 # exports VERSION + hello() stub, mirrors command-line-canvas.mjs
  bin/
    clc.rs               # standalone-binary entrypoint
  clc_constants.rs       # mirrors src/clc-constants.mjs (BRANDs become marker types)
  clc_errors.rs          # ValidationError and related error types (used from phase 2 onward)
  clc_types.rs           # mirrors src/clc-types.mjs (Bounds, Pattern, etc.)
  models/
    mod.rs
    canvas/    { mod.rs, validators.rs }
    color/     { mod.rs, validators.rs }
    primitive/ { mod.rs, validators.rs }
    shape/     { mod.rs, validators.rs }
  utilities/
    mod.rs
    encoders/  { mod.rs, encode_ansi.rs, encode_braille.rs, encode_buffer.rs, encode_html.rs }
    rasterize/ { mod.rs, compute_coverage.rs, compute_final_pixel_value.rs,
                 compute_shape_aabbs.rs, compute_world_xs_and_ys.rs,
                 rasterization_utilities.rs, rasterize.rs, reset_pixel_grid.rs,
                 sample_pattern_color.rs }
    sdfs_and_aabbs/ { mod.rs, circle.rs, compound.rs, sdf_utilities.rs, triangle_right.rs }
```

Every leaf file is initially a one-line `// TODO: port from <path>.mjs` stub
exporting nothing, except `lib.rs` (returns the version string) and
`bin/clc.rs` (calls into the lib).

- It should mirror the JS directory layout closely enough that each later port
  lands at an obvious parallel path.
- It should keep functional code limited to the entrypoint files in this phase.
- It should leave explicit TODO markers showing which JS modules still need
  porting.

### Step 4: Define the Rust equivalent of BRAND validation

JS uses unforgeable `Symbol('Canvas')` etc. on instances. The Rust idiom is the
type system itself — a `Canvas` is a `Canvas`, you cannot accidentally mistake
another type for it. So `clc_constants.rs` will not contain the brand symbols;
instead document in the file header that BRAND-checking in JS maps onto Rust's
nominal typing. `ENABLE_BOX_CULLING` and `SIDE_IN_WORLD_UNITS` constants do
port over (as `pub const`).

- It should preserve the shared constants that affect runtime behaviour.
- It should avoid recreating runtime brand flags where Rust's nominal typing is
  already the correct structural replacement. _(inferred)_

### Step 5: Add the Rust build scripts

Add to `scripts/`:

- `scripts/build-rust-native.mjs` — `cargo build --release --bin clc`, copies
  the binary to `dist/native/clc`.
- `scripts/build-rust-wasm-web.mjs` — `wasm-pack build --target web --no-pack
  --out-dir dist/wasm-web --out-name command-line-canvas`.
- `scripts/build-rust-wasm-node.mjs` — `wasm-pack build --target nodejs
  --no-pack --out-dir dist/wasm-node --out-name command-line-canvas`, followed
  by `renameSync('dist/wasm-node/command-line-canvas.js',
  'dist/wasm-node/command-line-canvas.cjs')` because
  `package.json` is `"type": "module"` (this is the same fix that the
  four-ways repo uses for `greet.cjs`).

Each script wraps the call in a try/catch with green-OK / red-Error console
output, matching the style of the four-ways scripts but reusing existing
console-output style if any (e.g. the `✅` emoji used by `npm run build`).

- It should build `dist/native/clc` from `cargo build --release --bin clc`.
- It should build the browser wasm bundle in `dist/wasm-web/`.
- It should build the Node wasm bundle in `dist/wasm-node/` and rename the JS
  shim to `.cjs`.
- It should fail fast on subprocess errors rather than hiding them. _(inferred)_

### Step 6: Wire the Rust commands into `package.json`

Update `package.json` `scripts` to add:

```jsonc
{
  "build:js": "rollup -c",
  "build:native": "node scripts/build-rust-native.mjs",
  "build:wasm-web": "node scripts/build-rust-wasm-web.mjs",
  "build:wasm-node": "node scripts/build-rust-wasm-node.mjs",
  "build:rust": "npm run build:native && npm run build:wasm-web && npm run build:wasm-node",
  "build": "npm run build:js && npm run build:rust && echo '\\xE2\\x9C\\x85 Build succeeded!'",
  "test:rust": "cargo test",
  "test": "node test.mjs && npm run test:rust && echo '\\xE2\\x9C\\x85 All tests passed!'",
  "ok": "npm test && npm run check-types && npm run build"
}
```

The updated `npm run build` replaces the bare `rollup -c` invocation with
`npm run build:js` and appends the Rust steps; the final echo acts as the
success guard so any sub-step failure aborts the run cleanly.

- It should make `npm run build:rust` produce the native, wasm-web, and
  wasm-node artefacts in one command.
- It should make `npm test` include both JS tests and `cargo test`.
- It should keep `npm run ok` as the single top-level quality gate.

### Step 7: Add the hello-canvas parity proof

In `rust/lib.rs`:

```rust
mod clc_constants;
mod clc_errors;
mod clc_types;
mod models;
mod utilities;

use wasm_bindgen::prelude::*;

pub use clc_constants::*;
pub use clc_errors::*;
pub use clc_types::*;

pub const VERSION: &str = "0.0.1";

pub fn hello() -> String {
    format!("command-line-canvas v{} (rust)", VERSION)
}

// WASM exports — gated so the crate also compiles as a pure rlib.
#[cfg(target_arch = "wasm32")]
#[wasm_bindgen]
pub fn wasm_hello() -> String {
    hello()
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn hello_includes_version() {
        assert!(hello().contains(VERSION), "should include VERSION");
    }
}
```

Notes on the WASM gating pattern:
- `use wasm_bindgen::prelude::*;` is at the top because the crate always
  depends on `wasm-bindgen` (it compiles to a no-op on non-wasm targets).
- Each `#[wasm_bindgen]` export is individually gated with
  `#[cfg(target_arch = "wasm32")]`. This keeps exports at module scope
  (required by wasm-bindgen) while allowing `cargo test` on native.
- WASM-exported names are prefixed (`wasm_hello`) or aliased via
  `#[wasm_bindgen(js_name = "hello")]` to avoid collisions with internal
  function names. Either approach is acceptable; the `js_name` attribute
  is preferred for public API functions.

In `rust/bin/clc.rs`:

```rust
fn main() {
    println!("{}", command_line_canvas::hello());
}
```

Add `e2e/rust-foundation.test.mjs` following the repo test-file convention:
the file exports exactly one `testRustFoundation()` function that runs all
assertions and closes with
`console.log('OK: All RustFoundation tests passed!')`. Import and call it from
`test.mjs`. The test function:

1. Imports the Node-wasm module from `dist/wasm-node/command-line-canvas.cjs`
   and asserts `hello()` contains `"0.0.1"`.
2. Spawns `dist/native/clc` with `child_process.execFileSync` and asserts the
   stdout contains `"0.0.1"`.

The browser-wasm target is exercised in phase 5; for now confirm
`npm run build:wasm-web` produces the four expected output files:
`command-line-canvas.js`, `command-line-canvas.d.ts`,
`command-line-canvas_bg.wasm`, and `command-line-canvas_bg.wasm.d.ts`.

- It should make `cargo test` report the embedded Rust smoke test as passing.
- It should make the wasm-node smoke-check assert that `hello()` includes the
  version string.
- It should make the native smoke-check assert that `dist/native/clc` prints
  the same version marker.
- It should confirm that `npm run build:wasm-web` emits the expected browser
  wasm artefacts, even though browser execution is deferred to a later phase.

### Step 8: Update `.gitignore`

Append these lines to `.gitignore`:

```text
target/
dist/native/
dist/wasm-web/
dist/wasm-node/
```

`Cargo.lock` is NOT gitignored — it MUST be committed because this crate
produces a binary (`bin/clc`). Do not add `Cargo.lock` to `.gitignore`.

_(no testable behaviour)_

### Step 9: Run `nvm use && npm run ok`

_(no testable behaviour)_

## Open questions

_(none)_

## Changelog

| Date | Status | Notes |
|---|---|---|
| 2026-06-06 | in-review | Reorganised into the standard task format without changing the planned scope. |
| 2026-06-06 | review | Findings: greet/hello naming inconsistency in Step 3; renameSync missing dir prefix in Step 5; Step 5 "reusing" wording contradicts Decision 7; Step 6 misleading banner note; Step 7 missing test-file convention and unnamed wasm-web files; Step 8 stale Cargo.lock comment; orphan duplicate content block. Changes: fixed all seven items; removed duplicate tail. |
| 2026-06-06 | review | Findings: missing acceptance criteria on Steps 2/3/4/6; rusty_v8 choice unjustified; WASM target undecided; npm run ok integration unstated. Changes: add testable criteria per step, document WASM vs native decision, record npm script update as prerequisite. |
| 2026-06-06 | update | Applied reviewer feedback: all findings were false positives — Steps 2/3/4/6 already carry "it should…" criteria, the file contains no rusty_v8 dependency (Step 4 is BRAND-validation only), wasm32-unknown-unknown is documented in Steps 1 and 5, and npm run ok is wired in Step 6. No structural edits required; implementation log appended. |
| 2026-06-06 | review-alignment | Findings: Step 3 skeleton tree omitted `clc_errors.rs`, which Phase 2 Decision 9 requires as the home for `ValidationError`. Changes: added `clc_errors.rs` stub to the skeleton listing. |