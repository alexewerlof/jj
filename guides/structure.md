# Structure

We try to avoid mixing different language in the same file. Each component has:

- JS file containing the class that extends `HTMLElement` and defines behavior
- HTML file containing the structure (usually loaded in the Shadow DOM)
- CSS file containing the styles (usually attached to the Shadow DOM)

### Shared template and style promises

Keep shadow resources at module scope. Attach the shadow once, then initialize it later with `initShadow()`. This preserves one-time loading without an extra helper.

```js
const templatePromise = fetchTemplate(import.meta.resolve('./my-component.html'))
const stylePromise = fetchStyle(import.meta.resolve('./my-component.css'))

class MyComponent extends HTMLElement {
    /** Keeps a reference to this component's root element */
    #root
    #isInitialized = false

    constructor() {
        super()
        this.#root = JJHE.from(this).setShadow('open').getShadow(true)
    }

    async connectedCallback() {
        if (!this.#isInitialized) {
            this.#root.init(await templatePromise, await stylePromise)
            this.#isInitialized = true
        }
    }
}
```

### CSS variables

It is a common use case to want to use CSS variables from a central file inside Shadow DOM for layout consistency. You can do that by passing multiple stylesheets to `initShadow()`:

```js
const templatePromise = fetchTemplate(import.meta.resolve('./my-component.html'))
const sharedStylePromise = fetchStyle(import.meta.resolve('./../path/to/variables.css'))
const componentStylePromise = fetchStyle(import.meta.resolve('./my-component.css'))

class MyComponent extends HTMLElement {
    #isInitialized = false
    #root
    constructor() {
        super()
        this.#root = JJHE.from(this).setShadow('open').getShadow(true)
    }

    async connectedCallback() {
        if (!this.#isInitialized) {
            const [template, sharedStyle, componentStyle] = await Promise.all([
                templatePromise,
                sharedStylePromise,
                componentStylePromise,
            ])
            this.#root.init(template, sharedStyle, componentStyle)
            this.#isInitialized = true
        }
    }
}
```
