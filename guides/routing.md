# Routing with the History API

JJ does not include a routing wrapper. This is intentional.

The browser already provides a small, clear routing foundation through the History API, URL API, and a few window events. For most applications, adding a wrapper would add vocabulary without adding much power.

This guide gives you a practical mental model and implementation patterns for SPA-style navigation.

## Browser references

- [History API](https://developer.mozilla.org/en-US/docs/Web/API/History_API)
- [History interface](https://developer.mozilla.org/en-US/docs/Web/API/History)
- [Working with the History API](https://developer.mozilla.org/en-US/docs/Web/API/History_API/Working_with_the_History_API)
- [Window: popstate event](https://developer.mozilla.org/en-US/docs/Web/API/Window/popstate_event)
- [Window: hashchange event](https://developer.mozilla.org/en-US/docs/Web/API/Window/hashchange_event)
- [URL](https://developer.mozilla.org/en-US/docs/Web/API/URL)
- [URLSearchParams](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams)
- [Window: pageshow event](https://developer.mozilla.org/en-US/docs/Web/API/Window/pageshow_event)
- [History: scrollRestoration](https://developer.mozilla.org/en-US/docs/Web/API/History/scrollRestoration)

## Mental model

Think of session history as a stack-like timeline of entries.

- Every entry has a URL.
- An entry can also carry a small structured-clone state object.
- `pushState` adds a new entry.
- `replaceState` edits the current entry.
- Back/Forward activates a different entry.
- Activating a different entry triggers `popstate`.

Critical detail:

- `pushState` and `replaceState` do not trigger `popstate`.
- `popstate` happens when the active history entry changes, usually from Back/Forward.

This is why routers usually have two paths:

- A navigation path that updates URL and state (`pushState`/`replaceState`).
- A history-sync path that reacts to `popstate`.

## Why JJ does not wrap this

JJ focuses on fluent DOM manipulation. Routing is already ergonomic in native APIs:

- One interface (`history`) with a handful of methods.
- One primary event (`popstate`) for history traversal.
- First-class URL parsing (`URL`, `URLSearchParams`).

Because the platform API is small and stable, a JJ-specific router wrapper would often be indirection rather than simplification.

## Core API you actually use

### `history.pushState(state, '', url)`

Adds a new history entry without a full page reload.

Use when:

- User performs an intentional navigation that should create a Back step.

### `history.replaceState(state, '', url)`

Replaces the current entry without a full page reload.

Use when:

- Normalizing or redirecting URL shape.
- Updating defaults on first load without adding Back noise.

### `window.addEventListener('popstate', handler)`

Runs when the active session history entry changes.

Use when:

- Restoring the correct view after Back/Forward.

### `history.go(delta)`, `history.back()`, `history.forward()`

Programmatic traversal through existing entries.

Use sparingly, mostly for explicit UI actions like custom Back buttons.

### `history.state`

Returns state object for the active history entry.

Good for:

- Small transient details that do not belong in shared URL semantics.

Not good for:

- Canonical route identity. That should stay in the URL.

## Window events that matter for routing

### `popstate`

- Main event for SPA routing with History API.
- Fired on history traversal, not on `pushState`/`replaceState`.

### `hashchange`

- Relevant only for hash-based routing (`#/path`).
- Independent from History API path/query routing.

### `pageshow`

- Useful for BFCache restores (`event.persisted === true`).
- Helps revalidate data or refresh stale view state when the page resumes from cache.

## URL-first routing contract

A robust rule for senior teams:

- The URL is the source of truth for route identity.
- `history.state` is optional supplemental state.

If the page reloads, opens in a new tab, or is shared, URL-based routing still works with no hidden assumptions.

## Minimal router skeleton

```js
function parseRoute(urlStr = window.location.href) {
    const url = new URL(urlStr)
    const page = url.pathname
    const params = Object.fromEntries(url.searchParams.entries())
    return { page, params }
}

async function renderRoute(route) {
    // Fetch/render view data based on route.page + route.params
    // Keep this function idempotent: same route => same output.
}

async function navigate(url, { replace = false, state = null } = {}) {
    // 1) Render first or last depending on failure semantics.
    // Most apps render first, then commit history on success.
    const route = parseRoute(url)
    await renderRoute(route)

    if (replace) {
        history.replaceState(state, '', url)
    } else {
        history.pushState(state, '', url)
    }
}

window.addEventListener('popstate', async () => {
    await renderRoute(parseRoute())
})

await renderRoute(parseRoute())
```

## Common SPA goals and direct patterns

### 1. Deep linking

Goal: route can be opened directly or shared.

Pattern:

- Encode route identity in pathname and query params.
- Hydrate initial view from `window.location` on startup.

### 2. Back/Forward correctness

Goal: browser controls match view transitions.

Pattern:

- `pushState` only for user-visible navigation steps.
- Listen for `popstate` and re-render strictly from current URL.

### 3. Canonical URLs

Goal: avoid equivalent URLs representing same state.

Pattern:

- Normalize route format on startup.
- Use `replaceState` for normalization to avoid extra history entries.

### 4. Scroll behavior

Goal: predictable scroll on route transitions.

Pattern:

- Configure `history.scrollRestoration` (`'auto'` or `'manual'`).
- If manual, own scroll resets/restores in your route lifecycle.

### 5. Failure-safe navigation

Goal: do not expose broken URL state.

Pattern:

- Attempt async data/view load first.
- Call `pushState` only after successful render.
- Show error fallback without committing bad route if load fails.

## Practical guidance for `state`

Use URL for portable semantics, use `state` for ephemeral details.

Good candidates for `state`:

- Scroll offsets for custom restoration.
- UI-only tab index that can be recomputed if missing.

Poor candidates for `state`:

- Resource ID required to reconstruct view after refresh.
- Anything needed for copy/paste sharing.

## Pitfalls to avoid

- Expecting `pushState` to trigger `popstate`.
- Treating in-memory state as canonical route source.
- Encoding large payloads in `history.state`.
- Updating URL before async route load succeeds when failure would leave the app inconsistent.
- Mixing hash routing and path/query routing without explicit rules.

## Summary

Routing in modern browsers is mostly three concepts:

- Parse URL.
- Render from URL.
- Sync URL changes with history traversal.

That is exactly why JJ leaves routing to native APIs: they are already intuitive, explicit, and sufficient for common SPA navigation goals.
