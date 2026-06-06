# Code style and conventions for this repo

## Project architecture: JavaScript

Key architectural patterns:

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

## Project architecture: Rust

TODO

## **CRITICAL:** Solve the actual problem, not the symptom

When something fails, trace the fault to its origin and correct it there.
Superficial patches that suppress the visible error without addressing the
underlying defect are forbidden. Specifically, never:

- Wrap code in try/catch solely to swallow an exception.
- Use `!important`, `as any`, `// @ts-ignore`, or `eslint-disable` to hide a
  type or style violation instead of fixing the source.
- Guard against null where null should be structurally impossible — investigate
  why it appears.
- Copy code to sidestep a shared-dependency investigation.

When the true fix lies outside the current scope (e.g. an upstream library bug),
document it with a clear `// @TODO` comment referencing the bug report, and
still describe the correct long-term resolution to the user.

## **CRITICAL:** Favour structural correctness over minimal diffs

Always take the architecturally proper path, even when a shortcut exists.
Common anti-patterns to guard against:

- Bolting a one-off helper onto the side when the pattern already lives in a
  shared utility.
- Duplicating logic rather than extracting an abstraction.
- Papering over a design flaw with an extra parameter that suppresses bad
  behaviour.
- Creating a new file that partially overlaps with an existing one, rather than
  extending the existing file.
- Skipping a refactor that the change obviously calls for, simply because it
  wasn't explicitly requested.

Guidelines:

- **Refactor when the change demands it.** If new code belongs in an existing
  utility, put it there and update callers.
- **Optimise for total codebase complexity, not patch size.** The project
  should be simpler after your change — not merely unchanged outside your diff.
- **Maintain coherence.** If a pattern already exists, follow it. If you have
  cause to deviate, migrate the existing instances too.
- **Broad changes are fine.** A consistent ten-file refactor beats a localised
  hack that fragments the codebase.
- **Surface scope concerns honestly.** If the right fix is wider than expected,
  say so: "This properly belongs in X, which also means updating Y and Z —
  shall I proceed?" Never silently pick the shortcut.

## **CRITICAL:** Eliminate redundancy and derivable data

Watch for values that duplicate information available elsewhere — especially
fields whose content is always a deterministic transformation of another field.

Signs of redundancy:

- A stored property that could be computed from a sibling property.
- Boilerplate text embedding an identifier it already has access to via a
  variable or `this`.
- A field required by a type but never consumed at runtime.

Guidelines:

- During any refactor, scan surrounding structures for derivable values.
- If a field is never read, or is always a fixed transform of another field,
  delete it and add a getter or helper if consumers need the derived form.
  Report all such removals so the user can verify.
- When introducing new fields, check whether the value can be inferred from
  existing data. Prefer a single source of truth.

## **CRITICAL:** Understand before modifying

Never delete, rewrite, or replace code without first understanding its purpose.
Seemingly dead or odd code may handle edge cases or work around known issues.

Guidelines:

- Read the full surrounding context before editing anything.
- Preserve existing behaviour unless explicitly asked to change it.
- If something looks unnecessary, ask: "This block appears unused — should I
  remove it?" Do not silently drop it.
- When replacing a block, mentally verify that every responsibility of the old
  code is still handled.
- After any significant edit, run the tests to catch regressions.

## **CRITICAL:** No magic values without approval

Never silently introduce hard-coded literals (numbers, strings, URLs, limits,
paths) when implementing a feature or task. Instead:

1. Check whether a constant, config value, or schema already provides it.
2. If not, define a well-named constant near its point of use (or in a shared
   constants file when referenced from multiple locations).
3. If the correct value is uncertain, stop and ask.

Acceptable without asking:
- Universal constants (`0`, `1`, `100` for percentages, HTTP status codes,
  mathematical constants).
- Values dictated by an external specification (with a citing comment).

Everything else must be a named constant whose identifier clearly communicates
intent (e.g. `MAX_RETRY_ATTEMPTS` not `LIMIT`).

## Conversation style

Keep chat responses compressed — bullet points over paragraphs, succinct over
grammatically perfect. This saves reading time and context tokens.

**Code comments and JSDocs** are the exception: use correct English grammar
with concise but complete sentences.

## Comment language conventions

- JSDocs and inline comments: British English spelling.
- Identifiers (variables, functions, classes): American English spelling.

Example: `const GRAY_COLOR = 0x808080; // mid-grey colour`

Referencing identifiers in conversation or comments:
- Functions → include parentheses: "Call parseToken() here."
- Classes → no parentheses: "Instantiate a TokenStream."
- Instances → lowercase: "the tokenStream instance"
- Ambiguous words → backticks: "Create the new `product`."

## JSDoc style

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

## Double-slash comment rules

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

## Module and export conventions

- Named exports only — never default exports.
- No barrel files (`index.mjs`).
- No passthrough re-export files. Import directly from the source module.
  Remove leftover passthrough files during refactors.
- Arrow function syntax (`const fn = () => {}`) unless hoisting is required.

## File section ordering

1. `@fileoverview` JSDoc
2. Imports
3. JSDoc type definitions
4. Module-level constants
5. Primary exported class or function (with JSDoc)
6. Additional exported symbols (with JSDoc)
7. Non-exported helpers (no JSDoc required)

## Alphabetical ordering

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

## Verification during development

Run `nvm use && npm run ok` after every significant change. This executes type-checks,
unit tests, and the Rollup build in sequence. Catch problems immediately
rather than accumulating breakage.

## General coding rules

- Always include file extensions in import paths: `import { X } from "./x.mjs";`
- Skip unused destructured slots with a leading comma:
  `const [, second] = pair;`
- All file and folder names use kebab-case, except `README.md` and
  `node_modules`.

## **IMPORTANT:** Completion checklist

Before declaring work finished:

1. Write or update unit tests covering the changed or new behaviour.
2. Run `nvm use && npm run ok` — type-checks, tests, and build must all pass.

Work is incomplete until `npm run ok` exits cleanly.
