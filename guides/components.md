# Components Guide

JJ complements the native Custom Elements API rather than replacing it. You still use lifecycle callbacks, Shadow DOM, and attributes — JJ removes boilerplate around setup, resource loading, and DOM access.

**Browser references:**

- [Custom elements lifecycle](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements)
- [Shadow DOM](https://developer.mozilla.org/en-US/docs/Web/API/ShadowRoot)
- [Constructable Stylesheets](https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleSheet/CSSStyleSheet)
- [CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent)

## Shadow DOM or light DOM?

The first decision for any custom element is whether to use **shadow DOM** or **light DOM**.

|                 | Shadow DOM                                                | Light DOM                                             |
| --------------- | --------------------------------------------------------- | ----------------------------------------------------- |
| CSS scoping     | Styles are isolated from the page                         | Styles are shared with the page                       |
| Slot content    | Uses `<slot>` elements                                    | Children are direct DOM children                      |
| Global CSS vars | Must be explicitly imported via constructable stylesheets | Inherited automatically                               |
| Querying        | Query from shadow root wrapper                            | Works with regular document queries                   |
| When to use     | Self-contained widgets, design-system components          | Page-level sections, content that needs global styles |

Most standalone UI components (buttons, cards, dialogs) benefit from shadow DOM. Page-level layout sections typically use light DOM.

## JJ helpers that complement native APIs

- `defineComponent(name, constructor, options?)` — registers the element and returns a `Promise<boolean>`.
- `attr2prop(instance, name, oldValue, newValue)` — bridges attribute changes to property setters.
- `fetchTemplate(url)` — fetches an HTML file and returns a `DocumentFragment` promise.
- `fetchStyle(url)` — fetches a CSS file and returns a `CSSStyleSheet` promise.
- `JJHE.from(this).setShadow(mode, template, ...styles)` — attaches shadow root, clones template, adopts stylesheets.

## Recommended structure

Keep concerns separated across three files per component:

- `my-component.js` — class extending `HTMLElement`, behavior, event wiring.
- `my-component.html` — template markup loaded into shadow DOM.
- `my-component.css` — styles loaded as a constructable stylesheet.

Keep template and stylesheet loading promises at module scope — they load once and are reused across all instances.

## Component lifecycle

Custom elements have four lifecycle callbacks. Understanding their order is critical.

### 1. `constructor()`

Runs when an instance is created. **Do not access or manipulate the DOM here.** The element may not be connected yet and has no shadow root.

Appropriate uses:

- Declare private fields.
- Set default property values.

```js
class MyCounter extends HTMLElement {
    #count = 0 // private state
    #root = null // shadow root wrapper, assigned in connectedCallback
}
```

### 2. `connectedCallback()`

Runs when the element is inserted into the document. Set up your shadow root, wire events, and render here.

```js
async connectedCallback() {
    if (this.#root) return  // guard: prevent re-running on reconnect
    this.#root = JJHE.from(this).setShadow('open', await templatePromise, await stylePromise)
    this.#render()
}
```

**Guard pattern**: The `if (this.#root) return` check is important. When an element is disconnected and reconnected (e.g. via `document.body.append(el)`), `connectedCallback` fires again. Without the guard, the shadow root would be recreated on every reconnect.

### 3. `disconnectedCallback()`

Runs when the element is removed from the document. Remove external side effects.

```js
disconnectedCallback() {
    document.removeEventListener('keydown', this.#onKeydown)
    this.#resizeObserver?.disconnect()
}
```

Do not destroy the shadow root or clear internal state here — the element may be reconnected. Only detach things outside the element (document listeners, timers, observers).

### 4. `attributeChangedCallback(name, oldValue, newValue)`

Runs when a watched attribute changes. **This fires _before_ `connectedCallback`** for attributes present in the HTML at parse time. Your shadow root will not exist yet when this fires during initial parse.

```js
static observedAttributes = ['label', 'disabled']

attributeChangedCallback(name, oldValue, newValue) {
    attr2prop(this, name, oldValue, newValue)
}
```

Only attributes listed in `static observedAttributes` trigger this callback — others are silently ignored.

## Setting up shadow DOM

### Basic pattern

```js
import { attr2prop, defineComponent, fetchStyle, fetchTemplate, JJHE } from 'jj'

// Load once at module scope — reused for every instance
const templatePromise = fetchTemplate(import.meta.resolve('./my-card.html'))
const stylePromise = fetchStyle(import.meta.resolve('./my-card.css'))

export class MyCard extends HTMLElement {
    static observedAttributes = ['title']
    static defined = defineComponent('my-card', MyCard)

    #title = 'Untitled'
    #root = null

    attributeChangedCallback(name, oldValue, newValue) {
        attr2prop(this, name, oldValue, newValue)
    }

    get title() {
        return this.#title
    }

    set title(value) {
        this.#title = String(value ?? '')
        // Only render if shadow root exists — connectedCallback will render on first connect
        if (this.#root) this.#render()
    }

    async connectedCallback() {
        if (this.#root) return
        this.#root = JJHE.from(this).setShadow('open', await templatePromise, await stylePromise)
        this.#render()
    }

    #render() {
        this.#root?.find('[data-role="title"]')?.setText(this.#title)
    }
}
```

### Shadow mode: `open` vs `closed`

- `'open'` — external code can access the shadow root via `element.shadowRoot`. Enables developer tools, testing frameworks, and accessibility tooling.
- `'closed'` — `element.shadowRoot` returns `null` externally. Stricter encapsulation but makes testing and debugging harder.

Prefer `'open'` for most components. The encapsulation benefit of `'closed'` is rarely worth the developer experience cost.

### Multiple stylesheets

Pass additional stylesheets to share global CSS variables:

```js
// Load all at module scope
const sharedVarsPromise = fetchStyle(import.meta.resolve('../../shared/variables.css'))
const componentStylePromise = fetchStyle(import.meta.resolve('./my-card.css'))

// In connectedCallback:
this.#root = JJHE.from(this).setShadow(
    'open',
    await templatePromise,
    await sharedVarsPromise,
    await componentStylePromise,
)
```

Constructable stylesheets produced by `fetchStyle` are _adopted_ by multiple shadow roots — the browser shares the same parsed `CSSStyleSheet` object without duplicating CSS text. This is more efficient than `<link rel="stylesheet">` per instance.

## Setting up light DOM

For components that inherit the page's styles, clone a template into the element directly:

```js
const templatePromise = fetchTemplate(import.meta.resolve('./my-section.html'))

export class MySection extends HTMLElement {
    static defined = defineComponent('my-section', MySection)

    #initialized = false

    async connectedCallback() {
        if (this.#initialized) return
        this.#initialized = true
        JJHE.from(this).setTemplate(await templatePromise)
        this.#wireEvents()
    }
}
```

`setTemplate()` replaces the element's children with a clone of the template. It is equivalent to `empty().addTemplate()` in one call.

## Attribute to property bridge

The `attr2prop` helper converts HTML attribute names to camelCase and calls the matching setter.

```js
static observedAttributes = ['user-name', 'is-admin']

attributeChangedCallback(name, oldValue, newValue) {
    attr2prop(this, name, oldValue, newValue)
}
```

This calls `this.userName = newValue` and `this.isAdmin = newValue`. Implement matching setters:

```js
set userName(value) {
    this.#userName = String(value ?? '')
    if (this.#root) this.#render()
}

set isAdmin(value) {
    // HTML attributes are always strings — coerce to boolean
    this.#isAdmin = value !== null && value !== 'false'
    if (this.#root) this.#render()
}
```

**Always coerce types in setters.** HTML attributes are strings. If your property expects a number, convert it with `Number(value)`. If it expects a boolean, treat `null` (attribute removed) as `false`.

## Querying inside shadow DOM

After setup, query elements from your `#root` wrapper:

```js
#render() {
    const root = this.#root
    if (!root) return

    root.find('[data-role="title"]')?.setText(this.#title)
    root.find('[data-role="count"]')?.setText(String(this.#count))
    root.find('[data-role="action"]')?.setClasses({ 'is-disabled': this.#count >= this.#max })
}
```

Never query `document` for elements inside your shadow root — always query from `this.#root`.

## Events in components

### Events escaping the shadow boundary

Native UI events (`click`, `input`, `change`) are **composed** — they bubble out of the shadow root and are retargeted to the host element when observed outside.

Custom events **stop at the shadow boundary by default**. JJ's `customEvent()` helper sets `composed: true` by default, making it ready for cross-boundary communication:

```js
// Rises above the shadow boundary (JJ default: composed: true)
this.dispatchEvent(customEvent('counter-changed', { value: this.#count }))
```

Override when the event should stay internal:

```js
// Internal-only event — does not escape the shadow root
this.#root?.find('button')?.ref.dispatchEvent(new CustomEvent('_internal-toggle', { bubbles: true, composed: false }))
```

### Reacting to outside triggers

Events dispatched on `document` do not automatically propagate into shadow trees. When you want to trigger behavior inside the component from outside, listen on the host element:

```js
#onThemeChanged = (event) => {
    this.#root?.find('.icon')?.setStyle('color', event.detail.accent)
}

connectedCallback() {
    // ...setup...
    this.addEventListener('theme-changed', this.#onThemeChanged)
}

disconnectedCallback() {
    this.removeEventListener('theme-changed', this.#onThemeChanged)
}
```

Then external code can target the host directly:

```js
const card = document.querySelector('my-card')
card?.dispatchEvent(customEvent('theme-changed', { accent: 'var(--accent)' }))
```

→ See [events guide](./events.md) for a full breakdown of shadow DOM event boundaries.

## Component readiness

`defineComponent()` returns a `Promise<boolean>` that resolves after the element is registered:

- `false` when newly registered by that call.
- `true` when already registered with the same constructor.

```js
export class MyCard extends HTMLElement {
    static defined = defineComponent('my-card', MyCard)
}
```

Callers await readiness before using the element:

```js
import { MyCard } from './my-card.js'

await MyCard.defined
const card = JJHE.create('my-card')
```

Wait for multiple components in parallel:

```js
await Promise.all([HeaderBar.defined, MyCard.defined, FooterBar.defined])
```

## Full worked example

A complete `<user-card>` component with attributes, shadow DOM, events, and lifecycle cleanup:

```js
// user-card.js
import { attr2prop, customEvent, defineComponent, fetchStyle, fetchTemplate, JJHE } from 'jj'

const templatePromise = fetchTemplate(import.meta.resolve('./user-card.html'))
const stylePromise = fetchStyle(import.meta.resolve('./user-card.css'))

export class UserCard extends HTMLElement {
    static observedAttributes = ['name', 'role']
    static defined = defineComponent('user-card', UserCard)

    #name = ''
    #role = ''
    #root = null

    attributeChangedCallback(name, oldValue, newValue) {
        attr2prop(this, name, oldValue, newValue)
    }

    get name() {
        return this.#name
    }
    set name(value) {
        this.#name = String(value ?? '')
        if (this.#root) this.#render()
    }

    get role() {
        return this.#role
    }
    set role(value) {
        this.#role = String(value ?? '')
        if (this.#root) this.#render()
    }

    async connectedCallback() {
        if (this.#root) return
        this.#root = JJHE.from(this).setShadow('open', await templatePromise, await stylePromise)
        this.#root.find('[data-action="contact"]')?.on('click', this.#onContactClick)
        this.#render()
    }

    disconnectedCallback() {
        // external listeners would be removed here
    }

    #render() {
        this.#root?.find('[data-role="name"]')?.setText(this.#name)
        this.#root?.find('[data-role="role"]')?.setText(this.#role)
    }

    #onContactClick = () => {
        this.dispatchEvent(customEvent('user-contact', { name: this.#name }))
    }
}
```

```html
<!-- user-card.html -->
<article class="user-card">
    <p data-role="name"></p>
    <p data-role="role"></p>
    <button data-action="contact">Contact</button>
</article>
```

```html
<!-- page.html -->
<user-card name="Alice" role="Engineer"></user-card>
```

```js
// page.js
import { JJD } from 'jj'
import { UserCard } from './user-card.js'

await UserCard.defined

const doc = JJD.from(document)
doc.find('user-card')?.on('user-contact', (event) => {
    console.log('Contact clicked for', event.detail.name)
})
```

## Continue Reading

- [events guide](./events.md) — shadow boundary event rules and cross-boundary communication.
- [structure guide](./structure.md) — file organization conventions.
- [tutorial: custom components](../www/tutorial/custom-components.md) — step-by-step walkthrough.
