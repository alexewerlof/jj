# Structure

We try to avoid mixing different language in the same file. Each component has:

- JS file containing the class that extends `HTMLElement` and defines behavior
- HTML file containing the structure (usually loaded in the Shadow DOM)
- CSS file containing the styles (usually attached to the Shadow DOM)

### ShadowMaster

`ShadowMaster` is a utility class that helps with this structure and supports hard coded Template/Styles (not recommended for large chunks of code), greedy or lazy loading.

```js
/** You only need one instance of ShadowMaster per component that's shared by all component instances */
const sm = ShadowMaster.create()
    .setTemplate(fetchHtml(import.meta.resolve('./my-component.html')))
    .addStyles(fetchCss(import.meta.resolve('./my-component.css')))

class MyComponent extends HTMLElement {
    /** Keeps a reference to this component's root element */
    #root

    async connectedCallback() {
        if (this.#root) return

        // Initialize Shadow DOM efficiently
        this.#root = JJHE.from(this).initShadow('open', await sm.getResolved())
    }
}
```

### CSS variables

It is a common use case to want to use CSS variables from a central file into the Shadow DOM for layout consistency. You can easily achieve this using `ShadowMaster`:

```js
const sm = ShadowMaster.create()
    .setTemplate(fetchHtml(import.meta.resolve('./my-component.html')))
    .addStyles(fetchCss(import.meta.resolve('./../path/to/variables.css')))
    .addStyles(fetchCss(import.meta.resolve('./my-component.css')))
```
