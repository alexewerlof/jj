# Svelte to JJ Translation

Svelte compiles reactive assignments and scoped styles. JJ keeps these explicit at runtime.

## Mental mapping

| Svelte concept           | JJ equivalent                                       |
| ------------------------ | --------------------------------------------------- |
| Reactive `$:` / `$state` | Store value in field; call render in setter         |
| `<script>` variables     | Class fields or module-level variables              |
| Component events         | `triggerCustomEvent()` on the host element          |
| `bind:value`             | Event listener updating state + explicit DOM update |
| Scoped styles            | Shadow DOM with `fetchStyle` and `setShadow`        |
| `#each`                  | `el.addChildMap(items, fn)`                         |
| `#if`                    | `el.hide()` / `el.show()` or toggle a class         |
| `onMount` / `onDestroy`  | `connectedCallback` / `disconnectedCallback`        |

## Counter example

Svelte:

```svelte
<script>
let count = 0
</script>
<button on:click={() => count++}>{count}</button>
```

JJ:

```js
import { JJHE } from 'jj'

let count = 0
const jjBtn = JJHE.create('button').setText('0')
jjBtn.on('click', () => jjBtn.setText(String(++count)))
document.body.appendChild(jjBtn.ref)
```

## Outbound events

Svelte `createEventDispatcher`:

```js
dispatch('message', { text: 'hello' })
```

JJ:

```js
JJHE.from(this).triggerCustomEvent('message', { text: 'hello' })
```

## Scoped styles

Svelte scoped `<style>` tags become shadow CSS in JJ:

```js
const stylePromise = fetchStyle(import.meta.resolve('./my-component.css'))
const templatePromise = fetchTemplate(import.meta.resolve('./my-component.html'))
// Inside connectedCallback:
JJHE.from(this)
    .setShadow('open')
    .initShadow(await templatePromise, await stylePromise)
```

## Browser references

- Web components: https://developer.mozilla.org/en-US/docs/Web/API/Web_components
- CSSStyleSheet: https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleSheet
