import { parseLocationRef } from './location-refs';

/** Error de referencia cruzada a un id inexistente. */
export type BrokenReference = {
  type: string;
  id: string;
  field: 'who' | 'locations' | 'origin' | 'planetId';
  reference: string;
};

/** Indices de ids existentes por tipo para validar referencias. */
export type ReferenceIndex = {
  characters: Set<string>;
  places: Set<string>;
  planets: Set<string>;
};

/** Documento parseado con type/id disponible para validaciones. */
export type LoreDoc = {
  type: string;
  id: string;
  data: Record<string, unknown>;
};

const isString = (value: unknown): value is string => typeof value === 'string';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

/**
 * Construye indices de ids existentes para validar referencias cruzadas.
 * @param docs Documentos ya parseados con type/id.
 * @returns Set por entidad para busquedas rapidas.
 */
export const buildReferenceIndex = (docs: LoreDoc[]): ReferenceIndex => {
  const index: ReferenceIndex = {
    characters: new Set<string>(),
    places: new Set<string>(),
    planets: new Set<string>(),
  };

  for (const doc of docs) {
    if (doc.type === 'character') {
      index.characters.add(doc.id);
    }
    if (doc.type === 'place') {
      index.places.add(doc.id);
    }
    if (doc.type === 'planet') {
      index.planets.add(doc.id);
    }
  }

  return index;
};

/**
 * Valida referencias y devuelve errores sin lanzar excepciones.
 * @param docs Documentos a validar.
 * @param index Indices de ids existentes.
 * @returns Lista de referencias rotas encontradas.
 */
export const collectBrokenReferences = (
  docs: LoreDoc[],
  index: ReferenceIndex,
): BrokenReference[] => {
  const broken: BrokenReference[] = [];

  for (const doc of docs) {
    if (doc.type === 'event') {
      const who = doc.data.who;
      if (Array.isArray(who)) {
        for (const entry of who) {
          if (!isRecord(entry)) {
            continue;
          }
          const character = entry.character;
          if (!isString(character)) {
            continue;
          }
          if (!index.characters.has(character)) {
            broken.push({
              type: 'event',
              id: doc.id,
              field: 'who',
              reference: character,
            });
          }
        }
      }

      const locations = doc.data.locations;
      if (Array.isArray(locations)) {
        for (const location of locations) {
          if (!isString(location)) {
            continue;
          }
          const parsed = parseLocationRef(location);
          if (!parsed) {
            continue;
          }
          if (parsed.kind === 'place' && !index.places.has(parsed.id)) {
            broken.push({
              type: 'event',
              id: doc.id,
              field: 'locations',
              reference: location,
            });
          }
          if (parsed.kind === 'planet' && !index.planets.has(parsed.id)) {
            broken.push({
              type: 'event',
              id: doc.id,
              field: 'locations',
              reference: location,
            });
          }
        }
      }
    }

    if (doc.type === 'character') {
      const origin = doc.data.origin;
      if (isString(origin)) {
        const parsed = parseLocationRef(origin);
        if (parsed?.kind === 'place' && !index.places.has(parsed.id)) {
          broken.push({
            type: 'character',
            id: doc.id,
            field: 'origin',
            reference: origin,
          });
        }
        if (parsed?.kind === 'planet' && !index.planets.has(parsed.id)) {
          broken.push({
            type: 'character',
            id: doc.id,
            field: 'origin',
            reference: origin,
          });
        }
      }
    }

    if (doc.type === 'place') {
      const planetId = doc.data.planetId;
      if (isString(planetId)) {
        const parsed = parseLocationRef(planetId);
        if (parsed?.kind === 'planet' && !index.planets.has(parsed.id)) {
          broken.push({
            type: 'place',
            id: doc.id,
            field: 'planetId',
            reference: planetId,
          });
        }
      }
    }
  }

  return broken;
};
