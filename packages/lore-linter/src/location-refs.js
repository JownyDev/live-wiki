"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseLocationRef = void 0;
const parseWithPrefix = (value, prefix) => {
    if (!value.startsWith(prefix)) {
        return null;
    }
    const id = value.slice(prefix.length);
    return id.length > 0 ? id : null;
};
/**
 * Parser unico para referencias tipadas; evita duplicar reglas entre checks.
 * @param value Valor crudo del frontmatter.
 * @returns Referencia tipada o null si el formato no coincide.
 */
const parseLocationRef = (value) => {
    if (value === 'unknown') {
        return { kind: 'unknown' };
    }
    const placeId = parseWithPrefix(value, 'place:');
    if (placeId) {
        return { kind: 'place', id: placeId };
    }
    const planetId = parseWithPrefix(value, 'planet:');
    if (planetId) {
        return { kind: 'planet', id: planetId };
    }
    const characterId = parseWithPrefix(value, 'character:');
    if (characterId) {
        return { kind: 'character', id: characterId };
    }
    const spaceId = parseWithPrefix(value, 'space:');
    if (spaceId) {
        return { kind: 'space', id: spaceId };
    }
    return null;
};
exports.parseLocationRef = parseLocationRef;
