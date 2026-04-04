# Performance Guide

This guide covers practical browser-native loading hints you can use with JJ.

## Why this matters

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

// Current-page critical stylesheet
document.head.addChild(
    h('link', {
        href: '/components/my-component.css',
        rel: 'preload',
        as: 'style',
    }),
)

// Future-navigation stylesheet
document.head.addChild(
    h('link', {
        href: '/next-page.css',
        rel: 'prefetch',
        as: 'style',
    }),
)

// Early module fetch
document.head.addChild(
    h('link', {
        href: '/app/entry.js',
        rel: 'modulepreload',
    }),
)
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
