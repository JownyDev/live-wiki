export type LocationRef =
  | { kind: 'place'; id: string }
  | { kind: 'planet'; id: string }
  | { kind: 'space'; id: string }
  | { kind: 'unknown' };

const parseWithPrefix = (value: string, prefix: string): string | null => {
  if (!value.startsWith(prefix)) {
    return null;
  }
  const id = value.slice(prefix.length);
  return id.length > 0 ? id : null;
};

/** Normaliza una referencia de localizacion tipada. */
export const parseLocationRef = (value: string): LocationRef | null => {
  if (value === 'unknown') {
    return { kind: 'unknown' };
  }

  const placeId = parseWithPrefix(value, 'place:');
  if (placeId) {
    return { kind: 'place', id: placeId };
  }

  const planetId = parseWithPrefix(value, 'planet:');
  if (planetId) {
    return { kind: 'planet', id: planetId };
  }

  const spaceId = parseWithPrefix(value, 'space:');
  if (spaceId) {
    return { kind: 'space', id: spaceId };
  }

  return null;
};

/** Valida si una referencia es del formato permitido. */
export const isAllowedLocationRef = (value: string): boolean =>
  parseLocationRef(value) !== null;
