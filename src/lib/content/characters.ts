import { readFile } from 'node:fs/promises';
import path from 'node:path';
import {
  getDateField,
  getOptionalLocationField,
  getStringField,
  getStringArrayField,
  parseFrontmatter,
} from './frontmatter';
import {
  listSimpleEntities,
  type SimpleEntityListItem,
} from './simple-entities';

export type CharacterListItem = { id: string; name: string };
export type RelatedCharacter = { type: string; character: string };
export type CharacterKnowledge = {
  summary: string | null;
  knowsAbout: string[];
  blindspots: string[];
  canReveal: string[];
};
export type Character = {
  id: string;
  name: string;
  origin: string | null;
  image: string | null;
  born: string | null;
  died: string | null;
  affinity: string | null;
  relatedCharacters: RelatedCharacter[];
  knowledge: CharacterKnowledge | null;
  body: string;
};

type NodeErrorWithCode = Error & { code?: string };

const getCharactersDir = (baseDir?: string): string => {
  const resolvedBaseDir = baseDir ?? path.resolve(process.cwd(), 'content');
  return path.join(resolvedBaseDir, 'characters');
};

const toCharacterListItem = (entity: SimpleEntityListItem): CharacterListItem => ({
  id: entity.id,
  name: entity.name,
});

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

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

const getOptionalDateField = (
  record: Record<string, unknown>,
  field: string,
): string | null => {
  if (typeof record[field] === 'undefined') {
    return null;
  }
  return getDateField(record, field);
};

const getRelatedCharactersField = (value: unknown): RelatedCharacter[] => {
  if (typeof value === 'undefined') {
    return [];
  }
  if (!Array.isArray(value)) {
    throw new Error('Invalid related_characters');
  }
  return value.map((entry) => {
    if (!isRecord(entry)) {
      throw new Error('Invalid related_characters');
    }
    const typeValue = entry.type;
    const characterValue = entry.character;
    if (typeof typeValue !== 'string' || typeValue.length === 0) {
      throw new Error('Invalid related_characters');
    }
    if (typeof characterValue !== 'string') {
      throw new Error('Invalid related_characters');
    }
    return { type: typeValue, character: characterValue };
  });
};

const getKnowledgeField = (
  record: Record<string, unknown>,
): CharacterKnowledge | null => {
  const value = record.knowledge;
  if (typeof value === 'undefined' || value === null) {
    return null;
  }
  if (!isRecord(value)) {
    throw new Error('Invalid knowledge');
  }
  return {
    summary: getOptionalStringField(value, 'summary'),
    knowsAbout: getStringArrayField(value, 'knows_about'),
    blindspots: getStringArrayField(value, 'blindspots'),
    canReveal: getStringArrayField(value, 'can_reveal'),
  };
};

const parseAndValidateCharacterMarkdown = (markdown: string): Character => {
  const { data, content } = parseFrontmatter(markdown);
  if (data.type !== 'character') {
    throw new Error('Invalid type');
  }

  const id = getStringField(data, 'id');
  const name = getStringField(data, 'name');
  const origin = getOptionalLocationField(data, 'origin');
  const image = getOptionalStringField(data, 'image');
  const born = getOptionalDateField(data, 'born');
  const died = getOptionalDateField(data, 'died');
  const affinity = getOptionalStringField(data, 'affinity');
  const relatedCharacters = getRelatedCharactersField(data.related_characters);
  const knowledge = getKnowledgeField(data);

  return {
    id,
    name,
    origin,
    image,
    born,
    died,
    affinity,
    relatedCharacters,
    knowledge,
    body: content,
  };
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
  // Parsea origin aqui para no acoplar SimpleEntity a la semantica de localizaciones.
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
