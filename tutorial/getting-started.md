# Getting Started

Unlike frameworks like React, Vue, or Svelte, JJ does not have a huge API surface.

- It does not try to **duplicate** modern browser features. It adds sugar for common DOM tasks.
- It does not try to create a thick **abstraction** layer.
- It follows the [Principle of least astonishment](https://en.wikipedia.org/wiki/Principle_of_least_astonishment): method names mostly mirror native DOM language.
- It keeps wrappers immutable: once a wrapper is initialized, its underlying `.ref` does not change.

JJ is tiny by design. When JJ has no helper for something, use the native platform API directly.

Useful browser references:

- DOM introduction: https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model
- Web components: https://developer.mozilla.org/en-US/docs/Web/API/Web_components
- ES modules: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules

## First example

```js
import { JJHE } from 'jj'

let count = 0

const button = JJHE.create('button')
    .setClass('counter-btn')
    .setText('Clicked 0 times')
    .on('click', () => {
        count += 1
        button.setText(`Clicked ${count} times`)
    })

document.body.appendChild(button.ref)
```

The shape is intentional:

- `JJHE.create('button')` maps to `document.createElement('button')`
- chaining keeps setup compact and readable
- `.ref` gives you the native element for interop

## What to learn next

1. Read [Design Philosophy](./?file=design-philosophy.md) for the big picture.
2. Continue to [DOM Fundamentals](./?file=dom-fundamentals.md) for everyday API usage.
3. Then read [State and Events](./?file=state-and-events.md) to structure real apps.

If you want a reference-style track in parallel, use [Guides](../guides/index.md).
