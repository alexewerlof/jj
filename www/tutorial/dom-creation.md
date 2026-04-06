# DOM Creation

This is how you create a `<div>` element containing the text 'hello world' using native browser API:

```js
const myDiv = document.createElement('div')
myDiv.innerText = 'hello world'
```

In JJ, you do something similar

```js
import { JJHE } from 'jj'
const myDivWrapper = JJHE.create('div').setText('hello world')
```

Why call it `myDivWrapper`? Because JJ wraps the native DOM element. You can access it via `myDivWrapper.ref`.

`JJHE` stands for `JJ`, `HTMLElement`. There are a few more:

- `JJSE` for `SVGElement`
- `JJME` for `MathMLElement`

OK, so far, the code is longer and you have to learn a few more names. What's the selling point?

In practice, we rarely create one element. We create a tree.

```js
// Let's say we want to create a <ul> list of fruits
const fruits = ['apple', 'orange', 'banana']

// Create 3 list items
const liArr = fruits.map((fruit) => {
    const li = document.createElement('li')
    li.innerText = fruit
    return li
})
// Create the unordered list and add the items
const ul = document.createElement('ul')
ul.append(...liArr)
```

In JJ, you'd write that like this:

```js
import { JJHE } from 'jj'
const wrappedUl = JJHE.create('ul').addChildMap(fruits, (fruit) => JJHE.create('li').setText(fruit))
```

A bit shorter. An even shorter way is to use the hyperscript pattern which you may recognize from other libraries:

```js
import { JJHE } from 'jj'
const h = JJHE.tree
const wrappedUl = h('ul', null, ...fruits.map((fruit) => h('li', null, fruit)))
```

The familiar signature of the hyperscript function is:

```js
h(tagName, attributesObject, ...children)
```

## Wrappers

As mentioned JJ doesn't monkey patch or modify the DOM API. You've already seen the most common wrapper (`JJHE`) but there are a few more:

| Wrapper | Description                                                             |
| ------- | ----------------------------------------------------------------------- |
| `JJHE`  | Wraps `HTMLElement` nodes. Covers most HTML elements.                   |
| `JJSE`  | Wraps `SVGElement` nodes. Covers SVG elements.                          |
| `JJME`  | Wraps `MathMLElement` nodes. Covers MathML elements.                    |
| `JJD`   | Wraps `Document` nodes. Used for querying and creating top-level nodes. |
| `JJDF`  | Wraps `DocumentFragment` nodes. Used for off-DOM tree construction.     |
| `JJSR`  | Wraps `ShadowRoot` nodes. Used for working with shadow DOM.             |
| `JJT`   | Wraps `Text` nodes. Used for text nodes.                                |
| `JJET`  | Wraps `EventTarget` which includes `window` and many custom components. |

`JJD` is particularly useful because we use that to find elements in the document:

```js
import { JJD } from 'jj'
const doc = JJD.from(document)
const myDivWrapper = doc.find('#my-div', true) // true for single element
```

## Next up: DOM Manipulation

Now you know the basics but JJ is way more than DOM node creation. Let's see how we can query and manipulate DOM.
