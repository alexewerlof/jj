# State and Events

When it comes to web application development, there are two dominant paradigms:

- **Imperative**: your code manipulates the DOM directly.
- **Declarative**: your code manipulates data and a framework maps it to DOM.

JJ takes a middle ground but is closer to imperative style. It gives sugar syntax for the repetitive DOM work while keeping the platform visible.

## A practical state loop

You do not need a framework runtime to build predictable UI updates. Keep local state, update it in event handlers, and render intentionally.

```js
import { JJHE } from 'jj'

const state = {
    count: 0,
}

const value = JJHE.create('strong').setText('0')

const inc = JJHE.create('button')
    .setText('+1')
    .on('click', () => {
        state.count += 1
        value.setText(state.count)
    })

document.body.append(JJHE.tree('div', { class: 'counter' }, value, inc).ref)
```

## Component-to-parent communication

For payload-bearing events, use `customEvent()` or `triggerCustomEvent()`.

```js
import { JJHE } from 'jj'

const host = JJHE.create('div').on('todo-toggle', (event) => {
    console.log(event.detail)
})

host.triggerCustomEvent('todo-toggle', {
    id: 'item-1',
    done: true,
})
```

JJ `customEvent()` defaults to `bubbles: true` and `composed: true`, which is usually ideal for custom element communication.

Browser references:

- EventTarget: https://developer.mozilla.org/en-US/docs/Web/API/EventTarget
- CustomEvent: https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent
- Event.composed: https://developer.mozilla.org/en-US/docs/Web/API/Event/composed

## Framework mental model bridge

- React `setState` / Vue `ref` / Svelte assignment all solve UI updates.
- In JJ, you can keep state in plain objects or class fields and call wrapper methods directly when state changes.
- This keeps data flow explicit and easy to debug in DevTools.

## Where to go deeper

- [guides/events.md](../../guides/events.md) for Shadow DOM event boundaries
- [guides/fluent-api.md](../../guides/fluent-api.md) for readable chaining patterns
- [guides/query.md](../../guides/query.md) for query strategy
