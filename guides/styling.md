# Styling in JJ

This guide explains how browser inline styles work and what JJ provides to make styling workflows fluent and explicit.

## How Browser Inline Styles Work

In the browser, every element that supports inline styles exposes a `style` object (a `CSSStyleDeclaration`).

- The `style` attribute in HTML is a text string.
- In JavaScript, `element.style` is an object view of that inline declaration.
- Inline styles generally have high specificity and often override stylesheet rules.

Common native patterns:

```js
// Replace full inline style declaration
el.style.cssText = 'display:grid; gap:1rem;'

// Set one property
el.style.setProperty('display', 'grid')

// Remove one property
el.style.removeProperty('display')
```

Inline styles are useful for:

- Dynamic runtime values (for example coordinates, dimensions, animation offsets)
- One-off computed values from JS
- Temporary overrides in interactive UI flows

Inline styles are usually not ideal for:

- Large, reusable visual systems
- Theme-wide color and spacing rules
- Complex responsive rules and pseudo-selectors

For those, prefer CSS files and classes.

## JJ Style Helpers

JJ provides fluent inline style helpers on `JJEx`, which means they are available on:

- `JJHE`
- `JJSE`
- `JJME`

They are intentionally not on `JJE` because generic `Element` does not guarantee inline-style support in TypeScript.

### Available Methods

- `getStyle(name)`
- `setStyle(name, value)`
- `rmStyle(...names)`
- `setStyles(styleMap)`

### Quick Examples

```js
import { JJHE } from 'jj'

const card = JJHE.create('div')

// Set a single property
card.setStyle('display', 'grid')

// Read a single property
const display = card.getStyle('display')

// Set more properties
card.setStyle('background-color', 'var(--background-lighter)')
card.setStyle('border-radius', 'var(--bradius)')

// Remove properties
card.rmStyle('background-color')

// Batch set/remove
card.setStyles({
    display: 'grid',
    gap: 'var(--gap2)',
    opacity: 0,
    color: null,
})
```

`setStyles` behavior:

- `null` or `undefined` map input: no-op
- plain object input: iterate properties
- value is `null`, `undefined`, or `false`: remove property
- any other value: set property

This preserves useful values like `0`.

## Inline Styles vs Class Helpers

JJ also provides class helpers on `JJE` and descendants:

- `setClass`
- `addClass`
- `rmClass`
- `setClasses`

Use classes for stable reusable styling, and inline styles for dynamic values.

```js
const panel = JJHE.create('section')
    .setClass('panel')
    .setClasses({
        'is-open': isOpen,
        'is-busy': isBusy,
    })
    .setStyles({
        height: `${height}px`,
        transform: `translateY(${offsetY}px)`,
    })
```

## External Styles with fetchStyle

For component-scale styling, prefer CSS files and constructable stylesheets.

Use `fetchStyle(url)` to load CSS into a `CSSStyleSheet`:

```js
import { fetchStyle, JJHE } from 'jj'

const stylePromise = fetchStyle(import.meta.resolve('./my-component.css'))

class MyComponent extends HTMLElement {
    constructor() {
        super()
        JJHE.from(this).setShadow('open')
    }

    async connectedCallback() {
        JJHE.from(this)
            .getShadow(true)
            .addStyle(await stylePromise)
    }
}
```

`fetchStyle` is especially useful with shadow DOM because `JJSR.addStyle()` can adopt stylesheets directly after `setShadow()` has attached the root.

## Preloading and Prefetching Style Resources

Use native `<link>` elements to hint resource loading:

```js
import { JJHE } from 'jj'

const h = JJHE.tree

document.head.addChild(
    h('link', {
        href: '/components/my-component.css',
        rel: 'preload',
        as: 'style',
    }).ref,
)

document.head.addChild(
    h('link', {
        href: '/next-page.css',
        rel: 'prefetch',
        as: 'style',
    }).ref,
)
```

For behavior guidelines and when to use each hint, see the performance guide.

## Recommended Workflow

1. Use CSS files for reusable look and theme rules.
2. Use class helpers for state and variants.
3. Use style helpers for dynamic runtime values.
4. Use `fetchStyle` for shadow DOM component styling.
5. Optionally add native `<link rel="preload" as="style">` and `<link rel="prefetch" as="style">` hints.

## Continue Reading

For full component styling patterns (shadow and light DOM, eager/lazy loading, template/style separation), continue with:

- [www/tutorial/custom-components.md](../www/tutorial/custom-components.md)
- [performance guide](./performance.md)
