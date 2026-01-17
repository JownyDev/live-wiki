---
name: skill-sync
description: >
  Syncs skill metadata to AGENTS.md Auto-invoke sections for Live-Wiki.
  Trigger: When updating skill metadata (metadata.scope/metadata.auto_invoke), regenerating Auto-invoke tables, or running ./skills/skill-sync/assets/sync.sh (including --dry-run/--scope).
license: UNLICENSED
metadata:
  author: live-wiki
  version: "1.0"
  scope: [root]
  auto_invoke:
    - "Despues de crear/modificar una skill"
    - "Regenerar tablas Auto-invoke de AGENTS.md (sync.sh)"
    - "Solucionar por que una skill no aparece en auto-invoke"
allowed-tools: Read, Edit, Write, Glob, Grep, Bash
---

## Purpose

Keeps AGENTS.md Auto-invoke sections in sync with skill metadata. When you create or modify a skill, run the sync script to automatically update all affected AGENTS.md files.

## Required Skill Metadata

Each skill that should appear in Auto-invoke sections needs these fields in `metadata`.

`auto_invoke` can be either a single string **or** a list of actions:

```yaml
metadata:
  author: live-wiki
  version: "1.0"
  scope: [site]                                  # Which AGENTS.md: root, site, lore-linter, wiki-cli

  # Option A: single action
  auto_invoke: "Creating/modifying components"

  # Option B: multiple actions
  # auto_invoke:
  #   - "Creating/modifying components"
  #   - "Refactoring component folder placement"
```

### Scope Values

| Scope | Updates |
|-------|---------|
| `root` | `AGENTS.md` (repo root) |
| `site` | `src/AGENTS.md` |
| `lore-linter` | `packages/lore-linter/AGENTS.md` |
| `wiki-cli` | `packages/wiki-cli/AGENTS.md` |

Skills can have multiple scopes: `scope: [ui, api]`

---

## Usage

### After Creating/Modifying a Skill

```bash
bash ./skills/skill-sync/assets/sync.sh
```

### What It Does

1. Reads all `skills/*/SKILL.md` files
2. Extracts `metadata.scope` and `metadata.auto_invoke`
3. Generates Auto-invoke tables for each AGENTS.md
4. Updates the `### Auto-invoke Skills` section in each file

---

## Example

Given this skill metadata:

```yaml
# skills/live-wiki-site/SKILL.md
metadata:
  author: live-wiki
  version: "1.0"
  scope: [site]
  auto_invoke: "Creating/modifying React components"
```

The sync script generates in `src/AGENTS.md`:

```markdown
### Auto-invoke Skills

Cuando realices estas acciones, SIEMPRE invoca la skill correspondiente primero:

| Action | Skill |
|--------|-------|
| Creating/modifying React components | `live-wiki-site` |
```

---

## Commands

```bash
# Sync all AGENTS.md files
bash ./skills/skill-sync/assets/sync.sh

# Dry run (show what would change)
bash ./skills/skill-sync/assets/sync.sh --dry-run

# Sync specific scope only
bash ./skills/skill-sync/assets/sync.sh --scope site
```

---

## Checklist After Modifying Skills

- [ ] Added `metadata.scope` to new/modified skill
- [ ] Added `metadata.auto_invoke` with action description
- [ ] Ran `./skills/skill-sync/assets/sync.sh`
- [ ] Verified AGENTS.md files updated correctly
