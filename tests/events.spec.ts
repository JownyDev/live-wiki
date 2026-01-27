import { describe, expect, it } from 'vitest';
import { createTempBaseDirWithEventFixtures } from './_utils/fixtures';

type EventParticipant = { character: string };

const loadEventsModule = async (): Promise<{
  listEvents: (
    baseDir?: string,
  ) => Promise<Array<{ id: string; title: string; date: string }>>;
  getEventById: (
    id: string,
    baseDir?: string,
  ) => Promise<
    | {
        id: string;
        title: string;
        date: string;
        who: EventParticipant[];
        locations: string[];
        body: string;
      }
    | null
  >;
}> => {
  return (await import('../src/lib/content/events')) as unknown as {
    listEvents: (
      baseDir?: string,
    ) => Promise<Array<{ id: string; title: string; date: string }>>;
    getEventById: (
      id: string,
      baseDir?: string,
    ) => Promise<
      | {
          id: string;
          title: string;
          date: string;
          who: EventParticipant[];
          locations: string[];
          body: string;
        }
      | null
    >;
  };
};

describe('content/events contract', () => {
  it('listEvents returns only the valid event', async () => {
    const baseDir = await createTempBaseDirWithEventFixtures(['first-contact.md']);
    const { listEvents } = await loadEventsModule();

    await expect(listEvents(baseDir)).resolves.toEqual([
      {
        id: 'first-contact',
        title: 'First Contact',
        date: '2023-07-19',
        preview: 'The crew encountered the signal at the edge of the nebula.',
      },
    ]);
  });

  it('getEventById("signal-rift") returns id, title, date, who, locations and markdown body', async () => {
    const baseDir = await createTempBaseDirWithEventFixtures(['signal-rift.md']);
    const { getEventById } = await loadEventsModule();

    const result = await getEventById('signal-rift', baseDir);
    expect(result).not.toBeNull();
    if (!result) {
      throw new Error('Expected event');
    }
    expect(result).toMatchObject({
      id: 'signal-rift',
      title: 'Signal Rift',
      date: '2025-02-11',
      who: [{ character: 'kael-nyx' }, { character: 'nyara-astral' }],
      locations: ['place:puerto-ceniza', 'space:Órbita exterior', 'unknown'],
    });
    expect(result.body).toContain('fissure of static');
  });

  it('getEventById("no-existe") returns null when the file does not exist', async () => {
    const baseDir = await createTempBaseDirWithEventFixtures(['signal-rift.md']);
    const { getEventById } = await loadEventsModule();

    await expect(getEventById('no-existe', baseDir)).resolves.toBeNull();
  });

  it('listEvents throws if it finds a markdown with an incorrect type', async () => {
    const baseDir = await createTempBaseDirWithEventFixtures([
      'invalid-wrong-type.md',
    ]);
    const { listEvents } = await loadEventsModule();

    await expect(listEvents(baseDir)).rejects.toThrow();
  });

  it('listEvents throws if it finds a markdown missing id', async () => {
    const baseDir = await createTempBaseDirWithEventFixtures([
      'invalid-missing-id.md',
    ]);
    const { listEvents } = await loadEventsModule();

    await expect(listEvents(baseDir)).rejects.toThrow();
  });

  it('listEvents throws if it finds a markdown missing title', async () => {
    const baseDir = await createTempBaseDirWithEventFixtures([
      'invalid-missing-title.md',
    ]);
    const { listEvents } = await loadEventsModule();

    await expect(listEvents(baseDir)).rejects.toThrow();
  });

  it('listEvents throws if it finds a markdown with invalid date', async () => {
    const baseDir = await createTempBaseDirWithEventFixtures(['invalid-date.md']);
    const { listEvents } = await loadEventsModule();

    await expect(listEvents(baseDir)).rejects.toThrow();
  });

  it('listEvents throws if it finds a markdown with invalid who shape', async () => {
    const baseDir = await createTempBaseDirWithEventFixtures(['invalid-who.md']);
    const { listEvents } = await loadEventsModule();

    await expect(listEvents(baseDir)).rejects.toThrow();
  });

  it('listEvents throws if it finds a markdown with invalid locations', async () => {
    const baseDir = await createTempBaseDirWithEventFixtures(['invalid-locations.md']);
    const { listEvents } = await loadEventsModule();

    await expect(listEvents(baseDir)).rejects.toThrow();
  });
});
