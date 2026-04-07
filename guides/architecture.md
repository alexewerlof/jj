# Architecture Guide

JJ complements browser capabilities for static and interactive applications. This guide focuses on platform-level architecture decisions and common patterns for structuring JJ-based apps.

## JJ's role in an application

JJ does not own your application structure. It handles DOM setup, wiring, and updates. You own the structure around it:

- **State**: plain JS objects, class fields, or a store library.
- **Routing**: the browser History API.
- **Animation**: the Web Animations API or a dedicated library.
- **Networking**: `fetch`, `WebSocket`, or a dedicated API client.

JJ is the sugar layer on top of what the platform provides out of the box without getting in your way.

## Module-scoped state

The simplest pattern: keep state in a plain object at module scope, update it in handlers, and render intentionally.

```js
import { JJD, JJHE } from 'jj'

const doc = JJD.from(document)
const state = { count: 0 }

const counter = doc.find('#counter', true)

function render() {
    counter.setText(String(state.count))
}

doc.find('#increment-btn', true).on('click', () => {
    state.count++
    render()
})

doc.find('#decrement-btn', true).on('click', () => {
    state.count--
    render()
})

render()
```

There is no magic here — just an explicit state object, an explicit render call, and event listeners. This is easy to follow in a debugger and easy to test.

## Component-scoped state

For encapsulated UI components, keep state as private class fields:

```js
class TodoItem extends HTMLElement {
    #done = false
    #root = null
    #isInitialized = false

    constructor() {
        super()
        this.#root = JJHE.from(this).setShadow('open').getShadow(true)
    }

    set done(value) {
        this.#done = Boolean(value)
        if (this.#root) this.#render()
    }

    connectedCallback() {
        // Guard against re-initialisation: connectedCallback fires on every
        // DOM insertion, including moves via insertBefore/appendChild.
        // See the component lifecycle events guide for full details.
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

    #render() {
        this.#root?.find('#checkbox')?.setAttr('checked', this.#done ? '' : null)
        this.#root?.find('#status')?.setText(this.#done ? 'Done' : 'Pending')
    }
}
```

Each component owns its own state and renders on change. No central store required for simple cases.

## Component communication patterns

### Child → Parent: custom events

The standard pattern for components to notify their parent is a composed custom event:

```js
// Inside a component
this.dispatchEvent(customEvent('item-selected', { id: this.#id }))

// In the parent
doc.find('item-list', true).on('item-selected', (event) => {
    handleSelection(event.detail.id)
})
```

JJ's `customEvent()` defaults to `bubbles: true, composed: true` — the event rises through shadow boundaries and bubbles to the document.

### Parent → Child: direct method call or property set

To push data _into_ a component, set a property directly:

```js
const card = doc.find('user-card', true)
card.ref.name = 'Alice' // triggers the setter, which re-renders
```

Or, if your component exposes an HTML attribute, set it:

```js
card.setAttr('name', 'Alice') // triggers attributeChangedCallback → setter → render
```

### Sibling communication: shared module state or events

For sibling components that need to share state, use either a shared module or document-level events:

**Shared module:**

```js
// store.js
export const store = { selectedId: null }
export const listeners = new Set()

export function select(id) {
    store.selectedId = id
    listeners.forEach((fn) => fn(store))
}
```

```js
// component-a.js
import { store, select, listeners } from './store.js'

class ComponentA extends HTMLElement {
    async connectedCallback() {
        listeners.add(this.#onStoreChange)
        this.#render()
    }

    disconnectedCallback() {
        listeners.delete(this.#onStoreChange)
    }

    #onStoreChange = (state) => this.#render()
}
```

**Document-level event:**

```js
// Emit from anywhere
document.dispatchEvent(customEvent('filter-changed', { query: 'hello' }))

// Listen in any component
connectedCallback() {
    document.addEventListener('filter-changed', this.#onFilterChanged)
}
disconnectedCallback() {
    document.removeEventListener('filter-changed', this.#onFilterChanged)
}
```

Use events for loose coupling, and shared modules when the state relationship is tightly defined.

## Routing

JJ does not implement routing. Use browser APIs directly.

- [History API](https://developer.mozilla.org/en-US/docs/Web/API/History_API)
- [URL API](https://developer.mozilla.org/en-US/docs/Web/API/URL)

A minimal SPA routing setup with JJ:

```js
import { JJD, JJHE } from 'jj'

const doc = JJD.from(document)
const outlet = doc.find('#outlet', true)

async function navigate(path) {
    // Update browser history
    history.pushState({}, '', path)

    // Load and render the view for this path
    const view = await loadView(path)
    outlet.setChild(view)
}

window.addEventListener('popstate', () => navigate(location.pathname))

// Wire navigation links
doc.findAll('[data-href]').forEach((link) => {
    link.on('click', (e) => {
        e.preventDefault()
        navigate(link.getDataAttr('href'))
    })
})
```

## Animation

JJ does not replace animation engines. Use native browser animation APIs.

- [Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API)
- [requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame)

Use JJ alongside animations:

```js
const card = doc.find('.card', true)

// JJ for setup
card.addClass('is-flipping')

// Native API for the animation itself
card.ref
    .animate([{ transform: 'rotateY(0deg)' }, { transform: 'rotateY(180deg)' }], {
        duration: 400,
        easing: 'ease-in-out',
    })
    .finished.then(() => {
        card.rmClass('is-flipping')
    })
```

## Resource loading strategy

Use native `<link>` elements for preload and prefetch hints:

```js
import { JJHE } from 'jj'

const h = JJHE.tree

// Hint that this style is needed in the current page lifecycle
document.head.append(h('link', { href: '/components/my-component.css', rel: 'preload', as: 'style' }).ref)

// Hint for likely future navigation
document.head.append(h('link', { href: '/next-page.css', rel: 'prefetch', as: 'style' }).ref)
```

- Use `preload` for resources needed during the current lifetime of the page.
- Use `prefetch` for probable future navigation.
- See the [performance guide](./performance.md) for practical patterns.

## Static vs interactive apps

- **Static pages**: use JJ for progressive enhancement, component initialization, and small interaction islands.
- **Interactive apps**: use JJ wrappers as a deterministic DOM layer with explicit event/state control.

JJ scales from a few interactive components on a server-rendered page to a fully client-side SPA.

## Browser extensions

JJ can be used in extension UIs (popup pages, options pages, extension-hosted views) because it is a DOM wrapper layer and requires no framework runtime.

- [MDN WebExtensions](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)

## Related

- [styling guide](./styling.md)
- [events guide](./events.md)
- [component lifecycle events](./component-lifecycle-events.md)
- [tutorial state and events](../www/tutorial/state-and-events.md)
