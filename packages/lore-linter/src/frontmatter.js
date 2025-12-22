"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractTypeAndId = exports.readFrontmatterData = exports.readFrontmatter = void 0;
const promises_1 = require("node:fs/promises");
const gray_matter_1 = __importDefault(require("gray-matter"));
const isString = (value) => {
    return typeof value === 'string';
};
const isRecord = (value) => typeof value === 'object' && value !== null;
const extractRawFrontmatter = (contents) => {
    const match = contents.match(/^---\s*\n([\s\S]*?)\n---/);
    return match ? match[1] : null;
};
/**
 * Lee el frontmatter y devuelve un record para otros checks.
 * @param filePath Ruta al markdown.
 * @returns Datos del frontmatter o null si no es un record.
 */
/**
 * Lee el frontmatter y devuelve datos + raw para validaciones mas estrictas.
 * @param filePath Ruta al markdown.
 * @returns Payload con data parseada y raw (si existe).
 */
const readFrontmatter = async (filePath) => {
    const contents = await (0, promises_1.readFile)(filePath, 'utf8');
    const data = (0, gray_matter_1.default)(contents).data;
    if (!isRecord(data)) {
        return null;
    }
    return { data, raw: extractRawFrontmatter(contents) };
};
exports.readFrontmatter = readFrontmatter;
const readFrontmatterData = async (filePath) => {
    const payload = await (0, exports.readFrontmatter)(filePath);
    return payload ? payload.data : null;
};
exports.readFrontmatterData = readFrontmatterData;
/**
 * Ignora archivos sin type/id para no romper el lint por contenido incompleto.
 * @param filePath Ruta al markdown.
 * @returns Identidad basica o null si no es valida.
 */
const extractTypeAndId = async (filePath) => {
    const data = await (0, exports.readFrontmatterData)(filePath);
    if (!data || !isString(data.type) || !isString(data.id)) {
        return null;
    }
    return { type: data.type, id: data.id };
};
exports.extractTypeAndId = extractTypeAndId;
