[Tutorial](tutorial/) | [Reference](../doc/) | [Examples](examples)

# JJ Tutorial

JJ is a thin sugar API on top of browser-native features.

This tutorial is built for developers who already know tools like React, Vue, Svelte, Angular, jQuery, or Lit and want to get productive with the modern web platform directly.

## What you will learn

- How JJ wraps native DOM APIs without hiding them
- How to build UI with fluent chaining and wrapper helpers
- How to use native Web Components with JJ utilities
- How to structure state, events, and styles without a virtual DOM

## Reading order

1. [Getting Started](./?file=getting-started.md)
2. [Design Philosophy](./?file=design-philosophy.md)
3. [DOM Fundamentals](./?file=dom-fundamentals.md)
4. [State and Events](./?file=state-and-events.md)
5. [Custom Components](./?file=custom-components.md)
6. [Wrapper Mental Model](./?file=wrapper-mental-model.md)
7. [Common Errors](./?file=common-errors.md)

## Keep this in mind

JJ does not replace the platform. It helps you work with it fluently.

- You can always access the native node via `.ref`
- You can mix JJ with any other library because JJ works at DOM level
- You can keep using native browser features for routing, animation, and storage

## Browser environment references

These APIs are part of your main toolbox with JJ:

- Custom elements: https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements
- Shadow DOM: https://developer.mozilla.org/en-US/docs/Web/API/ShadowRoot
- EventTarget and CustomEvent: https://developer.mozilla.org/en-US/docs/Web/API/EventTarget
- History API: https://developer.mozilla.org/en-US/docs/Web/API/History_API
- Web Animations API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API
- CSS custom properties: https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties

For deeper reference-style reading, continue in [Guides](../guides/index.md).
