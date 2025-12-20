import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';

export type SimpleEntityListItem = { id: string; name: string };
export type SimpleEntity = { id: string; name: string; body: string };

type NodeErrorWithCode = Error & { code?: string };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const getStringField = (record: Record<string, unknown>, field: string): string => {
  const value = record[field];
  if (typeof value !== 'string') {
    throw new Error(`Invalid ${field}`);
  }
  return value;
};

const parseAndValidateSimpleEntityMarkdown = (
  markdown: string,
  expectedType: string,
): SimpleEntity => {
  const parsed = matter(markdown);
  const data: unknown = parsed.data;

  if (!isRecord(data)) {
    throw new Error('Invalid frontmatter');
  }
  if (data.type !== expectedType) {
    throw new Error('Invalid type');
  }

  const id = getStringField(data, 'id');
  const name = getStringField(data, 'name');

  return { id, name, body: parsed.content };
};

const isEnoentError = (error: unknown): error is NodeErrorWithCode =>
  error instanceof Error && (error as NodeErrorWithCode).code === 'ENOENT';

export async function listSimpleEntities(
  dir: string,
  expectedType: string,
): Promise<Array<SimpleEntityListItem>> {
  const entries = await readdir(dir, { withFileTypes: true });

  const markdownFiles = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => entry.name);

  const entities: SimpleEntityListItem[] = [];
  for (const filename of markdownFiles) {
    const filePath = path.join(dir, filename);
    const markdown = await readFile(filePath, 'utf8');
    const { id, name } = parseAndValidateSimpleEntityMarkdown(markdown, expectedType);
    entities.push({ id, name });
  }

  entities.sort((a, b) => a.id.localeCompare(b.id));
  return entities;
}

export async function getSimpleEntityById(
  dir: string,
  expectedType: string,
  id: string,
): Promise<SimpleEntity | null> {
  const filePath = path.join(dir, `${id}.md`);

  let markdown: string;
  try {
    markdown = await readFile(filePath, 'utf8');
  } catch (error: unknown) {
    if (isEnoentError(error)) {
      return null;
    }
    throw error;
  }

  return parseAndValidateSimpleEntityMarkdown(markdown, expectedType);
}
