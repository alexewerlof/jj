# Dependency

- All files in this folder (including the subfolders) use the library via `lib/bundle.js` which is created/updated using `npm run build`. Any change to the code `../src/**/*.ts` should follow with the build step to update the `lib/bundle.js`.
- Files in `www/` does not require a compilation.

# Task Docs

- For platform-oriented documentation strategy, reference `../guides/philosophy.md` and `../guides/architecture.md`.
- For AI task-specific guidance, reference `../skills/SKILL.md`. All code in this folder **must comply with that skill**, paying particular attention to:
    - The **Naming Conventions** section: prefix every JJ wrapper variable with `jj` (e.g. `jjDoc`, `jjFruits`, `#jjHost`, `#jjShadow`); do not use the prefix for plain data, native DOM values, or promises.
    - The **Translation Checklist**: use `JJHE.tree` / `h` for multi-node subtrees, wrapper-based queries, and targeted child APIs instead of native DOM escape hatches.

# Serving

- This directory is meant to be served as a static site both locally and in production.
- Instead of creating a custom server or launching something from npm, use the `ritwickdey.liveserver` extension which is already installed in VS Code (it usually launches a local server at http://127.0.0.1:5500).
