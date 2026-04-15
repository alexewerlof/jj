# Lit to JJ Translation

Lit adds reactive properties, template literals, and scoped CSS on top of native custom elements. JJ removes the template DSL and uses imperative updates instead.

## Mental mapping

| Lit concept               | JJ equivalent                                                              |
| ------------------------- | -------------------------------------------------------------------------- |
| `@customElement`          | `defineComponent('tag', MyClass)` → `static defined`                       |
| `@property()`             | `observedAttributes` + `attr2prop` + getter/setter                         |
| `render()` returning html | Explicit `#render()` method calling wrapper update methods                 |
| `LitElement.styles`       | `fetchStyle(url)` at module scope → applied via `initShadow` or `addStyle` |
| `html\`<div>\``           | `JJHE.tree('div', …)` or `JJHE.create('div')`                              |
| `@event="${handler}"`     | `.on('event', handler)` in `connectedCallback`                             |
| `updated()` hook          | Call `#render()` from setters that change visible state                    |
| `this.renderRoot.query…`  | `this.#jjShadow.find(selector)`                                            |

## Component example

Lit:

```js
@customElement('my-counter')
class MyCounter extends LitElement {
    @property({ type: Number }) count = 0
    static styles = css`
        button {
            padding: 8px;
        }
    `
    render() {
        return html`<button @click=${() => this.count++}>${this.count}</button>`
    }
}
```

JJ:

```js
import { attr2prop, defineComponent, fetchStyle, JJHE } from 'jj'

const stylePromise = fetchStyle(import.meta.resolve('./my-counter.css'))

export class MyCounter extends HTMLElement {
    static observedAttributes = ['count']
    static defined = defineComponent('my-counter', MyCounter)

    #count = 0
    #jjShadow = null
    #isInitialized = false

    constructor() {
        super()
        this.#jjShadow = JJHE.from(this).setShadow('open').getShadow(true)
    }

    attributeChangedCallback(name, oldValue, newValue) {
        attr2prop(this, name, oldValue, newValue)
    }
    get count() {
        return this.#count
    }
    set count(v) {
        this.#count = Number(v) || 0
        this.#render()
    }

    async connectedCallback() {
        if (!this.#isInitialized) {
            this.#jjShadow
                .init('<button id="btn">0</button>', await stylePromise)
                .find('#btn', true)
                .on('click', () => {
                    this.count++
                })
            this.#isInitialized = true
        }
        this.#render()
    }

    #render() {
        this.#jjShadow?.find('#btn')?.setText(String(this.#count))
    }
}
```

## Adopted stylesheets

Lit `LitElement.styles` → JJ fetchStyle:

```js
const stylePromise = fetchStyle(import.meta.resolve('./component.css'))
// In connectedCallback:
JJHE.from(this)
    .setShadow('open')
    .initShadow(await templatePromise, await stylePromise)
```

## Browser references

- HTMLTemplateElement: https://developer.mozilla.org/en-US/docs/Web/API/HTMLTemplateElement
- DocumentFragment: https://developer.mozilla.org/en-US/docs/Web/API/DocumentFragment
- CSSStyleSheet (adopted): https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleSheet
