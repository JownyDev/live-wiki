import { describe, expect, it } from 'vitest';
import { createTempBaseDirWithEventByCharacterFixtures } from './_utils/fixtures';

type EventListItem = { id: string; title: string; date: string };

type EventsByCharacterQuery = {
  listEventsByCharacterId: (
    characterId: string,
    baseDir?: string,
  ) => Promise<EventListItem[]>;
};

const loadEventsModule = async (): Promise<EventsByCharacterQuery> => {
  return await import('../src/lib/content/events');
};

describe('content/events by character query', () => {
  it('returns only the events that include the character, ordered by date asc', async () => {
    const baseDir = await createTempBaseDirWithEventByCharacterFixtures([
      'alpha-sighting.md',
      'relay-run.md',
      'silent-interval.md',
    ]);
    const { listEventsByCharacterId } = await loadEventsModule();

    const result = await listEventsByCharacterId('kael-nyx', baseDir);

    expect(result).toEqual([
      { id: 'relay-run', title: 'Relay Run', date: '2023-05-10' },
      { id: 'alpha-sighting', title: 'Alpha Sighting', date: '2024-01-03' },
    ]);
  });

  it('returns an empty list when the character does not appear in any event', async () => {
    const baseDir = await createTempBaseDirWithEventByCharacterFixtures([
      'alpha-sighting.md',
      'relay-run.md',
      'silent-interval.md',
    ]);
    const { listEventsByCharacterId } = await loadEventsModule();

    await expect(listEventsByCharacterId('ghost-id', baseDir)).resolves.toEqual([]);
  });
});
