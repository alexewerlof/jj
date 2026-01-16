[Tutorial](tutorial/) | [Reference](../doc/) | [Examples](examples)

# JJ

A thin sugar API on top of brower's native features.

Design Philosophy:

1. **Balance simplicity with power:** Provide a light weightsugar syntax for the most common use cases while providing easy access to the browser's native API.
2. **Embrace browser features:** Don't hide the modern browser features.
3. **Don't sacrifice performance in the name of abstraction:** Use the absolute minimum memory. No Virtual DOM, no CSS in JS, no HTML in JS, no babysitting the developer.
4. **Play well with other frameworks:** React, Vue, Svelte, Lit, ... whatever you prefer is fine because JJ plays nice with other libraries and frameworks. JJ doesn't want to dominate the world. It just wants to introduce elegance when needed.

## How is this possible [now]?

For years, complex web development required complex tools. We traded simplicity for power. But today, the web platform is ready to stand on its own. Most browsers update regularly and the killer features are already in place.

JJ leverages modern standards like **Web Components** and **ES Modules** to give you a developer experience that feels like a framework, with the lightweight footprint of vanilla JavaScript.

No build steps required. No Virtual DOM overhead. Just clean, performant code that runs everywhere. **Welcome to the future of native web development.**

## When should you [not] use JJ?

JJ is a good choice for:

- Web applications that prioritize performance
- Simple web applications
- Static websites where a little JavaScript is enough
- Developers who prefer to work with browser API beautifully

JJ is not a good choice for:

- Complex and heavy web applications with hundreds of files
- Web applications that need to support legacy applications
- Produts where the exisitng code base and tooling is in a drastically different framework/library
- Developers who prefer abstractions on top of the API and don't mind performance hit
