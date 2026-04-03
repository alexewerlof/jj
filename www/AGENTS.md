# Dependency

- All files in this folder (including the subfolders) use the library via `lib/bundle.js` which is created/updated using `npm run build`. Any change to the code `../src/**/*.ts` should follow with the build step to update the `lib/bundle.js`.
- Files in `www/` does not require a compilation.

# Task Docs

- For platform-oriented documentation strategy, reference `../guides/philosophy.md` and `../guides/architecture.md`.
- For AI task-specific guidance, reference `../skills/SKILL.md`.

# Serving

- This directory is meant to be served as a static site both locally and in production.
- Instead of creating a custom server or launching something from npm, use the `ritwickdey.liveserver` extension which is already installed in VS Code (it usually launches a local server at http://127.0.0.1:5500).
