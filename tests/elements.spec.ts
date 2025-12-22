import { describe, expect, it } from 'vitest';
import { createTempBaseDirWithElementFixtures } from './_utils/fixtures';

const loadElementsModule = async (): Promise<{
  listElements: (
    baseDir?: string,
  ) => Promise<Array<{ id: string; name: string }>>;
  getElementById: (
    id: string,
    baseDir?: string,
  ) => Promise<{ id: string; name: string; body: string } | null>;
}> => {
  return (await import('../src/lib/content/elements')) as {
    listElements: (
      baseDir?: string,
    ) => Promise<Array<{ id: string; name: string }>>;
    getElementById: (
      id: string,
      baseDir?: string,
    ) => Promise<{ id: string; name: string; body: string } | null>;
  };
};

describe('content/elements contract', () => {
  it('listElements returns elements ordered by id', async () => {
    const baseDir = await createTempBaseDirWithElementFixtures([
      'flux-core.md',
      'amber-shard.md',
    ]);
    const { listElements } = await loadElementsModule();

    await expect(listElements(baseDir)).resolves.toEqual([
      { id: 'amber-shard', name: 'Amber Shard' },
      { id: 'flux-core', name: 'Flux Core' },
    ]);
  });

  it('getElementById("amber-shard") returns id, name and markdown body', async () => {
    const baseDir = await createTempBaseDirWithElementFixtures(['amber-shard.md']);
    const { getElementById } = await loadElementsModule();

    const result = await getElementById('amber-shard', baseDir);
    expect(result).not.toBeNull();
    if (!result) {
      throw new Error('Expected element');
    }
    expect(result).toMatchObject({
      id: 'amber-shard',
      name: 'Amber Shard',
    });
    expect(result.body).toContain('crystalline fragment');
  });

  it('getElementById allows empty body content', async () => {
    const baseDir = await createTempBaseDirWithElementFixtures(['flux-core.md']);
    const { getElementById } = await loadElementsModule();

    const result = await getElementById('flux-core', baseDir);
    expect(result).not.toBeNull();
    if (!result) {
      throw new Error('Expected element');
    }
    expect(result.body).toBe('');
  });

  it('getElementById("no-existe") returns null when the file does not exist', async () => {
    const baseDir = await createTempBaseDirWithElementFixtures(['amber-shard.md']);
    const { getElementById } = await loadElementsModule();

    await expect(getElementById('no-existe', baseDir)).resolves.toBeNull();
  });

  it('listElements throws if it finds a markdown with an incorrect type', async () => {
    const baseDir = await createTempBaseDirWithElementFixtures([
      'invalid-wrong-type.md',
    ]);
    const { listElements } = await loadElementsModule();

    await expect(listElements(baseDir)).rejects.toThrow();
  });

  it('listElements throws if it finds a markdown missing name', async () => {
    const baseDir = await createTempBaseDirWithElementFixtures([
      'invalid-missing-name.md',
    ]);
    const { listElements } = await loadElementsModule();

    await expect(listElements(baseDir)).rejects.toThrow();
  });

  it('listElements throws if it finds a markdown missing id', async () => {
    const baseDir = await createTempBaseDirWithElementFixtures([
      'invalid-missing-id.md',
    ]);
    const { listElements } = await loadElementsModule();

    await expect(listElements(baseDir)).rejects.toThrow();
  });
});
