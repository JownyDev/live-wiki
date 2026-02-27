import { parseLocationRef } from "./location-refs";

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

const isString = (value: unknown): value is string => typeof value === "string";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  isRecord(value) && !Array.isArray(value);

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every(isString);

const isNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const hasInvalidOptionalStringFields = (
  record: Record<string, unknown>,
  fields: string[],
): boolean =>
  fields.some(
    (field) => typeof record[field] !== "undefined" && !isString(record[field]),
  );

const hasInvalidOptionalStringArrayFields = (
  record: Record<string, unknown>,
  fields: string[],
): boolean =>
  fields.some(
    (field) =>
      typeof record[field] !== "undefined" && !isStringArray(record[field]),
  );

const hasInvalidOptionalNumberFields = (
  record: Record<string, unknown>,
  fields: string[],
): boolean =>
  fields.some(
    (field) => typeof record[field] !== "undefined" && !isNumber(record[field]),
  );

const hasInvalidRecordValues = (
  record: Record<string, unknown>,
  validator: (value: unknown) => boolean,
): boolean => Object.values(record).some((value) => !validator(value));

const isIsoDate = (value: string): boolean => /^\d{4}-\d{2}-\d{2}$/.test(value);

const isValidIsoDate = (value: string): boolean => {
  if (!isIsoDate(value)) {
    return false;
  }
  const [year, month, day] = value.split("-").map((part) => Number(part));
  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day)
  ) {
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
  const match = raw.match(new RegExp(`^${field}:\\s*(.+)\\s*$`, "m"));
  if (!match) {
    return null;
  }
  return match[1].trim().replace(/^['"]|['"]$/g, "");
};

const isValidWho = (value: unknown): boolean => {
  if (!Array.isArray(value)) {
    return false;
  }
  return value.every((entry) => isRecord(entry) && isString(entry.character));
};

const requiredStringFieldsByType: Partial<Record<string, string[]>> = {
  character: ["id", "name"],
  element: ["id", "name"],
  place: ["id", "name"],
  planet: ["id", "name"],
  event: ["id", "title"],
  mechanic: ["id", "name", "difficulty"],
  card: ["id", "name"],
  object: ["id", "name", "rarity", "slot", "effect_description"],
};

const optionalNonEmptyStringFieldsByType: Partial<Record<string, string[]>> = {
  character: ["image"],
  element: ["image"],
  event: ["image"],
  place: ["image"],
  planet: ["image"],
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

const getOptionalRecordField = (
  context: SchemaContext,
  parent: Record<string, unknown>,
  field: string,
  errorField: string,
): Record<string, unknown> | null | undefined => {
  const value = parent[field];
  if (typeof value === "undefined") {
    return undefined;
  }
  if (!isRecord(value)) {
    addSchemaError(context, errorField, "invalid-shape");
    return null;
  }
  return value;
};

const getOptionalRecord = (
  context: SchemaContext,
  field: string,
): Record<string, unknown> | null => {
  const value = context.data[field];
  if (typeof value === "undefined") {
    return null;
  }
  if (!isRecord(value)) {
    addSchemaError(context, field, "invalid-shape");
    return null;
  }
  return value;
};

const getOptionalStringValue = (
  context: SchemaContext,
  field: string,
  value: unknown,
): string | null => {
  if (typeof value === "undefined") {
    return null;
  }
  if (!isString(value)) {
    addSchemaError(context, field, "invalid-shape");
    return null;
  }
  return value;
};

const validateOptionalStringFields = (
  context: SchemaContext,
  record: Record<string, unknown>,
  fields: string[],
  errorField: string,
): boolean => {
  if (hasInvalidOptionalStringFields(record, fields)) {
    addSchemaError(context, errorField, "invalid-shape");
    return false;
  }
  return true;
};

const validateOptionalStringArrayFields = (
  context: SchemaContext,
  record: Record<string, unknown>,
  fields: string[],
  errorField: string,
): boolean => {
  if (hasInvalidOptionalStringArrayFields(record, fields)) {
    addSchemaError(context, errorField, "invalid-shape");
    return false;
  }
  return true;
};

const validateOptionalNumberFields = (
  context: SchemaContext,
  record: Record<string, unknown>,
  fields: string[],
  errorField: string,
): boolean => {
  if (hasInvalidOptionalNumberFields(record, fields)) {
    addSchemaError(context, errorField, "invalid-shape");
    return false;
  }
  return true;
};

const validateRequiredStrings = (
  context: SchemaContext,
  fields: string[],
): void => {
  for (const field of fields) {
    if (!isString(context.data[field])) {
      addSchemaError(context, field, "required");
    }
  }
};

type TypedRefArrayIssue = "required" | "invalid-shape" | "invalid-reference";

const getTypedRefArrayIssue = (
  value: unknown,
  required: boolean,
): TypedRefArrayIssue | null => {
  if (typeof value === "undefined") {
    return required ? "required" : null;
  }
  if (!Array.isArray(value)) {
    return "invalid-shape";
  }
  for (const item of value) {
    if (!isString(item)) {
      return "invalid-shape";
    }
    if (!isTypedRef(item)) {
      return "invalid-reference";
    }
  }
  return null;
};

const validateTypedRefArray = (
  context: SchemaContext,
  field: string,
  value: unknown,
  options: { required: boolean },
): void => {
  const issue = getTypedRefArrayIssue(value, options.required);
  if (issue) {
    addSchemaError(context, field, issue);
  }
};

type MinMaxIssue = "invalid-shape" | "invalid-value";

const getMinMaxPairIssue = (value: unknown): MinMaxIssue | null => {
  if (!isPlainObject(value)) {
    return "invalid-shape";
  }
  const min = value.min;
  const max = value.max;
  if (!isNumber(min) || !isNumber(max)) {
    return "invalid-shape";
  }
  if (min > max) {
    return "invalid-value";
  }
  return null;
};

const validateMinMaxPair = (
  context: SchemaContext,
  field: string,
  value: unknown,
): boolean => {
  const issue = getMinMaxPairIssue(value);
  if (issue) {
    addSchemaError(context, field, issue);
    return false;
  }
  return true;
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

  if (rawValue === null && typeof parsedValue === "undefined") {
    if (options.required) {
      addSchemaError(context, field, "required");
    }
    return null;
  }

  // Usa el raw para evitar que YAML normalice fechas invalidas.
  if (rawValue !== null) {
    if (!isValidIsoDate(rawValue)) {
      addSchemaError(context, field, "invalid-date");
      return null;
    }
    return rawValue;
  }

  if (!isString(parsedValue) || !isValidIsoDate(parsedValue)) {
    addSchemaError(context, field, "invalid-date");
    return null;
  }

  return parsedValue;
};

const validateRequiredFields = (context: SchemaContext): void => {
  const requiredFields = requiredStringFieldsByType[context.type];
  if (!requiredFields) {
    return;
  }
  validateRequiredStrings(context, requiredFields);
};

const validateEventDate = (context: SchemaContext): void => {
  validateDateField(context, "date", { required: true });
};

const validateEventWho = (context: SchemaContext): void => {
  const who = context.data.who;
  if (typeof who === "undefined") {
    addSchemaError(context, "who", "required");
  } else if (!isValidWho(who)) {
    addSchemaError(context, "who", "invalid-shape");
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
  return parseWithPrefix(value, "character:");
};

const hasPrefix = (value: string, prefix: string): boolean =>
  parseWithPrefix(value, prefix) !== null;

const isTypedRef = (value: string): boolean => {
  const firstSeparator = value.indexOf(":");
  if (firstSeparator <= 0 || firstSeparator >= value.length - 1) {
    return false;
  }
  return value.lastIndexOf(":") === firstSeparator;
};

const isAllowedRepresentsRef = (value: string): boolean => {
  if (hasPrefix(value, "character:")) {
    return true;
  }
  if (hasPrefix(value, "event:")) {
    return true;
  }
  const location = parseLocationRef(value);
  return location
    ? location.kind === "place" || location.kind === "planet"
    : false;
};

const isElementRef = (value: string): boolean => {
  return hasPrefix(value, "element:");
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
    addSchemaError(context, field, "invalid-reference");
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
    addSchemaError(context, field, "invalid-reference");
  }
};

type NonEmptyStringIssue = "invalid-shape" | "invalid-value";

const getRequiredNonEmptyStringIssue = (
  value: unknown,
): NonEmptyStringIssue | null => {
  if (!isString(value)) {
    return "invalid-shape";
  }
  if (value.trim().length === 0) {
    return "invalid-value";
  }
  return null;
};

const getNonEmptyStringArrayIssue = (
  value: unknown,
): NonEmptyStringIssue | null => {
  if (!Array.isArray(value)) {
    return "invalid-shape";
  }
  if (value.length === 0) {
    return "invalid-value";
  }
  for (const entry of value) {
    if (!isString(entry)) {
      return "invalid-shape";
    }
    if (entry.trim().length === 0) {
      return "invalid-value";
    }
  }
  return null;
};

const isOptionalStringArrayInvalid = (value: unknown): boolean =>
  typeof value !== "undefined" && !isStringArray(value);

const validateCharacterPersona = (context: SchemaContext): void => {
  const persona = getOptionalRecord(context, "persona");
  if (!persona) {
    return;
  }
  if (
    !validateOptionalStringFields(context, persona, ["archetype"], "persona") ||
    !validateOptionalStringArrayFields(
      context,
      persona,
      ["traits", "values", "taboos", "biography_bullets"],
      "persona",
    )
  ) {
    return;
  }
  const voice = getOptionalRecordField(context, persona, "voice", "persona");
  if (voice === null) {
    return;
  }
  if (voice) {
    if (
      !validateOptionalStringFields(context, voice, ["tone"], "persona") ||
      !validateOptionalStringArrayFields(
        context,
        voice,
        ["style_notes"],
        "persona",
      )
    ) {
      return;
    }
  }
};

const validateCharacterKnowledge = (context: SchemaContext): void => {
  const knowledge = getOptionalRecord(context, "knowledge");
  if (!knowledge) {
    return;
  }
  if (
    !validateOptionalStringFields(
      context,
      knowledge,
      ["summary"],
      "knowledge",
    ) ||
    !validateOptionalStringArrayFields(
      context,
      knowledge,
      ["knows_about", "blindspots", "can_reveal"],
      "knowledge",
    )
  ) {
    return;
  }
};

const validateCharacterMemoryProfile = (context: SchemaContext): void => {
  const memoryProfile = getOptionalRecord(context, "memory_profile");
  if (!memoryProfile) {
    return;
  }
  if (
    !validateOptionalStringArrayFields(
      context,
      memoryProfile,
      ["interest_tags", "relationship_tags", "allowed_tags", "blocked_tags"],
      "memory_profile",
    )
  ) {
    return;
  }
  const provenancePolicy = getOptionalRecordField(
    context,
    memoryProfile,
    "provenance_policy",
    "memory_profile",
  );
  if (provenancePolicy === null) {
    return;
  }
  if (provenancePolicy) {
    if (
      !validateOptionalStringArrayFields(
        context,
        provenancePolicy,
        ["allowed"],
        "memory_profile",
      ) ||
      !validateOptionalStringFields(
        context,
        provenancePolicy,
        ["default"],
        "memory_profile",
      )
    ) {
      return;
    }
  }
  const retrievalLimits = getOptionalRecordField(
    context,
    memoryProfile,
    "retrieval_limits",
    "memory_profile",
  );
  if (retrievalLimits === null) {
    return;
  }
  if (retrievalLimits) {
    validateOptionalNumberFields(
      context,
      retrievalLimits,
      ["max_items", "max_tokens_summary"],
      "memory_profile",
    );
  }
};

const validateCharacterEmotionsProfile = (context: SchemaContext): void => {
  const emotionsProfile = getOptionalRecord(context, "emotions_profile");
  if (!emotionsProfile) {
    return;
  }
  const baselineMood = getOptionalRecordField(
    context,
    emotionsProfile,
    "baseline_mood",
    "emotions_profile",
  );
  if (baselineMood === null) {
    return;
  }
  if (baselineMood && hasInvalidRecordValues(baselineMood, isNumber)) {
    addSchemaError(context, "emotions_profile", "invalid-shape");
    return;
  }
  const towardPlayer = getOptionalRecordField(
    context,
    emotionsProfile,
    "toward_player_default",
    "emotions_profile",
  );
  if (towardPlayer === null) {
    return;
  }
  if (
    towardPlayer &&
    !validateOptionalStringFields(
      context,
      towardPlayer,
      ["stance", "note"],
      "emotions_profile",
    )
  ) {
    return;
  }
  const sensitivities = getOptionalRecordField(
    context,
    emotionsProfile,
    "sensitivities",
    "emotions_profile",
  );
  if (sensitivities === null) {
    return;
  }
  if (
    sensitivities &&
    !validateOptionalStringArrayFields(
      context,
      sensitivities,
      ["angers_if", "calms_if"],
      "emotions_profile",
    )
  ) {
    return;
  }
  const manipulability = getOptionalRecordField(
    context,
    emotionsProfile,
    "manipulability",
    "emotions_profile",
  );
  if (manipulability === null) {
    return;
  }
  if (
    manipulability &&
    (!validateOptionalStringFields(
      context,
      manipulability,
      ["by_empathy", "by_bribe", "by_intimidation", "by_authority"],
      "emotions_profile",
    ) ||
      !validateOptionalStringArrayFields(
        context,
        manipulability,
        ["notes"],
        "emotions_profile",
      ))
  ) {
    return;
  }
};

const validateCharacterGoals = (context: SchemaContext): void => {
  const goals = getOptionalRecord(context, "goals");
  if (!goals) {
    return;
  }
  validateOptionalStringArrayFields(
    context,
    goals,
    ["long_term", "typical_priorities"],
    "goals",
  );
};

const validateCapabilityActionEntry = (
  context: SchemaContext,
  entry: Record<string, unknown>,
): boolean => {
  const actionIssue = getRequiredNonEmptyStringIssue(entry.action);
  if (actionIssue) {
    addSchemaError(context, "capabilities", actionIssue);
    return false;
  }
  const triggerIssue = getNonEmptyStringArrayIssue(entry.triggers);
  if (triggerIssue) {
    addSchemaError(context, "capabilities", triggerIssue);
    return false;
  }
  if (isOptionalStringArrayInvalid(entry.notes)) {
    addSchemaError(context, "capabilities", "invalid-shape");
    return false;
  }
  if (isOptionalStringArrayInvalid(entry.filters)) {
    addSchemaError(context, "capabilities", "invalid-shape");
  }
  return true;
};

const validateCapabilityActions = (
  context: SchemaContext,
  actions: unknown,
): void => {
  if (!Array.isArray(actions)) {
    addSchemaError(context, "capabilities", "invalid-shape");
    return;
  }
  for (const entry of actions) {
    if (!isRecord(entry)) {
      addSchemaError(context, "capabilities", "invalid-shape");
      return;
    }
    if (!validateCapabilityActionEntry(context, entry)) {
      return;
    }
  }
};

const validateCharacterCapabilities = (context: SchemaContext): void => {
  const capabilities = getOptionalRecord(context, "capabilities");
  if (!capabilities) {
    return;
  }
  validateCapabilityActions(context, capabilities.actions);
};

type RelatedCharacterEntry = {
  type: string;
  character: string;
};

const getRelatedCharacterEntries = (
  context: SchemaContext,
): RelatedCharacterEntry[] | null => {
  const related = context.data.related_characters;
  if (typeof related === "undefined") {
    return null;
  }
  if (!Array.isArray(related)) {
    addSchemaError(context, "related_characters", "invalid-shape");
    return null;
  }
  const entries: RelatedCharacterEntry[] = [];
  for (const entry of related) {
    if (!isRecord(entry)) {
      addSchemaError(context, "related_characters", "invalid-shape");
      return null;
    }
    const typeValue = entry.type;
    const characterValue = entry.character;
    if (!isString(typeValue) || !isString(characterValue)) {
      addSchemaError(context, "related_characters", "invalid-shape");
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
      addSchemaError(context, "related_characters", "invalid-value");
      return;
    }
    const characterId = getCharacterRefId(entry.character);
    if (!characterId) {
      addSchemaError(context, "related_characters", "invalid-reference");
      return;
    }
    if (seenCharacters.has(characterId)) {
      addSchemaError(context, "related_characters", "invalid-value");
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
  if (typeof elements === "undefined") {
    addSchemaError(context, "elements", "required");
    return;
  }
  if (!Array.isArray(elements) || elements.length !== 2) {
    addSchemaError(context, "elements", "invalid-length");
  }
};

const validateCardRepresents = (context: SchemaContext): void => {
  const represents = context.data.represents;
  if (typeof represents === "undefined") {
    return;
  }
  if (!Array.isArray(represents)) {
    addSchemaError(context, "represents", "invalid-reference");
    return;
  }
  const hasInvalidEntry = represents.some(
    (entry) => !isValidCardRepresentsEntry(entry),
  );
  if (hasInvalidEntry) {
    addSchemaError(context, "represents", "invalid-reference");
  }
};

const validateEventFields = (context: SchemaContext): void => {
  validateEventDate(context);
  validateEventWho(context);
};

const validateCharacterFields = (context: SchemaContext): void => {
  const born = validateDateField(context, "born", { required: false });
  const died = validateDateField(context, "died", { required: false });
  if (born && died && died < born) {
    addSchemaError(context, "died", "invalid-date");
  }
  validateOptionalElementRefField(context, "affinity", context.data.affinity);
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
  validateOptionalOriginField(context, "origin", context.data.origin);
};

const validateMechanicFields = (context: SchemaContext): void => {
  const relatedElements = context.data.related_elements;
  if (
    typeof relatedElements !== "undefined" &&
    !isStringArray(relatedElements)
  ) {
    addSchemaError(context, "related_elements", "invalid-shape");
  }
};

const objectSlots = new Set([
  "helmet",
  "shoulders",
  "gloves",
  "pants",
  "boots",
]);
const objectStats = ["attack", "defense", "cdr", "max_hp"] as const;

const validateObjectStats = (context: SchemaContext): void => {
  const stats = context.data.stats;
  if (typeof stats === "undefined") {
    return;
  }
  if (!isRecord(stats)) {
    addSchemaError(context, "stats", "invalid-shape");
    return;
  }
  if (Object.keys(stats).length === 0) {
    addSchemaError(context, "stats", "invalid-value");
    return;
  }
  for (const statName of objectStats) {
    const statValue = stats[statName];
    if (typeof statValue === "undefined") {
      continue;
    }
    if (!validateMinMaxPair(context, "stats", statValue)) {
      return;
    }
  }
};

const validateObjectFields = (context: SchemaContext): void => {
  const slot = context.data.slot;
  if (isString(slot) && !objectSlots.has(slot)) {
    addSchemaError(context, "slot", "invalid-value");
  }
  validateTypedRefArray(
    context,
    "shares_effect_with",
    context.data.shares_effect_with,
    { required: true },
  );
  validateTypedRefArray(context, "boosts", context.data.boosts, {
    required: true,
  });
  validateObjectStats(context);
};

const validateRelatedFields = (context: SchemaContext): void => {
  for (const [field, value] of Object.entries(context.data)) {
    if (!field.startsWith("related_")) {
      continue;
    }
    if (field === "related_characters" && context.type === "character") {
      continue;
    }
    if (isString(value) || isStringArray(value)) {
      continue;
    }
    addSchemaError(context, field, "invalid-shape");
  }
};

const validateOptionalNonEmptyStringFields = (context: SchemaContext): void => {
  const fields = optionalNonEmptyStringFieldsByType[context.type];
  if (!fields) {
    return;
  }
  for (const field of fields) {
    const value = context.data[field];
    if (typeof value === "undefined") {
      continue;
    }
    if (!isString(value)) {
      addSchemaError(context, field, "invalid-shape");
      continue;
    }
    if (value.length === 0) {
      addSchemaError(context, field, "invalid-value");
    }
  }
};

const typeValidators: Partial<
  Record<string, (context: SchemaContext) => void>
> = {
  character: validateCharacterFields,
  element: validateElementFields,
  event: validateEventFields,
  card: validateCardFields,
  mechanic: validateMechanicFields,
  object: validateObjectFields,
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
