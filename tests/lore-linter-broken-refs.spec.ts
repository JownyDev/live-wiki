import path from 'node:path';
import { describe, expect, it } from 'vitest';

type BrokenReference = import('../packages/lore-linter/src/broken-references').BrokenReference;
type LoreLinter = typeof import('../packages/lore-linter/src/index');

const loadLoreLinter = async (): Promise<LoreLinter> => {
  return await import('../packages/lore-linter/src/index');
};

const sortBrokenRefs = (refs: BrokenReference[]): BrokenReference[] => {
  return [...refs].sort((a, b) => {
    const keyA = `${a.type}:${a.id}:${a.field}:${a.reference}`;
    const keyB = `${b.type}:${b.id}:${b.field}:${b.reference}`;
    return keyA.localeCompare(keyB);
  });
};

describe('lore-linter broken references', () => {
  it('reports each broken reference with type, id, field, and reference', async () => {
    const fixturesDir = path.resolve(
      import.meta.dirname,
      '..',
      'packages',
      'lore-linter',
      'test',
      'fixtures',
      'broken-refs',
    );
    const { scanLoreDirectory } = await loadLoreLinter();

    const report = await scanLoreDirectory(fixturesDir);

    const expected: BrokenReference[] = [
      {
        type: 'character',
        id: 'broken-affinity',
        field: 'affinity',
        reference: 'element:missing-element',
      },
      {
        type: 'character',
        id: 'broken-origin-place',
        field: 'origin',
        reference: 'place:missing-place',
      },
      {
        type: 'character',
        id: 'broken-origin-planet',
        field: 'origin',
        reference: 'planet:missing-planet',
      },
      {
        type: 'character',
        id: 'broken-related-event',
        field: 'related_events',
        reference: 'event:missing-event',
      },
      {
        type: 'element',
        id: 'broken-origin-element',
        field: 'origin',
        reference: 'place:missing-place',
      },
      {
        type: 'character',
        id: 'broken-related-characters',
        field: 'related_characters',
        reference: 'character:missing-character',
      },
      {
        type: 'card',
        id: 'broken-elements',
        field: 'elements',
        reference: 'element:missing-element',
      },
      {
        type: 'card',
        id: 'broken-represents',
        field: 'represents',
        reference: 'event:missing-event',
      },
      {
        type: 'event',
        id: 'broken-place',
        field: 'locations',
        reference: 'place:missing-place',
      },
      {
        type: 'event',
        id: 'broken-planet',
        field: 'locations',
        reference: 'planet:missing-planet',
      },
      {
        type: 'event',
        id: 'broken-who',
        field: 'who',
        reference: 'ghost',
      },
      {
        type: 'mechanic',
        id: 'broken-related-card',
        field: 'related_cards',
        reference: 'card:missing-card',
      },
      {
        type: 'place',
        id: 'broken-planet-id',
        field: 'planetId',
        reference: 'planet:missing-planet',
      },
    ];

    expect(sortBrokenRefs(report.brokenReferences)).toEqual(sortBrokenRefs(expected));
  });

  it('ignores valid refs and allowed location types', async () => {
    const fixturesDir = path.resolve(
      import.meta.dirname,
      '..',
      'packages',
      'lore-linter',
      'test',
      'fixtures',
      'broken-refs-valid',
    );
    const { scanLoreDirectory } = await loadLoreLinter();

    const report = await scanLoreDirectory(fixturesDir);

    expect(report.brokenReferences).toEqual([]);
  });
});
