import { parseLocationRef } from './location-refs';

/** Error de referencia cruzada a un id inexistente. */
export type BrokenReference = {
  type: string;
  id: string;
  field:
    | 'who'
    | 'locations'
    | 'origin'
    | 'affinity'
    | 'planetId'
    | 'elements'
    | 'represents'
    | `related_${string}`;
  reference: string;
};

/** Indices de ids existentes por tipo para validar referencias. */
export type ReferenceIndex = {
  characters: Set<string>;
  places: Set<string>;
  planets: Set<string>;
  elements: Set<string>;
  events: Set<string>;
  cards: Set<string>;
  mechanics: Set<string>;
};

/** Documento parseado con type/id disponible para validaciones. */
export type LoreDoc = {
  type: string;
  id: string;
  data: Record<string, unknown>;
};

type ReferenceCandidate = {
  docType: string;
  docId: string;
  field: BrokenReference['field'];
  reference: string;
  referenceType: string;
  referenceId: string;
};

const isString = (value: unknown): value is string => typeof value === 'string';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const getStringEntries = (value: unknown): string[] | null => {
  if (isString(value)) {
    return [value];
  }
  if (Array.isArray(value)) {
    return value.filter(isString);
  }
  return null;
};

const getStringArrayEntries = (value: unknown): string[] | null => {
  if (!Array.isArray(value)) {
    return null;
  }
  return value.filter(isString);
};

const characterRefTypes = new Set(['character']);
const elementRefTypes = new Set(['element']);
const representsRefTypes = new Set(['character', 'event', 'place', 'planet']);

const parseTypedRef = (value: string): { type: string; id: string } | null => {
  const separatorIndex = value.indexOf(':');
  if (separatorIndex <= 0 || separatorIndex >= value.length - 1) {
    return null;
  }
  return {
    type: value.slice(0, separatorIndex),
    id: value.slice(separatorIndex + 1),
  };
};

const getReferenceSet = (
  index: ReferenceIndex,
  type: string,
): Set<string> | null => {
  switch (type) {
    case 'character':
      return index.characters;
    case 'place':
      return index.places;
    case 'planet':
      return index.planets;
    case 'element':
      return index.elements;
    case 'event':
      return index.events;
    case 'card':
      return index.cards;
    case 'mechanic':
      return index.mechanics;
    default:
      return null;
  }
};

const collectCandidate = (
  candidates: ReferenceCandidate[],
  doc: LoreDoc,
  field: BrokenReference['field'],
  reference: string,
  referenceType: string,
  referenceId: string,
): void => {
  candidates.push({
    docType: doc.type,
    docId: doc.id,
    field,
    reference,
    referenceType,
    referenceId,
  });
};

const collectWhoCandidates = (
  candidates: ReferenceCandidate[],
  doc: LoreDoc,
): void => {
  const who = doc.data.who;
  if (!Array.isArray(who)) {
    return;
  }
  for (const entry of who) {
    if (!isRecord(entry)) {
      continue;
    }
    const character = entry.character;
    if (!isString(character)) {
      continue;
    }
    collectCandidate(candidates, doc, 'who', character, 'character', character);
  }
};

const collectLocationCandidates = (
  candidates: ReferenceCandidate[],
  doc: LoreDoc,
  field: 'locations' | 'origin' | 'planetId',
  value: unknown,
): void => {
  const entries =
    field === 'locations' ? getStringArrayEntries(value) : getStringEntries(value);
  if (!entries) {
    return;
  }
  for (const entry of entries) {
    const parsed = parseLocationRef(entry);
    if (!parsed) {
      continue;
    }
    if (parsed.kind === 'place' || parsed.kind === 'planet') {
      collectCandidate(candidates, doc, field, entry, parsed.kind, parsed.id);
    }
  }
};

const collectTypedRefCandidates = (
  candidates: ReferenceCandidate[],
  doc: LoreDoc,
  field: BrokenReference['field'],
  value: unknown,
  allowedTypes?: ReadonlySet<string>,
): void => {
  const entries = getStringArrayEntries(value);
  if (!entries) {
    return;
  }
  for (const entry of entries) {
    const parsed = parseTypedRef(entry);
    if (!parsed) {
      continue;
    }
    if (allowedTypes && !allowedTypes.has(parsed.type)) {
      continue;
    }
    collectCandidate(candidates, doc, field, entry, parsed.type, parsed.id);
  }
};

const collectSingleTypedRefCandidate = (
  candidates: ReferenceCandidate[],
  doc: LoreDoc,
  field: BrokenReference['field'],
  value: unknown,
  allowedTypes?: ReadonlySet<string>,
): void => {
  if (!isString(value)) {
    return;
  }
  const parsed = parseTypedRef(value);
  if (!parsed) {
    return;
  }
  if (allowedTypes && !allowedTypes.has(parsed.type)) {
    return;
  }
  collectCandidate(candidates, doc, field, value, parsed.type, parsed.id);
};

const collectRelatedCandidates = (
  candidates: ReferenceCandidate[],
  doc: LoreDoc,
): void => {
  for (const [field, value] of Object.entries(doc.data)) {
    if (!field.startsWith('related_')) {
      continue;
    }
    const entries = getStringEntries(value);
    if (!entries) {
      continue;
    }
    for (const entry of entries) {
      const parsed = parseTypedRef(entry);
      if (!parsed) {
        continue;
      }
      collectCandidate(
        candidates,
        doc,
        field as `related_${string}`,
        entry,
        parsed.type,
        parsed.id,
      );
    }
  }
};

const collectRelatedCharactersCandidates = (
  candidates: ReferenceCandidate[],
  doc: LoreDoc,
): void => {
  const related = doc.data.related_characters;
  if (!Array.isArray(related)) {
    return;
  }
  for (const entry of related) {
    if (!isRecord(entry)) {
      continue;
    }
    collectSingleTypedRefCandidate(
      candidates,
      doc,
      'related_characters',
      entry.character,
      characterRefTypes,
    );
  }
};

const collectReferenceCandidates = (doc: LoreDoc): ReferenceCandidate[] => {
  const candidates: ReferenceCandidate[] = [];

  if (doc.type === 'event') {
    collectWhoCandidates(candidates, doc);
    collectLocationCandidates(candidates, doc, 'locations', doc.data.locations);
  }

  if (doc.type === 'character') {
    collectLocationCandidates(candidates, doc, 'origin', doc.data.origin);
    collectSingleTypedRefCandidate(
      candidates,
      doc,
      'affinity',
      doc.data.affinity,
      elementRefTypes,
    );
    collectRelatedCharactersCandidates(candidates, doc);
  }

  if (doc.type === 'element') {
    collectLocationCandidates(candidates, doc, 'origin', doc.data.origin);
  }

  if (doc.type === 'place') {
    collectLocationCandidates(candidates, doc, 'planetId', doc.data.planetId);
  }

  if (doc.type === 'card') {
    collectTypedRefCandidates(
      candidates,
      doc,
      'elements',
      doc.data.elements,
      elementRefTypes,
    );
    collectTypedRefCandidates(
      candidates,
      doc,
      'represents',
      doc.data.represents,
      representsRefTypes,
    );
  }

  collectRelatedCandidates(candidates, doc);

  return candidates;
};

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
    elements: new Set<string>(),
    events: new Set<string>(),
    cards: new Set<string>(),
    mechanics: new Set<string>(),
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
    if (doc.type === 'element') {
      index.elements.add(doc.id);
    }
    if (doc.type === 'event') {
      index.events.add(doc.id);
    }
    if (doc.type === 'card') {
      index.cards.add(doc.id);
    }
    if (doc.type === 'mechanic') {
      index.mechanics.add(doc.id);
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
  const candidates = docs.flatMap(collectReferenceCandidates);
  const broken: BrokenReference[] = [];

  for (const candidate of candidates) {
    const referenceSet = getReferenceSet(index, candidate.referenceType);
    if (!referenceSet || referenceSet.has(candidate.referenceId)) {
      continue;
    }
    broken.push({
      type: candidate.docType,
      id: candidate.docId,
      field: candidate.field,
      reference: candidate.reference,
    });
  }

  return broken;
};
