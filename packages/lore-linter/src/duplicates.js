"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.collectDuplicateIds = void 0;
const toDuplicateKey = (meta) => `${meta.type}:${meta.id}`;
const buildIdIndex = (records) => {
    const byKey = new Map();
    for (const record of records) {
        const key = toDuplicateKey(record.meta);
        const existing = byKey.get(key);
        if (existing) {
            existing.paths.push(record.path);
        }
        else {
            byKey.set(key, {
                type: record.meta.type,
                id: record.meta.id,
                paths: [record.path],
            });
        }
    }
    return byKey;
};
const collectDuplicateEntries = (index) => {
    const duplicates = [];
    for (const entry of index.values()) {
        if (entry.paths.length > 1) {
            duplicates.push(entry);
        }
    }
    return duplicates;
};
const formatDuplicate = (entry) => ({
    ...entry,
    message: 'Duplicate id',
});
/**
 * Agrupa por type+id y devuelve solo los casos con mas de un archivo.
 * @param records Pares (meta, path) ya parseados.
 * @returns Lista de duplicados con sus paths.
 */
const collectDuplicateIds = (records) => {
    const index = buildIdIndex(records);
    return collectDuplicateEntries(index).map(formatDuplicate);
};
exports.collectDuplicateIds = collectDuplicateIds;
