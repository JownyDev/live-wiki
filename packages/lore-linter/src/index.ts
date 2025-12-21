import {
  buildReferenceIndex,
  collectBrokenReferences,
  type BrokenReference,
  type LoreDoc,
} from './broken-references';
import { collectDuplicateIds, type DuplicateId } from './duplicates';
import { readFrontmatterData } from './frontmatter';
import { listMarkdownFiles } from './fs';

/** Reporte del linter con duplicados y referencias rotas. */
export type LintReport = {
  duplicateIds: DuplicateId[];
  brokenReferences: BrokenReference[];
};

const isString = (value: unknown): value is string => typeof value === 'string';

/**
 * Punto de entrada publico: coordina lectura, parseo y checks basicos.
 * @param baseDir Directorio raiz del contenido.
 * @returns Reporte con duplicados y referencias rotas.
 */
export const scanLoreDirectory = async (baseDir: string): Promise<LintReport> => {
  const files = await listMarkdownFiles(baseDir);
  const records: Array<{ meta: { type: string; id: string }; path: string }> =
    [];
  const docs: LoreDoc[] = [];

  for (const filePath of files) {
    const data = await readFrontmatterData(filePath);
    if (!data) {
      continue;
    }
    const type = data.type;
    const id = data.id;
    if (!isString(type) || !isString(id)) {
      // Contenido incompleto no debe bloquear el lint; se reporta en checks especificos.
      continue;
    }
    records.push({ meta: { type, id }, path: filePath });
    docs.push({ type, id, data });
  }

  const index = buildReferenceIndex(docs);
  const brokenReferences = collectBrokenReferences(docs, index);

  return {
    duplicateIds: collectDuplicateIds(records),
    brokenReferences,
  };
};
