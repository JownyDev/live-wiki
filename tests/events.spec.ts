import { describe, expect, it } from 'vitest';
import { createTempBaseDirWithEventFixtures } from './_utils/fixtures';

const loadEventsModule = async (): Promise<{
  listEvents: (
    baseDir?: string,
  ) => Promise<Array<{ id: string; title: string; date: string }>>;
  getEventById: (
    id: string,
    baseDir?: string,
  ) => Promise<
    | { id: string; title: string; date: string; who: string[]; body: string }
    | null
  >;
}> => {
  return await import('../src/lib/content/events');
};

describe('content/events contract', () => {
  it('listEvents returns only the valid event', async () => {
    const baseDir = await createTempBaseDirWithEventFixtures(['first-contact.md']);
    const { listEvents } = await loadEventsModule();

    await expect(listEvents(baseDir)).resolves.toEqual([
      { id: 'first-contact', title: 'First Contact', date: '2023-07-19' },
    ]);
  });

  it('getEventById("first-contact") returns id, title, date, who and markdown body', async () => {
    const baseDir = await createTempBaseDirWithEventFixtures(['first-contact.md']);
    const { getEventById } = await loadEventsModule();

    const result = await getEventById('first-contact', baseDir);
    expect(result).not.toBeNull();
    if (!result) {
      throw new Error('Expected event');
    }
    expect(result).toMatchObject({
      id: 'first-contact',
      title: 'First Contact',
      date: '2023-07-19',
      who: ['character:kael-nyx'],
    });
    expect(result.body).toContain('edge of the nebula');
  });

  it('getEventById("no-existe") returns null when the file does not exist', async () => {
    const baseDir = await createTempBaseDirWithEventFixtures(['first-contact.md']);
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
});
