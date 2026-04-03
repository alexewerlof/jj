# Light DOM Components

Light DOM components render their markup as direct children of the host element, inside the normal document tree. They inherit the page's CSS, IDs must be unique per the page, and events bubble naturally without any shadow boundary considerations.

Use light DOM when the component is a page-level section, a layout block, or when you intentionally want it to participate in the page's global styles.

**Browser references:**

- [Using custom elements](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements)
- [CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent)

→ See [components guide](./components.md) for the lifecycle overview and `attr2prop` patterns that apply to both light DOM and shadow DOM.

---

## Initialization

Clone a template into the element in `connectedCallback`. Use a boolean flag as a reconnect guard — unlike shadow DOM,there is no root object to double as the flag.

```js
import { defineComponent, fetchTemplate, JJHE } from 'jj'

const templatePromise = fetchTemplate(import.meta.resolve('./my-section.html'))

export class MySection extends HTMLElement {
    static defined = defineComponent('my-section', MySection)

    #host = null
    #initialized = false

    async connectedCallback() {
        if (this.#initialized) return
        this.#initialized = true
        this.#host = JJHE.from(this)
        this.#host.setTemplate(await templatePromise)
        this.#wireEvents()
        this.#render()
    }
}
```

`setTemplate()` replaces the element's children with a clone of the template fragment. It is equivalent to `empty().addTemplate()` in one call.

---

## Styles

Light DOM components participate in the normal CSS cascade. There is no isolation.

**What this means in practice:**

- The page stylesheet applies to your component's children automatically. No extra setup is needed.
- CSS custom properties flow in from the page — `var(--color-primary)` resolves against the page's `:root` declaration.
- Your component's own stylesheet must be loaded by the page as a regular `<link rel="stylesheet">` or `<style>` tag, not via `fetchStyle`. The constructable stylesheet API used by `fetchStyle` is for shadow DOM adoption only.
- Conversely, styles defined inside your component's template or stylesheet **are visible to the rest of the page**. Name classes carefully to avoid unintentional collisions.

**Recommended practice:** Scope your selectors to the host element tag name or a BEM block class:

```css
/* my-section.css — loaded by the page as a regular stylesheet */
my-section .card { ... }
my-section .card__title { ... }
```

---

## Querying

Query from the host element wrapper, not from `document`. This limits queries to the component's own children and avoids matching unrelated page elements with the same selector:

```js
#render() {
    this.#host?.find('[data-role="title"]')?.setText(this.#title)
    this.#host?.find('[data-role="count"]')?.setText(String(this.#count))
}
```

**Avoid IDs for internal elements.** IDs must be unique across the entire page. Elements cloned from a template will duplicate any IDs if multiple instances exist. Use `data-*` attributes or class names for internal targeting instead.

---

## Events

Light DOM components have no shadow boundary, so event flow is ordinary DOM bubbling. There are no retargeting or `composed` considerations.

### Dispatching events from the component

Dispatch from `this` (the host element) so the event originates at the component boundary and is easy to listen for from outside:

```js
import { customEvent, JJHE } from 'jj'

#onItemClick = (event) => {
    const id = event.target.closest('[data-id]')?.dataset.id
    if (id) {
        JJHE.from(this).triggerCustomEvent('item-selected', { id })
    }
}
```

`triggerCustomEvent` dispatches with `bubbles: true, composed: true` by default. For light DOM components, `composed` has no effect — there is no shadow boundary. You can leave it as-is or override with `{ composed: false }` to be explicit:

```js
JJHE.from(this).triggerCustomEvent('item-selected', { id }, { composed: false })
```

### Listening for events from outside

Because there is no boundary, events on `document`, `window`, or parent elements are already reachable from inside the component via standard bubbling. If you need to react to an event from something that is not an ancestor of your element (e.g. a sibling component, or a global broadcast), attach a listener on `document` or a shared event bus, and clean it up in `disconnectedCallback`:

```js
#onGlobalThemeChange = (event) => {
    this.#host?.find('.icon')?.setDataAttr('theme', event.detail.theme)
}

async connectedCallback() {
    // ...init...
    document.addEventListener('theme-changed', this.#onGlobalThemeChange)
}

disconnectedCallback() {
    document.removeEventListener('theme-changed', this.#onGlobalThemeChange)
}
```

### Event delegation

Because children are in the real document tree, delegation works exactly as for any other DOM element:

```js
#wireEvents() {
    this.#host?.on('click', (event) => {
        const btn = event.target.closest('[data-action]')
        if (!btn) return
        this.#handleAction(btn.dataset.action)
    })
}
```

---

## Full worked example

A `<news-feed>` component that renders a list of articles, dispatches a `article-opened` event when one is clicked, and reacts to a global `feed-refresh` broadcast:

```js
// news-feed.js
import { attr2prop, customEvent, defineComponent, fetchTemplate, JJHE, JJHE as H } from 'jj'

const templatePromise = fetchTemplate(import.meta.resolve('./news-feed.html'))

export class NewsFeed extends HTMLElement {
    static observedAttributes = ['heading']
    static defined = defineComponent('news-feed', NewsFeed)

    #heading = 'Latest News'
    #articles = []
    #host = null
    #initialized = false

    attributeChangedCallback(name, oldValue, newValue) {
        attr2prop(this, name, oldValue, newValue)
    }

    get heading() {
        return this.#heading
    }
    set heading(value) {
        this.#heading = String(value ?? '')
        if (this.#host) this.#render()
    }

    async connectedCallback() {
        if (this.#initialized) return
        this.#initialized = true
        this.#host = JJHE.from(this)
        this.#host.setTemplate(await templatePromise)
        this.#host.on('click', this.#onListClick)
        document.addEventListener('feed-refresh', this.#onFeedRefresh)
        this.#render()
    }

    disconnectedCallback() {
        document.removeEventListener('feed-refresh', this.#onFeedRefresh)
    }

    setArticles(articles) {
        this.#articles = articles
        if (this.#host) this.#render()
    }

    #render() {
        this.#host?.find('[data-role="heading"]')?.setText(this.#heading)

        const list = this.#host?.find('[data-role="list"]')
        if (!list) return

        list.setChild(
            ...this.#articles.map((a) =>
                H.tree('li', { 'data-id': a.id }, a.title),
            ),
        )
    }

    #onListClick = (event) => {
        const item = event.target.closest('[data-id]')
        if (!item) return
        JJHE.from(this).triggerCustomEvent('article-opened', { id: item.dataset.id })
    }

    #onFeedRefresh = (event) => {
        this.setArticles(event.detail.articles ?? [])
    }
}
```

```html
<!-- news-feed.html -->
<section class="news-feed">
    <h2 data-role="heading"></h2>
    <ul data-role="list"></ul>
</section>
```

```css
/* news-feed.css — included by the page as a normal stylesheet */
news-feed .news-feed { padding: var(--spacing-md); }
news-feed .news-feed h2 { font: var(--font-heading); }
```

```html
<!-- page.html -->
<link rel="stylesheet" href="./news-feed.css" />
<news-feed heading="Top Stories"></news-feed>
```

```js
// page.js
import { JJD, customEvent } from 'jj'
import { NewsFeed } from './news-feed.js'

await NewsFeed.defined

const doc = JJD.from(document)
const feed = doc.find('news-feed', true)

feed.on('article-opened', (event) => {
    console.log('Opened article', event.detail.id)
})

// Broadcast a refresh — the component receives it via document listener
document.dispatchEvent(customEvent('feed-refresh', { articles: [{ id: '1', title: 'Hello' }] }))
```

---

## Continue reading

- [Components overview](./components.md) — lifecycle, `attr2prop`, and readiness patterns.
- [Shadow DOM components](./components-shadow.md) — isolation, slots, and scoped events.
- [Events guide](./events.md) — detailed event model and delegation patterns.
