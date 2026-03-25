# Just JavaScript!

**Faster than VDOM. No Build Step. Use the Platform!**

**JJ** is a lightweight, no-transpilation library for modern web development. What You Write Is What Is Run (WYWIWIR).

## ⚡ Quick Start

```bash
npm i jj
```

```js
import { JJHE } from 'jj'

JJHE.create('div')
    .addClass('card')
    .setText('Hello World!')
    .on('click', () => console.log('Hi'))
```

Use namespace-aware wrappers for non-HTML elements:

```js
import { JJSE, JJME } from 'jj'

const icon = JJSE.create('svg').setAttr('viewBox', '0 0 24 24')
const formula = JJME.create('math').addChild(JJME.create('mi').setText('x'))
```

## 🚀 Why JJ?

- **Zero Build** – Runs directly in modern browsers
- **Native Speed** – Direct DOM manipulation, no VDOM overhead
- **Web Standards** – First-class Web Components support
- **Fluent API** – Chainable methods for cleaner code

JJ is **not** a reactive framework, template compiler, or state-management system.

## API Notes

Batch setter helpers use explicit `Multi` methods:

- `setAttrMulti({...})`
- `setAriaMulti({...})`
- `setDataMulti({...})`
- `setClassMulti({...})`

## 🧩 Custom Elements Readiness

Use `defineComponent(name, constructor, options?)` and expose a static `defined` promise on each custom element class:

```js
import { defineComponent } from 'jj'

export class MyWidget extends HTMLElement {
    static defined = defineComponent('my-widget', MyWidget)
}

await MyWidget.defined
```

`defineComponent()` resolves a `Promise<boolean>`:

- `false`: this call registered the component.
- `true`: it was already registered with the same constructor.

This explicit definition step is important for reliability. If markup is parsed before the element is defined, upgrades can race with rendering and produce flaky behavior.

## 📚 Learn More

**👉 [Visit the full site with tutorials, examples, and API docs](https://alexewerlof.github.io/jj)**

## 🤖 AI-Optimized Development

JJ is designed for AI-assisted development. Install the skill for intelligent code suggestions:

```bash
npx skills add alexewerlof/jj
```

Once installed, AI agents (GitHub Copilot, Cursor, Claude Code, Windsurf, etc.) will:

- Follow JJ's patterns and conventions automatically
- Know when to use `.ref` for native DOM access
- Suggest correct framework translations (React/Vue/jQuery/Svelte → JJ)
- Generate idiomatic, type-safe code

The skill definition (`SKILL.md`) is also included in the npm package at `node_modules/jj/SKILL.md`.

## ✅ Testing

The entire public API is tested thoroughly.
Tests live in the `test/` folder and mirror the source filenames (e.g., `test/JJE.test.ts` for `src/JJE.ts`, `test/JJME.test.ts` for `src/wrappers/JJME.ts`) while importing the target from `./src/index.js`.

Run tests with:

```bash
npm test
```

## License

MIT

_Made in Sweden 🇸🇪 by [Alex Ewerlöf](https://alexewerlof.com/)_
