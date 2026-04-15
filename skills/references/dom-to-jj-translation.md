# Native DOM to JJ Translation

This guide maps native DOM/Web APIs to JJ wrappers.

Use this as the first-stop reference when you know browser DOM APIs but need the JJ equivalent quickly.

## Quick mapping (common conversions)

| Native DOM              | JJ equivalent                  |
| ----------------------- | ------------------------------ |
| `querySelector()`       | `find()`                       |
| `querySelectorAll()`    | `findAll()`                    |
| `append()`              | `addChild()` / `addChildren()` |
| `prepend()`             | `preChild()` / `preChildren()` |
| `replaceChildren()`     | `setChild()` / `setChildren()` |
| `setAttribute()`        | `setAttr()`                    |
| `addEventListener()`    | `on()`                         |
| `removeEventListener()` | `off()`                        |
| `attachShadow()`        | `setShadow()`                  |

## Read this table correctly

- `Exact`: Behavior is the same as native semantics.
- `Partial`: Closest native equivalent exists, but JJ adds defaults, validation, or extra behavior.
- `JJ-only`: Fluent helper with no single direct native method.

## Wrapper hierarchy and inheritance

Most JJ wrappers inherit methods from base wrappers. To avoid duplicate tables, this guide documents methods where they are defined.

- `JJET` defines event APIs.
- `JJN` adds node APIs.
- `JJNx` adds query and child/template mutation APIs.
- `JJE` adds element, attr/class/aria, text/html, and shadow APIs.
- `JJEx` adds style and dataset helpers.
- `JJHE`, `JJSE`, `JJME` add namespace-specific creation and helpers.
- `JJD`, `JJDF`, `JJSR` mostly expose inherited APIs plus a few specific ones.
- `JJT` is text-node specific.

## EventTarget -> JJET

| Native equivalent                                              | JJ API                                        | Kind    |
| -------------------------------------------------------------- | --------------------------------------------- | ------- |
| N/A (wrapper factory)                                          | `JJET.from(ref)`                              | JJ-only |
| `addEventListener(type, handler, options)`                     | `on(type, handler, options?)`                 | Exact   |
| `removeEventListener(type, handler, options)`                  | `off(type, handler, options?)`                | Exact   |
| `dispatchEvent(event)`                                         | `trigger(event)`                              | Exact   |
| `dispatchEvent(new Event(type, options))`                      | `triggerEvent(type, options?)`                | Partial |
| `dispatchEvent(new CustomEvent(type, { detail, ...options }))` | `triggerCustomEvent(type, detail?, options?)` | Partial |
| N/A (chain callback helper)                                    | `run(fn)`                                     | JJ-only |

Notes:

- `triggerEvent()` and `triggerCustomEvent()` default `bubbles: true` and `composed: true`.

## Node -> JJN

| Native equivalent                                | JJ API                    | Kind    |
| ------------------------------------------------ | ------------------------- | ------- |
| N/A (wrapper factory)                            | `JJN.from(node)`          | JJ-only |
| N/A (type helper)                                | `JJN.isWrappable(x)`      | JJ-only |
| N/A (smart wrapper factory)                      | `JJN.wrap(raw)`           | JJ-only |
| N/A (wrapper to native helper)                   | `JJN.unwrap(obj)`         | JJ-only |
| N/A (batch wrap helper)                          | `JJN.wrapAll(iterable)`   | JJ-only |
| N/A (batch unwrap helper)                        | `JJN.unwrapAll(iterable)` | JJ-only |
| `parentNode`                                     | `getParent(required?)`    | Partial |
| `childNodes`                                     | `getChildren(required?)`  | Partial |
| `cloneNode(deep)`                                | `clone(deep?)`            | Exact   |
| `parentNode.removeChild(node)` / `node.remove()` | `rm()`                    | Exact   |
| `append(...valuesAsTextNodes)`                   | `addText(...values)`      | Partial |

Notes:

- `getParent(true)` and `getChildren(true)` throw when missing, unlike native accessors.

## ParentNode and NonElementParentNode -> JJNx

Defined on `JJNx` and inherited by `JJD`, `JJDF`, `JJSR`, and `JJE` descendants (`JJHE`, `JJSE`, `JJME`).

| Native equivalent                      | JJ API                      | Kind    |
| -------------------------------------- | --------------------------- | ------- |
| `querySelector(selector)`              | `find(selector, required?)` | Partial |
| `querySelectorAll(selector)`           | `findAll(selector)`         | Exact   |
| `append(...children)`                  | `addChild(...children)`     | Partial |
| `append(...children)`                  | `addChildren(children[])`   | Partial |
| `append(...array.map(mapFn))`          | `addChildMap(array, mapFn)` | JJ-only |
| `prepend(...children)`                 | `preChild(...children)`     | Partial |
| `prepend(...children)`                 | `preChildren(children[])`   | Partial |
| `prepend(...array.map(mapFn))`         | `preChildMap(array, mapFn)` | JJ-only |
| `replaceChildren(...children)`         | `setChild(...children)`     | Partial |
| `replaceChildren(...children)`         | `setChildren(children[])`   | Partial |
| `replaceChildren(...array.map(mapFn))` | `setChildMap(array, mapFn)` | JJ-only |
| `replaceChildren()`                    | `empty()`                   | Exact   |
| Template clone + append patterns       | `addTemplate(template)`     | Partial |
| `replaceChildren(clonedTemplate)`      | `setTemplate(template)`     | Partial |

Notes:

- `find(selector, true)` throws when the selector misses.
- Child methods accept JJ wrappers and auto-wrap/unwrap values.
- `addChild*` ignores `null` and `undefined` entries.
- `addTemplate()` always clones template content before append.

## Document -> JJD

| Native equivalent     | JJ API               | Kind    |
| --------------------- | -------------------- | ------- |
| N/A (wrapper factory) | `JJD.from(document)` | JJ-only |

Inherited from `JJNx` and `JJN`:

- Query: `find`, `findAll`
- Child/template mutation: `addChild`, `preChild`, `setChild`, `empty`, `addTemplate`, `setTemplate`, and map/array variants
- Node utilities: `getParent`, `getChildren`, `clone`, `rm`, `addText`
- Event APIs from `JJET`: `on`, `off`, `trigger`, `triggerEvent`, `triggerCustomEvent`, `run`

## DocumentFragment -> JJDF

| Native equivalent                   | JJ API                | Kind    |
| ----------------------------------- | --------------------- | ------- |
| N/A (wrapper factory)               | `JJDF.from(fragment)` | JJ-only |
| `document.createDocumentFragment()` | `JJDF.create()`       | Exact   |

Inherited from `JJNx`, `JJN`, and `JJET`.

## ShadowRoot -> JJSR

| Native equivalent                                  | JJ API                      | Kind    |
| -------------------------------------------------- | --------------------------- | ------- |
| N/A (wrapper factory)                              | `JJSR.from(shadowRoot)`     | JJ-only |
| `addTemplate(template)` + adopted stylesheet setup | `init(template, ...styles)` | JJ-only |
| `shadowRoot.innerHTML`                             | `getHTML()`                 | Exact   |
| `shadowRoot.innerHTML = html`                      | `setHTML(html, unsafe?)`    | Partial |
| `shadowRoot.adoptedStyleSheets = ...`              | `addStyle(...styles)`       | Partial |

Notes:

- `setHTML(nonEmpty)` requires `unsafe === true`.
- Inherits all `JJDF`/`JJNx`/`JJN`/`JJET` methods.

## Element -> JJE

| Native equivalent                                | JJ API                            | Kind    |
| ------------------------------------------------ | --------------------------------- | ------- |
| N/A (wrapper factory)                            | `JJE.from(element)`               | JJ-only |
| `getAttribute(name)`                             | `getAttr(name)`                   | Exact   |
| `hasAttribute(name)`                             | `hasAttr(name)`                   | Exact   |
| `setAttribute(name, String(value))`              | `setAttr(name, value)`            | Exact   |
| loop over `setAttribute`                         | `setAttrs(map)`                   | Partial |
| `removeAttribute(name)`                          | `rmAttr(...names)`                | Exact   |
| `toggleAttribute(name, force?)`                  | `swAttr(name, force?)`            | Partial |
| `getAttribute('aria-' + name)`                   | `getAriaAttr(name)`               | Exact   |
| `hasAttribute('aria-' + name)`                   | `hasAriaAttr(name)`               | Exact   |
| `setAttribute('aria-' + name, value)`            | `setAriaAttr(name, value)`        | Exact   |
| loop over ARIA `setAttribute`                    | `setAriaAttrs(map)`               | Partial |
| `removeAttribute('aria-' + name)`                | `rmAriaAttr(...names)`            | Exact   |
| `getAttribute('class')` / `className`            | `getClass()`                      | Exact   |
| `className = ...` / `setAttribute('class', ...)` | `setClass(className)`             | Exact   |
| conditional `classList.add/remove`               | `setClasses(classMap)`            | Partial |
| `classList.add(...names)`                        | `addClass(...names)`              | Exact   |
| `classList.add(...names)`                        | `addClasses(names[])`             | Exact   |
| `classList.remove(...names)`                     | `rmClass(...names)`               | Exact   |
| `classList.remove(...names)`                     | `rmClasses(names[])`              | Exact   |
| `classList.contains(name)`                       | `hasClass(name)`                  | Exact   |
| `classList.toggle(name, force?)`                 | `swClass(name, force?)`           | Partial |
| `closest(selector)`                              | `closest(selector)`               | Exact   |
| `hidden = true` + `aria-hidden='true'`           | `hide()`                          | Partial |
| remove `hidden` + remove `aria-hidden`           | `show()`                          | Partial |
| `disabled = true` + `aria-disabled='true'`       | `disable()`                       | Partial |
| remove `disabled` + remove `aria-disabled`       | `enable()`                        | Partial |
| `textContent` getter                             | `getText()`                       | Exact   |
| `textContent = ...`                              | `setText(value)`                  | Exact   |
| `innerHTML` getter                               | `getHTML()`                       | Exact   |
| `innerHTML = html`                               | `setHTML(html, unsafe?)`          | Partial |
| `attachShadow({ mode })`                         | `setShadow(mode?)`                | Exact   |
| shadow init sequence                             | `initShadow(template, ...styles)` | JJ-only |
| `shadowRoot` getter                              | `getShadow(required?)`            | Partial |

Notes:

- `setHTML(nonEmpty)` requires `unsafe === true`.
- `swClass` and `swAttr` support both explicit and auto-toggle modes.

## HTMLElement, SVGElement, and MathMLElement -> JJEx

Defined on `JJEx` and inherited by `JJHE`, `JJSE`, and `JJME`.

| Native equivalent                | JJ API                     | Kind    |
| -------------------------------- | -------------------------- | ------- |
| `style.getPropertyValue(name)`   | `getStyle(name)`           | Exact   |
| `style.setProperty(name, value)` | `setStyle(name, value)`    | Exact   |
| `style.removeProperty(name)`     | `rmStyle(...names)`        | Exact   |
| loop over style set/remove       | `setStyles(map)`           | Partial |
| `dataset[name]`                  | `getDataAttr(name)`        | Exact   |
| `name in dataset`                | `hasDataAttr(name)`        | Exact   |
| `dataset[name] = value`          | `setDataAttr(name, value)` | Exact   |
| loop over dataset assignment     | `setDataAttrs(map)`        | Partial |
| `delete dataset[name]`           | `rmDataAttr(...names)`     | Exact   |
| loop over `delete dataset[name]` | `rmDataAttrs(names[])`     | Partial |

## HTMLElement -> JJHE

| Native equivalent                          | JJ API                                | Kind    |
| ------------------------------------------ | ------------------------------------- | ------- |
| N/A (wrapper factory)                      | `JJHE.from(element)`                  | JJ-only |
| `document.createElement(tagName, options)` | `JJHE.create(tagName, options?)`      | Exact   |
| manual element build + append chain        | `JJHE.tree(tag, attrs?, ...children)` | JJ-only |
| `el.value`                                 | `getValue()`                          | Exact   |
| `el.value = value`                         | `setValue(value)`                     | Exact   |
| `el.focus()`                               | `focus()`                             | Exact   |
| `el.click()`                               | `click()`                             | Exact   |

Inherited from `JJEx`, `JJE`, `JJNx`, `JJN`, and `JJET`.

## SVGElement -> JJSE

| Native equivalent                                    | JJ API                                | Kind    |
| ---------------------------------------------------- | ------------------------------------- | ------- |
| N/A (wrapper factory)                                | `JJSE.from(element)`                  | JJ-only |
| `document.createElementNS(SVG_NS, tagName, options)` | `JJSE.create(tagName, options?)`      | Exact   |
| manual SVG build + append chain                      | `JJSE.tree(tag, attrs?, ...children)` | JJ-only |
| `setAttribute('fill', value)`                        | `setFill(value)`                      | Exact   |
| `setAttribute('stroke', value)`                      | `setStroke(value)`                    | Exact   |
| `setAttribute('stroke-width', value)`                | `setStrokeWidth(value)`               | Exact   |
| `setAttribute('viewBox', value)`                     | `setViewBox(...)`                     | Partial |
| `setAttribute('width', value)`                       | `setWidth(value)`                     | Exact   |
| `setAttribute('height', value)`                      | `setHeight(value)`                    | Exact   |
| `setAttribute('d', value)`                           | `setD(value)`                         | Partial |
| `setAttribute('transform', value)`                   | `setTransform(value)`                 | Exact   |

Inherited from `JJEx`, `JJE`, `JJNx`, `JJN`, and `JJET`.

## MathMLElement -> JJME

| Native equivalent                                       | JJ API                                | Kind    |
| ------------------------------------------------------- | ------------------------------------- | ------- |
| N/A (wrapper factory)                                   | `JJME.from(element)`                  | JJ-only |
| `document.createElementNS(MATHML_NS, tagName, options)` | `JJME.create(tagName, options?)`      | Exact   |
| manual MathML build + append chain                      | `JJME.tree(tag, attrs?, ...children)` | JJ-only |

Inherited from `JJEx`, `JJE`, `JJNx`, `JJN`, and `JJET`.

## Text -> JJT

| Native equivalent                        | JJ API               | Kind    |
| ---------------------------------------- | -------------------- | ------- |
| N/A (wrapper factory)                    | `JJT.from(textNode)` | JJ-only |
| `document.createTextNode(String(value))` | `JJT.create(value)`  | Exact   |
| `textContent` getter                     | `getText()`          | Exact   |
| `textContent = ...`                      | `setText(value)`     | Exact   |
| append to existing `textContent`         | `addText(...values)` | Partial |
| `textContent = ''`                       | `empty()`            | Exact   |

## Factory-method cross reference

| Native creation API                        | JJ wrapper factory                                          |
| ------------------------------------------ | ----------------------------------------------------------- |
| `document.createElement()`                 | `JJHE.create()`                                             |
| `document.createElementNS(SVG_NS, ...)`    | `JJSE.create()`                                             |
| `document.createElementNS(MATHML_NS, ...)` | `JJME.create()`                                             |
| `document.createTextNode()`                | `JJT.create()`                                              |
| `document.createDocumentFragment()`        | `JJDF.create()`                                             |
| `el.attachShadow()`                        | `JJE.setShadow()`                                           |
| `new EventTarget`/`new Node` wrapping      | `JJET.from()` / `JJN.from()` and specific `.from()` methods |

## Practical translation defaults for agents

- Start from wrappers (`JJD.from(document)`, `JJHE.create(...)`) and stay wrapped.
- Prefer `find(..., true)` for required nodes.
- Prefer `setChild`/`setChildren` for replacement, not `empty().addChild(...)`.
- Prefer `setText` for user content; use `setHTML(..., true)` only for trusted markup.
- Prefer wrapper events (`on`, `off`, `trigger*`) over raw native listeners when already in JJ code.
