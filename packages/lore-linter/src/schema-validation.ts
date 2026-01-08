import { parseLocationRef } from './location-refs';

export type SchemaError = {
  type: string;
  id: string | null;
  field: string;
  reason: string;
};

export type RawDoc = {
  data: Record<string, unknown>;
  raw: string | null;
};

const isString = (value: unknown): value is string => typeof value === 'string';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every(isString);

const isNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const isIsoDate = (value: string): boolean => /^\d{4}-\d{2}-\d{2}$/.test(value);

const isValidIsoDate = (value: string): boolean => {
  if (!isIsoDate(value)) {
    return false;
  }
  const [year, month, day] = value.split('-').map((part) => Number(part));
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return false;
  }
  if (month < 1 || month > 12) {
    return false;
  }
  const daysInMonth = new Date(year, month, 0).getDate();
  return day >= 1 && day <= daysInMonth;
};

const getIdOrNull = (data: Record<string, unknown>): string | null =>
  isString(data.id) ? data.id : null;

const getRawField = (raw: string | null, field: string): string | null => {
  if (!raw) {
    return null;
  }
  const match = raw.match(new RegExp(`^${field}:\\s*(.+)\\s*$`, 'm'));
  if (!match) {
    return null;
  }
  return match[1].trim().replace(/^['"]|['"]$/g, '');
};

const isValidWho = (value: unknown): boolean => {
  if (!Array.isArray(value)) {
    return false;
  }
  return value.every((entry) => isRecord(entry) && isString(entry.character));
};

const requiredStringFieldsByType: Partial<Record<string, string[]>> = {
  character: ['id', 'name'],
  element: ['id', 'name'],
  place: ['id', 'name'],
  planet: ['id', 'name'],
  event: ['id', 'title'],
  mechanic: ['id', 'name'],
  card: ['id', 'name'],
};

const optionalNonEmptyStringFieldsByType: Partial<Record<string, string[]>> = {
  character: ['image'],
  element: ['image'],
  event: ['image'],
  place: ['image'],
  planet: ['image'],
};

type SchemaContext = {
  type: string;
  id: string | null;
  data: Record<string, unknown>;
  raw: string | null;
  errors: SchemaError[];
};

const addSchemaError = (
  context: SchemaContext,
  field: string,
  reason: string,
): void => {
  context.errors.push({
    type: context.type,
    id: context.id,
    field,
    reason,
  });
};

const getOptionalRecord = (
  context: SchemaContext,
  field: string,
): Record<string, unknown> | null => {
  const value = context.data[field];
  if (typeof value === 'undefined') {
    return null;
  }
  if (!isRecord(value)) {
    addSchemaError(context, field, 'invalid-shape');
    return null;
  }
  return value;
};

const getOptionalStringValue = (
  context: SchemaContext,
  field: string,
  value: unknown,
): string | null => {
  if (typeof value === 'undefined') {
    return null;
  }
  if (!isString(value)) {
    addSchemaError(context, field, 'invalid-shape');
    return null;
  }
  return value;
};

const addRequiredStringFields = (context: SchemaContext, fields: string[]): void => {
  for (const field of fields) {
    if (!isString(context.data[field])) {
      addSchemaError(context, field, 'required');
    }
  }
};

type DateFieldOptions = {
  required: boolean;
};

const validateDateField = (
  context: SchemaContext,
  field: string,
  options: DateFieldOptions,
): string | null => {
  const rawValue = getRawField(context.raw, field);
  const parsedValue = context.data[field];

  if (rawValue === null && typeof parsedValue === 'undefined') {
    if (options.required) {
      addSchemaError(context, field, 'required');
    }
    return null;
  }

  // Usa el raw para evitar que YAML normalice fechas invalidas.
  if (rawValue !== null) {
    if (!isValidIsoDate(rawValue)) {
      addSchemaError(context, field, 'invalid-date');
      return null;
    }
    return rawValue;
  }

  if (!isString(parsedValue) || !isValidIsoDate(parsedValue)) {
    addSchemaError(context, field, 'invalid-date');
    return null;
  }

  return parsedValue;
};

const validateRequiredFields = (context: SchemaContext): void => {
  const requiredFields = requiredStringFieldsByType[context.type];
  if (!requiredFields) {
    return;
  }
  addRequiredStringFields(context, requiredFields);
};

const validateEventDate = (context: SchemaContext): void => {
  validateDateField(context, 'date', { required: true });
};

const validateEventWho = (context: SchemaContext): void => {
  const who = context.data.who;
  if (typeof who === 'undefined') {
    addSchemaError(context, 'who', 'required');
  } else if (!isValidWho(who)) {
    addSchemaError(context, 'who', 'invalid-shape');
  }
};

const parseWithPrefix = (value: string, prefix: string): string | null => {
  if (!value.startsWith(prefix)) {
    return null;
  }
  const id = value.slice(prefix.length);
  return id.length > 0 ? id : null;
};

const getCharacterRefId = (value: string): string | null => {
  return parseWithPrefix(value, 'character:');
};

const hasPrefix = (value: string, prefix: string): boolean =>
  parseWithPrefix(value, prefix) !== null;

const isAllowedRepresentsRef = (value: string): boolean => {
  if (hasPrefix(value, 'character:')) {
    return true;
  }
  if (hasPrefix(value, 'event:')) {
    return true;
  }
  const location = parseLocationRef(value);
  return location ? location.kind === 'place' || location.kind === 'planet' : false;
};

const isElementRef = (value: string): boolean => {
  return hasPrefix(value, 'element:');
};

const validateOptionalElementRefField = (
  context: SchemaContext,
  field: string,
  value: unknown,
): void => {
  const stringValue = getOptionalStringValue(context, field, value);
  if (stringValue === null) {
    return;
  }
  if (!isElementRef(stringValue)) {
    addSchemaError(context, field, 'invalid-reference');
  }
};

const validateOptionalOriginField = (
  context: SchemaContext,
  field: string,
  value: unknown,
): void => {
  const stringValue = getOptionalStringValue(context, field, value);
  if (stringValue === null) {
    return;
  }
  if (!parseLocationRef(stringValue)) {
    addSchemaError(context, field, 'invalid-reference');
  }
};

const validateCharacterPersona = (context: SchemaContext): void => {
  const persona = getOptionalRecord(context, 'persona');
  if (!persona) {
    return;
  }
  if (
    (typeof persona.archetype !== 'undefined' && !isString(persona.archetype)) ||
    (typeof persona.traits !== 'undefined' && !isStringArray(persona.traits)) ||
    (typeof persona.values !== 'undefined' && !isStringArray(persona.values)) ||
    (typeof persona.taboos !== 'undefined' && !isStringArray(persona.taboos)) ||
    (typeof persona.biography_bullets !== 'undefined' &&
      !isStringArray(persona.biography_bullets))
  ) {
    addSchemaError(context, 'persona', 'invalid-shape');
    return;
  }
  if (typeof persona.voice !== 'undefined') {
    if (!isRecord(persona.voice)) {
      addSchemaError(context, 'persona', 'invalid-shape');
      return;
    }
    const voice = persona.voice;
    if (
      (typeof voice.tone !== 'undefined' && !isString(voice.tone)) ||
      (typeof voice.style_notes !== 'undefined' &&
        !isStringArray(voice.style_notes))
    ) {
      addSchemaError(context, 'persona', 'invalid-shape');
      return;
    }
  }
};

const validateCharacterKnowledge = (context: SchemaContext): void => {
  const knowledge = getOptionalRecord(context, 'knowledge');
  if (!knowledge) {
    return;
  }
  if (
    (typeof knowledge.summary !== 'undefined' && !isString(knowledge.summary)) ||
    (typeof knowledge.knows_about !== 'undefined' &&
      !isStringArray(knowledge.knows_about)) ||
    (typeof knowledge.blindspots !== 'undefined' &&
      !isStringArray(knowledge.blindspots)) ||
    (typeof knowledge.can_reveal !== 'undefined' &&
      !isStringArray(knowledge.can_reveal))
  ) {
    addSchemaError(context, 'knowledge', 'invalid-shape');
  }
};

const validateCharacterMemoryProfile = (context: SchemaContext): void => {
  const memoryProfile = getOptionalRecord(context, 'memory_profile');
  if (!memoryProfile) {
    return;
  }
  if (
    (typeof memoryProfile.interest_tags !== 'undefined' &&
      !isStringArray(memoryProfile.interest_tags)) ||
    (typeof memoryProfile.relationship_tags !== 'undefined' &&
      !isStringArray(memoryProfile.relationship_tags)) ||
    (typeof memoryProfile.allowed_tags !== 'undefined' &&
      !isStringArray(memoryProfile.allowed_tags)) ||
    (typeof memoryProfile.blocked_tags !== 'undefined' &&
      !isStringArray(memoryProfile.blocked_tags))
  ) {
    addSchemaError(context, 'memory_profile', 'invalid-shape');
    return;
  }
  if (typeof memoryProfile.provenance_policy !== 'undefined') {
    if (!isRecord(memoryProfile.provenance_policy)) {
      addSchemaError(context, 'memory_profile', 'invalid-shape');
      return;
    }
    const policy = memoryProfile.provenance_policy;
    if (
      (typeof policy.allowed !== 'undefined' && !isStringArray(policy.allowed)) ||
      (typeof policy.default !== 'undefined' && !isString(policy.default))
    ) {
      addSchemaError(context, 'memory_profile', 'invalid-shape');
      return;
    }
  }
  if (typeof memoryProfile.retrieval_limits !== 'undefined') {
    if (!isRecord(memoryProfile.retrieval_limits)) {
      addSchemaError(context, 'memory_profile', 'invalid-shape');
      return;
    }
    const limits = memoryProfile.retrieval_limits;
    if (
      (typeof limits.max_items !== 'undefined' && !isNumber(limits.max_items)) ||
      (typeof limits.max_tokens_summary !== 'undefined' &&
        !isNumber(limits.max_tokens_summary))
    ) {
      addSchemaError(context, 'memory_profile', 'invalid-shape');
    }
  }
};

const validateCharacterEmotionsProfile = (context: SchemaContext): void => {
  const emotionsProfile = getOptionalRecord(context, 'emotions_profile');
  if (!emotionsProfile) {
    return;
  }
  if (typeof emotionsProfile.baseline_mood !== 'undefined') {
    if (!isRecord(emotionsProfile.baseline_mood)) {
      addSchemaError(context, 'emotions_profile', 'invalid-shape');
      return;
    }
    const values = Object.values(emotionsProfile.baseline_mood);
    if (values.some((value) => !isNumber(value))) {
      addSchemaError(context, 'emotions_profile', 'invalid-shape');
      return;
    }
  }
  if (typeof emotionsProfile.toward_player_default !== 'undefined') {
    if (!isRecord(emotionsProfile.toward_player_default)) {
      addSchemaError(context, 'emotions_profile', 'invalid-shape');
      return;
    }
    const towardPlayer = emotionsProfile.toward_player_default;
    if (
      (typeof towardPlayer.stance !== 'undefined' &&
        !isString(towardPlayer.stance)) ||
      (typeof towardPlayer.note !== 'undefined' && !isString(towardPlayer.note))
    ) {
      addSchemaError(context, 'emotions_profile', 'invalid-shape');
      return;
    }
  }
  if (typeof emotionsProfile.sensitivities !== 'undefined') {
    if (!isRecord(emotionsProfile.sensitivities)) {
      addSchemaError(context, 'emotions_profile', 'invalid-shape');
      return;
    }
    const sensitivities = emotionsProfile.sensitivities;
    if (
      (typeof sensitivities.angers_if !== 'undefined' &&
        !isStringArray(sensitivities.angers_if)) ||
      (typeof sensitivities.calms_if !== 'undefined' &&
        !isStringArray(sensitivities.calms_if))
    ) {
      addSchemaError(context, 'emotions_profile', 'invalid-shape');
      return;
    }
  }
  if (typeof emotionsProfile.manipulability !== 'undefined') {
    if (!isRecord(emotionsProfile.manipulability)) {
      addSchemaError(context, 'emotions_profile', 'invalid-shape');
      return;
    }
    const manipulability = emotionsProfile.manipulability;
    if (
      (typeof manipulability.by_empathy !== 'undefined' &&
        !isString(manipulability.by_empathy)) ||
      (typeof manipulability.by_bribe !== 'undefined' &&
        !isString(manipulability.by_bribe)) ||
      (typeof manipulability.by_intimidation !== 'undefined' &&
        !isString(manipulability.by_intimidation)) ||
      (typeof manipulability.by_authority !== 'undefined' &&
        !isString(manipulability.by_authority)) ||
      (typeof manipulability.notes !== 'undefined' &&
        !isStringArray(manipulability.notes))
    ) {
      addSchemaError(context, 'emotions_profile', 'invalid-shape');
      return;
    }
  }
};

const validateCharacterGoals = (context: SchemaContext): void => {
  const goals = getOptionalRecord(context, 'goals');
  if (!goals) {
    return;
  }
  if (
    (typeof goals.long_term !== 'undefined' &&
      !isStringArray(goals.long_term)) ||
    (typeof goals.typical_priorities !== 'undefined' &&
      !isStringArray(goals.typical_priorities))
  ) {
    addSchemaError(context, 'goals', 'invalid-shape');
  }
};

const validateCharacterCapabilities = (context: SchemaContext): void => {
  const capabilities = getOptionalRecord(context, 'capabilities');
  if (!capabilities) {
    return;
  }
  const actions = capabilities.actions;
  if (!Array.isArray(actions)) {
    addSchemaError(context, 'capabilities', 'invalid-shape');
    return;
  }
  for (const entry of actions) {
    if (!isRecord(entry)) {
      addSchemaError(context, 'capabilities', 'invalid-shape');
      return;
    }
    if (!isString(entry.action)) {
      addSchemaError(context, 'capabilities', 'invalid-shape');
      return;
    }
    if (entry.action.trim().length === 0) {
      addSchemaError(context, 'capabilities', 'invalid-value');
      return;
    }
    if (!Array.isArray(entry.triggers)) {
      addSchemaError(context, 'capabilities', 'invalid-shape');
      return;
    }
    if (entry.triggers.length === 0) {
      addSchemaError(context, 'capabilities', 'invalid-value');
      return;
    }
    for (const trigger of entry.triggers) {
      if (!isString(trigger)) {
        addSchemaError(context, 'capabilities', 'invalid-shape');
        return;
      }
      if (trigger.trim().length === 0) {
        addSchemaError(context, 'capabilities', 'invalid-value');
        return;
      }
    }
    if (typeof entry.notes !== 'undefined' && !isStringArray(entry.notes)) {
      addSchemaError(context, 'capabilities', 'invalid-shape');
      return;
    }
    if (typeof entry.filters !== 'undefined' && !isStringArray(entry.filters)) {
      addSchemaError(context, 'capabilities', 'invalid-shape');
    }
  }
};

type RelatedCharacterEntry = {
  type: string;
  character: string;
};

const getRelatedCharacterEntries = (
  context: SchemaContext,
): RelatedCharacterEntry[] | null => {
  const related = context.data.related_characters;
  if (typeof related === 'undefined') {
    return null;
  }
  if (!Array.isArray(related)) {
    addSchemaError(context, 'related_characters', 'invalid-shape');
    return null;
  }
  const entries: RelatedCharacterEntry[] = [];
  for (const entry of related) {
    if (!isRecord(entry)) {
      addSchemaError(context, 'related_characters', 'invalid-shape');
      return null;
    }
    const typeValue = entry.type;
    const characterValue = entry.character;
    if (!isString(typeValue) || !isString(characterValue)) {
      addSchemaError(context, 'related_characters', 'invalid-shape');
      return null;
    }
    entries.push({ type: typeValue, character: characterValue });
  }
  return entries;
};

const validateRelatedCharacters = (context: SchemaContext): void => {
  const entries = getRelatedCharacterEntries(context);
  if (!entries) {
    return;
  }
  const seenCharacters = new Set<string>();
  for (const entry of entries) {
    if (entry.type.length === 0) {
      addSchemaError(context, 'related_characters', 'invalid-value');
      return;
    }
    const characterId = getCharacterRefId(entry.character);
    if (!characterId) {
      addSchemaError(context, 'related_characters', 'invalid-reference');
      return;
    }
    if (seenCharacters.has(characterId)) {
      addSchemaError(context, 'related_characters', 'invalid-value');
      return;
    }
    seenCharacters.add(characterId);
  }
};

const isValidCardRepresentsEntry = (value: unknown): boolean => {
  if (!isString(value)) {
    return false;
  }
  return !isElementRef(value) && isAllowedRepresentsRef(value);
};

const validateCardElements = (context: SchemaContext): void => {
  const elements = context.data.elements;
  if (typeof elements === 'undefined') {
    addSchemaError(context, 'elements', 'required');
    return;
  }
  if (!Array.isArray(elements) || elements.length !== 2) {
    addSchemaError(context, 'elements', 'invalid-length');
  }
};

const validateCardRepresents = (context: SchemaContext): void => {
  const represents = context.data.represents;
  if (typeof represents === 'undefined') {
    return;
  }
  if (!Array.isArray(represents)) {
    addSchemaError(context, 'represents', 'invalid-reference');
    return;
  }
  const hasInvalidEntry = represents.some(
    (entry) => !isValidCardRepresentsEntry(entry),
  );
  if (hasInvalidEntry) {
    addSchemaError(context, 'represents', 'invalid-reference');
  }
};

const validateEventFields = (context: SchemaContext): void => {
  validateEventDate(context);
  validateEventWho(context);
};

const validateCharacterFields = (context: SchemaContext): void => {
  const born = validateDateField(context, 'born', { required: false });
  const died = validateDateField(context, 'died', { required: false });
  if (born && died && died < born) {
    addSchemaError(context, 'died', 'invalid-date');
  }
  validateOptionalElementRefField(context, 'affinity', context.data.affinity);
  validateRelatedCharacters(context);
  validateCharacterPersona(context);
  validateCharacterKnowledge(context);
  validateCharacterMemoryProfile(context);
  validateCharacterEmotionsProfile(context);
  validateCharacterGoals(context);
  validateCharacterCapabilities(context);
};

const validateCardFields = (context: SchemaContext): void => {
  validateCardElements(context);
  validateCardRepresents(context);
};

const validateElementFields = (context: SchemaContext): void => {
  validateOptionalOriginField(context, 'origin', context.data.origin);
};

const validateRelatedFields = (context: SchemaContext): void => {
  for (const [field, value] of Object.entries(context.data)) {
    if (!field.startsWith('related_')) {
      continue;
    }
    if (field === 'related_characters' && context.type === 'character') {
      continue;
    }
    if (isString(value) || isStringArray(value)) {
      continue;
    }
    addSchemaError(context, field, 'invalid-shape');
  }
};

const validateOptionalNonEmptyStringFields = (context: SchemaContext): void => {
  const fields = optionalNonEmptyStringFieldsByType[context.type];
  if (!fields) {
    return;
  }
  for (const field of fields) {
    const value = context.data[field];
    if (typeof value === 'undefined') {
      continue;
    }
    if (!isString(value)) {
      addSchemaError(context, field, 'invalid-shape');
      continue;
    }
    if (value.length === 0) {
      addSchemaError(context, field, 'invalid-value');
    }
  }
};

const typeValidators: Partial<Record<string, (context: SchemaContext) => void>> = {
  character: validateCharacterFields,
  element: validateElementFields,
  event: validateEventFields,
  card: validateCardFields,
};

/**
 * Valida schema minimo por tipo y fechas ISO en events.
 * @param docs Documentos con frontmatter parseado.
 * @returns Errores de schema detectados.
 */
export const collectSchemaErrors = (docs: RawDoc[]): SchemaError[] => {
  const errors: SchemaError[] = [];

  for (const doc of docs) {
    const type = doc.data.type;
    if (!isString(type)) {
      continue;
    }
    const id = getIdOrNull(doc.data);
    const context: SchemaContext = {
      type,
      id,
      data: doc.data,
      raw: doc.raw,
      errors,
    };

    validateRequiredFields(context);

    const validator = typeValidators[type];
    if (validator) {
      validator(context);
    }

    validateOptionalNonEmptyStringFields(context);
    validateRelatedFields(context);
  }

  return errors;
};
