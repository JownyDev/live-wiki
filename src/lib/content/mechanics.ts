import path from 'node:path';
import {
  getSimpleEntityById,
  listSimpleEntities,
  type SimpleEntity,
  type SimpleEntityListItem,
} from './simple-entities';

const getMechanicsDir = (baseDir?: string): string => {
  const resolvedBaseDir = baseDir ?? path.resolve(process.cwd(), 'content');
  return path.join(resolvedBaseDir, 'mechanics');
};

export async function listMechanics(
  baseDir?: string,
): Promise<Array<SimpleEntityListItem>> {
  const mechanicsDir = getMechanicsDir(baseDir);
  // Reusa el parser basico del MVP para mantener el esquema minimo consistente.
  return await listSimpleEntities(mechanicsDir, 'mechanic');
}

export async function getMechanicById(
  id: string,
  baseDir?: string,
): Promise<SimpleEntity | null> {
  const mechanicsDir = getMechanicsDir(baseDir);
  // El contenido de mechanic es texto libre; solo validamos el frontmatter minimo.
  return await getSimpleEntityById(mechanicsDir, 'mechanic', id);
}
