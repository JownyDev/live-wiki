import type { LoreIdentity } from './frontmatter';

/** Duplicate ids found for the same type across different files. */
export type DuplicateId = {
  type: string;
  id: string;
  paths: string[];
};

/** Build a list of duplicate ids from parsed records. */
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
