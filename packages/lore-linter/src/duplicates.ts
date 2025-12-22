import type { LoreIdentity } from './frontmatter';

/** Representa un conflicto de type+id con los paths involucrados. */
export type DuplicateId = {
  type: string;
  id: string;
  paths: string[];
  message: string;
};

type DuplicateIdEntry = Omit<DuplicateId, 'message'>;

type DuplicateRecord = {
  meta: LoreIdentity;
  path: string;
};

const toDuplicateKey = (meta: LoreIdentity): string => `${meta.type}:${meta.id}`;

const buildIdIndex = (records: DuplicateRecord[]): Map<string, DuplicateIdEntry> => {
  const byKey = new Map<string, DuplicateIdEntry>();

  for (const record of records) {
    const key = toDuplicateKey(record.meta);
    const existing = byKey.get(key);
    if (existing) {
      existing.paths.push(record.path);
    } else {
      byKey.set(key, {
        type: record.meta.type,
        id: record.meta.id,
        paths: [record.path],
      });
    }
  }

  return byKey;
};

const collectDuplicateEntries = (
  index: Map<string, DuplicateIdEntry>,
): DuplicateIdEntry[] => {
  const duplicates: DuplicateIdEntry[] = [];

  for (const entry of index.values()) {
    if (entry.paths.length > 1) {
      duplicates.push(entry);
    }
  }

  return duplicates;
};

const formatDuplicate = (entry: DuplicateIdEntry): DuplicateId => ({
  ...entry,
  message: 'Duplicate id',
});

/**
 * Agrupa por type+id y devuelve solo los casos con mas de un archivo.
 * @param records Pares (meta, path) ya parseados.
 * @returns Lista de duplicados con sus paths.
 */
export const collectDuplicateIds = (
  records: DuplicateRecord[],
): DuplicateId[] => {
  const index = buildIdIndex(records);
  return collectDuplicateEntries(index).map(formatDuplicate);
};
