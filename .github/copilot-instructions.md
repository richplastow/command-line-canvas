# Code style and conventions for this repo

## Project architecture

- JavaScript source lives under `src/`. Rust source lives under `rust/`.
- JavaScript source uses plain `.mjs` files with JSDocs; no TypeScript source files.
- Always include file extensions in import paths: `import { X } from "./x.mjs";`
- When touching JavaScript files, follow `javascript-architecture.instructions.md`.
- When touching Rust files, follow `rust-triad-architecture.instructions.md`.

## **CRITICAL:** Solve the actual problem, not the symptom

When something fails, trace the fault to its origin and correct it there.
Superficial patches that suppress the visible error without addressing the
underlying defect are forbidden. Specifically, **NEVER:**

- Swallow an exception or error solely to hide a failure.
- Suppress type, compiler, linter, or style violations instead of fixing the source.
- Guard against impossible empty, null, invalid, or absent states — investigate
  why they appear.
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

**Keep chat responses compressed:** bullet points over paragraphs, succinct over
grammatically perfect. This saves reading time and context tokens.

**Code comments and documentation** should use correct English grammar with
concise but complete sentences.

## Verification during development

Run `nvm use && npm run ok` after every significant change. This executes the
repo quality gate in sequence. Catch problems immediately rather than
accumulating breakage.

## **IMPORTANT:** Completion checklist

Before declaring work finished:

1. Write or update unit tests covering the changed or new behaviour.
2. Run `nvm use && npm run ok` — type-checks, tests, and build must all pass.

Work is incomplete until `npm run ok` exits cleanly.
