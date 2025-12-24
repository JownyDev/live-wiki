import path from 'node:path';
import { errorResult, failResult, okResult, type CommandResult } from './result';

type LintReport = {
  duplicateIds: unknown[];
  brokenReferences: unknown[];
  schemaErrors: unknown[];
};

type LoreLinterModule = {
  scanLoreDirectory: (baseDir: string) => Promise<LintReport>;
};

type CheckOptions = {
  contentDir?: string;
};

const getDefaultContentDir = (): string =>
  path.resolve(process.cwd(), 'content');

const countLintErrors = (report: LintReport): number => {
  return (
    report.duplicateIds.length +
    report.brokenReferences.length +
    report.schemaErrors.length
  );
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

type SchemaError = {
  type: string;
  id: string | null;
  field: string;
  reason: string;
};

const isSchemaError = (value: unknown): value is SchemaError => {
  if (!isRecord(value)) {
    return false;
  }
  const id = value.id;
  return (
    typeof value.type === 'string' &&
    (typeof id === 'string' || id === null) &&
    typeof value.field === 'string' &&
    typeof value.reason === 'string'
  );
};

const formatSchemaError = (error: SchemaError): string => {
  const id = error.id ?? 'none';
  return `${error.type}:${id}:${error.field}:${error.reason}`;
};

const formatCheckOutput = (report: LintReport): string => {
  const errorCount = countLintErrors(report);
  const schemaLines = report.schemaErrors
    .filter(isSchemaError)
    .map(formatSchemaError);
  if (schemaLines.length === 0) {
    return `Found ${String(errorCount)} errors.`;
  }
  return `Found ${String(errorCount)} errors.\n${schemaLines.join('\n')}`;
};

const getLoreLinterModule = (
  value: unknown,
): LoreLinterModule | null => {
  if (isRecord(value) && typeof value.scanLoreDirectory === 'function') {
    return value as LoreLinterModule;
  }
  if (isRecord(value) && isRecord(value.default)) {
    const defaultExport = value.default;
    if (typeof defaultExport.scanLoreDirectory === 'function') {
      return defaultExport as LoreLinterModule;
    }
  }
  return null;
};

const loadLoreLinter = async (): Promise<LoreLinterModule> => {
  const distModulePath = '../../../lore-linter/dist/index.js';
  const srcModulePath = '../../../lore-linter/src/index';
  const modulePaths = [distModulePath, srcModulePath];

  for (const modulePath of modulePaths) {
    try {
      const moduleExports = (await import(modulePath)) as unknown;
      const resolved = getLoreLinterModule(moduleExports);
      if (resolved) {
        return resolved;
      }
    } catch {
      // Ignora fallos para intentar el siguiente fallback.
    }
  }

  throw new Error('Unable to load lore-linter module');
};

/**
 * Ejecuta el lore-linter y devuelve exit code + salida resumida.
 * @param options Directorio de contenido a revisar.
 * @returns Resultado con exitCode 0/1 y texto de salida.
 */
export const runCheckCommand = async (
  options: CheckOptions,
): Promise<CommandResult> => {
  const contentDir = options.contentDir ?? getDefaultContentDir();

  try {
    const { scanLoreDirectory } = await loadLoreLinter();
    const report = await scanLoreDirectory(contentDir);
    const errorCount = countLintErrors(report);

    if (errorCount > 0) {
      return failResult(formatCheckOutput(report));
    }

    return okResult('No errors.');
  } catch (error: unknown) {
    return errorResult(error);
  }
};
