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
  ) => Promise<{
    id: string;
    name: string;
    body: string;
    origin: string | null;
    knowledge:
      | {
          summary: string | null;
          knowsAbout: string[];
          blindspots: string[];
          canReveal: string[];
        }
      | null;
    goals:
      | {
          longTerm: string[];
          typicalPriorities: string[];
        }
      | null;
    capabilities:
      | {
          actions: Array<{
            action: string;
            triggers: string[];
            notes: string[];
            filters: string[];
          }>;
        }
      | null;
    persona:
      | {
          archetype: string | null;
          traits: string[];
          values: string[];
          taboos: string[];
          biographyHighlights: string[];
          voice: {
            tone: string | null;
            styleNotes: string[];
          } | null;
        }
      | null;
  } | null>;
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

  it('getCharacterById exposes knowledge fields when present', async () => {
    const baseDir = await createTempBaseDirWithCharacterFixtures(['knowledge-valid.md']);
    const { getCharacterById } = await loadCharactersModule();

    const result = await getCharacterById('knowledge-valid', baseDir);
    expect(result).not.toBeNull();
    if (!result) {
      throw new Error('Expected character');
    }
    expect(result.knowledge).toEqual({
      summary: 'Tracks dock schedules.',
      knowsAbout: ['night shifts'],
      blindspots: ['court politics'],
      canReveal: ['safe routes'],
    });
  });

  it('getCharacterById exposes goals fields when present', async () => {
    const baseDir = await createTempBaseDirWithCharacterFixtures(['goals-valid.md']);
    const { getCharacterById } = await loadCharactersModule();

    const result = await getCharacterById('goals-valid', baseDir);
    expect(result).not.toBeNull();
    if (!result) {
      throw new Error('Expected character');
    }
    expect(result.goals).toEqual({
      longTerm: ['Keep harbor traffic safe', 'Save for a private chartroom'],
      typicalPriorities: ['Safety', 'Reputation', 'Quiet routines'],
    });
  });

  it('getCharacterById exposes capabilities actions when present', async () => {
    const baseDir = await createTempBaseDirWithCharacterFixtures([
      'capabilities-valid.md',
    ]);
    const { getCharacterById } = await loadCharactersModule();

    const result = await getCharacterById('capabilities-valid', baseDir);
    expect(result).not.toBeNull();
    if (!result) {
      throw new Error('Expected character');
    }
    expect(result.capabilities).toEqual({
      actions: [
        {
          action: 'warn',
          triggers: ['player.threat'],
          notes: ['Issues a calm warning before escalation.'],
          filters: [],
        },
        {
          action: 'refuse_service',
          triggers: ['player.bribe'],
          notes: [],
          filters: ['Avoids refusal if harbor safety is at risk.'],
        },
      ],
    });
  });

  it('getCharacterById exposes persona fields when present', async () => {
    const baseDir = await createTempBaseDirWithCharacterFixtures(['persona-valid.md']);
    const { getCharacterById } = await loadCharactersModule();

    const result = await getCharacterById('persona-valid', baseDir);
    expect(result).not.toBeNull();
    if (!result) {
      throw new Error('Expected character');
    }
    expect(result.persona).toEqual({
      archetype: 'Harbor signal-keeper',
      traits: ['practical', 'watchful', 'soft-spoken'],
      values: ['order', 'neighbors'],
      taboos: ['false alarms'],
      biographyHighlights: ['Maintains the foghorn logs.', 'Learned codes.'],
      voice: {
        tone: 'measured',
        styleNotes: ['short clauses', 'asks for confirmation'],
      },
    });
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
