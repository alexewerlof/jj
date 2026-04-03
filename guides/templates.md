# Templates Guide

JJ supports multiple template input forms while still relying on browser primitives. This guide explains how each form works, when to use it, and the important nuances around cloning.

**Browser APIs behind the scenes:**

- [DocumentFragment](https://developer.mozilla.org/en-US/docs/Web/API/DocumentFragment)
- [HTMLTemplateElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLTemplateElement)
- [Range.createContextualFragment](https://developer.mozilla.org/en-US/docs/Web/API/Range/createContextualFragment)
- [Node.cloneNode](https://developer.mozilla.org/en-US/docs/Web/API/Node/cloneNode)

## JJ template helpers

| Method                  | Description                                                     |
| ----------------------- | --------------------------------------------------------------- |
| `addTemplate(template)` | Clones the template and **appends** it to existing children.    |
| `setTemplate(template)` | Clears existing children, then clones and appends the template. |
| `fetchTemplate(url)`    | Fetches an HTML file and returns a `Promise<DocumentFragment>`. |

## Supported template inputs

All three methods accept the same set of inputs:

| Input type            | How it is cloned                                                        |
| --------------------- | ----------------------------------------------------------------------- |
| `string`              | Parsed as HTML via `Range.createContextualFragment`.                    |
| `HTMLTemplateElement` | Its `.content` (a `DocumentFragment`) is cloned with `cloneNode(true)`. |
| `DocumentFragment`    | Cloned with `cloneNode(true)`.                                          |
| `HTMLElement`         | Cloned with `cloneNode(true)`.                                          |
| Any `JJN` wrapper     | The wrapped native node is cloned with `cloneNode(true)`.               |

## Why cloning matters

`addTemplate()` and `setTemplate()` always **clone** their input before appending. This is a critical behavior:

```js
const tpl = JJHE.create('li').setText('item')

// Each call appends a fresh clone — the original is never moved or consumed
list.addTemplate(tpl)
list.addTemplate(tpl) // second call still works, appends a second clone
```

This matters especially with `DocumentFragment`. Normally, inserting a `DocumentFragment` into the DOM _moves_ its children:

```js
const frag = document.createDocumentFragment()
frag.append(document.createTextNode('hello'))

el.appendChild(frag) // frag is now empty — nodes moved
el.appendChild(frag) // appends nothing, frag is empty
```

JJ avoids this footgun: `addTemplate(frag)` clones the fragment, so the original remains intact and the call is idempotent.

## `addTemplate` vs `setTemplate`

- **`addTemplate`** — appends a clone _after_ existing children. Use when building up content incrementally.
- **`setTemplate`** — clears existing children first, then appends a clone. Use when replacing content entirely.

```js
// Build up a list
const list = JJHE.create('ul')
list.addTemplate('<li>First</li>')
list.addTemplate('<li>Second</li>') // both items present

// Replace all content
list.setTemplate('<li>Only item</li>') // list now has exactly one item
```

`setTemplate()` is equivalent to `empty().addTemplate()` — but in a single call.

## Loading templates from files

`fetchTemplate(url)` fetches an HTML file and returns a `Promise<DocumentFragment>`:

```js
const templatePromise = fetchTemplate(import.meta.resolve('./my-view.html'))
```

Keep this at module scope — it loads once and the same `DocumentFragment` is reused for every instance via cloning.

```js
// Module scope: load once
const templatePromise = fetchTemplate(import.meta.resolve('./my-card.html'))

// Per-instance: clone on use
async function render(container) {
    container.setTemplate(await templatePromise)
}
```

The HTML file should contain the markup fragment you want to clone — it does not need to be a full document:

```html
<!-- my-card.html -->
<article class="card">
    <h2 data-role="title"></h2>
    <p data-role="body"></p>
</article>
```

## Using templates with shadow DOM

The most common use of `fetchTemplate` is feeding the result to `setShadow()`, which also accepts the same template inputs:

```js
const templatePromise = fetchTemplate(import.meta.resolve('./my-card.html'))
const stylePromise = fetchStyle(import.meta.resolve('./my-card.css'))

class MyCard extends HTMLElement {
    async connectedCallback() {
        this.#root = JJHE.from(this).setShadow('open', await templatePromise, await stylePromise)
    }
}
```

`setShadow()` internally calls `setTemplate()` on the new shadow root.

## JJDF for multi-node fragments

`JJDF` (Document Fragment wrapper) is useful when you want to assemble a group of nodes before inserting them:

```js
import { JJDF, JJHE } from 'jj'

const frag = JJDF.create().addChild(JJHE.create('dt').setText('Term')).addChild(JJHE.create('dd').setText('Definition'))

// Insert into a definition list
dl.addChild(frag)
```

Because `addChild(frag)` inserts the fragment's children (not a containing element), this is the standard way to insert multiple sibling nodes in one operation.

## Pattern: list rendering with `addChildMap`

For rendering arrays, prefer `addChildMap()` over building a fragment manually:

```js
const items = ['Apple', 'Orange', 'Pear']

// Preferred: addChildMap
const ul = JJHE.create('ul').addChildMap(items, (item) => JJHE.create('li').setText(item))

// Also fine for inline builds: JJHE.tree() spread
const ul = JJHE.tree('ul', null, ...items.map((item) => JJHE.tree('li', null, item)))
```

`addChildMap()` handles null/undefined gracefully (those entries are skipped) and is more readable than a manual fragment loop.

## Pattern: template with dynamic placeholders

After cloning a template, query for placeholder elements by `data-role` and fill them:

```js
async function renderCard(container, { title, body }) {
    // Clone the shared template into the container
    container.setTemplate(await templatePromise)

    // Fill placeholders
    container.find('[data-role="title"]')?.setText(title)
    container.find('[data-role="body"]')?.setText(body)
}
```

This is more maintainable than building the entire structure in JavaScript, since the markup lives in its own HTML file.

## Related

- [structure guide](./structure.md) — file-per-concern conventions.
- [components guide](./components.md) — using templates in custom elements.
- [tutorial DOM fundamentals](../www/tutorial/dom-fundamentals.md)
