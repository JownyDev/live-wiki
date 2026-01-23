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

const extractRawFrontmatter = (contents: string): string | null => {
  const match = contents.match(/^---\s*\n([\s\S]*?)\n---/);
  return match ? match[1] : null;
};

export type FrontmatterPayload = {
  data: Record<string, unknown>;
  raw: string | null;
};

/**
 * Obtiene el frontmatter parseado junto con su contenido original (raw) para validaciones de formato.
 * @param filePath Ruta al archivo markdown.
 */
export const readFrontmatter = async (
  filePath: string,
): Promise<FrontmatterPayload | null> => {
  const contents = await readFile(filePath, 'utf8');
  const data = matter(contents).data;
  if (!isRecord(data)) {
    return null;
  }
  return { data, raw: extractRawFrontmatter(contents) };
};

/**
 * Extrae exclusivamente los datos del frontmatter para comprobaciones de lógica de negocio.
 * @param filePath Ruta al archivo markdown.
 */
export const readFrontmatterData = async (
  filePath: string,
): Promise<Record<string, unknown> | null> => {
  const payload = await readFrontmatter(filePath);
  return payload ? payload.data : null;
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
