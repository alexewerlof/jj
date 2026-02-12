## Quick orientation for AI coding agents

This is **JJ** — a no-build, imperative DOM library optimized for AI-assisted development. It prioritizes **direct browser APIs** over abstractions, **fluent chaining** over statements, and **type safety** over runtime checks.

### Core Philosophy

JJ is designed on three pillars:

1. **No Build Step** — TypeScript compiles to runnable modules; no transpilation needed
2. **Web Standards First** — Web Components, native DOM, CSS nesting/variables; zero VDOM overhead
3. **AI-Optimized** — Designed so LLMs naturally write idiomatic, type-safe code

Read `www/tutorial/00-design-philosophy.md` for the detailed "Facts, Assumptions, Beliefs" that guide architectural decisions.

### Architecture

- **Source:** `src/` (TypeScript) → compiles via `tsup` to `lib/` (ESM JS + `.d.ts`)
- **Library API:** Wrapper classes (`JJN`, `JJE`, `JJHE`, `JJSE`, `JJD`, `JJDF`, etc.) around DOM interfaces; re-exported from `src/index.ts`
- **Bundle:** `esbuild` produces `lib/bundle.js` (via `bundle.js` script) for browser/CDN use
- **Docs:** `typedoc` generates `/doc` from `src/index.ts` JSDoc comments
- **Examples:** `www/` contains runnable examples and tutorials; uses `lib/bundle.js` (no compilation step)

### Key Commands

| Command             | Effect                                                    |
| ------------------- | --------------------------------------------------------- |
| `npm run build`     | `tsup` → `bundle.js` → `typedoc`                          |
| `npm run typecheck` | Dry-run type check without emit                           |
| `npm test`          | Type-check + run tests via `node --import tsx --test`     |
| `npm run doc`       | Regenerate docs only                                      |
| `npm run fmt`       | Format all files (prettier, single-quote, trailing-comma) |

### Fluent API & Method Chaining

**Golden Rule:** Chain `.JJ*` methods whenever possible; only use `.ref` (native DOM access) when the wrapper doesn't provide a method.

```typescript
// ✅ GOOD — fluent chaining
const btn = JJHE.create('button').addClass('primary').setText('Click me').on('click', handler)

// ❌ BAD — breaking chain to access native
const input = JJHE.create('input')
input.ref.focus() // Use .ref only when wrapper lacks method
```

**Common methods:** `.setText()`, `.setHTML(el, true)`, `.setAttr()`, `.getAttr()`, `.addClass()`, `.rmClass()`, `.on()`, `.empty()`, `.addChild()`, `.find()`, `.findAll()`, `.closest()`, `.setData()`, `.getData()`.

### Custom Components (Web Components)

All custom components follow a **three-file pattern** (HTML/CSS/JS separate):

1. **Template + Styles** — used via `ShadowMaster`
2. **Component Class** — extends `HTMLElement`, initializes shadow DOM via `JJHE.initShadow()`
3. **Registration** — static async `.register()` method

**Pattern example** (`www/examples/kanban/components/kanban-card.js`):

```typescript
const sm = ShadowMaster.create()
    .setTemplate(fetchHtml(import.meta.resolve('./kanban-card.html')))
    .addStyles(fetchCss(import.meta.resolve('./kanban-card.css')))

export class KanbanCard extends HTMLElement {
    async connectedCallback() {
        this.#root = JJHE.from(this).initShadow('open', await sm.getResolved())
        this.#render()
    }
    // ...
    static register() {
        customElements.define('kanban-card', KanbanCard)
    }
}
```

Key points:

- `ShadowMaster` is created **once** and reused (caches efficiently)
- Use `fetchHtml()` and `fetchCss()` with `import.meta.resolve()` for module-relative paths
- Store shadow root as `this.#root` and use `.shadow` property to query within shadow DOM
- Public `setData(data)` method for imperative updates (no data-binding)

### CSS Best Practices

**CRITICAL:** All CSS must comply with `.github/instructions/css.instructions.md`. Key rules:

1. **Variables-First** — Never hardcode colors, spacing, or border-radius:

    ```css
    /* ❌ Bad */
    padding: 12px;
    color: #ffbc52;

    /* ✅ Good */
    padding: var(--gap3);
    color: var(--primary-color);
    ```

2. **CSS Nesting** — Use native CSS nesting (& selector):

    ```css
    .card {
        padding: var(--gap3);

        &:hover {
            transform: translateY(-2px);
        }
        & .card-title {
            font-weight: 700;
        }
    }
    ```

3. **Property Grouping** — Order: Box Model → Visual → Typography → Interaction
4. **No IDs, Deep Nesting, or Magic Numbers** — Keep specificity low
5. **Mobile-First + Flexbox/Grid** — Use modern layouts; media queries only when needed

**Available variables** (from `www/variables.css`): `--gap`, `--gap2`, `--gap3`, ... `--gap6`; `--primary-color`, `--brand-red`, `--brand-green`, etc.; `--bradius`, `--bthick`, `--animation-speed`, font families.

### Module/Import Conventions

- **ESM everywhere:** `package.json` has `"type": "module"`, `tsconfig.json` targets `NodeNext`
- **JS extensions in TS imports:** Always use `.js` in import paths:

    ```typescript
    // ✅ Correct
    import { JJD } from './JJD.js'
    import { KanbanCard } from './components/kanban-card.js'

    // ❌ Wrong
    import { JJD } from './JJD'
    ```

    TypeScript is configured to emit and resolve `.js` imports matching runtime; omitting `.js` breaks in ESM.

### Testing Requirements

**Every feature, bugfix, or API change MUST include tests.** Tests live in `test/` and mirror source structure:

- `src/JJE.ts` → `test/JJE.test.ts`
- `src/ShadowMaster.ts` → `test/ShadowMaster.test.ts`

Tests use Node's `--test` runner with `jsdom` for DOM simulation. Example pattern:

```typescript
import { test } from 'node:test'
import { strict as assert } from 'node:assert'
import { JJHE } from './src/index.js'

test('JJHE.create sets up element correctly', () => {
    const div = JJHE.create('div')
    assert.equal(div.ref.tagName, 'DIV')
})
```

Run with: `npm test` or `npm run test:watch`.

### Security & Error Handling

- **`setHTML()` requires confirmation:** Must pass `true` as 2nd arg to confirm intentional innerHTML use
    ```typescript
    div.setHTML('<p>Safe</p>', true) // ✅
    div.setHTML('<p>Boom</p>') // ❌ Throws error
    ```
- **Prefer `.setText()` for user input** to prevent XSS
- **Error utilities:** Use `typeErr()` and `errMsg()` from `src/internal.js` instead of `new Error()`; reduces bundle size

### Documentation & Comments

All **public methods and classes** must have **JSDoc comments** with `@param`, `@returns`, `@example`, `@remarks`. Examples:

```typescript
/**
 * Adds a CSS class to this element.
 * @param {...string} classes Class names to add
 * @returns {this} For chaining
 * @example
 * el.addClass('active', 'highlight')
 */
addClass(...classes) { /* ... */ }
```

Run `npm run doc` to generate HTML docs in `/doc`.

### Common Pitfalls

1. **Forgetting `.js` in TypeScript imports** — breaks in ESM runtime
2. **Using `.ref` when wrapper method exists** — breaks chaining, less type-safe
3. **Hardcoding CSS values/colors** — violates space/color standards (see CSS instructions)
4. **Modifying `package.json` exports** — breaks bundler; coordinate with maintainer
5. **Skipping tests for "small" changes** — tests are mandatory, catch edge cases
6. **Not updating `AGENTS.md` when changing APIs** — docs are as important as tests

### File Organization Reference

- `src/*` — Core library (wrappers, utilities)
- `test/*` — Test suite (mirrors src structure)
- `lib/*` — Compiled output (don't commit changes here)
- `www/` — Examples and tutorials (uses `lib/bundle.js`, no build step)
    - `www/components/` — Reusable components (counter, etc.)
    - `www/examples/` — Full app examples (kanban, todo, etc.)
    - `www/tutorial/` — Markdown guides on usage patterns
    - `www/variables.css` — Shared CSS variables (import in all component CSS)

**Key principle:** Related HTML/CSS/JS files live in the same directory and follow the three-file pattern.

### When in Doubt

1. Check `AGENTS.md` — source of truth for library philosophy and APIs
2. Read `www/tutorial/custom-components.md` — definitive web component pattern
3. Look at `www/examples/kanban/` — fully-featured example showing current best practices
4. Run `npm test` — validates TypeScript + runtime behavior
5. Ask the user — your job is to implement their intent idiomatic**to JJ**, not guess

---

**This project is designed for AI collaboration. Your job is to write clear, type-safe, testable code that follows these patterns. When patterns conflict with user intent, ask for clarification rather than assuming.**
