import path from 'node:path';
import {
  getSimpleEntityById,
  listSimpleEntities,
  type SimpleEntity,
  type SimpleEntityListItem,
} from './simple-entities';

export type CharacterListItem = { id: string; name: string };
export type Character = { id: string; name: string; body: string };

const getCharactersDir = (baseDir?: string): string => {
  const resolvedBaseDir = baseDir ?? path.resolve(process.cwd(), 'content');
  return path.join(resolvedBaseDir, 'characters');
};

const toCharacterListItem = (entity: SimpleEntityListItem): CharacterListItem => ({
  id: entity.id,
  name: entity.name,
});

const toCharacter = (entity: SimpleEntity): Character => ({
  id: entity.id,
  name: entity.name,
  body: entity.body,
});

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
  // Adaptador para preservar el tipo público y permitir ampliar Character más adelante.
  const entity = await getSimpleEntityById(charactersDir, 'character', id);
  return entity ? toCharacter(entity) : null;
}
