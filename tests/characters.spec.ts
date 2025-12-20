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
  ) => Promise<{ id: string; name: string; body: string } | null>;
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
    expect(result).toEqual({
      id: 'kael-nyx',
      name: 'Kael Nyx',
      body: result.body,
    });
    expect(result.body).toContain('walks the neon alleys');
  });

  it('getCharacterById("no-existe") returns null when the file does not exist', async () => {
    const baseDir = await createTempBaseDirWithCharacterFixtures(['kael-nyx.md']);
    const { getCharacterById } = await loadCharactersModule();

    await expect(getCharacterById('no-existe', baseDir)).resolves.toBeNull();
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
