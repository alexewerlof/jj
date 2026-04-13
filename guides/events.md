# Shadow DOM events for React/Vue/Svelte developers

If you come from React, Vue, or Svelte, it’s easy to assume Shadow DOM “blocks events” the same way it scopes CSS. It doesn’t. Events still fire; they just follow **shadow boundary rules** about **composed paths** and **retargeting**.

This guide explains how events **leave** a Shadow DOM, how they **do not enter** by default, and how that differs from framework event models.

> [!IMPORTANT]
> This guide is mostly about components that call `attachShadow()`.
>
> If your custom element uses **light DOM** (no shadow root), you do **not** have a shadow boundary. In that case, event flow is regular DOM flow, and you usually do not need special event plumbing just because it is a custom element.
>
> MDN references:
>
> - [`Event.composed`](https://developer.mozilla.org/en-US/docs/Web/API/Event/composed): crossing behavior is specifically about crossing shadow DOM boundaries.
> - `Event()` constructor defaults `bubbles` and `composed` to `false` for synthetic events unless you set them.

---

## Mental model

- **CSS scoping** is strict: selectors don’t cross the boundary.
- **Event scoping** is conditional: events can cross the boundary if they are **composed**.
- **Retargeting** hides internal nodes from outside listeners by changing `event.target` to the host.

### Key terms

- **Bubbling:** event flows upward from target to ancestors.
- **Composed:** event is allowed to cross the shadow boundary.
- **Retargeting:** event’s `target` is rewritten to the host when observed outside.

---

## What _does_ escape Shadow DOM?

Most **native UI events** are composed by default and will escape the shadow root:

- `click`
- `input`
- `change`
- `keydown` / `keyup`
- `pointerdown` / `pointerup`

These will bubble to the host and beyond.

### Example: native event escaping the shadow root

```js
class XCounter extends HTMLElement {
    async connectedCallback() {
        this.attachShadow({ mode: 'open' }).innerHTML = `
            <button id="inc">+</button>
        `

        this.shadowRoot.querySelector('#inc').addEventListener('click', () => {
            // click is composed by default
            console.log('clicked inside shadow')
        })
    }
}

customElements.define('x-counter', XCounter)

document.addEventListener('click', (event) => {
    console.log('global click target:', event.target) // retargeted to <x-counter>
})
```

---

## What does _not_ escape by default?

**Custom events are not composed by default.** That means they **stop at the shadow boundary** unless you opt in.

### Example: custom event that does **not** escape

```js
const event = new CustomEvent('todo-toggle', {
    detail: { id: '123' },
    bubbles: true,
    composed: false, // default
})

element.dispatchEvent(event)
// Outside the shadow root, listeners will NOT see this event.
```

### Example: custom event that **does** escape

```js
const event = new CustomEvent('todo-toggle', {
    detail: { id: '123' },
    bubbles: true,
    composed: true,
})

element.dispatchEvent(event)
// Outside the shadow root, listeners can see it.
```

---

## Can events go _into_ the Shadow DOM?

Not automatically.

Events originating **outside** the shadow tree do **not** traverse into it. The shadow root is not part of the composed path for events that originate outside.

### How to react inside Shadow DOM to outside events

- **Listen on the host**, then forward inside if needed.
- Or, expose an explicit method on the element and call it.

### Method 1: direct function call on the custom element

```js
class XPanel extends HTMLElement {
    connectedCallback() {
        this.attachShadow({ mode: 'open' }).innerHTML = `<button id="inner">Inner</button>`
    }

    highlight() {
        this.shadowRoot.querySelector('#inner')?.classList.add('highlight')
    }
}

customElements.define('x-panel', XPanel)

const panel = document.querySelector('x-panel')
panel?.highlight()
```

This is exactly the pattern you described: parent code gets a reference to the host element instance, then calls a public method.

### Method 2: add/remove listener on the host, then dispatch to that host

```js
class XPanel extends HTMLElement {
    #onHighlightRequest = () => {
        this.highlight()
    }

    connectedCallback() {
        this.attachShadow({ mode: 'open' }).innerHTML = `<button id="inner">Inner</button>`

        // Listen on the host element itself.
        this.addEventListener('panel:highlight', this.#onHighlightRequest)
    }

    disconnectedCallback() {
        // Remove listeners when detached.
        this.removeEventListener('panel:highlight', this.#onHighlightRequest)
    }

    highlight() {
        this.shadowRoot.querySelector('#inner')?.classList.add('highlight')
    }
}

customElements.define('x-panel', XPanel)

const panel = document.querySelector('x-panel')
panel?.dispatchEvent(new CustomEvent('panel:highlight'))
```

Important detail: `HTMLElement` is an `EventTarget`, so `this.addEventListener(...)` on the element instance works exactly as expected. But the event must target that element (or bubble through its ancestor chain). A `dispatchEvent()` on `document` does not automatically jump into every shadow tree.

If you want a broadcast-style trigger from document-level code, forward it explicitly:

```js
document.addEventListener('panel:highlight-all', () => {
    for (const panel of document.querySelectorAll('x-panel')) {
        panel.dispatchEvent(new CustomEvent('panel:highlight'))
    }
})
```

---

## How this compares to React, Vue, Svelte

### React

- React uses **synthetic events** that bubble through the React tree.
- Shadow DOM retargeting means React sees the host as the target.
- You need **composed custom events** or explicit methods for communication.

**Think:** “I need to opt in to cross the boundary.”

### Vue

- Vue’s event modifiers (e.g. `@click.stop`) are **not shadow-aware**.
- Native DOM events still work, but **retargeting** hides inner nodes.

**Think:** “The event still fires, but the target is the host.”

### Svelte

- Svelte’s component events are **not DOM events**.
- If you want outside listeners to catch events from Shadow DOM, use **composed CustomEvent**.

**Think:** “Dispatch real DOM events with composed + bubbles.”

---

## Propagation control

These three standard methods work the same in shadow DOM as in any other DOM context:

- [`event.preventDefault()`](https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault): cancels the default browser action (e.g. form submit, link navigation). No shadow-specific behavior.
- [`event.stopPropagation()`](https://developer.mozilla.org/en-US/docs/Web/API/Event/stopPropagation): stops the event from bubbling further **within the current tree**. For a `composed` event inside a shadow root, this stops it bubbling within the shadow but does **not** prevent it from appearing outside — `composed` events are already part of the outer composed path at the time of dispatch. To halt propagation in the outer document, call it on a listener attached to the shadow host instead.
- [`event.stopImmediatePropagation()`](https://developer.mozilla.org/en-US/docs/Web/API/Event/stopImmediatePropagation): like `stopPropagation()`, but also prevents other listeners on the **same element** from firing.

---

## Quick reference

- **Using light DOM custom elements (no `attachShadow()`)?**
    - Treat events like normal DOM events.
    - You generally do not need `composed: true` just because it is a custom element.
- **Need to notify outside listeners?**
    - Native DOM: use `new CustomEvent(..., { bubbles: true, composed: true })`.
    - JJ: use `triggerCustomEvent(name, detail)`.
- **Need to listen inside shadow from outside?**
    - Listen on the host and forward, or expose a method.
- **Why is `event.target` the host?**
    - Retargeting hides internal implementation details.

---

## JJ event defaults

JJ wrappers provide `triggerCustomEvent()` with defaults `bubbles: true` and `composed: true`.

That differs from the native `CustomEvent` constructor, which defaults both to `false`.

### Example: JJ wrapper with default cross-boundary behavior

```js
import { JJHE } from 'jj'

JJHE.from(element).triggerCustomEvent('todo-toggle', {
    id: '123',
    done: true,
})
```

### Example: local-only event

```js
element.dispatchEvent(new CustomEvent('panel-ready', { bubbles: false, composed: false }))
```

---

## JJ-flavored example

Even with jj, it’s still the same DOM rules.

```js
// Inside a custom element class
this.dispatchEvent(
    new CustomEvent('todo-toggle', { detail: { id: this.itemId, done: true }, bubbles: true, composed: true }),
)
```

If you prefer jj wrappers, you can trigger on the host wrapper instead:

```js
import { JJHE } from 'jj'

JJHE.from(this).triggerCustomEvent('todo-toggle', {
    id: this.itemId,
    done: true,
})
```

---

## References (MDN)

- [Event: composed property](https://developer.mozilla.org/en-US/docs/Web/API/Event/composed)
- [Event: Event() constructor](https://developer.mozilla.org/en-US/docs/Web/API/Event/Event)
- [Event: composedPath()](https://developer.mozilla.org/en-US/docs/Web/API/Event/composedPath)
- [Using shadow DOM](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_shadow_DOM)
