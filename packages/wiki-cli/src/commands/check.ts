import path from 'node:path';
import { scanLoreDirectory } from '../../../lore-linter/src/index';

/**
 * Resultado estandar de un comando del CLI.
 */
export type CommandResult = {
  exitCode: number;
  output: string;
};

type CheckOptions = {
  contentDir?: string;
};

const getDefaultContentDir = (): string => {
  return path.resolve(process.cwd(), 'content');
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
    const errorCount =
      report.duplicateIds.length +
      report.brokenReferences.length +
      report.schemaErrors.length;

    if (errorCount > 0) {
      return {
        exitCode: 1,
        output: `Found ${String(errorCount)} errors.`,
      };
    }

    return {
      exitCode: 0,
      output: 'No errors.',
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Unknown error';
    return {
      exitCode: 1,
      output: `Error: ${message}`,
    };
  }
};
