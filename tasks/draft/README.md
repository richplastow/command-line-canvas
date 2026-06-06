# Dual JS + Rust conversion — plan overview

**Goal:** Add a parallel Rust codebase to `command-line-canvas` that mirrors the
existing `.mjs` source as closely as possible, and a Rust benchmarking
framework that produces CSV history files identical in schema/formatting to
the existing JS benchmark output. Visualisation stays in JS — the existing
`docs/bench.mjs` already does that job.

## Reference inputs

- The existing JS source tree under `src/`, `command-line-canvas.mjs`,
  `e2e/`, `test.mjs`, and `rollup.config.mjs`.
- The benchmarking system documented in [bench/README.md](../../bench/README.md):
  - `scripts/bench-runner.mjs` — `bench()`, `BenchResult`, `BenchOptions`,
    progress events, fake-clock injection.
  - `scripts/bench-report.mjs` — `formatTable()`, `writeHistory()`,
    `BENCH_GROUP_ORDER`, `BENCH_NAME_ORDER`, fixed-width CSV columns.
  - `scripts/bench-visualise.mjs` + `docs/bench.mjs` + `docs/bench.html` —
    CSV-to-HTML pipeline.
  - `bench/methods/*.bench.mjs` — trivial / typical / heavy three-tier pattern.
  - `bench/benchmark-inputs.mjs` — seeded LCG PRNG input generator.
- The "running rust four ways" repo
  (<https://github.com/richplastow/20231104-running-rust-four-ways>):
  - **Way 1:** `rustc src/main.rs -o dist/...` → standalone native binary.
  - **Way 2:** Node.js wrapper using `child_process.execSync()` against (1).
  - **Way 3:** `wasm-pack build --target web` → browser wasm + JS shim.
  - **Way 4:** `wasm-pack build --target nodejs` → Node wasm + CJS shim
    (renamed to `.cjs` because this project is `"type": "module"`).
  - `Cargo.toml` is shared between targets and uses `crate-type = ["cdylib"]`
    plus `wasm-bindgen = "0.2"` for ways 3 + 4.

## Architectural decisions (proposed)

1. **Single Cargo workspace at the repo root.** A top-level `Cargo.toml`
   defining the crate `command-line-canvas` with `crate-type = ["cdylib",
   "rlib"]`. `rlib` is needed so Rust integration tests, benches, and a
   standalone binary can link against the library; `cdylib` is needed for
   wasm-pack.
2. **Rust source under `rust/`** (parallel to `src/`). The folder structure
   mirrors `src/` exactly:
   - `rust/lib.rs` — top-level entry, mirrors `command-line-canvas.mjs`.
   - `rust/clc_constants.rs`, `rust/clc_types.rs`.
   - `rust/models/{canvas,color,primitive,shape}/{mod.rs,validators.rs}`.
   - `rust/utilities/{encoders,rasterize,sdfs_and_aabbs}/...`.
   - Tests are co-located using Rust's `#[cfg(test)] mod tests { ... }` block
     at the bottom of each file (the closest Rust idiom to the JS
     `.test.mjs` co-location).
3. **One Cargo manifest, four build targets:**
   - `rlib` — consumed by `cargo test`, upstream Rust crates, and future
     benchmarks. Implicit; produced by default alongside `cdylib`.
   - `dist/native/clc` — standalone binary built by `cargo build --release
     --bin clc` (a thin `bin/clc.rs` reading stdin or argv).
   - `dist/wasm-web/` — `wasm-pack build --target web --out-dir
     dist/wasm-web --out-name command-line-canvas`.
   - `dist/wasm-node/` — `wasm-pack build --target nodejs --out-dir
     dist/wasm-node --out-name command-line-canvas`, with a post-step that
     renames the generated `.js` to `.cjs` (project is `"type": "module"`).
   - "Running Rust Four Ways" Way 2 (Node wrapper around the native binary) is
     **omitted** for now — it adds little value once wasm-node exists. Here we
     document the omission and leave the door open.
4. **Tests live where the code lives.** Rust unit tests at the bottom of each
   `.rs` file. Integration / e2e tests in `rust/tests/` (Cargo's standard
   layout) mirroring `e2e/` content. A top-level `cargo test` is the
   equivalent of `node test.mjs`.
5. **Benchmarks are CSV-identical, file-separated.** Rust writes to its own
   history CSV alongside the JS one (`bench/histories/core-rust.clc-history.csv`,
   etc.). Both CSVs use the exact same header, column widths, padding, and
   row separators — verified by golden-file tests in both languages. The
   visualisation extends `docs/bench.mjs` to merge the two files and
   distinguish JS vs Rust series.
6. **Determinism via dependency injection mirrors the JS pattern.** The Rust
   `bench()` accepts a clock function (`Box<dyn Fn() -> f64>` or a generic
   `F: Fn() -> f64`), an inputBytes count, iterations, warmup, and an
   optional progress callback — same field names, same defaults
   (`iterations: 1000`, `warmup: 100`).
7. **Shared seed → identical inputs.** The Rust port of
   `bench/benchmark-inputs.mjs` uses the **same LCG**
   (`state = state.wrapping_mul(1664525).wrapping_add(1013904223)`) and the
   same word lists, so the typical/heavy fixtures produced in Rust are
   byte-identical to the JS ones. Verified by a golden-file test that
   compares the Rust-generated typical input to the JS-generated one.
8. **`npm run ok` orchestrates both languages.** It expands to: JS tests →
   Rust tests (`cargo test`) → JS type-check → JS rollup → wasm-pack web
   → wasm-pack node → standalone native build. Each step gates the next.

## Phases

The work is divided into eight phases, each in its own draft task file.
Phases 1–5 deliver the parallel Rust codebase. Phases 6–8 deliver the
benchmarking system. Phase numbering is sequential; later phases assume
earlier phases have landed.

| # | File | Outcome |
|---|------|---------|
| 1 | [phase-01-rust-foundation.md](phase-01-rust-foundation.md) | Cargo workspace, three build targets, npm script integration, hello-world parity |
| 2 | [phase-02-port-models.md](phase-02-port-models.md) | `Color`, `Primitive`, `Shape`, `Canvas` value types + validators |
| 3 | [phase-03-port-utilities.md](phase-03-port-utilities.md) | Rasterize pipeline, SDFs/AABBs, encoders |
| 4 | [phase-04-wasm-bindings-and-entrypoint.md](phase-04-wasm-bindings-and-entrypoint.md) | `CommandLineCanvas` wrapper + `#[wasm_bindgen]` API |
| 5 | [phase-05-cross-language-equivalence.md](phase-05-cross-language-equivalence.md) | Pixel-identical output proven by shared golden fixtures |
| 6 | [phase-06-rust-bench-framework.md](phase-06-rust-bench-framework.md) | `bench()`, `writeHistory()`, fake-clock testing, CSV-identical output |
| 7 | [phase-07-perf-benchmarks.md](phase-07-perf-benchmarks.md) | Hot-path benchmarks for rasterize, SDFs, encoders, in both languages |
| 8 | [phase-08-dual-visualisation.md](phase-08-dual-visualisation.md) | `docs/bench.html` shows JS and Rust series side by side |

## Open questions

These are flagged in the relevant phase files.

- **Q1 — Folder name:** `rust/` vs `src-rust/` vs splitting into a
  `crates/` workspace. _Default: `rust/` to match `src/`._
- **Q2 — Test idiom:** bottom-of-file `#[cfg(test)] mod tests` (co-located,
  matches JS) vs sibling `*_test.rs` (less idiomatic in Rust). _Default:
  bottom-of-file._
- **Q3 — wasm shim language:** publish the `.wasm` + the `wasm-pack`-
  generated JS shim, or hand-write a thinner shim. _Default: use what
  `wasm-pack` gives us for v1, evaluate later._
- **Q4 — Rust standalone binary I/O:** read a JSON scene description from
  stdin, write a PNG/ANSI string to stdout? _Default: argv-based,
  ANSI-string output, mirroring the four-ways `greet` example._
- **Q5 — Bench name disambiguation:** prefix names (`js-typical-rasterize`
  vs `rs-typical-rasterize`) inside one CSV, or keep two CSVs with the
  same names. _Default: two CSVs, same names — visualisation merges them
  and adds a `language` axis._

## Non-goals

- Replacing the JS implementation. Both implementations stay; the JS one
  remains the primary published `main` in `package.json`.
- Rust-side HTML/CSS generation. `docs/bench.mjs` already does that.
- A polyglot test runner. JS keeps its `node test.mjs`; Rust keeps
  `cargo test`. `npm run ok` runs both.
- Publishing the Rust crate to crates.io. Out of scope for v1.
