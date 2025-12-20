import { describe, expect, it } from 'vitest';
import { createTempBaseDirWithPlaceFixtures } from './_utils/fixtures';

const loadPlacesModule = async (): Promise<{
  listPlaces: (
    baseDir?: string,
  ) => Promise<Array<{ id: string; name: string }>>;
  getPlaceById: (
    id: string,
    baseDir?: string,
  ) => Promise<{ id: string; name: string; body: string } | null>;
}> => {
  return (await import('../src/lib/content/places')) as {
    listPlaces: (
      baseDir?: string,
    ) => Promise<Array<{ id: string; name: string }>>;
    getPlaceById: (
      id: string,
      baseDir?: string,
    ) => Promise<{ id: string; name: string; body: string } | null>;
  };
};

describe('content/places contract', () => {
  it('listPlaces returns only the valid place', async () => {
    const baseDir = await createTempBaseDirWithPlaceFixtures(['haven-docks.md']);
    const { listPlaces } = await loadPlacesModule();

    await expect(listPlaces(baseDir)).resolves.toEqual([
      { id: 'haven-docks', name: 'Haven Docks' },
    ]);
  });

  it('getPlaceById("haven-docks") returns id, name and markdown body', async () => {
    const baseDir = await createTempBaseDirWithPlaceFixtures(['haven-docks.md']);
    const { getPlaceById } = await loadPlacesModule();

    const result = await getPlaceById('haven-docks', baseDir);
    expect(result).not.toBeNull();
    if (!result) {
      throw new Error('Expected place');
    }
    expect(result).toMatchObject({
      id: 'haven-docks',
      name: 'Haven Docks',
    });
    expect(result.body).toContain('basalt shelf');
  });

  it('getPlaceById("no-existe") returns null when the file does not exist', async () => {
    const baseDir = await createTempBaseDirWithPlaceFixtures(['haven-docks.md']);
    const { getPlaceById } = await loadPlacesModule();

    await expect(getPlaceById('no-existe', baseDir)).resolves.toBeNull();
  });

  it('listPlaces throws if it finds a markdown with an incorrect type', async () => {
    const baseDir = await createTempBaseDirWithPlaceFixtures(['invalid-wrong-type.md']);
    const { listPlaces } = await loadPlacesModule();

    await expect(listPlaces(baseDir)).rejects.toThrow();
  });

  it('listPlaces throws if it finds a markdown missing name', async () => {
    const baseDir = await createTempBaseDirWithPlaceFixtures(['invalid-missing-name.md']);
    const { listPlaces } = await loadPlacesModule();

    await expect(listPlaces(baseDir)).rejects.toThrow();
  });

  it('listPlaces throws if it finds a markdown missing id', async () => {
    const baseDir = await createTempBaseDirWithPlaceFixtures(['invalid-missing-id.md']);
    const { listPlaces } = await loadPlacesModule();

    await expect(listPlaces(baseDir)).rejects.toThrow();
  });
});
