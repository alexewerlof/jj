# Components

Web Components are a set of web platform APIs that allow you to create reusable, encapsulated custom elements. They consist of three main technologies:

1. **Custom Elements**: Define new HTML elements with custom behavior. Simply create a class that extends `HTMLElement` and register it with `customElements.define()`.
2. **The `<template>` element**: Define chunks of HTML that can be reused and instantiated in the DOM.
3. **Shadow DOM**: Encapsulate the internal structure and styles of an element, preventing them from being affected by the outside page and vice versa.

The last one is optional. In fact there are 3 ways to create a component:

| Method            | Description                                                                                                                                                 |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Light DOM         | The component's content is part of the regular DOM tree. No DOM, event, or style encapsulation (but this is how components in most popular libraries work). |
| Open Shadow DOM   | The component's content is encapsulated in a shadow root, but can be accessed via JavaScript.                                                               |
| Closed Shadow DOM | The component's content is encapsulated in a shadow root that cannot be accessed via JavaScript.                                                            |

Regardless of the method, the browser provides the following lifecycle callbacks on your class (you simply implement the ones you need):

| Callback                   | Description                                                                                                                                                                                                                                                                |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `constructor`              | Called when the element is created. Good for setting up initial state, attaching shadow DOM, etc.                                                                                                                                                                          |
| `connectedCallback`        | Called when the element is added to the DOM. Can run multiple times on the same instance (re-attach after removal, move between parents via remove+insert, or adopt into another document). Good for setup work like populating initial content or adding event listeners. |
| `disconnectedCallback`     | Called when the element is removed from the DOM. Good for cleanup work like removing event listeners or canceling timers.                                                                                                                                                  |
| `connectedMoveCallback`    | Called when the element is moved within the DOM. Less commonly used.                                                                                                                                                                                                       |
| `adoptedCallback`          | Called when the element is moved to a new document. Less commonly used.                                                                                                                                                                                                    |
| `attributeChangedCallback` | Called when one of the `observedAttributes` static array changes. Good for reacting to attribute changes.                                                                                                                                                                  |

## Conventions

To keep lifecycle logic predictable, use these conventions:

1. Use a `#isInitialized` flag to keep track of whether the component is initialized.
2. Keep a host wrapper in the constructor in `#jjHost`.
3. In `connectedCallback()`, initialize only when `#isInitialized` is false.
4. Register listeners in `connectedCallback()`

That last one is interesting.

## Reactivity

Browser API has a built-in way to observe certain attributes without needing to set up a [`MutationObserver`](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver), [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) or similar.

Here's how it works:

1. On your custom component class, define a `static get observedAttributes()` method that returns an array of attribute names you want to observe or simply a static property `observedAttributes` with the same array.
2. Implement the `attributeChangedCallback(name, oldValue, newValue)` method to react to changes in those attributes.

Putting it all together, here's a simple example of a custom element that changes its text content based on an observed attribute:

```js
// The name is typically at least 2 words
class MyCounter extends HTMLElement {
    static observedAttributes = ['value']

    // A flag to keep track of whether the component shadow DOM is initialized
    #isInitialized = false
    #value = 0
    #valueElement = null

    get value() {
        return this.#value
    }

    // The attribute value is always a string or null
    set value(newValue) {
        const oldValue = this.#value
        if (newValue === null) {
            this.#value = 0
        } else {
            this.#value = typeof newValue === 'string' ? parseInt(newValue, 10) : newValue
        }
        // Update the DOM when the value changes
        if (this.#valueElement) {
            this.#valueElement.textContent = this.#value.toString()
        }

        // We may want to trigger an event whenever the value changes
        if (oldValue !== this.#value) {
            this.dispatchEvent(
                new CustomEvent('value-changed', {
                    detail: {
                        value: this.#value,
                    },
                    composed: true,
                    bubbles: true,
                }),
            )
        }
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'value') {
            this.value = newValue
        }
    }

    // Just to show that the property can simply be modified by a method
    increment() {
        this.value++
    }

    constructor() {
        super()
    }

    connectedCallback() {
        if (!this.#isInitialized) {
            // Mode can be 'closed' too. 'open' allows you to access the
            // shadow root via .shadowRoot property while 'closed' does not.
            this.attachShadow({ mode: 'open' })
            this.shadowRoot.innerHTML = `<p>Counter value: <span id="value">${this.value}</span></p>`
            this.#valueElement = this.shadowRoot.querySelector('#value')
        }
    }
}

// Custom components always have a '-' in their name
// to avoid conflicts with built-in elements
customElements.define('my-counter', MyCounter)

// Usage
const counter = document.createElement('my-counter')
// Add an event listener (optional)
counter.addEventListener('value-changed', (event) => {
    console.log('Counter value changed to:', event.detail.value)
})
document.body.appendChild(counter)
// The counter's text updates to "Counter value: 5"
counter.setAttribute('value', '5')
// The counter's text updates to "Counter value: 6"
counter.increment()
```

That's a lot of code! JJ makes it a bit easier to work with:

```js
import { JJHE, attr2prop } from 'jj'

const h = JJHE.tree

class MyCounter extends HTMLElement {
    static observedAttributes = ['value']

    #jjHost
    #jjShadow = null
    #value = 0
    // Keeps a reference to the node that updates with the value
    #jjValueElement = null
    #jjIncButton = null

    #boundIncrement = () => {
        this.increment()
    }

    get value() {
        return this.#value
    }

    set value(newValue) {
        const oldValue = this.#value
        if (newValue === null) {
            this.#value = 0
        } else {
            this.#value = typeof newValue === 'string' ? parseInt(newValue, 10) : newValue
        }
        if (this.#valueElement) {
            this.#jjValueElement.setText(this.#value.toString())
        }
        if (oldValue !== this.#value) {
            this.#jjHost.triggerCustomEvent('value-changed', { value: this.#value })
        }
    }

    attributeChangedCallback(name, oldValue, newValue) {
        return attr2prop(this, name, oldValue, newValue)
    }

    increment() {
        this.value++
    }

    constructor() {
        super()
        this.#jjHost = JJHE.from(this).setShadow('open')
    }

    connectedCallback() {
        if (!this.#jjShadow) {
            this.#jjValueElement = h('span', null, this.value.toString())
            this.#jjHost.initShadow(
                h('p', null, 'Counter value: ', this.#jjValueElement, h('button', { id: 'inc' }, '+')),
            )
            this.#jjShadow = this.#jjHost.getShadow(true)
            this.#jjIncButton = this.#jjShadow.find('#inc', true)
        }

        this.#jjIncButton.on('click', this.#boundIncrement)
    }

    disconnectedCallback() {
        this.#jjIncButton?.off('click', this.#boundIncrement)
    }
}
```

OK, this wasn't dramatically shorter. A better example would show how JJ helps with setting templates and stylesheets and that's exactly what we'll be doing in the next section.

## MDN

- Web components: https://developer.mozilla.org/en-US/docs/Web/API/Web_components

## Next up: Templates and styles

Now that we have learned the basics of creating components, let's see how we can use HTML for layout, CSS for appearance, and JavaScript for behavior.
