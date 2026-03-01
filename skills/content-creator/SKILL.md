---
name: content-creator
description: >
  Handles creation and modification of lore entities (abilities, characters, events, places, planets, elements, mechanics, cards, objects) 
  ensuring compliance with AGENTS-LORE.md and project conventions.
  Trigger: When asked to create, edit, or extend lore content/entities.
license: Apache-2.0
metadata:
  author: live-wiki
  version: "1.0"
  scope: [root]
  auto_invoke: "Creating or editing lore content"
---

## When to Use

Use this skill when:
- Creating a new entity: Ability, Character, Event, Place, Planet, Element, Mechanic, Card, or Object.
- Modifying existing lore to add depth or resolve inconsistencies.
- Expanding the world building of the project.

## Critical Patterns

### 1. Mandatory Reading
Before writing a single line of lore, you **MUST** read:
- `AGENTS-LORE.md`: For style, tone, and coherence rules.
- `packages/lore-linter/LORE_SCHEMA.md`: For field definitions and UI mapping.
- Existing related entities: Search `content/` for connections.

### 2. Coherence First
- **Check Impact**: Does this new entity contradict existing ones?
- **Check Chronology**: Does it fit the world's timeline?
- **Human Contradiction**: Every character needs a flaw or a internal conflict.
- **Mirroring**: If you add a relationship in A to B, check if B needs a mirror reference to A.

### 3. Technical Compliance
- **Supported Types**:
  - `ability` (Character-linked abilities)
  - `character` (People, NPCs)
  - `event` (History, timeline)
  - `place` (Specific locations)
  - `planet` (Worlds, celestial bodies)
  - `element` (Magic, matter)
  - `mechanic` (Game rules, laws of physics)
  - `card` (Items, abilities)
  - `object` (Equipment with effects/stats)
- Use the correct template from `templates/`.
- Maintain `kebab-case` for IDs.
- Keep frontmatter strictly technical; narrative belongs in the body.

## Workflow

1. **Investigate**: Search `content/` for relevant context.
2. **Contextualize**: Read `AGENTS-LORE.md`.
3. **Draft**: Create the file using the appropriate template.
4. **Schema/Docs Sync (when entity structure changed)**: If you created a new type or changed fields/validation, update `packages/lore-linter/LORE_SCHEMA.md`, `AGENTS-LORE.md`, and `skills/content-creator/SKILL.md`.
5. **Validate**: Run `pnpm wiki:check` to validate lore and `pnpm verify` for general quality.

## Code Examples

### Character with Mirror Relation
```markdown
# In content/characters/new-hero.md
related_characters:
  - type: rival
    character: character:old-villain

# In content/characters/old-villain.md
related_characters:
  - type: rival
    character: character:new-hero
```

## Commands

```bash
# Validate lore consistency and schema
pnpm wiki:check

# Run full project quality check (lint + typecheck + tests + build)
pnpm verify
```

## Final Checklist

- [ ] Read `AGENTS-LORE.md` and related entities in `content/`.
- [ ] Verified consistency (chronology, relationships, tone).
- [ ] Used correct template and technical schema (`LORE_SCHEMA.md`).
- [ ] If entity schema changed, updated `packages/lore-linter/LORE_SCHEMA.md`, `AGENTS-LORE.md`, and this skill accordingly.
- [ ] IDs follow `kebab-case`.
- [ ] Ran `pnpm wiki:check` and `pnpm verify` successfully.

## Resources

- **Templates**: See `templates/` directory.
- **Examples**: See `assets/examples/` for full files of each type.
- **Rules**: See [AGENTS-LORE.md](../../AGENTS-LORE.md).
- **Schema**: See [LORE_SCHEMA.md](../../packages/lore-linter/LORE_SCHEMA.md).
