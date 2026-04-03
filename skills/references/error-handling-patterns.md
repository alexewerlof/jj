# Error Handling Patterns

JJ follows four principles for errors: specific, actionable, proximate, and runtime-verified.

## Principles

1. **Specific** — Use the most precise error type: `TypeError`, `RangeError`, `SyntaxError`, `ReferenceError`.
2. **Actionable** — Include a fix hint when the stack trace alone is insufficient.
3. **Proximate** — Throw where the invalid value is *consumed*, not where it is received.
4. **Runtime-verified** — Don't rely on TypeScript types alone; validate at library boundaries because callers may be plain JavaScript.

## Internal helpers

```typescript
import { typeErr, errMsg } from './internal.js'

// TypeError with standardized message
throw typeErr('name', 'a string', name)
//   → TypeError: Expected name to be a string, but got number

// RangeError using errMsg for the message
throw new RangeError(errMsg('as', "'fetch', 'style', or 'script'", as,
    'Use a valid value or omit it to auto-detect from the URL.'))

// With extra fix hint when context is ambiguous
throw typeErr('ref', 'a Text node', ref,
    "Create a Text node with JJT.create() or document.createTextNode('text').")
```

`errMsg(varName, expected, received, extra?)` — generates the standard message string.  
`typeErr(varName, expected, received, extra?)` — creates and returns a `TypeError` using that message.

## When to add an `extra` hint

Add it when:
- The API has overloads and the caller might not know which to use.
- The wrapper constructor / factory method accepts multiple input forms.
- The correct alternative is not obvious from the stack trace.

Skip it when:
- The failure is a simple scalar type check and the stack trace already pinpoints the misuse.

## Practical validation example

```typescript
if (!isStr(name)) {
    throw typeErr('name', 'a string', name)
}
if (!isObj(attrs)) {
    throw typeErr('attrs', 'a plain object or null/undefined', attrs,
        'Pass an object like { class: "btn" } or omit the argument.')
}
if (val < 0 || val > 100) {
    throw new RangeError(errMsg('val', 'a number between 0 and 100', val))
}
```

## Error types reference

| Error type       | When to use                                            |
|------------------|--------------------------------------------------------|
| `TypeError`      | Wrong type or shape                                    |
| `RangeError`     | Value out of acceptable range                          |
| `SyntaxError`    | Malformed string input (selector, expression)          |
| `ReferenceError` | Reference to undefined name                            |
| `AggregateError` | Multiple simultaneous failures (e.g., map-reduce)      |

## Browser references
- TypeError: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypeError
- RangeError: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RangeError
- SyntaxError: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SyntaxError
- AggregateError: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AggregateError
