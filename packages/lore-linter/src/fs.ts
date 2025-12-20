import { readdir } from 'node:fs/promises';
import path from 'node:path';

/** Recorre subdirectorios y solo incluye .md para alinear el linter con contenido. */
export const listMarkdownFiles = async (baseDir: string): Promise<string[]> => {
  const entries = await readdir(baseDir, { withFileTypes: true });
  const results: string[] = [];

  for (const entry of entries) {
    const entryPath = path.join(baseDir, entry.name);
    if (entry.isDirectory()) {
      results.push(...(await listMarkdownFiles(entryPath)));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      results.push(entryPath);
    }
  }

  return results;
};
