# Website

`www/` is a static site served locally with Live Server and deployed through GitHub Pages. Site and example modules import generated bundles from `lib/` (usually `bundle.js`; some use `bundle.min.js`). Markdown, syntax highlighting, and guide-navigation helpers are bundled locally to ignored output at `www/vendor/site-vendors.js`. Rendered Markdown links are resolved in the browser against the fetched Markdown file URL, then mapped to the site's guide/tutorial routes where applicable; keep source Markdown links repository-relative.

After changing `src/` or the site vendor entry, run `npm run build` before previewing or deploying so the generated bundles are current. Other changes to `www/` are static.

Follow the root `skills/SKILL.md` guidance for JJ APIs. The root `AGENTS.md` documents the local preview URL and server convention.
