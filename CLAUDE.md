# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Shopify theme "Atelier" (v3.3.0) customized for brand **Avelle**. Built on Dawn framework with Liquid, ES modules, and web components. No external build tools — pure Shopify CLI workflow.

## Development Commands

```bash
# Start local dev server (requires Shopify CLI)
shopify theme dev

# Push theme to Shopify store
shopify theme push

# Pull latest from store
shopify theme pull

# Check theme for errors
shopify theme check
```

`package.json` and `config.yml` are git-ignored — install locally if needed.

## Architecture

**File hierarchy:**
- `layout/theme.liquid` — master template; imports stylesheets, scripts, header/footer sections
- `templates/*.json` — JSON-based page templates declaring section order
- `sections/*.liquid` — page content sections (57 files); can contain blocks
- `blocks/_*.liquid` — reusable block components (95 files); prefix `_` convention
- `snippets/*.liquid` — utility partials (99 files); no schema, just rendering helpers
- `assets/` — CSS + ES modules (135 files)
- `config/settings_schema.json` — all theme-level settings (2,327 lines)
- `locales/` — 51 language files

**JavaScript — ES module importmap:**
`snippets/scripts.liquid` defines an importmap with `@theme/*` aliases. All JS files are ES modules imported via these aliases. Key modules:
- `@theme/component` → `component.js` — base class for all web components (`Component extends HTMLElement`)
- `@theme/utilities` → `utilities.js` — `isLowPowerDevice()`, `supportsViewTransitions()`, `yieldToMainThread()`, etc.
- `@theme/section-renderer` → `section-renderer.js` — dynamic section re-rendering with DOM morphing
- `@theme/slideshow` → `slideshow.js` — carousel with viewport observer

Adding a new JS module: create `assets/mymodule.js`, add entry to importmap in `snippets/scripts.liquid`, add `<link rel="modulepreload">` for performance.

**CSS — CSS variables:**
- `assets/base.css` (5,086 lines) — core styles; uses CSS custom properties for all theming
- `snippets/color-schemes.liquid` — generates per-scheme CSS variables from `settings_data.json`
- `snippets/theme-styles-variables.liquid` — registers font faces and typography CSS vars
- `snippets/spacing-style.liquid` / `snippets/gap-style.liquid` — responsive spacing helpers

Color scheme variables follow pattern `--color-scheme-{n}-{property}`.

**Web component pattern:**
```javascript
import Component from '@theme/component';
class MyElement extends Component {
  connectedCallback() { super.connectedCallback(); }
  updatedCallback() { /* called on DOM mutations */ }
}
customElements.define('my-element', MyElement);
```
`Component` provides: `this.refs` (elements with `ref=""` attribute), mutation observer, declarative shadow DOM support.

**Section/block schema:**
Sections declare `{% schema %}` JSON with `blocks` array referencing block types by filename (without `.liquid`). Blocks use `{% schema %}` with `type` matching their filename prefix convention.

**Snippets key reference:**
- `snippets/section.liquid` — generic section wrapper (handles color scheme, spacing, padding)
- `snippets/background-media.liquid` — media backgrounds for sections
- `snippets/border-override.liquid` — border utility
- `snippets/meta-tags.liquid` / `snippets/fonts.liquid` — head tag helpers

## Key Settings

Theme settings are in `config/settings_schema.json`. Active values in `config/settings_data.json` (auto-managed by Shopify admin, do not hand-edit for production).

Color schemes: 7 schemes, each with `background`, `foreground`, `headings`, `primary`, button colors, borders. Referenced as `section.settings.color_scheme`.

Typography: 4 font families (Body, Subheading, Heading, Accent). Heading sizes H1–H6 each have font, size, line-height, letter-spacing, text-case settings.

Cart: configurable as drawer or page (`settings.cart_type`).

## Fonts

Custom font: **Zodiak** (14 variants, `.woff2` files in `assets/`). Registered in `snippets/theme-styles-variables.liquid`.

## View Transitions

Theme supports View Transitions API. `assets/view-transitions.js` + `assets/section-hydration.js` handle smooth page navigation. Guard new animations with `supportsViewTransitions()` from utilities.
