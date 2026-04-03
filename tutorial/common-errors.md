# Common Errors

JJ follows a strict error philosophy to improve developer and agent productivity:

- **Specific**: use precise error types and clear messages.
- **Actionable**: include guidance for the fix when possible.
- **Proximity**: throw close to where the invalid value is consumed.
- **Type verification**: do runtime checks because JJ is also used from JavaScript, not only TypeScript.

## Typical mistakes and fixes

### 1. Creating SVG/MathML with `JJHE.create`

If you call `JJHE.create('svg')` or `JJHE.create('math')`, JJ throws with guidance.

- Use `JJSE.create('svg')` for SVG
- Use `JJME.create('math')` for MathML

### 2. Passing wrong input types

Many wrapper methods validate names and objects (`setAttr`, `setAttrs`, `setAriaAttr`, `setDataAttr`, `setStyles`, and more).

If you see a `TypeError`, check method arguments first, especially for map-style methods that expect plain objects.

### 3. Unsafe HTML writes

`setHTML` is intentionally explicit. Pass `true` as the second argument when setting HTML content.

```js
el.setHTML('<p>safe only when intentional</p>', true)
```

Prefer `setText` whenever possible.

### 4. Missing required queried elements

When a DOM node is mandatory, use `.find(selector, true)` to fail early with a useful error instead of carrying null checks everywhere.

## Related deep dives

- [guides/fluent-api.md](../../guides/fluent-api.md)
- [guides/query.md](../../guides/query.md)
