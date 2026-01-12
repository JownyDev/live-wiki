# Live-Wiki

Live-Wiki is a text-first wiki for a game universe, built on Markdown + Git.
It renders static pages per entity type, keeps relations via stable IDs, and
validates lore consistency with a linter.

---

## Quickstart

Requirements:
- Node.js LTS (20 recommended)
- pnpm

One-liner (install + run):
```bash
pnpm install && pnpm dev
```

Useful commands:
```bash
pnpm quality
pnpm test --run
pnpm wiki:check
pnpm build
```

---

## Technologies and packages

- Node.js (LTS): runtime for tooling, builds, and scripts
- TypeScript (strict): safer parsing and validation logic
- pnpm: fast, disk-efficient monorepo dependency management
- Astro: static site generation for content-first pages
- Vitest: unit/integration tests for core logic
- Playwright (optional): end-to-end checks for critical flows
- ESLint + Prettier: consistent code quality and formatting

---

## What you get (MVP)

- 7 entity types: character, event, place, planet, element, card, mechanic
- Static pages: `/characters/:id`, `/events/:id`, `/places/:id`, `/planets/:id`,
  `/elements/:id`, `/cards/:id`, `/mechanics/:id`
- Lists per type: `/characters`, `/events`, `/places`, etc.
- Auto relations (timelines and links)
- Lore linter: schema, date checks, duplicate IDs, broken refs
- CLI helpers to create/check/build and CI pipeline

---

## Content format

Each entity is a single Markdown file under `content/<type>/`.
Frontmatter defines minimal fields; body is free Markdown.

Example (character):
```md
---
type: character
id: arina-mora
name: Arina Mora
origin: place:haven-docks
---

Short bio in Markdown.
```

Example (event):
```md
---
type: event
id: relay-run
title: Relay Run
date: 3051-02-14
who:
  - character: arina-mora
locations:
  - place:haven-docks
---
```

Rules:
- IDs are kebab-case and stable
- References use prefixes like `character:`, `place:`, `planet:`, `element:`

---

## No database by design

Live-Wiki does not use a conventional database. The repository is the source
of truth: content lives as Markdown files under `content/` so humans and AI can
work directly in the repo and iterate creative ideas without migrations.

---

## CLI

These commands use the local `wiki-cli` package:

```bash
pnpm wiki:new <type> <id>
pnpm wiki:check
pnpm wiki:build
```

---

## Project layout

```text
content/          Markdown source of truth
src/              Astro site (pages/layouts/components)
packages/lore-linter/  Validation engine (no UI deps)
packages/wiki-cli/     Dev tools and checks
templates/        Markdown templates per type
docs/design/      Technical design docs
```

Dependency direction:
`wiki-cli -> lore-linter -> shared`
`site (src) -> shared`

---

## CI

GitHub Actions runs on push/PR:
- install deps (pnpm)
- quality checks
- tests
- pnpm wiki:check
- build

Workflow: `.github/workflows/ci.yml`

---

## Contributing

Read `AGENTS.md` for project rules and conventions.

Design references:
- `docs/`
