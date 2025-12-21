import { readFile } from 'node:fs/promises';
import matter from 'gray-matter';

/** Solo type/id: el linter de duplicados no requiere mas campos. */
export type LoreIdentity = {
  type: string;
  id: string;
};

const isString = (value: unknown): value is string => {
  return typeof value === 'string';
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

/**
 * Lee el frontmatter y devuelve un record para otros checks.
 * @param filePath Ruta al markdown.
 * @returns Datos del frontmatter o null si no es un record.
 */
export const readFrontmatterData = async (
  filePath: string,
): Promise<Record<string, unknown> | null> => {
  const contents = await readFile(filePath, 'utf8');
  const data = matter(contents).data;
  return isRecord(data) ? data : null;
};

/**
 * Ignora archivos sin type/id para no romper el lint por contenido incompleto.
 * @param filePath Ruta al markdown.
 * @returns Identidad basica o null si no es valida.
 */
export const extractTypeAndId = async (
  filePath: string,
): Promise<LoreIdentity | null> => {
  const data = await readFrontmatterData(filePath);
  if (!data || !isString(data.type) || !isString(data.id)) {
    return null;
  }
  return { type: data.type, id: data.id };
};
