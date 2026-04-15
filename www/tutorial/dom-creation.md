# DOM Creation

This is how you create a `<div>` element using native browser API:

```js
const myDiv = document.createElement('div')
myDiv.innerText = 'hello world'
```

In JJ, it looks like:

```js
import { JJHE } from 'jj'
const jjMyDiv = JJHE.create('div').setText('hello world')
```

Why the `jj` prefix? It signals that `jjMyDiv` is a JJ wrapper — not a plain DOM element. Access the raw element anytime via `jjMyDiv.ref`.

`setText()` / `getText()` come from `JJE` and use `textContent` for `JJHE`, `JJSE`, and `JJME`.
If you specifically need HTML rendering-aware `innerText` behavior, use `jjMyDiv.ref.innerText` directly.

`JJHE` stands for `JJ`, `HTMLElement`. There are a couple more:

- `JJSE` for `SVGElement`
- `JJME` for `MathMLElement`

OK, so far, the code is longer and you have to learn a few more names. What's the advantage?

In practice, we rarely create one element. We create a tree.

Let's say we want to create a `<ul>` from list of fruits:

```js
const fruits = ['apple', 'orange', 'banana']
```

Using native DOM, you'd do something like this:

```js
// Create 3 list items
// Create the unordered list and add the items
const ul = document.createElement('ul')
ul.append(
    ...fruits.map((fruit) => {
        const li = document.createElement('li')
        li.innerText = fruit
        return li
    }),
)
```

In JJ, you'd write that like this:

```js
import { JJHE } from 'jj'
const jjUl = JJHE.create('ul').addChildMap(fruits, (fruit) => JJHE.create('li').setText(fruit))
```

A bit shorter!

An even shorter way is to use the hyperscript pattern which you may recognize from other libraries:

```js
import { JJHE } from 'jj'
const h = JJHE.tree
const jjUl = h('ul', null, ...fruits.map((fruit) => h('li', null, fruit)))
```

The familiar signature of the hyperscript function is:

```js
h(tagName, attributesObject, ...children)
```

## Wrappers

As mentioned JJ doesn't monkey patch or modify the native DOM API. You've already seen the most common wrapper (`JJHE`) but there are a few more:

| Wrapper | Description                                                             |
| ------- | ----------------------------------------------------------------------- |
| `JJET`  | Wraps `EventTarget` which includes `window` and many custom components. |
| `JJD`   | Wraps `Document` nodes. Used for querying and creating top-level nodes. |
| `JJSR`  | Wraps `ShadowRoot` nodes. Used for working with shadow DOM.             |
| `JJHE`  | Wraps `HTMLElement` nodes. Covers most HTML elements.                   |
| `JJSE`  | Wraps `SVGElement` nodes. Covers SVG elements.                          |
| `JJME`  | Wraps `MathMLElement` nodes. Covers MathML elements.                    |
| `JJDF`  | Wraps `DocumentFragment` nodes. Used for off-DOM tree construction.     |
| `JJT`   | Wraps `Text` nodes. Used for text nodes.                                |

`JJD` is particularly useful because it wraps `document`:

```js
import { JJD } from 'jj'
const jjDoc = JJD.from(document)
const jjMyDiv = jjDoc.find('#my-div', true)
```

Passing `true` to `find()` means that we know that `#my-div` exists and it should throw if it's not found. That way we can catch programmatic errors and get a clear actionable error that accelerates debugging (whether manually or using AI agents).

For whole-document text, note that `Document.textContent` and `DocumentType.textContent` are `null`.
Use `document.documentElement.textContent` or `jjDoc.ref.documentElement.textContent`.

## Creating custom components

We'll soon see how to create custom components but as a teaser, this is how you can create an instance of a custom component called `<my-card>`:

```js
import { JJHE } from 'jj'

// Make sure it's defined and registered before trying to instantiate it
await MyCard.defined
// Create an instance
const jjCard = JJHE.create('my-card')
// Set properties or call methods on the wrapper
jjCard.ref.title = 'My Card Title'
```

## Next up: DOM Manipulation

Now you know the basics but JJ is way more than DOM node creation. Let's see how we can query and manipulate DOM.
