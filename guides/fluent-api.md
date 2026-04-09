# Readablity

One of the main reasons to use JJ is to have the code more compact and easier to read, making it for the humans to verify and establish trust.

## Use sugar

Use the provided sugar methods instead of using `.ref` unnecessarily.

```js
// ✅ GOOD - Uses existing methods
tableBody.setHTML('')
// ❌ BAD - Reaches out for .ref unnecessarily
tableBody.ref.innerHTML = ''

// ✅ GOOD - Use the event listener
userInput.on('change', (e) => {
    e.preventDefault()
    console.log(e.)
})
// ❌ BAD - unnecessary and long
userInput.ref.addEventListener('change', (e) => {
    e.preventDefault()
    console.log(e.)
})

// ✅ GOOD - use the provided methods for the common tasks
userName.disable()
// ❌ BAD - not idiomatic
userName.setAttr('disabled', '')
// ✅ GOOD - use the provided methods for the common tasks
textInput.enable()
// ❌ BAD - not idiomatic
textInput.rmAttr('disabled')
// ✅ GOOD - use the provided methods for the common tasks
tooltip.hide()
// ❌ BAD - not idiomatic
settings.setAttr('hidden', '')
// ✅ GOOD - use the provided methods for the common tasks
settings.show()
// ❌ BAD - not idiomatic
tooltip.rmAttr('hidden')
// ✅ GOOD - use the provided methods for the common tasks
email.focus()
// ❌ BAD - not idiomatic
email.ref.focus()
// ✅ GOOD - use the provided methods for the common tasks
email.setAriaAttr('hidden', true)
// ❌ BAD - not idiomatic
email.setAttr('aria-hidden', true)
email.ref.setAttribute('aria-hidden', true)
```

## Setting multiple attributes

Use the explicit plural helpers for grouped updates:

```js
// ✅ GOOD - set multiple attributes at once (common in examples)
progress.setAttrs({
    min: 0,
    max: 100,
})

// ✅ GOOD - set ARIA attributes together
dialog.setAriaAttrs({
    label: 'RSVP form',
    modal: 'true',
})

// ❌ BAD - unnecessary calls
progress.setAttr('min', 0).setAttr('max', 100)

// ❌ BAD - repetitive calls
progress.setAttr('min', 0)
progress.setAttr('max', 100)

// ❌ BAD - bypasses wrapper + breaks chaining
progress.ref.setAttribute('min', 0)
progress.ref.setAttribute('max', 100)

// ❌ BAD - incorrect type for nameOrObj
JJHE.create('div').setAttr(['role', 'status'])
```

## Toggling multiple classes

Use `setClasses()` to add/remove multiple classes conditionally in one call:

```js
// ✅ GOOD - conditional classes (Vue-style map)
const card = JJHE.create('div').setClasses({
    'kanban-card': true,
    'is-dragging': isDragging,
    'is-done': status === 'done',
})

// ✅ GOOD - toggle multiple flags at once
const input = JJHE.create('input').setClasses({
    'is-valid': isValid,
    'is-invalid': !isValid,
})

// ❌ BAD - repetitive explicit toggles instead of setClasses
const card2 = JJHE.create('div')
card2.swClass('is-dragging', isDragging) // fine alone, but prefer setClasses for multiple
card2.swClass('is-done', status === 'done')

// ❌ BAD - using add/remove imperatively for each condition
const input2 = JJHE.create('input')
if (isValid) {
    input2.addClass('is-valid')
    input2.rmClass('is-invalid')
} else {
    input2.rmClass('is-valid')
    input2.addClass('is-invalid')
}

// ❌ BAD - bypasses wrapper
const card3 = JJHE.create('div')
card3.ref.classList.toggle('is-dragging')
```

## Factory chaining

Instead of using the `new` operator to create wrappers, use the `.from()` or `.create()` when appropriate:

```js
// ✅ GOOD -
const li = JJHE.create('li').setText('Hello')
// ❌ BAD - not chainable
const li = new JJHE(document.createElement('li'))
li.setText('Hello')
// ❌ BAD - unnecessary call to document.createElement()
const li = JJHE.from(document.createElement('li')).setText('Hello')
```

## Method chaining

Use method chaining whenever possible:

```js
// ✅ GOOD - Uses existing methods
watcher.on('add' /* addHandler */).on('change' /* changeHandler */).on('unlink' /* unlnkHandler */)
// ❌ BAD - too repetitive
watcher.on('add' /* addHndler */)
watcher.on('change' /* changeHandler */)
watcher.on('unlink' /* unlinkHandler */)
```

## Building subtrees with `JJHE.tree()`

`JJHE.tree(tag, attrs?, ...children)` is a compact factory for building element subtrees in one expression. Children can be strings, numbers, `JJN` wrappers, `null`, or `undefined` (ignored).

```js
// ✅ GOOD - entire li in one expression
const item = JJHE.tree('li', { class: 'item' }, 'Hello')

// ✅ GOOD - nested structure inline
const card = JJHE.tree('article', { class: 'card' }, JJHE.tree('h2', null, title), JJHE.tree('p', null, body))

// ✅ GOOD - spread array into tree
const ul = JJHE.tree('ul', null, ...items.map((item) => JJHE.tree('li', null, item.label)))
```

String/number children become Text nodes automatically. A `null` or `undefined` child is silently skipped — useful for conditional children:

```js
const row = JJHE.tree(
    'tr',
    null,
    JJHE.tree('td', null, user.name),
    isAdmin ? JJHE.tree('td', null, 'Admin') : null, // skipped when not admin
)
```

## Updating lists with `addChildMap` and `setChildMap`

For rendering an array of items, prefer the map helpers over manual loops:

```js
const names = ['Alice', 'Bob', 'Carol']

// Build a new list
const ul = JJHE.create('ul').addChildMap(names, (name) => JJHE.tree('li', null, name))

// Replace a list's children
ul.setChildMap(names, (name) => JJHE.tree('li', null, name))
```

- `addChildMap` appends rendered items after existing children.
- `setChildMap` replaces all children with the rendered items (equivalent to `empty()` then `addChildMap()`).

Both skip `null` and `undefined` values returned by the map function:

```js
// Conditionally render only active items
ul.setChildMap(users, (user) => (user.active ? JJHE.tree('li', null, user.name) : null))
```

## `setChild` vs `addChild` — replace or append

Two common operations on element children:

| Method           | Behavior                                   |
| ---------------- | ------------------------------------------ |
| `addChild(node)` | Appends the node after existing children.  |
| `setChild(node)` | Replaces all children with the given node. |

```js
const container = JJHE.create('div')
container.addChild(JJHE.create('p').setText('first'))
container.addChild(JJHE.create('p').setText('second')) // div has two <p> now

container.setChild(JJHE.create('p').setText('only')) // div now has one <p>
```

Use `setChild` for a "replace content" update. Use `addChild` for incremental construction.

## Document Fragments

`DocumentFragment` (wrapped by `JJDF`) is a performance trick to aggregate some elements before adding them to the DOM.

However, when working with JJ, you may not need them at all.

```js
const fruits = ['Apple', 'Orange', 'Pear']
// ✅ GOOD - use addChildMap()
const ul = JJHE.create('ul').addChildMap(fruits, (fruit) => JJHE.create('li').setText(fruit))
// ✅ GOOD - another way with tree()
const ul = JJHE.tree('ul', null, ...fruits.map((fruit) => JJHE.tree('li', null, fruit)))
// ❌ BAD - unnecessary use of DocumentFragment
const ul = JJHE.create('ul')
const frag = JJDF.create()
for (const fruit of fruits) {
    frag.addChild(JJHE.create('li').setText(fruit))
}
ul.addChild(frag)
```

When `JJDF` _is_ appropriate — inserting multiple sibling nodes in one operation:

```js
// Building a definition list entry as two siblings
const frag = JJDF.create().addChild(JJHE.create('dt').setText('Term')).addChild(JJHE.create('dd').setText('Definition'))

dl.addChild(frag) // inserts both dt and dd as siblings
```

Since `addChild(frag)` inserts the fragment's children (not a wrapper element), this is the idiomatic way to insert multiple sibling nodes without a container.
