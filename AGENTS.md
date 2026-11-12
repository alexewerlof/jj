# JJ Agent Instructions

JJ is a runtime-dependency-free TypeScript library for imperative DOM manipulation. It wraps native DOM objects in fluent, typed classes and complements browser APIs rather than replacing them with a framework.

## Repository Map

- `src/`: implementation; public exports are collected in `src/index.ts`.
- `src/wrappers/`: typed wrappers for DOM interfaces; see its `AGENTS.md` for local conventions.
- `test/`: Node tests using JSDOM.
- `www/`: static site and runnable examples consuming generated bundles.
- `skills/SKILL.md`: main JJ development guide; detailed references are in `skills/references/`.

Consumers can use the built browser bundles without a project build step. Maintainers build this TypeScript source with tsup.

## Commands

- `npm run build`: generate bundle formats, declarations, API docs, and local site vendor assets.
- `npm run typecheck`: run TypeScript checks without emitting files.
- `npm test`: run the Node test suite with tsx; it does not run typecheck.
- `npm run lint`: run ESLint.
- `npm run fmt`: format the repository with Prettier.

Preview the static site with the VS Code Live Server extension, typically at `http://localhost:5500/www/index.html`; run `npm run build` first to generate ignored library, docs, and site vendor assets. Do not start a second server.

## Working Conventions

- Load `skills/SKILL.md` before JJ-specific implementation; use its references for detailed API patterns.
- Prefer JJ factories and wrappers; access `.ref` only for native APIs without a JJ equivalent. Use `setText()` for untrusted text; non-empty `setHTML()` requires explicit trusted-content opt-in.
- Add tests for behavior changes. See `test/AGENTS.md` for test setup.
- Do not change the package export surface without explicit instruction.
- Update the nearest `AGENTS.md` when architecture, APIs, or local conventions change.
- Follow applicable instructions in `.github/instructions/`.
