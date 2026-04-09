# DOM Manipulation Guide

This guide covers practical, browser-native patterns for efficient child updates in JJ.

## Removing Many Children By Predicate

If you need to remove a subset of children based on a predicate, avoid repeatedly calling `removeChild` in a loop when a batch update is possible.

A high-performance pattern is:

1. Snapshot current children.
2. Compute which children to keep in JavaScript.
3. Replace children once with `replaceChildren`.

This minimizes DOM mutation calls while keeping surviving nodes intact.

```ts
import { JJHE } from 'jj'

const list = JJHE.create('ul')
list.addChildMap(['A', 'B', 'C', 'D'], (value) => JJHE.tree('li', null, value))

const all = Array.from(list.ref.childNodes)
const keep = all.filter((child, index) => {
    if (!(child instanceof HTMLElement)) {
        return true
    }
    return index % 2 === 0
})

list.ref.replaceChildren(...keep)
```

## Why This Pattern Is Usually Faster

- It performs one structural DOM update instead of many removals.
- It reduces repeated write operations to the live tree.
- It preserves identity of kept nodes, including state and event listeners.

## About Repaint And Layout Cost

Browsers commonly batch paint work until the next frame, so multiple `removeChild` calls do not always mean multiple paints.
Even so, fewer DOM writes typically reduce style and layout invalidation risk, especially in larger trees.

## JJ-Oriented Helper Pattern

If you want this as a local utility without changing JJ API surface:

```ts
import type { JJNx } from 'jj'

export function removeChildrenBy(
    node: JJNx<Element | Document | DocumentFragment>,
    shouldRemove: (child: ChildNode, index: number, all: ChildNode[]) => boolean,
): void {
    const all = Array.from(node.ref.childNodes)
    const keep = all.filter((child, index) => !shouldRemove(child, index, all))
    node.ref.replaceChildren(...keep)
}
```

## Related

- [Performance](./performance.md)
- [Fluent API](./fluent-api.md)
- [Templates](./templates.md)
- [Node.removeChild](https://developer.mozilla.org/en-US/docs/Web/API/Node/removeChild)
- [Element.replaceChildren](https://developer.mozilla.org/en-US/docs/Web/API/Element/replaceChildren)
