# Design Philosophy

JJ is an experiment to see how far we can get with a platform-first approach.

## Facts

- Modern browsers are mostly evergreen and update regularly.
- The web platform has become mature enough for large parts of modern app work.
- Eliminating compilation removes a whole class of sourcemap and debugging friction.
- Mixing multiple languages in one file often hurts maintainability. JJ favors separation: HTML for layout, JS for behavior, CSS for styles.

## Assumptions

- HTTP multiplexing and modern loading hints reduce the old cost of splitting resources.
- Many experienced developers prefer simpler platform-native architecture with a small amount of sugar syntax.

## Beliefs

- We should not fight the platform.
- We do not need a thick abstraction layer (for example virtual DOM or dirty-checking) for most web applications.
- We do not monkey-patch browser APIs. `JJHE` wraps an `HTMLElement`; it is not an `HTMLElement` subclass.
- In the age of AI agents, libraries should help agents produce idiomatic code that humans can quickly verify.

## What this means for framework users

If you come from React, Vue, Svelte, Angular, jQuery, or Lit, the shift is mostly about control surface:

- fewer framework-specific concepts
- more direct use of standard DOM, events, and components
- explicit updates instead of hidden runtime magic

JJ keeps this transition practical by wrapping common DOM operations in fluent methods while leaving the native escape hatch (`.ref`) available.
