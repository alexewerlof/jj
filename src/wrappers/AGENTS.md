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

Each class is implemented in its own file and the `./index.ts` file re-exports it.

## Wrappers

The `Wrappers` class is an internal database of wrapper classes. All the publicly exposed wrapper classes, register their constructor using the relevant instances of the Wrappers class which is exposed via `./Wrappers.js`. The reason this class exists is to work around circular dependencies.

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
