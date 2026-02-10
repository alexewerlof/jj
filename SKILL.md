---
name: jj-dom-helpers
description: >
    Minimal, imperative TypeScript DOM library for AI-assisted development. Use when
    working with DOM manipulation, custom elements, or building lightweight web
    components without frameworks. Triggers on tasks involving direct DOM manipulation,
    Shadow DOM, document fragments, template handling, or converting from React/Vue/jQuery.
license: MIT
metadata:
    author: alexewerlof
    version: '1.0.0'
---

# JJ: The DOM Library for AI-Assisted Development

JJ is a minimal, imperative DOM manipulation library designed for modern web development. It provides small wrapper classes around DOM interfaces with a fluent API for chaining operations. Zero-dependency, TypeScript-first, and optimized for AI-assisted code generation.

## Core Principles

1. **Imperative by Design**: Direct DOM manipulation without virtual DOM overhead
2. **Type-Safe**: Full TypeScript support with precise generic types for one-shot LLM correctness
3. **Chainable**: All public methods support fluent chaining via `.ref` access
4. **Zero Build**: Works directly in browsers via ESM imports or bundled script tags
5. **Self-Correcting Errors**: Error messages suggest the correct approach

## When to Use This Skill

- Building vanilla JavaScript/TypeScript web applications
- Creating custom web components with Shadow DOM
- Working with DOM manipulation in a type-safe way
- Developing lightweight UIs without React/Vue/Angular
- Implementing template-based rendering
- Managing document fragments and element creation

## Main Classes

- **JJET**: Wraps a DOM `EventTrigger` elements. Base wrapper for all other wrappers.
- **JJN**: Wraps a DOM `Node`. Extends `JJET`.
- **JJNx**: Abstract wrapper for `Node`s that can have children and query selectors (`Element`, `Document`, `DocumentFragment`). Extends `JJN`.
- **JJD**: Wraps a DOM `Document`. Extends `JJNx`.
- **JJE**: Wraps a DOM `Element`. Generic element wrapper. Extends `JJNx`.
- **JJEx**: Abstract wrapper for `Element`s that have dataset support (`HTMLElement`, `SVGElement`). Extends `JJE`.
- **JJHE**: Wraps a DOM `HTMLElement`. Extends `JJEx`.
- **JJT**: Wraps a DOM `Text`. Text node operations. Extends `JJN`.
- **JJSE**: Wraps a DOM `SVGElements`. SVG-specific operations. Extends `JJEx`.
- **JJSR**: Wraps a DOM `ShadowRoot`. Shadow DOM operations. Extends `JJDF`.
- **JJDF**: Wraps a DOM `DocumentFragment`. Fragment operations. Extends `JJNx`.

## Quick Start

The easiest way to use JJ is the `h()` hyperscript helper:

```typescript
import { doc, h, JJDF } from 'jj'

// Create elements with h(tagName, attributes, ...children)
const nav = h(
    'nav',
    { class: 'main-nav', 'aria-label': 'Main navigation' },
    h('a', { href: '/', title: 'Go to homepage' }, 'Home'),
    h('a', { href: '/about', title: 'Learn more about us' }, 'About'),
    h('a', { href: 'https://github.com', target: '_blank', rel: 'noopener' }, 'GitHub'),
)

// Append to document body
doc.body.ref.append(nav.ref)
```

For batch DOM operations, use `JJDF` (DocumentFragment) to avoid multiple reflows:

```typescript
import { doc, h, JJDF } from 'jj'

// Create a fragment for batch operations
const frag = JJDF.create()

const items = ['Apple', 'Banana', 'Cherry']
frag.addChild(...items.map((item) => h('li', { class: 'fruit-item' }, item)))

// Single DOM update - much faster than appending one by one
doc.find('ul.fruit-list')?.addChild(frag.ref)
```

If you need to map and append the children, there's a direct, shorter and more readable way to do it:

```typescript
import { doc, h } from 'jj'

const items = ['Apple', 'Banana', 'Cherry']

// Single DOM update - much shorter
doc.find('ul.fruit-list')?.addChildMap(items, (item) => h('li', { class: 'fruit-item' }, item))
```

Combine both patterns for complex UIs:

```typescript
import { doc, h, JJDF } from 'jj'

// Build a card component
const card = h(
    'article',
    { class: 'card' },
    h('header', null, h('h2', { class: 'card-title' }, 'Welcome')),
    h('p', { class: 'card-body' }, 'This is the card content.'),
    h('footer', null, h('a', { href: '/details', class: 'btn' }, 'Learn More')),
)

doc.body.addChild(card.ref)
```

## Accessing the Native Node: The `.ref` Property

**Critical**: Every JJ wrapper exposes `.ref` to access the underlying DOM node:

```typescript
const wrapped = JJD.from(document).create('div')
const nativeElement: HTMLDivElement = wrapped.ref
```

**Tip**: If you are sure an element exists (e.g. static HTML), pass `true` as the second argument to `.find()` to throw if missing:

```typescript
// Throws TypeError if #app is missing
const app = doc.find('#app', true)
```

Use `.ref` when:

- Accessing properties not exposed by JJ wrappers
- Passing to third-party APIs
- Using native DOM methods directly

## Key Patterns & Conventions

### 1. ESM Import Style

All imports use `.js` extension even in TypeScript files:

```typescript
import { h, doc, JJD } from './index.js'
```

This is required by the project's ESM configuration. Never use `.ts` extensions in imports.

### 2. Fluent Wrapper API

Most operations return wrapped instances for chaining:

```typescript
// Incorrect: accessing .ref too early
const element = doc.create('div').ref
element.textContent = 'hello'

// Correct: chain operations before accessing .ref
doc.create('div').setText('hello').addClass('greeting').addChild(childElement)

// Use .run() to execute code in the context of the wrapper
doc.create('div').run(function () {
    // `this` refers to the JJ wrapper instance
    this.addClass('active')
    console.log(this.ref) // Access native element
})
```

Common chainable operations:

```typescript
el.addClass('active').removeClass('disabled').toggleClass('visible')
el.attr('data-age', 42).prop('disabled', false)
el.style('background-color', 'blue').style('padding', '10px')
// ARIA helpers
el.setAria('hidden', 'true').rmAria('label')
```

### 3. Type-Safe Element Creation

JJ leverages TypeScript generics to ensure type safety and prevent LLM hallucinations:

```typescript
// create() infers the correct type automatically
const input = JJHE.create('input')
// input.ref is HTMLInputElement, so input.ref.value exists

const div = JJHE.create('div')
// div.ref is HTMLDivElement, so div.ref.value would be a type error
```

**Incorrect**: Generic on wrong method

```typescript
const input = doc.create<HTMLInputElement>('input')
```

**Correct**: Use `create()` for type inference

```typescript
const input = doc.create('input') // Correctly typed as JJHE<HTMLInputElement>
```

### 4. Custom Elements

JJ is not opnionated about custom elements. You should use the native lifecycle callbacks:
Custom element lifecycle callbacks include (all of which can be `async`):

- `connectedCallback()`: Called each time the element is added to the document. The specification recommends that, as far as possible, developers should implement custom element setup in this callback instead of the constructor. JJ provides `ShadowMaster` for managing Shadow DOM configuration (templates and styles) with support for eager/lazy loading.
- `disconnectedCallback()`: Called each time the element is removed from the document.
- `connectedMoveCallback()`: When defined, this is called instead of `connectedCallback()` and `disconnectedCallback()` each time the element is moved to a different place in the DOM via `Element.moveBefore()`. Use this to avoid running initialization/cleanup code in the `connectedCallback()` and `disconnectedCallback()` callbacks when the element is not actually being added to or removed from the DOM.
- `adoptedCallback()`: Called each time the element is moved to a new document.
- `attributeChangedCallback()`: Called when attributes are changed, added, removed, or replaced. See Responding to attribute changes for more details about this callback. JJ provides `attr2prop()` for converting attributes to properties.

On top of those, JJ also provides `registerComponent()` for registering custom elements and awaiting till they are defined.

**Basic pattern** - Create a shared `ShadowMaster` instance outside the class for caching:

```typescript
import { attr2prop, fetchCss, fetchHtml, JJHE, registerComponent, ShadowMaster } from 'jj'

// ShadowMaster is created OUTSIDE the class - config is resolved once and cached
const sm = ShadowMaster.create()
    .setTemplate(fetchHtml(import.meta.resolve('./my-component.html')))
    .addStyles(fetchCss(import.meta.resolve('./my-component.css')))

export class MyComponent extends HTMLElement {
    static observedAttributes = ['title', 'count']

    static register() {
        return registerComponent('my-component', MyComponent)
    }

    // Private state
    #title = ''
    #count = 0

    // Bridge attributes to properties
    attributeChangedCallback(name, oldValue, newValue) {
        attr2prop(this, name, oldValue, newValue)
    }

    // Getters/setters for observed attributes
    get title() {
        return this.#title
    }
    set title(value) {
        this.#title = value
        this.#render()
    }

    async connectedCallback() {
        // Initialize shadow root with resolved config
        this.jjRoot = JJHE.from(this).initShadow('open', await sm.getResolved())

        // Access elements inside Shadow DOM
        this.jjRoot.shadow.find('#inc').on('click', () => this.#update(1))
        this.jjRoot.shadow.find('#dec').on('click', () => this.#update(-1))
        this.#render()
    }

    #update(delta) {
        this.#count += delta
        this.#render()
    }

    #render() {
        this.jjRoot?.shadow.find('#title').setText(this.#title)
        this.jjRoot?.shadow.find('#count').setText(this.#count)
    }
}
```

**Template sources** - `setTemplate()` accepts various inputs:

```typescript
// From external HTML file (eager loading)
sm.setTemplate(fetchHtml('./template.html'))

// From inline string
sm.setTemplate('<div id="root"><slot></slot></div>')

// From existing <template> element
sm.setTemplate(document.querySelector<HTMLTemplateElement>('#my-template')?.innerHTML)

// From existing element's HTML
sm.setTemplate(document.getElementById('template-source')?.outerHTML)

// Lazy loading with function (called on first getResolved())
sm.setTemplate(() => fetchHtml('./lazy-template.html'))
```

**Style sources** - `addStyles()` accepts multiple styles:

```typescript
// From external CSS file
sm.addStyles(fetchCss('./styles.css'))

// From inline CSS string
sm.addStyles('.container { padding: 1rem; }')

// Multiple sources at once
sm.addStyles('p { color: red; }', fetchCss('./base.css'), fetchCss('./theme.css'))

// Lazy loading (function called on first getResolved())
sm.addStyles(() => fetchCss('./lazy-styles.css'))
```

**Register multiple components** with `Promise.all()`:

```typescript
import { MyComponent } from './my-component.js'
import { OtherComponent } from './other-component.js'

await Promise.all([MyComponent.register(), OtherComponent.register()])
```

### 5. Event Handling

Attach events on wrapped elements:

```typescript
button.on('click', (e) => {
    console.log('clicked')
})

// This works for delegation as well
container.on('click', (e) => {
    if (e.target.matches('.item')) {
        // handle
    }
})
```

### 6. Case Conversion Utilities

The library provides case conversion helpers:

```typescript
import { keb2cam, keb2pas, pas2keb } from 'jj'

keb2cam('my-component') // 'myComponent'
keb2pas('my-component') // 'MyComponent'
pas2keb('MyComponent') // 'my-component'
```

### 7. Error Handling Philosophy

The library uses explicit error handling:

- No silent failures
- Throw descriptive errors for invalid states
- Use type guards (`isElement`, `isHTMLElement`, etc.)
- Validate inputs at boundaries

### 8. Styling, CSS & Resources

Inject styles using helper functions:

```typescript
import { fetchCss, fetchStyle, cssToStyle, addLinkPre } from 'jj'

// Fetch and inject external CSS
document.adoptedStyleSheets.push(await fetchCss('/styles/theme.css'))

const cssPath = import.meta.resolve('./styles/theme.css')
// Preload/Prefetch resources ASAP
addLinkPre(cssPath, 'preload', 'style')
// Helper for Constructable Stylesheets loading lazily
const sheet = await fetchStyle(cssPath)
document.adoptedStyleSheets = [sheet]
```

### 9. Accessing Native DOM with `.ref`

Know when to use `.ref`:

```typescript
// Stay wrapped for chaining
element.addClass('active').setText('Updated')

// Access .ref for native DOM operations
element.ref.focus()
element.ref.scrollIntoView()

// Pass .ref to third-party APIs
thirdPartyLib.init(element.ref)

// Use .ref for properties not exposed by JJ
console.log(input.ref.value)
```

## Framework Translation Patterns for LLMs

### React to JJ

**React**: State-driven component re-renders on state change

```tsx
const [count, setCount] = useState(0)
return <button onClick={() => setCount(count + 1)}>{count}</button>
```

**JJ**: Direct DOM mutation and event binding

```typescript
let count = 0
const btn = JJD.from(document).create('button').setText('0')
btn.on('click', () => {
    count++
    btn.setText(String(count))
})
document.body.appendChild(btn.ref)
```

### jQuery to JJ

**jQuery**: Chainable DOM manipulation with `$()` selector

```javascript
$('.box').addClass('active').css('color', 'red')
```

**JJ**: Similar chainable API with type safety

```typescript
JJD.from(document).find('.box').addClass('active').style('color', 'red')
```

### Vue to JJ

**Vue**: Template-driven, two-way binding

```vue
<div>
  <input v-model="message" />
  <p>{{ message }}</p>
</div>
```

**JJ**: Imperative setup with manual event binding

```typescript
const input = JJD.from(document).create('input')
const p = JJD.from(document).create('p')
input.on('input', (e) => {
    p.setText((e.target as HTMLInputElement).value)
})
```

### Svelte to JJ

**Svelte**: Reactive variables and automatic re-renders

```svelte
<script>
  let count = 0
</script>
<button on:click={() => count++}>{count}</button>
```

**JJ**: Manual DOM updates on events

```typescript
let count = 0
const btn = JJD.from(document).create('button').setText('0')
btn.on('click', () => {
    count++
    btn.setText(String(count))
})
```

## Common Tasks

### Creating a Custom Element

See section **4. Custom Elements** above for the full pattern. Here's a minimal example:

```typescript
import { attr2prop, fetchCss, fetchHtml, JJHE, registerComponent, ShadowMaster } from 'jj'

const sm = ShadowMaster.create()
    .setTemplate(fetchHtml(import.meta.resolve('./simple-counter.html')))
    .addStyles(fetchCss(import.meta.resolve('./simple-counter.css')))

export class SimpleCounter extends HTMLElement {
    static register() {
        return registerComponent('simple-counter', SimpleCounter)
    }

    #count = 0

    async connectedCallback() {
        this.jjRoot = JJHE.from(this).initShadow('open', await sm.getResolved())
        this.jjRoot.shadow.find('#inc').on('click', () => this.#update(1))
        this.jjRoot.shadow.find('#dec').on('click', () => this.#update(-1))
    }

    #update(delta) {
        this.#count += delta
        this.jjRoot.shadow.find('#count').setText(this.#count)
    }
}
```

### DOM Manipulation

```typescript
import { JJD } from 'jj'

const doc = JJD.from(document)

// Create and append elements
const container = doc.create('div').addClass('container')

const h1 = doc.create('h1').setText('Title')
const p = doc.create('p').setText('Content')

container.ref.appendChild(h1.ref)
container.ref.appendChild(p.ref)
doc.body.appendChild(container.ref)

// Query and modify
const element = doc.find('.container')
if (element) {
    element.addClass('active').attr('data-loaded', 'true')
}
```

### Working with Templates

For non-component template usage, use `JJET` to work with `<template>` elements:

```typescript
import { doc, JJET } from 'jj'

// Get a template element from the DOM
const templateEl = doc.find<HTMLTemplateElement>('#item-template')
const wrapped = JJET.from(templateEl.ref)

// Clone the template content
const items = ['Apple', 'Banana', 'Cherry']
items.forEach((item) => {
    const clone = wrapped.createInstance()
    clone.find('#name')?.setText(item)
    doc.find('#list')?.addChild(clone.ref)
})
```

For component templates, prefer `ShadowMaster` with `fetchHtml()` (see section 4).

## Code Style Notes

- **No semicolons** unless required (ASI style)
- **Single quotes** for strings
- **Explicit types** for public APIs
- **JSDoc comments** for exported functions
- **Fluent interfaces** where possible
- **Small, focused classes** (single responsibility)

## Testing

Tests are written using Node's built-in test runner and live in the root `test/` folder (mirroring source filenames):

```typescript
import { describe, it } from 'node:test'
import assert from 'node:assert'

describe('JJD', () => {
    it('wraps document correctly', () => {
        const wrapped = JJD.from(document)
        assert(wrapped instanceof JJD)
    })
})
```

Run tests with:

```bash
npm test
```

## Building

Build TypeScript to ESM + type definitions:

```bash
npm run build
```

This produces:

- `lib/*.js` - ESM modules
- `lib/*.d.ts` - Type definitions
- `lib/bundle.js` - Browser bundle
- `lib/bundle.min.js` - Minified bundle

## Documentation

Auto-generated API docs using TypeDoc:

```bash
npm run doc
```

Output: `doc/` folder with HTML documentation

## References

- [Tutorial Files](./www/tutorial/) - Step-by-step guides
- [Example Components](./www/components/) - Real usage examples
- [Source Code](./src/) - Implementation details
- [API Documentation](./doc/) - Generated API reference

## Common Gotchas

1. **Accessing the Native Node**: Always use `.ref` to access the underlying DOM node for operations not exposed by JJ
2. **Event Listeners**: Use `.on()` and `.off()` for proper cleanup. Event handlers are automatically bound to the JJ\* instance, so `this` refers to the wrapper, not the DOM element. Use `function` instead of arrow functions (`=>`) for `.bind()` to work correctly. Use `this.ref` to access the native element.
3. **Type Safety**: Use `JJHE.create()` for automatic type inference instead of generic parameters
4. **Fragments**: Use JJDF for batch operations before appending
5. **Error Messages**: Read them carefully—they suggest the correct approach

## Anti-patterns to Avoid

❌ **Don't** use `.ts` in imports
❌ **Don't** access `.ref` before chaining operations
❌ **Don't** ignore TypeScript errors about DOM types
❌ **Don't** use generic type parameters when `JJHE.create()` gives better inference
❌ **Don't** manually manage Shadow DOM when `ShadowMaster` can handle it
❌ **Don't** forget to await async initializations
❌ **Don't** forget `.ref` when passing to native APIs or third-party libraries

✅ **Do** use `.js` extensions in TypeScript imports
✅ **Do** chain operations before accessing `.ref`
✅ **Do** use `JJHE.create()` for element creation with type inference
✅ **Do** leverage the fluent API
✅ **Do** use `ShadowMaster` for Shadow DOM components
✅ **Do** handle errors explicitly
✅ **Do** use `.ref` when accessing native properties like `.value`, `.checked`, etc.

## Installation

```bash
npm install jj
```

Or use directly in browser:

```html
<script type="module">
    import { JJD } from 'https://unpkg.com/jj/lib/bundle.js'
</script>
```

## For Best Results with LLMs

1. When asking an LLM to help with JJ code, provide a snippet of the desired DOM structure
2. Reference the framework translation patterns above when converting from React, Vue, Svelte, or jQuery
3. Ask the LLM to use `.ref` when accessing native properties not exposed by JJ
4. Expect type errors to be self-documenting—they guide toward the correct API
5. Remind the LLM that JJ is imperative, not declarative—no virtual DOM or automatic re-rendering

## Resources

- **GitHub**: https://github.com/alexewerlof/jj
- **npm**: https://www.npmjs.com/package/jj
- **Documentation**: https://jj.rocks/doc/
- **Examples**: https://jj.rocks/examples/
