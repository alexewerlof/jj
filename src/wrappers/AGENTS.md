Instead of monkey-patching DOM elements, JJ relies on wrapper classes. Each wrapper class starts with `JJ` and follows by 1-2 letter specifying the DOM construct it wraps. The underlying native construct is always accessible via the readonly `.ref` property.

The `JJ` classes follow the same inheritance hierarchy as the DOM constructs they wrap. The hierarchy is as follows:

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

## Text APIs

- `getText()` and `setText()` are implemented on `JJE` and inherited by `JJHE`, `JJSE`, and `JJME`.
- These methods use `textContent` only.
- For HTML-specific rendering-aware behavior, use `jjEl.ref.innerText` on `JJHE` wrappers.
- `JJD` does not expose `getText()` or `setText()`. Per MDN, `Document.textContent` and `DocumentType.textContent` are `null`.
  Use `document.documentElement.textContent` or `jjDoc.ref.documentElement.textContent` or `JJE.from(document.documentElement).getText()`.

Tests live in the root `test/` folder. From there, import wrappers via `../src/index.ts`.

## Related Task Skills

- `../../skills/SKILL.md` (main skill)
- `../../skills/references/querying-patterns.md`
- `../../skills/references/eventing-patterns.md`
- `../../skills/references/error-handling-patterns.md`
