# Querying Patterns

## Entry points

Always start from a wrapped container — most commonly the document or a shadow root:

```js
const doc = JJD.from(document)
const shadow = this.#root // JJSR inside a custom element
```

## find — first match

```js
const card = doc.find('.card') // null when absent
const app = doc.find('#app', true) // throws TypeError when absent
const btn = shadow.find('#submit') // scoped to shadow root
```

Pass `true` as the second argument when the element is required. This produces a clearer error than a null-access crash later.

You can use it in combination with a more specific query to simultaneously assert your expectations. For example, if you want a reference to a button with the id `submit`, you could write:

```js
const submitBtn = doc.find('#submit-btn', true)

if (!(submitBtn instanceof HTMLButtonElement)) {
    throw new Error('Expected #submit-btn to be an HTMLButtonElement.')
}
```

But a shorter and more expressive way to write this is:

```js
// This will throw an exception if an element with id is not found
// OR if it's found but not a button
const submitBtn = doc.find('button#submit-btn', true)
```

This helps catch errors early and narrow down troubleshooting.

When `find` returns a wrapper, keep the wrapper unless you need a native API that JJ does not expose:

```js
// ✅ keep wrapper value
const jjSubmitBtn = doc.find('button#submit-btn', true)
jjSubmitBtn.on('click', onSubmit)

// ❌ avoid unwrap + re-wrap noise
const submitRef = doc.find('button#submit-btn', true).ref
const jjSubmitBtnAgain = JJHE.from(submitRef)
```

## findAll — all matches

```js
const items = doc.findAll('li.item') // always an array (may be empty)
items.forEach((item) => item.addClass('loaded'))
```

## closest — ancestor lookup

Use `.closest()` on element wrappers for event delegation or tree navigation:

```js
doc.on('click', (e) => {
    const item = JJHE.from(e.target).closest('[data-item-id]')
    if (item) handleItemClick(item.getAttr('data-item-id'))
})
```

## fromId — direct ID lookup

```js
const btn = JJHE.fromId('submit-btn') // typed as JJHE<HTMLButtonElement>
```

## When to use .ref for queries

Reach for `.ref` when you need native methods JJ does not wrap:

```js
const inputs = el.ref.querySelectorAll('input:invalid')
const active = el.ref.matches(':focus-within')
```

Do not use `.ref` just to call `querySelector`/`querySelectorAll` when wrapper `find`/`findAll` already covers the use case.

## Browser references

- Document.querySelector: https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector
- Element.querySelectorAll: https://developer.mozilla.org/en-US/docs/Web/API/Element/querySelectorAll
- Element.closest: https://developer.mozilla.org/en-US/docs/Web/API/Element/closest
