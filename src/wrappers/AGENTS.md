The hierarchy is as follows:

```
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

## JJN

`JJN.wrap()` is a special function because it tries to return the most specific sub-type of `JJN` which inherit from it.

To achieve that while working around the circular dependency issue, the implementation is broken to two parts:

1. `JJN.wrap()` contains a basic implementation in `JJN-raw.ts` which is not exported directly. All JJ\* classes that need a reference to `JJN` should get it from this file to avoid circular dependency.
2. Then `JJN.ts` overrides that implementation with a richer one and re-exports it.

This way, the upgraded `JJN.wrap()` static method is available inside all the JJ\* classes that inherit from `JJN` via their `CONSTRUCTOR.wrap()`

Tests live in the root `test/` folder. From there, import wrappers via `../src/index.ts`.
