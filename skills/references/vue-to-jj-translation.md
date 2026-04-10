# Vue to JJ Translation

Vue uses reactive data binding; JJ uses explicit imperative updates.

## Mental mapping

| Vue concept             | JJ equivalent                                              |
| ----------------------- | ---------------------------------------------------------- |
| Template / `v-bind`     | `JJHE.tree()` or `JJHE.create()` chains                    |
| `v-model`               | Event listener + explicit wrapper update                   |
| `ref` / `computed`      | Plain variables, getters/setters, explicit render calls    |
| `watch`                 | Call render in property setter                             |
| `defineEmits` / `$emit` | `customEvent()` or `triggerCustomEvent()`                  |
| Scoped styles           | Shadow DOM with `fetchStyle` + `setShadow`                 |
| `v-if` / `v-show`       | `el.hide()` / `el.show()` or add/remove classes            |
| `v-for`                 | `el.addChildMap(items, fn)` or `el.setChildMap(items, fn)` |

## Two-way binding example

Vue:

```vue
<input v-model="message" />
<p>{{ message }}</p>
```

JJ:

```js
import { JJHE } from 'jj'

let message = ''
const p = JJHE.create('p').setText('')
const input = JJHE.create('input')
    .setAttr('type', 'text')
    .on('input', (e) => {
        message = e.target.value
        p.setText(message)
    })
```

## Reactive prop update

Vue `watch`:

```js
watch(
    () => props.count,
    (v) => render(v),
)
```

JJ setter:

```js
set count(v) {
    this.#count = Number(v) || 0
    this.#render()
}
```

## v-for replacement

```js
list.addChildMap(items, (item) => JJHE.tree('li', { class: 'item' }, item.label))
```

## Browser references

- observedAttributes: https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#responding_to_attribute_changes
- ShadowRoot: https://developer.mozilla.org/en-US/docs/Web/API/ShadowRoot
- CSSStyleSheet: https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleSheet
