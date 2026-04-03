# Querying the DOM in JJ

JJ wraps the browser's querying APIs into a small set of fluent methods. These methods live on different wrappers depending on what you're querying.

**Browser references:**

- [Element.querySelector](https://developer.mozilla.org/en-US/docs/Web/API/Element/querySelector)
- [Element.querySelectorAll](https://developer.mozilla.org/en-US/docs/Web/API/Element/querySelectorAll)
- [Element.closest](https://developer.mozilla.org/en-US/docs/Web/API/Element/closest)
- [Document.getElementById](https://developer.mozilla.org/en-US/docs/Web/API/Document/getElementById)

## Where the methods live

- `JJNx` (base for `JJE`, `JJD`, `JJDF`) provides:
    - `.find(selector, required?)`
    - `.findAll(selector)`
- `JJE` (and its subclasses `JJHE`, `JJSE`) provides:
    - `.closest(selector)`

This means you can query from any wrapper that represents an element, document, or document fragment.

When you want to query the document, initialize a local wrapper first:

```js
import { JJD } from 'jj'

const doc = JJD.from(document)
```

## `.find(selector, required?)`

Finds the first matching descendant using a CSS selector.

- Returns a wrapped element (`Wrapped`) when found.
- Returns `null` when not found.
- If `required` is `true`, throws a `TypeError` when no match exists.

```js
// Find the first card — may be null
const card = doc.find('.card')

// Throw if missing — guarantees non-null result
const app = doc.find('#app', true)
```

### When to use `required: true`

Use `required: true` when the element is essential and its absence indicates a programming error (e.g. a hardcoded `id` that should always exist). This gives you a clear error with a stack trace rather than a silent `null` leading to confusing downstream failures.

## `.findAll(selector)`

Finds all matching descendants using a CSS selector.

- Returns an array of wrapped elements (`Wrapped[]`).
- Returns an empty array when no matches exist.

```js
// Find all items
const items = doc.findAll('li')

// Add a class to each result
items.forEach((item) => item.addClass('highlight'))
```

### Using `findAll` with `addChildMap`

A common pattern: query, transform, and replace a list's children:

```js
const names = ['Alice', 'Bob', 'Carol']
const list = doc.find('#user-list', true)

list.setChildMap(names, (name) => JJHE.create('li').setText(name))
```

Or, if you're building from data rather than querying:

```js
const ul = JJHE.create('ul').addChildMap(names, (name) => JJHE.tree('li', null, name))
```

## `.closest(selector)`

Finds the nearest ancestor (or self) that matches a CSS selector. Only available on `JJE` and descendants (`JJHE`, `JJSE`).

- Returns a wrapped element when found.
- Returns `null` when no ancestor matches.

```js
const button = doc.find('button', true)
const card = button.closest('.card')

if (card) {
    card.addClass('has-action')
}
```

### Event delegation with `.closest()`

`closest()` is the standard tool for event delegation — listening on a container and acting on the clicked descendant:

```js
doc.find('#list', true).on('click', (event) => {
    const item = JJHE.from(event.target).closest('[data-item-id]')
    if (item) {
        const id = item.getDataAttr('item-id')
        handleItemClick(id)
    }
})
```

This is more efficient than attaching a listener to every list item individually.

## `.fromId()` factory — fast ID-based lookup

`JJHE.fromId(id)` and `JJSE.fromId(id)` provide a typed shortcut for `document.getElementById`:

```js
import { JJHE } from 'jj'

// Looks up #my-input and wraps it as JJHE<HTMLInputElement>
const input = JJHE.fromId('my-input')
```

This is faster than `doc.find('#my-input')` because `getElementById` does not require a CSS selector parse. Use it when you have a known, stable element ID.

## Querying inside shadow DOM

After initializing a shadow root wrapper, query within it the same way you'd query a document:

```js
class MyCard extends HTMLElement {
    #root = null

    async connectedCallback() {
        this.#root = JJHE.from(this).setShadow('open', await templatePromise, await stylePromise)
        this.#render()
    }

    #render() {
        // Query from the shadow root wrapper — not from document
        this.#root?.find('[data-role="title"]')?.setText(this.#title)
        this.#root?.findAll('[data-role="tag"]').forEach((tag) => tag.addClass('ready'))
    }
}
```

Never use `document.querySelector` to find elements inside a shadow root — they are scoped to the shadow tree and not visible to document-level queries.

## Using native query APIs via `.ref`

You can always fall back to native DOM APIs through `.ref` when you need a specific method (e.g. `getElementsByTagName`) or need a native return type:

```js
// Native querySelector on the underlying element
const nativeMatch = doc.ref.querySelector('.card')

// Native getElementById on the underlying document
const nativeHeader = doc.ref.getElementById('header')
```

### When to prefer `.ref` queries

- You need `getElementsByTagName` or `getElementsByClassName` (live `HTMLCollection`).
- You are integrating with a third-party library that requires native node types.
- You need the raw native node for a Web API (e.g. `IntersectionObserver`).

Otherwise, prefer `.find()` / `.findAll()` to keep wrapping and chaining consistent.
