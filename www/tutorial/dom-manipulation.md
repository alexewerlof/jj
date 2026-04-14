# DOM Manipulation

There are a few verbs for that are used consistently across JJ:

| Verb  | Description                                                  | Example                            |
| ----- | ------------------------------------------------------------ | ---------------------------------- |
| `set` | Set an attribute or child to a value replacing existing ones | `setText()`, `setHTML()`           |
| `add` | Add a value to a list of values.                             | `addClass('active')`, `addChild()` |
| `pre` | Add a child before existing children.                        | `preChild(childWrapper)`           |
| `rm`  | Remove a value from a list of values                         | `rmClass('active')`, `rm()`        |
| `sw`  | Toggle a value in a list of values.                          | `swClass('active')`                |

These verbs exist for the most common DOM aspects:

| Aspect     | Description                              | Example                         |
| ---------- | ---------------------------------------- | ------------------------------- |
| `Text`     | The text content of an element.          | `setText('hello')`              |
| `HTML`     | The inner HTML of an element.            | `setHTML('<b>hello</b>', true)` |
| `Attr`     | An attribute of an element.              | `setAttr('disabled', '')`       |
| `DataAttr` | A data attribute of an element.          | `setDataAttr('id', '123')`      |
| `AriaAttr` | An ARIA attribute of an element.         | `setAriaAttr('label', 'Close')` |
| `Class`    | A CSS class in the element's class list. | `addClass('active')`            |
| `Child`    | A child element.                         | `addChild(childWrapper)`        |
| `Style`    | A CSS style property.                    | `setStyle('color', 'red')`      |

Here's the full list of methods for each verb/aspect combination:

| Verb/Aspect | `Text` | `HTML` | `Attr` | `DataAttr` | `AriaAttr` | `Class` | `Child` | `Style` |
| ----------- | ------ | ------ | ------ | ---------- | ---------- | ------- | ------- | ------- |
| `get`       | ✅     | ✅     | ✅     | ✅         | ✅         | ✅      | ✅      | ✅      |
| `set`       | ✅     | ✅     | ✅     | ✅         | ✅         | ✅      | ✅      | ✅      |
| `has`       |        |        | ✅     | ✅         | ✅         | ✅      | ✅      | ✅      |
| `rm`        |        |        | ✅     | ✅         | ✅         | ✅      |         | ✅      |
| `sw`        |        |        | ✅     |            |            | ✅      |         |         |

For children in particular, there are mapping functions:
| Method | Description |
| --- | --- |
| `setChild(childWrapper)` | Set a single child, replacing existing children. The array variation is `setChildren(childWrapperArray)` |
| `addChild(childWrapper)` | Add a single child, keeping existing children. The array variation is `addChildren(childWrapperArray)` |
| `preChild(childWrapper)` | Prepend a single child, keeping existing children. The array variation is `preChildren(childWrapperArray)` |
| `setChildMap(array, mapFn)` | Set children based on an array of values and a mapping function that turns each value into a child wrapper. |
| `addChildMap(array, mapFn)` | Add children based on an array of values and a mapping function that turns each value into a child wrapper. |
| `preChildMap(array, mapFn)` | Prepend children based on an array of values and a mapping function that turns each value into a child wrapper. |

OK, that's a lot of verbs. Let's see an example where we use many of them together:

```js
import { JJHE } from 'jj'
const jjMyDiv = JJHE.create('div')
    .setText('Hello world')
    .setAttr('title', 'My div')
    .addClass('container')
    .setStyle('color', 'blue')
    .addChild(JJHE.create('span').setText('This is a child span'))
```

Notice the chaining. In the next page we will discuss event handling but for now, let's appreciate the power of the `run()` function which allows more sophisticated DOM manipulations:

```js
jjMyDiv.run((jjDiv) => {
    if (jjDiv.getAttr('title')?.startsWith('My')) {
        jjDiv.rmClass('container')
    }
    switch (jjDiv.getDataAttr('certainty')) {
        case '0':
            jjDiv.setStyle('background', 'red')
            break
        case '1':
            jjDiv.setStyle('background', 'green')
            break
        default:
            jjDiv.setStyle('background', 'yellow')
    }
})
```

OK, you get the idea: if chaining simple operations is not enough, drop into `run()` and do whatever you want with the wrapper without breaking the chain. Note that if the function throws, the chain will also break with an error and `cause` that helps you or your AI agent debug what went wrong and where.

## Finding elements

Modern browsers natively support querying elements with CSS selectors:

```js
const mainTag = document.querySelector('main')
const tabElements = document.querySelectorAll('.tab')
const activeTabElement = document.querySelector('.tab.active')
```

JJ uses:

- `find()` (instead of `querySelector`) to find one element either in an entire document or within a specific parent element.
- `findAll()` (instead of `querySelectorAll`) to get an array of multiple elements.
- `.closest(selector)` to find the closest ancestor that matches the selector.

The examples above would look like this in JJ:

```js
import { JJD } from 'jj'
const jjDoc = JJD.from(document)
// When the second parameter is true and the element is not found, it throws an error
// Use this when you expect the element to be there and its absence is a bug)
const jjMain = jjDoc.find('main', true)
// Find all elements with the class "tab" in the document
const jjTabs = jjDoc.findAll('.tab')
// Find all elements with the class "tab" inside the above main tag
const jjTabsInMain = jjMain.findAll('.tab')
// Another way of doing the same using standard CSS selector syntax
const jjTabs = jjDoc.findAll('main .tab')
// Find the active tab and throw if it's not found
const jjActiveTab = jjDoc.find('.tab.active', true)
```

The most common queries are:

| Selector       | Description                                       | Example                               |
| -------------- | ------------------------------------------------- | ------------------------------------- |
| `#id`          | Selects an element by its ID.                     | `jjDoc.find('#my-div')`               |
| `.class`       | Selects elements by their class.                  | `jjDoc.findAll('.my-class')`          |
| `tag`          | Selects elements by their tag name.               | `jjDoc.findAll('button')`             |
| `[attr=value]` | Selects elements with a specific attribute value. | `jjDoc.findAll('input[type="text"]')` |

Let's finish this chapter, highlighting a few less known but super useful CSS queries:

| Selector                           | Description                                                                                                                       | Example                                                    |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| `:is()`/`:where()`                 | Matches if any of the selectors inside it match. Useful for grouping selectors.                                                   | `jjDoc.findAll('input:is([type="text"], [type="email"])')` |
| `:not()`                           | Matches if the selector inside it does not match. Useful for excluding elements.                                                  | `jjDoc.findAll('button:not(.primary)')`                    |
| `:has()`                           | Matches if the element has a descendant that matches the selector inside it. Useful for finding elements based on their children. | `jjDoc.findAll('div:has(span)')`                           |
| `:empty`                           | Matches elements that have no children (including text nodes). Useful for finding empty elements.                                 | `jjDoc.findAll('div:empty')`                               |
| `:nth-child()` or `:nth-of-type()` | Matches elements based on their position among siblings. Useful for selecting specific children.                                  | `jjDoc.findAll('li:nth-child(2)')`                         |
| `:first-child` or `:last-child`    | Matches the first or last child of its parent. Useful for selecting the first or last element in a group.                         | `jjDoc.find('ul li:first-child')`                          |
| `:valid` or `:invalid`             | Matches elements that are valid or invalid according to their attributes. Useful for form validation.                             | `jjDoc.findAll('input:valid')`                             |

If you're curious, you can read more about [CSS selectors](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors) and [pseudo-classes](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/Pseudo-classes), [Combinators](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/Combinators) on MDN. JJ doesn't do anything fancy on top of what the modern web platform provides.

## Next up: Event handling

Now let's switch gears and talk about events.
