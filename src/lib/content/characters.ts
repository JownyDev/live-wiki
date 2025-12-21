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

export type CharacterListItem = { id: string; name: string };
export type Character = { id: string; name: string; origin: string | null; body: string };

type NodeErrorWithCode = Error & { code?: string };

const getCharactersDir = (baseDir?: string): string => {
  const resolvedBaseDir = baseDir ?? path.resolve(process.cwd(), 'content');
  return path.join(resolvedBaseDir, 'characters');
};

const toCharacterListItem = (entity: SimpleEntityListItem): CharacterListItem => ({
  id: entity.id,
  name: entity.name,
});

const parseAndValidateCharacterMarkdown = (markdown: string): Character => {
  const { data, content } = parseFrontmatter(markdown);
  if (data.type !== 'character') {
    throw new Error('Invalid type');
  }

  const id = getStringField(data, 'id');
  const name = getStringField(data, 'name');
  const origin = getOptionalLocationField(data, 'origin');

  return { id, name, origin, body: content };
};

const isEnoentError = (error: unknown): error is NodeErrorWithCode =>
  error instanceof Error && (error as NodeErrorWithCode).code === 'ENOENT';

export async function listCharacters(
  baseDir?: string,
): Promise<Array<CharacterListItem>> {
  const charactersDir = getCharactersDir(baseDir);
  // Adaptador para preservar el tipo público y permitir ampliar Character más adelante.
  const entities = await listSimpleEntities(charactersDir, 'character');
  return entities.map(toCharacterListItem);
}

export async function getCharacterById(
  id: string,
  baseDir?: string,
): Promise<Character | null> {
  const charactersDir = getCharactersDir(baseDir);
  const filePath = path.join(charactersDir, `${id}.md`);

  let markdown: string;
  try {
    markdown = await readFile(filePath, 'utf8');
  } catch (error: unknown) {
    if (isEnoentError(error)) {
      return null;
    }
    throw error;
  }

  return parseAndValidateCharacterMarkdown(markdown);
}
