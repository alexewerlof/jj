# Eventing Patterns

## Native event listeners

```js
jjEl.on('click', handler) // addEventListener
jjEl.off('click', handler) // removeEventListener (same function reference)
jjEl.triggerEvent('click') // creates and dispatches Event('click')
```

The handler `this` inside `.on()` is bound to the JJ wrapper instance. Use `this.ref` to access the native element:

```js
jjBtn.on('click', function () {
    // this → the JJHE wrapper
    // this.ref → the HTMLButtonElement
    console.log(this.ref.textContent)
})
```

## Custom events with payloads

`trigger()` accepts a full event object. JJ also provides two convenience constructors that keep dispatch fluent:

- `triggerEvent(name, options?)` is equivalent to `trigger(new Event(name, { bubbles: true, composed: true, ...options }))`
- `triggerCustomEvent(name, detail?, options?)` is equivalent to `trigger(new CustomEvent(name, { bubbles: true, composed: true, ...options, detail }))`

Use the native `CustomEvent` constructor when dispatching directly:

```js
this.dispatchEvent(new CustomEvent('todo-toggle', { detail: { id: 1, done: true }, bubbles: true, composed: true }))
```

`triggerCustomEvent(name, detail?, options?)` — fluent wrapper dispatch:

```js
JJHE.from(this).triggerCustomEvent('todo-toggle', { id: 1, done: true })
```

## Shadow DOM event rules

| Situation                               | propagates past shadow root?              |
| --------------------------------------- | ----------------------------------------- |
| Native UI events (click, input, change) | Yes — already `composed: true`            |
| Native `CustomEvent` (no options)       | No — `composed` defaults to `false`       |
| `triggerCustomEvent()`                  | Yes — JJ sets `composed: true` by default |

Override defaults explicitly when the event is internal:

```js
new CustomEvent('internal-ready', { bubbles: false, composed: false })
```

## Event delegation

```js
import { JJD } from 'jj'

const jjDoc = JJD.from(document)
const jjList = jjDoc.find('#list', true)
jjList.on('click', (e) => {
    if (!(e.target instanceof Element)) {
        return
    }
    const itemEl = e.target.closest('[data-id]')
    if (itemEl) handleClick(itemEl.dataset.id)
})
```

## One-time listener via AbortController

```js
const ctrl = new AbortController()
jjEl.ref.addEventListener('click', handler, { signal: ctrl.signal })
// later:
ctrl.abort() // removes listener
```

## Browser references

- EventTarget.addEventListener: https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
- CustomEvent: https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent
- Event.composed: https://developer.mozilla.org/en-US/docs/Web/API/Event/composed
- Event bubbling: https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Event_bubbling
