---
name: ui-developer
description: >
  Transforms UI references (HTML/PNG in docs/ui) into reusable Astro components and pages.
  Trigger: When asked to implement a view from a reference, create UI from design, or refactor a page based on docs/ui files.
license: Apache-2.0
metadata:
  author: live-wiki
  version: "1.0"
  scope: [root, ui]
  auto_invoke: "Implementing UI from reference views"
---

## When to Use

Use this skill when:
- A new UI reference (HTML, PNG, or mock) is added to `docs/ui/`.
- You need to build a complex view and want to ensure maximum component reuse.
- Refactoring existing pages to align with a specific design reference.

## Critical Patterns

### 1. Systematic Analysis
Before coding, you **MUST** analyze the reference (`docs/ui/*.html` or image):
- **Structure**: Map the DOM hierarchy to Astro components.
- **Tokens**: Identify colors, spacing, and fonts. Map them to `src/styles/global.css` variables.
- **Atoms**: Identify low-level reusable elements (Buttons, Badges, Links).
- **Molecules**: Identify domain-specific cards or sections (CharacterHero, RelationList).

### 2. Component Extraction Strategy
Follow this hierarchy for creating/reusing components:
1. **Layouts** (`src/layouts/`): Page structure and global headers/nav.
2. **Design System Atoms** (`src/components/`): Generic, non-lore components (Badge, Section).
3. **Lore Molecules** (`src/components/`): Domain-specific components (CharacterHero, DataPanel).
4. **Islands** (`src/components/` + `src/scripts/`): For client-side interactivity.

### 3. Implementation Flow
1. **Extract Props**: Define TypeScript interfaces for every new component.
2. **Scoped Styles**: Use `<style>` tags in `.astro` files with BEM-lite naming.
3. **Design Tokens**: NEVER hardcode values. Use `var(--color-bg)`, `var(--space-4)`, etc.
4. **Data Fetching**: Pages (`src/pages/`) handle data fetching and pass props to components.

## Code Examples

### Analyzing a reference
If `docs/ui/ref.html` has a sidebar with stats:
- Create `DataPanel.astro` if it doesn't exist.
- Define `type DataPanelItem = { label: string; value: string; icon?: string; href?: string }`.
- Implementation should loop through items using the defined interface.

### Theming
```css
/* Inside component <style> */
.my-card {
  background: var(--color-surface);
  padding: var(--space-4);
  border: 1px solid var(--color-border);
}
```

## Commands

```bash
# Verify the build after UI changes
pnpm verify

# Check for linting errors in new components
pnpm lint
```

## Final Checklist

- [ ] Analyzed `docs/ui/` reference for reusable patterns.
- [ ] Created/Updated components in `src/components/` with strict TypeScript props.
- [ ] Styles use Design Tokens from `global.css`.
- [ ] Media queries are scoped within components.
- [ ] Page in `src/pages/` uses components and passes clean data.
- [ ] Ran `pnpm verify` successfully.

## Resources

- **Base Styles**: [src/styles/global.css](../../src/styles/global.css)
- **UI References**: [docs/ui/](../../docs/ui/)
- **Architecture Rules**: [AGENTS.md](../../AGENTS.md)
