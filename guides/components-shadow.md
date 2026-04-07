# Shadow DOM Components

Shadow DOM components attach an isolated subtree to the host element via `attachShadow()`. Styles are scoped, IDs are safe to reuse, custom events are contained by default, and slot elements let callers project light DOM content into the component.

Use shadow DOM for self-contained UI widgets — buttons, cards, dialogs, date pickers — where isolation from the page is a feature, not a side effect.

**Browser references:**

- [Using shadow DOM](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_shadow_DOM)
- [ShadowRoot](https://developer.mozilla.org/en-US/docs/Web/API/ShadowRoot)
- [Constructable Stylesheets](https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleSheet/CSSStyleSheet)
- [Element: slot property](https://developer.mozilla.org/en-US/docs/Web/API/Element/slot)
- [HTMLSlotElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLSlotElement)

→ See [components guide](./components.md) for the lifecycle overview and `attr2prop` patterns that apply to both light DOM and shadow DOM.

---

## Initialization

Load templates and stylesheets at module scope so they are fetched once and shared across all instances. Attach the shadow root in the constructor, store `#root` immediately, and initialize its contents in `connectedCallback()`:

```js
import { attr2prop, defineComponent, fetchStyle, fetchTemplate, JJHE } from 'jj'

// Loaded once — reused for every instance
const templatePromise = fetchTemplate(import.meta.resolve('./my-card.html'))
const stylePromise = fetchStyle(import.meta.resolve('./my-card.css'))

export class MyCard extends HTMLElement {
    static observedAttributes = ['title']
    static defined = defineComponent('my-card', MyCard)

    #title = 'Untitled'
    #root = null
    #isInitialized = false

    constructor() {
        super()
        this.#root = JJHE.from(this).setShadow('open').getShadow(true)
    }

    attributeChangedCallback(name, oldValue, newValue) {
        attr2prop(this, name, oldValue, newValue)
    }

    get title() {
        return this.#title
    }
    set title(value) {
        this.#title = String(value ?? '')
        this.#render()
    }

    async connectedCallback() {
        if (!this.#isInitialized) {
            JJHE.from(this).initShadow(await templatePromise, await stylePromise)
            this.#isInitialized = true
        }
        this.#render()
    }

    #render() {
        this.#root?.find('[data-role="title"]')?.setText(this.#title)
    }
}
```

`setShadow(mode)` attaches the shadow root. `initShadow(template, ...styles)` clones the template fragment into that attached root and adopts the constructable stylesheets.

### Shadow mode: `open` vs `closed`

- `'open'` — `element.shadowRoot` is accessible externally. Required for dev tools, accessibility tooling, and most testing setups.
- `'closed'` — `element.shadowRoot` returns `null` to external code. Stronger encapsulation but breaks many developer experience tools.

Prefer `'open'` unless you have a specific security reason for `'closed'`.

---

## CSS isolation

Shadow DOM provides strict CSS isolation in both directions:

- **Page styles do not leak in.** Selectors from the page stylesheet cannot target elements inside the shadow root.
- **Component styles do not leak out.** Selectors in your component stylesheet cannot target page elements.

This means styles in your component template or constructable stylesheet stay completely local — you can use simple, short class names without risk of collision.

### Sharing CSS custom properties

CSS custom properties (variables) **do cross the shadow boundary**. A `var(--color-primary)` inside the shadow root resolves against the host element's computed value, which is ultimately inherited from `:root`. This is the recommended way to theme shadow DOM components without breaking isolation.

No extra setup is needed if the page already defines the variables on `:root`.

### Sharing stylesheets explicitly

When your component needs a specific shared stylesheet (a design-token file, a reset, etc.), load it as an additional constructable stylesheet:

```js
// Both loaded at module scope
const sharedVarsPromise = fetchStyle(import.meta.resolve('../../shared/variables.css'))
const componentStylePromise = fetchStyle(import.meta.resolve('./my-card.css'))

// In connectedCallback:
JJHE.from(this).initShadow(await templatePromise, await sharedVarsPromise, await componentStylePromise)
```

Constructable stylesheets are shared objects — the browser parses the CSS once and all shadow roots that adopt it reference the same `CSSStyleSheet`. This is more efficient than a `<link>` tag per instance.

---

## Querying by ID

Because each shadow root is its own isolated subtree, IDs inside the shadow do not conflict with IDs in the page document or other components. It is safe to use plain IDs for internal elements:

```html
<!-- my-card.html -->
<article>
    <h2 id="title"></h2>
    <p id="body"></p>
    <button id="action">Contact</button>
</article>
```

```js
#render() {
    this.#root?.find('#title')?.setText(this.#title)
    this.#root?.find('#body')?.setText(this.#body)
}
```

Always query from `this.#root`, never from `document`. Querying `document` would search the page tree, not the shadow tree.

---

## Events

### Events that escape the shadow boundary

Native UI events (`click`, `input`, `change`, `keydown`, `pointermove`, etc.) are composed by default. They bubble out of the shadow root and are **retargeted** to the host element when observed from outside — the listener sees `event.target === myCard`, not the internal button.

Custom events created with the bare `CustomEvent` constructor default to `composed: false` and stop at the shadow boundary. JJ's `customEvent()` factory sets `composed: true` by default, so events dispatched with it will cross the boundary:

```js
// Escapes the shadow root — listeners on the host or its ancestors will see it
this.dispatchEvent(customEvent('card-action', { id: this.#id }))

// Or fluently from the host wrapper:
JJHE.from(this).triggerCustomEvent('card-action', { id: this.#id })
```

Always dispatch public events from `this` (the host element), not from an internal shadow node. The host is the public API surface.

### Keeping events internal

Override `composed` to prevent an event from leaking outside:

```js
// Won't cross the shadow boundary — internal coordination only
this.#root?.find('#menu')?.ref.dispatchEvent(new CustomEvent('_menu-toggle', { bubbles: true, composed: false }))
```

Use a naming convention (e.g. a leading `_`) to distinguish internal events from the component's public API.

### Listening to events from the page

Events dispatched on `document`, `window`, or sibling elements **do not traverse into shadow trees**. To receive a broadcast from outside, attach a listener on the host element itself (`this`) or on a shared global like `document`, then act inside the shadow from there:

```js
// Listen on the host — accessible from outside without crossing the shadow
#onThemeChanged = (event) => {
    this.#root?.find('#icon')?.setStyle('color', event.detail.accent)
}

async connectedCallback() {
    if (this.#root) return
    // ...setup...
    this.addEventListener('theme-changed', this.#onThemeChanged)
}

disconnectedCallback() {
    this.removeEventListener('theme-changed', this.#onThemeChanged)
}
```

External code dispatches on the host directly:

```js
const card = document.querySelector('my-card')
card?.dispatchEvent(customEvent('theme-changed', { accent: 'var(--color-accent)' }))
```

For **global broadcasts** (not targeting a specific component instance), listen on `document` instead, and clean up in `disconnectedCallback` the same way.

---

## Slots

Slots let callers project their own light DOM content into named positions in the component's shadow template. This keeps the component's structure fixed while making specific regions user-customizable.

### Default slot

A `<slot>` with no name attribute is the **default slot**. It receives any light DOM child that is not assigned to a named slot:

```html
<!-- my-card.html -->
<article class="card">
    <div class="card__body">
        <slot></slot>
    </div>
</article>
```

```html
<!-- usage -->
<my-card>
    <p>This paragraph is projected into the default slot.</p>
</my-card>
```

### Named slots

Add a `name` attribute to a slot and a matching `slot` attribute on the child element:

```html
<!-- my-card.html -->
<article class="card">
    <header class="card__header">
        <slot name="header"></slot>
    </header>
    <div class="card__body">
        <slot></slot>
    </div>
    <footer class="card__footer">
        <slot name="footer"></slot>
    </footer>
</article>
```

```html
<!-- usage -->
<my-card>
    <h2 slot="header">Card Title</h2>
    <p>Main body content goes into the default slot.</p>
    <a slot="footer" href="/more">Read more</a>
</my-card>
```

The `slot` attribute value (`"header"`, `"footer"`) must match the `name` attribute on the `<slot>` element in the template.

### Slotted content and CSS

Slotted nodes remain in the **light DOM** — they are still children of the host in the document tree, merely rendered at the slot position. The shadow root's stylesheet does **not** automatically style them.

To style slotted content from inside the shadow stylesheet, use the `::slotted()` pseudo-element:

```css
/* my-card.css */
::slotted(h2) {
    font: var(--font-heading);
    margin: 0;
}

::slotted([slot='footer']) {
    font-size: var(--font-size-sm);
}
```

`::slotted()` only matches direct slotted children — it cannot reach descendants of a slotted element.

### Querying assigned nodes

To read or react to what the caller projected into a slot:

```js
const slot = this.#root?.find('slot[name="header"]')?.ref
const assigned = slot?.assignedNodes({ flatten: true }) ?? []
```

Use the `slotchange` event to react when the caller changes the projected content:

```js
this.#root?.find('slot[name="header"]')?.on('slotchange', (event) => {
    const nodes = event.target.assignedNodes({ flatten: true })
    console.log('header slot updated', nodes)
})
```

---

## Full worked example

A `<user-card>` component with attributes, shadow DOM, named slots, events, and lifecycle cleanup:

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
    #isInitialized = false

    constructor() {
        super()
        this.#root = JJHE.from(this).setShadow('open').getShadow(true)
    }

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
        if (!this.#isInitialized) {
            JJHE.from(this).initShadow(await templatePromise, await stylePromise)
            this.#root.find('#action')?.on('click', this.#onActionClick)
            this.#isInitialized = true
        }
        this.#render()
    }

    disconnectedCallback() {
        // Remove any document/window listeners registered in connectedCallback
        this.#root.find('#action')?.off('click', this.#onActionClick)
    }

    #render() {
        this.#root?.find('#name')?.setText(this.#name)
        this.#root?.find('#role')?.setText(this.#role)
    }

    #onActionClick = () => {
        // composed: true (JJ default) — escapes shadow boundary to parent listeners
        this.dispatchEvent(customEvent('user-contact', { name: this.#name }))
    }
}
```

```html
<!-- user-card.html -->
<article class="user-card">
    <header class="user-card__header">
        <slot name="avatar"></slot>
        <div>
            <p id="name"></p>
            <p id="role"></p>
        </div>
    </header>
    <div class="user-card__body">
        <slot></slot>
    </div>
    <footer class="user-card__footer">
        <button id="action">Contact</button>
        <slot name="actions"></slot>
    </footer>
</article>
```

```html
<!-- page.html -->
<user-card name="Alice" role="Engineer">
    <img slot="avatar" src="alice.jpg" alt="Alice" />
    <p>Platform team lead, 5 years tenure.</p>
    <a slot="actions" href="/profile/alice">View profile</a>
</user-card>
```

```js
// page.js
import { JJD } from 'jj'
import { UserCard } from './user-card.js'

await UserCard.defined

const doc = JJD.from(document)
doc.find('user-card')?.on('user-contact', (event) => {
    console.log('Contact requested for', event.detail.name)
})
```

---

## Continue reading

- [Components overview](./components.md) — lifecycle, `attr2prop`, and readiness patterns.
- [Light DOM components](./components-light.md) — patterns for components without a shadow root.
- [Events guide](./events.md) — full breakdown of shadow boundary event rules.
