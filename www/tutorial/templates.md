# Templates

In the previous step we built components and observed attributes. Now we focus on templates.

JJ accepts multiple template sources, which lets you pick the right tool for each component size and complexity.

## Template source options

| Approach                        | What it is                                                            | When to use                                                                                                                  |
| ------------------------------- | --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Fetch `.html` file              | `fetchTemplate(import.meta.resolve('./x.html'))`                      | Large, content-heavy markup that should live outside JS. We can see the pattern for lazy/eager loading of the template file. |
| `<template>` tag                | `setTemplate(templateEl)` where `templateEl` is `HTMLTemplateElement` | Markup is already present in the page and should be cloned on demand.                                                        |
| Another Element node            | `setTemplate(someElement)`                                            | Rare cases where an existing element subtree is your source. Usually inferior to `<template>`.                               |
| Hard-coded HTML string          | `setTemplate('<p>tiny snippet</p>')`                                  | Very small static snippets when you do not need references to internals.                                                     |
| `JJHE.tree()` / `JJHE.create()` | Build wrapped nodes in JS, then `setTemplate(node)`                   | Dynamic UI where you need references for later updates.                                                                      |

## `this.#jjHost` / `this.#jjShadow` convention

Use one convention consistently in your custom elements:

- Light DOM component: `this.#jjHost = JJHE.from(this)`
- Shadow DOM component: attach in the constructor and store it `this.#jjShadow = JJHE.from(this).setShadow(...).getShadow(true)`
    - Keep the initialization status in `#isInitialized` and guard `connectedCallback()` to run `this.#jjShadow.init()` only once.

That gives you a predictable wrapper to query and update.

## Example: Shadow DOM + fetched template

```js
import { defineComponent, fetchTemplate, JJHE } from 'jj'

const templatePromise = fetchTemplate(import.meta.resolve('./my-card.html'))

export class MyCard extends HTMLElement {
    static defined = defineComponent('my-card', MyCard)

    #jjShadow = null
    #isInitialized = false

    constructor() {
        super()
        this.#jjShadow = JJHE.from(this).setShadow('open').getShadow(true)
    }

    async connectedCallback() {
        if (this.#isInitialized) {
            return
        }
        this.#jjShadow.init(await templatePromise)
        this.#isInitialized = true
    }
}
```

### Lazy loading templates

The previous example shows eager loading: the fetch starts as soon as the module loads.

Sometimes you want lazy loading instead: only fetch when the first instance of your custom element is connected.
The pattern is:

1. Declare a promise variable at module scope, but do not initialize it.
2. In `connectedCallback()`, assign it only if it is still empty.
3. Await the promise in `connectedCallback()`.

This works for both shadow and light DOM components.

### Shadow DOM + lazy template loading

```js
import { defineComponent, fetchTemplate, JJHE } from 'jj'

let templatePromise

export class LazyShadowCard extends HTMLElement {
    static defined = defineComponent('lazy-shadow-card', LazyShadowCard)

    #jjShadow = null
    #isInitialized = false

    constructor() {
        super()
        this.#jjShadow = JJHE.from(this).setShadow('open').getShadow(true)
    }

    async connectedCallback() {
        if (this.#isInitialized) {
            return
        }
        if (!templatePromise) {
            templatePromise = fetchTemplate(import.meta.resolve('./lazy-shadow-card.html'))
        }
        this.#jjShadow.init(await templatePromise)
        this.#isInitialized = true
    }
}
```

## Example: Light DOM + `<template>` tag

```js
import { defineComponent, JJHE } from 'jj'

const domTemplate = document.querySelector('#my-light-template')

export class MyLightCard extends HTMLElement {
    static defined = defineComponent('my-light-card', MyLightCard)

    #jjHost = null

    connectedCallback() {
        if (this.#jjHost) {
            return
        }
        this.#jjHost = JJHE.from(this)
        this.#jjHost.setTemplate(domTemplate)
    }
}
```

### Light DOM + lazy template loading

```js
import { defineComponent, fetchTemplate, JJHE } from 'jj'

let templatePromise

export class LazyLightCard extends HTMLElement {
    static defined = defineComponent('lazy-light-card', LazyLightCard)

    #jjHost = null

    async connectedCallback() {
        if (this.#jjHost) {
            return
        }
        this.#jjHost = JJHE.from(this)
        if (!templatePromise) {
            templatePromise = fetchTemplate(import.meta.resolve('./lazy-light-card.html'))
        }
        this.#jjHost.setTemplate(await templatePromise)
    }
}
```

## Example: Dynamic UI with `JJHE.tree()`

```js
import { JJHE } from 'jj'

const h = JJHE.tree

const counterValue = h('strong', { 'data-role': 'value' }, '0')
const view = h('p', null, 'Count: ', counterValue)

JJHE.from(this).setTemplate(view)
// Later, you can update the same reference:
counterValue.setText('1')
```

## Safety note

JJ requires an explicit confirmation when setting non-empty HTML strings. This helps prevent accidental unsafe HTML injection. For user-provided content, use text methods.

## Quick checklist

- Keep template promises at module scope when fetching files
- For lazy loading, initialize the promise inside `connectedCallback()` using an `if (!promise)` guard
- Initialize once in `connectedCallback`
- Use `<template>` for reusable DOM snippets already on the page
- Use `JJHE.tree()` / `JJHE.create()` when you need mutable references

## Next up: Styles

Now that template strategies are clear, we can focus on stylesheet loading, scoping, and theming.
