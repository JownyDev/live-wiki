import path from 'node:path';
import {
  getSimpleEntityById,
  listSimpleEntities,
  type SimpleEntity,
  type SimpleEntityListItem,
} from './simple-entities';

const getPlanetsDir = (baseDir?: string): string => {
  const resolvedBaseDir = baseDir ?? path.resolve(process.cwd(), 'content');
  return path.join(resolvedBaseDir, 'planets');
};

export async function listPlanets(
  baseDir?: string,
): Promise<Array<SimpleEntityListItem>> {
  const planetsDir = getPlanetsDir(baseDir);
  // Reusa el parser basico del MVP para mantener el esquema minimo consistente.
  return await listSimpleEntities(planetsDir, 'planet');
}

export async function getPlanetById(
  id: string,
  baseDir?: string,
): Promise<SimpleEntity | null> {
  const planetsDir = getPlanetsDir(baseDir);
  // El contenido de planet es texto libre; solo validamos el frontmatter minimo.
  return await getSimpleEntityById(planetsDir, 'planet', id);
}
