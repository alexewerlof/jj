# Tips & Tricks

Since JJ is a lightweight sugrar layer on top of the browser API, here is a collection of tips and tricks that can help you take advantage of what's in the browser without the need of using a heavy weight framework, library or build system.

# Performance

## Adding multiple children

Often, we need multiple elements to a parent. Adding them one by one forces the browser to redraw over and over again.

Instead, we can use a `DocumentFragment` to accumulate all the children and then add them in one go:

Instead of:

```ts
import doc, { JJHE } from 'jj'
const contents = ['New York', 'Stockholm', 'Tokyo']
const parent = doc.byId('#parent-ul')

for (const city of contents) {
    parent.append(JJHE.from('li').setText(city))
}
```

Write:

```ts
import doc, { JJDF, JJHE } from 'jj'
const contents = ['New York', 'Stockholm', 'Tokyo']
const parent = doc.byId('#parent-ul')

const docFrag = new JJDF()
for (const city of contents) {
    docFrag.append(JJHE.from('li').setText(city))
}

parent.setChildren(docFrag)
```

## Attaching event listeners

Attaching the event listener to each element, reduces performance and consumes too much memory.

Instead, we can attach the event listener to a common parent and take advantage of event bubbling and capturing.

Example, instead of:

```ts
import doc from 'jj'
const parent = doc.byId('#parent-ul')
for (const child of parent.getChildren()) {
    child.on('click', function () {
        alert('Hello world')
    })
}
```

```ts
import doc from 'jj'
const parent = doc.byId('#parent-ul')
parent.on('click', function (evt) {
    if (evt.target?.tagName !== 'LI') return
    alert('Hello world')
})
```

## State management

HTML and SVG elements have a data attribute that is super useful for state management.

For example,
