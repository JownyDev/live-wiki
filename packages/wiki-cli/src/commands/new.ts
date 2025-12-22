import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import type { CommandResult } from './check';

type NewOptions = {
  type: string;
  id: string;
  contentDir: string;
  templatesDir: string;
};

const CONTENT_DIR_BY_TYPE: Record<string, string> = {
  character: 'characters',
  event: 'events',
  place: 'places',
  planet: 'planets',
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const normalizeIsoDate = (value: unknown): string | null => {
  if (typeof value === 'string') {
    return value;
  }
  if (value instanceof Date && !Number.isNaN(value.valueOf())) {
    return value.toISOString().slice(0, 10);
  }
  return null;
};

const getErrorCode = (error: unknown): string | null => {
  if (!isRecord(error)) {
    return null;
  }
  const code = error.code;
  return typeof code === 'string' ? code : null;
};

const buildTemplate = (
  template: string,
  type: string,
  id: string,
): string => {
  const parsed = matter(template);
  const rawData = parsed.data as unknown;
  const baseData: Record<string, unknown> = isRecord(rawData)
    ? { ...rawData }
    : {};

  const data: Record<string, unknown> = {
    ...baseData,
    type,
    id,
  };

  if (type === 'character') {
    if (typeof data.origin !== 'string') {
      data.origin = 'unknown';
    }
  }

  if (type === 'event') {
    const date = normalizeIsoDate(data.date);
    if (date) {
      data.date = date;
    }
    if (!Array.isArray(data.who)) {
      data.who = [];
    }
    if (!Array.isArray(data.locations)) {
      data.locations = [];
    }
  }

  return matter.stringify(parsed.content, data);
};

/**
 * Crea un archivo nuevo desde plantilla sin sobrescribir contenido existente.
 * @param options Tipo, id y rutas de contenido/plantillas.
 * @returns Resultado con exitCode 0/1 y salida.
 */
export const runNewCommand = async (
  options: NewOptions,
): Promise<CommandResult> => {
  const targetDir = CONTENT_DIR_BY_TYPE[options.type];
  if (!targetDir) {
    return {
      exitCode: 1,
      output: `Error: unknown type ${options.type}`,
    };
  }

  const targetPath = path.join(
    options.contentDir,
    targetDir,
    `${options.id}.md`,
  );

  try {
    await access(targetPath);
    return {
      exitCode: 1,
      output: `Error: ${targetPath} already exists`,
    };
  } catch (error: unknown) {
    const code = getErrorCode(error);
    if (code !== 'ENOENT') {
      const message =
        error instanceof Error ? error.message : 'Unknown error';
      return {
        exitCode: 1,
        output: `Error: ${message}`,
      };
    }
  }

  const templatePath = path.join(
    options.templatesDir,
    `${options.type}.md`,
  );

  try {
    const template = await readFile(templatePath, 'utf8');
    const output = buildTemplate(template, options.type, options.id);
    await mkdir(path.dirname(targetPath), { recursive: true });
    await writeFile(targetPath, output, 'utf8');
    return {
      exitCode: 0,
      output: `Created ${targetPath}`,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      exitCode: 1,
      output: `Error: ${message}`,
    };
  }
};
