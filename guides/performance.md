# Performance Guide

This guide covers practical browser-native loading hints you can use with JJ.

## Pre-load/fetch/parsing

For many apps, performance wins come from telling the browser what is likely needed soon:

- `preload` for current-page critical resources.
- `prefetch` for probable next-page resources.
- `modulepreload` for ES modules that should be fetched early.

These are native browser features and work without library-specific helpers.

## Native `<link>` hints with JJ

Use `JJHE.tree` (often aliased as `h`) to create link tags, then append to `document.head`.

```js
import { JJHE } from 'jj'

const h = JJHE.tree
const doc = JJD.from(document)

// Current-page critical stylesheet
doc.find('head', true).addChild(
    h('link', {
        href: '/components/my-component.css',
        rel: 'preload',
        as: 'style',
    }),
)

// Future-navigation stylesheet
doc.find('head', true).addChild(
    h('link', {
        href: '/next-page.css',
        rel: 'prefetch',
        as: 'style',
    }),
)

// Early module fetch
doc.find('head', true).addChild(
    h('link', {
        href: '/app/entry.js',
        rel: 'modulepreload',
    }),
)
```

## Parallel fetch

Many components need to fetch data and templates in parallel. Use `Promise.all` to wait for both before initializing:

```js
const templatePromise = fetchTemplate(import.meta.resolve('./my-card.html'))
const stylePromise = fetchStyle(import.meta.resolve('./my-card.css'))

class {
    //...
    #isInitialized = false
    async connectedCallback() {
        if (!this.#isInitialized) {
            const [template, style] = await Promise.all([templatePromise, stylePromise])
            this.#jjShadow.init(template, style)
            this.#isInitialized = true
        }
        this.#render()
    }
}
```

## Inline template and styles

Although we recommend separate files for maintainability, you can also inline templates and styles as strings:

```js
const template = `
    <div class="card">
        <h2>Title</h2>
        <p>Content</p>
    </div>
`

const css = `
    .card {
        border: 1px solid #ccc;
        padding: 16px;
        border-radius: 8px;
    }
`

class MyCard extends HTMLElement {
    //...
    async connectedCallback() {
        if (!this.#isInitialized) {
            // Note that the css string is converted to CSSStyleSheet synchronously
            this.#jjShadow.init(template, css)
            this.#isInitialized = true
        }
        this.#render()
    }
}
```

A cleaner way to inline the template is to get it from a `<template>` tag in the document.

```js
class MyCard extends HTMLElement {
    //...
    async connectedCallback() {
        if (!this.#isInitialized) {
            this.#jjShadow.init(JJD.from(document).find('#my-card-template', true))
            this.#isInitialized = true
        }
        this.#render()
    }
}
```

## Choosing the right hint

- Use `preload` when the current page needs the resource soon.
- Use `prefetch` when a future navigation might need the resource.
- Use `modulepreload` for ES module graphs you want fetched early.

When using `preload`, set `as` correctly (`style`, `script`, `fetch`, etc.) so the browser can prioritize and apply the right policy.

## Prefer explicit values

Avoid automatic guessing of `as` from file extension. Keep it explicit and readable:

```js
h('link', { href: '/styles/theme.css', rel: 'preload', as: 'style' })
h('link', { href: '/scripts/app.js', rel: 'preload', as: 'script' })
h('link', { href: '/page-data.json', rel: 'preload', as: 'fetch' })
```

## Related

- [styling guide](./styling.md)
- [architecture guide](./architecture.md)
- [templates guide](./templates.md)
- MDN preload: https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel/preload
- MDN prefetch: https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel/prefetch
- MDN modulepreload: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/rel/modulepreload

## Adding multiple children

Often, we need multiple elements to a parent. Adding them one by one forces the browser to redraw over and over again.

Instead, we can use a `DocumentFragment` to accumulate all the children and then add them in one go:

Instead of:

```ts
import { JJD, JJHE } from 'jj'

const doc = JJD.from(document)
const contents = ['New York', 'Stockholm', 'Tokyo']
const parent = doc.find('#parent-ul', true)

for (const city of contents) {
    parent.addChild(JJHE.create('li').setText(city))
}
```

Write:

```ts
import { JJD, JJDF, JJHE } from 'jj'

const doc = JJD.from(document)
const contents = ['New York', 'Stockholm', 'Tokyo']
const parent = doc.find('#parent-ul', true)

const jjFrag = JJDF.create()
for (const city of contents) {
    jjFrag.addChild(JJHE.create('li').setText(city))
}

parent.setChild(jjFrag)
```

If we're creating the elements from an array, there's even a shorter syntax for it:

```ts
import { JJD, JJHE } from 'jj'

const doc = JJD.from(document)
const contents = ['New York', 'Stockholm', 'Tokyo']
const parent = doc.find('#parent-ul', true)
parent.setChildMap(contents, (city) => JJHE.create('li').setText(city))
```

## Attaching event listeners

Attaching the event listener to each element, reduces performance and consumes too much memory.

Instead, we can attach the event listener to a common parent and take advantage of event bubbling and capturing.

Example, instead of:

```ts
import { JJD } from 'jj'

const doc = JJD.from(document)
const parent = doc.find('#parent-ul', true)
parent.findAll('li').forEach((child) => {
    child.on('click', () => alert('Hello world'))
})
```

Use event delegation:

```ts
import { JJD } from 'jj'

const doc = JJD.from(document)
const parent = doc.find('#parent-ul', true)
parent.on('click', (evt) => {
    if (!(evt.target instanceof Element) || evt.target.tagName !== 'LI') return
    alert('Hello world')
})
```

Note: `.on()` delegates directly to `addEventListener`, so `this` inside the handler is the **native element**, not the wrapper (this is native `EventTarget` behavior). Use an arrow function and capture the `jj*` wrapper you need.
