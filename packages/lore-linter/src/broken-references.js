"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.collectBrokenReferences = exports.buildReferenceIndex = void 0;
const location_refs_1 = require("./location-refs");
const isString = (value) => typeof value === 'string';
const isRecord = (value) => typeof value === 'object' && value !== null;
/**
 * Construye indices de ids existentes para validar referencias cruzadas.
 * @param docs Documentos ya parseados con type/id.
 * @returns Set por entidad para busquedas rapidas.
 */
const buildReferenceIndex = (docs) => {
    const index = {
        characters: new Set(),
        places: new Set(),
        planets: new Set(),
    };
    for (const doc of docs) {
        if (doc.type === 'character') {
            index.characters.add(doc.id);
        }
        if (doc.type === 'place') {
            index.places.add(doc.id);
        }
        if (doc.type === 'planet') {
            index.planets.add(doc.id);
        }
    }
    return index;
};
exports.buildReferenceIndex = buildReferenceIndex;
/**
 * Valida referencias y devuelve errores sin lanzar excepciones.
 * @param docs Documentos a validar.
 * @param index Indices de ids existentes.
 * @returns Lista de referencias rotas encontradas.
 */
const collectBrokenReferences = (docs, index) => {
    const broken = [];
    for (const doc of docs) {
        if (doc.type === 'event') {
            const who = doc.data.who;
            if (Array.isArray(who)) {
                for (const entry of who) {
                    if (!isRecord(entry)) {
                        continue;
                    }
                    const character = entry.character;
                    if (!isString(character)) {
                        continue;
                    }
                    if (!index.characters.has(character)) {
                        broken.push({
                            type: 'event',
                            id: doc.id,
                            field: 'who',
                            reference: character,
                        });
                    }
                }
            }
            const locations = doc.data.locations;
            if (Array.isArray(locations)) {
                for (const location of locations) {
                    if (!isString(location)) {
                        continue;
                    }
                    const parsed = (0, location_refs_1.parseLocationRef)(location);
                    if (!parsed) {
                        continue;
                    }
                    if (parsed.kind === 'place' && !index.places.has(parsed.id)) {
                        broken.push({
                            type: 'event',
                            id: doc.id,
                            field: 'locations',
                            reference: location,
                        });
                    }
                    if (parsed.kind === 'planet' && !index.planets.has(parsed.id)) {
                        broken.push({
                            type: 'event',
                            id: doc.id,
                            field: 'locations',
                            reference: location,
                        });
                    }
                }
            }
        }
        if (doc.type === 'character') {
            const origin = doc.data.origin;
            if (isString(origin)) {
                const parsed = (0, location_refs_1.parseLocationRef)(origin);
                if (parsed?.kind === 'place' && !index.places.has(parsed.id)) {
                    broken.push({
                        type: 'character',
                        id: doc.id,
                        field: 'origin',
                        reference: origin,
                    });
                }
                if (parsed?.kind === 'planet' && !index.planets.has(parsed.id)) {
                    broken.push({
                        type: 'character',
                        id: doc.id,
                        field: 'origin',
                        reference: origin,
                    });
                }
            }
        }
        if (doc.type === 'place') {
            const planetId = doc.data.planetId;
            if (isString(planetId)) {
                const parsed = (0, location_refs_1.parseLocationRef)(planetId);
                if (parsed?.kind === 'planet' && !index.planets.has(parsed.id)) {
                    broken.push({
                        type: 'place',
                        id: doc.id,
                        field: 'planetId',
                        reference: planetId,
                    });
                }
            }
        }
    }
    return broken;
};
exports.collectBrokenReferences = collectBrokenReferences;
