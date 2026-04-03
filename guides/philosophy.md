# JJ Philosophy

JJ is a minimal DOM wrapper library that amplifies the web platform rather than replacing it.

You are absolutely encouraged to use the right tool for the job and refactor as the complexity of your product changes.

## Why imperative?

JJ takes an imperative approach: your code describes _what_ changes, not _what the UI should look like_ at all times. This differs from reactive frameworks (React, Vue, Svelte) where you declare state relationships and the framework reconciles the DOM for you.

**Imperative DOM is predictable.** When you call `el.setText('Hello')`, you know exactly when it runs and exactly what changes. There are no re-render batches, reconciliation algorithms, or fiber scheduling — just direct DOM mutation.

**Imperative DOM is debuggable.** Set a breakpoint inside an event handler and the call stack is short and obvious. In reactive systems, tracing why a component re-rendered requires understanding the entire dependency graph and scheduler timing.

**Imperative DOM maps directly to the platform.** Every JJ operation corresponds to a DOM API you can look up on MDN. There is no concept of "how does JJ decide when to update?"

That said, imperative code grows verbose when many elements must stay in sync with complex, frequently changing state. If that describes your project, a reactive framework is a better fit.

## Why no virtual DOM?

Virtual DOM (popularized by React) diffs two JavaScript trees and applies the minimum set of real DOM mutations. It is useful when:

1. A component re-renders frequently from data changes.
2. You want to batch multiple state changes into one DOM pass.
3. Framework-managed diffing is faster than manual DOM updates would be.

JJ makes a different trade-off. If you change `el.textContent` once per event, the browser handles what needs to repaint. You do not need a diff layer when updates are already targeted and intentional.

Virtual DOM has real costs:

- Bundle weight (React is ~45 KB gzipped before your code).
- Double-pass work: build VDOM, then reconcile into real DOM.
- Debugging virtual representations in DevTools instead of actual DOM.
- Lifecycle complexity (hooks, effects, memoization, stale closures).

JJ avoids these costs. The trade-off: you decide which nodes to update and when.

## What JJ is and is not

**JJ is:**

- A thin, type-safe layer over the browser's DOM API.
- A tiny fluent layer on top of native DOM APIs.
- A wrapper-based API that keeps native escape hatches available through `.ref`.
- A library that complements browser standards instead of replacing them.
- A set of helpers for loading templates, stylesheets, and registering components.

**JJ is not:**

- A virtual DOM framework or template compiler.
- A state-management runtime.
- A replacement for React, Vue, or Svelte — use those if you need reactive component trees.
- An animation engine — use the [Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API) or GSAP directly.
- A built-in router — use the [History API](https://developer.mozilla.org/en-US/docs/Web/API/History_API) directly.

## The `.ref` escape hatch

Every JJ wrapper exposes `.ref`, the underlying native DOM node. When no JJ method covers what you need, drop down to `.ref` directly.

```js
const video = JJHE.create('video')
video.setAttr('src', myUrl).setAttr('autoplay', '')

// JJ has no .play() or .pause() method — use .ref
video.ref.play()
```

This is intentional. Wrapping every DOM API would bloat the bundle and duplicate MDN documentation. JJ covers the most-used operations and trusts you to reach for `.ref` when needed.

The escape hatch is not a workaround — it is a design feature. The library is not trying to own your entire DOM interaction; it is trying to make the 80% case fluent.

## How JJ compares to jQuery

jQuery also wraps DOM operations and popularized fluent chaining. The differences:

|                     | jQuery                          | JJ                                                         |
| ------------------- | ------------------------------- | ---------------------------------------------------------- |
| Scope model         | Global `$('...')` selects a set | Per-node wrappers with explicit creation                   |
| Type safety         | No TypeScript inference         | Subtypes inferred at creation (`JJHE<HTMLInputElement>`)   |
| ESM support         | CommonJS / global script        | Native ESM, tree-shakeable                                 |
| Wrapper granularity | Homogeneous collection          | One wrapper per class: `JJHE`, `JJSE`, `JJME`, `JJT`, etc. |

JJ gives you type inference at construction time:

```js
const input = JJHE.create('input') // TypeScript: JJHE<HTMLInputElement>
input.setAttr('type', 'email') // Autocomplete and type checks flow from this
```

## How JJ compares to Lit

Lit (and similar Web Components frameworks) solve the _declarative component_ problem with HTML template tags, reactive `@property` decorators, and a reactive update cycle.

JJ is more primitive. It gives you fluent wrappers for DOM mutation and setup, helpers for `setShadow()`, `fetchTemplate()`, `fetchStyle()`, and `defineComponent()` — but no template compilation step and no reactive property system.

JJ is a complement to the native Custom Elements API, not a replacement for Lit's component model. If you want declarative rendering and reactive property bindings, use Lit. If you want direct, predictable control, use JJ.

## Platform-first mindset

JJ assumes moderate to advanced web developers can use native browser features directly when needed. MDN is your primary reference.

Relevant browser APIs:

- [History API](https://developer.mozilla.org/en-US/docs/Web/API/History_API)
- [Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Animation)
- [Custom Elements](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements)
- [Shadow DOM](https://developer.mozilla.org/en-US/docs/Web/API/Element/attachShadow)
- [Constructable Stylesheets](https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleSheet/CSSStyleSheet)
- [CSS Nesting](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Nesting)
- [CSS Custom Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)

## Audience

JJ is designed for:

- Moderate to advanced web developers who want direct platform control.
- Teams migrating away from a framework who want DOM-level control without losing type safety.
- AI agents that need concise, explicit, verifiable APIs for DOM tasks.

## Related

- [tutorial getting started](../www/tutorial/getting-started.md)
- [tutorial design philosophy](../www/tutorial/design-philosophy.md)
- [README](../README.md)
