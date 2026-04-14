---
name: jj
description: Expert guide for the JJ DOM manipulation library. Load this skill whenever you need to write, debug, or review JJ code; create native web components using JJ's defineComponent, setShadow, fetchTemplate, or fetchStyle; translate React, Vue, Svelte, Angular, jQuery, or Lit patterns to JJ idioms; work with JJHE, JJD, JJSE, JJME, JJDF, JJSR, JJET, JJN, or JJT wrappers; or write JJ tests with jsdom. If any JJ class name or helper function appears in the conversation, always load this skill.
---

# JJ DOM Library

JJ is a minimal, zero-dependency TypeScript library that wraps browser DOM interfaces in fluent, type-safe classes. It complements native browser APIs rather than replacing them.

## Translation Checklist

When converting native DOM code, framework code, or vague UI requests into JJ, default to this order of thought:

- Start from wrappers, not native nodes: `JJD.from(document)`, `JJHE.create()`, `JJHE.tree()`, `JJET.from(window)`, `getShadow(true)`.
- Keep values wrapped and chain operations; use `.ref` only for native APIs JJ does not provide.
- Use `JJHE.tree` with a local `h` alias for multi-node or nested UI.
- Use `setChild()`/`setChildren()` to replace content and `addChildMap()`/`setChildMap()` for array rendering.
- Query with `find()`/`findAll()`/`closest()` instead of native `querySelector*` when JJ already covers the case.
- Use `setText()` for user content and treat `setHTML(..., true)` as a trusted-content escape hatch.
- For repeated child interactions, prefer one delegated listener on a stable parent over one listener per child.
- Choose shadow DOM for self-contained widgets and light DOM for page-level content that should inherit global styles.
- For components, keep fetched templates/styles at module scope, attach shadow root in the constructor, initialize once, then update targeted nodes instead of rebuilding the whole tree.
- Prefer `'open'` shadow roots unless the user explicitly needs `'closed'`; open mode is easier to test and debug.
- Use plain JS state plus targeted wrapper updates by default; do not invent a virtual DOM style rerender loop unless the user explicitly wants one.

## Naming Conventions

In this repository, prefix variables that hold JJ wrapper instances with `jj`.

```typescript
const jjDoc = JJD.from(document)
const jjFruits = jjDoc.find('#fruits', true)
const jjSubmitBtn = jjDoc.find('button#submit', true)
const jjDialog = JJHE.create('dialog')
```

Naming defaults:

- Use `jj*` for JJ wrappers, including private fields: `#jjHost` for `JJHE.from(this)` (the wrapped host element) and `#jjShadow` for `this.#jjHost.getShadow()` (the wrapped shadow root).
- Do not use `jj*` for plain data like `fruits`, `title`, `isOpen`, or `userName`.
- Do not use `jj*` for native DOM values; prefer names like `formEl`, `shadowRoot`, `inputRef`, or `styleSheet`.
- For promises, use normal names with `Promise`, like `templatePromise` or `stylePromise`.
- `h` is the main intentional exception: use it as the local alias for `JJHE.tree`.

## Wrapper Hierarchy

Each JJ wrapper exposes the native node via `.ref`.

| Class | Wraps            | Key additions                                          |
| ----- | ---------------- | ------------------------------------------------------ |
| JJET  | EventTarget      | `.on()`, `.off()`, `.trigger()`, `.run()`              |
| JJN   | Node             | `.getParent()`, `.getChildren()`, `.rm()`, `.clone()`  |
| JJD   | Document         | `.find()`, `.findAll()`                                |
| JJDF  | DocumentFragment | `.addTemplate()`, `.setTemplate()`, batch child ops    |
| JJE   | Element          | Attributes, classes, ARIA, visibility, HTML write      |
| JJHE  | HTMLElement      | `.setText()`, `.setStyle()`, `.setShadow()`, `.tree()` |
| JJSE  | SVGElement       | SVG namespace factory                                  |
| JJME  | MathMLElement    | MathML namespace factory                               |
| JJSR  | ShadowRoot       | `.find()`, `.findAll()`, `.addStyle()`, `.init()`      |
| JJDF  | DocumentFragment | Fragment operations                                    |
| JJT   | Text             | `.getText()`, `.setText()`                             |

## Type-Safe Creation — Always Use Factory Methods

```typescript
// ✅ CORRECT — factory methods infer the precise generic type
const div = JJHE.create('div') // JJHE<HTMLDivElement>
const input = JJHE.create('input') // JJHE<HTMLInputElement>
const svg = JJSE.create('svg') // JJSE<SVGSVGElement>
const math = JJME.create('math') // JJME<MathMLElement>
const frag = JJDF.create() // JJDF
const btn = JJHE.fromId('my-btn') // JJHE<HTMLButtonElement>

// ❌ WRONG
JJHE.create('svg') // throws — use JJSE.create('svg')
new JJHE(element) // don't call constructors directly
```

## Chaining

All mutating methods return `this`. Chain as much as possible; access `.ref` only when a wrapper method does not exist.

```typescript
const btn = JJHE.create('button')
    .addClass('btn', 'primary')
    .setText('Save')
    .setAttr('type', 'submit')
    .setAriaAttr('label', 'Save changes')
    .on('click', handleSave)
```

## Tutorial Defaults — Prefer JJ Idioms Over Native DOM Steps

When translating browser DOM code into JJ, do not mechanically keep native patterns like repeated `appendChild`, `querySelector`, or unwrap/re-wrap flows. Prefer the JJ equivalent that keeps work inside wrappers.

```typescript
// ✅ preferred: build a subtree once
const h = JJHE.tree

latestChatResponse.addChild(
    h('section', null, h('h2', null, 'User'), h('div', null, userPrompt), h('h2', null, 'Assistant'), assistantMessage),
)

// ✅ also fine for flat mapped children
const list = JJHE.create('ul').addChildMap(fruits, (fruit) => h('li', null, fruit))

// ❌ avoid native-style wrapper escape hatches when JJ already covers it
latestChatResponse.ref.appendChild(JJHE.create('h2').setText('User').ref)
latestChatResponse.ref.appendChild(JJHE.create('div').setText(userPrompt).ref)
latestChatResponse.ref.appendChild(JJHE.create('h2').setText('Assistant').ref)
latestChatResponse.ref.appendChild(assistantMessage.ref)
```

Default heuristics from the tutorial:

- Use `JJHE.tree` with a local `h` alias when creating multiple siblings or any nested subtree.
- Use `create()` for one-off elements; switch to `tree()` as soon as structure becomes non-trivial.
- Prefer `setChild()` or `setChildren()` when replacing content, not `.empty().addChild()`.
- Prefer `addChildMap()` or `setChildMap()` when rendering from arrays.
- Keep values wrapped. Reach for `.ref` only for native APIs JJ does not expose.
- Use JJ verb families consistently: `set*` replaces, `add*` appends, `pre*` prepends, `rm*` removes, `sw*` toggles.

## Document Queries

Wrap `document` with `JJD.from(document)` before querying.

```typescript
const doc = JJD.from(document)
const app = doc.find('#app', true) // throws when absent
const card = doc.find('.card') // null when absent
const items = doc.findAll('.item') // always an array

// Inside a custom element's shadow root
const btn = this.getShadow(true).find('#submit')
```

Querying defaults from the tutorial:

- Start from a wrapped container like `JJD.from(document)` or a `JJSR` shadow root.
- Prefer `find(selector, true)` when absence is a bug; it fails earlier and more clearly than a later null access.
- Prefer narrower selectors that encode expectations, like `button#submit`, instead of broad lookups plus manual type checks.
- Use `findAll()` for arrays of wrappers and keep operating on wrappers instead of unwrapping to native elements.
- Do not use `.ref.querySelector(...)` or `.ref.querySelectorAll(...)` when `find()` or `findAll()` already covers the case.
- Use `.closest()` on wrappers for event delegation and ancestor lookup.
- Use `JJHE.fromId('submit-btn')` for direct ID lookup when you already know the target is an HTML element.

## Attributes, Classes, Styles

```typescript
// Attribute — singular
el.setAttr('role', 'button')
el.getAttr('role')
el.rmAttr('hidden')
el.swAttr('disabled', !isReady) // sets disabled="" or removes it

// Attribute — batch (null/undefined skipped)
el.setAttrs({ type: 'text', placeholder: 'Search…' })

// Classes
el.addClass('active')
el.addClasses(['chip', 'selected'])
el.rmClass('disabled')
el.rmClasses(['pending', 'loading'])
el.swClass('expanded', isExpanded) // explicit: adds when truthy, removes when falsy
el.swClass('is-active') // auto: flips current state (adds if absent, removes if present)
el.swAttr('disabled', !isReady) // explicit: sets disabled="" or removes it
el.swAttr('readonly') // auto: flips current state
el.setClasses({ active: isActive, disabled: !isReady })
el.setClass('card card--featured') // replaces entire className

// Dataset
el.getDataAttr('userId')
el.hasDataAttr('userId')
el.setDataAttr('userId', '42')
el.setDataAttrs({ role: 'admin', team: 'ui' })
el.rmDataAttr('userId')
el.rmDataAttrs(['role', 'team'])

// ARIA
el.getAriaAttr('hidden')
el.hasAriaAttr('hidden')
el.setAriaAttr('hidden', 'true')
el.setAriaAttrs({ label: 'Dialog', modal: 'true' })
el.rmAriaAttr('hidden')

// ARIA is not presence-based like HTML boolean attributes
// Use explicit string states instead of swAttr()
el.setAriaAttr('disabled', 'true')

// Inline styles
el.setStyle('color', 'var(--color-brand)')
el.setStyles({ color: 'red', padding: '8px', border: null })
el.rmStyle('color', 'padding')
```

## Security — HTML Writes

Prefer `.setText()` for any user-supplied content. `.setHTML()` requires an explicit `true` flag when the string is non-empty.

```typescript
el.setText(userInput) // ✅ always safe
el.setHTML('<p>Trusted markup</p>', true) // ✅ explicit opt-in
el.setHTML('') // ✅ clearing is allowed without flag
el.setHTML('<p>content</p>') // ❌ THROWS — missing unsafe flag
el.ref.innerHTML = '…' // ❌ bypasses guard — avoid
```

## Events

```typescript
// Native events
el.on('click', handler)
el.off('click', handler)
el.trigger('click')

// Explicit event objects (equivalent to JJ helpers below)
el.trigger(new Event('click', { bubbles: true, composed: true }))
el.trigger(new CustomEvent('todo-toggle', { detail: { id: 1, done: true }, bubbles: true, composed: true }))

// Custom events — JJ defaults: bubbles: true, composed: true
this.dispatchEvent(new CustomEvent('todo-toggle', { detail: { id: 1, done: true }, bubbles: true, composed: true }))

// Fluent dispatch (same defaults)
el.triggerEvent('click') // equivalent to trigger(new Event('click', { bubbles: true, composed: true }))
JJHE.from(this).triggerCustomEvent('todo-toggle', { id: 1, done: true })
// equivalent to trigger(new CustomEvent('todo-toggle', { detail: { id: 1, done: true }, bubbles: true, composed: true }))

// Override defaults for internal-only events
new CustomEvent('panel-ready', { bubbles: false, composed: false })
```

Event defaults from the tutorial:

- Prefer `.on()` and `.off()` on wrappers over native `addEventListener`/`removeEventListener` when already working with JJ values.
- Prefer `.triggerEvent()` and `.triggerCustomEvent()` for common JJ event dispatch; they default to `bubbles: true` and `composed: true`.
- Use `triggerCustomEvent(name, detail)` for component-to-parent communication instead of ad hoc callback plumbing.
- Use `bubbles: false` and `composed: false` only for intentionally internal events.
- Keep event code close to the wrapper it affects so later DOM updates stay targeted and local.

Guide defaults for event-heavy UI:

- Prefer event delegation on a common parent for repeated child actions instead of binding one listener per item.
- Use `.closest()` to recover the intended delegated target from `event.target`.
- When you need JJ's wrapper-bound `this` inside a listener, use `function` syntax, not an arrow.
- Native UI events like `click`, `input`, and `change` already cross shadow boundaries; custom events do not unless `composed: true`.

```typescript
list.on('click', function (event) {
    const item = JJHE.from(event.target as Node).closest('[data-item-id]')
    if (!item) return
    this.addClass('handled')
    item.addClass('active')
})
```

## Custom Elements — Complete Pattern

Fetch template and style at **module scope** — loaded once, shared across all instances.

Guide defaults for component shape:

- Use shadow DOM for self-contained widgets and design-system components; use light DOM for sections that should inherit page styling and normal document flow.
- Prefer `'open'` shadow mode unless stricter encapsulation is a hard requirement.
- `attributeChangedCallback()` can run before `connectedCallback()` for parsed attributes, so setters and render paths must tolerate pre-mount state.
- Use `disconnectedCallback()` only to clean up external side effects like document listeners, timers, observers, or subscriptions; do not tear down the shadow root just because the element was detached.

```typescript
import { attr2prop, defineComponent, fetchStyle, fetchTemplate, JJHE } from 'jj'

const templatePromise = fetchTemplate(import.meta.resolve('./my-card.html'))
const stylePromise = fetchStyle(import.meta.resolve('./my-card.css'))

export class MyCard extends HTMLElement {
    static observedAttributes = ['user-name', 'count']
    static defined = defineComponent('my-card', MyCard)

    #userName = ''
    #count = 0
    #root = null // JJSR wrapper; attached in constructor
    #isInitialized = false

    constructor() {
        super()
        this.#root = JJHE.from(this).setShadow('open').getShadow(true)
    }

    attributeChangedCallback(name, oldValue, newValue) {
        // Converts kebab-case → camelCase, then calls the matching setter
        attr2prop(this, name, oldValue, newValue)
    }

    get userName() {
        return this.#userName
    }
    set userName(v) {
        this.#userName = String(v ?? '')
        this.#render()
    }

    get count() {
        return this.#count
    }
    set count(v) {
        this.#count = Number(v) || 0
        this.#render()
    }

    async connectedCallback() {
        if (!this.#isInitialized) {
            this.#root.init(await templatePromise, await stylePromise)
            this.#isInitialized = true
        }
        this.#render()
    }

    #render() {
        if (!this.#root) return // guard for attribute changes before mount
        this.#root.find('[data-role="name"]')?.setText(this.#userName)
        this.#root.find('[data-role="count"]')?.setText(String(this.#count))
    }
}

// Caller must await before using the custom element tag
await MyCard.defined
// Or multiple in parallel
await Promise.all([MyCard.defined, OtherCard.defined])
```

Template defaults from the tutorial:

- Prefer fetched `.html` templates for large static markup.
- Prefer `<template>` elements for reusable DOM snippets already present in the page.
- Prefer `JJHE.tree()` or `JJHE.create()` when you need live wrapper references for later updates.
- Keep template promises at module scope; for lazy loading, initialize them inside `connectedCallback()` with an `if (!templatePromise)` guard.
- Use one stable `#root` wrapper per component: `JJHE.from(this)` for light DOM or `JJHE.from(this).setShadow(...).getShadow(true)` for shadow DOM.
- Initialize template content once, then update specific nodes with `find(...).setText(...)` or other targeted wrapper operations.

Guide defaults for attributes and queries:

- Always coerce attribute-backed values in setters because HTML attributes arrive as strings.
- Query inside shadow DOM from the `JJSR` wrapper, never from `document`.
- Use specific selectors like `button#submit` or `[data-role="title"]` so the selector carries intent.

State defaults from the tutorial:

- Prefer plain objects or classes for state and update the exact affected wrappers in event handlers or setters.
- Prefer targeted updates like `value.setText(String(state.count))` over rebuilding an entire subtree for a small change.
- Use getters/setters or small helper methods when they make state transitions clearer, not because JJ requires a framework-style abstraction.
- Reach for external state libraries only when the application actually needs cross-cutting coordination beyond local JS state.

`defineComponent()` returns `Promise<boolean>`:

- `false` — newly defined by this call
- `true` — already defined with the same constructor

## Tree Builder

`JJHE.tree` is a factory for declarative element trees. Alias as `h` for brevity.

```typescript
const h = JJHE.tree

const card = h(
    'article',
    { class: 'card' },
    h('h2', null, title),
    h('p', { class: 'body' }, description),
    h('footer', null, h('a', { href: url }, 'Read more')),
)
```

## Children and Templates

```typescript
// Clear children — internally uses replaceChildren()
el.empty()

// Replace all children in one call (prefer over .empty().addChild())
el.setChild(newChild)
el.setChildren([childA, childB])
el.setChildMap(items, (item) => JJHE.tree('li', null, item.label))
el.setTemplate(templateElement)

// Append
el.addChild(child)
el.addChildMap(items, (item) => JJHE.tree('li', null, item.label))
el.addTemplate(await templatePromise) // clones before appending
```

`addChild` / `preChild` / `setChild` and map variants ignore `null`/`undefined`; all other non-node values are coerced to Text nodes.

Guide defaults for template and fragment usage:

- `addTemplate()` and `setTemplate()` always clone the input before appending; reuse the same template value safely.
- Prefer `setTemplate()` over `empty().addTemplate()` when replacing all content.
- Prefer `addChildMap()` or `setChildMap()` over manually building a fragment when rendering arrays.
- Use `JJDF.create()` when you need to assemble multiple sibling nodes before one insertion.

## Node Traversal

```typescript
const parent = el.getParent() // wrapped parent or null (detached)
const children = el.getChildren() // wrapped child array (always an array)
el.rm() // detach from parent (no-op if already detached)
const ancestor = el.closest('[data-section]') // null if not found
```

## Resource Loaders

```typescript
import { JJHE, fetchStyle, fetchTemplate } from 'jj'

const h = JJHE.tree

// Hint browser to preload early with native <link>
document.head.append(
    h('link', {
        href: import.meta.resolve('./bundle.js'),
        rel: 'modulepreload',
    }).ref,
)
document.head.append(
    h('link', {
        href: import.meta.resolve('./main.css'),
        rel: 'preload',
        as: 'style',
    }).ref,
)

// Load a CSSStyleSheet for adoptedStyleSheets or setShadow
const sheet = await fetchStyle(import.meta.resolve('./theme.css'))
document.adoptedStyleSheets = [sheet]

// Load a DocumentFragment for addTemplate / setShadow
const fragment = await fetchTemplate(import.meta.resolve('./dialog.html'))
```

Guide defaults for browser-native loading hints:

- Use native `<link>` hints built with `JJHE.tree` and appended to `head` for `preload`, `prefetch`, and `modulepreload`.
- Keep the `as` value explicit for `preload` instead of inferring it from file extensions.
- Use `preload` for current-page needs, `prefetch` for probable future navigation, and `modulepreload` for module graphs you want fetched early.

## String Casing

String case-conversion helpers are internal implementation details.
Use higher-level public APIs like `attr2prop` and `defineComponent` instead of importing low-level casing utilities.

## Common mistakes

1. **`.ts` extension in imports** — TypeScript source must use `.js` (`import { X } from './X.js'`).
2. **`JJHE.create('svg')`** — throws; use `JJSE.create('svg')`.
3. **`el.setHTML(html)` without `true`** — throws when html is non-empty.
4. **Fetching template/style inside `connectedCallback`** — fetch at module scope so the network request is shared.
5. **Not awaiting `Element.defined`** — markup may be parsed before the element is defined, causing flaky upgrades.
6. **Breaking the chain with `.ref` unnecessarily** — use wrapper methods first; reach for `.ref` only when no wrapper method exists.

## Pitfall Prevention Rules (Component Work)

Apply these rules whenever building or refactoring JJ-based custom elements:

1. **Template-first component UI** — if component markup is static, use `fetchTemplate` + `setTemplate` (or shadow `init`) rather than building the UI imperatively in JS.
2. **Keep routing/URL state outside UI components** — query params and history updates belong in page/controller code, not in reusable visual components.
3. **Query with wrappers, not native DOM first** — prefer `find` / `findAll` on JJ wrappers before dropping to `.ref`.
4. **Do not unwrap and re-wrap** — avoid `find(...).ref` followed by `JJHE.from(...)`; keep the wrapper value.
5. **Use specific selectors for required nodes** — prefer selectors like `button#save` and `progress#step-progress` so selector intent replaces manual `instanceof` checks.
6. **Keep one canonical state-update path** — for state like `step`, centralize validation/clamping/render/event dispatch in one code path; avoid split setter/private-method duplication unless clearly justified.
7. **Use one initialization invariant** — if `isInitialized` exists and guarantees bound refs are ready, guard on that flag instead of repeating null checks for every bound field.
8. **Prefer fluent assignment when binding handlers** — in setup code, chain `.on(...)` directly on `find(...)` where readable (for example assigning a button wrapper and click handler in one line).

## Reference Docs

For framework migration or deep-dive patterns, load these on demand:

- `references/react-to-jj-translation.md`
- `references/vue-to-jj-translation.md`
- `references/svelte-to-jj-translation.md`
- `references/angular-to-jj-translation.md`
- `references/jquery-to-jj-translation.md`
- `references/lit-to-jj-translation.md`
- `references/web-components-patterns.md`
- `references/eventing-patterns.md`
- `references/querying-patterns.md`
- `references/css-improvements.md`
- `references/testing-with-jsdom.md`
- `references/security-and-html.md`
- `references/error-handling-patterns.md`
