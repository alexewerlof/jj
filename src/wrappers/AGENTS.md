# DOM Wrappers

JJ wrappers expose native DOM objects through the readonly `.ref` property. Wrapper classes follow the DOM inheritance model and live in individual files; `index.ts` re-exports the public wrappers.

`WrapperChain` in `WrapperChain.ts` maintains the DOM-constructor-to-wrapper registrations. Wrapper classes register with `nodeWrappers` and, for element queries, `elementWrappers`; dispatch selects the most specific registered wrapper.

Use wrapper factories such as `from()`, `create()`, and `tree()` instead of calling wrapper constructors directly. Keep values wrapped when JJ provides the needed operation.

`JJE.getText()` and `setText()` use `textContent` and are inherited by `JJHE`, `JJSE`, and `JJME`. For rendering-aware HTML text, use `jjEl.ref.innerText` on a `JJHE` wrapper. `JJD` has no text helpers; use the document element for whole-page text.
