import path from 'node:path';
import { describe, expect, it } from 'vitest';

type DuplicateId = import('../packages/lore-linter/src/duplicates').DuplicateId;
type LoreLinter = typeof import('../packages/lore-linter/src/index');

const loadLoreLinter = async (): Promise<LoreLinter> => {
  return await import('../packages/lore-linter/src/index');
};

describe('lore-linter duplicate ids', () => {
  const getDuplicateMessage = (duplicate: DuplicateId): string | null => {
    const value = (duplicate as Record<string, unknown>).message;
    return typeof value === 'string' ? value : null;
  };

  const expectDuplicate = (
    duplicates: Map<string, DuplicateId>,
    key: string,
    expectedPaths: string[],
  ): void => {
    const duplicate = duplicates.get(key);
    if (!duplicate) {
      throw new Error(`Missing duplicate entry for ${key}`);
    }
    expect(getDuplicateMessage(duplicate)).toBe('Duplicate id');
    expect(duplicate.paths).toHaveLength(2);
    expect([...duplicate.paths].sort()).toEqual([...expectedPaths].sort());
  };

  it('reports duplicate ids per type with message and paths', async () => {
    const fixturesDir = path.resolve(
      import.meta.dirname,
      '..',
      'packages',
      'lore-linter',
      'test',
      'fixtures',
      'duplicate-ids',
    );
    const { scanLoreDirectory } = await loadLoreLinter();

    const report = await scanLoreDirectory(fixturesDir);

    expect(report.duplicateIds).toHaveLength(2);
    const duplicates = new Map(
      report.duplicateIds.map((duplicate) => [
        `${duplicate.type}:${duplicate.id}`,
        duplicate,
      ]),
    );

    expectDuplicate(duplicates, 'character:kael-nyx', [
      path.join(fixturesDir, 'characters', 'kael-nyx.md'),
      path.join(fixturesDir, 'characters', 'kael-nyx-duplicate.md'),
    ]);
    expectDuplicate(duplicates, 'place:echo-station', [
      path.join(fixturesDir, 'places', 'echo-station.md'),
      path.join(fixturesDir, 'places', 'echo-station-duplicate.md'),
    ]);
  });

  it('ignores ids that are unique within each type', async () => {
    const fixturesDir = path.resolve(
      import.meta.dirname,
      '..',
      'packages',
      'lore-linter',
      'test',
      'fixtures',
      'unique-ids',
    );
    const { scanLoreDirectory } = await loadLoreLinter();

    const report = await scanLoreDirectory(fixturesDir);

    expect(report.duplicateIds).toEqual([]);
  });
});
