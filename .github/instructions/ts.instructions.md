---
name: 'TypeScript and JavaScript Instructions'
description: 'Makes sure TypeScript and JavaScript code complies with best practices.'
applyTo: '**/*.ts, **/*.js'
---

1. Use `const` for variables that are not reassigned and `let` for variables that are reassigned. Avoid using `var`.
2. Use arrow functions for anonymous functions and callbacks to maintain the correct `this` context. The exception is `.run()`, which is a synchronous in-chain hook that binds `this` to the current wrapper; use a regular `function` there when you need wrapper context.
3. Always use block statements (`{}`) for `if`, `else`, `for`, `while`, and `do` statements, even if they contain only one statement.
4. For JJ wrappers, use types that help LLLs deduce what type of object is being wrapped.
