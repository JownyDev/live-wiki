import path from 'node:path';
import { describe, expect, it } from 'vitest';

type DuplicateId = {
  type: string;
  id: string;
  paths: string[];
};

type LintReport = {
  duplicateIds: DuplicateId[];
};

const loadLoreLinter = async (): Promise<{
  scanLoreDirectory: (baseDir: string) => Promise<LintReport>;
}> => {
  return await import('../packages/lore-linter/src/index');
};

describe('lore-linter duplicate ids', () => {
  it('reports a single duplicate character id with both paths', async () => {
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

    expect(report.duplicateIds).toHaveLength(1);
    const [duplicate] = report.duplicateIds;
    expect(duplicate.type).toBe('character');
    expect(duplicate.id).toBe('kael-nyx');
    expect(Array.isArray(duplicate.paths)).toBe(true);
    expect(duplicate.paths).toHaveLength(2);
    const expectedPaths = [
      path.join(fixturesDir, 'characters', 'kael-nyx.md'),
      path.join(fixturesDir, 'characters', 'kael-nyx-duplicate.md'),
    ].sort();
    expect([...duplicate.paths].sort()).toEqual(expectedPaths);
  });
});
