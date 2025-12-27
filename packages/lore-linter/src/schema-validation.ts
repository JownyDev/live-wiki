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
};

const validateCardFields = (context: SchemaContext): void => {
  validateCardElements(context);
  validateCardRepresents(context);
};

const validateRelatedFields = (context: SchemaContext): void => {
  for (const [field, value] of Object.entries(context.data)) {
    if (!field.startsWith('related_')) {
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
