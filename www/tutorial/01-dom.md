# DOM API

First stop is DOM API.

To create a div you do:

```js
document.createElement('div')
```

In JJ, you write that as:

```js
WHE.fromTag('div')
```

Let's unpack that:

- `WHE`: Stands for Wrapped `HTMLElement`
- `fromTag(string)` calls `document.createElement(string)` and assigns it to `.ref` of a newly created `WHE`

## Chaining

The real power comes from chaining. Say you wanted to set the text of the newly created `div` to `"Hello world"`.
With DOM API you write:

```js
const div = document.createElement('div')
div.textContent = 'Hello world'
```

With JJ, you write:

```js
const divWrapper = WHE.fromTag('div').setText('Hello world')
```

This gives you:

```html
<div>Hello world</div>
```

## `.ref`

The `divWrapper` is a tiny class that has one property: `.ref`
The `.ref` always points to the underlying DOM entity, be in a
[Text](https://developer.mozilla.org/en-US/docs/Web/API/Text),
[HTMLElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement),
[SVGElement](https://developer.mozilla.org/en-US/docs/Web/API/SVGElement), or even a
[DocumentFragment](https://developer.mozilla.org/en-US/docs/Web/API/DocumentFragment)

If you want to append the created `<div>` element to the body, all you have to do is:

```js
document.body.appendChild(divWrapper.ref)
```

## Querying

The browsers provide a few native methods to query the DOM using the CSS selector syntax:

- [`document.querySelectorAll()`](https://developer.mozilla.org/en-US/docs/Web/API/Document/getElementById): searches an entire document with a css query like (`.class` or `#id`)
    - [`element.querySelectorÀll()](https://developer.mozilla.org/en-US/docs/Web/API/Element/querySelector): similar to the above but only seaches an element's
- [`document.querySelector()]`: just like `.querySelectorAll()` but only returns the first matching element
- [`document.getElementsByClassName()`](https://developer.mozilla.org/en-US/docs/Web/API/Document/getElementsByClassName): searches an entire document for elements that have a given class name
- [`document.getElementById()](https://developer.mozilla.org/en-US/docs/Web/API/Document/getElementById): returns an element with a specific id
-

## Chaining

Most methods return a reference to this which enables chaining.
For example if you wanted to set a `'title'` attribute and add a `dominant` class to the element, you can write:

```js
const divWrapper = WHE.fromTag('div').setText('Hello world').setTitle('Hello world').addClass('dominant')
```

This gives you:

```html
<div title="Hello world" class="dominant">Hello world</div>
```
