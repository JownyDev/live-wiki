import path from 'node:path';
import {
  getSimpleEntityById,
  listSimpleEntities,
  type SimpleEntity,
  type SimpleEntityListItem,
} from './simple-entities';

export type ElementListItem = SimpleEntityListItem;
export type Element = SimpleEntity;

const getElementsDir = (baseDir?: string): string => {
  const resolvedBaseDir = baseDir ?? path.resolve(process.cwd(), 'content');
  return path.join(resolvedBaseDir, 'elements');
};

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
  // El contenido de element es texto libre; solo validamos el frontmatter minimo.
  return await getSimpleEntityById(elementsDir, 'element', id);
}
