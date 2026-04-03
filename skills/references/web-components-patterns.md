# Web Components Patterns

Core patterns for building native custom elements with JJ helpers.

## Anatomy of a JJ component

```
my-component/
├── my-component.js    ← behavior (class, defineComponent, attr2prop)
├── my-component.html  ← Shadow DOM template
└── my-component.css   ← styles loaded via fetchStyle
```

## Registration and readiness

```js
import { defineComponent } from 'jj'

export class MyComponent extends HTMLElement {
    // Resolves Promise<boolean>:
    //   false → newly registered by this call
    //   true  → already registered with the same constructor
    static defined = defineComponent('my-component', MyComponent)
}

// Caller must await before using the tag in markup
await MyComponent.defined
await Promise.all([MyComponent.defined, OtherComponent.defined])
```

Never use `customElements.define()` directly when you need readiness semantics —
use `defineComponent()` which also calls `customElements.whenDefined()`.

## Shadow DOM setup

```js
const templatePromise = fetchTemplate(import.meta.resolve('./my-component.html'))
const stylePromise    = fetchStyle(import.meta.resolve('./my-component.css'))

async connectedCallback() {
    // setShadow(mode, template, ...styles)
    this.#root = JJHE.from(this).setShadow('open', await templatePromise, await stylePromise)
    this.#root.shadow.find('#btn').on('click', this.#handleClick)
    this.#render()
}
```

Shadow mode:
- `'open'`  — `element.shadowRoot` visible externally; easy to debug and test
- `'closed'` — `element.shadowRoot` returns `null`; caller must interact through public API

## Attribute-to-property bridge

```js
static observedAttributes = ['user-name', 'is-active', 'count']

attributeChangedCallback(name, oldValue, newValue) {
    // Converts kebab-case → camelCase, calls matching setter if present
    attr2prop(this, name, oldValue, newValue)
}

// attr2prop fires attributeChangedCallback BEFORE connectedCallback on initial parse.
// Guard renders until shadow is ready:
#render() {
    if (!this.#root) return
    this.#root.shadow.find('[data-role="name"]')?.setText(this.#userName)
}
```

## Light DOM pattern

Skip `setShadow` and update children directly when page-level styling should apply:

```js
async connectedCallback() {
    this.#root = JJHE.from(this)
    this.#root.setTemplate(await templatePromise)
    this.#render()
}
```

## Event dispatch from a component

```js
// Prefer dispatching from the host element, not from an internal shadow node
JJHE.from(this).triggerCustomEvent('item-selected', { id: this.#id })
// JJ default: bubbles: true, composed: true → crosses shadow boundary to parent
```

## Browser references
- CustomElementRegistry.define: https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry/define
- CustomElementRegistry.whenDefined: https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry/whenDefined
- Using shadow DOM: https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_shadow_DOM
