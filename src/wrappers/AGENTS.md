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

`JJN.wrap()` is a special function because it tries to return the most specific sub-type of `JJN` and that requires access to classes that extend `JJN`.

To achieve that while working around the circular dependency issue, the implementation is broken to two parts:

1. `JJN.wrap()` contains a basic implementation in `JJN-raw.ts` which is not exported directly. All classes that inherit from `JJN` should get it from this file.
2. Then `JJN.ts` overrides that implementation with a richer one and re-exports it.
3. All files that need a reference to `JJN` should get it from `JJN.ts` file to avoid circular dependency.

This way, the upgraded `JJN.wrap()` static method is available inside all the JJ\* classes that inherit from `JJN` via their `CONSTRUCTOR.wrap()`

When checking wrapper inputs in this method, use `isInstance(template, JJN)` (not `JJDF`/`JJHE`) to avoid circular dependencies and keep support generic for any JJ wrapper.

Tests live in the root `test/` folder. From there, import wrappers via `../src/index.ts`.

## Related Task Skills

- `../../skills/SKILL.md` (main skill)
- `../../skills/references/querying-patterns.md`
- `../../skills/references/eventing-patterns.md`
- `../../skills/references/error-handling-patterns.md`
