import { describe, expect, it } from 'vitest';
import {
  createTempBaseDirWithCharacterFixtures,
} from './_utils/fixtures';

const loadCharactersModule = async (): Promise<{
  listCharacters: (
    baseDir?: string,
  ) => Promise<Array<{ id: string; name: string }>>;
  getCharacterById: (
    id: string,
    baseDir?: string,
  ) => Promise<{ id: string; name: string; body: string; origin: string | null } | null>;
}> => {
  return await import('../src/lib/content/characters');
};

describe('content/characters contract', () => {
  it('listCharacters returns only the valid character', async () => {
    const baseDir = await createTempBaseDirWithCharacterFixtures(['kael-nyx.md']);
    const { listCharacters } = await loadCharactersModule();

    await expect(listCharacters(baseDir)).resolves.toEqual([
      { id: 'kael-nyx', name: 'Kael Nyx' },
    ]);
  });

  it('getCharacterById("kael-nyx") returns id, name and markdown body', async () => {
    const baseDir = await createTempBaseDirWithCharacterFixtures(['kael-nyx.md']);
    const { getCharacterById } = await loadCharactersModule();

    const result = await getCharacterById('kael-nyx', baseDir);
    expect(result).not.toBeNull();
    if (!result) {
      throw new Error('Expected character');
    }
    expect(result).toMatchObject({
      id: 'kael-nyx',
      name: 'Kael Nyx',
    });
    expect(result.body).toContain('walks the neon alleys');
  });

  it('getCharacterById("no-existe") returns null when the file does not exist', async () => {
    const baseDir = await createTempBaseDirWithCharacterFixtures(['kael-nyx.md']);
    const { getCharacterById } = await loadCharactersModule();

    await expect(getCharacterById('no-existe', baseDir)).resolves.toBeNull();
  });

  it('getCharacterById exposes valid origins and allows missing or null origin', async () => {
    const baseDir = await createTempBaseDirWithCharacterFixtures([
      'origin-absent.md',
      'origin-null.md',
      'origin-place.md',
      'origin-space.md',
      'origin-unknown.md',
    ]);
    const { getCharacterById } = await loadCharactersModule();

    const fromPlace = await getCharacterById('origin-place', baseDir);
    expect(fromPlace).not.toBeNull();
    if (!fromPlace) {
      throw new Error('Expected character');
    }
    expect(fromPlace).toMatchObject({
      id: 'origin-place',
      origin: 'place:haven-docks',
    });

    const fromSpace = await getCharacterById('origin-space', baseDir);
    expect(fromSpace).not.toBeNull();
    if (!fromSpace) {
      throw new Error('Expected character');
    }
    expect(fromSpace).toMatchObject({
      id: 'origin-space',
      origin: 'space:Nebula cradle',
    });

    const fromUnknown = await getCharacterById('origin-unknown', baseDir);
    expect(fromUnknown).not.toBeNull();
    if (!fromUnknown) {
      throw new Error('Expected character');
    }
    expect(fromUnknown).toMatchObject({
      id: 'origin-unknown',
      origin: 'unknown',
    });

    const originAbsent = await getCharacterById('origin-absent', baseDir);
    expect(originAbsent).not.toBeNull();
    if (!originAbsent) {
      throw new Error('Expected character');
    }
    expect(originAbsent.origin).toBeNull();

    const originNull = await getCharacterById('origin-null', baseDir);
    expect(originNull).not.toBeNull();
    if (!originNull) {
      throw new Error('Expected character');
    }
    expect(originNull.origin).toBeNull();
  });

  it('getCharacterById throws when origin has an invalid format', async () => {
    const baseDir = await createTempBaseDirWithCharacterFixtures(['origin-invalid.md']);
    const { getCharacterById } = await loadCharactersModule();

    await expect(getCharacterById('origin-invalid', baseDir)).rejects.toThrow();
  });

  it('listCharacters throws if it finds a markdown with an incorrect type', async () => {
    const baseDir = await createTempBaseDirWithCharacterFixtures([
      'invalid-wrong-type.md',
    ]);
    const { listCharacters } = await loadCharactersModule();

    await expect(listCharacters(baseDir)).rejects.toThrow();
  });

  it('listCharacters throws if it finds a markdown missing name', async () => {
    const baseDir = await createTempBaseDirWithCharacterFixtures([
      'invalid-missing-name.md',
    ]);
    const { listCharacters } = await loadCharactersModule();

    await expect(listCharacters(baseDir)).rejects.toThrow();
  });

  it('listCharacters throws if it finds a markdown missing id', async () => {
    const baseDir = await createTempBaseDirWithCharacterFixtures([
      'invalid-missing-id.md',
    ]);
    const { listCharacters } = await loadCharactersModule();

    await expect(listCharacters(baseDir)).rejects.toThrow();
  });
});
