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
  place: ['id', 'name'],
  planet: ['id', 'name'],
  event: ['id', 'title'],
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

const validateEventDate = (context: SchemaContext): void => {
  const rawDate = getRawField(context.raw, 'date');
  const parsedDate = context.data.date;

  if (rawDate === null && typeof parsedDate === 'undefined') {
    addSchemaError(context, 'date', 'required');
    return;
  }

  // Usa el raw para evitar que YAML normalice fechas invalidas.
  if (rawDate !== null) {
    if (!isValidIsoDate(rawDate)) {
      addSchemaError(context, 'date', 'invalid-date');
    }
    return;
  }

  if (!isString(parsedDate) || !isValidIsoDate(parsedDate)) {
    addSchemaError(context, 'date', 'invalid-date');
  }
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

    const requiredFields = requiredStringFieldsByType[type];
    if (requiredFields) {
      addRequiredStringFields(context, requiredFields);
    }

    if (type === 'event') {
      validateEventDate(context);
      validateEventWho(context);
    }

    if (type === 'card') {
      validateCardElements(context);
      validateCardRepresents(context);
    }
  }

  return errors;
};
