import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { getStringField, parseFrontmatter } from './frontmatter';
import { parseLocationRef } from './location-refs';
import { listMarkdownFiles } from './markdown-files';
import {
  listSimpleEntities,
  type SimpleEntityListItem,
} from './simple-entities';

export type CardListItem = SimpleEntityListItem;
export type Card = {
  id: string;
  name: string;
  elements: string[];
  represents: string[];
  body: string;
};

type NodeErrorWithCode = Error & { code?: string };

const getCardsDir = (baseDir?: string): string => {
  const resolvedBaseDir = baseDir ?? path.resolve(process.cwd(), 'content');
  return path.join(resolvedBaseDir, 'cards');
};

const getElementsDir = (baseDir?: string): string => {
  const resolvedBaseDir = baseDir ?? path.resolve(process.cwd(), 'content');
  return path.join(resolvedBaseDir, 'elements');
};

const parseWithPrefix = (value: string, prefix: string): string | null => {
  if (!value.startsWith(prefix)) {
    return null;
  }
  const id = value.slice(prefix.length);
  return id.length > 0 ? id : null;
};

const isAllowedRepresentsRef = (value: string): boolean => {
  if (parseWithPrefix(value, 'character:')) {
    return true;
  }
  if (parseWithPrefix(value, 'event:')) {
    return true;
  }
  const parsedLocation = parseLocationRef(value);
  return parsedLocation?.kind === 'place' || parsedLocation?.kind === 'planet';
};

const listElementIds = async (baseDir?: string): Promise<Set<string>> => {
  const elementsDir = getElementsDir(baseDir);
  const elements = await listSimpleEntities(elementsDir, 'element');
  return new Set(elements.map((element) => element.id));
};

const parseElementsField = (
  record: Record<string, unknown>,
  field: string,
  elementIds: Set<string>,
): string[] => {
  const value = record[field];
  if (!Array.isArray(value) || !value.every((item) => typeof item === 'string')) {
    throw new Error(`Invalid ${field}`);
  }
  if (value.length !== 2) {
    throw new Error(`Invalid ${field}`);
  }

  for (const item of value) {
    const elementId = parseWithPrefix(item, 'element:');
    if (!elementId) {
      throw new Error(`Invalid ${field}`);
    }
    if (!elementIds.has(elementId)) {
      throw new Error(`Invalid ${field}`);
    }
  }

  return value;
};

const parseRepresentsField = (
  record: Record<string, unknown>,
  field: string,
): string[] => {
  const value = record[field];
  if (typeof value === 'undefined') {
    return [];
  }
  if (!Array.isArray(value) || !value.every((item) => typeof item === 'string')) {
    throw new Error(`Invalid ${field}`);
  }
  if (!value.every((item) => isAllowedRepresentsRef(item))) {
    throw new Error(`Invalid ${field}`);
  }
  return value;
};

const parseAndValidateCardMarkdown = (
  markdown: string,
  elementIds: Set<string>,
): Card => {
  const { data, content } = parseFrontmatter(markdown);
  if (data.type !== 'card') {
    throw new Error('Invalid type');
  }

  const id = getStringField(data, 'id');
  const name = getStringField(data, 'name');
  const elements = parseElementsField(data, 'elements', elementIds);
  const represents = parseRepresentsField(data, 'represents');

  return { id, name, elements, represents, body: content };
};

const isEnoentError = (error: unknown): error is NodeErrorWithCode =>
  error instanceof Error && (error as NodeErrorWithCode).code === 'ENOENT';

export async function listCards(baseDir?: string): Promise<Array<CardListItem>> {
  const cardsDir = getCardsDir(baseDir);
  const elementIds = await listElementIds(baseDir);
  const markdownFiles = await listMarkdownFiles(cardsDir);

  const cards: CardListItem[] = [];
  for (const filename of markdownFiles) {
    const filePath = path.join(cardsDir, filename);
    const markdown = await readFile(filePath, 'utf8');
    const { id, name } = parseAndValidateCardMarkdown(markdown, elementIds);
    cards.push({ id, name });
  }

  cards.sort((a, b) => a.id.localeCompare(b.id));
  return cards;
}

export async function getCardById(
  id: string,
  baseDir?: string,
): Promise<Card | null> {
  const cardsDir = getCardsDir(baseDir);
  const filePath = path.join(cardsDir, `${id}.md`);
  const elementIds = await listElementIds(baseDir);

  let markdown: string;
  try {
    markdown = await readFile(filePath, 'utf8');
  } catch (error: unknown) {
    if (isEnoentError(error)) {
      return null;
    }
    throw error;
  }

  return parseAndValidateCardMarkdown(markdown, elementIds);
}
