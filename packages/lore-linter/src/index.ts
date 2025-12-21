import {
  buildReferenceIndex,
  collectBrokenReferences,
  type BrokenReference,
  type LoreDoc,
} from './broken-references';
import { collectDuplicateIds, type DuplicateId } from './duplicates';
import { readFrontmatter } from './frontmatter';
import { listMarkdownFiles } from './fs';
import { collectSchemaErrors, type RawDoc, type SchemaError } from './schema-validation';

/** Reporte del linter con duplicados y referencias rotas. */
export type LintReport = {
  duplicateIds: DuplicateId[];
  brokenReferences: BrokenReference[];
  schemaErrors: SchemaError[];
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
  const rawDocs: RawDoc[] = [];

  for (const filePath of files) {
    const payload = await readFrontmatter(filePath);
    if (!payload) {
      continue;
    }
    rawDocs.push({ data: payload.data, raw: payload.raw });
    const type = payload.data.type;
    const id = payload.data.id;
    if (!isString(type) || !isString(id)) {
      // Contenido incompleto no debe bloquear el lint; se reporta en checks especificos.
      continue;
    }
    records.push({ meta: { type, id }, path: filePath });
    docs.push({ type, id, data: payload.data });
  }

  const index = buildReferenceIndex(docs);
  const brokenReferences = collectBrokenReferences(docs, index);
  const schemaErrors = collectSchemaErrors(rawDocs);

  return {
    duplicateIds: collectDuplicateIds(records),
    brokenReferences,
    schemaErrors,
  };
};
