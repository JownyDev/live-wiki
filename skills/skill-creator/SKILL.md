---
name: skill-creator
description: >
  Creates new Live-Wiki agent skills aligned with repo conventions.
  Trigger: When user asks to create a new skill, add agent instructions, or document reusable patterns for Live-Wiki.
license: UNLICENSED
metadata:
  author: live-wiki
  version: "1.0"
  scope: [root]
  auto_invoke: "Crear nuevas skills"
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, WebFetch, WebSearch, Task
---

## When to Create a Skill

Create a skill when:
- A pattern is used repeatedly and AI needs guidance
- Project-specific conventions differ from generic best practices
- Complex workflows need step-by-step instructions
- Decision trees help AI choose the right approach

**Don't create a skill when:**
- Documentation already exists (create a reference instead)
- Pattern is trivial or self-explanatory
- It's a one-off task

---

## Skill Structure

```
skills/{skill-name}/
├── SKILL.md              # Required - main skill file
├── assets/               # Optional - templates, schemas, examples
│   ├── template.py
│   └── schema.json
└── references/           # Optional - links to local docs
    └── docs.md           # Points to docs/*.md or docs/design/*.md
```

---

## SKILL.md Template

```markdown
---
name: {skill-name}
description: >
  {One-line description of what this skill does}.
  Trigger: {When the AI should load this skill}.
license: UNLICENSED
metadata:
  author: live-wiki
  version: "1.0"
  scope: [root]               # Which AGENTS.md to update
  auto_invoke: "{Action}"     # Optional: for Auto-invoke table
---

## When to Use

{Bullet points of when to use this skill}

## Critical Patterns

{The most important rules - what AI MUST know}

## Code Examples

{Minimal, focused examples}

## Commands

```bash
{Common commands}
```

## Resources

- **Templates**: See [assets/](assets/) for {description}
- **Documentation**: See [references/](references/) for local docs
```

---

## Naming Conventions

| Type | Pattern | Examples |
|------|---------|----------|
| Generic skill | `{technology}` | `vitest`, `astro`, `typescript` |
| Live-Wiki-specific | `live-wiki-{area}` | `live-wiki-lore-linter`, `live-wiki-site` |
| Workflow skill | `{action}-{target}` | `skill-creator`, `jira-task` |

---

## Decision: assets/ vs references/

```
Need code templates?        → assets/
Need JSON schemas?          → assets/
Need example configs?       → assets/
Link to existing docs?      → references/
Link to external guides?    → references/ (with local path)
```

**Key Rule**: `references/` should point to LOCAL files under `docs/`, not web URLs.

---

## Decision: Project-Specific vs Generic

```
Patterns apply to ANY project?     → Generic skill (e.g., pytest, typescript)
Patterns are Live-Wiki-specific?   → live-wiki-{area} skill
Generic skill needs Live-Wiki info? → Add references/ pointing to docs/ in this repo
```

---

## Frontmatter Fields

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Skill identifier (lowercase, hyphens) |
| `description` | Yes | What + Trigger in one block |
| `license` | Yes | Use repo license (currently `UNLICENSED`) |
| `metadata.author` | Yes | `live-wiki` |
| `metadata.version` | Yes | Semantic version as string |
| `metadata.scope` | Recommended | Which AGENTS.md to update (e.g., `root`) |
| `metadata.auto_invoke` | Optional | Action labels for Auto-invoke table |

---

## Content Guidelines

### DO
- Start with the most critical patterns
- Use tables for decision trees
- Keep code examples minimal and focused
- Include Commands section with copy-paste commands

### DON'T
- Add Keywords section (agent searches frontmatter, not body)
- Duplicate content from existing docs (reference instead)
- Include lengthy explanations (link to docs)
- Add troubleshooting sections (keep focused)
- Use web URLs in references (use local paths)

---

## Registering the Skill

After creating the skill, add it to `AGENTS.md`:

```markdown
| `{skill-name}` | {Description} | [SKILL.md](skills/{skill-name}/SKILL.md) |
```

If the skill should appear in Auto-invoke, add `metadata.scope` and `metadata.auto_invoke`, then run the sync script.

---

## Checklist Before Creating

- [ ] Skill doesn't already exist (check `skills/`)
- [ ] Pattern is reusable (not one-off)
- [ ] Name follows conventions
- [ ] Frontmatter is complete (description includes trigger keywords)
- [ ] `metadata.scope` and `metadata.auto_invoke` set if needed
- [ ] Critical patterns are clear
- [ ] Code examples are minimal
- [ ] Commands section exists
- [ ] Added to AGENTS.md
- [ ] Ran skill sync (if auto-invoke)

## Resources

- **Templates**: See [assets/](assets/) for SKILL.md template
