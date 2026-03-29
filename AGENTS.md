# AI Agent Instructions for JJ Library

This repository contains `jj`, a minimal, imperative, no-build TypeScript library for DOM manipulation.
Follow these rules strictly to generate idiomatic, type-safe, and secure code.
ALWAYS prioritize security and correctness over performance.
If you encounter contradicting instructions, pause and ask the user what to do.

## 1. Core Philosophy

- **Imperative**: No Virtual DOM. You are manipulating real DOM nodes wrapped in `JJ` objects.
- **Fluent API**: Chain methods whenever possible.
- **Native Escape**: Use `.ref` to access the underlying native DOM node when a `JJ` method doesn't exist.
- **Document Wrapper**: Initialize your own document wrapper with `const doc = JJD.from(document)` when you need fluent document queries or document-level operations.

## 2. Type-Safe Element Creation

**ALWAYS** use factory methods (e.g. `JJHE.create()`, `JJSE.create()`, `JJME.create()`, `JJSR.from()`) instead of `new JJHE(...)` or `document.createElement`.

```typescript
// ✅ GOOD
const div = JJHE.create('div') // inferred as JJHE<HTMLDivElement>
const input = JJHE.create('input').setAttr('type', 'text') // inferred as JJHE<HTMLInputElement>
const svg = JJSE.create('svg') // Inferred as JJSE<SVGSVGElement>
const math = JJME.create('math') // Inferred as JJME<MathMLElement>
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

Keep template and style resources at module scope, then pass them directly to `JJHE.setShadow()`.

```typescript
const templatePromise = fetchTemplate(import.meta.resolve('./my-component.html'))
const stylePromise = fetchStyle(import.meta.resolve('./my-component.css'))

class MyComponent extends HTMLElement {
    async connectedCallback() {
        this.jjRoot = JJHE.from(this).setShadow('open', await templatePromise, await stylePromise)
    }
}
```

## 5.1 Async Component Registration

`defineComponent()` is async and must be treated as async everywhere.

For component classes, expose a static `defined` promise:

```typescript
class MyComponent extends HTMLElement {
    static defined = defineComponent('my-component', MyComponent)
}
```

For importers, always await definition readiness before using the custom element:

```typescript
await MyComponent.defined
```

If multiple components are needed, await them in parallel:

```typescript
await Promise.all([MyComponent.defined, OtherComponent.defined])
```

The promise resolves to:

- `false` when the component is newly defined by this call.
- `true` when the same constructor was already defined.

This explicit definition step is critical for reliability. Without it, markup may be parsed before the element is defined, which can lead to timing-sensitive or flaky upgrades.

Do not call `.defined` like a synchronous function, and prefer `defineComponent()` over direct `customElements.define()` when exposing a component readiness contract.

## 6. Common Gotchas

- **`empty()`**: Use `el.empty()` to clear children. It uses `replaceChildren()` under the hood (fast & safe).
- **`empty().addChild()`**: Use `setChild()` instead which replaces the children to the same effect but in 1 call.
- **`addTemplate()`**: Available on `JJD`/`JJDF`/`JJE` and their descendants like `JJHE`. It accepts `string`, `HTMLTemplateElement`, `DocumentFragment`, `HTMLElement`, or any `JJN` wrapper and clones before append. This is useful for quickly populating the root DOM node of a custom element that uses light DOM.
- **`empty().addTemplate()`**: for the same reason, use `setTemplate()` instead.
- **`parent`**: Use `node.parent` to get the wrapped parent node. It returns `null` for detached nodes.
- **`children`**: Use `node.children` to get wrapped child nodes. It always returns an array, including for text and document fragment children.
- **`rm()`**: Use `node.rm()` to detach any wrapped node from its current parent. Detached nodes are ignored.
- **Attributes**: Use `.setAttr('name', val)`, `.getAttr('name')`, `.rmAttr('name')`.
- **Optional attribute objects**: Use `.setAttrMulti(attrs)` for builder-style APIs; it no-ops for `null`/`undefined` and validates POJO input.
- **Classes**: Use `.addClass()`, `.rmClass()`, `.toggleClass()`, `.setClass()`, `.setClassMulti()`.
- **Inline styles**: Use `.getStyle(name)`, `.setStyle(name, value)`, `.rmStyle()`, `.setStyleMulti()` for style property access via `CSSStyleDeclaration`.
- **Dataset**: Use `.setData()`, `.setDataMulti()`, `.getData()` (on `JJHE`/`JJSE`/`JJME`).
- **ARIA**: Use `.setAria()`, `.setAriaMulti()`, `.getAria()`, `.rmAria()`.
- **Custom events**: Prefer `customEvent(name, detail?, options?)` for payload-bearing DOM events instead of spelling out `new CustomEvent(...)` each time.
- **Fluent custom dispatch**: Use `triggerCustomEvent(name, detail?, options?)` on `JJET` descendants when you want JJ-style chaining.
- **Shadow DOM defaults**: JJ's `customEvent()` defaults to `bubbles: true` and `composed: true`. Override them explicitly when the event should stay local.
- **Selectors**: Use `.closest(selector)` on `JJE` for ancestor lookup.
- **Namespaces**: Use `MATHML_NS` and `SVG_NS` from `src/ns.ts` for `document.createElementNS(...)` calls; avoid duplicating namespace URI strings.

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
- **`typeErr()`**: Use `typeErr(varName, expected, received, extra?)` for `TypeError`s. The optional `extra` argument should be a short fix hint only when the base message and stack trace are not enough.
- **`errMsg()`**: Use `errMsg(varName, expected, received, extra?)` when you need the same standardized message for another error type like `RangeError` or `SyntaxError`.
- **When to use `extra`**: Add it for overloaded APIs, wrapper constructors/factories, or ambiguous validation failures where the caller may not know the correct replacement.
- **When to skip `extra`**: Skip it for obvious scalar checks like "expected string" when the stack trace already points at the exact misuse. Keep the library small.
- **How to write `extra`**: Keep it brief and actionable. It should tell the caller what went wrong and how to fix it in one sentence.

    ```typescript
    throw typeErr(
        'ref',
        'a Text node',
        ref,
        "Create a Text node with JJT.fromStr() or document.createTextNode('text').",
    )

    throw new RangeError(
        errMsg('as', `'fetch', 'style', or 'script'`, as, 'Use a valid value or omit it to auto-detect from the URL.'),
    )
    ```

## 9. Testing Requirements

- **Mandatory Tests**: Every new feature or bugfix MUST include tests.
- **Environment**: use `node --test` with `jsdom` for DOM simulation.
- **Location**: Tests live in the root `test/` folder and mirror source filenames (e.g., `test/JJE.test.ts` for `src/JJE.ts`, `test/JJHE.test.ts` for `src/wrappers/JJHE.ts`).

## 10. Documentation Maintenance

**CRITICAL**: If you change the code or API surface of this library, you **MUST** update this file (`AGENTS.md`) to reflect the changes. This file is the source of truth for all agents working on this repo. Keeping it up-to-date is as important as writing tests.
