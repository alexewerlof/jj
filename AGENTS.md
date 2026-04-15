# AI Agent Instructions for JJ Library

This repository contains `jj`, a minimal, imperative, no-build TypeScript library for DOM manipulation.
Follow these rules strictly to generate idiomatic, type-safe, and secure code.
ALWAYS prioritize security and correctness over performance.
If you encounter contradicting instructions, pause and ask the user what to do.

## Repository Orientation

- **Source code**: `src/` (TypeScript) compiles to `lib/`.
- **Tests**: `test/` (TypeScript) runs with `jsdom` for DOM emulation in Node.js.
- **Public API**: Public wrappers and helpers are exported from `src/index.ts`.
- **Public site**: `www/` is the landing page that consumes `lib/bundle.js`. It is served as static content via [Github Pages Action](.github/workflows/gh-pages.yml).
- **Examples**: `www/examples` contains runnable examples/tutorials.

## Local Development Server

The project is served via the **Live Server** VS Code extension (`ritwickdey.liveserver`) on **port 5500**. Do **not** start a separate server process (e.g. `npx serve`, `http-server`, etc.) — Live Server is always running when the workspace is open.

- `www/` root: `http://localhost:5500/www/index.html`
- Examples: `http://localhost:5500/www/examples/<name>/index.html`

Use these URLs when opening pages in the Chrome DevTools MCP or any browser tool.

## Build and Validation Commands

- `npm run build` uses [tsup](https://www.npmjs.com/package/tsup) to produces bundle artifacts in `lib/` in cjs, global, and esm format minified and plain with sourcemaps.
- `npm run typecheck` runs TypeScript checks without emitting files.
- `npm test` runs typecheck plus uses node's native test framework together with [jsdom](https://www.npmjs.com/package/jsdom) to emulate the browser environment.
- `npm run doc` runs `typedoc` to generate API docs in `doc/`.
- `npm run fmt` formats files using the repository [Prettier](https://www.npmjs.com/package/prettier) [configuration](./.prettierrc.json).

## Task Skills (Use First)

For task-focused guidance, load `skills/SKILL.md` — it is the main JJ skill with a full API overview and links to every reference doc. For deep-dives, reference files live under `skills/references/`.

- `skills/SKILL.md` (main skill — start here)
- `skills/references/react-to-jj-translation.md`
- `skills/references/vue-to-jj-translation.md`
- `skills/references/svelte-to-jj-translation.md`
- `skills/references/angular-to-jj-translation.md`
- `skills/references/jquery-to-jj-translation.md`
- `skills/references/lit-to-jj-translation.md`
- `skills/references/dom-to-jj-translation.md`
- `skills/references/web-components-patterns.md`
- `skills/references/eventing-patterns.md`
- `skills/references/querying-patterns.md`
- `skills/references/css-improvements.md`
- `skills/references/testing-with-jsdom.md`
- `skills/references/security-and-html.md`
- `skills/references/error-handling-patterns.md`

## 1. Core API Rules

> Load `skills/SKILL.md` for full patterns and examples before writing code.

- **Imperative**: No Virtual DOM. Manipulate real DOM nodes [wrapped in `JJ` objects](./wrappers/AGENTS.md).
- **Fluent API**: Chain wrapper methods whenever possible. Access `.ref` only for native APIs not covered by JJ.
- **Hyperscript**: Use `JJHE.tree()`, `JJSE.tree()`, or `JJME.tree()` to programmatically create a HTML, SVG, or MathML DOM tree respectively.
- **Document Wrapper**: Use `JJD.from(document)` for fluent document queries.

### Element Creation

Use factory methods — `JJHE.create()`, `JJSE.create()`, `JJME.create()`, `JJSR.from()`, `JJDF.create()`, `JJHE.tree()`, `JJSE.tree()`, `JJME.tree()`. Avoid using the constructors (`new JJHE(...)`) or bare `document.createElement`. Factory methods infer the correct element subtype.

### Security

`setHTML(html, true)` requires the explicit `true` flag or throws. Prefer `.setText()` for user-supplied content.

Text helpers are defined on `JJE` and inherited by `JJHE`, `JJSE`, and `JJME`. They use `textContent` only.
For HTML-specific rendering-aware behavior, use `jjEl.ref.innerText` on `JJHE` wrappers.

Per MDN, `Document.textContent` and `DocumentType.textContent` are `null`. For whole-document text,
use `document.documentElement.textContent` or `jjDoc.ref.documentElement.textContent`.

→ See `skills/references/security-and-html.md`.

### Shadow DOM and Components

- Keep `fetchTemplate`/`fetchStyle` at module scope (loaded once, reused per instance).
- Attach with `JJHE.from(this).setShadow(mode)`, then initialize with `initShadow(template, ...styles)` when content is ready.
- Expose `static defined = defineComponent('tag', Class)` on every custom element and `await` it before using the custom element.

→ See `skills/references/web-components-patterns.md`.

### Child Mutations

- Use `setChild()` instead of `empty().addChild()`.
- Use `setTemplate()` instead of `empty().addTemplate()`.
- `addChild()` / `addChildren()` / `addChildMap()` ignore nullish children (`null`/`undefined`); others coerce to Text nodes.
- `addTemplate()` always **clones** before appending.

### Events

- Use `trigger()` for triggering an event object. Apart from using the `new Event()` and `new CustomEvent()` native constructors, there are two ways to create an event object with `bubbles` and `composed` set to `true`:
    - `triggerEvent(name, options?)` is equivalent to `this.trigger(new Event(name, { bubbles: true, composed: true, ...options }))`.
    - `triggerCustomEvent(name, detail?: T, options?)` is the equivalent to `this.trigger(new CustomEvent(name, { bubbles: true, composed: true, ...options, detail }))`.

### Dataset Helpers

- Use `getDataAttr()` / `hasDataAttr()` / `setDataAttr()` / `rmDataAttr()` for singular data-attribute operations.
- Use `setDataAttrs()` for setting multiple data attributes from an object key-value.
- Use ``rmDataAttrs()` for removing multiple data attributes using an array format or use `rmDataAttr()` for variadic arg format that reads better.

### ARIA and Class Helpers

- Use `getAriaAttr()` / `hasAriaAttr()` / `setAriaAttr()` / `rmAriaAttr()` for singular ARIA operations.
- Use `addClass()` / `rmClass()` / `swClass(name, force)` for rest-argument class mutations and `addClasses()` / `rmClasses()` for array-based class mutations.
- `swClass(name, force)` has two modes: **explicit** (pass any value other than `undefined` — truthy adds, falsy removes) and **auto** (omit `force` — flips current state). Use `setClasses()` for multiple conditional classes.
- Use `swAttr(name, force)` to conditionally set (as `""`) or remove a boolean-style HTML attribute (`disabled`, `hidden`, etc.) in explicit mode, or flip it in auto mode when `force` is omitted. Do not use it for ARIA attributes; `aria-hidden`, `aria-disabled`, and similar states require explicit string values via `setAriaAttr()` / `rmAriaAttr()`.
- Note: passing `undefined` explicitly is treated as auto mode, not explicit remove. Use `rmClass()` / `rmAttr()` for unconditional removal.

### Resource Hints

- Use native `<link>` elements for `preload`, `prefetch`, and `modulepreload`, typically via `JJHE.tree()` and `document.head.append(...)`.

→ See `skills/references/eventing-patterns.md`.

## 7. Code Style & Standards

- **Formatting**: Strictly follow `.prettierrc.json`.
    - Single quotes, no semicolons, 4 spaces indent, trailing commas.
- **ESM import paths**: In TypeScript source, local imports must use `.js` file extensions so emitted ESM resolves correctly at runtime.
    ```typescript
    import { JJD } from './JJD.js'
    ```
- **CSS custom properties**: Never hard-code pixel values or color literals — use CSS variables (`var(--spacing-md)`, not `'16px'`).
- **Documentation**: All public methods and classes MUST have documentation in **TypeDoc** format.
    - Use `@param`, `@returns`, `@example`, etc.
    - Use `@remarks` to mention any edge cases or nuances.
    - Use `@throws` to mention any errors that may be thrown.
    - Use `@see` to link to related documentation (especially MDN).

## 8 Error Handling

- **Error closer to the source**: Throw errors as close to the usage as possible.
- **Clear call to action**: When throwing an error, provide a clear call to action if relevant. The error should help guide the developer or AI agent to fix the issue.
- **Internal Utilities**: Prefer using `typeErr` and `errMsg` from `src/internal.ts` instead of creating new Error objects manually. This helps reduce bundle size and maintains consistent error messaging.
    ```typescript
    import { typeErr } from './internal.js'
    // ...
    if (!isStr(name)) {
        throw typeErr('name', 'a string', name)
    }
    ```
- **`typeErr()`**: Use `typeErr(varName, expected, received, extra?)` for `TypeError`s. The optional `extra` argument should be a short fix hint only when the base message and stack trace are not enough.
- **`errMsg()`**: Use `errMsg(varName, expected, received, extra?)` when you need the same standardized message for another error type like `RangeError` or `SyntaxError`.
- **When to use `extra`**: Add it for overloaded APIs, wrapper constructors/factories, or ambiguous validation failures where the caller may not know the correct replacement.
- **When to skip `extra`**: Skip it for obvious scalar checks like "expected string" when the stack trace already points at the exact misuse. Keep the library small.
- **How to write `extra`**: Keep it brief and actionable. It should tell the caller what went wrong and how to fix it in one sentence.

    ```typescript
    throw typeErr('ref', 'a Text node', ref, "Create a Text node with JJT.create() or document.createTextNode('text').")

    throw new RangeError(
        errMsg('as', `'fetch', 'style', or 'script'`, as, 'Use a valid value or omit it to auto-detect from the URL.'),
    )
    ```

## 9. Testing Requirements

- **Mandatory Tests**: Every new feature or bugfix MUST include tests.
- **Environment**: use `node --test` with `jsdom` for DOM simulation.
- **Location Heuristic**:
    - Public API behavior tests belong in `test/` and should primarily validate consumer-facing exports from `src/index.ts`.
    - Internal implementation tests may live in `src/` when they target internal helpers directly (for example `src/internal.test.ts`).
- **JSDOM Bootstrap**:
    - Tests in `test/` import `./attach-jsdom.js` first.
    - Tests in `src/` import `../test/attach-jsdom.js` first.

## 10. Documentation Maintenance

**CRITICAL**: If you change the code or API surface of this library, you **MUST** update the relevant `AGENTS.md` files to reflect the changes. These files are the source of truth for all agents working on this repo. Keeping it up-to-date is as important as writing tests.

Do not modify the package export surface without explicit instruction — silent breaking changes affect downstream consumers and bundling.
