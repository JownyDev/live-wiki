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

const getIdOrNull = (data: Record<string, unknown>): string | null => {
  return isString(data.id) ? data.id : null;
};

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

    if (type === 'character') {
      if (!isString(doc.data.id)) {
        errors.push({ type, id, field: 'id', reason: 'required' });
      }
      if (!isString(doc.data.name)) {
        errors.push({ type, id, field: 'name', reason: 'required' });
      }
    }

    if (type === 'place') {
      if (!isString(doc.data.id)) {
        errors.push({ type, id, field: 'id', reason: 'required' });
      }
      if (!isString(doc.data.name)) {
        errors.push({ type, id, field: 'name', reason: 'required' });
      }
    }

    if (type === 'planet') {
      if (!isString(doc.data.id)) {
        errors.push({ type, id, field: 'id', reason: 'required' });
      }
      if (!isString(doc.data.name)) {
        errors.push({ type, id, field: 'name', reason: 'required' });
      }
    }

    if (type === 'event') {
      if (!isString(doc.data.id)) {
        errors.push({ type, id, field: 'id', reason: 'required' });
      }
      if (!isString(doc.data.title)) {
        errors.push({ type, id, field: 'title', reason: 'required' });
      }

      const rawDate = getRawField(doc.raw, 'date');
      if (rawDate === null && typeof doc.data.date === 'undefined') {
        errors.push({ type, id, field: 'date', reason: 'required' });
      } else if (rawDate !== null && !isValidIsoDate(rawDate)) {
        errors.push({ type, id, field: 'date', reason: 'invalid-date' });
      } else if (rawDate === null && !isString(doc.data.date)) {
        errors.push({ type, id, field: 'date', reason: 'invalid-date' });
      } else if (rawDate === null && isString(doc.data.date) && !isValidIsoDate(doc.data.date)) {
        errors.push({ type, id, field: 'date', reason: 'invalid-date' });
      }

      const who = doc.data.who;
      if (typeof who === 'undefined') {
        errors.push({ type, id, field: 'who', reason: 'required' });
      } else if (!isValidWho(who)) {
        errors.push({ type, id, field: 'who', reason: 'invalid-shape' });
      }
    }
  }

  return errors;
};
