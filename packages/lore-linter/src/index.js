"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scanLoreDirectory = void 0;
const broken_references_1 = require("./broken-references");
const duplicates_1 = require("./duplicates");
const frontmatter_1 = require("./frontmatter");
const fs_1 = require("./fs");
const schema_validation_1 = require("./schema-validation");
const isString = (value) => typeof value === 'string';
/**
 * Punto de entrada publico: coordina lectura, parseo y checks basicos.
 * @param baseDir Directorio raiz del contenido.
 * @returns Reporte con duplicados y referencias rotas.
 */
const scanLoreDirectory = async (baseDir) => {
    const files = await (0, fs_1.listMarkdownFiles)(baseDir);
    const records = [];
    const docs = [];
    const rawDocs = [];
    for (const filePath of files) {
        const payload = await (0, frontmatter_1.readFrontmatter)(filePath);
        if (!payload) {
            continue;
        }
        rawDocs.push({ data: payload.data, raw: payload.raw });
        const type = payload.data.type;
        const id = payload.data.id;
        if (!isString(type) || !isString(id)) {
            // Contenido incompleto no debe bloquear el lint; se reporta en checks especificos.
            continue;
        }
        records.push({ meta: { type, id }, path: filePath });
        docs.push({ type, id, data: payload.data });
    }
    const index = (0, broken_references_1.buildReferenceIndex)(docs);
    const brokenReferences = (0, broken_references_1.collectBrokenReferences)(docs, index);
    const schemaErrors = (0, schema_validation_1.collectSchemaErrors)(rawDocs);
    return {
        duplicateIds: (0, duplicates_1.collectDuplicateIds)(records),
        brokenReferences,
        schemaErrors,
    };
};
exports.scanLoreDirectory = scanLoreDirectory;
