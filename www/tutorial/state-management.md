# State Management

When it comes to web application development, there are two dominant paradigms:

- **Imperative**: your code manipulates the DOM directly.
- **Declarative**: your code manipulates data and a framework maps it to DOM.

JJ takes a middle ground but is closer to imperative style. It offers sugar syntax for common DOM operations without making any effort to abstract the raw power of modern platforms. This translates to more control at the cost of potential boilerplate (which JJ tries to minimize with its fluent API, solid TypeScript types, and AI skills).

## A practical state loop

You do not need a framework or fat library to build predictable UI updates. Keep local state, update it in event handlers, and render intentionally.

```js
import { JJHE } from 'jj'

const state = {
    count: 0,
}

const jjValue = JJHE.create('strong').setText(state.count)

const jjIncBtn = JJHE.create('button')
    .setText('+1')
    .on('click', () => {
        state.count++
        jjValue.setText(state.count)
    })

JJHE.from(document.body).addChild(JJHE.tree('div', { class: 'counter' }, jjValue, jjIncBtn))
```

Using getter/setters we can rewrite the same example like this:

```js
import { JJHE } from 'jj'

class State {
    #count = 0
    constructor(init = 0) {
        this.#count = init
        // We have hard-coded the HTML structure to keep this example self-contained
        // but you can load the structure from a template, file, or even generate
        // it dynamically.
        this.jjCount = JJHE.create('strong').setText(this.#count)
        const jjIncBtn = JJHE.create('button')
            .setText('+1')
            .on('click', () => this.add(1))
        this.jjShadow = JJHE.tree('div', { class: 'counter' }, this.jjCount, jjIncBtn)
    }

    get count() {
        return this.#count
    }

    set count(value) {
        if (typeof value !== 'number' || isNaN(value)) {
            throw new TypeError(`Count must be a number. Got ${value}`)
        }
        if (value !== this.#count) {
            this.#count = value
            // Setter triggers a render only when needed.
            this.render()
        }
    }

    add(delta = 1) {
        this.count += delta
    }

    render() {
        // Note that we update the exact HTML element that needs to change
        // instead of re-rendering the whole tree.
        return this.jjCount.setText(this.count)
    }
}

const state = new State()
JJHE.from(document.body).addChild(state.jjShadow)
// Triggers a render and updates the UI.
state.count = 43
// Or using the helper method:
state.add(-1)
```

This may look more verbose but it extends better to more complex state and UI logic.

You can also use a reactive library like [RxJS](https://rxjs.dev/) or [MobX](https://mobx.js.org/README.html) to manage state and trigger updates.

If you're coming from React, Vue, or Svelte, you may be wondering how to manage state in JJ. The short answer: you don't need a special state management library. You can use plain JavaScript objects and the DOM API to manage state and update the UI. That's because JJ does not rely on virtual DOM, diffing, or proxies to track changes.

In practical terms, you have many choices, including:

| State management approach                                                                                                                              | How does it work?                                                                                        | When to use it?                                                                      |
| ------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Keep the state in plain JavaScript objects or classes and update the DOM manually.                                                                     | Create a class and use getter/setters together with `JJHE` methods to update the DOM when state changes. | When you have simple state and have full control over its updates.                   |
| Use DOM (content and data attributes) to hold the state.                                                                                               | Store state in the DOM and read it when needed.                                                          | When you have full control of the DOM and the state does not mutate that often.      |
| Use a state management library like [Redux](https://github.com/reduxjs/redux) or [others](https://github.com/collections/javascript-state-management). | Use a library to manage state outside of the DOM.                                                        | For complex web applications where you need more advanced state management features. |

In general, start small and adopt new tools only when needed.

## History API

Modern browsers have a great feature to handle state management in SPA (single page applications): [History API](https://developer.mozilla.org/en-US/docs/Web/API/History_API).

JJ doesn't add much here because the native API is pretty straightforward.

Here's how you typically use the History API:

```js
import { JJET } from 'jj'
// To change the URL without reloading the page (instead render the state in-place)
history.pushState({ some: 'state' }, 'Title', '/new-url')
// To handle the back/forward buttons without reloading the page
const jjWin = JJET.from(window)
jjWin.on('popstate', (event) => {
    console.log('Location changed:', document.location)
    console.log('State object:', event.state)
})
```

## Messaging and Pub/Sub

Again, this is not a JJ concept but it is worth mentioning that you can use the [BroadcastChannel API](https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel) to create a simple pub/sub system for your application. This is particularly useful when you have multiple tabs or windows that need to communicate with each other.

```js
import { JJET } from 'jj'
// Create a channel
const channel = new BroadcastChannel('my-channel')
const jjChannel = JJET.from(channel)
// Listen for messages
jjChannel.on('message', (event) => {
    console.log('Received message:', event.data)
})
// Send a message
jjChannel.ref.postMessage({ some: 'data' })
```

Similarly, you can use messaging between iframes or workers with the `postMessage` API.

```js
import { JJET } from 'jj'
const worker = new Worker('static/scripts/worker.js')
const jjWorker = JJET.from(worker)
jjWorker.on('message', (event) => {
    console.log(`Received message from worker: ${event.data}`)
})
```

Then inside the worker:

```js
// static/scripts/worker.js
self.postMessage("I'm alive!")
```

If you're interested to learn more:

- [Channel Messaging API](https://developer.mozilla.org/en-US/docs/Web/API/Channel_Messaging_API)
- [Web Workers API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API)
- [Service Workers API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Shared Workers API](https://developer.mozilla.org/en-US/docs/Web/API/SharedWorker)
- [MessageChannel API](https://developer.mozilla.org/en-US/docs/Web/API/MessageChannel)
- [postMessage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage)

## Next up: Components

Now that we've learned how to create and manipulate DOM, handle events, and manage state, let's see how components help us to create reusable abstractions to manage complexity.
