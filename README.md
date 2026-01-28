# Just JavaScript!

**Faster than VDOM. No Build Step. Use the Platform!**

**JJ** is a lightweight, no-transpilation library for modern web development. What You Write Is What Is Run (WYWIWIR).

## ⚡ Quick Start

```bash
npm i jj
```

```js
import { JJHE } from 'jj'

JJHE.fromTag('div')
    .addClass('card')
    .setText('Hello World!')
    .on('click', () => console.log('Hi'))
    .appendToBody()
```

## 🚀 Why JJ?

- **Zero Build** – Runs directly in modern browsers
- **Native Speed** – Direct DOM manipulation, no VDOM overhead
- **Web Standards** – First-class Web Components support
- **Fluent API** – Chainable methods for cleaner code

## 📚 Learn More

**👉 [Visit the full site with tutorials, examples, and API docs](https://alexewerlof.github.io/jj)**

## License

MIT

_Made in Sweden 🇸🇪 by [Alex Ewerlöf](https://alexewerlof.com/)_
