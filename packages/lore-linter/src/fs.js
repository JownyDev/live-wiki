"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listMarkdownFiles = void 0;
const promises_1 = require("node:fs/promises");
const node_path_1 = __importDefault(require("node:path"));
/**
 * Recorre subdirectorios y solo incluye .md para alinear el linter con contenido.
 * @param baseDir Directorio raiz a recorrer.
 * @returns Paths absolutos a markdown encontrados.
 */
const listMarkdownFiles = async (baseDir) => {
    const entries = await (0, promises_1.readdir)(baseDir, { withFileTypes: true });
    const results = [];
    for (const entry of entries) {
        const entryPath = node_path_1.default.join(baseDir, entry.name);
        if (entry.isDirectory()) {
            results.push(...(await (0, exports.listMarkdownFiles)(entryPath)));
        }
        else if (entry.isFile() && entry.name.endsWith('.md')) {
            results.push(entryPath);
        }
    }
    return results;
};
exports.listMarkdownFiles = listMarkdownFiles;
