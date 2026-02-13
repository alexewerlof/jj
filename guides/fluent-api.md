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
email.setAria('hidden', true)
// ❌ BAD - not idiomatic
email.setAttr('aria-hidden', true)
email.ref.setAttribute('aria-hidden', true)
```

## Setting multiple attributes

Use an object to set multiple attributes in one call:

```js
// ✅ GOOD - set multiple attributes at once (common in examples)
progress.setAttr({
    min: 0,
    max: 100,
})

// ✅ GOOD - set ARIA attributes together
dialog.setAria({
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

Use an object to add/remove multiple classes conditionally in one call:

```js
// ✅ GOOD - conditional classes (Vue-style map)
const card = JJHE.create('div').setClass({
    'kanban-card': true,
    'is-dragging': isDragging,
    'is-done': status === 'done',
})

// ✅ GOOD - toggle multiple flags at once
const input = JJHE.create('input').setClass({
    'is-valid': isValid,
    'is-invalid': !isValid,
})

// ❌ BAD - repetitive toggles
const card2 = JJHE.create('div')
card2.toggleClass('is-dragging')
card2.toggleClass('is-done')

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

# Document Fragments

`DocumentFragment` (wrapped by `JJDF`) is a performance trick to aggregate some elements before adding them to DOM.

However, when working with `jj`, you may not need them at all.

```js
const fruits = ['Apple', 'Orange', 'Pear']
// ✅ GOOD - use the .mapAppend()
const ul = JJHE.create('ul').mapAppend(fruits, (fruit) => JJHE.create('li').setText(fruit))
// ✅ GOOD - even shorter
const ul = JJHE.create('ul').mapAppend(fruits, (fruit) => h('li', null, fruit))
// ❌ BAD - use unnecessary DocumentFragment
const ul = JJHE.create('ul')
const frag = JJDF.create()
for (const fruit of fruits) {
    frag.append(JJHE.create('li').setText(fruit)
}
ul.append(frag)
```
