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
      return failResult(`Found ${String(errorCount)} errors.`);
    }

    return okResult('No errors.');
  } catch (error: unknown) {
    return errorResult(error);
  }
};
