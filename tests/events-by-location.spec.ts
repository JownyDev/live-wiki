import { describe, expect, it } from 'vitest';
import { createTempBaseDirWithEventByLocationFixtures } from './_utils/fixtures';

type EventListItem = { id: string; title: string; date: string };

type EventsByLocationQuery = {
  listEventsByPlaceId: (
    placeId: string,
    baseDir?: string,
  ) => Promise<EventListItem[]>;
  listEventsByPlanetId: (
    planetId: string,
    baseDir?: string,
  ) => Promise<EventListItem[]>;
};

const loadEventsModule = async (): Promise<EventsByLocationQuery> => {
  return await import('../src/lib/content/events');
};

describe('content/events by location queries', () => {
  const eventFixtures = [
    'aurora-summit.md',
    'borealis-skirmish.md',
    'deep-space-drift.md',
    'double-sighting.md',
    'market-uprising.md',
    'plaza-accord.md',
  ] as const;
  const placeFixtures = [
    'drifter-hub.md',
    'harbor-south.md',
    'rift-outpost.md',
    'skyline-plaza.md',
  ] as const;
  const planetFixtures = ['aurora.md', 'borealis.md', 'cinder.md'] as const;

  it('returns events by place id ordered by date asc', async () => {
    const baseDir = await createTempBaseDirWithEventByLocationFixtures(
      eventFixtures,
      placeFixtures,
      planetFixtures,
    );
    const { listEventsByPlaceId } = await loadEventsModule();

    const result = await listEventsByPlaceId('harbor-south', baseDir);

    expect(result).toEqual([
      { id: 'double-sighting', title: 'Double Sighting', date: '2024-01-20' },
      { id: 'market-uprising', title: 'Market Uprising', date: '2024-03-01' },
    ]);
  });

  it('returns an empty list when no event references the place', async () => {
    const baseDir = await createTempBaseDirWithEventByLocationFixtures(
      eventFixtures,
      placeFixtures,
      planetFixtures,
    );
    const { listEventsByPlaceId } = await loadEventsModule();

    await expect(listEventsByPlaceId('drifter-hub', baseDir)).resolves.toEqual([]);
  });

  it('returns events by planet id, including derived places without duplicates', async () => {
    const baseDir = await createTempBaseDirWithEventByLocationFixtures(
      eventFixtures,
      placeFixtures,
      planetFixtures,
    );
    const { listEventsByPlanetId } = await loadEventsModule();

    const result = await listEventsByPlanetId('aurora', baseDir);

    expect(result).toEqual([
      { id: 'plaza-accord', title: 'Plaza Accord', date: '2023-12-15' },
      { id: 'double-sighting', title: 'Double Sighting', date: '2024-01-20' },
      { id: 'aurora-summit', title: 'Aurora Summit', date: '2024-02-05' },
      { id: 'market-uprising', title: 'Market Uprising', date: '2024-03-01' },
    ]);
  });

  it('returns an empty list when the planet has no related events', async () => {
    const baseDir = await createTempBaseDirWithEventByLocationFixtures(
      eventFixtures,
      placeFixtures,
      planetFixtures,
    );
    const { listEventsByPlanetId } = await loadEventsModule();

    await expect(listEventsByPlanetId('cinder', baseDir)).resolves.toEqual([]);
  });
});
