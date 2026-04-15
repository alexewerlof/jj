# Naming Conventions

This guide defines naming conventions for JJ code in this repository.

The main goal is to make it obvious whether a variable holds:

- a JJ wrapper,
- a native DOM value,
- plain application data, or
- a promise that resolves later.

## Core rule: prefix JJ wrapper variables with `jj`

If a variable stores a JJ wrapper instance, prefix it with `jj`.

```js
import { JJD, JJHE } from 'jj'

const jjDoc = JJD.from(document)
const jjFruits = jjDoc.find('#fruits', true)
const jjSubmitBtn = jjDoc.find('button#submit', true)
const jjDialog = JJHE.create('dialog')
```

This makes wrapper values visually distinct from native DOM nodes and plain data.

## Why this is a good default

- JJ wrappers are not native DOM nodes. Naming should make that distinction obvious.
- JJ code often mixes wrapper values with plain strings, objects, and native browser APIs.
- AI agents and human readers are less likely to misuse `.ref`, `querySelector`, or `appendChild` when wrapper values are clearly marked.

## Native DOM values: use native-oriented names

Do not use the `jj` prefix for native browser values.

Prefer suffixes like `El`, `Node`, `Root`, `Sheet`, or `Ref` when that helps cla## Native DOM values: use native-oriented names

Do not use the `jj` prefix for native browser values.

Prefer suffixes like `El`, `Node`, `Root`, `Sheet`, or `Ref` when that helps clarify the type.

```js
const jjDoc = JJD.from(document)
const formEl = document.querySelector('form')
const shadowRoot = this.shadowRoot
const styleSheet = await fetchStyle(import.meta.resolve('./card.css'))
const inputRef = jjDoc.find('input#email', true).ref
```

Use `.ref` sparingly, but when you do, name the result as a native value, not as a wrapper.

## Plain data: no `jj` prefix

Do not prefix plain data with `jj`.

```js
const fruits = ['apple', 'orange', 'banana']
const userName = 'Ada'
const isOpen = false
const title = 'My Card'
```

The `jj` prefix is only for wrapper instances.

```js
const jjDoc = JJD.from(document)
const jjWin = JJET.from(window)
const formEl = document.querySelector('form')
const shadowRoot = this.shadowRoot
const styleSheet = await fetchStyle(import.meta.resolve('./card.css'))
const inputRef = jjDoc.find('input#email', true).ref
```

Use `.ref` sparingly, but when you do, name the result as a native value, not as a wrapper.

Similarly, since the argument to the `.run()` callback is the current wrapped context, name it `jjContext`:

```js
jjButton.run((jjContext) => {
    // `jjContext` is the same as `jjButton` or this
    jjContext.setAttr('aria-busy', 'true')
})
```

## Plain data: no `jj` prefix

Do not prefix plain data with `jj`.

```js
const fruits = ['apple', 'orange', 'banana']
const userName = 'Ada'
const isOpen = false
const title = 'My Card'
```

The `jj` prefix is only for wrapper instances.

## Promises: name the future value, then add `Promise`

For promises, use the normal noun plus the `Promise` suffix.

Do not force `jj` into the promise name unless the promise variable itself is being used as a JJ wrapper value, which it usually is not.

```js
const templatePromise = fetchTemplate(import.meta.resolve('./my-card.html'))
const stylePromise = fetchStyle(import.meta.resolve('./my-card.css'))
```

After awaiting, use the wrapper naming rule:

```js
const jjTemplate = await templatePromise
const styleSheet = await stylePromise
```

## Private fields follow the same rule

Private fields that store wrappers should also use the `jj` prefix.

```js
class MyCard extends HTMLElement {
    #jjHost // JJHE wrapping the custom element itself
    #jjShadow // JJSR wrapping the shadow root
    #isInitialized = false

    constructor() {
        super()
        this.#jjHost = JJHE.from(this).setShadow('open')
        this.#jjShadow = this.#jjHost.getShadow(true)
    }
}
```

For light DOM components that do not use a shadow root, only `#jjHost` is needed:

```js
class MySection extends HTMLElement {
    #jjHost  // JJHE wrapping the custom element itself
    #isInitialized = false

    connectedCallback() {
        if (!this.#isInitialized) {
            this.#jjHost = JJHE.from(this)
            this.#jjHost.setTemplate(await templatePromise)
            this.#isInitialized = true
        }
    }
}
```

Examples:

- `#jjHost` for the `JJHE` wrapper of the custom element host (`JJHE.from(this)`)
- `#jjShadow` for the `JJSR` wrapper of the shadow root (`this.#jjHost.getShadow()`)
- `#jjTitle` for a cached wrapped title element

## Parameters and callback variables

If a parameter or callback variable is a JJ wrapper, prefix it with `jj` too.

```js
jjList.addChildMap(users, (user) => {
    return JJHE.tree('li', null, user.name)
})

jjList.getChildren().forEach((jjItem) => {
    jjItem.addClass('ready')
})

jjButton.run(function (jjSelf) {
    jjSelf.setAttr('aria-busy', 'true')
})
```

This is especially useful in event delegation and traversal code where native event targets and JJ wrappers may appear in the same block.

## Recommended common names

Use short, predictable names for common JJ wrapper entry points:

- `jjDoc` for `JJD.from(document)`
- `#jjHost` for `JJHE.from(this)` — the wrapped custom element host, used in both light and shadow DOM components
- `#jjShadow` for `this.#jjHost.getShadow()` — the wrapped shadow root, only present in shadow DOM components
- `h` for `JJHE.tree`

Example:

```js
const jjDoc = JJD.from(document)
const h = JJHE.tree
const jjFruits = jjDoc.find('#fruits', true)

jjFruits.addChild(h('li', null, 'Apple'))
```

`h` is the main deliberate exception to the `jj` prefix rule because it is a well-known local alias for the tree builder and not a stored wrapper instance.

## Avoid mixed naming for the same kind of value

Do not mix styles like these in the same file:

```js
const jjDoc = JJD.from(document)
const fruits = jjDoc.find('#fruits', true)
const wrappedSubmit = jjDoc.find('button#submit', true)
```

Prefer one convention consistently:

```js
const jjDoc = JJD.from(document)
const jjFruits = jjDoc.find('#fruits', true)
const jjSubmitBtn = jjDoc.find('button#submit', true)
```

## Suggested repository convention

Use this default throughout the repo:

- JJ wrappers: prefix with `jj`
- Native DOM values: use descriptive native names like `buttonEl`, `rootRef`, `shadowRoot`, `styleSheet`
- Plain data: normal JavaScript naming with no prefix
- Promises: noun plus `Promise`
- `JJHE.tree`: alias as `h` when it improves readability

This convention is explicit enough for AI agents and predictable enough for humans.
