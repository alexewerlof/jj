# Source Code

- `index.ts` defines the package's public exports.
- `wrappers/` contains the primary DOM API; see `wrappers/AGENTS.md` for wrapper-specific guidance.
- `components.ts` provides custom-element helpers such as `defineComponent()` and `attr2prop()`.
- `fetchers.ts` provides template and stylesheet fetch helpers.
- `internal.ts` contains implementation helpers that are not part of the public API.

Use `.js` extensions for local imports in TypeScript so emitted ESM imports resolve correctly. The source-level internal test uses the JSDOM bootstrap at `../test/attach-jsdom.js`.
