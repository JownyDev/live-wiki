import { readdir } from 'node:fs/promises';

export const listMarkdownFiles = async (dir: string): Promise<string[]> => {
  const entries = await readdir(dir, { withFileTypes: true });
  return entries
    // Solo markdown como fuente de verdad del contenido (MVP).
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => entry.name);
};
