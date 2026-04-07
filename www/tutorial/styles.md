# Styles

Templates define structure. Styles define how that structure looks and feels.

In JJ, the main style paths are:

1. Global CSS (light DOM)
2. Constructable stylesheets (shadow DOM)

## Light DOM styles

In light DOM components, regular page CSS applies naturally.

```js
class MyLightCard extends HTMLElement {
    #root = null

    connectedCallback() {
        if (this.#root) {
            return
        }
        this.#root = JJHE.from(this)
        this.#root.addClass('my-light-card')
    }
}
```

Then style it from your global stylesheet:

```css
.my-light-card {
    display: block;
    border: var(--bthick) solid var(--ui-border);
    border-radius: var(--bradius2);
    padding: var(--gap3);
}
```

Use this when the component should blend with app-wide styles.

## Shadow DOM styles

In shadow DOM components, load CSS as a constructable stylesheet and adopt it into the shadow root.

```js
import { defineComponent, fetchStyle, fetchTemplate, JJHE } from 'jj'

const templatePromise = fetchTemplate(import.meta.resolve('./my-card.html'))
const stylePromise = fetchStyle(import.meta.resolve('./my-card.css'))

class MyCard extends HTMLElement {
    static defined = defineComponent('my-card', MyCard)

    #root = null
    #isInitialized = false

    constructor() {
        super()
        JJHE.from(this).setShadow('open')
        this.#root = JJHE.from(this).getShadow(true)
    }

    async connectedCallback() {
        if (this.#isInitialized) {
            return
        }
        JJHE.from(this).initShadow(await templatePromise, await stylePromise)
        this.#isInitialized = true
    }
}
```

Example shadow stylesheet:

```css
:host {
    display: block;
}

.card {
    border: var(--bthick) solid var(--ui-border);
    border-radius: var(--bradius2);
    padding: var(--gap3);
    background: var(--background-lighter);
}
```

Use this for reusable widgets that should stay visually isolated.

## Lazy loading styles (and optional templates)

If you prefer not to fetch resources until the component is actually used, apply the same lazy promise pattern:

1. Keep promise variables at module scope, uninitialized.
2. In `async connectedCallback()`, assign them only once with `if (!promise)`.
3. Await them before rendering.

### Shadow DOM lazy loading

```js
import { defineComponent, fetchStyle, fetchTemplate, JJHE } from 'jj'

let templatePromise
let stylePromise

class LazyStyledCard extends HTMLElement {
    static defined = defineComponent('lazy-styled-card', LazyStyledCard)

    #root = null
    #isInitialized = false

    constructor() {
        super()
        this.#root = JJHE.from(this).setShadow('open').getShadow(true)
    }

    async connectedCallback() {
        if (this.#isInitialized) {
            return
        }
        if (!templatePromise) {
            templatePromise = fetchTemplate(import.meta.resolve('./lazy-styled-card.html'))
        }
        if (!stylePromise) {
            stylePromise = fetchStyle(import.meta.resolve('./lazy-styled-card.css'))
        }
        const [template, style] = await Promise.all([templatePromise, stylePromise])
        this.#root.init(template, style)
        this.#isInitialized = true
    }
}
```

### Light DOM lazy loading

```js
import { defineComponent, fetchStyle, fetchTemplate, JJHE } from 'jj'

let templatePromise
let stylePromise

class LazyLightStyledCard extends HTMLElement {
    static defined = defineComponent('lazy-light-styled-card', LazyLightStyledCard)

    #root = null

    async connectedCallback() {
        if (this.#root) {
            return
        }
        this.#root = JJHE.from(this)
        if (!templatePromise) {
            templatePromise = fetchTemplate(import.meta.resolve('./lazy-light-styled-card.html'))
        }
        if (!stylePromise) {
            stylePromise = fetchStyle(import.meta.resolve('./lazy-light-styled-card.css'))
        }
        this.#root.setTemplate(await templatePromise)
        // Light DOM styles are usually applied globally.
        // We await stylePromise here to keep the loading pattern explicit and symmetric.
        await stylePromise
    }
}
```

## Practical tips

- Keep `fetchStyle(...)` promises at module scope to avoid duplicate requests.
- For lazy loading, leave promise variables unset at module scope and initialize them in `connectedCallback()`.
- Prefer CSS variables (`var(--...)`) over hard-coded colors or spacing.
- Use `:host` for host-level styling in shadow DOM.
- Start with light DOM for app sections, shadow DOM for reusable encapsulated components.

## Next up: Next Steps

You now know enough to build practical components with templates and styles. The final section of the tutorial covers some best practices and next steps to keep learning.
