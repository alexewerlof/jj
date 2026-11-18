# Custom Element Pattern

The complete JJ component shape. `SKILL.md` has the short version; this is the full
pattern with the reasoning.

## Shape

Fetch template and style at **module scope** — loaded once, shared across all instances.

- Use shadow DOM for self-contained widgets and design-system components; use light DOM for sections that should inherit page styling and normal document flow.
- Prefer `'open'` shadow mode unless stricter encapsulation is a hard requirement.
- `attributeChangedCallback()` can run before `connectedCallback()` for parsed attributes, so setters and render paths must tolerate pre-mount state.
- Use `disconnectedCallback()` only to clean up external side effects; do not tear down the shadow root just because the element was detached.

```ts
import { attr2prop, defineComponent, fetchStyle, fetchTemplate, JJHE } from 'jj'

const templatePromise = fetchTemplate(import.meta.resolve('./my-card.html'))
const stylePromise = fetchStyle(import.meta.resolve('./my-card.css'))

export class MyCard extends HTMLElement {
    static observedAttributes = ['user-name', 'count']
    static defined = defineComponent('my-card', MyCard)

    #userName = ''
    #count = 0
    #jjHost // JJHE wrapper for the host element; attached in constructor
    #jjShadow // JJSR wrapper; attached in constructor
    #isInitialized = false

    constructor() {
        super()
        this.#jjHost = JJHE.from(this)
        this.#jjShadow = this.#jjHost.shadow() // attach if needed + wrap, in one call
    }

    attributeChangedCallback(name, oldValue, newValue) {
        // Converts kebab-case → camelCase, then calls the matching setter
        attr2prop(this, name, oldValue, newValue)
    }

    get userName() {
        return this.#userName
    }
    set userName(v) {
        this.#userName = String(v ?? '')
        this.#render()
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
            this.#jjShadow.init(await templatePromise, await stylePromise)
            this.#isInitialized = true
        }
        this.#render()
    }

    #render() {
        if (!this.#jjShadow) return // guard for attribute changes before mount
        this.#jjShadow.find('[data-role="name"]')?.setText(this.#userName)
        this.#jjShadow.find('[data-role="count"]')?.setText(String(this.#count))
    }
}

// Caller must await before using the custom element tag
await MyCard.defined
// Or multiple in parallel
await Promise.all([MyCard.defined, OtherCard.defined])
```

## Every observed attribute needs a matching property

`attr2prop` throws when an observed attribute has no matching camelCase property — an
observed attribute without a setter is always a bug (a typo, a renamed field, or a stale
entry). The message names both the property and the two fixes.

`defineComponent()` returns `Promise<boolean>`: `false` when it defined the element,
`true` when it was already defined with the same constructor. Awaiting is the readiness
signal; the boolean only reports what happened. A different constructor for the same name
throws, and PascalCase names are rejected (kebab-case with a hyphen is required).

## Light DOM variant

Light DOM components keep only `#jjHost`; there is no shadow root to wrap.

```ts
class MySection extends HTMLElement {
    #jjHost // JJHE wrapping the custom element itself
    #isInitialized = false

    async connectedCallback() {
        if (!this.#isInitialized) {
            this.#jjHost = JJHE.from(this)
            this.#jjHost.setTemplate(await templatePromise)
            this.#isInitialized = true
        }
    }
}
```

## Wrapper identity

- Use one stable wrapper per component: `#jjHost` with `JJHE.from(this)`, and `#jjShadow` with `JJHE.from(this).shadow()`.
- `getChildren()` and `find()` return **new** wrapper instances on each call, so compare `.ref` (not the wrappers) when checking node identity.
- Initialize template content once, then update specific nodes with `find(...).setText(...)`.

## Closed shadow roots

`shadow()` supports `'open'` only: `Element.shadowRoot` is `null` for a closed root, so
there is nothing to wrap. For closed mode use `setShadow('closed')` with `initShadow(...)`.
