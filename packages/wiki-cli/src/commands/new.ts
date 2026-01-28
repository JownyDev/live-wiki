import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import {
  errorResult,
  failResult,
  formatErrorOutput,
  okResult,
  type CommandResult,
} from './result';

type NewOptions = {
  type: string;
  id: string;
  contentDir: string;
  templatesDir: string;
};

const CONTENT_DIR_BY_TYPE = {
  character: 'characters',
  event: 'events',
  place: 'places',
  planet: 'planets',
  element: 'elements',
  mechanic: 'mechanics',
  card: 'cards',
} as const;

type ContentType = keyof typeof CONTENT_DIR_BY_TYPE;

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

const isContentType = (value: string): value is ContentType =>
  value in CONTENT_DIR_BY_TYPE;

const resolveTargetDir = (type: string): string | null => {
  return isContentType(type) ? CONTENT_DIR_BY_TYPE[type] : null;
};

const getTargetPath = (
  contentDir: string,
  targetDir: string,
  id: string,
): string => {
  return path.join(contentDir, targetDir, `${id}.md`);
};

const getTemplatePath = (templatesDir: string, type: string): string => {
  return path.join(templatesDir, `${type}.md`);
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

const ensureTargetAvailable = async (
  targetPath: string,
): Promise<CommandResult | null> => {
  try {
    await access(targetPath);
    return failResult(formatErrorOutput(`${targetPath} already exists`));
  } catch (error: unknown) {
    const code = getErrorCode(error);
    if (code !== 'ENOENT') {
      return errorResult(error);
    }
  }

  return null;
};

const createFromTemplate = async (options: {
  templatePath: string;
  targetPath: string;
  type: string;
  id: string;
}): Promise<CommandResult> => {
  try {
    const template = await readFile(options.templatePath, 'utf8');
    const output = buildTemplate(template, options.type, options.id);
    await mkdir(path.dirname(options.targetPath), { recursive: true });
    await writeFile(options.targetPath, output, 'utf8');
    return okResult(`Created ${options.targetPath}`);
  } catch (error: unknown) {
    return errorResult(error);
  }
};

/**
 * Crea un archivo nuevo desde plantilla sin sobrescribir contenido existente.
 * @param options Tipo, id y rutas de contenido/plantillas.
 * @returns Resultado con exitCode 0/1 y salida.
 */
export const runNewCommand = async (
  options: NewOptions,
): Promise<CommandResult> => {
  if (process.env.CF_PAGES) {
    return failResult(
      formatErrorOutput('Cannot run "new" command in Cloudflare environment'),
    );
  }

  const targetDir = resolveTargetDir(options.type);
  if (!targetDir) {
    return failResult(formatErrorOutput(`unknown type ${options.type}`));
  }

  const targetPath = getTargetPath(options.contentDir, targetDir, options.id);
  const availability = await ensureTargetAvailable(targetPath);
  if (availability) {
    return availability;
  }

  const templatePath = getTemplatePath(options.templatesDir, options.type);
  return await createFromTemplate({
    templatePath,
    targetPath,
    type: options.type,
    id: options.id,
  });
};
