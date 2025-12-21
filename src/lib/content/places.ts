import path from 'node:path';
import {
  getSimpleEntityById,
  listSimpleEntities,
  type SimpleEntity,
  type SimpleEntityListItem,
} from './simple-entities';

const getPlacesDir = (baseDir?: string): string => {
  const resolvedBaseDir = baseDir ?? path.resolve(process.cwd(), 'content');
  return path.join(resolvedBaseDir, 'places');
};

export async function listPlaces(
  baseDir?: string,
): Promise<Array<SimpleEntityListItem>> {
  const placesDir = getPlacesDir(baseDir);
  // Reusa el parser basico del MVP para mantener el esquema minimo consistente.
  return await listSimpleEntities(placesDir, 'place');
}

export async function getPlaceById(
  id: string,
  baseDir?: string,
): Promise<SimpleEntity | null> {
  const placesDir = getPlacesDir(baseDir);
  // El contenido de place es texto libre; solo validamos el frontmatter minimo.
  return await getSimpleEntityById(placesDir, 'place', id);
}
