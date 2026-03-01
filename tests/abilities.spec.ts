import { describe, expect, it } from 'vitest';
import { createTempBaseDirWithAbilityFixtures } from './_utils/fixtures';

const loadAbilitiesModule = async (): Promise<{
  listAbilities: (
    baseDir?: string,
  ) => Promise<Array<{ id: string; name: string }>>;
  listAbilitiesByCharacterId: (
    characterId: string,
    baseDir?: string,
  ) => Promise<Array<{ id: string; name: string }>>;
  getAbilityById: (
    id: string,
    baseDir?: string,
  ) => Promise<{
    id: string;
    name: string;
    relatedCharacter: string;
    body: string;
  } | null>;
}> => {
  return (await import('../src/lib/content/abilities')) as {
    listAbilities: (
      baseDir?: string,
    ) => Promise<Array<{ id: string; name: string }>>;
    listAbilitiesByCharacterId: (
      characterId: string,
      baseDir?: string,
    ) => Promise<Array<{ id: string; name: string }>>;
    getAbilityById: (
      id: string,
      baseDir?: string,
    ) => Promise<{
      id: string;
      name: string;
      relatedCharacter: string;
      body: string;
    } | null>;
  };
};

describe('content/abilities contract', () => {
  it('listAbilities returns abilities ordered by id', async () => {
    const baseDir = await createTempBaseDirWithAbilityFixtures([
      'vortice-hematomorfo.md',
      'herencia-del-ultimo-aliento.md',
    ]);
    const { listAbilities } = await loadAbilitiesModule();

    await expect(listAbilities(baseDir)).resolves.toEqual([
      { id: 'herencia-del-ultimo-aliento', name: 'Herencia del Ultimo Aliento' },
      { id: 'vortice-hematomorfo', name: 'Vortice Hematomorfo' },
    ]);
  });

  it('getAbilityById returns id, name, relatedCharacter and markdown body', async () => {
    const baseDir = await createTempBaseDirWithAbilityFixtures([
      'herencia-del-ultimo-aliento.md',
    ]);
    const { getAbilityById } = await loadAbilitiesModule();

    const result = await getAbilityById('herencia-del-ultimo-aliento', baseDir);
    expect(result).not.toBeNull();
    if (!result) {
      throw new Error('Expected ability');
    }
    expect(result).toMatchObject({
      id: 'herencia-del-ultimo-aliento',
      name: 'Herencia del Ultimo Aliento',
      relatedCharacter: 'character:protagonista',
    });
    expect(result.body).toContain('ultimo enemigo');
  });

  it('getAbilityById returns null when file does not exist', async () => {
    const baseDir = await createTempBaseDirWithAbilityFixtures([
      'herencia-del-ultimo-aliento.md',
    ]);
    const { getAbilityById } = await loadAbilitiesModule();

    await expect(getAbilityById('no-existe', baseDir)).resolves.toBeNull();
  });

  it('listAbilitiesByCharacterId returns only abilities owned by the character', async () => {
    const baseDir = await createTempBaseDirWithAbilityFixtures([
      'vortice-hematomorfo.md',
      'herencia-del-ultimo-aliento.md',
      'sello-de-rutina.md',
    ]);
    const { listAbilitiesByCharacterId } = await loadAbilitiesModule();

    await expect(listAbilitiesByCharacterId('protagonista', baseDir)).resolves.toEqual([
      { id: 'herencia-del-ultimo-aliento', name: 'Herencia del Ultimo Aliento' },
      { id: 'vortice-hematomorfo', name: 'Vortice Hematomorfo' },
    ]);
  });

  it('listAbilities throws when markdown is missing type', async () => {
    const baseDir = await createTempBaseDirWithAbilityFixtures([
      'invalid-missing-type.md',
    ]);
    const { listAbilities } = await loadAbilitiesModule();

    await expect(listAbilities(baseDir)).rejects.toThrow();
  });

  it('listAbilities throws when markdown has wrong type', async () => {
    const baseDir = await createTempBaseDirWithAbilityFixtures([
      'invalid-wrong-type.md',
    ]);
    const { listAbilities } = await loadAbilitiesModule();

    await expect(listAbilities(baseDir)).rejects.toThrow();
  });

  it('listAbilities throws when markdown is missing name', async () => {
    const baseDir = await createTempBaseDirWithAbilityFixtures([
      'invalid-missing-name.md',
    ]);
    const { listAbilities } = await loadAbilitiesModule();

    await expect(listAbilities(baseDir)).rejects.toThrow();
  });

  it('listAbilities throws when markdown is missing id', async () => {
    const baseDir = await createTempBaseDirWithAbilityFixtures([
      'invalid-missing-id.md',
    ]);
    const { listAbilities } = await loadAbilitiesModule();

    await expect(listAbilities(baseDir)).rejects.toThrow();
  });

  it('listAbilities throws when related_character is missing', async () => {
    const baseDir = await createTempBaseDirWithAbilityFixtures([
      'invalid-missing-related-character.md',
    ]);
    const { listAbilities } = await loadAbilitiesModule();

    await expect(listAbilities(baseDir)).rejects.toThrow();
  });

  it('listAbilities throws when related_character has invalid reference', async () => {
    const baseDir = await createTempBaseDirWithAbilityFixtures([
      'invalid-related-character-reference.md',
    ]);
    const { listAbilities } = await loadAbilitiesModule();

    await expect(listAbilities(baseDir)).rejects.toThrow();
  });
});
