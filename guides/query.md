# Querying the DOM in JJ

JJ wraps the browser's querying APIs into a small set of fluent methods. These methods live on different wrappers depending on what you're querying.

## Where the methods live

- `JJNx` (base for `JJE`, `JJD`, `JJDF`) provides:
    - `.find(selector, required?)`
    - `.findAll(selector)`
- `JJE` (and its subclasses `JJHE`, `JJSE`) provides:
    - `.closest(selector)`

This means you can query from any wrapper that represents an element, document, or document fragment.

## `.find(selector, required?)`

Finds the first matching descendant using a CSS selector.

- Returns a wrapped element (`Wrapped`) when found
- Returns `null` when not found
- If `required` is `true`, throws a `TypeError` when no match exists

```js
// Find the first card
const card = doc.find('.card')

// Throw if missing
const app = doc.find('#app', true)
```

### When to use

- You expect a single element
- You want a clear error if a required element is missing

## `.findAll(selector)`

Finds all matching descendants using a CSS selector.

- Returns an array of wrapped elements (`Wrapped[]`)
- Returns an empty array when no matches exist

```js
// Find all items
const items = doc.findAll('li')

// Add a class to each result
items.forEach((item) => item.addClass('highlight'))
```

### When to use

- You want to operate on a collection of elements
- You expect zero or more matches

## `.closest(selector)`

Finds the nearest ancestor (or self) that matches a CSS selector. This is only available on `JJE` (and therefore on `JJHE`/`JJSE`).

- Returns a wrapped element when found
- Returns `null` when no ancestor matches

```js
const button = doc.find('button', true)
const card = button.closest('.card')

if (card) {
    card.addClass('has-action')
}
```

### When to use

- Event delegation (walk up from a target)
- Locating a container from a nested element

## Using native query APIs via `.ref`

You can always fall back to the native DOM APIs through `.ref` when you need a specific method (e.g. `getElementById`, `getElementsByTagName`) or when you want a native return type.

```js
// Native querySelector on the underlying element
const nativeMatch = doc.ref.querySelector('.card')

// Native getElementById on the underlying document
const nativeHeader = doc.ref.getElementById('header')
```

### Guidance for AI agents

- Prefer `.find()` and `.findAll()` on wrappers to keep chaining fluent and return wrapped nodes.
- Use `.closest()` on `JJE`-based wrappers for ancestor lookup.
- Only drop to `.ref` when you need a native method not covered by JJ wrappers.
