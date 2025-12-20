import { describe, expect, it } from 'vitest';
import { createTempBaseDirWithPlanetFixtures } from './_utils/fixtures';

const loadPlanetsModule = async (): Promise<{
  listPlanets: (
    baseDir?: string,
  ) => Promise<Array<{ id: string; name: string }>>;
  getPlanetById: (
    id: string,
    baseDir?: string,
  ) => Promise<{ id: string; name: string; body: string } | null>;
}> => {
  return (await import('../src/lib/content/planets')) as {
    listPlanets: (
      baseDir?: string,
    ) => Promise<Array<{ id: string; name: string }>>;
    getPlanetById: (
      id: string,
      baseDir?: string,
    ) => Promise<{ id: string; name: string; body: string } | null>;
  };
};

describe('content/planets contract', () => {
  it('listPlanets returns only the valid planet', async () => {
    const baseDir = await createTempBaseDirWithPlanetFixtures(['varda-prime.md']);
    const { listPlanets } = await loadPlanetsModule();

    await expect(listPlanets(baseDir)).resolves.toEqual([
      { id: 'varda-prime', name: 'Varda Prime' },
    ]);
  });

  it('getPlanetById("varda-prime") returns id, name and markdown body', async () => {
    const baseDir = await createTempBaseDirWithPlanetFixtures(['varda-prime.md']);
    const { getPlanetById } = await loadPlanetsModule();

    const result = await getPlanetById('varda-prime', baseDir);
    expect(result).not.toBeNull();
    if (!result) {
      throw new Error('Expected planet');
    }
    expect(result).toMatchObject({
      id: 'varda-prime',
      name: 'Varda Prime',
    });
    expect(result.body).toContain('iron-red mesas');
  });

  it('getPlanetById("no-existe") returns null when the file does not exist', async () => {
    const baseDir = await createTempBaseDirWithPlanetFixtures(['varda-prime.md']);
    const { getPlanetById } = await loadPlanetsModule();

    await expect(getPlanetById('no-existe', baseDir)).resolves.toBeNull();
  });

  it('listPlanets throws if it finds a markdown with an incorrect type', async () => {
    const baseDir = await createTempBaseDirWithPlanetFixtures(['invalid-wrong-type.md']);
    const { listPlanets } = await loadPlanetsModule();

    await expect(listPlanets(baseDir)).rejects.toThrow();
  });

  it('listPlanets throws if it finds a markdown missing name', async () => {
    const baseDir = await createTempBaseDirWithPlanetFixtures(['invalid-missing-name.md']);
    const { listPlanets } = await loadPlanetsModule();

    await expect(listPlanets(baseDir)).rejects.toThrow();
  });

  it('listPlanets throws if it finds a markdown missing id', async () => {
    const baseDir = await createTempBaseDirWithPlanetFixtures(['invalid-missing-id.md']);
    const { listPlanets } = await loadPlanetsModule();

    await expect(listPlanets(baseDir)).rejects.toThrow();
  });
});
