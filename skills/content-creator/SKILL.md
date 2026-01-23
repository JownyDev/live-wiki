---
name: content-creator
description: >
  Handles creation and modification of lore entities (characters, events, places, elements) 
  ensuring compliance with AGENTS-LORE.md and project conventions.
  Trigger: When asked to create, edit, or extend lore content/entities.
license: UNLICENSED
metadata:
  author: live-wiki
  version: "1.0"
  scope: [root]
  auto_invoke: "Crear o editar contenido de lore"
---

## When to Use

Use this skill when:
- Creating a new character, place, event, or element.
- Modifying existing lore to add depth or resolve inconsistencies.
- Expanding the world building of the project.

## Critical Patterns

### 1. Mandatory Reading
Before writing a single line of lore, you **MUST** read:
- `AGENTS-LORE.md`: For style, tone, and coherence rules.
- Existing related entities: Search `content/` for connections.

### 2. Coherence First
- **Check Impact**: Does this new entity contradict existing ones?
- **Check Chronology**: Does it fit the world's timeline?
- **Human Contradiction**: Every character needs a flaw or a internal conflict.
- **Mirroring**: If you add a relationship in A to B, check if B needs a mirror reference to A.

### 3. Technical Compliance
- Use the correct template from `templates/`.
- Maintain `kebab-case` for IDs.
- Keep frontmatter strictly technical; narrative belongs in the body.

## Workflow

1. **Investigate**: Search `content/` for relevant context.
2. **Contextualize**: Read `AGENTS-LORE.md`.
3. **Draft**: Create the file using the appropriate template.
4. **Validate**: Run `pnpm quality` to ensure schema compliance.

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
# Validate content
pnpm quality

# Check for broken references (if applicable)
pnpm test
```

## Resources

- **Templates**: See `templates/` directory.
- **Rules**: See [AGENTS-LORE.md](../../AGENTS-LORE.md).
