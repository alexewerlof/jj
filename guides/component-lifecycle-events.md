# Component Lifecycle Events

Custom elements expose a set of lifecycle callbacks the browser calls automatically as the element moves through the document. Understanding when each callback fires — and in what order — is essential for writing correct, efficient components.

## The five callbacks

```js
class MyCustomElement extends HTMLElement {
    static observedAttributes = ['color', 'size']

    constructor() {
        // Always call super first
        super()
    }

    connectedCallback() {
        console.log('Custom element added to page.')
    }

    disconnectedCallback() {
        console.log('Custom element removed from page.')
    }

    connectedMoveCallback() {
        console.log('Custom element moved with moveBefore()')
    }

    adoptedCallback() {
        console.log('Custom element moved to new document.')
    }

    attributeChangedCallback(name, oldValue, newValue) {
        console.log(`Attribute ${name} changed.`)
    }
}

customElements.define('my-custom-element', MyCustomElement)
```

### `connectedCallback()`

Called every time the element is inserted into a document-connected subtree. This is the right place to read attributes, set up shadow DOM, fetch resources, and attach event listeners. Avoid doing heavy work in the `constructor()` — attributes are not reliably available there.

### `disconnectedCallback()`

Called every time the element leaves a connected subtree. Use it to cancel pending fetches, remove global event listeners, and otherwise clean up resources that would otherwise leak.

### `attributeChangedCallback(name, oldValue, newValue)`

Called when any attribute listed in `static observedAttributes` is added, changed, or removed. It also fires for the initial value when the element is first parsed.

### `adoptedCallback()`

Called when the element is moved to a different `Document` — typically via `document.adoptNode()` after pulling a node out of an `<iframe>` or a detached document. Rare in practice, but useful for cleaning up document-specific references.

### `connectedMoveCallback()` _(modern browsers)_

When this method is defined, the browser calls it **instead of** the `disconnectedCallback` + `connectedCallback` pair whenever the element is repositioned in the same document via [`Element.moveBefore()`](https://developer.mozilla.org/en-US/docs/Web/API/Element/moveBefore). The element stays connected throughout, so the normal connect/disconnect side-effects do not run.

If you define `connectedMoveCallback()` but the caller uses `insertBefore()` or `appendChild()` rather than `moveBefore()`, the standard `disconnected` + `connected` pair still fires.

---

## Why `connectedCallback()` can fire more than once

This is the source of a subtle but common bug. Moving an element via `insertBefore()`, `appendChild()`, `replaceChild()`, or any other standard DOM method that removes-then-reinserts:

1. Fires `disconnectedCallback()` on the old position
2. Fires `connectedCallback()` on the new position

There is no DOM-move API (short of `moveBefore()`) that avoids this. So any setup code inside `connectedCallback()` can run multiple times on the same element instance if it is ever reparented.

## The idempotency guard

The pattern used in the [architecture guide](./architecture.md) protects against double-initialisation:

```js
connectedCallback() {
    if (!this.#isInitialized) {
        this.#root.init(
            JJHE.tree('div', null,
                JJHE.tree('input', { id: 'checkbox', type: 'checkbox' }),
                JJHE.tree('label', { for: 'checkbox' }, 'Task'),
                JJHE.tree('div', { id: 'status' }),
            ),
        )
        this.#isInitialized = true
    }
    this.#render()
}
```

Without the guard, a second call after the element is moved would:

- Re-create the shadow root, destroying all live references held by `#root`
- Re-append the entire DOM tree to a brand new shadow root, discarding any live element state (focus, scroll position, input values)

The async variant — where `connectedCallback` `await`s `fetchTemplate()` or `fetchStyle()` — has an even sharper edge: two concurrent invocations can race to overwrite `#root`, each repeating the network requests.

The `if (this.#root) return` makes initialisation a one-time operation regardless of how many times `connectedCallback` is called. The setter and `#render()` method remain fully usable after that because they check `this.#root` before acting:

```js
set done(value) {
    this.#done = Boolean(value)
    if (this.#root) this.#render()  // safe to call any time
}
```

## The modern alternative: `connectedMoveCallback()`

If you need to react to moves without running init/cleanup code, define the callback:

```js
class TodoItem extends HTMLElement {
    #done = false
    #root = null
    #isInitialized = false

    constructor() {
        super()
        this.#root = JJHE.from(this).setShadow('open').getShadow(true)
    }

    connectedCallback() {
        if (!this.#isInitialized) {
            this.#root.init(
                JJHE.tree(
                    'div',
                    null,
                    JJHE.tree('input', { id: 'checkbox', type: 'checkbox' }),
                    JJHE.tree('label', { for: 'checkbox' }, 'Task'),
                    JJHE.tree('div', { id: 'status' }),
                ),
            )
            this.#isInitialized = true
        }
        this.#render()
    }

    disconnectedCallback() {
        // teardown
    }

    connectedMoveCallback() {
        // called by moveBefore() instead of the pair above —
        // #root is already initialised, so nothing needs to change
    }

    #render() {
        this.#root?.find('#checkbox')?.setAttr('checked', this.#done ? '' : null)
        this.#root?.find('#status')?.setText(this.#done ? 'Done' : 'Pending')
    }
}
```

An **empty** `connectedMoveCallback()` is enough to suppress the pair. The element stays initialised across the move because neither `disconnectedCallback` nor `connectedCallback` runs.

Callers must use `Element.moveBefore()` for this to take effect — other move APIs bypass the optimisation:

```js
// state-preserving move (fires connectedMoveCallback)
parent.moveBefore(todoItem, nextSibling)

// classic move (fires disconnected then connected)
parent.insertBefore(todoItem, nextSibling)
```

> **Browser support**: `moveBefore()` and `connectedMoveCallback()` are available in Chrome 133+ and Firefox 135+. Safari has not shipped support as of early 2026. Feature-detect before relying on it in production.

## Lifecycle order for common operations

| Operation                      | Callbacks fired (in order)                                                                   |
| ------------------------------ | -------------------------------------------------------------------------------------------- |
| Element parsed / inserted      | `connectedCallback`                                                                          |
| `el.remove()`                  | `disconnectedCallback`                                                                       |
| `parent.insertBefore(el, ref)` | `disconnectedCallback` → `connectedCallback`                                                 |
| `parent.moveBefore(el, ref)`   | `connectedMoveCallback` (if defined), otherwise `disconnectedCallback` → `connectedCallback` |
| `document.adoptNode(el)`       | `adoptedCallback` → `connectedCallback` (if the adopting doc is connected)                   |
| Observed attribute changed     | `attributeChangedCallback`                                                                   |

## Summary

- `connectedCallback` fires on every insertion, not just the first one.
- Use an initialisation guard (`if (this.#root) return`) to make setup code idempotent.
- Define `connectedMoveCallback()` (even empty) to opt into state-preserving moves via `moveBefore()`.
- `disconnectedCallback` is the right place for teardown; do not rely on `connectedCallback` skipping itself to avoid running teardown.

## Related

- [components guide](./components.md)
- [architecture guide](./architecture.md)
- [MDN: Using custom elements](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements)
- [MDN: Element.moveBefore()](https://developer.mozilla.org/en-US/docs/Web/API/Element/moveBefore)
