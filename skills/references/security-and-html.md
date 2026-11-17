# Security and HTML

## Default: use setText

`setText` accepts any value and renders it as a text node — safe for user content:

```js
el.setText(userInput) // ✅ safe — rendered as text, never parsed as HTML
el.setText(42) // numbers coerced to string
el.setText(null) // clears text
```

For element wrappers (`JJHE`, `JJSE`, `JJME`), `setText` and `getText` are inherited from `JJE`
and use `textContent`.

If you specifically need HTML rendering-aware behavior, use the native escape hatch on HTML wrappers:

```js
jjEl.ref.innerText = 'Hello\nworld!'
```

For whole-document text, `Document.textContent` and `DocumentType.textContent` are `null`.
Use `JJD.getText()`, or `document.documentElement.textContent` directly.

## Explicit opt-in for HTML writes

`setHTML(html, unsafe?)` sets `innerHTML`. When `html` is non-empty, the second argument **must** be `true`:

```js
el.setHTML('<p>Trusted markup</p>', true) // ✅ explicit opt-in
el.setHTML('') // ✅ clearing is allowed without flag
el.setHTML('<p>content</p>') // ❌ throws — missing unsafe flag
```

Passing `true` is a deliberate signal that the caller has verified the content is safe. Use it only for markup from trusted sources (your own templates, sanitized strings).

## The same rule applies to HTML strings in templates

`addTemplate` and `setTemplate` parse a string with `Range.createContextualFragment`, which
is the same injection surface as `innerHTML`. A non-empty string therefore needs the same
opt-in:

```js
list.addTemplate('<li>Trusted literal</li>', true) // ✅ explicit opt-in
list.addTemplate('<li>Trusted literal</li>') // ❌ throws
list.addTemplate(await templatePromise) // ✅ already parsed, no flag
```

Pre-parsed sources — `DocumentFragment`, `<template>`, elements, JJ wrappers — are already
parsed and need no flag. `JJSR.init()` and `JJE.initShadow()` accept only those sources, so
shadow-root setup cannot bypass the guard.

**Rule of thumb:** any API that turns a string into DOM nodes requires `true`; any API that
receives nodes that already exist does not.

## Never use .ref.innerHTML for user content

```js
el.ref.innerHTML = userInput // ❌ bypasses JJ's guard — XSS risk
```

If you need a native escape hatch for trusted HTML, at minimum add a comment explaining why the content is safe.

## Sanitization

JJ does not bundle an HTML sanitizer. When rendering user-generated HTML is unavoidable:

1. Sanitize server-side before sending.
2. Or use the browser's built-in sanitizer (Chrome/Edge, MDN link below).

```js
const sanitizer = new Sanitizer()
el.ref.setHTML(userInput, { sanitizer }) // browser Sanitizer API
```

## Attribute safety

Setting attribute values with `setAttr` does **not** create XSS risk for standard attributes. Avoid setting `href`, `src`, or `action` to user-provided strings without validation:

```js
// validate before use
if (URL.canParse(userUrl) && new URL(userUrl).protocol === 'https:') {
    el.setAttr('href', userUrl)
}
```

## Content Security Policy

JJ itself does not use `eval` or inline event handlers. Adopting a CSP that restricts `unsafe-eval` and `unsafe-inline` is compatible with JJ.

## Browser references

- Element.innerHTML: https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML
- Sanitizer API: https://developer.mozilla.org/en-US/docs/Web/API/HTML_Sanitizer_API
- XSS overview: https://developer.mozilla.org/en-US/docs/Glossary/Cross-site_scripting
- Content Security Policy: https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
