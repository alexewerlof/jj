# Extensions and Interop

JJ is designed to play well with other libraries because it operates at DOM level.

## Interop model

- Build UI sections with JJ wrappers
- Pass native nodes through .ref when integrating with third-party libraries
- Keep boundaries explicit between JJ-managed and externally-managed DOM

## Framework coexistence

JJ can coexist with React, Vue, Svelte, Angular, Lit, or jQuery in migration scenarios because it does not own a runtime scheduler.

Use JJ for:

- New isolated widgets
- Existing DOM-heavy sections
- Custom element wrappers

## Browser extension integration

JJ can be used inside popup pages, options pages, and extension-hosted views where browser DOM APIs are available.

Reference:

- https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions

## Translation references

See task-based AI docs for framework translation playbooks:

- [skills directory index](../skills/SKILL.md)
