---
name: jj
description: Expert guide for the JJ DOM manipulation library. Load this skill whenever you need to write, debug, or review JJ code; create native web components using JJ's defineComponent, shadow, fetchTemplate, or fetchStyle; translate React, Vue, Svelte, Angular, jQuery, or Lit patterns to JJ idioms; work with JJHE, JJD, JJSE, JJME, JJDF, JJSR, JJET, JJN, or JJT wrappers; or write JJ tests with jsdom. If any JJ class name or helper function appears in the conversation, always load this skill.
---

# JJ DOM Library

JJ is a minimal, zero-dependency TypeScript library that wraps browser DOM interfaces in
fluent, type-safe classes. It complements native browser APIs rather than replacing them.

## The ten rules

1. **Start from a wrapper, not a native node.** `JJD.from(document)`, `JJHE.create()`, `JJHE.tree()`, `JJET.from(window)`, `el.shadow()`.
2. **Keep values wrapped and chain.** Every mutating method returns `this`.
3. **Reach for `.ref` only for APIs on the `ref-gap.md` list.** Never for `classList`, `dataset`, `style`, `value`, `textContent`, or `querySelector*`.
4. **`null` / `undefined` means remove.** One rule for attributes, ARIA, data, classes, and styles.
5. **Any API that parses an HTML string needs an explicit `true`.** `setHTML`, `addTemplate`, `setTemplate`. Use `setText()` for user content.
6. **Query results are `JJHE`.** `find('input', true).setValue(...)` works with no cast.
7. **`setChild` replaces, `addChild` appends, `swChild` swaps one.** Use the `*ChildMap` forms for arrays.
8. **One canonical name per operation** — see the table below.
9. **`this` inside an event listener is the native element.** Use an arrow and capture the `jj*` wrapper.
10. **Fetch templates and styles at module scope,** then update targeted nodes instead of rebuilding trees.

## Wrapper hierarchy

Each wrapper exposes its native node via the readonly `.ref`.

| Class | Wraps            | Adds                                                                           |
| ----- | ---------------- | ------------------------------------------------------------------------------ |
| JJET  | EventTarget      | `.on()`, `.off()`, `.trigger()`, `.triggerEvent()`, `.run()`                   |
| JJN   | Node             | `.getParentNode()`, `.getChildren()`, `.rm()`, `.clone()`                      |
| JJT   | Text             | `.getText()`, `.setText()`                                                     |
| JJE   | Element          | attributes, classes, ARIA, visibility, `.getText()`, `.setText()`, `.shadow()` |
| JJHE  | HTMLElement      | `.getValue()`, `.setValue()`, `.focus()`, `.click()`, `.tree()`                |
| JJSE  | SVGElement       | SVG namespace factory, `.tree()`                                               |
| JJME  | MathMLElement    | MathML namespace factory, `.tree()`                                            |
| JJD   | Document         | `.getText()`, `.getTitle()`, `.setTitle()`, queries                            |
| JJDF  | DocumentFragment | `.addTemplate()`, `.setTemplate()`, batch child ops                            |
| JJSR  | ShadowRoot       | `.find()`, `.findAll()`, `.addStyle()`, `.init()`                              |

`getText()`/`setText()` use `textContent` only. For rendering-aware text use
`jjEl.ref.innerText` on a `JJHE`. For whole-page text use `JJD.getText()`
(`Document.textContent` is `null` per MDN).

## Factories only

```ts
const jjDiv = JJHE.create('div') // JJHE<HTMLDivElement>
const jjSvg = JJSE.create('svg') // JJSE<SVGSVGElement>
const jjMath = JJME.create('math') // JJME<MathMLElement>
const jjFrag = JJDF.create() // JJDF
```

```ts
JJHE.create('svg') // ❌ throws — use JJSE.create('svg')
new JJHE(document.createElement('div')) // ❌ don't call constructors directly
```

```ts
const jjBtn = JJHE.create('button')
    .addClass('btn', 'primary')
    .setText('Save')
    .setAttr('type', 'submit')
    .setAriaAttr('label', 'Save changes')
    .on('click', handleSave)
```

## Intent → call

| You want to…            | Call                                                                         |
| ----------------------- | ---------------------------------------------------------------------------- |
| Find one element        | `find(selector, true)` (throws) or `find(selector)` (null)                   |
| Find many               | `findAll(selector)` — always an array                                        |
| Find an ancestor        | `closest(selector)`                                                          |
| Build a subtree         | `const h = JJHE.tree; h('ul', null, …)`                                      |
| Render an array         | `setChildMap(items, fn)` / `addChildMap(items, fn)`                          |
| Replace all children    | `setChild(...)` / `setChildren([...])`                                       |
| Swap one child          | `swChild(newChild, oldChild)`                                                |
| Clear children          | `empty()`                                                                    |
| Batch attributes        | `setAttrs({...})`, `setAriaAttrs`, `setDataAttrs`, `setStyles`, `setClasses` |
| Read/write a form value | `getValue()` / `setValue(v)`                                                 |
| Attach a shadow root    | `jjEl.shadow()` → `JJSR`                                                     |
| Dispatch to a parent    | `triggerCustomEvent(name, detail)`                                           |

**One canonical name per operation** — the array form exists only for callers that already
hold an array:

| Prefer               | Over                              |
| -------------------- | --------------------------------- |
| `addClass(...names)` | `addClasses(names[])`             |
| `rmClass(...names)`  | `rmClasses(names[])`              |
| `addChild(...items)` | `addChildren(items[])`            |
| `preChild(...items)` | `preChildren(items[])`            |
| `setChild(...items)` | `setChildren(items[])`            |
| `getParent()`        | `getParentNode()`                 |
| `shadow()`           | `setShadow()` + `getShadow(true)` |
| `swChild()`          | `.ref.replaceChild()`             |
| `find()`/`findAll()` | `.ref.querySelector*()`           |

## Nullish removes

| Call                         | `null` / `undefined`  | `false`              | truthy       |
| ---------------------------- | --------------------- | -------------------- | ------------ |
| `setAttr` / `setAriaAttr`    | removes the attribute | writes `"false"`     | writes value |
| `setDataAttr`                | removes the attribute | writes `"false"`     | writes value |
| `setClasses`                 | removes the class     | removes the class    | adds class   |
| `setStyle` / `setStyles`     | removes the property  | removes the property | sets value   |
| `swAttr` / `swClass` omitted | —                     | —                    | auto-toggles |
| `swAttr` / `swClass` passed  | removes               | removes              | adds         |

```ts
jjEl.setAttrs({ 'aria-expanded': isOpen || undefined }) // removed when falsy
jjEl.setStyle('backgroundColor', 'red') // camelCase accepted; unknown names throw RangeError
```

## Security — HTML strings

```ts
jjEl.setText(userInput) // ✅ always safe
jjEl.setHTML('<p>Trusted</p>', true) // ✅ explicit opt-in
jjEl.setHTML('<p>content</p>') // ❌ throws
jjEl.ref.innerHTML = '…' // ❌ bypasses the guard
list.addTemplate('<li>Trusted</li>', true) // ✅ strings need the flag
list.addTemplate(await templatePromise) // ✅ already parsed
```

## Events

```ts
jjEl.on('click', handler)
jjEl.off('click', handler)
jjEl.triggerEvent('click') // bubbles + composed by default
JJHE.from(this).triggerCustomEvent('todo-toggle', { id: 1 }) // detail passed directly
```

```ts
// Delegation: one listener on a stable parent
list.on('click', (event) => {
    if (!(event.target instanceof Element)) return
    const jjItem = JJE.from(event.target).closest('[data-item-id]')
    if (!jjItem) return
    jjItem.addClass('active')
})
```

## Components

```ts
import { attr2prop, defineComponent, fetchStyle, fetchTemplate, JJHE } from 'jj'

const templatePromise = fetchTemplate(import.meta.resolve('./my-card.html'))
const stylePromise = fetchStyle(import.meta.resolve('./my-card.css'))

export class MyCard extends HTMLElement {
    static observedAttributes = ['user-name']
    static defined = defineComponent('my-card', MyCard)

    #userName = ''
    #isInitialized = false
    #jjShadow = JJHE.from(this).shadow() // attach + wrap in one call

    attributeChangedCallback(name, oldValue, newValue) {
        attr2prop(this, name, oldValue, newValue) // kebab-case → camelCase setter
    }

    get userName() {
        return this.#userName
    }
    set userName(v) {
        this.#userName = String(v ?? '')
        this.#render()
    }

    async connectedCallback() {
        if (!this.#isInitialized) {
            this.#jjShadow.init(await templatePromise, await stylePromise)
            this.#isInitialized = true
        }
        this.#render()
    }

    #render() {
        this.#jjShadow.find('[data-role="name"]')?.setText(this.#userName)
    }
}

await MyCard.defined // caller awaits readiness
```

Every `observedAttributes` entry needs a matching camelCase setter, or `attr2prop` throws.
Full pattern, light-DOM variant, and lifecycle rules: `references/component-pattern.md`.

## Common mistakes

Check `references/api-cheatsheet.md` before writing a method name from memory — it is
generated from the published declarations, so it lists exactly what exists.

1. **`.ts` extension in imports** — TypeScript source uses `.js` (`import { X } from './X.js'`).
2. **`JJHE.create('svg')`** — throws; use `JJSE.create('svg')`.
3. **`setHTML`/`addTemplate`/`setTemplate` with a string and no `true`** — throws.
4. **Fetching templates inside `connectedCallback`** — fetch at module scope so the request is shared.
5. **Not awaiting `Element.defined`** — markup parses before the element upgrades.
6. **Unnecessary `.ref`** — check `references/ref-gap.md`; if it is not listed, use the wrapper.
7. **Comparing wrappers for identity** — `find()`/`getChildren()` return new wrappers; compare `.ref`.
8. **Calling `querySelector` on a `findAll` result's `.ref`** — the results are already wrappers.

## Verify before finishing

- Wrapper values are named `jj*`; native values use `el`/`root`/`ref` suffixes.
- No `.ref` outside the `ref-gap.md` list.
- No HTML string reaches `setHTML`/`addTemplate`/`setTemplate` without `true`.
- Required lookups use `find(sel, true)` or a selector that carries the expected tag.
- Components fetch at module scope and expose `static defined`.
- Every `observedAttributes` entry has a matching camelCase setter.

## References

Load on demand:

- `references/api-cheatsheet.md` — every public member with its exact signature (generated)
- `references/ref-gap.md` — approved `.ref` escapes, and when `.ref` is a code smell
- `references/idioms.md` — detailed defaults for translation, querying, events, templates, state
- `references/component-pattern.md` — full custom-element pattern, light DOM, lifecycle
- `references/react-to-jj-translation.md`, `vue-…`, `svelte-…`, `angular-…`, `jquery-…`, `lit-…`, `dom-to-jj-translation.md`
- `references/web-components-patterns.md`, `eventing-patterns.md`, `querying-patterns.md`
- `references/css-improvements.md`, `testing-with-jsdom.md`, `security-and-html.md`, `error-handling-patterns.md`
