import { readdir } from 'node:fs/promises';

type NodeErrorWithCode = Error & { code?: string };

export const listMarkdownFiles = async (dir: string): Promise<string[]> => {
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    return entries
      // Solo markdown como fuente de verdad del contenido (MVP).
      .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
      .map((entry) => entry.name);
  } catch (error) {
    if (error instanceof Error && (error as NodeErrorWithCode).code === 'ENOENT') {
      return [];
    }
    throw error;
  }
};
