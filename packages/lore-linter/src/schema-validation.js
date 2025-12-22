"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.collectSchemaErrors = void 0;
const isString = (value) => typeof value === 'string';
const isRecord = (value) => typeof value === 'object' && value !== null;
const isIsoDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value);
const isValidIsoDate = (value) => {
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
const getIdOrNull = (data) => isString(data.id) ? data.id : null;
const getRawField = (raw, field) => {
    if (!raw) {
        return null;
    }
    const match = raw.match(new RegExp(`^${field}:\\s*(.+)\\s*$`, 'm'));
    if (!match) {
        return null;
    }
    return match[1].trim().replace(/^['"]|['"]$/g, '');
};
const isValidWho = (value) => {
    if (!Array.isArray(value)) {
        return false;
    }
    return value.every((entry) => isRecord(entry) && isString(entry.character));
};
const requiredStringFieldsByType = {
    character: ['id', 'name'],
    place: ['id', 'name'],
    planet: ['id', 'name'],
    event: ['id', 'title'],
};
const addRequiredStringFields = (context, fields) => {
    for (const field of fields) {
        if (!isString(context.data[field])) {
            context.errors.push({ type: context.type, id: context.id, field, reason: 'required' });
        }
    }
};
const validateEventDate = (context) => {
    const rawDate = getRawField(context.raw, 'date');
    const parsedDate = context.data.date;
    if (rawDate === null && typeof parsedDate === 'undefined') {
        context.errors.push({ type: context.type, id: context.id, field: 'date', reason: 'required' });
        return;
    }
    // Usa el raw para evitar que YAML normalice fechas invalidas.
    if (rawDate !== null) {
        if (!isValidIsoDate(rawDate)) {
            context.errors.push({
                type: context.type,
                id: context.id,
                field: 'date',
                reason: 'invalid-date',
            });
        }
        return;
    }
    if (!isString(parsedDate) || !isValidIsoDate(parsedDate)) {
        context.errors.push({
            type: context.type,
            id: context.id,
            field: 'date',
            reason: 'invalid-date',
        });
    }
};
const validateEventWho = (context) => {
    const who = context.data.who;
    if (typeof who === 'undefined') {
        context.errors.push({ type: context.type, id: context.id, field: 'who', reason: 'required' });
    }
    else if (!isValidWho(who)) {
        context.errors.push({
            type: context.type,
            id: context.id,
            field: 'who',
            reason: 'invalid-shape',
        });
    }
};
/**
 * Valida schema minimo por tipo y fechas ISO en events.
 * @param docs Documentos con frontmatter parseado.
 * @returns Errores de schema detectados.
 */
const collectSchemaErrors = (docs) => {
    const errors = [];
    for (const doc of docs) {
        const type = doc.data.type;
        if (!isString(type)) {
            continue;
        }
        const id = getIdOrNull(doc.data);
        const context = {
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
    }
    return errors;
};
exports.collectSchemaErrors = collectSchemaErrors;
