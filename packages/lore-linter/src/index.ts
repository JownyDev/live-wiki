import { collectDuplicateIds, type DuplicateId } from './duplicates';
import { extractTypeAndId, readFrontmatterData } from './frontmatter';
import { listMarkdownFiles } from './fs';

/** IDs duplicados para el mismo type con paths asociados. */
export type LintReport = {
  duplicateIds: DuplicateId[];
  brokenReferences: BrokenReference[];
};

export type BrokenReference = {
  type: string;
  id: string;
  field: 'who' | 'locations' | 'origin' | 'planetId';
  reference: string;
};

type LocationRef =
  | { kind: 'place'; id: string }
  | { kind: 'planet'; id: string }
  | { kind: 'space'; id: string }
  | { kind: 'unknown' };

const isString = (value: unknown): value is string => typeof value === 'string';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const parseLocationRef = (value: string): LocationRef | null => {
  if (value === 'unknown') {
    return { kind: 'unknown' };
  }
  if (value.startsWith('place:')) {
    const id = value.slice('place:'.length);
    return id.length > 0 ? { kind: 'place', id } : null;
  }
  if (value.startsWith('planet:')) {
    const id = value.slice('planet:'.length);
    return id.length > 0 ? { kind: 'planet', id } : null;
  }
  if (value.startsWith('space:')) {
    const id = value.slice('space:'.length);
    return id.length > 0 ? { kind: 'space', id } : null;
  }
  return null;
};

/**
 * Punto de entrada publico: coordina lectura, parseo y deteccion de duplicados.
 */
export const scanLoreDirectory = async (baseDir: string): Promise<LintReport> => {
  const files = await listMarkdownFiles(baseDir);
  const records: Array<{ meta: { type: string; id: string }; path: string }> =
    [];
  const docs: Array<{ data: Record<string, unknown> }> = [];
  const characterIds = new Set<string>();
  const placeIds = new Set<string>();
  const planetIds = new Set<string>();

  for (const filePath of files) {
    const metadata = await extractTypeAndId(filePath);
    if (!metadata) {
      // Contenido incompleto no debe bloquear el lint; se reporta en checks especificos.
      continue;
    }
    records.push({ meta: metadata, path: filePath });
    const data = await readFrontmatterData(filePath);
    if (!data) {
      continue;
    }
    docs.push({ data });
    if (metadata.type === 'character') {
      characterIds.add(metadata.id);
    }
    if (metadata.type === 'place') {
      placeIds.add(metadata.id);
    }
    if (metadata.type === 'planet') {
      planetIds.add(metadata.id);
    }
  }

  const brokenReferences: BrokenReference[] = [];

  for (const doc of docs) {
    const type = doc.data.type;
    const id = doc.data.id;
    if (!isString(type) || !isString(id)) {
      continue;
    }

    if (type === 'event') {
      const who = doc.data.who;
      if (Array.isArray(who)) {
        for (const entry of who) {
          if (!isRecord(entry)) {
            continue;
          }
          const character = entry.character;
          if (!isString(character)) {
            continue;
          }
          if (!characterIds.has(character)) {
            brokenReferences.push({
              type: 'event',
              id,
              field: 'who',
              reference: character,
            });
          }
        }
      }

      const locations = doc.data.locations;
      if (Array.isArray(locations)) {
        for (const location of locations) {
          if (!isString(location)) {
            continue;
          }
          const parsed = parseLocationRef(location);
          if (!parsed) {
            continue;
          }
          if (parsed.kind === 'place' && !placeIds.has(parsed.id)) {
            brokenReferences.push({
              type: 'event',
              id,
              field: 'locations',
              reference: location,
            });
          }
          if (parsed.kind === 'planet' && !planetIds.has(parsed.id)) {
            brokenReferences.push({
              type: 'event',
              id,
              field: 'locations',
              reference: location,
            });
          }
        }
      }
    }

    if (type === 'character') {
      const origin = doc.data.origin;
      if (isString(origin)) {
        const parsed = parseLocationRef(origin);
        if (parsed?.kind === 'place' && !placeIds.has(parsed.id)) {
          brokenReferences.push({
            type: 'character',
            id,
            field: 'origin',
            reference: origin,
          });
        }
        if (parsed?.kind === 'planet' && !planetIds.has(parsed.id)) {
          brokenReferences.push({
            type: 'character',
            id,
            field: 'origin',
            reference: origin,
          });
        }
      }
    }

    if (type === 'place') {
      const planetId = doc.data.planetId;
      if (isString(planetId)) {
        const parsed = parseLocationRef(planetId);
        if (parsed?.kind === 'planet' && !planetIds.has(parsed.id)) {
          brokenReferences.push({
            type: 'place',
            id,
            field: 'planetId',
            reference: planetId,
          });
        }
      }
    }
  }

  return {
    duplicateIds: collectDuplicateIds(records),
    brokenReferences,
  };
};
