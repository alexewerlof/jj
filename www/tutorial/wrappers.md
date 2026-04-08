# Wrapper Mental Model

Wrappers are key idea behind JJ. The idea is simple: instead of monkey-patching browser's native constructs, we

Wrappers add sugar syntax on top of native DOM constructs without monkey-patching or modifying browser prototypes. Each wrapper keeps a stable pointer to the native object via `.ref`.

All wrappers start with `JJ` and the abbreviation of the DOM construct they wrap:

```txt
JJET: wraps DOM EventTarget
└── JJN: wraps DOM Node
    ├── JJT: wraps DOM Text
    └── JJNx (private: common methods for JJN descendants except JJT)
        ├── JJD: wraps DOM Document
        ├── JJDF: wraps DOM DocumentFragment
        │   └── JJSR: wraps DOM ShadowRoot
        └── JJE: : wraps DOM Element
            └── JJEx (private: common methods for JJE descendants)
                ├── JJHE: wraps DOM HTMLElement
                ├── JJSE: wraps DOM SVGElement
                └── JJME: wraps DOM MathMLElement
```

OK, that's a lot of `JJ`! In practice, you will mostly use `JJHE` to work with HTML elements, `JJD` to work with the `document` object and `JJSR` to handle shadow DOM (for components).

All descendants of `JJN` (basically all the wrappers except `JJET`) have a few `static` functions:

- `wrap()` to wrap an existing native object and return the appropriate wrapper (there's also an array variation called `wrapAll()`).
- `unwrap()` to get the native object from a wrapper (and the array version is `unwrapAll()`).

## How to use this in practice

- Use `JJD.from(document)` when starting document-level work.
- Use `JJHE.create()` for HTML elements, `JJSE.create()` for SVG, `JJME.create()` for MathML.
- Query with wrapper methods (`find`, `findAll`, `closest`) and keep chaining.
- Reach for `.ref` only when you need a native API JJ does not wrap.

This hierarchy is why JJ can return specific wrappers for parent/children traversal while still keeping the API compact.

## MDN

- DOM introduction: https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model
