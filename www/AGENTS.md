# Website

`www/` is a static site served locally with Live Server and deployed through GitHub Pages. Site and example modules import generated bundles from `lib/` (usually `bundle.js`; some use `bundle.min.js`).

After changing `src/`, run `npm run build` before previewing or deploying so the generated bundles are current. Changes to `www/` are static and need no compilation.

Follow the root `skills/SKILL.md` guidance for JJ APIs. The root `AGENTS.md` documents the local preview URL and server convention.
