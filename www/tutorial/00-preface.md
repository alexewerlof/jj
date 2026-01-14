# This is gonna be short

Unlike frameworks like React, Vue, or Svelte, JJ doesn't have a huge API surface mainly because:

- It doesn't try to **duplicate** the features of modern browsers. It merely adds sugar syntax for the most common use cases.
- It doesn't try to create a thick **abstraction**. You can read the entire code in 10-15 minutes and know exactly how it works.
- [Principle of least astonishment](https://en.wikipedia.org/wiki/Principle_of_least_astonishment): It **mimics** the naming convention from DOM API. Instead of using proprietary docs, you can just guess what's already there.
- No build required
- Use modern browser features
- Immutability: once a wrapper is initialized, its underlying reference cannot change.
- It is essentially a **tiny** library. There's only so much that can fit here. Currently we don't have sugar syntax for a few constructs but you can easily use native browser API for those because JJ is built with the assumption that you can handle the browser API:
    - [Animation](https://developer.mozilla.org/en-US/docs/Web/API/Animation)
    - [Routing](https://developer.mozilla.org/en-US/docs/Web/API/History_API)
    - [Travering](https://developer.mozilla.org/en-US/docs/Web/API/TreeWalker)

But still, you're here because you want to learn something, so let's get to it.
