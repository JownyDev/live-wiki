import { readFile } from 'node:fs/promises';
import path from 'node:path';
import {
  getOptionalLocationField,
  getStringField,
  parseFrontmatter,
} from './frontmatter';
import {
  listSimpleEntities,
  type SimpleEntityListItem,
} from './simple-entities';

export type ElementListItem = SimpleEntityListItem;
export type Element = {
  id: string;
  name: string;
  origin: string | null;
  image: string | null;
  body: string;
};

type NodeErrorWithCode = Error & { code?: string };

const getElementsDir = (baseDir?: string): string => {
  const resolvedBaseDir = baseDir ?? path.resolve(process.cwd(), 'content');
  return path.join(resolvedBaseDir, 'elements');
};

const getOptionalStringField = (
  record: Record<string, unknown>,
  field: string,
): string | null => {
  const value = record[field];
  if (typeof value === 'undefined') {
    return null;
  }
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`Invalid ${field}`);
  }
  return value;
};

const parseAndValidateElementMarkdown = (markdown: string): Element => {
  const { data, content } = parseFrontmatter(markdown);
  if (data.type !== 'element') {
    throw new Error('Invalid type');
  }

  const id = getStringField(data, 'id');
  const name = getStringField(data, 'name');
  const origin = getOptionalLocationField(data, 'origin');
  const image = getOptionalStringField(data, 'image');

  return { id, name, origin, image, body: content };
};

const isEnoentError = (error: unknown): error is NodeErrorWithCode =>
  error instanceof Error && (error as NodeErrorWithCode).code === 'ENOENT';

export async function listElements(
  baseDir?: string,
): Promise<Array<ElementListItem>> {
  const elementsDir = getElementsDir(baseDir);
  // Reusa el parser basico del MVP para mantener el esquema minimo consistente.
  return await listSimpleEntities(elementsDir, 'element');
}

export async function getElementById(
  id: string,
  baseDir?: string,
): Promise<Element | null> {
  const elementsDir = getElementsDir(baseDir);
  const filePath = path.join(elementsDir, `${id}.md`);

  let markdown: string;
  try {
    markdown = await readFile(filePath, 'utf8');
  } catch (error: unknown) {
    if (isEnoentError(error)) {
      return null;
    }
    throw error;
  }

  return parseAndValidateElementMarkdown(markdown);
}
