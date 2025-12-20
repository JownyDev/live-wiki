import { collectDuplicateIds, type DuplicateId } from './duplicates';
import { extractTypeAndId } from './frontmatter';
import { listMarkdownFiles } from './fs';

/** Duplicate ids found for the same type across different files. */
export type LintReport = {
  duplicateIds: DuplicateId[];
};

/**
 * Scan a directory of markdown files and report duplicate ids per type.
 */
export const scanLoreDirectory = async (baseDir: string): Promise<LintReport> => {
  const files = await listMarkdownFiles(baseDir);
  const records: Array<{ meta: { type: string; id: string }; path: string }> =
    [];

  for (const filePath of files) {
    const metadata = await extractTypeAndId(filePath);
    if (!metadata) {
      continue;
    }
    records.push({ meta: metadata, path: filePath });
  }

  return { duplicateIds: collectDuplicateIds(records) };
};
