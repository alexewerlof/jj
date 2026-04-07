# Custom Components

JJ complements native Web Components instead of replacing them.

You still use browser lifecycle callbacks, Shadow DOM, and attributes. JJ removes repetition around setup.

- MDN custom elements: https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements
- MDN Shadow DOM: https://developer.mozilla.org/en-US/docs/Web/API/Element/attachShadow

## Core JJ helpers for components

- defineComponent(name, constructor, options?)
- fetchTemplate(url)
- fetchStyle(url)
- attr2prop(instance, name, oldValue, newValue)
- JJHE.from(this).setShadow(mode)
- JJHE.from(this).initShadow(template, ...styles)

## Baseline pattern

```js
import { attr2prop, defineComponent, fetchStyle, fetchTemplate, JJHE } from 'jj'

const templatePromise = fetchTemplate(import.meta.resolve('./my-card.html'))
const stylePromise = fetchStyle(import.meta.resolve('./my-card.css'))

export class MyCard extends HTMLElement {
    static observedAttributes = ['title']
    static defined = defineComponent('my-card', MyCard)

    #title = 'Untitled'
    #isInitialized = false
    #root = null

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
        if (this.#isInitialized) return
        JJHE.from(this).initShadow(await templatePromise, await stylePromise)
        this.#isInitialized = true
        this.#render()
    }

    #render() {
        this.#root?.find('[data-role="title"]')?.setText(this.#title)
    }
}
```

## Why static defined matters

defineComponent resolves Promise<boolean>:

- false when the component is newly defined by that call
- true when the same constructor was already defined

This makes startup timing explicit and avoids flaky upgrades.

```js
await MyCard.defined
```

For multiple components:

```js
await Promise.all([CardA.defined, CardB.defined, CardC.defined])
```

## Lifecycle mapping

- constructor: initialize local fields and attach/store the root wrapper
- connectedCallback: initialize shadow contents once, wire events, render
- disconnectedCallback: cleanup timers/listeners/observers
- attributeChangedCallback: bridge attributes to properties with attr2prop

More lifecycle details:

- https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#custom_element_lifecycle_callbacks

## Event boundaries

Shadow DOM does not block all events, but boundary rules matter.

- Native UI events like click are commonly composed and can cross boundaries.
- Custom events are not composed by default in native CustomEvent.
- JJ customEvent defaults to bubbles=true and composed=true for component communication.

Deep dive: [events guide](../../guides/events.md).

# Event handling

Sometimes you want to register event handlers on the DOM elements inside a component. You can do this in the `connectedCallback` after initializing the shadow DOM.

You don't need to remove those listeners in `disconnectedCallback` because when the component is garbage collected, the listeners will be gone too.

## Keep going

1. Read [wrapper mental model](./?file=wrapper-mental-model.md).
2. Then read [components guide](../../guides/components.md) for advanced architecture patterns.
