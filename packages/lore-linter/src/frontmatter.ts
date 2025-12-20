import { readFile } from 'node:fs/promises';
import matter from 'gray-matter';

/** Parsed identity for a lore entry. */
export type LoreIdentity = {
  type: string;
  id: string;
};

const isString = (value: unknown): value is string => {
  return typeof value === 'string';
};

/** Read a markdown file and return its type/id when present. */
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
