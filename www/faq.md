# FAQ

Here are some common questions about JJ and its design philosophy.

## If it's **just javascript** why is the source code in Typescript?

A few reasons:

- Having the source code in Typescript ensures that the typescript `.d.ts` files that are included in each deploy are always up to date
- Typescript has its own place. In the context of this library's code, it facilitates refactoring
- Another way to think about Typescript is just Javascript with types. Essentially it's not a different language. It is **just javascript** too!

The **just javascript** motto refers to YOUR code: you can use plain javascript with no build process to implement most applications.

## Why not use React, Vue, or Svelte?

JJ takes a different approach by not trying to duplicate modern browser features or create thick abstractions. It is designed to be a tiny library that adds sugar syntax to the DOM API, adhering to the [Principle of least astonishment](https://en.wikipedia.org/wiki/Principle_of_least_astonishment). You can read the entire source code in 10-15 minutes.

You are absolutely encouraged to use the right tool for the job and refactor as the complexity of your product changes. JJ does not fight with other libraries. It's totally possible to use JJ with any other library because it operates at the DOM level and is not concerned with the abstraction models of frameworks.

## Do I need a build step?

No. JJ is designed to work without a build process. It leverages modern browser features and ES modules directly, which simplifies debugging and eliminates sourcemap issues.
If you're using an IDE, the Typescript types are included out of the box.

## How does JJ handle state management?

JJ leans closer to an **imperative** style rather than the declarative nature of frameworks like React. It encourages using native encapsulation mechanisms like modules, classes, and events. This approach avoids the overhead of Virtual DOM or dirty-checking, giving you more control and performance.

## How do I handle Routing, Animation, or CSS?

JJ does not provide sugar syntax for every web capability. It assumes you can handle native browser APIs for:

- **Routing**: [History API](https://developer.mozilla.org/en-US/docs/Web/API/History_API)
- **Animation**: [Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Animation)
- **CSS**: [Nesting](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Nesting) and [Variables](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Cascading_variables/Using_custom_properties)

## Does the event handler run in the context of JJ?

No. If you want the `this` keyword to refer to the current instance, you can either use arrow functions (`=>`) or `.bind(this)` to your event handler. This is how DOM `EventTarget` works and JJ doesn't add extra abstraction for something that's essentially an opt-in behavior.

## What is `JJHE`?

`JJHE` stands for **Wrapped HTMLElement**. It is a wrapper class used by JJ to provide method chaining and sugar syntax.

## Can I access the underlying DOM element?

Yes. Every wrapper instance has a `.ref` property that points to the underlying DOM entity (e.g., `HTMLElement`, `Text`, `SVGElement`).

## Can I change the underlying reference of a wrapper?

No. JJ enforces immutability regarding the wrapper's reference. Once a wrapper is initialized, its `.ref` cannot be changed.
