import path from 'node:path';
import { describe, expect, it } from 'vitest';

type SchemaError = import('../packages/lore-linter/src/schema-validation').SchemaError;
type LoreLinter = typeof import('../packages/lore-linter/src/index');

const loadLoreLinter = async (): Promise<LoreLinter> => {
  return await import('../packages/lore-linter/src/index');
};

const sortSchemaErrors = (errors: SchemaError[]): SchemaError[] => {
  return [...errors].sort((a, b) => {
    const keyA = `${a.type}:${a.id ?? 'none'}:${a.field}:${a.reason}`;
    const keyB = `${b.type}:${b.id ?? 'none'}:${b.field}:${b.reason}`;
    return keyA.localeCompare(keyB);
  });
};

describe('lore-linter schema minimum', () => {
  it('reports missing required fields and invalid shapes per type', async () => {
    const fixturesDir = path.resolve(
      import.meta.dirname,
      '..',
      'packages',
      'lore-linter',
      'test',
      'fixtures',
      'schema-invalid',
    );
    const { scanLoreDirectory } = await loadLoreLinter();

    const report = await scanLoreDirectory(fixturesDir);

    const expected: SchemaError[] = [
      {
        type: 'character',
        id: 'missing-name',
        field: 'name',
        reason: 'required',
      },
      {
        type: 'character',
        id: 'invalid-related-shape',
        field: 'related_mystery',
        reason: 'invalid-shape',
      },
      {
        type: 'element',
        id: 'element-missing-name',
        field: 'name',
        reason: 'required',
      },
      {
        type: 'place',
        id: null,
        field: 'id',
        reason: 'required',
      },
      {
        type: 'mechanic',
        id: null,
        field: 'id',
        reason: 'required',
      },
      {
        type: 'planet',
        id: 'missing-name',
        field: 'name',
        reason: 'required',
      },
      {
        type: 'event',
        id: 'missing-title',
        field: 'title',
        reason: 'required',
      },
      {
        type: 'event',
        id: 'missing-who',
        field: 'who',
        reason: 'required',
      },
      {
        type: 'event',
        id: 'invalid-who-shape',
        field: 'who',
        reason: 'invalid-shape',
      },
      {
        type: 'card',
        id: 'missing-card-name',
        field: 'name',
        reason: 'required',
      },
    ];

    expect(sortSchemaErrors(report.schemaErrors)).toEqual(sortSchemaErrors(expected));
  });

  it('reports invalid event dates', async () => {
    const fixturesDir = path.resolve(
      import.meta.dirname,
      '..',
      'packages',
      'lore-linter',
      'test',
      'fixtures',
      'schema-invalid-dates',
    );
    const { scanLoreDirectory } = await loadLoreLinter();

    const report = await scanLoreDirectory(fixturesDir);

    const expected: SchemaError[] = [
      {
        type: 'event',
        id: 'invalid-date-day',
        field: 'date',
        reason: 'invalid-date',
      },
      {
        type: 'event',
        id: 'invalid-date-month',
        field: 'date',
        reason: 'invalid-date',
      },
      {
        type: 'event',
        id: 'invalid-date-slash',
        field: 'date',
        reason: 'invalid-date',
      },
    ];

    expect(sortSchemaErrors(report.schemaErrors)).toEqual(sortSchemaErrors(expected));
  });

  it('reports invalid character dates', async () => {
    const fixturesDir = path.resolve(
      import.meta.dirname,
      '..',
      'packages',
      'lore-linter',
      'test',
      'fixtures',
      'schema-character-dates-invalid',
    );
    const { scanLoreDirectory } = await loadLoreLinter();

    const report = await scanLoreDirectory(fixturesDir);

    const expected: SchemaError[] = [
      {
        type: 'character',
        id: 'born-invalid-format',
        field: 'born',
        reason: 'invalid-date',
      },
      {
        type: 'character',
        id: 'died-invalid-format',
        field: 'died',
        reason: 'invalid-date',
      },
      {
        type: 'character',
        id: 'died-before-born',
        field: 'died',
        reason: 'invalid-date',
      },
    ];

    expect(sortSchemaErrors(report.schemaErrors)).toEqual(sortSchemaErrors(expected));
  });

  it('accepts valid character born/died dates', async () => {
    const fixturesDir = path.resolve(
      import.meta.dirname,
      '..',
      'packages',
      'lore-linter',
      'test',
      'fixtures',
      'schema-character-dates-valid',
    );
    const { scanLoreDirectory } = await loadLoreLinter();

    const report = await scanLoreDirectory(fixturesDir);

    expect(report.schemaErrors).toEqual([]);
  });

  it('reports invalid character affinity references', async () => {
    const fixturesDir = path.resolve(
      import.meta.dirname,
      '..',
      'packages',
      'lore-linter',
      'test',
      'fixtures',
      'schema-character-affinity-invalid',
    );
    const { scanLoreDirectory } = await loadLoreLinter();

    const report = await scanLoreDirectory(fixturesDir);

    const expected: SchemaError[] = [
      {
        type: 'character',
        id: 'affinity-invalid-shape',
        field: 'affinity',
        reason: 'invalid-shape',
      },
      {
        type: 'character',
        id: 'affinity-invalid-type',
        field: 'affinity',
        reason: 'invalid-reference',
      },
    ];

    expect(sortSchemaErrors(report.schemaErrors)).toEqual(sortSchemaErrors(expected));
  });

  it('accepts optional character affinity', async () => {
    const fixturesDir = path.resolve(
      import.meta.dirname,
      '..',
      'packages',
      'lore-linter',
      'test',
      'fixtures',
      'schema-character-affinity-valid',
    );
    const { scanLoreDirectory } = await loadLoreLinter();

    const report = await scanLoreDirectory(fixturesDir);

    expect(report.schemaErrors).toEqual([]);
  });

  it('accepts valid minimum schemas', async () => {
    const fixturesDir = path.resolve(
      import.meta.dirname,
      '..',
      'packages',
      'lore-linter',
      'test',
      'fixtures',
      'schema-minimum',
    );
    const { scanLoreDirectory } = await loadLoreLinter();

    const report = await scanLoreDirectory(fixturesDir);

    expect(report.schemaErrors).toEqual([]);
  });
});

describe('lore-linter schema image', () => {
  it('reports invalid image fields', async () => {
    const fixturesDir = path.resolve(
      import.meta.dirname,
      '..',
      'packages',
      'lore-linter',
      'test',
      'fixtures',
      'schema-image-invalid',
    );
    const { scanLoreDirectory } = await loadLoreLinter();

    const report = await scanLoreDirectory(fixturesDir);

    const expected: SchemaError[] = [
      {
        type: 'character',
        id: 'character-image-empty',
        field: 'image',
        reason: 'invalid-value',
      },
      {
        type: 'character',
        id: 'character-image-not-string',
        field: 'image',
        reason: 'invalid-shape',
      },
      {
        type: 'element',
        id: 'element-image-not-string',
        field: 'image',
        reason: 'invalid-shape',
      },
      {
        type: 'event',
        id: 'event-image-not-string',
        field: 'image',
        reason: 'invalid-shape',
      },
      {
        type: 'place',
        id: 'place-image-not-string',
        field: 'image',
        reason: 'invalid-shape',
      },
      {
        type: 'planet',
        id: 'planet-image-not-string',
        field: 'image',
        reason: 'invalid-shape',
      },
    ];

    expect(sortSchemaErrors(report.schemaErrors)).toEqual(sortSchemaErrors(expected));
  });

  it('accepts valid image fields per type', async () => {
    const fixturesDir = path.resolve(
      import.meta.dirname,
      '..',
      'packages',
      'lore-linter',
      'test',
      'fixtures',
      'schema-image-valid',
    );
    const { scanLoreDirectory } = await loadLoreLinter();

    const report = await scanLoreDirectory(fixturesDir);

    expect(report.schemaErrors).toEqual([]);
  });
});

describe('lore-linter card schema', () => {
  it('reports card elements and represents validation errors', async () => {
    const fixturesDir = path.resolve(
      import.meta.dirname,
      '..',
      'packages',
      'lore-linter',
      'test',
      'fixtures',
      'cards-invalid',
    );
    const { scanLoreDirectory } = await loadLoreLinter();

    const report = await scanLoreDirectory(fixturesDir);

    const expected: SchemaError[] = [
      {
        type: 'card',
        id: 'missing-elements',
        field: 'elements',
        reason: 'required',
      },
      {
        type: 'card',
        id: 'one-element',
        field: 'elements',
        reason: 'invalid-length',
      },
      {
        type: 'card',
        id: 'three-elements',
        field: 'elements',
        reason: 'invalid-length',
      },
      {
        type: 'card',
        id: 'represents-element',
        field: 'represents',
        reason: 'invalid-reference',
      },
    ];

    expect(sortSchemaErrors(report.schemaErrors)).toEqual(sortSchemaErrors(expected));
  });

  it('accepts valid cards with duplicate elements and optional represents', async () => {
    const fixturesDir = path.resolve(
      import.meta.dirname,
      '..',
      'packages',
      'lore-linter',
      'test',
      'fixtures',
      'cards-valid',
    );
    const { scanLoreDirectory } = await loadLoreLinter();

    const report = await scanLoreDirectory(fixturesDir);

    expect(report.schemaErrors).toEqual([]);
  });
});
