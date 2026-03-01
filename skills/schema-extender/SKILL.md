---
name: schema-extender
description: >
  Guides the process of extending existing entity types (adding fields, changing validation, refactoring structures).
  Trigger: When asked to add a new field to an entity, change its structure, or modify validation rules for existing types.
license: Apache-2.0
metadata:
  author: live-wiki
  version: "1.0"
  scope: [root]
  auto_invoke: "Extending an existing entity type"
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, WebFetch, WebSearch, Task
---

## When to Use

Use this skill when:
- Adding a new field to an existing type (e.g., adding `age` to `character`).
- Changing the validation rules of a field (e.g., making a field required).
- Refactoring the structure of a field (e.g., converting a list of strings to a list of objects).
- Ensuring backward compatibility with existing content.

## Critical Patterns

### 1. Backward Compatibility
- **New Required Fields**: If you add a required field, you **MUST** either provide a default value in the validator or update ALL existing files of that type in `content/`.
- **Breaking Changes**: If a change breaks existing content, prefer making the new field optional first, then migrate data, then make it required.

### 2. TDD for Regression
1.  **Tests First**: Add a new test case to `tests/lore-linter-schema.spec.ts` using fixtures that represent the new structure.
2.  **Validate Existing**: Ensure that existing "valid" fixtures STILL pass after your changes.
3.  **Refactor**: Implement the change in `packages/lore-linter/src/schema-validation.ts`.

### 3. Impact Checklist
- **LORE_SCHEMA.md**: Document the new field/change.
- **Templates**: Update the corresponding template in `templates/`.
- **Content Migration**: Check if existing entities need manual updates to pass validation.
- **Lore/Skill Docs**: If schema semantics changed, update `AGENTS-LORE.md` and `skills/content-creator/SKILL.md`.
- **Skill Sync**: If any skill file changed, run `bash ./skills/skill-sync/assets/sync.sh`.

## Workflow

1.  **Analyze**: Identify the type and fields to be modified. Check how many existing entities are affected.
2.  **Test**: Add failing test cases to `tests/lore-linter-schema.spec.ts`.
3.  **Implement**: Modify `packages/lore-linter/src/schema-validation.ts`.
4.  **Update Docs**: Reflect changes in `packages/lore-linter/LORE_SCHEMA.md`, `templates/`, and (if behavior changed) `AGENTS-LORE.md` + `skills/content-creator/SKILL.md`.
5.  **Sync Skills**: Run `bash ./skills/skill-sync/assets/sync.sh` when skill docs were modified.
6.  **Migrate**: Update existing `.md` files in `content/` if necessary.
7.  **Verify**: Run `pnpm wiki:check` and `pnpm verify`.

## Code Examples

### Adding an optional field
```typescript
// packages/lore-linter/src/schema-validation.ts

const validateCharacterFields = (context: SchemaContext): void => {
  // ...
  // Adding a new optional string field 'clan'
  validateOptionalStringFields(context, context.data, ['clan'], 'character');
};
```

### Changing a structure (e.g., making a field required)
```typescript
// 1. Add to required list
const requiredStringFieldsByType: Partial<Record<string, string[]>> = {
  character: ['id', 'name', 'new_required_field'], 
};

// 2. Update existing content to avoid 'pnpm wiki:check' failures.
```

## Commands

```bash
# Validate lore and check for regressions
pnpm wiki:check

# Run tests and build to ensure nothing broke
pnpm verify
```

## Final Checklist

- [ ] Added/updated test cases in `tests/lore-linter-schema.spec.ts`.
- [ ] Updated `packages/lore-linter/src/schema-validation.ts`.
- [ ] Updated `packages/lore-linter/LORE_SCHEMA.md`.
- [ ] Updated `templates/[type].md`.
- [ ] Updated `AGENTS-LORE.md` when lore-authoring rules changed.
- [ ] Updated `skills/content-creator/SKILL.md` when supported fields/types changed.
- [ ] Ran `bash ./skills/skill-sync/assets/sync.sh` after skill edits.
- [ ] Verified/Migrated existing content in `content/`.
- [ ] Ran `pnpm verify` and all checks pass.

## Resources

- **Linter Source**: `packages/lore-linter/src/schema-validation.ts`
- **Schema Reference**: `packages/lore-linter/LORE_SCHEMA.md`
- **Existing Content**: `content/`
