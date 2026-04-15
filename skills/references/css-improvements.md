# CSS Improvements

Use JJ for DOM wiring and rely on CSS standards for the styling system.

## JJ style helpers with examples

```js
// Single property
el.setStyle('color', 'var(--color-brand)')
el.setStyle('padding', '8px 16px')

// Batch — null/false removes the property
el.setStyles({
    color: 'red',
    padding: '8px',
    border: null, // removes border
    background: false, // removes background
})

// Remove properties
el.rmStyle('color', 'padding')

// Read a property
const val = el.getStyle('color') // '' when not set
```

## Class-driven styling (preferred)

Modify classes and keep visual logic in CSS:

```js
el.addClass('is-active')
el.rmClass('is-loading')
el.swClass('is-expanded', isExpanded) // explicit: condition drives add/remove
el.swClass('is-expanded') // auto: flips current state
el.setClasses({ 'is-active': isActive, 'is-error': hasError })
el.setClass('card card--featured') // replaces entire className
```

## Text direction and advanced DOM state

```js
el.setAttr('dir', 'rtl')
el.setAttr('lang', 'ar')
```

## CSS custom properties pierce Shadow DOM

Custom properties cascade through shadow boundaries. Define variables on the host or `:root`:

```css
:root {
    --btn-color: #0070f3;
}
```

Inside shadow styles:

```css
button {
    background: var(--btn-color);
}
```

## Loading css files

```js
import { JJD, JJHE, fetchStyle } from 'jj'

const h = JJHE.tree
const jjDoc = JJD.from(document)

// Hint browser to start loading early
jjDoc.find('head', true).addChild(
    h('link', {
        href: import.meta.resolve('./theme.css'),
        rel: 'preload',
        as: 'style',
    }).ref,
)

// Load as a CSSStyleSheet for adoptedStyleSheets
const sheet = await fetchStyle(import.meta.resolve('./theme.css'))
document.adoptedStyleSheets = [sheet]
```

## Browser references

- CSSStyleDeclaration: https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleDeclaration
- CSS nesting: https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Nesting
- CSS custom properties: https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties
- adoptedStyleSheets: https://developer.mozilla.org/en-US/docs/Web/API/Document/adoptedStyleSheets
