# DOM Fundamentals

First stop is the DOM API itself.

To create a `div` natively:

```js
document.createElement('div')
```

In JJ:

```js
JJHE.create('div')
```

`JJHE` stands for wrapped `HTMLElement`, and each wrapper exposes `.ref` with the native node.

## Chaining

With native DOM:

```js
const div = document.createElement('div')
div.textContent = 'Hello world'
div.setAttribute('title', 'Greeting')
```

With JJ:

```js
const divWrapper = JJHE.create('div').setText('Hello world').setAttr('title', 'Greeting').addClass('dominant')
```

This produces:

```html
<div title="Greeting" class="dominant">Hello world</div>
```

## `.ref` interop

The wrapper gives fluent helpers, and `.ref` gives you native escape hatch.

```js
const divWrapper = JJHE.create('div').setText('Interop ready')

// Native interop
document.body.appendChild(divWrapper.ref)
```

Use wrappers first, then drop to `.ref` only when needed.

## Querying

JJ wraps common query APIs:

- `.find(selector, required?)`
- `.findAll(selector)`
- `.closest(selector)` on element wrappers

```js
import { JJD } from 'jj'

const doc = JJD.from(document)

const card = doc.find('.card')
const items = doc.findAll('li')
const app = doc.find('#app', true) // throws when missing

if (card) {
    const section = card.closest('section')
    section?.addClass('has-card')
}
```

## Batch helpers you will use a lot

Use plural helpers for grouped updates:

```js
JJHE.create('button')
    .setAttrs({
        type: 'button',
        title: 'Save changes',
    })
    .setAriaAttrs({
        label: 'Save changes',
    })
    .setClasses({
        btn: true,
        'btn-primary': true,
    })
```

Continue with [State and Events](./?file=state-and-events.md) for structuring dynamic behavior.
