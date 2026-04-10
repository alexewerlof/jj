# React to JJ Translation

JJ is DOM-first and imperative. There is no virtual DOM, no JSX, and no reconciler.

## Mental mapping

| React concept         | JJ equivalent                                                                 |
| --------------------- | ----------------------------------------------------------------------------- |
| JSX element           | `JJHE.tree(tag, attrs, ...children)` or `JJHE.create(tag).setText(…)`         |
| `useState`            | Plain variable or class field + explicit wrapper update call                  |
| `useEffect` (mount)   | `connectedCallback` in a custom element                                       |
| `useEffect` (cleanup) | `disconnectedCallback`                                                        |
| `useRef`              | Store the JJ wrapper or `.ref` in a variable                                  |
| Props                 | HTML attributes (`observedAttributes` + `attr2prop`) or constructor arguments |
| Callback props        | Custom events — dispatch from child, listen in parent                         |
| Context               | Module-level shared state or a custom event bus                               |
| Component re-render   | Call explicit render method that updates wrapper text/attrs/classes           |

## State loop example

React:

```jsx
const [count, setCount] = useState(0)
return <button onClick={() => setCount(count + 1)}>{count}</button>
```

JJ:

```js
import { JJHE } from 'jj'

let count = 0
const btn = JJHE.create('button').setText('0')
btn.on('click', () => {
    count++
    btn.setText(String(count))
})
document.body.appendChild(btn.ref)
```

## Component props → observed attributes

React:

```jsx
function UserCard({ userName, role }) { … }
```

JJ custom element:

```js
static observedAttributes = ['user-name', 'role']
attributeChangedCallback(name, oldValue, newValue) {
    attr2prop(this, name, oldValue, newValue)
}
get userName() { return this.#userName }
set userName(v) { this.#userName = String(v ?? ''); this.#render() }
```

## Callback props → custom events

React:

```jsx
<TodoItem onToggle={(id) => handleToggle(id)} />
```

JJ — child dispatches, parent listens:

```js
// child
JJHE.from(this).triggerCustomEvent('todo-toggle', { id: this.#id })

// parent
container.on('todo-toggle', (e) => handleToggle(e.detail.id))
```

## Browser references

- EventTarget: https://developer.mozilla.org/en-US/docs/Web/API/EventTarget
- CustomEvent: https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent
- Custom elements: https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements
