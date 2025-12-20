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
  return await listSimpleEntities(placesDir, 'place');
}

export async function getPlaceById(
  id: string,
  baseDir?: string,
): Promise<SimpleEntity | null> {
  const placesDir = getPlacesDir(baseDir);
  return await getSimpleEntityById(placesDir, 'place', id);
}
