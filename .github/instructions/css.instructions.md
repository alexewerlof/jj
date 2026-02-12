---
name: CSS Instructions
description: Makes sure CSS complies with best practices (variables-first, minimal, responsive, theme-aware).
applyTo: "**/*.css"
---

# CSS Instructions for AI Coding Agents

Use these instructions whenever you create or modify CSS in this repository.
Follow the rules below to keep styles minimal, consistent, and theme-aware.

## Quick Checklist

- Use `www/variables.css` custom properties for all values.
- Prefer CSS nesting and shallow selectors (max 2-3 levels).
- Mobile-first layouts; only add media queries when needed.
- Avoid hardcoded values, magic numbers, and `!important`.
- Keep component styles next to the component; shared styles in `www/`.

## 1. Core Philosophy

- **Minimalistic**: Write the least amount of CSS needed to achieve the desired result
- **Clear**: Use descriptive class names and logical structure
- **Variable-First**: Always use CSS custom properties from `www/variables.css`
- **Responsive by Default**: Support all screen sizes and orientations with minimal code
- **Theme-Aware**: Support both light and dark color schemes
- **BEM-First**: Use BEM naming for all classes and structure selectors around blocks

## 2. CSS Variables (Critical)

**ALWAYS** use CSS custom properties from `www/variables.css` instead of hardcoded values.

### Available Variables

```css
/* Spacing */
--gap, --gap2, --gap3, --gap4, --gap5, --gap6

/* Colors */
--primary-color, --primary-lighter
--secondary-color
--background-color, --background-darker, --background-lighter
--foreground-color
--divider-color, --disabled-color, --ui-border

/* Brand Colors */
--brand-blue, --brand-yellow, --brand-green, --brand-red, --brand-pink, --brand-purple

/* Border Radius */
--bradius, --bradius2, --bradius3, --bradius4, --bradius5

/* Border Thickness */
--bthick, --bthick2, --bthick3, --bthick4

/* Animation Speed */
--animation-speed, --animation-speed2, --animation-speed3, --animation-speed4, --animation-speed10

/* Typography */
--title-font-family, --body-font-family, --code-font-family
```

### Usage Examples

```css
/* ✅ GOOD - Using variables */
.button {
    padding: var(--gap2) var(--gap3);
    background: var(--primary-color);
    color: var(--background-color);
    border-radius: var(--bradius);
    font-family: var(--body-font-family);
    transition: all var(--animation-speed);
}

/* ❌ BAD - Hardcoded values */
.button {
    padding: 1rem 1.5rem;
    background: #ffbc52;
    color: #001426;
    border-radius: 3px;
    font-family: 'Roboto', sans-serif;
    transition: all 0.2s;
}
```

## 3. CSS Nesting

**ALWAYS** use CSS nesting to reduce repetition and improve readability.

Keep nesting aligned with BEM so selectors remain flat and predictable.

### Native nesting rules (from MDN)

- **No concatenation**: `&__element` is invalid in native CSS nesting. Use full class names or descendant selectors instead.
- **Descendant by default**: A nested selector without `&` is treated as a descendant (`.parent .child`).
- **Compound selectors need `&`**: Use `&.class` or `&:hover` to target the same element.
- **Combinators are allowed**: Use `& > .child`, `& + .sibling`, `& ~ .sibling` for relationships.
- **Invalid nested selector**: Only the invalid nested rule is dropped; parent rules still apply.
- **Specificity**: `&` uses the highest specificity from the parent selector list (like `:is()`), so avoid IDs in selector lists.
- **Nested declarations order**: Keep base declarations together before nested rules to avoid confusing ordering.
- **Nestable at-rules**: `@media`, `@supports`, `@layer`, `@scope`, `@container`, `@starting-style`.

```css
/* ✅ GOOD - Using nesting */
.card {
    padding: var(--gap3);
    background: var(--background-lighter);
    
    &:hover {
        background-color: var(--background-color);
    }
    
    .card-title {
        font-family: var(--title-font-family);
        color: var(--primary-color);
        margin-bottom: var(--gap2);
    }
    
    .card-content {
        color: var(--foreground-color);
        
        p {
            margin-bottom: var(--gap);
        }
    }
}

/* ❌ BAD - No nesting, repetitive */
.card {
    padding: var(--gap3);
    background: var(--background-lighter);
}

.card:hover {
    background: var(--background-color);
}

.card .card-title {
    font-family: var(--title-font-family);
    color: var(--primary-color);
    margin-bottom: var(--gap2);
}

.card .card-content {
    color: var(--foreground-color);
}

.card .card-content p {
    margin-bottom: var(--gap);
}

/* ✅ GOOD - BEM-safe nesting (no concatenation) */
.card {
    padding: var(--gap3);
    background: var(--background-lighter);

    & .card__title {
        font-family: var(--title-font-family);
        color: var(--primary-color);
        margin-bottom: var(--gap2);
    }

    & .card__content {
        color: var(--foreground-color);

        p {
            margin-bottom: var(--gap);
        }
    }

    &.card--highlighted {
        border: var(--bthick) solid var(--primary-color);
    }

    @media (min-width: 768px) {
        & .card__content {
            margin-bottom: var(--gap2);
        }
    }
}

/* ❌ BAD - Invalid concatenation */
.card {
    &__title {
        color: var(--primary-color);
    }
}
```

## 4. Responsive Design

Use **mobile-first** approach with minimal media queries. Leverage modern CSS features like `flexbox`, `grid`, and `clamp()`.

### Breakpoints

Use these standard breakpoints only when necessary:

```css
/* Mobile-first: base styles apply to mobile */

/* Tablet and up */
@media (min-width: 768px) { }

/* Desktop and up */
@media (min-width: 1024px) { }

/* Large desktop */
@media (min-width: 1440px) { }
```

### Best Practices

```css
/* ✅ GOOD - Responsive with minimal code */
.container {
    padding: var(--gap2);
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 250px), 1fr));
    gap: var(--gap2);
}

.text {
    font-size: clamp(1rem, 2vw, 1.5rem);
}

/* ✅ GOOD - Strategic media queries */
.sidebar {
    display: none;
    
    @media (min-width: 1024px) {
        display: block;
    }
}

/* ❌ BAD - Over-specified breakpoints */
.container {
    padding: 8px;
}

@media (min-width: 480px) {
    .container { padding: 12px; }
}

@media (min-width: 768px) {
    .container { padding: 16px; }
}

@media (min-width: 1024px) {
    .container { padding: 20px; }
}

@media (min-width: 1440px) {
    .container { padding: 24px; }
}
```

### Orientation Support

Only add orientation queries when absolutely necessary:

```css
/* ✅ GOOD - Most layouts work in both orientations */
.gallery {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--gap2);
}

/* ✅ GOOD - When orientation matters */
@media (orientation: landscape) and (max-height: 600px) {
    .hero {
        min-height: 100vh;
    }
}
```

## 5. Color Scheme (Light/Dark Mode)

Support both light and dark themes using `prefers-color-scheme` media query.

```css
/* ✅ GOOD - Theme-aware colors */
.panel {
    background: var(--background-lighter);
    color: var(--foreground-color);
    border: var(--bthick) solid var(--ui-border);
}

@media (prefers-color-scheme: light) {
    :root {
        --background-color: #ffffff;
        --foreground-color: #000000;
        --primary-color: #ff9800;
        /* Override other variables as needed */
    }
}

/* ❌ BAD - Hardcoded colors that don't adapt */
.panel {
    background: #001b33;
    color: #fff5e6;
    border: 1px solid #183a57;
}
```

## 6. Common Patterns

### Flexbox Centering

```css
.center {
    display: flex;
    justify-content: center;
    align-items: center;
}
```

### Card Component

```css
.card {
    padding: var(--gap3);
    background: var(--background-lighter);
    border-radius: var(--bradius2);
    border: var(--bthick) solid var(--ui-border);
    
    &:hover {
        border-color: var(--primary-color);
        transition: border-color var(--animation-speed);
    }
}
```

### Button Styles

```css
.btn {
    padding: var(--gap) var(--gap3);
    background: var(--primary-color);
    color: var(--background-color);
    border: none;
    border-radius: var(--bradius);
    font-family: var(--body-font-family);
    cursor: pointer;
    transition: all var(--animation-speed);
    
    &:hover:not(:disabled) {
        background: var(--primary-lighter);
        transform: translateY(-1px);
    }
    
    &:disabled {
        background: var(--disabled-color);
        cursor: not-allowed;
    }
}
```

### Grid Layout

```css
.grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr));
    gap: var(--gap2);
}
```

## 7. Performance & Best Practices

- **Avoid `!important`**: Indicates poor specificity management
- **Minimize specificity**: Keep selectors shallow (max 2-3 levels deep)
- **Avoid absolute positioning**: Prefer flexbox/grid for layouts
- **Use transforms for animations**: Better performance than animating layout properties
- **Group related properties**: Box model → visual → typography
 - **Prefer class selectors**: Avoid tag, id, and attribute selectors unless required

```css
/* ✅ GOOD - Logical property order */
.element {
    /* Box Model */
    display: flex;
    padding: var(--gap2);
    margin-bottom: var(--gap);
    
    /* Visual */
    background: var(--background-lighter);
    border: var(--bthick) solid var(--ui-border);
    border-radius: var(--bradius);
    
    /* Typography */
    font-family: var(--body-font-family);
    color: var(--foreground-color);
    
    /* Misc */
    transition: all var(--animation-speed);
}
```

## 8. File Organization

- Place component-specific styles next to components (e.g., `simple-counter.css` with `simple-counter.js`)
- Shared styles go in `www/` root (`ui.css`, `index.css`, etc.)
- Never duplicate variables—always import from `variables.css`

## 9. BEM Methodology (Required)

Use BEM naming for all selectors and keep blocks independent.

- **Block**: A standalone component. Use `.block-name`.
- **Element**: A part of a block. Use `.block-name__element`.
- **Modifier**: A variation of a block or element. Use `.block-name--modifier` or `.block-name__element--modifier`.

Rules:

- Do not style IDs or rely on tag selectors for component styling.
- Do not chain blocks (`.a .b`) to create dependencies.
- Avoid element selectors without the block prefix (`.title`, `.content`).
- Modifiers only adjust, never define a base style.

Examples:

```css
/* ✅ GOOD - BEM */
.banner {
    padding: var(--gap3);
    background: var(--background-lighter);

    &__title {
        font-family: var(--title-font-family);
    }

    &__cta {
        background: var(--primary-color);
        color: var(--background-color);
    }

    &--compact {
        padding: var(--gap2);
    }
}

/* ❌ BAD - Non-BEM */
#banner .title {
    font-family: var(--title-font-family);
}

.banner .cta.primary {
    background: var(--primary-color);
}
```

## 10. Forbidden Patterns

**NEVER** do these:

```css
/* ❌ Hardcoded pixel values */
padding: 10px;
margin: 20px 15px;

/* ❌ Hardcoded colors */
background: #ffbc52;
color: red;

/* ❌ Inline styles in HTML */
<div style="padding: 10px;">

/* ❌ Browser-specific prefixes without reason */
-webkit-border-radius: 3px;
border-radius: 3px;

/* ❌ Deep nesting (>4 levels) */
.a .b .c .d .e { }

/* ❌ BEM violations */
#card .title { }
.card .title { }
.card .card__title { }

/* ❌ Magic numbers */
z-index: 99999;
margin-top: 37px;
```

## 11. Documentation Maintenance

If you add new CSS variables to `variables.css`, update this file to document them in section 2.
If you establish new patterns, add them to section 6.

---

**Remember**: The goal is minimal, maintainable CSS that works everywhere with zero bloat.
When in doubt, use existing variables and patterns from this repository.
