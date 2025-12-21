import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { getStringField, parseFrontmatter } from './frontmatter';
import { listMarkdownFiles } from './markdown-files';

export type SimpleEntityListItem = { id: string; name: string };
export type SimpleEntity = { id: string; name: string; body: string };

type NodeErrorWithCode = Error & { code?: string };

const parseAndValidateSimpleEntityMarkdown = (
  markdown: string,
  expectedType: string,
): SimpleEntity => {
  const { data, content } = parseFrontmatter(markdown);
  if (data.type !== expectedType) {
    throw new Error('Invalid type');
  }

  const id = getStringField(data, 'id');
  const name = getStringField(data, 'name');

  return { id, name, body: content };
};

const isEnoentError = (error: unknown): error is NodeErrorWithCode =>
  error instanceof Error && (error as NodeErrorWithCode).code === 'ENOENT';

export async function listSimpleEntities(
  dir: string,
  expectedType: string,
): Promise<Array<SimpleEntityListItem>> {
  const markdownFiles = await listMarkdownFiles(dir);

  const entities: SimpleEntityListItem[] = [];
  for (const filename of markdownFiles) {
    const filePath = path.join(dir, filename);
    const markdown = await readFile(filePath, 'utf8');
    const { id, name } = parseAndValidateSimpleEntityMarkdown(markdown, expectedType);
    entities.push({ id, name });
  }

  entities.sort((a, b) => a.id.localeCompare(b.id));
  // Orden estable por id para listas deterministas en el SSG.
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
