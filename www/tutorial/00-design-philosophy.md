## Design Philosophy

JJ is an experiment to see how far we can get with the following FAB:

- Facts:
    - Modern browsers are mostly ever-green and update regularly
    - The web platform has come a long way and is pretty mature (e.g. class, modules, web components, etc.)
    - Eliminating compilation rids us from a whole class of problems regarding sourcemaps and debugging
- Assumptions:
    - HTTP/3 multiplexing significantly reduces latency (together with preload/prefetch links)
    - Experienced developers prefer simplicity and maintainability of the web platform with a bit of sugar syntax to reduce boilerplate and repetition
- Beliefs:
    - We don't need to compiler (transpile) an interpreted language
    - We don't need a thick abstraction layer (e.g. VDOM or dirty-checking) for most web applications
    - We don't mix different languages in the same file
