---
description: "Strict architectural invariants for the Rust codebase: directory layout, build targets, JS/Rust parity constraints, error contracts, and WASM FFI rules. Optimised for reasoning models."
applyTo: "**/*.rs,**/Cargo.toml,tasks/**/*.md"
---

# Rust Architecture & Invariants for `command-line-canvas`

## 0. Primary Directive

Write **predictable, highly readable, and easily verifiable Rust**. Prioritise
compilation success and explicit data flow over hyper-optimisation. The same
library source (`rust/`) compiles to four targets:

1. **`rlib`** — consumed by upstream Rust crates and integration tests.
2. **`cdylib`** (wasm-web) — loaded in browsers via `wasm-pack --target web`.
3. **`cdylib`** (wasm-node) — loaded in Node.js via `wasm-pack --target nodejs`.
4. **Native binary** (`rust/bin/clc.rs`) — standalone CLI via `cargo build`.

Every public function in the library MUST work identically across all four
targets. Platform-specific code is forbidden in the library; it belongs only in
`rust/bin/clc.rs`.

---

## 1. Directory Layout & Module Boundaries

Rust source lives under `rust/` (sibling to the JS `src/` tree). The layout
mirrors the JS structure 1-to-1:

```text
rust/
  lib.rs                 # crate root — re-exports public API, WASM bindings
  bin/
    clc.rs               # standalone binary entrypoint (CLI I/O only)
  clc_constants.rs       # pub const values (ENABLE_BOX_CULLING, SIDE_IN_WORLD_UNITS)
  clc_errors.rs          # ValidationError enum and Display impl
  clc_types.rs           # Bounds, Pattern, shared type aliases
  models/
    mod.rs
    canvas/    { mod.rs, validators.rs }
    color/     { mod.rs, validators.rs }
    primitive/ { mod.rs, validators.rs }
    shape/     { mod.rs, validators.rs }
  utilities/
    mod.rs
    encoders/  { mod.rs, encode_ansi.rs, encode_braille.rs, encode_buffer.rs, encode_html.rs }
    rasterize/ { mod.rs, compute_coverage.rs, ... }
    sdfs_and_aabbs/ { mod.rs, circle.rs, compound.rs, ... }
```

### Invariants

* **`rust/lib.rs` (Crate Root & WASM Boundary):**
  - Declares all `mod` statements for the crate.
  - Contains `#[wasm_bindgen]` exports gated behind `#[cfg(target_arch = "wasm32")]`.
  - MUST delegate all computation to library modules. No algorithms here.
  - MUST use aliases to disambiguate WASM-exported names from internal functions
    (e.g., `use models::canvas::Canvas as CanvasModel;`).

* **`rust/bin/clc.rs` (CLI Entry Point):**
  - The ONLY file permitted to use `std::env`, `std::io`, `std::process`,
    or `eprintln!`/`println!`.
  - Delegates all logic to `command_line_canvas::` library functions.
  - Translates `Result::Err` into stderr output and non-zero exit codes.

* **All other `rust/**/*.rs` files (Pure Library Logic):**
  - MUST be mathematically pure. NEVER import `std::fs`, `std::env`,
    `std::io`, `std::process`, `web_sys`, or `js_sys`.
  - No `println!`, `eprintln!`, or any I/O side effects.
  - No `#[wasm_bindgen]` annotations (those live only in `lib.rs`).

---

## 2. Cargo Manifest Conventions (`Cargo.toml`)

```toml
[package]
name = "command-line-canvas"
edition = "2024"
rust-version = "1.85"

[lib]
path = "rust/lib.rs"
crate-type = ["cdylib", "rlib"]

[[bin]]
name = "clc"
path = "rust/bin/clc.rs"

[dependencies]
wasm-bindgen = "0.2"

[profile.release]
opt-level = 3
lto = "fat"
codegen-units = 1
```

### Invariants

* `crate-type` MUST include both `"cdylib"` (for wasm-pack) and `"rlib"` (for
  `cargo test`, benches, and upstream Rust consumers).
* `path = "rust/lib.rs"` — the library root is NOT in `src/`. The `src/`
  directory is reserved for JavaScript source.
* `edition = "2024"` and `rust-version = "1.85"` — do not downgrade without
  explicit instruction.
* External dependencies MUST be minimal. Do NOT add `anyhow`, `thiserror`,
  `eyre`, `tokio`, or any heavy crate without explicit approval.
* `Cargo.lock` is committed (the crate produces a binary).

---

## 3. JS / Rust Parity Contract

The Rust codebase MUST produce byte-identical or semantically equivalent output
to the JavaScript implementation for all shared operations.

### Structural parity rules

| JS pattern | Rust equivalent |
|---|---|
| `src/clc-constants.mjs` exports | `rust/clc_constants.rs` `pub const` values |
| `src/clc-types.mjs` typedefs | `rust/clc_types.rs` structs / enums / type aliases |
| `src/models/<name>/<name>.mjs` class | `rust/models/<name>/mod.rs` struct + impl |
| `src/models/<name>/<name>-validators.mjs` | `rust/models/<name>/validators.rs` |
| `src/utilities/<group>/<fn>.mjs` | `rust/utilities/<group>/<fn>.rs` |
| `src/**/*.test.mjs` (co-located) | `#[cfg(test)] mod tests` at bottom of same `.rs` file |
| BRAND symbols (`Symbol('Canvas')`) | Rust nominal typing (no runtime equivalent needed) |
| JSDoc `@typedef` union types | Rust `enum` with explicit variants |
| Constructor options objects | Struct with named fields (e.g., `CanvasOptions`) |

### Naming conventions

* Rust file names use `snake_case` (matching Rust convention).
* Module and function names mirror JS names converted to snake_case:
  `encode-ansi.mjs` → `encode_ansi.rs`, `computeCoverage()` → `compute_coverage()`.
* Public struct names match JS class names in PascalCase: `Canvas`, `Color`,
  `Primitive`, `Shape`.
* The top-level crate name is `command_line_canvas` (hyphens become underscores
  in Rust crate names; Cargo handles the mapping from `command-line-canvas`).

### Numeric parity

* Use `f64` for all floating-point values (matching JS `Number`).
* Use `u8` for individual colour channel values (matching `Uint8ClampedArray`).
* Use `Vec<u8>` as the pixel buffer equivalent of `Uint8ClampedArray`.
* Maintain the same constant values: `SIDE_IN_WORLD_UNITS = 10.0`,
  `ENABLE_BOX_CULLING = true`.

---

## 4. Error Handling Contract

### Production code (`rust/lib.rs`, `rust/bin/clc.rs`, all library modules)

* **NEVER** use `.unwrap()`, `.expect()`, or `panic!()`.
* All fallible functions MUST return `Result<T, E>`.
* Error type: use `String` or a lightweight enum defined in `clc_errors.rs`.
  Do NOT introduce `anyhow` or `thiserror`.
* Use `?` to propagate errors upward to the boundary layers.
* `rust/bin/clc.rs` is the ONLY place that converts `Result::Err` into
  `eprintln!()` + `std::process::exit(1)`.
* `rust/lib.rs` WASM exports convert `Result::Err` into `JsValue` exceptions
  via `map_err(|e| JsValue::from_str(&e))`.

### Test code (`#[cfg(test)]` blocks only)

* `.unwrap()` and `assert!` / `assert_eq!` ARE permitted.
* `panic!` is acceptable in tests.

---

## 5. WASM FFI Rules (`lib.rs`)

When writing `#[wasm_bindgen]` exports in `rust/lib.rs`:

* Gate all WASM-specific code behind `#[cfg(target_arch = "wasm32")]` so the
  crate compiles cleanly as a native `rlib` without wasm-bindgen present at
  the call site.
* MUST include: `use wasm_bindgen::prelude::*;`
* MUST alias internal functions to avoid name collisions with exported symbols.
* Exported function signatures MUST use owned types (`String`, `Vec<u8>`,
  `JsValue`) — never references with lifetimes.
* For complex data (structs, arrays), use `serde` + `serde-wasm-bindgen` to
  serialise via `JsValue`. Do not write manual memory-buffer parsers.
* The generated JS shim for `--target nodejs` uses `require()`. Because
  `package.json` sets `"type": "module"`, the build script MUST rename the
  output `.js` to `.cjs`.

---

## 6. Rust Idioms: Strict Constraints

### A. Lifetimes & Ownership

* PREFER owned types (`String`, `Vec<T>`) at public API and FFI boundaries.
* Use `&str` and `&[T]` for internal function parameters.
* AVOID returning references that require explicit lifetime annotations.
* If a signature needs more than one lifetime parameter (`'a, 'b`), refactor
  to use owned data.

### B. Traits & Generics

* AVOID deep trait hierarchies or multi-bound generics.
* Use concrete types by default. Use `impl Trait` only for simple cases like
  `-> impl Iterator<Item = T>`.

### C. Pattern Matching

* PREFER exhaustive `match` over `if let`. The compiler's exhaustiveness
  checking catches missed cases.
* Use expression-oriented design — return values directly from `match`/`if`
  blocks rather than mutating variables.

### D. Explicit Returns

* Explicit `return` statements ARE permitted and preferred for early exits.
  Do not refactor them into implicit returns to satisfy Clippy.

### E. Conditional Compilation

* Use `#[cfg(target_arch = "wasm32")]` for WASM-only code.
* Use `#[cfg(not(target_arch = "wasm32"))]` for native-only code (rare — only
  in `bin/clc.rs`).
* Use `#[cfg(test)]` for test modules.
* Never use `#[cfg(feature = ...)]` without defining the feature in
  `Cargo.toml`.

---

## 7. Testing Rules

* Unit tests MUST be co-located at the bottom of the file they test, inside
  `#[cfg(test)] mod tests { use super::*; ... }`.
* Integration / e2e tests go in `e2e/` (tested via JS) or a future
  `rust/tests/` directory (Cargo integration tests).
* Test names use `snake_case` and describe the expected behaviour:
  `fn hello_includes_version()`.
* Use `assert_eq!` with descriptive messages: `assert_eq!(result, expected, "should return X when Y")`.

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn hello_includes_version() {
        assert!(hello().contains(VERSION), "should include VERSION");
    }
}
```

---

## 8. Build Outputs & npm Integration

Build artefacts land in `dist/` (gitignored):

| Target | Command | Output path |
|---|---|---|
| Native binary | `cargo build --release --bin clc` | `dist/native/clc` |
| WASM (browser) | `wasm-pack build --target web` | `dist/wasm-web/` |
| WASM (Node.js) | `wasm-pack build --target nodejs` | `dist/wasm-node/` (`.js` → `.cjs`) |

npm scripts orchestrate builds:

* `npm run build:native` — compile the standalone binary.
* `npm run build:wasm-web` — browser WASM bundle.
* `npm run build:wasm-node` — Node WASM bundle (with `.cjs` rename).
* `npm run build:rust` — all three Rust targets sequentially.
* `npm run build` — JS rollup + all Rust targets.
* `npm run ok` — tests + type-check + build (the single quality gate).

Each build script:
- Deletes stale artefacts before building.
- Uses `try/catch` with green-OK / red-Error console output.
- Calls `process.exit(1)` on failure so npm propagates the error.

---

## 9. Formatting & Import Order

* All code is processed by `rustfmt`. Do not explain formatting choices.
* Import order within a file:
  1. `mod` declarations (child modules of this file).
  2. External crate imports (`use wasm_bindgen::...`, `use serde::...`).
  3. Internal crate imports (`use crate::clc_constants::...`).
  4. `use super::*` (in test modules only).
* Group blank lines between each section.

---

## 10. Dependency Rules

* The ONLY external runtime dependency is `wasm-bindgen = "0.2"`.
* `serde` and `serde-wasm-bindgen` may be added when complex struct
  serialisation is needed (Phase 4+). They require explicit approval.
* Dev-dependencies: `std` assert macros are sufficient. No test frameworks.
* `target/` is gitignored. `Cargo.lock` is committed.
