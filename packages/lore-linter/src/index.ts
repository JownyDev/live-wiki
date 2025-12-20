import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';

export type DuplicateId = {
  type: string;
  id: string;
  paths: string[];
};

export type LintReport = {
  duplicateIds: DuplicateId[];
};

const isString = (value: unknown): value is string => {
  return typeof value === 'string';
};

const listMarkdownFiles = async (baseDir: string): Promise<string[]> => {
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

const extractTypeAndId = async (
  filePath: string,
): Promise<{ type: string; id: string } | null> => {
  const contents = await readFile(filePath, 'utf8');
  const parsed = matter(contents).data;
  if (!isString(parsed.type) || !isString(parsed.id)) {
    return null;
  }
  return { type: parsed.type, id: parsed.id };
};

/**
 * Scan a directory of markdown files and report duplicate ids per type.
 */
export const scanLoreDirectory = async (baseDir: string): Promise<LintReport> => {
  const files = await listMarkdownFiles(baseDir);
  const byKey = new Map<string, { type: string; id: string; paths: string[] }>();

  for (const filePath of files) {
    const metadata = await extractTypeAndId(filePath);
    if (!metadata) {
      continue;
    }
    const key = `${metadata.type}:${metadata.id}`;
    const existing = byKey.get(key);
    if (existing) {
      existing.paths.push(filePath);
    } else {
      byKey.set(key, { ...metadata, paths: [filePath] });
    }
  }

  const duplicateIds: DuplicateId[] = [];
  for (const entry of byKey.values()) {
    if (entry.paths.length > 1) {
      duplicateIds.push(entry);
    }
  }

  return { duplicateIds };
};
