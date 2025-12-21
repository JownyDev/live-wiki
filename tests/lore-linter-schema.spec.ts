import path from 'node:path';
import { describe, expect, it } from 'vitest';

type DuplicateId = {
  type: string;
  id: string;
  paths: string[];
};

type BrokenReference = {
  type: string;
  id: string;
  field: 'who' | 'locations' | 'origin' | 'planetId';
  reference: string;
};

type SchemaError = {
  type: string;
  id: string | null;
  field: string;
  reason: string;
};

type LintReport = {
  duplicateIds: DuplicateId[];
  brokenReferences: BrokenReference[];
  schemaErrors: SchemaError[];
};

const loadLoreLinter = async (): Promise<{
  scanLoreDirectory: (baseDir: string) => Promise<LintReport>;
}> => {
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
  it('reports missing required fields per type', async () => {
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
        type: 'place',
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
