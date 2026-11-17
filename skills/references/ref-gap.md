# `.ref` Gap Reference

JJ deliberately covers the common DOM operations and leaves the rest to the platform. This
page lists the native APIs you are _expected_ to reach through `.ref`, so that a `.ref` in a
diff is either on this list (fine) or a sign that a JJ helper was missed.

**Rule:** use a wrapper method first. If the operation is on this list, `.ref` is the
approved path. If it is not on this list and JJ covers it, use the wrapper.

> **jsdom caveat:** jsdom does not implement some browser APIs on this list —
> `HTMLDialogElement.showModal()`, `innerText`, `scrollIntoView()`, and
> `getBoundingClientRect()` return nothing or throw there. Feature-detect or stub them in
> tests; see `references/testing-with-jsdom.md`.

## Approved `.ref` escapes

### Element state and identity

| Need                         | Use                                | Why not wrapped                            |
| ---------------------------- | ---------------------------------- | ------------------------------------------ |
| Checkbox/radio checked state | `jjEl.ref.checked`                 | Element-specific; `getValue()` is not it   |
| Serialized markup            | `jjEl.ref.outerHTML`               | Read-only snapshot; `getHTML()` is inner   |
| Rendered (layout) text       | `jjEl.ref.innerText`               | `getText()` is `textContent` by design     |
| `getBoundingClientRect()`    | `jjEl.ref.getBoundingClientRect()` | Returns a native rect object               |
| `scrollIntoView()`           | `jjEl.ref.scrollIntoView()`        | Options object, no return value            |
| `matches()` / `closest()`    | `closest()` is wrapped — prefer it | —                                          |
| Live collections             | `jjEl.ref.getElementsByTagName()`  | Wrapped `findAll()` returns a static array |

### Dialogs and forms

| Need                | Use                          | Why not wrapped                            |
| ------------------- | ---------------------------- | ------------------------------------------ |
| Open a modal dialog | `jjDialog.ref.showModal()`   | Modality/return-value semantics vary       |
| Close a dialog      | `jjDialog.ref.close(result)` | `result` is dialog-specific                |
| Reset a form        | `jjForm.ref.reset()`         | Form-specific state transition             |
| Validity            | `jjForm.ref.checkValidity()` | Constraint-validation API surface is large |
| File inputs         | `jjInput.ref.files`          | `FileList` has no JJ equivalent            |

`focus()` and `click()` _are_ wrapped on `JJHE` — use `jjEl.focus()` / `jjEl.click()`.

### Custom-element and component internals

| Need                              | Use                                  |
| --------------------------------- | ------------------------------------ |
| Read/write an undeclared property | `jjHost.ref.someProp = value`        |
| Call a public component method    | `jjHost.ref.someMethod()`            |
| Observe attribute changes         | `observedAttributes` + `attr2prop`   |
| Shadow root of a closed root      | `setShadow('closed')` + `initShadow` |

### Node insertion JJ does not wrap

| Need                                 | Use                                        |
| ------------------------------------ | ------------------------------------------ |
| Insert before a specific child       | `jjParent.ref.insertBefore(new, existing)` |
| Move an element preserving state     | `jjParent.ref.moveBefore(el, ref)`         |
| Append to `<head>`/`<body>` directly | `JJHE.from(document.head).addChild(...)`   |

Prefer the wrapped equivalents where they exist: `addChild`, `preChild`, `setChild`,
`swChild`, `addTemplate`.

### APIs that are not DOM at all

These are out of scope by design — JJ wraps the DOM, not the platform:

- `fetch` / `WebSocket` / `BroadcastChannel` — `fetchTemplate` and `fetchStyle` cover assets only.
- `history` / `location` — see the [architecture guide](../../guides/architecture.md) routing section.
- `Element.animate()` / Web Animations API.
- `IntersectionObserver` / `ResizeObserver` / `MutationObserver`.
- `navigator.*`, `localStorage`, `matchMedia`.

## When `.ref` is a code smell

- `jjEl.ref.classList` — use `addClass` / `rmClass` / `swClass` / `setClasses`.
- `jjEl.ref.setAttribute` / `getAttribute` / `removeAttribute` — use `setAttr` / `getAttr` / `rmAttr`.
- `jjEl.ref.dataset` — use `getDataAttr` / `setDataAttr` / `setDataAttrs`.
- `jjEl.ref.style` — use `getStyle` / `setStyle` / `setStyles` (camelCase is accepted).
- `jjEl.ref.textContent` — use `getText` / `setText`.
- `jjEl.ref.innerHTML` — use `getHTML` / `setHTML(html, true)`.
- `jjEl.ref.value` — use `getValue` / `setValue` (typed `string` for form controls).
- `jjEl.ref.querySelector` / `querySelectorAll` — use `find` / `findAll`.
- `jjEl.ref.appendChild` / `removeChild` / `replaceChildren` — use `addChild` / `rm()` / `setChild`.
- `jjEl.ref.addEventListener` — use `on` / `off`.

## Browser references

- [Element](https://developer.mozilla.org/en-US/docs/Web/API/Element)
- [HTMLInputElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement)
- [HTMLDialogElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLDialogElement)
- [Node.insertBefore](https://developer.mozilla.org/en-US/docs/Web/API/Node/insertBefore)
