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

/** Ignora archivos sin type/id para no romper el lint por contenido incompleto. */
export const extractTypeAndId = async (
  filePath: string,
): Promise<LoreIdentity | null> => {
  const contents = await readFile(filePath, 'utf8');
  const parsed = matter(contents).data;
  if (!isString(parsed.type) || !isString(parsed.id)) {
    return null;
  }
  return { type: parsed.type, id: parsed.id };
};
