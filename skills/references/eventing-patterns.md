# Eventing Patterns

## Native event listeners

```js
el.on('click', handler)     // addEventListener
el.off('click', handler)    // removeEventListener (same function reference)
el.trigger('click')         // dispatchEvent(new Event('click'))
```

The handler `this` inside `.on()` is bound to the JJ wrapper instance. Use `this.ref` to access the native element:

```js
btn.on('click', function () {
    // this → the JJHE wrapper
    // this.ref → the HTMLButtonElement
    console.log(this.ref.textContent)
})
```

## Custom events with payloads

`customEvent(name, detail?, options?)` — standalone factory:

```js
import { customEvent } from 'jj'

// JJ defaults: bubbles: true, composed: true
this.dispatchEvent(customEvent('todo-toggle', { id: 1, done: true }))
```

`triggerCustomEvent(name, detail?, options?)` — fluent wrapper dispatch:

```js
JJHE.from(this).triggerCustomEvent('todo-toggle', { id: 1, done: true })
```

## Shadow DOM event rules

| Situation                               | propagates past shadow root? |
|-----------------------------------------|------------------------------|
| Native UI events (click, input, change) | Yes — already `composed: true` |
| Native `CustomEvent` (no options)       | No — `composed` defaults to `false` |
| JJ `customEvent()`                      | Yes — JJ sets `composed: true` by default |

Override defaults explicitly when the event is internal:

```js
customEvent('internal-ready', undefined, { bubbles: false, composed: false })
```

## Event delegation

```js
const list = doc.find('#list', true)
list.on('click', (e) => {
    const item = e.target.closest('[data-id]')
    if (item) handleClick(item.dataset.id)
})
```

## One-time listener via AbortController

```js
const ctrl = new AbortController()
el.ref.addEventListener('click', handler, { signal: ctrl.signal })
// later:
ctrl.abort()   // removes listener
```

## Browser references
- EventTarget.addEventListener: https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
- CustomEvent: https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent
- Event.composed: https://developer.mozilla.org/en-US/docs/Web/API/Event/composed
- Event bubbling: https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Event_bubbling
