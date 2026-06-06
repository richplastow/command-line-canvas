---
description: "Strict architectural invariants for the JavaScript codebase: directory layout, build targets, JS/Rust parity constraints, and error contracts. Optimised for reasoning models."
applyTo: "**/*.js,**/*.mjs,tasks/**/*.md"
---

# JavaScript Architecture & Invariants for `command-line-canvas`

## 0. Primary Directive

Write **predictable, platform-agnostic, dependency-light JavaScript**. The
exported class must remain easy to type-check through JSDoc, easy to test in
Node.js, and easy to load directly from the docs examples.

Every public JavaScript operation that overlaps with the Rust implementation
MUST produce byte-identical or semantically equivalent output to Rust for all
shared operations.

---

## 1. Project Architecture: JavaScript

Key architectural patterns:

- JavaScript source lives under `src/`.
- **One export:** The repo name (kebab-case) maps to a single exported class
  (PascalCase). E.g. repo `foo-bar-baz` exports `class FooBarBaz`, defined in
  top-level `foo-bar-baz.mjs`, and built by Rollup to `docs/foo-bar-baz.js`.
- **Plain JavaScript (.mjs) with JSDocs** — no TypeScript source files. Type
  checking is via `tsc --noEmit` reading JSDoc annotations.
- **Platform agnostic** — the exported class must work in browsers, Node, Bun,
  Electron, etc. No platform-specific APIs unless injected.
- **Dependency injection** — non-deterministic methods (getTimestamp(), fetch(),
  random(), etc.) are injected via constructor options, keeping the class pure
  and testable. Duck-typed DOM stand-ins may also be injected for UI code that
  needs to run in non-browser environments.
- **BRAND validation** — methods are defined as standalone deterministic
  functions in `src/`, receiving the class instance as the first argument. They
  verify the instance using a Symbol brand (Rust-inspired pattern) to avoid
  circular imports.
- **Extremely minimal dependencies** — ideally just `@types/node` as a
  devDependency. No frameworks, no test runners, no bundler plugins. All
  utilities are hand-written.
- **Globally installed tools** — Rollup, TypeScript, and http-server are
  installed globally, not as devDependencies.
- **Unit tests** — use `node:assert` (e.g. `deepStrictEqual as deep`,
  `strictEqual as eq`, `throws`). Test files are co-located as `.test.mjs`
  and imported by a top-level `test.mjs` runner.
- **Test file structure** — every `*.test.mjs` file follows a standard pattern: 
  unexported helper test functions, followed by exactly one exported
  `testFooBar()` function at the bottom. Only that exported function may call
  `console.log()`, and it logs exactly once using the format
  `OK: All <class or function name> tests passed!` .
- **Assertion messages** — every `eq()`, `deep()`, `throws()`, and similar
  assertion call includes the third message argument describing the expected
  behaviour.
- **Unused imports** — never leave unused imports in the codebase, even when
  the type-checker does not report them.
- **docs/ folder** — contains `index.html` documentation, example HTML pages,
  and the Rollup build output. Uses the `W4.isDev` system: loads source `.mjs`
  files directly when running on localhost with `/docs/` in the path; otherwise
  loads the built `.js` file.
- **VERSION constant** — the package.json `"version"` is passed into the build
  as a `const VERSION = '...'` literal and displayed in docs/ HTML pages.
- **5-year returnability** — the goal is to maximise the chance of returning to
  the project after years away and getting it running immediately. Minimal deps,
  no build toolchain churn, self-contained utilities, clear README.

---

## 2. Directory Layout & Module Boundaries

JavaScript source lives under `src/` (sibling to the Rust `rust/` tree). The
layout mirrors the Rust structure 1-to-1 where a Rust counterpart exists.

### Invariants

* **Top-level module (`command-line-canvas.mjs`):**
  - Exports the single public `CommandLineCanvas` class.
  - Imports directly from source modules with explicit `.mjs` extensions.
  - MUST delegate model and utility behaviour to `src/` modules.

* **`src/` modules:**
  - Contain plain JavaScript `.mjs` files with JSDoc types.
  - Keep deterministic behaviour in standalone functions wherever possible.
  - Use constructor option injection for non-deterministic behaviour.

* **`docs/` files:**
  - Contain `index.html` documentation, example HTML pages, and Rollup build
    output.
  - Use the `W4.isDev` system for local source loading versus built output.

---

## 3. JS / Rust Parity Contract

The JavaScript implementation is the reference for the Rust triad, and shared
operations must remain byte-identical or semantically equivalent in both
languages.

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

* Module and function names mirror Rust names converted to kebab-case or
  camelCase: `encode_ansi.rs` → `encode-ansi.mjs`, `compute_coverage()` →
  `computeCoverage()`.
* Public class names match Rust struct names in PascalCase: `Canvas`, `Color`,
  `Primitive`, `Shape`.
* JSDoc type aliases mirror Rust structs, enums, and type aliases where a
  shared concept exists.

### Numeric parity

* Use JavaScript `Number` for all floating-point values (matching Rust `f64`).
* Use `Uint8ClampedArray` for browser-style pixel buffers and colour channels
  where the JavaScript API expects clamped channel semantics.
* Maintain the same constant values: `SIDE_IN_WORLD_UNITS = 10.0`,
  `ENABLE_BOX_CULLING = true`.

---

## 4. Error Handling Contract

When something fails, trace the fault to its origin and correct it there.
Superficial patches that suppress the visible error without addressing the
underlying defect are forbidden. Specifically, **NEVER:**

- Wrap code in try/catch solely to swallow an exception.
- Use `!important`, `as any`, `// @ts-ignore`, or `eslint-disable` to hide a
  type or style violation instead of fixing the source.
- Guard against null where null should be structurally impossible — investigate
  why it appears.
- Copy code to sidestep a shared-dependency investigation.

When the true fix lies outside the current scope (e.g. an upstream library bug),
document it with a clear `// @TODO` comment referencing the bug report, and
still describe the correct long-term resolution to the user.

---

## 5. Comment Language Conventions

- JSDocs and inline comments: British English spelling.
- Identifiers (variables, functions, classes): American English spelling.

Example: `const GRAY_COLOR = 0x808080; // mid-grey colour`

Referencing identifiers in conversation or comments:
- Functions → include parentheses: "Call parseToken() here."
- Classes → no parentheses: "Instantiate a TokenStream."
- Instances → lowercase: "the tokenStream instance"
- Ambiguous words → backticks: "Create the new `product`."

---

## 6. JSDoc Style

Files with multiple exports need a `@fileoverview`:

```ts
/**
 * @fileoverview
 * One-line description of this file's purpose, ending in full-stop (period).
 *
 * Sometimes more information, @TODO or @example, but only if necessary.
 */
```

Non-trivial exported functions and classes require a JSDoc block formatted for
VS Code IntelliSense hover:

```ts
/** #### One-line description in 'simple present tense', with no full-stop
 * - If needed, add one or more short markdown bullet points, highlighting
 *   notable aspects, each ending full-stop.
 * Occasionally more information, @TODO or @example, but only if necessary.
 * @param fooBar One-line description ending full-stop.
 * @returns One-line description ending full-stop.
 */
```

Use habitual present tense: "Converts PNG to JPEG", not "Convert…" or
"Function that converts…".

Constructor option objects must always use a named `FooOptions` typedef.
When a constructor destructures that options object, annotate the parameter
itself inline, for example:

```js
/** @typedef FooOptions
 * @property {string} foo The foo value.
 */

constructor(/** @type {FooOptions} */ { foo } = {}) {
  this.foo = foo;
}
```

Do not rely only on a class-level `@param {FooOptions} options` tag for
destructured constructor bindings, because VS Code may still report implicit
`any` errors on the individual properties.

---

## 7. Double-slash Comment Rules

Own-line `//` comments: capital letter, end with full-stop, soft-wrap at ~80
characters. They use the bare infinitive: "Convert PNG to JPEG.", never
"Converts" or "Conversion of".

End-of-line `//` comments: lowercase, no full-stop, terse.

Additional rules:
- Never use `/* ... */` where `//` suffices.
- Comments must stand alone — no references to this conversation, to previous
  versions of the code, or to "we"/"you"/"I".
- Use `//` to visually section code; multi-line `//` blocks signal unusual or
  noteworthy logic.
- Study existing comments for tone and placement frequency.

---

## 8. Module and Export Conventions

- Named exports only — never default exports.
- No barrel files (`index.mjs`).
- No passthrough re-export files. Import directly from the source module.
  Remove leftover passthrough files during refactors.
- Arrow function syntax (`const fn = () => {}`) unless hoisting is required.

---

## 9. File Section Ordering

1. `@fileoverview` JSDoc
2. Imports
3. JSDoc type definitions
4. Module-level constants
5. Primary exported class or function (with JSDoc)
6. Additional exported symbols (with JSDoc)
7. Non-exported helpers (no JSDoc required)

---

## 10. Alphabetical Ordering

Apply A-Z ordering to:

- Function parameters (mandatory first, then optional, each group A-Z)
- Object and class properties
- Multi-step sequences (test cases, validation checks)
- Utility functions within a file (but see exception below for .test.mjs files)
- Union type members and enum values
- Switch cases (where execution order is irrelevant)

Exceptions:
- Small groups with a natural pairing (e.g. `width` then `height`).
- Objects with many short properties plus one or two large multi-line
  properties — put the multi-line ones last for readability.
- The non-exported helpers in .test.mjs files, which follow a logical test flow
  rather than strict A-Z.

---

## 11. Testing Rules

- **Unit tests** — use `node:assert` (e.g. `deepStrictEqual as deep`,
  `strictEqual as eq`, `throws`). Test files are co-located as `.test.mjs`
  and imported by a top-level `test.mjs` runner.
- **Test file structure** — every `*.test.mjs` file follows a standard pattern: 
  unexported helper test functions, followed by exactly one exported
  `testFooBar()` function at the bottom. Only that exported function may call
  `console.log()`, and it logs exactly once using the format
  `OK: All <class or function name> tests passed!` .
- **Assertion messages** — every `eq()`, `deep()`, `throws()`, and similar
  assertion call includes the third message argument describing the expected
  behaviour.

---

## 12. Build, Docs, and npm Integration

- **Globally installed tools** — Rollup, TypeScript, and http-server are
  installed globally, not as devDependencies.
- **docs/ folder** — contains `index.html` documentation, example HTML pages,
  and the Rollup build output. Uses the `W4.isDev` system: loads source `.mjs`
  files directly when running on localhost with `/docs/` in the path; otherwise
  loads the built `.js` file.
- **VERSION constant** — the package.json `"version"` is passed into the build
  as a `const VERSION = '...'` literal and displayed in docs/ HTML pages.
- **5-year returnability** — the goal is to maximise the chance of returning to
  the project after years away and getting it running immediately. Minimal deps,
  no build toolchain churn, self-contained utilities, clear README.

Run `nvm use && npm run ok` after every significant change. This executes type-checks,
unit tests, and the Rollup build in sequence. Catch problems immediately
rather than accumulating breakage.

---

## 13. General Coding Rules

- Always include file extensions in import paths: `import { X } from "./x.mjs";`
- Skip unused destructured slots with a leading comma:
  `const [, second] = pair;`
- All file and folder names use kebab-case, except `README.md` and
  `node_modules`.

---

## 14. Completion Checklist

Before declaring work finished:

1. Write or update unit tests covering the changed or new behaviour.
2. Run `nvm use && npm run ok` — type-checks, tests, and build must all pass.

Work is incomplete until `npm run ok` exits cleanly.
