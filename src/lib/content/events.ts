import { readFile } from 'node:fs/promises';
import path from 'node:path';
import {
  getDateField,
  getEventParticipantsField,
  getLocationsField,
  getStringField,
  parseFrontmatter,
  type EventParticipant,
} from './frontmatter';
import { parseLocationRef } from './location-refs';
import { listMarkdownFiles } from './markdown-files';

type EventListItem = { id: string; title: string; date: string };
type Event = {
  id: string;
  title: string;
  date: string;
  who: EventParticipant[];
  locations: string[];
  body: string;
};

type NodeErrorWithCode = Error & { code?: string };

const getEventsDir = (baseDir?: string): string => {
  const resolvedBaseDir = baseDir ?? path.resolve(process.cwd(), 'content');
  return path.join(resolvedBaseDir, 'events');
};

const getPlacesDir = (baseDir?: string): string => {
  const resolvedBaseDir = baseDir ?? path.resolve(process.cwd(), 'content');
  return path.join(resolvedBaseDir, 'places');
};

const parseAndValidateEventMarkdown = (markdown: string): Event => {
  const { data, content } = parseFrontmatter(markdown);
  if (data.type !== 'event') {
    throw new Error('Invalid type');
  }

  const id = getStringField(data, 'id');
  const title = getStringField(data, 'title');
  const date = getDateField(data, 'date');
  const who = getEventParticipantsField(data, 'who');
  const locations = getLocationsField(data, 'locations');

  return { id, title, date, who, locations, body: content };
};

const isEnoentError = (error: unknown): error is NodeErrorWithCode =>
  error instanceof Error && (error as NodeErrorWithCode).code === 'ENOENT';

const readEventFromFile = async (eventsDir: string, filename: string): Promise<Event> => {
  const filePath = path.join(eventsDir, filename);
  const markdown = await readFile(filePath, 'utf8');
  return parseAndValidateEventMarkdown(markdown);
};

const parsePlacePlanetId = (
  markdown: string,
): { id: string; planetId: string | null } => {
  const { data } = parseFrontmatter(markdown);
  if (data.type !== 'place') {
    throw new Error('Invalid type');
  }

  const id = getStringField(data, 'id');
  const planetValue = data.planetId;
  if (typeof planetValue === 'undefined') {
    return { id, planetId: null };
  }
  if (typeof planetValue !== 'string') {
    throw new Error('Invalid planetId');
  }

  const parsed = parseLocationRef(planetValue);
  if (!parsed || parsed.kind !== 'planet') {
    throw new Error('Invalid planetId');
  }

  return { id, planetId: parsed.id };
};

const listPlacePlanetIds = async (baseDir?: string): Promise<Map<string, string>> => {
  const placesDir = getPlacesDir(baseDir);
  const markdownFiles = await listMarkdownFiles(placesDir);
  const planetIdsByPlace = new Map<string, string>();

  // Deriva planetas desde places para evitar duplicar el dato en events (ver docs/design/002-life-wiki.md).
  for (const filename of markdownFiles) {
    const filePath = path.join(placesDir, filename);
    const markdown = await readFile(filePath, 'utf8');
    const { id, planetId } = parsePlacePlanetId(markdown);
    if (planetId) {
      planetIdsByPlace.set(id, planetId);
    }
  }

  return planetIdsByPlace;
};

const getPlaceIdFromLocation = (location: string): string | null => {
  const parsed = parseLocationRef(location);
  return parsed?.kind === 'place' ? parsed.id : null;
};

export async function listEvents(baseDir?: string): Promise<Array<EventListItem>> {
  const eventsDir = getEventsDir(baseDir);
  const markdownFiles = await listMarkdownFiles(eventsDir);

  const events: EventListItem[] = [];
  for (const filename of markdownFiles) {
    const { id, title, date } = await readEventFromFile(eventsDir, filename);
    events.push({ id, title, date });
  }

  events.sort((a, b) => a.id.localeCompare(b.id));
  return events;
}

export async function getEventById(
  id: string,
  baseDir?: string,
): Promise<Event | null> {
  const eventsDir = getEventsDir(baseDir);
  const filePath = path.join(eventsDir, `${id}.md`);

  let markdown: string;
  try {
    markdown = await readFile(filePath, 'utf8');
  } catch (error: unknown) {
    if (isEnoentError(error)) {
      return null;
    }
    throw error;
  }

  return parseAndValidateEventMarkdown(markdown);
}

export async function listEventsByCharacterId(
  characterId: string,
  baseDir?: string,
): Promise<Array<EventListItem>> {
  const eventsDir = getEventsDir(baseDir);
  const markdownFiles = await listMarkdownFiles(eventsDir);

  const events: EventListItem[] = [];
  for (const filename of markdownFiles) {
    const { id, title, date, who } = await readEventFromFile(eventsDir, filename);
    if (who.some((participant) => participant.character === characterId)) {
      events.push({ id, title, date });
    }
  }

  // Timeline ascendente como base para vistas de "eventos de X" en el MVP.
  events.sort((a, b) => a.date.localeCompare(b.date));
  return events;
}

export async function listEventsByPlaceId(
  placeId: string,
  baseDir?: string,
): Promise<Array<EventListItem>> {
  const eventsDir = getEventsDir(baseDir);
  const markdownFiles = await listMarkdownFiles(eventsDir);
  const targetLocation = `place:${placeId}`;

  const events: EventListItem[] = [];
  for (const filename of markdownFiles) {
    const { id, title, date, locations } = await readEventFromFile(eventsDir, filename);
    if (locations.includes(targetLocation)) {
      events.push({ id, title, date });
    }
  }

  // Timeline ascendente para vistas por lugar.
  events.sort((a, b) => a.date.localeCompare(b.date));
  return events;
}

export async function listEventsByPlanetId(
  planetId: string,
  baseDir?: string,
): Promise<Array<EventListItem>> {
  const eventsDir = getEventsDir(baseDir);
  const markdownFiles = await listMarkdownFiles(eventsDir);
  const planetIdsByPlace = await listPlacePlanetIds(baseDir);
  const targetLocation = `planet:${planetId}`;

  // Evita duplicados cuando un evento coincide por planet directo y por place derivado.
  const eventsById = new Map<string, EventListItem>();
  for (const filename of markdownFiles) {
    const { id, title, date, locations } = await readEventFromFile(eventsDir, filename);
    const hasDirectPlanet = locations.includes(targetLocation);
    const hasDerivedPlanet = locations.some((location) => {
      const placeRef = getPlaceIdFromLocation(location);
      if (!placeRef) {
        return false;
      }
      return planetIdsByPlace.get(placeRef) === planetId;
    });

    if (hasDirectPlanet || hasDerivedPlanet) {
      eventsById.set(id, { id, title, date });
    }
  }

  const events = Array.from(eventsById.values());
  // Timeline ascendente para vistas por planeta.
  events.sort((a, b) => a.date.localeCompare(b.date));
  return events;
}
