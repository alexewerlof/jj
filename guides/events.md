# Shadow DOM events for React/Vue/Svelte developers

If you come from React, Vue, or Svelte, it’s easy to assume Shadow DOM “blocks events” the same way it scopes CSS. It doesn’t. Events still fire; they just follow **shadow boundary rules** about **composed paths** and **retargeting**.

This guide explains how events **leave** a Shadow DOM, how they **do not enter** by default, and how that differs from framework event models.

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

### Example: forward from host to internal node

```js
class XPanel extends HTMLElement {
    connectedCallback() {
        this.attachShadow({ mode: 'open' }).innerHTML = `<button id="inner">Inner</button>`
    }

    highlight() {
        this.shadowRoot.querySelector('#inner')?.classList.add('highlight')
    }
}
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

## Quick reference

- **Need to notify outside listeners?**
    - Use `new CustomEvent(..., { bubbles: true, composed: true })`.
- **Need to listen inside shadow from outside?**
    - Listen on the host and forward, or expose a method.
- **Why is `event.target` the host?**
    - Retargeting hides internal implementation details.

---

## JJ-flavored example

Even with jj, it’s still the same DOM rules.

```js
// Inside a custom element class
this.dispatchEvent(
    new CustomEvent('todo-toggle', {
        detail: { id: this.itemId, done: true },
        bubbles: true,
        composed: true,
    }),
)
```

If you prefer jj wrappers, you can trigger on the host wrapper instead:

```js
import { JJHE } from 'jj'

JJHE.from(this).trigger(
    new CustomEvent('todo-toggle', {
        detail: { id: this.itemId, done: true },
        bubbles: true,
        composed: true,
    }),
)
```
