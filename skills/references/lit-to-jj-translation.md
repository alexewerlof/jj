# Lit to JJ Translation

Lit adds reactive properties, template literals, and scoped CSS on top of native custom elements. JJ removes the template DSL and uses imperative updates instead.

## Mental mapping

| Lit concept               | JJ equivalent                                                              |
| ------------------------- | -------------------------------------------------------------------------- |
| `@customElement`          | `defineComponent('tag', MyClass)` → `static defined`                       |
| `@property()`             | `observedAttributes` + `attr2prop` + getter/setter                         |
| `render()` returning html | Explicit `#render()` method calling wrapper update methods                 |
| `LitElement.styles`       | `fetchStyle(url)` at module scope → applied via `initShadow` or `addStyle` |
| `html\`<div>\``           | `const h = JJHE.tree` then `h('div', attrs, ...children)` (prefer)         |
| `@event="${handler}"`     | `.on('event', handler)` in `connectedCallback`                             |
| `updated()` hook          | Call `#render()` from setters that change visible state                    |
| `this.renderRoot.query…`  | `this.#jjShadow.find(selector)`                                            |

## Component example

Translation default:

- Start each module with `const h = JJHE.tree` when rendering child structure.
- Prefer `h(tag, attrs, ...children)` for concise, declarative structure instead of verbose `create(...).set*()` chains.
- For single-expression callbacks, prefer concise arrows (`x => h(...)`) over block bodies with `return`.
- Prefer batch object-dictionary helpers (for example `setAttrs`, `setAriaAttrs`, `setDataAttrs`, `setStyles`, `setClasses`) when setting multiple keys on the same wrapper.
- Keep `create()` for one-off imperative cases where hyperscript would not improve readability.

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

## Compact child mapping example

Prefer:

```js
const h = JJHE.tree

JJHE.create('select').addChildMap(items, ({ value, title }) => h('option', { value }, title))
```

And prefer:

```js
jjOptAssistantLang.addChildMap(supportedAssistantLanguages, ({ value, title }) => h('option', { value }, title))
```

Over:

```js
jjOptAssistantLang.addChildMap(supportedAssistantLanguages, ({ value, title }) => {
    return h('option', { value }, title)
})
```

Over:

```js
JJHE.create('select').addChildMap(items, ({ value, title }) => JJHE.create('option').setValue(value).setText(title))
```

## Compact multi-attribute updates

Prefer:

```js
jjDoc
    .find('#source-url', true)
    .setAttrs({
        href: sourceUrl,
        target: '_blank',
        rel: 'noopener noreferrer',
    })
    .setText(sourceUrl)
```

Over:

```js
jjDoc
    .find('#source-url', true)
    .setAttr('href', sourceUrl)
    .setAttr('target', '_blank')
    .setAttr('rel', 'noopener noreferrer')
    .setText(sourceUrl)
```

Same rule for other dictionary-style helpers: `setAriaAttrs`, `setDataAttrs`, `setStyles`, and `setClasses`.

## Browser references

- HTMLTemplateElement: https://developer.mozilla.org/en-US/docs/Web/API/HTMLTemplateElement
- DocumentFragment: https://developer.mozilla.org/en-US/docs/Web/API/DocumentFragment
- CSSStyleSheet (adopted): https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleSheet
