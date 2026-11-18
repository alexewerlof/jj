# JJ Idioms and Defaults

The detailed heuristics behind `SKILL.md`. Load this when you need the reasoning, or when
reviewing a diff for idiomatic JJ. `SKILL.md` holds the rules; this holds the guidance.

## Prefer JJ steps over native DOM steps

Do not mechanically keep native patterns like repeated `appendChild`, `querySelector`, or
unwrap/re-wrap flows. Prefer the JJ equivalent that keeps work inside wrappers.

```ts
const h = JJHE.tree
const fruits = ['Apple', 'Orange', 'Pear']

// ✅ preferred: build a subtree once
latestChatResponse.addChild(
    h('section', null, h('h2', null, 'User'), h('div', null, userPrompt), h('h2', null, 'Assistant'), assistantMessage),
)

// ✅ also fine for flat mapped children
const jjList = JJHE.create('ul').addChildMap(fruits, (fruit) => h('li', null, fruit))

// ❌ avoid native-style wrapper escape hatches when JJ already covers it
latestChatResponse.ref.appendChild(JJHE.create('h2').setText('User').ref)
latestChatResponse.ref.appendChild(JJHE.create('div').setText(userPrompt).ref)
```

Defaults:

- Use `JJHE.tree` with a local `h` alias when creating multiple siblings or any nested subtree.
- Prefer `h(tag, attrs, ...children)` over verbose `create(...).set*()` chains when the element can be expressed as structure (options, list items, rows, cards).
- For single-expression callbacks, prefer concise arrows: `x => h(...)` instead of `x => { return h(...) }`.
- Use `create()` for one-off elements; switch to `tree()` as soon as structure becomes non-trivial.
- Prefer `setChild()` when replacing content, not `.empty().addChild()`.
- Prefer `addChildMap()` or `setChildMap()` when rendering from arrays.
- Keep values wrapped. Reach for `.ref` only for APIs on the `ref-gap.md` list.
- Use JJ verb families consistently: `set*` replaces, `add*` appends, `pre*` prepends, `rm*` removes, `sw*` swaps/toggles.

```ts
const h = JJHE.tree
const items = [
    { value: 'a', title: 'Option A' },
    { value: 'b', title: 'Option B' },
]

// ✅ preferred for mapped options
const jjSelect = JJHE.create('select').addChildMap(items, ({ value, title }) => h('option', { value }, title))

// ✅ preferred for single-expression callbacks
const jjList = JJHE.create('ul').addChildMap(items, (item) => h('li', null, item.title))

// ⚠️ avoid unnecessary block + return for a single h(...) expression
const jjListVerbose = JJHE.create('ul').addChildMap(items, (item) => {
    return h('li', null, item.title)
})
```

## Querying

- Start from a wrapped container like `JJD.from(document)` or a `JJSR` shadow root.
- Prefer `find(selector, true)` when absence is a bug; it fails earlier and more clearly than a later null access.
- Prefer narrower selectors that encode expectations, like `button#submit`, instead of broad lookups plus manual type checks.
- Use `findAll()` for arrays of wrappers and keep operating on wrappers instead of unwrapping to native elements.
- Use `.closest()` on wrappers for event delegation and ancestor lookup.
- Put the expected tag in the selector (`button#submit`) instead of a bare ID lookup plus a manual type check.
- Never query `document` for nodes inside a shadow root; query from the `JJSR` wrapper.

## Event-heavy UI

- Prefer event delegation on a common parent for repeated child actions instead of one listener per item.
- Use `.closest()` to recover the intended delegated target from `event.target`.
- `this` inside a listener is the native element, not the wrapper (native `EventTarget` behavior). Use an arrow function and capture the `jj*` wrapper you need.
- Native UI events (`click`, `input`, `change`) already cross shadow boundaries; custom events do not unless `composed: true`.
- Use `bubbles: false` and `composed: false` only for intentionally internal events.
- Keep event code close to the wrapper it affects so later DOM updates stay targeted and local.

```ts
list.on('click', (event) => {
    if (!(event.target instanceof Element)) return
    const jjItem = JJE.from(event.target).closest('[data-item-id]')
    if (!jjItem) return
    list.addClass('handled')
    jjItem.addClass('active')
})
```

## Templates

- An HTML **string** passed to `addTemplate`/`setTemplate` requires `true`, like `setHTML`; pre-parsed sources do not. `JJSR.init()`/`JJE.initShadow()` accept only pre-parsed sources.
- Prefer fetched `.html` templates for large static markup; prefer `<template>` elements for snippets already in the page.
- Prefer `JJHE.tree()` or `JJHE.create()` when you need live wrapper references for later updates.
- `addTemplate()` and `setTemplate()` always clone the input, so reuse the same value safely.
- Keep template promises at module scope; for lazy loading, initialize inside `connectedCallback()` with an `if (!templatePromise)` guard.
- Prefer `addChildMap()` or `setChildMap()` over manually building a fragment when rendering arrays.
- Use `JJDF.create()` when you need to assemble multiple sibling nodes before one insertion.

## State

- Prefer plain objects or classes for state and update the exact affected wrappers in handlers or setters.
- Prefer targeted updates like `value.setText(String(state.count))` over rebuilding a subtree for a small change.
- Use getters/setters or small helpers when they make transitions clearer, not because JJ requires a framework abstraction.
- Reach for an external state library only when the app needs cross-cutting coordination beyond local JS state.
- Do not invent a virtual-DOM-style rerender loop unless the user explicitly asks for one.

## Resource loading hints

- Use native `<link>` hints built with `JJHE.tree` and appended to `head` for `preload`, `prefetch`, and `modulepreload`.
- Keep the `as` value explicit for `preload` instead of inferring it from file extensions.
- `preload` for current-page needs, `prefetch` for probable future navigation, `modulepreload` for module graphs.

## Component work — pitfall prevention

1. **Template-first component UI** — if markup is static, use `fetchTemplate` + `setTemplate` (or shadow `init`) rather than building the UI imperatively.
2. **Keep routing/URL state outside UI components** — query params and history updates belong in page/controller code.
3. **Query with wrappers first** — prefer `find`/`findAll` before dropping to `.ref`.
4. **Do not unwrap and re-wrap** — avoid `find(...).ref` followed by `JJHE.from(...)`.
5. **Use specific selectors for required nodes** — `button#save`, `progress#step-progress`, so selector intent replaces `instanceof` checks.
6. **Keep one canonical state-update path** — centralize validation, clamping, render, and event dispatch; avoid split setter/private-method duplication.
7. **Use one initialization invariant** — if `isInitialized` guarantees bound refs are ready, guard on that flag instead of repeating null checks.
8. **Prefer fluent assignment when binding handlers** — chain `.on(...)` directly on `find(...)` where readable.
9. **Coerce attribute-backed values in setters** — HTML attributes always arrive as strings.
10. **Clean up only external side effects** in `disconnectedCallback` (document listeners, timers, observers, subscriptions); do not tear down the shadow root just because the element detached.
