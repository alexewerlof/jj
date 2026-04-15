# jQuery to JJ Translation

jQuery provides chainable selection and DOM operations. JJ is similar in API feel but type-safe and namespace-aware.

## Mental mapping

| jQuery                         | JJ equivalent                                                                     |
| ------------------------------ | --------------------------------------------------------------------------------- |
| `$('#id')`                     | `JJD.from(document).find('#id')`                                                  |
| `$('.cls')` (first match)      | `jjDoc.find('.cls')`                                                              |
| `$('.cls')` (all matches)      | `jjDoc.findAll('.cls')`                                                           |
| `.addClass()` / `.removeClass` | `.addClass()` / `.rmClass()`                                                      |
| `.swClass(cls, bool?)`         | `.swClass(cls, force?)` — explicit when force is provided, auto-flip when omitted |
| `.attr(name, val)` (write)     | `.setAttr(name, val)`                                                             |
| `.attr(name)` (read)           | `.getAttr(name)`                                                                  |
| `.css(prop, val)` (write)      | `.setStyle(prop, val)`                                                            |
| `.text(val)` (write)           | `.setText(val)`                                                                   |
| `.html(val)` (write)           | `.setHTML(val, true)` — explicit unsafe flag required                             |
| `.html()` (read)               | `.getHTML()` (inner) or `.ref.outerHTML`                                          |
| `.on(event, handler)`          | `.on(event, handler)`                                                             |
| `.trigger(event)`              | `.trigger(event)`                                                                 |
| `.append(child)`               | `.addChild(child)`                                                                |
| `.empty()`                     | `.empty()`                                                                        |
| `.remove()`                    | `.rm()`                                                                           |
| `.closest(selector)`           | `.closest(selector)`                                                              |
| `$.ajax`                       | Native `fetch()`                                                                  |

## Selection example

jQuery:

```js
$('.card').addClass('active').css('color', 'red')
```

JJ:

```js
const jjDoc = JJD.from(document)
jjDoc.findAll('.card').forEach((jjCard) => jjCard.addClass('active').setStyle('color', 'red'))
```

## HTML write safety

jQuery allowed unsafe HTML writes silently:

```js
$('#msg').html(userInput) // XSS risk
```

JJ requires explicit acknowledgement:

```js
jjDoc.find('#msg').setHTML(trustedMarkup, true) // must pass true
jjDoc.find('#msg').setText(userInput) // safe for user content
```

## Event delegation

jQuery:

```js
$(document).on('click', '.item', handler)
```

JJ — use native event delegation via `matches`:

```js
jjDoc.on('click', (e) => {
    if (!(e.target instanceof Element)) {
        return
    }
    if (e.target.matches('.item')) handler(e)
})
```

## Browser references

- querySelector: https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector
- classList: https://developer.mozilla.org/en-US/docs/Web/API/Element/classList
- fetch: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
