# Angular to JJ Translation

Angular uses a DI-driven component architecture with templates and decorators. JJ is library-level, not framework-level.

## Mental mapping

| Angular concept              | JJ equivalent                                                   |
| ---------------------------- | --------------------------------------------------------------- |
| `@Component` template        | `JJHE.tree()` or external HTML with `fetchTemplate`             |
| `@Input()`                   | `observedAttributes` + `attr2prop` + property setter            |
| `@Output()` / `EventEmitter` | `triggerCustomEvent()` dispatching a `CustomEvent`              |
| `ngOnInit`                   | `connectedCallback`                                             |
| `ngOnDestroy`                | `disconnectedCallback`                                          |
| `ChangeDetectionRef`         | Explicit render call in property setters                        |
| `*ngFor`                     | `el.addChildMap(items, fn)`                                     |
| `*ngIf`                      | `el.hide()` / `el.show()` or conditional class via `setClasses` |
| DI services                  | Plain ES modules exporting shared state or event buses          |

## Input binding example

Angular:

```typescript
@Input() userName: string = ''
```

JJ:

```js
static observedAttributes = ['user-name']
attributeChangedCallback(name, oldValue, newValue) {
    attr2prop(this, name, oldValue, newValue)
}
get userName() { return this.#userName }
set userName(v) { this.#userName = String(v ?? ''); this.#render() }
```

## Output binding example

Angular:

```typescript
@Output() selected = new EventEmitter<string>()
this.selected.emit(itemId)
```

JJ:

```js
JJHE.from(this).triggerCustomEvent('selected', itemId)
// JJ default: bubbles: true, composed: true — parent receives through shadow boundary
```

## No DI — use ES modules instead

Angular service:

```typescript
@Injectable({ providedIn: 'root' })
class AuthService { … }
```

JJ — just a module:

```js
// auth.js
export const authState = { user: null }
export function login(user) {
    authState.user = user
}
```

## Browser references

- Custom element lifecycle: https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#custom_element_lifecycle_callbacks
- ES Modules: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules
