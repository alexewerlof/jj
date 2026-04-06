# State Management

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
// Create a channel
const channel = new BroadcastChannel('my-channel')
const jjChannel = JJET.from(channel)
// Listen for messages
jjChannel.on('message', (event) => {
    console.log('Received message:', event.data)
})
// Send a message
jjChannel.postMessage({ some: 'data' })
```

Similarly, you can use messaging between iframes or workers with the `postMessage` API.

```js
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
