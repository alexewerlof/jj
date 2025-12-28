# Just JavaScript!

**Do you know what runs faster than VDOM? No VDOM!**

**JJ** A human readable WYWIWIR (what you write is what is run) DSL for creating and manipulating HTML and CSS for modern browsers.

Modern browsers are very powerful out of the box and get you pretty far without having to "compile" (transpile) an interpreted language (`.jsx`, `.vue`, etc.) to an earlier version of it (ES5). This is a proof of concept to show how far we can go without having to compile the code.

## Install

```bash
npm i jj
```

# Usage

CDN:

```js
import { nextAnimationFrame, on } from 'https://unpkg.com/browse/jj/dist/bundle.js'
```

From NPM:

```js
import { nextAnimationFrame, on } from 'jj'
```

## Design principals

- Modern: take full advantage of ever-green browser features. No support for legacy browsers
- Sugar but not magic: it'll let you write shorter code but it won't do much logic behind the scene
- Excplicit: make the code more readable and easier to follow
- Basic: use plain old javascript objects (POJOs) for describing HTML and CSS

# Install

One of the main points of using this library is to avoid compiling your code.
You can directly import it from UNPKG at https://unpkg.com/browse/jj/dist/jj.js

But if you prefer to install it via NPM:

```
npm i jj
```

# Use

```html
<html>
    <body>
        <script type="module" src="index.js" defer async></script>
    </body>
</html>
```

```javascript
// If you installed via NPM
import { ready, html } from '/node_modules/jj/dist/jj.js'
// Is you want to directly use it via UNPKG
import { ready, html } from 'https://unpkg.com/browse/jj/dist/jj.js'

ready(() => {
    html.div('Hello world!').appendToBody()
})
```

# Docs

_Will be written when we reach a stable API._

# Licence

MIT

_Made in Sweden 🇸🇪 by [@alexewerlof](https://mobile.twitter.com/alexewerlof)_
