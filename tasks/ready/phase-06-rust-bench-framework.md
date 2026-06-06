# Phase 06 — Rust bench framework (CSV-identical)

> **Status:** ready

## Context

- Build a Rust benchmarking framework that mirrors `scripts/bench-runner.mjs`
  and `scripts/bench-report.mjs` in API and output.
- Require Rust history rows to be **character-for-character identical** to the
  JS CSV schema in widths, padding, and separators.
- Keep the Rust and JS histories separate per language so the visualisation can
  merge them without either runtime rewriting the other's history file.

Mirror target:

| JS | Rust |
|----|------|
| `scripts/bench-runner.mjs` | `rust/bench/runner.rs` |
| `scripts/bench-report.mjs` | `rust/bench/report.rs` |
| top-level `bench.mjs` | `rust/bin/bench.rs` |
| `bench/methods/<m>.bench.mjs` | `rust/benches/methods/<m>.rs`, called from `bin/bench.rs` |
| `bench/benchmark-inputs.mjs` | `rust/bench/inputs.rs` |
| `bench/histories/core.lph-history.csv` | `bench/histories/core-rust.lph-history.csv` |

## Decisions

1. **Keep separate history CSVs per language** — JS and Rust share the exact
   schema, but write to different files so rerunning one language never mutates
   the other's history.

   ```text
   bench/histories/
     core.lph-history.csv
     core-rust.lph-history.csv
   ```

2. **Add a dedicated Rust bench binary** — wire `rust/bin/bench.rs` into
   `Cargo.toml` as `[[bin]] name = "bench"`, and run it via
   `cargo run --release --bin bench`.
3. **Mirror the JS runner API exactly** — defaults, percentile maths, median,
   stdev, rounding, `MIN_DURATION_US`, `ops_per_sec`, and progress timing all
   need to match.

   ```rust
   pub const MIN_DURATION_US: f64 = 0.001;
   pub const BENCH_PROGRESS_UPDATE_INTERVAL_MS: u64 = 1000;
   ```

4. **Use fake-clock unit tests for runner parity** — inject clocks just as the
   JS runner does, so median/p95/stdev/ops-per-sec are directly comparable.
5. **Treat CSV byte-identity as a hard requirement** — `format_table()` and
   `write_history()` must match the JS header strings, spacing, separators, and
   line-break structure exactly.
6. **Hand-roll ISO timestamp formatting first** — avoid `chrono` in v1; only
   escalate to a time crate if the formatter turns out to be materially worse
   than a small custom helper.
7. **Keep the Rust top-level scope narrow in v1** — run only the core suite;
   preset benchmarking stays JS-only until Rust preset analogues exist.
8. **If the ISO timestamp formatter stops being a small helper** - the phase
   should adopt `time = "0.3"`, if possible.
9. **`.cargo/config.toml` with `target-cpu=native`** - worth revisiting later
   for bench-only runs.


## Implementation

### Step 1: Add Cargo and npm bench wiring

Add the Rust bench binary to `Cargo.toml`:

```toml
[[bin]]
name = "bench"
path = "rust/bin/bench.rs"
```

Wrap it with npm scripts such as:

```jsonc
{
  "bench:js": "node bench.mjs",
  "bench:rust": "cargo run --release --bin bench",
  "bench": "npm run bench:js && npm run bench:rust"
}
```

- It should let `cargo run --release --bin bench` execute the Rust bench binary.
- It should let `npm run bench:rust` and `npm run bench` invoke the Rust path
  from the existing JS workflow.
- It should declare a `rust/bench/mod.rs` file (or equivalent `#[path]`
  attributes) so `runner`, `report`, and `inputs` are importable as submodules
  from `rust/bin/bench.rs`.

### Step 2: Implement `rust/bench/runner.rs`

Mirror `bench-runner.mjs`, including defaults and injected clocks.

- It should keep the same warmup default (100) and iterations default (1000).
- It should keep the same percentile, median, population-stdev, rounding, and
  `ops_per_sec` formulas as the JS runner.
- It should define a `BenchResult` struct with fields `name`, `median_us`,
  `p95_us`, `stdev_us`, `ops_per_sec`, and `iterations`, consumable by
  `report.rs`.
- It should accept a clock-injection closure (`impl Fn() -> f64`) to mirror
  the JS dependency-injection pattern and enable deterministic unit tests.
- It should include fake-clock unit tests in a `#[cfg(test)]` module proving
  `median_us`, `p95_us`, `stdev_us`, and `ops_per_sec` match the JS assertions.

### Step 3: Implement `rust/bench/report.rs`

Mirror `bench-report.mjs`, including `BENCH_GROUP_ORDER`, `BENCH_NAME_ORDER`,
`format_table()`, and `write_history()`.

- It should mirror `BENCH_GROUP_ORDER` and `BENCH_NAME_ORDER` exactly,
  producing group and row ordering byte-identical to the JS report.
- It should emit CSV rows that are byte-identical to the JS format in column
  widths, padding, separators, and blank-line structure.
- It should include a golden-file test that compares a Rust-emitted reference
  fragment against a hand-crafted expected CSV fragment.

### Step 4: Implement `rust/bench/inputs.rs`

Port `bench/benchmark-inputs.mjs` line-for-line, including the LCG, word lists,
constants, and input variants.

- It should use the same LCG multiplier and increment as the JS generator.
- It should preserve the same constants and input-shape options as the JS file.
- It should include a golden test proving Rust `generate_typical_input(0,
  "both")` matches the JS output for the same arguments.

### Step 5: Implement `rust/bin/bench.rs`

Mirror the top-level structure of `bench.mjs` so the Rust binary runs suites,
prints tables, writes history, and emits progress output in the same style.

- It should implement at least one `rust/benches/methods/<m>.rs` file
  (mirroring its JS counterpart in `bench/methods/`) to provide a concrete
  benchmark target for the core suite, callable from `bin/bench.rs`.
- It should run the core Rust suite and write
  `bench/histories/core-rust.lph-history.csv`.
- It should print a sensible progress line and summary table in release mode.
- It should produce a CSV that round-trips through the JS `parseBenchCsv()`
  implementation without error.

### Step 6: Run `nvm use && npm run ok`

_(no testable behaviour)_

## Open questions

_(none)_

## Changelog

| Date | Status | Notes |
|---|---|---|
| 2026-06-06 | in-review | Reorganised into the standard task format without changing the planned scope. |
| 2026-06-06 | review/update | Findings: missing module-wiring step, `BenchResult` struct, clock-injection mechanism, ordering-array criteria, and bench-method-file requirement. Changes: added "it should…" criteria to Steps 1–3 and 5 for `rust/bench/mod.rs` wiring, `BenchResult`, `impl Fn() -> f64` clock injection, `BENCH_GROUP_ORDER`/`BENCH_NAME_ORDER` ordering, `#[cfg(test)]` test location, and bench method file implementation. |
| 2026-06-06 | review-alignment | Findings: Decision 1 listed `markdown-basic.lph-history.csv` and `markdown-basic-rust.lph-history.csv` entries inherited from a previous project; Phase 7 deletes those benchmark modules so the Rust counterparts would never exist. Changes: removed `markdown-basic` entries from Decision 1 history listing. |

## Risks / notes

- **`Instant` resolution:** on macOS / Linux, `Instant::now()` is high
  resolution; on Windows it depends on the timer. Document this if platform
  variance matters.
- **Result-type alignment:** any future `BenchResult` schema change must land in
  JS, Rust, and the CSV format together; the golden tests are the guardrail.
