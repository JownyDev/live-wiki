import { describe, expect, it } from 'vitest';
import { createTempBaseDirWithMechanicFixtures } from './_utils/fixtures';

const loadMechanicsModule = async (): Promise<{
  listMechanics: (
    baseDir?: string,
  ) => Promise<Array<{ id: string; name: string }>>;
  getMechanicById: (
    id: string,
    baseDir?: string,
  ) => Promise<{ id: string; name: string; body: string } | null>;
}> => {
  return (await import('../src/lib/content/mechanics')) as {
    listMechanics: (
      baseDir?: string,
    ) => Promise<Array<{ id: string; name: string }>>;
    getMechanicById: (
      id: string,
      baseDir?: string,
    ) => Promise<{ id: string; name: string; body: string } | null>;
  };
};

describe('content/mechanics contract', () => {
  it('listMechanics returns mechanics ordered by id', async () => {
    const baseDir = await createTempBaseDirWithMechanicFixtures([
      'drift-gate.md',
      'chrono-loop.md',
    ]);
    const { listMechanics } = await loadMechanicsModule();

    await expect(listMechanics(baseDir)).resolves.toEqual([
      { id: 'chrono-loop', name: 'Chrono Loop' },
      { id: 'drift-gate', name: 'Drift Gate' },
    ]);
  });

  it('getMechanicById("chrono-loop") returns id, name and markdown body', async () => {
    const baseDir = await createTempBaseDirWithMechanicFixtures(['chrono-loop.md']);
    const { getMechanicById } = await loadMechanicsModule();

    const result = await getMechanicById('chrono-loop', baseDir);
    expect(result).not.toBeNull();
    if (!result) {
      throw new Error('Expected mechanic');
    }
    expect(result).toMatchObject({
      id: 'chrono-loop',
      name: 'Chrono Loop',
    });
    expect(result.body).toContain('Time snaps back');
  });

  it('getMechanicById("no-existe") returns null when the file does not exist', async () => {
    const baseDir = await createTempBaseDirWithMechanicFixtures(['chrono-loop.md']);
    const { getMechanicById } = await loadMechanicsModule();

    await expect(getMechanicById('no-existe', baseDir)).resolves.toBeNull();
  });

  it('listMechanics throws if it finds a markdown missing type', async () => {
    const baseDir = await createTempBaseDirWithMechanicFixtures([
      'invalid-missing-type.md',
    ]);
    const { listMechanics } = await loadMechanicsModule();

    await expect(listMechanics(baseDir)).rejects.toThrow();
  });

  it('listMechanics throws if it finds a markdown with an incorrect type', async () => {
    const baseDir = await createTempBaseDirWithMechanicFixtures([
      'invalid-wrong-type.md',
    ]);
    const { listMechanics } = await loadMechanicsModule();

    await expect(listMechanics(baseDir)).rejects.toThrow();
  });

  it('listMechanics throws if it finds a markdown missing name', async () => {
    const baseDir = await createTempBaseDirWithMechanicFixtures([
      'invalid-missing-name.md',
    ]);
    const { listMechanics } = await loadMechanicsModule();

    await expect(listMechanics(baseDir)).rejects.toThrow();
  });

  it('listMechanics throws if it finds a markdown missing id', async () => {
    const baseDir = await createTempBaseDirWithMechanicFixtures([
      'invalid-missing-id.md',
    ]);
    const { listMechanics } = await loadMechanicsModule();

    await expect(listMechanics(baseDir)).rejects.toThrow();
  });
});
