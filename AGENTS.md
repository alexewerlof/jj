# AI Agent Instructions for JJ Library

This repository contains `jj`, a minimal, imperative, no-build TypeScript library for DOM manipulation.
Follow these rules strictly to generate idiomatic, type-safe, and secure code.
ALWAYS prioritize security and correctness over performance.
If you encounter contradicting instructions, pause and ask the user what to do.

## 1. Core Philosophy

- **Imperative**: No Virtual DOM. You are manipulating real DOM nodes wrapped in `JJ` objects.
- **Fluent API**: Chain methods whenever possible.
- **Native Escape**: Use `.ref` to access the underlying native DOM node when a `JJ` method doesn't exist.

## 2. Type-Safe Element Creation

**ALWAYS** use factory methods (e.g. `JJHE.create()`, `JJSE.create()`, `JJSR.from()`) instead of `new JJHE(...)` or `document.createElement`.

```typescript
// ✅ GOOD
const div = JJHE.create('div') // inferred as JJHE<HTMLDivElement>
const input = JJHE.create('input').setAttr('type', 'text') // inferred as JJHE<HTMLInputElement>
const svg = JJSE.create('svg') // Inferred as JJSE<SVGSVGElement>
const myInput = JJHE.fromId('my-input') // inferred as JJHE<HTMLInputElement>

// ❌ BAD
const div = new JJHE(document.createElement('div')) // Verbose, redundant, miss type inference
```

## 3. Security (Critical)

- **`setHTML`**: You MUST pass `true` as the second argument to confirm you are setting innerHTML intentionally.
- **XSS Prevention**: Prefer `.setText()` over `.setHTML()` whenever possible.

```typescript
// ✅ GOOD
div.setHTML('<p>Content</p>', true)
div.setText(userInput)

// ❌ BAD
div.setHTML('<p>Content</p>') // Will THROW error
div.ref.innerHTML = '...' // Bypasses checks, discouraged
```

## 4. Chaining vs Native Access

Chain `JJ` methods first. Access `.ref` only when necessary.

```typescript
// ✅ GOOD
const btn = JJHE.create('button').addClass('btn', 'primary').setText('Click me').on('click', handler)

// ❌ BAD
const btn = JJHE.create('button')
btn.ref.classList.add('btn') // Breaking the chain unnecessary
btn.setText('Click me')
```

## 5. Shadow DOM Pattern

Use `ShadowMaster` to manage templates and styles efficiently (caches resolved configs).

```typescript
const sm = ShadowMaster.create().setTemplate('<div><slot></slot></div>').addStyles('div { color: red; }')

class MyComponent extends HTMLElement {
    async connectedCallback() {
        // Efficiently reuses the processed template/styles
        this.jjRoot = JJHE.from(this).initShadow('open', await sm.getResolved())
    }
}
```

## 6. Common Gotchas

- **`empty()`**: Use `el.empty()` to clear children. It uses `replaceChildren()` under the hood (fast & safe).
- **Attributes**: Use `.setAttr('name', val)`, `.getAttr('name')`, `.rmAttr('name')`.
- **Classes**: Use `.addClass()`, `.rmClass()`, `.toggleClass()`, `.setClass()`.
- **Dataset**: Use `.setData()`, `.getData()` (on `JJHE`/`JJSE` only).
- **Selectors**: Use `.closest(selector)` on `JJE` for ancestor lookup.

## 7. Code Style & Standards

- **Formatting**: Strictly follow `.prettierrc.json`.
    - Single quotes, no semicolons, 4 spaces indent, trailing commas.
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

## 9. Testing Requirements

- **Mandatory Tests**: Every new feature or bugfix MUST include tests.
- **Environment**: use `node --test` with `jsdom` for DOM simulation.
- **Location**: Tests live in the root `test/` folder and mirror source filenames (e.g., `test/JJE.test.ts` for `src/JJE.ts`, `test/ShadowMaster.test.ts` for `src/ShadowMaster.ts`).

## 10. Documentation Maintenance

**CRITICAL**: If you change the code or API surface of this library, you **MUST** update this file (`AGENTS.md`) to reflect the changes. This file is the source of truth for all agents working on this repo. Keeping it up-to-date is as important as writing tests.
