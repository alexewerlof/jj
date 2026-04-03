# Testing with jsdom

JJ tests run in Node.js using jsdom for DOM emulation and the native `node:test` runner.

## Setup

Every test file must import the jsdom attachment helper first:

```js
import '../attach-jsdom.js'   // relative path from test/ folder
```

This sets up global `window`, `document`, `HTMLElement`, etc. via jsdom before any JJ imports resolve.

## Running tests

```bash
npm test                          # typecheck + all tests
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
            const div = JJHE.create('div')
            assert.ok(div instanceof JJHE)
            assert.strictEqual(div.ref.tagName, 'DIV')
        })

        it('throws TypeError for non-string tagName', () => {
            assert.throws(() => JJHE.create(42), TypeError)
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
    await new Promise(r => setTimeout(r, 0))

    const shadow = el.shadowRoot
    assert.ok(shadow)
    assert.strictEqual(shadow.querySelector('[data-role="title"]').textContent, '')
})
```

## Testing custom events

```js
it('dispatches todo-toggle with detail', () => {
    const el = JJHE.create('div')
    let captured = null
    el.on('todo-toggle', (e) => { captured = e.detail })
    el.triggerCustomEvent('todo-toggle', { id: 1, done: true })
    assert.deepStrictEqual(captured, { id: 1, done: true })
})
```

## jsdom limitations

Some browser APIs are not fully implemented in jsdom:
- Web Animations API — stub or skip those tests
- `ResizeObserver` — may need polyfill
- `IntersectionObserver` — may need polyfill
- `customElements.define` — available but lifecycle callbacks may differ

## Browser references
- jsdom project: https://github.com/jsdom/jsdom
- Node.js test runner: https://nodejs.org/api/test.html
