---
name: jj
description: Expert guide for the JJ DOM manipulation library. Load this skill whenever you need to write, debug, or review JJ code; create native web components using JJ's defineComponent, setShadow, fetchTemplate, or fetchStyle; translate React, Vue, Svelte, Angular, jQuery, or Lit patterns to JJ idioms; work with JJHE, JJD, JJSE, JJME, JJDF, JJSR, JJET, JJN, or JJT wrappers; or write JJ tests with jsdom. If any JJ class name or helper function appears in the conversation, always load this skill.
---

# JJ DOM Library

JJ is a minimal, zero-dependency TypeScript library that wraps browser DOM interfaces in fluent, type-safe classes. It complements native browser APIs rather than replacing them.

## Wrapper Hierarchy

Each JJ wrapper exposes the native node via `.ref`.

| Class | Wraps            | Key additions                                          |
| ----- | ---------------- | ------------------------------------------------------ |
| JJET  | EventTarget      | `.on()`, `.off()`, `.trigger()`, `.run()`              |
| JJN   | Node             | `.parent`, `.children`, `.rm()`, `.clone()`            |
| JJD   | Document         | `.find()`, `.findAll()`, `.head`, `.body`              |
| JJDF  | DocumentFragment | `.addTemplate()`, `.setTemplate()`, batch child ops    |
| JJE   | Element          | Attributes, classes, ARIA, visibility, HTML write      |
| JJHE  | HTMLElement      | `.setText()`, `.setStyle()`, `.setShadow()`, `.tree()` |
| JJSE  | SVGElement       | SVG namespace factory                                  |
| JJME  | MathMLElement    | MathML namespace factory                               |
| JJSR  | ShadowRoot       | `.find()`, `.findAll()`, `.addStyle()`                 |
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

## Document Queries

Wrap `document` with `JJD.from(document)` before querying.

```typescript
const doc = JJD.from(document)
const app = doc.find('#app', true) // throws when absent
const card = doc.find('.card') // null when absent
const items = doc.findAll('.item') // always an array

// Inside a custom element's shadow root
const btn = this.#root.shadow.find('#submit')
```

## Attributes, Classes, Styles

```typescript
// Attribute — singular
el.setAttr('role', 'button')
el.getAttr('role')
el.rmAttr('hidden')

// Attribute — batch (null/undefined skipped)
el.setAttrs({ type: 'text', placeholder: 'Search…' })

// Classes
el.addClass('active')
el.addClasses(['chip', 'selected'])
el.rmClass('disabled')
el.rmClasses(['pending', 'loading'])
el.toggleClass('expanded')
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

// Custom events — JJ defaults: bubbles: true, composed: true
import { customEvent } from 'jj'
this.dispatchEvent(customEvent('todo-toggle', { id: 1, done: true }))

// Fluent dispatch (same defaults)
JJHE.from(this).triggerCustomEvent('todo-toggle', { id: 1, done: true })

// Override defaults for internal-only events
customEvent('panel-ready', undefined, { bubbles: false, composed: false })
```

## Custom Elements — Complete Pattern

Fetch template and style at **module scope** — loaded once, shared across all instances.

```typescript
import { attr2prop, defineComponent, fetchStyle, fetchTemplate, JJHE } from 'jj'

const templatePromise = fetchTemplate(import.meta.resolve('./my-card.html'))
const stylePromise = fetchStyle(import.meta.resolve('./my-card.css'))

export class MyCard extends HTMLElement {
    static observedAttributes = ['user-name', 'count']
    static defined = defineComponent('my-card', MyCard)

    #userName = ''
    #count = 0
    #root = null // JJHE wrapper; null until connectedCallback

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
        this.#root = JJHE.from(this).setShadow('open', await templatePromise, await stylePromise)
        this.#render()
    }

    #render() {
        if (!this.#root) return // guard for attribute changes before mount
        this.#root.shadow.find('[data-role="name"]')?.setText(this.#userName)
        this.#root.shadow.find('[data-role="count"]')?.setText(String(this.#count))
    }
}

// Caller must await before using the custom element tag
await MyCard.defined
// Or multiple in parallel
await Promise.all([MyCard.defined, OtherCard.defined])
```

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

## Node Traversal

```typescript
const parent = el.parent // wrapped parent or null (detached)
const children = el.children // wrapped child array (always an array)
el.rm() // detach from parent (no-op if already detached)
const ancestor = el.closest('[data-section]') // null if not found
```

## Resource Loaders

```typescript
import { addLinkPre, fetchStyle, fetchTemplate } from 'jj'

// Hint browser to preload early
addLinkPre(import.meta.resolve('./bundle.js'), 'modulepreload')
addLinkPre(import.meta.resolve('./main.css'), 'preload', 'style')

// Load a CSSStyleSheet for adoptedStyleSheets or setShadow
const sheet = await fetchStyle(import.meta.resolve('./theme.css'))
document.adoptedStyleSheets = [sheet]

// Load a DocumentFragment for addTemplate / setShadow
const fragment = await fetchTemplate(import.meta.resolve('./dialog.html'))
```

## Case Utilities

```typescript
import { keb2cam, keb2pas, pas2keb } from 'jj'

keb2cam('user-name') // 'userName'
keb2pas('user-name') // 'UserName'
pas2keb('UserName') // 'user-name'
```

## Namespace Constants

```typescript
import { MATHML_NS, SVG_NS } from 'jj'
// Use these with document.createElementNS — never hardcode namespace URIs
```

## Common mistakes

1. **`.ts` extension in imports** — TypeScript source must use `.js` (`import { X } from './X.js'`).
2. **`JJHE.create('svg')`** — throws; use `JJSE.create('svg')`.
3. **`el.setHTML(html)` without `true`** — throws when html is non-empty.
4. **Fetching template/style inside `connectedCallback`** — fetch at module scope so the network request is shared.
5. **Not awaiting `Element.defined`** — markup may be parsed before the element is defined, causing flaky upgrades.
6. **Breaking the chain with `.ref` unnecessarily** — use wrapper methods first; reach for `.ref` only when no wrapper method exists.

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
