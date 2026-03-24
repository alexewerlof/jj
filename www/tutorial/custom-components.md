# Custom Components with JJ

This guide covers how to create [Custom Elements](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements) (Web Components) using JJ's helper utilities.

## Overview

JJ provides three main utilities for building custom components:

- **`fetchTemplate()` + `fetchStyle()`** - Load reusable shadow resources at module scope
- **`defineComponent()`** - Registers and waits for the custom element definition
- **`attr2prop()`** - Bridges HTML attributes to JavaScript properties

## Basic Component Structure

Here's the recommended pattern for creating a custom component:

```javascript
import { attr2prop, fetchStyle, fetchTemplate, JJHE, defineComponent } from 'jj'

// 1. Create shared resource promises at module scope.
const templatePromise = fetchTemplate(import.meta.resolve('./my-component.html'))
const stylePromise = fetchStyle(import.meta.resolve('./my-component.css'))

// 2. Define the component class
export class MyComponent extends HTMLElement {
    // 3. Expose a static readiness promise
    static defined = defineComponent('my-component', MyComponent)

    // 4. Initialize shadow root in connectedCallback
    async connectedCallback() {
        this.jjRoot = JJHE.from(this).initShadow('open', await templatePromise, await stylePromise)
    }
}
```

Then in another file you can import and use the component like this:

```javascript
import { MyComponent } from './path/to/MyComponent.js'

await MyComponent.defined
```

If you import multiple components, you can await readiness in parallel:

```javascript
import { Component1 } from './path/to/Component1.js'
import { Component2 } from './path/to/Component2.js'
import { Component3 } from './path/to/Component3.js'

await Promise.all([Component1.defined, Component2.defined, Component3.defined])
```

`defineComponent(name, constructor, options?)` resolves a `Promise<boolean>`:

- `false` means this call defined the component.
- `true` means the same constructor was already defined.

Explicitly defining and awaiting `.defined` is important. Without it, markup can be parsed before the browser has the component definition, which can cause timing-sensitive or flaky upgrades.

## Custom Element Lifecycle

Browsers support several lifecycle callbacks for custom components. Here's when each fires:

### `constructor()`

Called when an custom element is created (via `document.createElement()` or the HTML parser).
**Make sure that the element is defined and ready. Use the `defineComponent()` helper function for both.**

```javascript
constructor() {
    super()  // MUST call super() first
    // Initialize private state, but do NOT access attributes or children
    this.#count = 0
}
```

**Rules:**

- Must call `super()` first
- Cannot read attributes (they may not be set yet)
- Cannot access child elements (may not be parsed yet)
- Cannot add children or set attributes

> 📚 [MDN: constructor](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#custom_element_lifecycle_callbacks)

### `connectedCallback()`

Called when the element is inserted into the DOM. This is where most initialization happens.

```javascript
async connectedCallback() {
    // Initialize Shadow DOM
    this.jjRoot = JJHE.from(this).initShadow('open', await templatePromise, await stylePromise)

    // Set up event listeners
    this.jjRoot.shadow.find('#btn').on('click', () => this.#handleClick())

    // Initial render
    this.#render()
}
```

**Use for:**

- Setting up Shadow DOM
- Adding event listeners
- Fetching resources
- Initial rendering

> 📚 [MDN: connectedCallback](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#connectedcallback)

### `disconnectedCallback()`

Called when the element is removed from the DOM.

```javascript
disconnectedCallback() {
    // Clean up timers, observers, connections
    clearInterval(this.#timer)
    this.#abortController?.abort()
}
```

**Use for:**

- Cleaning up timers/intervals
- Removing global event listeners
- Closing connections
- Aborting fetch requests

> 📚 [MDN: disconnectedCallback](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#disconnectedcallback)

### `attributeChangedCallback(name, oldValue, newValue)`

Called when an observed attribute changes. Only fires for attributes listed in `observedAttributes`.

```javascript
static observedAttributes = ['title', 'count', 'user-name']

attributeChangedCallback(name, oldValue, newValue) {
    attr2prop(this, name, oldValue, newValue)
}
```

**Important:** This may fire BEFORE `connectedCallback()` if attributes are set in HTML.
This means you may not yet have access to shadow.

> 📚 [MDN: attributeChangedCallback](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#responding_to_attribute_changes)

### `adoptedCallback()`

Called when the element is moved to a new document (e.g., via `document.adoptNode()`).

```javascript
adoptedCallback() {
    // Rarely needed - re-attach document-specific listeners
}
```

> 📚 [MDN: adoptedCallback](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#adoptedcallback)

## Reactive Props: The Native Way

If you're coming from frameworks like Vue, React, or Svelte, you're familiar with "reactive props" — properties that automatically trigger re-renders when changed. The browser has this built-in via `observedAttributes`!

### Framework Comparison

| Framework      | Reactive Props       | How Changes Are Detected                 |
| -------------- | -------------------- | ---------------------------------------- |
| **Vue**        | `defineProps()`      | Compiler magic + Proxy                   |
| **React**      | `props` object       | Parent re-render passes new props        |
| **Svelte**     | `export let prop`    | Compiler-generated updates               |
| **Angular**    | `@Input()` decorator | Change detection cycle                   |
| **Native Web** | `observedAttributes` | Browser calls `attributeChangedCallback` |

### The Native Browser API

The browser provides a reactive system out of the box:

```javascript
class MyComponent extends HTMLElement {
    // 1. Declare which attributes to watch (like Vue's props or React's propTypes)
    static observedAttributes = ['message', 'count', 'is-active']

    // 2. Browser calls this when ANY observed attribute changes
    attributeChangedCallback(name, oldValue, newValue) {
        // This is your "reactive" hook - re-render here!
        this.#render()
    }
}
```

This is **zero-dependency reactivity** — no framework, no build step, no virtual DOM. The browser handles change detection for you.

### Vue vs Native: Side by Side

**Vue 3:**

```vue
<script setup>
import { watch } from 'vue'

const props = defineProps({
    userName: String,
    count: Number,
})

watch(
    () => props.userName,
    (newVal) => {
        console.log('userName changed:', newVal)
    },
)
</script>
```

**Native Web Component:**

```javascript
class MyComponent extends HTMLElement {
    static observedAttributes = ['user-name', 'count']

    attributeChangedCallback(name, oldValue, newValue) {
        console.log(`${name} changed:`, newValue)
        this.#render()
    }

    // Check for shadow existence - attributeChangedCallback fires BEFORE connectedCallback!
    #render() {
        this.jjRoot?.shadow.find('#name').setText(this.userName)
        this.jjRoot?.shadow.find('#count').setText(this.count)
    }
}
```

The native API is simpler, faster, and works everywhere — no compiler needed!

## Observed Attributes and `attr2prop()`

### The Problem

HTML attributes and JavaScript properties are different:

- Attributes: Always strings, kebab-case (`user-name="John"`)
- Properties: Any type, camelCase (`element.userName = "John"`)

When an attribute changes, you need to update the corresponding property and re-render.

### The Solution: `attr2prop()`

JJ's `attr2prop()` helper bridges this gap:

1. Converts kebab-case attribute names to camelCase property names
2. Calls the property setter if the property value is changed exists
3. Returns `true` if it set the property, `false` otherwise

```javascript
import { attr2prop } from 'jj'

class ChatMessage extends HTMLElement {
    // 1. Declare which attributes to observe (kebab-case)
    static observedAttributes = ['role', 'user-name', 'is-read']

    // 2. Private backing fields
    #role = 'user'
    #userName = ''
    #isRead = false

    // 3. Wire up attributeChangedCallback
    attributeChangedCallback(name, oldValue, newValue) {
        attr2prop(this, name, oldValue, newValue)
    }

    // 4. Define getters/setters (camelCase)
    get role() {
        return this.#role
    }
    set role(value) {
        if (!['user', 'assistant', 'system'].includes(value)) {
            throw new Error(`Invalid role: ${value}`)
        }
        this.#role = value
        this.#render() // Re-render when property changes
    }

    get userName() {
        return this.#userName
    }
    set userName(value) {
        this.#userName = value
        this.#render()
    }

    get isRead() {
        return this.#isRead
    }
    set isRead(value) {
        this.#isRead = value
        this.#render()
    }
}
```

### How it Works

| HTML Attribute   | `attr2prop()` converts to | Property Setter Called |
| ---------------- | ------------------------- | ---------------------- |
| `role="admin"`   | `role`                    | `this.role = "admin"`  |
| `user-name="Jo"` | `userName`                | `this.userName = "Jo"` |
| `is-read="true"` | `isRead`                  | `this.isRead = "true"` |

**Note:** Attribute values are always strings. Parse them in your setter if needed:

```javascript
set count(value) {
    this.#count = parseInt(value, 10) || 0
    this.#render()
}
```

## Templates & Styles

JJ promotes separating behavior, style, and layout into JavaScript, CSS, and HTML respectively — no CSS-in-JS, no JSX/TSX. The JavaScript file is the entry point; the HTML template and CSS stylesheet are separate resources you control completely.

### Encapsulation

#### Shadow DOM

Shadow DOM is the native browser mechanism for component encapsulation. Attaching a shadow root to your element creates an isolated DOM subtree, shielding its contents from styles and DOM queries that originate outside.

```javascript
async connectedCallback() {
    this.jjRoot = JJHE.from(this).initShadow('open', await templatePromise, await stylePromise)
}
```

Shadow DOM is initialized in one of two modes:

- **`'open'`** — The host page can reach the shadow root via `element.shadowRoot`. Useful for DevTools, testing, and legitimate external interaction.
- **`'closed'`** — `element.shadowRoot` returns `null`. You hold the only reference, so all interaction must go through your public API.

Read more: [Using Shadow DOM](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_shadow_DOM)

**Notable exception:** Shadow DOM blocks non-inherited properties like `background`, `border`, and `padding`. However, inherited properties — `color`, `font-family`, `font-size`, `line-height` — still cascade across the shadow boundary from the host page. CSS custom properties (variables) also pierce the boundary, which is why `variables.css` values work seamlessly inside Shadow DOM components.

#### Light DOM

Light DOM is the default in most JavaScript frameworks. React, Vue, Svelte, and Angular all render into the regular DOM — though Vue, Angular, and Svelte can opt into Shadow DOM when needed.

In JJ, skip `initShadow` and manipulate the element's children directly:

```javascript
connectedCallback() {
    JJHE.from(this)
        .empty()
        .addChild(
            JJHE.create('p').setText(this.content),
        )
}
```

The trade-off: page styles bleed in (helpful or harmful depending on your needs), and `querySelector` from the parent can reach your internals.

### Loading Eagerness

You have full control over when the HTML and CSS resources are fetched.

#### 1. Eager Fetching

Start the network requests as soon as the module is imported. This is the standard JJ pattern:

```javascript
import { fetchStyle, fetchTemplate, JJHE, defineComponent } from 'jj'

const templatePromise = fetchTemplate(import.meta.resolve('./my-component.html'))
const stylePromise = fetchStyle(import.meta.resolve('./my-component.css'))

export class MyComponent extends HTMLElement {
    static defined = defineComponent('my-component', MyComponent)

    async connectedCallback() {
        this.jjRoot = JJHE.from(this).initShadow('open', await templatePromise, await stylePromise)
    }
}
```

The fetch starts the moment the module loads — before any instance is mounted. All instances share the same promises, so the resources are downloaded only once.

If you want to **block module loading** until resources are ready, use top-level `await`:

```javascript
const [template, style] = await Promise.all([
    fetchTemplate(import.meta.resolve('./my-component.html')),
    fetchStyle(import.meta.resolve('./my-component.css')),
])

export class MyComponent extends HTMLElement {
    async connectedCallback() {
        this.jjRoot = JJHE.from(this).initShadow('open', template, style)
    }
}
```

> **Trade-off:** Any file that imports this module will also wait for these resources to load before it can proceed.

#### 2. Lazy Fetching

Defer resource loading until the first time a component instance is mounted. Useful when the component may never appear on the page.

```javascript
import { fetchStyle, fetchTemplate, JJHE, defineComponent } from 'jj'

let templatePromise
let stylePromise

export class MyComponent extends HTMLElement {
    static defined = defineComponent('my-component', MyComponent)

    async connectedCallback() {
        templatePromise ??= fetchTemplate(import.meta.resolve('./my-component.html'))
        stylePromise ??= fetchStyle(import.meta.resolve('./my-component.css'))
        this.jjRoot = JJHE.from(this).initShadow('open', await templatePromise, await stylePromise)
    }
}
```

The nullish assignment (`??=`) ensures the fetch is only triggered once, even when multiple instances are mounted simultaneously.

#### 3. Inlining

For small or tightly coupled components, skip the fetch entirely and define the template and styles directly in JavaScript:

```javascript
import { cssToStyle, h, JJHE, defineComponent } from 'jj'

const template = h('div', { id: 'root' }, h('p', { id: 'content' }, 'Hello, World!'))
const style = cssToStyle(`
    #root {
        border: 1px solid var(--ui-border);
        padding: var(--gap3);
    }
`)

export class MyComponent extends HTMLElement {
    static defined = defineComponent('my-component', MyComponent)

    async connectedCallback() {
        this.jjRoot = JJHE.from(this).initShadow('open', template, await style)
    }
}
```

Use this pattern sparingly. Mixing HTML structure and CSS into JavaScript increases cognitive load. That said, when layout and behavior are genuinely inseparable, inlining can improve cohesion by keeping tightly coupled things together.

> **Tip:** `initShadow` also accepts a raw CSS string, so `cssToStyle` is optional here — it just pre-processes the sheet at module load time instead of on first mount.

### Template Sources

`initShadow()` accepts several template types directly:

```javascript
// From external HTML file
const templatePromise = fetchTemplate(import.meta.resolve('./template.html'))

// From inline string
const template = '<div id="root"><slot></slot></div>'

// From existing <template> element
const template = document.querySelector('template#my-template')

// From a JJ element
const template = JJHE.from('template#my-template')

// From any HTMLElement or DocumentFragment
const template = document.getElementById('source')
```

### Style Sources

Use `fetchStyle()` for external stylesheets, or pass a `CSSStyleSheet` directly:

```javascript
const baseStylePromise = fetchStyle(import.meta.resolve('./base.css'))
const themeStylePromise = fetchStyle(import.meta.resolve('./theme.css'))
```

`initShadow` also accepts a raw CSS string or a `cssToStyle()` promise, letting you pre-process the sheet at module load time:

```javascript
const style = cssToStyle('p { color: var(--foreground-color); }')
```

## Registering Components

Use `defineComponent(name, constructor, options?)` to define your custom element:

```javascript
import { defineComponent } from 'jj'

// Basic registration (kebab-case)
await defineComponent('my-component', MyComponent)

// Ergonomic registration (PascalCase gets normalized to kebab-case)
await defineComponent('MyComponent', MyComponent)

// With options (extending built-in elements)
await defineComponent('fancy-button', FancyButton, { extends: 'button' })
```

Return value semantics:

- `false`: this call registered the component.
- `true`: it was already registered with the same constructor.

### Convention: Static `defined` Promise

Add a static `defined` promise to each component:

```javascript
export class MyComponent extends HTMLElement {
    static defined = defineComponent('my-component', MyComponent)
}
```

This enables clean readiness handling for multiple components:

```javascript
import { MyComponent } from './my-component.js'
import { OtherComponent } from './other-component.js'
import { ThirdComponent } from './third-component.js'

// Await all component definitions in parallel
await Promise.all([MyComponent.defined, OtherComponent.defined, ThirdComponent.defined])
```

> 📚 [MDN: customElements.define()](https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry/define)

## Complete Examples

### Simple Counter (with Shadow DOM)

**simple-counter.js:**

```javascript
import { fetchStyle, fetchTemplate, JJHE, defineComponent } from 'jj'

const templatePromise = fetchTemplate(import.meta.resolve('./simple-counter.html'))
const stylePromise = fetchStyle(import.meta.resolve('./simple-counter.css'))

export class SimpleCounter extends HTMLElement {
    static defined = defineComponent('simple-counter', SimpleCounter)

    #count = 0

    async connectedCallback() {
        this.jjRoot = JJHE.from(this).initShadow('open', await templatePromise, await stylePromise)

        this.jjRoot.shadow.find('#inc').on('click', () => this.#update(1))
        this.jjRoot.shadow.find('#dec').on('click', () => this.#update(-1))
    }

    #update(delta) {
        this.#count += delta
        this.jjRoot.shadow.find('#count').setText(this.#count)
    }
}
```

**simple-counter.html:**

```html
<div class="counter">
    <button id="dec">-</button>
    <span id="count">0</span>
    <button id="inc">+</button>
</div>
```

### Component with Observed Attributes

**chat-message.js:**

```javascript
import { attr2prop, fetchStyle, fetchTemplate, JJHE, defineComponent } from 'jj'

const VALID_ROLES = ['user', 'system', 'assistant']

const templatePromise = fetchTemplate(import.meta.resolve('./chat-message.html'))
const stylePromise = fetchStyle(import.meta.resolve('./chat-message.css'))

export class ChatMessage extends HTMLElement {
    static observedAttributes = ['role', 'content']

    static defined = defineComponent('chat-message', ChatMessage)

    #role = 'user'
    #content = ''

    attributeChangedCallback(name, oldValue, newValue) {
        attr2prop(this, name, oldValue, newValue)
    }

    get role() {
        return this.#role
    }
    set role(value) {
        if (!VALID_ROLES.includes(value)) {
            throw new Error(`Invalid role: ${value}`)
        }
        this.#role = value
        this.#render()
    }

    get content() {
        return this.#content
    }
    set content(value) {
        this.#content = value
        this.#render()
    }

    async connectedCallback() {
        this.jjRoot = JJHE.from(this).initShadow('open', await templatePromise, await stylePromise)
        this.#render()
    }

    #render() {
        this.jjRoot?.shadow.find('#role').setText(this.#role)
        this.jjRoot?.shadow.find('#content').setText(this.#content)
    }
}
```

**Usage in HTML:**

```html
<chat-message role="user" content="Hello!"></chat-message>
<chat-message role="assistant" content="Hi there!"></chat-message>
```

**Usage in JavaScript:**

```javascript
import { ChatMessage } from './components/chat-message.js'

// Wait until the component is defined and ready to use
await ChatMessage.defined

// Native Browser Syntax
const msg = document.createElement('chat-message')
msg.role = 'assistant'
msg.content = 'Hello from code!'
document.body.appendChild(msg)
// JJ Syntax
doc.body.addChild(
    JJHE.create('chat-message').setAttr({
        role: 'assistant',
        content: 'Hello from code!',
    }),
)
```

### Component Without Shadow DOM

Some components don't need Shadow DOM encapsulation:

```javascript
import { attr2prop, JJHE, defineComponent } from 'jj'

export class RenderMarkdown extends HTMLElement {
    static observedAttributes = ['content']

    static defined = defineComponent('render-markdown', RenderMarkdown)

    #root
    #content = ''

    attributeChangedCallback(name, oldValue, newValue) {
        attr2prop(this, name, oldValue, newValue)
    }

    get content() {
        return this.#content
    }
    set content(markdown) {
        this.#content = markdown
        this.#render()
    }

    connectedCallback() {
        this.#root = JJHE.from(this)
        this.#render()
    }

    #render() {
        if (this.#root) {
            this.#root.setHTML(this.#parseMarkdown(this.#content), true)
        }
    }

    #parseMarkdown(md) {
        // Your markdown parsing logic
        return md
    }
}
```

## Best Practices

### Do's ✅

- Create template and style promises at module scope for reuse
- Use the `static defined = defineComponent('my-component', MyComponent)` convention
- Initialize Shadow DOM in `connectedCallback()`, not `constructor()`
- Use private fields (`#field`) for internal state
- Validate property values in setters
- Use `?.` (optional chaining) when accessing shadow elements in setters
- Clean up in `disconnectedCallback()`

### Don'ts ❌

- Don't access attributes or children in `constructor()`
- Don't fetch template or stylesheet resources inside every `connectedCallback()` run
- Don't forget to call `super()` first in `constructor()`
- Don't forget `static observedAttributes` when using `attributeChangedCallback`
- Don't mutate DOM in `constructor()`

## Further Reading

- [MDN: Web Components](https://developer.mozilla.org/en-US/docs/Web/API/Web_components)
- [MDN: Using Custom Elements](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements)
- [MDN: Using Shadow DOM](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_shadow_DOM)
- [MDN: Using Templates and Slots](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_templates_and_slots)
