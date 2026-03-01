---
name: entity-type-creator
description: >
  Guides the creation of new entity types (e.g., spells, factions) in the Live-Wiki system.
  Trigger: When asked to add a new entity type or expand the schema.
license: Apache-2.0
metadata:
  author: live-wiki
  version: "1.0"
  scope: [root]
  auto_invoke: "Adding a new entity type"
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, WebFetch, WebSearch, Task
---

## When to Use

Use this skill when:
- Adding a new `type: value` to the system (e.g., `type: faction`).
- Extending the schema validation for a new domain of the world.
- Ensuring the new type is integrated into the linter, documentation, and creation workflows.

## Critical Patterns

### 1. TDD Approach (Red-Green-Refactor)
1.  **Red:** Create failing test cases (fixtures) in `packages/lore-linter/test/fixtures/` and add a test block in `tests/lore-linter-schema.spec.ts`.
2.  **Green:** Implement the validation logic in `packages/lore-linter/src/schema-validation.ts`.
3.  **Refactor:** Ensure the code is clean and consistent with existing validators.

### 2. Implementation Points
*   **Schema Definition:** Update `requiredStringFieldsByType` in `packages/lore-linter/src/schema-validation.ts`.
*   **Custom Validation:** If the type has specific fields (like `elements` in cards), create a `validate[Type]Fields` function and register it in `typeValidators`.
*   **Optional Fields:** Add optional string fields to `optionalNonEmptyStringFieldsByType`.

### 3. Documentation & Integration
*   **LORE_SCHEMA.md:** Add a new section defining the type's fields (Mandatory vs Optional) in `packages/lore-linter/LORE_SCHEMA.md`.
*   **AGENTS-LORE.md:** Add a subsection in "Reglas de coherencia por tipo" explaining *how* to write this entity.
*   **Content Creator:** Update `skills/content-creator/SKILL.md` to include the new type in supported lists.
*   **Template:** Create a new template in `templates/[type].md`.
*   **Skill Sync:** If any skill file changed, run `bash ./skills/skill-sync/assets/sync.sh`.

## Workflow

1.  **Plan**: Define the fields (required/optional) and relationships.
2.  **Test**: Create `tests/fixtures/schema-newtype-invalid` and `schema-newtype-valid`. Add test to `lore-linter-schema.spec.ts`.
3.  **Implement**: Modify `schema-validation.ts`.
4.  **Document**: Update `packages/lore-linter/LORE_SCHEMA.md` and `AGENTS-LORE.md`.
5.  **Enable**: Update `skills/content-creator/SKILL.md` and run `bash ./skills/skill-sync/assets/sync.sh`.
6.  **Verify**: Run `pnpm verify` and `pnpm wiki:check`.

## Code Examples

### Adding a new type validator
```typescript
// packages/lore-linter/src/schema-validation.ts

// 1. Define required fields
const requiredStringFieldsByType: Partial<Record<string, string[]>> = {
  // ... existing types
  newtype: ['id', 'name', 'category'],
};

// 2. Define custom validation (if needed)
const validateNewTypeFields = (context: SchemaContext): void => {
  // Custom logic, e.g., validating a specific enum
  const category = context.data.category;
  if (category !== 'A' && category !== 'B') {
    addSchemaError(context, 'category', 'invalid-value');
  }
};

// 3. Register validator
const typeValidators: Partial<Record<string, (context: SchemaContext) => void>> = {
  // ... existing types
  newtype: validateNewTypeFields,
};
```

## Commands

```bash
# Run tests to see them fail/pass
pnpm test tests/lore-linter-schema.spec.ts

# Verify full project
pnpm verify
```

## Final Checklist

- [ ] Created fixtures in `packages/lore-linter/test/fixtures/` (valid & invalid).
- [ ] Added test case in `tests/lore-linter-schema.spec.ts`.
- [ ] Updated `packages/lore-linter/src/schema-validation.ts`.
- [ ] Created `templates/[type].md`.
- [ ] Updated `packages/lore-linter/LORE_SCHEMA.md`.
- [ ] Updated `AGENTS-LORE.md`.
- [ ] Updated `skills/content-creator/SKILL.md`.
- [ ] Ran `bash ./skills/skill-sync/assets/sync.sh` after skill edits.
- [ ] Ran `pnpm verify`.

## Resources

- **Linter Source**: `packages/lore-linter/src/schema-validation.ts`
- **Tests**: `tests/lore-linter-schema.spec.ts`
