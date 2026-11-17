# Testing with jsdom

JJ tests run in Node.js using jsdom for DOM emulation and the native `node:test` runner.

## Setup

Every test file must import the jsdom attachment helper first:

```js
import '../attach-jsdom.js' // relative path from test/ folder
```

This sets up global `window`, `document`, `HTMLElement`, etc. via jsdom before any JJ imports resolve.

## Running tests

```bash
npm test                          # runs the Node test suite (typecheck is a separate script)
node --import tsx --test          # run tests directly (tsx for TypeScript)
node --import tsx --test test/JJHE.test.ts  # single file
```

## Test file structure

Mirror source filenames: `src/wrappers/JJHE.ts` → `test/JJHE.test.ts`.

```js
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import '../attach-jsdom.js'
import { JJHE } from '../src/index.js'

describe('JJHE', () => {
    describe('static create()', () => {
        it('creates element from tag name', () => {
            const jjDiv = JJHE.create('div')
            assert.ok(jjDiv instanceof JJHE)
            assert.strictEqual(jjDiv.ref.tagName, 'DIV')
        })

        it('throws TypeError for non-string tagName', () => {
            assert.throws(() => JJHE.create(42 as any), TypeError)
        })
    })
})
```

## Testing shadow DOM

jsdom supports `attachShadow`. Await component initialization before asserting:

```js
it('renders title in shadow', async () => {
    const el = document.createElement('my-card')
    document.body.appendChild(el)
    await MyCard.defined

    // Trigger connectedCallback by letting microtasks flush
    await new Promise((r) => setTimeout(r, 0))

    const shadow = el.shadowRoot
    assert.ok(shadow)
    assert.strictEqual(shadow.querySelector('[data-role="title"]').textContent, '')
})
```

## Testing custom events

```js
it('dispatches todo-toggle with detail', () => {
    const jjEl = JJHE.create('div')
    let captured = null
    jjEl.on('todo-toggle', (e) => {
        captured = (e as CustomEvent).detail
    })
    jjEl.triggerCustomEvent('todo-toggle', { id: 1, done: true })
    assert.deepStrictEqual(captured, { id: 1, done: true })
})
```

## jsdom limitations

Some browser APIs are not fully implemented in jsdom:

- Web Animations API — stub or skip those tests
- `ResizeObserver` — may need polyfill
- `IntersectionObserver` — may need polyfill
- `customElements.define` — available but lifecycle callbacks may differ
- `HTMLElement.innerText` — `undefined`; use `textContent` (which is what `getText()` uses)
- `HTMLDialogElement.showModal()` / `close()` — missing; stub them
- `Element.scrollIntoView()` and `getBoundingClientRect()` — no layout, so they return zeros or nothing
- `window.CSS` — absent, so `CSS.supports()` cannot be used (JJ validates style names another way)

These matter when a test asserts on `.ref` behavior. Prefer asserting on JJ helpers where
possible, and see `references/ref-gap.md` for which native APIs are expected to be reached
through `.ref`.

## Browser references

- jsdom project: https://github.com/jsdom/jsdom
- Node.js test runner: https://nodejs.org/api/test.html
