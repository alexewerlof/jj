# State Management

When it comes to web application development, there are 2 dominant paradigms:

- **Imperative**: your code manipulates the DOM. This led to massive spaghetti code (e.g. jQuery), inconsistency and state management headache. The state is scattered across your code and DOM and it's up to you to consolidate between them. However, this direct approach can lead to more control and performance and I'd argue the code looks simpler if you know what you're doing.
- **Declarative**: your code manipulates a data structure which in turn is mapped to DOM. This leads to a cleaner code because of _separation of concern_: your code focuses on manipulating data while the library library or framework (e.g. Vue, React, Angular) does the heavy lifting of mapping the state to DOM. Virtual DOM or dirty-checking is often used to improve performance and only manipulate the parts of the DOM that are needed.

Another way to think about the two:

- **Imperative** is more like a low level language like C/C++ where the code has more work to do and there can be tricky issues, but you have more control and performance.
- **Declarative** is more like a high level language like Python or JavaScript where most use cases can be solved with relatively simple and shorter code but you have less control and there is a performance overhead.

Pragmatically, however, this is a spectrum and a given production application has elements of the two. jQuery plugins for example abstract away some common use cases whereas React and Vue provide escape hatches when an element needs to be directly manipulated.

JJ takes a middle ground but it is closer to _imperative_ style. It offers a nice syntax to use encapsulation mechanisms available in modern browsers: _modules, components, promises, classes, getter/setter, events_, etc.

Turns out you can get a lot done without a heavy abstraction layer to deal with legacy DOM discrepencies or Virtual DOM or diffing. JJ's approach is to make your DOM manipulation code easier to write and read. It doesn't try to invent new abstractions.
