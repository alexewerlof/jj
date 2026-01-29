# Custom Components with JJ

This guide covers how to create [Custom Elements](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements) (Web Components) using JJ's helper utilities.

## Overview

JJ provides three main utilities for building custom components:

- **`ShadowMaster`** - Manages Shadow DOM configuration (templates and styles)
- **`registerComponent()`** - Registers and waits for the custom element definition
- **`attr2prop()`** - Bridges HTML attributes to JavaScript properties

## Basic Component Structure

Here's the recommended pattern for creating a custom component:

```javascript
import { attr2prop, fetchCss, fetchHtml, JJHE, registerComponent, ShadowMaster } from 'jj'

// 1. Create ShadowMaster (shared across all instances).
// By convention it's defined at the top level but you can define it as a static class member
const sm = ShadowMaster.create()
    // import.meta.resolve() helps you look up resources relative to the current file
    .setTemplate(fetchHtml(import.meta.resolve('./my-component.html')))
    .addStyles(fetchCss(import.meta.resolve('./my-component.css')))

// 2. Define the component class
export class MyComponent extends HTMLElement {
    // 3. Static register method (convention)
    static async register() {
        return await registerComponent('my-component', MyComponent)
    }

    // 4. Initialize shadow root in connectedCallback
    async connectedCallback() {
        this.jjRoot = JJHE.from(this).initShadow('open', await sm.getResolved())
    }
}
```

Then in another file you can import and use the component like this:

```javascript
import { MyComponent } from './path/to/MyComponent.js'

await MyComponent.register()
```

If you import multiple components, you can `await` their registration in parallel:

```javascript
import { Component1 } from './path/to/Component1.js'
import { Component2 } from './path/to/Component2.js'
import { Component3 } from './path/to/Component3.js'

await Promise.all([Component1.register(), Component2.register(), Component3.register()])
```

## Custom Element Lifecycle

Browsers support several lifecycle callbacks for custom components. Here's when each fires:

### `constructor()`

Called when an custom element is created (via `document.createElement()` or the HTML parser).
**Make sure that the element is defined and ready. Use the `registerComponent()` helper function for both.**

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
    this.jjRoot = JJHE.from(this).initShadow('open', await sm.getResolved())

    // Set up event listeners
    this.jjRoot.shadow.byId('btn').on('click', () => this.#handleClick())

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
        this.jjRoot?.shadow.byId('name').setText(this.userName)
        this.jjRoot?.shadow.byId('count').setText(this.count)
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

## ShadowMaster

`ShadowMaster` manages the resolution of templates and styles for Shadow DOM. It supports eager and lazy loading.

### Creating a ShadowMaster

Always create it **outside** the class so it's shared across all instances:

```javascript
const sm = ShadowMaster.create().setTemplate(/* template config */).addStyles(/* style configs */)
```

### Template Sources

`setTemplate()` accepts various inputs:

```javascript
// From external HTML file (fetched immediately, resolved lazily)
sm.setTemplate(fetchHtml(import.meta.resolve('./template.html')))

// From external HTML file (fetched immediately, blocks execution, bad for performance)
sm.setTemplate(await fetchHtml(import.meta.resolve('./template.html')))

// From inline string
sm.setTemplate('<div id="root"><slot></slot></div>')

// From existing <template> element
const tmpl = document.querySelector('#my-template')
sm.setTemplate(tmpl.innerHTML)

// From any element's HTML
sm.setTemplate(document.getElementById('source').outerHTML)

// Lazy loading with function (called on first getResolved())
sm.setTemplate(() => myOwnFetcher('./lazy-template.html'))
```

### Style Sources

`addStyles()` accepts one or more style configurations:

```javascript
// From external CSS file
sm.addStyles(fetchCss(import.meta.resolve('./styles.css')))

// From inline CSS string
sm.addStyles('.container { padding: 1rem; }')

// Multiple styles at once
sm.addStyles('p { color: red; }', fetchCss('./base.css'), fetchCss('./theme.css'))

// Lazy loading with function which returns a CSS string or
// CSSStyleSheet instance (you can use `cssToStyle()` to help with conversion)
sm.addStyles(() => myOwnFetcher('./optional-styles.css'))
```

### Using in connectedCallback

```javascript
async connectedCallback() {
    // getResolved() returns cached result after first call
    this.jjRoot = JJHE.from(this).initShadow('open', await sm.getResolved())
}
```

## Registering Components

Use `registerComponent()` to define your custom element:

```javascript
import { registerComponent } from 'jj'

// Basic registration
await registerComponent('my-component', MyComponent)

// With options (extending built-in elements)
await registerComponent('fancy-button', FancyButton, { extends: 'button' })
```

### Convention: Static `register()` Method

Add a static `register()` method to each component:

```javascript
export class MyComponent extends HTMLElement {
    static register() {
        return registerComponent('my-component', MyComponent)
    }
}
```

This enables clean registration of multiple components:

```javascript
import { MyComponent } from './my-component.js'
import { OtherComponent } from './other-component.js'
import { ThirdComponent } from './third-component.js'

// Register all components in parallel
await Promise.all([MyComponent.register(), OtherComponent.register(), ThirdComponent.register()])
```

> 📚 [MDN: customElements.define()](https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry/define)

## Complete Examples

### Simple Counter (with Shadow DOM)

**simple-counter.js:**

```javascript
import { fetchCss, fetchHtml, JJHE, registerComponent, ShadowMaster } from 'jj'

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

        this.jjRoot.shadow.byId('inc').on('click', () => this.#update(1))
        this.jjRoot.shadow.byId('dec').on('click', () => this.#update(-1))
    }

    #update(delta) {
        this.#count += delta
        this.jjRoot.shadow.byId('count').setText(this.#count)
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
import { attr2prop, fetchCss, fetchHtml, JJHE, registerComponent, ShadowMaster } from 'jj'

const VALID_ROLES = ['user', 'system', 'assistant']

const sm = ShadowMaster.create()
    .setTemplate(fetchHtml(import.meta.resolve('./chat-message.html')))
    .addStyles(fetchCss(import.meta.resolve('./chat-message.css')))

export class ChatMessage extends HTMLElement {
    static observedAttributes = ['role', 'content']

    static register() {
        return registerComponent('chat-message', ChatMessage)
    }

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
        this.jjRoot = JJHE.from(this).initShadow('open', await sm.getResolved())
        this.#render()
    }

    #render() {
        this.jjRoot?.shadow.byId('role').setText(this.#role)
        this.jjRoot?.shadow.byId('content').setText(this.#content)
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

// Wait till the component is registered and ready to use
await ChatMessage.register()

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
import { attr2prop, JJHE, registerComponent } from 'jj'

export class RenderMarkdown extends HTMLElement {
    static observedAttributes = ['content']

    static register() {
        return registerComponent('render-markdown', RenderMarkdown)
    }

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
            this.#root.setHTML(this.#parseMarkdown(this.#content))
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

- Create `ShadowMaster` outside the class for caching
- Use `static register()` method convention
- Initialize Shadow DOM in `connectedCallback()`, not `constructor()`
- Use private fields (`#field`) for internal state
- Validate property values in setters
- Use `?.` (optional chaining) when accessing shadow elements in setters
- Clean up in `disconnectedCallback()`

### Don'ts ❌

- Don't access attributes or children in `constructor()`
- Don't create `ShadowMaster` inside `constructor()` or `connectedCallback()`
- Don't forget to call `super()` first in `constructor()`
- Don't forget `static observedAttributes` when using `attributeChangedCallback`
- Don't mutate DOM in `constructor()`

## Further Reading

- [MDN: Web Components](https://developer.mozilla.org/en-US/docs/Web/API/Web_components)
- [MDN: Using Custom Elements](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements)
- [MDN: Using Shadow DOM](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_shadow_DOM)
- [MDN: Using Templates and Slots](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_templates_and_slots)
