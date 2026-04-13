# Events

To add and remove events, we use the following functions and all wrappers:

| Method               | Description                            | Example                                            |
| -------------------- | -------------------------------------- | -------------------------------------------------- |
| `on`                 | Add an event listener.                 | `on('click', () => alert('clicked'))`              |
| `off`                | Remove an event listener.              | `off('click', myClickHandler)`                     |
| `trigger`            | Trigger an event programmatically.     | `trigger(new Event('click'))`                      |
| `triggerEvent`       | Creates an Event and triggers it.      | `triggerEvent('click')`                            |
| `triggerCustomEvent` | Creates a CustomEvent and triggers it. | `triggerCustomEvent('my-event', { some: 'data' })` |

For example, you can create a button that shows an alert when clicked like this:

```js
import { JJHE } from 'jj'
const jjButton = JJHE.create('button')
    .setText('Click me')
    .on('click', () => alert('Button clicked!'))
```

If you want to programmatically trigger the `click` event, you simply do:

```js
jjButton.triggerEvent('click')
// Click also has a shortcut:
jjButton.click()
```

## Custom Events

[`CustomEvent`](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent)s can have any name and an optional payload (`detail`) you can create a custom event using the DOM API and trigger it on an element:

```js
const myEvent = new CustomEvent('my-event', { detail: { some: 'data' } })
const myButton = document.querySelector('button#my-button')
myButton.dispatchEvent(myEvent)
```

You can directly trigger a custom event on a wrapped element:

```js
import { JJHE } from 'jj'
const jjButton = JJHE.create('button').setText('Click me')
// Create a custom composed event
const myEvent = new CustomEvent('my-event', { detail: { some: 'data' }, bubbles: true, composed: true })
jjButton.trigger(myEvent)
// Or even shorter:
jjButton.triggerCustomEvent('my-event', { some: 'data' })
```

We mentioned `composed` event. This means that the event can bubble across shadow DOM boundaries which we'll cover soon.

## Next up: State management

We will talk more about `CustomEvent` when talking about components.
