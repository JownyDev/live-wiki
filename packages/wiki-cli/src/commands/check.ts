import path from 'node:path';
import { scanLoreDirectory, type LintReport } from '../../../lore-linter/src/index';
import { errorResult, failResult, okResult, type CommandResult } from './result';

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
