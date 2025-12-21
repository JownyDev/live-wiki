import { collectDuplicateIds, type DuplicateId } from './duplicates';
import { extractTypeAndId } from './frontmatter';
import { listMarkdownFiles } from './fs';

/** IDs duplicados para el mismo type con paths asociados. */
export type LintReport = {
  duplicateIds: DuplicateId[];
};

/**
 * Punto de entrada publico: coordina lectura, parseo y deteccion de duplicados.
 */
export const scanLoreDirectory = async (baseDir: string): Promise<LintReport> => {
  const files = await listMarkdownFiles(baseDir);
  const records: Array<{ meta: { type: string; id: string }; path: string }> =
    [];

  for (const filePath of files) {
    const metadata = await extractTypeAndId(filePath);
    if (!metadata) {
      // Contenido incompleto no debe bloquear el lint; se reporta en checks especificos.
      continue;
    }
    records.push({ meta: metadata, path: filePath });
  }

  return { duplicateIds: collectDuplicateIds(records) };
};
