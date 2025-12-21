import type { LoreIdentity } from './frontmatter';

/** Representa un conflicto de type+id con los paths involucrados. */
export type DuplicateId = {
  type: string;
  id: string;
  paths: string[];
};

/**
 * Agrupa por type+id y devuelve solo los casos con mas de un archivo.
 * @param records Pares (meta, path) ya parseados.
 * @returns Lista de duplicados con sus paths.
 */
export const collectDuplicateIds = (
  records: Array<{ meta: LoreIdentity; path: string }>,
): DuplicateId[] => {
  const byKey = new Map<string, DuplicateId>();

  for (const record of records) {
    const key = `${record.meta.type}:${record.meta.id}`;
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

  const duplicates: DuplicateId[] = [];
  for (const entry of byKey.values()) {
    if (entry.paths.length > 1) {
      duplicates.push(entry);
    }
  }

  return duplicates;
};
