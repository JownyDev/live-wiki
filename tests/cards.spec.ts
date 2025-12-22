import { describe, expect, it } from 'vitest';
import { createTempBaseDirWithCardFixtures } from './_utils/fixtures';

const loadCardsModule = async (): Promise<{
  listCards: (
    baseDir?: string,
  ) => Promise<Array<{ id: string; name: string }>>;
  getCardById: (
    id: string,
    baseDir?: string,
  ) => Promise<{
    id: string;
    name: string;
    elements: string[];
    represents: string[];
    body: string;
  } | null>;
}> => {
  return (await import('../src/lib/content/cards')) as {
    listCards: (
      baseDir?: string,
    ) => Promise<Array<{ id: string; name: string }>>;
    getCardById: (
      id: string,
      baseDir?: string,
    ) => Promise<{
      id: string;
      name: string;
      elements: string[];
      represents: string[];
      body: string;
    } | null>;
  };
};

describe('content/cards contract', () => {
  const elementFixtures = ['amber-shard.md', 'flux-core.md'] as const;

  it('listCards returns cards ordered by id', async () => {
    const baseDir = await createTempBaseDirWithCardFixtures(
      ['prism-ward.md', 'ember-echo.md'],
      elementFixtures,
    );
    const { listCards } = await loadCardsModule();

    await expect(listCards(baseDir)).resolves.toEqual([
      { id: 'ember-echo', name: 'Ember Echo' },
      { id: 'prism-ward', name: 'Prism Ward' },
    ]);
  });

  it('getCardById("prism-ward") returns id, name, elements, represents and markdown body', async () => {
    const baseDir = await createTempBaseDirWithCardFixtures(
      ['prism-ward.md'],
      elementFixtures,
    );
    const { getCardById } = await loadCardsModule();

    const result = await getCardById('prism-ward', baseDir);
    expect(result).not.toBeNull();
    if (!result) {
      throw new Error('Expected card');
    }
    expect(result).toMatchObject({
      id: 'prism-ward',
      name: 'Prism Ward',
    });
    expect(result.elements).toEqual(['element:amber-shard', 'element:flux-core']);
    expect(result.represents).toEqual(['character:kael-nyx']);
    expect(result.body).toContain('bends raw light');
  });

  it('getCardById allows duplicate elements and missing represents', async () => {
    const baseDir = await createTempBaseDirWithCardFixtures(
      ['ember-echo.md'],
      elementFixtures,
    );
    const { getCardById } = await loadCardsModule();

    const result = await getCardById('ember-echo', baseDir);
    expect(result).not.toBeNull();
    if (!result) {
      throw new Error('Expected card');
    }
    expect(result.elements).toEqual(['element:amber-shard', 'element:amber-shard']);
    expect(result.represents).toEqual([]);
    expect(result.body).toContain('mirrors itself');
  });

  it('getCardById allows empty represents list', async () => {
    const baseDir = await createTempBaseDirWithCardFixtures(
      ['silent-crest.md'],
      elementFixtures,
    );
    const { getCardById } = await loadCardsModule();

    const result = await getCardById('silent-crest', baseDir);
    expect(result).not.toBeNull();
    if (!result) {
      throw new Error('Expected card');
    }
    expect(result.represents).toEqual([]);
  });

  it('getCardById("no-existe") returns null when the file does not exist', async () => {
    const baseDir = await createTempBaseDirWithCardFixtures(
      ['prism-ward.md'],
      elementFixtures,
    );
    const { getCardById } = await loadCardsModule();

    await expect(getCardById('no-existe', baseDir)).resolves.toBeNull();
  });

  it('listCards throws if it finds a markdown with an incorrect type', async () => {
    const baseDir = await createTempBaseDirWithCardFixtures(
      ['invalid-wrong-type.md'],
      elementFixtures,
    );
    const { listCards } = await loadCardsModule();

    await expect(listCards(baseDir)).rejects.toThrow();
  });

  it('listCards throws if it finds a markdown missing name', async () => {
    const baseDir = await createTempBaseDirWithCardFixtures(
      ['invalid-missing-name.md'],
      elementFixtures,
    );
    const { listCards } = await loadCardsModule();

    await expect(listCards(baseDir)).rejects.toThrow();
  });

  it('listCards throws if it finds a markdown missing id', async () => {
    const baseDir = await createTempBaseDirWithCardFixtures(
      ['invalid-missing-id.md'],
      elementFixtures,
    );
    const { listCards } = await loadCardsModule();

    await expect(listCards(baseDir)).rejects.toThrow();
  });

  it('listCards throws if it finds a markdown missing elements', async () => {
    const baseDir = await createTempBaseDirWithCardFixtures(
      ['invalid-missing-elements.md'],
      elementFixtures,
    );
    const { listCards } = await loadCardsModule();

    await expect(listCards(baseDir)).rejects.toThrow();
  });

  it('listCards throws if elements length is not 2', async () => {
    const baseDir = await createTempBaseDirWithCardFixtures(
      ['invalid-elements-length.md'],
      elementFixtures,
    );
    const { listCards } = await loadCardsModule();

    await expect(listCards(baseDir)).rejects.toThrow();
  });

  it('listCards throws if elements reference a missing element', async () => {
    const baseDir = await createTempBaseDirWithCardFixtures(
      ['invalid-elements-missing-ref.md'],
      elementFixtures,
    );
    const { listCards } = await loadCardsModule();

    await expect(listCards(baseDir)).rejects.toThrow();
  });

  it('listCards throws if represents includes an element ref', async () => {
    const baseDir = await createTempBaseDirWithCardFixtures(
      ['invalid-represents-element.md'],
      elementFixtures,
    );
    const { listCards } = await loadCardsModule();

    await expect(listCards(baseDir)).rejects.toThrow();
  });

  it('listCards throws if represents includes an unsupported prefix', async () => {
    const baseDir = await createTempBaseDirWithCardFixtures(
      ['invalid-represents-prefix.md'],
      elementFixtures,
    );
    const { listCards } = await loadCardsModule();

    await expect(listCards(baseDir)).rejects.toThrow();
  });
});
