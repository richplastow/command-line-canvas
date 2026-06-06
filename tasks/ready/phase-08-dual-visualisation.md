# Phase 08 — Dual-language visualisation page

> **Status:** ready

## Context

- Extend `docs/bench.html` and `docs/bench.mjs` to ingest both the JS and Rust
  history CSV files and present JS-vs-Rust comparison charts.
- Keep the CSV schema itself unchanged; this phase is a front-end enhancement
  plus build-time data embedding work.
- Inputs:
  - `bench/histories/core.lph-history.csv` — JS results.
  - `bench/histories/core-rust.lph-history.csv` — Rust results.

## Decisions

1. **Read both CSVs at HTML-generation time** — `scripts/bench-visualise.mjs`
   loads the JS CSV plus the Rust CSV when it exists, then passes both into the
   HTML generator.

   ```js
   const jsCsv = await readFile(CORE_JS_CSV);
   const rustCsv = existsSync(CORE_RUST_CSV) ? await readFile(CORE_RUST_CSV) : null;
   const html = generateBenchHtml(jsCsv, { ...CORE_PAGE, rustCsvContent: rustCsv });
   await writeFile(CORE_HTML, html);
   ```

2. **Extend the embedded record schema with a short `language` key** — add `l`
   to the compact JSON literal.

   ```js
   // Before:
   { d, g, ib, it, m, md, n, ops, p95, sd, v }
   // After:
   { d, g, ib, it, l, m, md, n, ops, p95, sd, v }
   ```

3. **Keep `generateBenchHtml()` backward compatible** — accept `rustCsvContent`
   as an optional property of `options`, and behave exactly as before when it
   is absent.

   ```js
   // options.rustCsvContent is optional; omit for JS-only output.
   export const generateBenchHtml = (jsCsvContent, options) => { ... }
   ```

4. **Render paired JS/Rust series** — bar charts become side-by-side bars,
   trend charts become solid-vs-dashed series, and the legend toggles JS, Rust,
   or both.
5. **Add a Rust speedup summary card** — compute the median of
   `rust_ops / js_ops` across the latest run and surface it as a single summary
   statistic.
6. **Handle missing Rust rows gracefully** — if a benchmark exists only in JS,
   render the JS data and show a small "no Rust data" indicator rather than
   crashing or suppressing the JS result.

## Implementation

### Step 1: Update `scripts/bench-visualise.mjs`

Read the Rust CSV when it exists, pass it to `generateBenchHtml()`, and keep
building the page when it does not exist.

- It should let `npm run build` regenerate `docs/bench.html` with both
  languages' data when both CSVs exist.
- It should still build successfully when `core-rust.lph-history.csv` is
  absent.

### Step 2: Extend `docs/bench.mjs` data parsing and embedding

Add the `l` field to the compact embedded record schema and extend
`generateBenchHtml()` to accept the optional Rust CSV content.

- It should embed both JS and Rust rows in `DATA` when Rust history exists.
- It should assign each embedded row an `l` value of `'js'` or `'rust'`.
- It should preserve backward-compatible output when `options.rustCsvContent` is absent.
- It should default `l` to `'js'` when the field is missing, keeping older embedded payloads valid.

### Step 3: Update the charts and stats strip

Update the bar chart, trend chart, and summary stats:

- Bar chart: two bars per benchmark, with JS saturated and Rust visually
  differentiated by a secondary treatment.
- Trend chart: two lines per method/group, with solid-vs-dashed separation.
- Stats strip: add the **Rust speedup** card.
- Empty state: show JS-only data with a small missing-Rust indicator.

- It should render JS and Rust bars and lines distinctly in the browser.
- It should let the legend toggle JS, Rust, or both.
- It should compute and display the Rust speedup stat correctly.
- It should render JS-only benchmarks without crashing when Rust data is
  missing.

### Step 4: Extend `docs/bench.test.mjs`

Keep the existing single-CSV tests, and add combined-data tests:

- It should embed rows from both JS and Rust CSVs in `DATA` when both are supplied.
- It should assign `l: 'js'` to JS rows and `l: 'rust'` to Rust rows.
- It should pair rows that share the same `n` (benchmark name) across languages.
- It should compute the Rust speedup stat correctly for a fixture pair of JS and Rust results.
- It should make `docs/bench.test.mjs` pass for both the one-CSV and two-CSV cases.

### Step 5: Run `nvm use && npm run ok`

_(no testable behaviour)_

## Open questions

- Are stripe/dash treatments alone sufficient on low-DPI displays, or should
  the chart add explicit textual markers for language as well? Add a small
  `'JS'`/`'Rust'` text label inside each bar and in the trend-line legend
  entries to provide a text fallback on all display densities.

## Changelog

| Date | Status | Notes |
|---|---|---|
| 2026-06-06 | in-review | Reorganised into the standard task format without changing the planned scope. |
| 2026-06-06 | review/update | Findings: 3rd-positional `rustCsvContent` param violated options-object pattern; Step 4 bullets lacked `it should…` format; Step 2 missing backward-compat `l` criterion; Open question left as `_TBD_`. Changes: moved `rustCsvContent` into `options`; updated Decision 1 call site; rewrote Step 4 bullets as `it should…`; added `l`-default criterion to Step 2; resolved Open question with text-label recommendation. |

## Risks / notes

- **Tooltip width:** adding language metadata can widen the tooltip; keep the
  comparison concise enough to remain readable.
- **Schema versioning:** consumers should keep treating missing `l` as `'js'`
  when reading older embedded payloads.
- **CSV merging is the wrong place:** keep each language's CSV file separate and
  merge only at HTML-generation time.
