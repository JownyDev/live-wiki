import { describe, expect, it } from 'vitest';
import {
  createTempBaseDirWithSearchFixtures,
  type SearchFixtures,
} from './_utils/fixtures';

type SearchIndexEntry = {
  type: string;
  id: string;
  title: string;
  href: string;
  text: string;
};

type SearchModule = {
  buildSearchIndex: (baseDir?: string) => Promise<SearchIndexEntry[]>;
  searchIndex: (query: string, index: SearchIndexEntry[]) => SearchIndexEntry[];
};

const loadSearchModule = async (): Promise<SearchModule> => {
  return await import('../src/lib/content/search');
};

const searchFixtures: SearchFixtures = {
  characters: ['lira-vox.md', 'tovin-ash.md'],
  events: ['glow-harvest.md'],
  places: ['cinder-dock.md'],
  planets: ['varda-prime.md'],
  elements: ['ember-shard.md'],
  mechanics: ['flux-weave.md'],
  cards: ['prism-ward.md'],
};

describe('content/search index', () => {
  it('buildSearchIndex returns stable ordered entries with title and href', async () => {
    const baseDir = await createTempBaseDirWithSearchFixtures(searchFixtures);
    const { buildSearchIndex } = await loadSearchModule();

    const index = await buildSearchIndex(baseDir);

    expect(index.map((entry) => `${entry.type}:${entry.id}`)).toEqual([
      'card:prism-ward',
      'character:lira-vox',
      'character:tovin-ash',
      'element:ember-shard',
      'event:glow-harvest',
      'mechanic:flux-weave',
      'place:cinder-dock',
      'planet:varda-prime',
    ]);

    const eventEntry = index.find(
      (entry) => entry.type === 'event' && entry.id === 'glow-harvest',
    );
    expect(eventEntry).toBeDefined();
    if (!eventEntry) {
      throw new Error('Expected event entry');
    }
    expect(eventEntry.title).toBe('Glow Harvest');
    expect(eventEntry.href).toBe('/events/glow-harvest');
  });

  it('buildSearchIndex includes markdown body as plain text', async () => {
    const baseDir = await createTempBaseDirWithSearchFixtures(searchFixtures);
    const { buildSearchIndex } = await loadSearchModule();

    const index = await buildSearchIndex(baseDir);

    const eventEntry = index.find(
      (entry) => entry.type === 'event' && entry.id === 'glow-harvest',
    );
    expect(eventEntry).toBeDefined();
    if (!eventEntry) {
      throw new Error('Expected event entry');
    }
    expect(eventEntry.text).toContain('glow-harvest');
    expect(eventEntry.text).toContain('Glow Harvest');
    expect(eventEntry.text).toContain('signal flickers near Cinder Gate');
    expect(eventEntry.text).not.toContain('#');
    expect(eventEntry.text).not.toContain('](https://example.com)');
  });
});

describe('content/search query', () => {
  it('returns empty results for blank queries', async () => {
    const baseDir = await createTempBaseDirWithSearchFixtures(searchFixtures);
    const { buildSearchIndex, searchIndex } = await loadSearchModule();

    const index = await buildSearchIndex(baseDir);

    expect(searchIndex('', index)).toEqual([]);
    expect(searchIndex('   ', index)).toEqual([]);
  });

  it('finds matches in id, title, and markdown body text', async () => {
    const baseDir = await createTempBaseDirWithSearchFixtures(searchFixtures);
    const { buildSearchIndex, searchIndex } = await loadSearchModule();

    const index = await buildSearchIndex(baseDir);

    expect(searchIndex('tovin-ash', index).map((entry) => `${entry.type}:${entry.id}`)).toEqual([
      'character:tovin-ash',
    ]);
    expect(searchIndex('Glow Harvest', index).map((entry) => `${entry.type}:${entry.id}`)).toEqual([
      'event:glow-harvest',
    ]);
    expect(searchIndex('lanterns', index).map((entry) => `${entry.type}:${entry.id}`)).toEqual([
      'place:cinder-dock',
    ]);
  });

  it('ignores case and extra whitespace and keeps a stable order', async () => {
    const baseDir = await createTempBaseDirWithSearchFixtures(searchFixtures);
    const { buildSearchIndex, searchIndex } = await loadSearchModule();

    const index = await buildSearchIndex(baseDir);

    expect(searchIndex('  glow  ', index).map((entry) => `${entry.type}:${entry.id}`)).toEqual([
      'event:glow-harvest',
    ]);

    const lower = searchIndex('ember', index).map((entry) => `${entry.type}:${entry.id}`);
    const upper = searchIndex('EMBER', index).map((entry) => `${entry.type}:${entry.id}`);

    expect(upper).toEqual(lower);
    expect(lower).toEqual([
      'card:prism-ward',
      'character:tovin-ash',
      'element:ember-shard',
    ]);
  });
});
