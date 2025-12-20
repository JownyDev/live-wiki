import { readFile } from 'node:fs/promises';
import path from 'node:path';
import {
  getDateField,
  getStringField,
  parseFrontmatter,
} from './frontmatter';
import { listMarkdownFiles } from './markdown-files';

type EventParticipant = { character: string };
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

const getWhoField = (record: Record<string, unknown>, field: string): EventParticipant[] => {
  const value = record[field];
  if (typeof value === 'undefined') {
    return [];
  }
  if (!Array.isArray(value)) {
    throw new Error(`Invalid ${field}`);
  }
  return value.map((entry) => {
    if (typeof entry !== 'object' || entry === null) {
      throw new Error(`Invalid ${field}`);
    }
    const character = (entry as Record<string, unknown>).character;
    if (typeof character !== 'string') {
      throw new Error(`Invalid ${field}`);
    }
    return { character };
  });
};

const isAllowedLocation = (location: string): boolean => {
  if (location === 'unknown') {
    return true;
  }
  return (
    location.startsWith('place:') ||
    location.startsWith('planet:') ||
    location.startsWith('space:')
  );
};

const getLocationsField = (record: Record<string, unknown>, field: string): string[] => {
  const value = record[field];
  if (typeof value === 'undefined') {
    return [];
  }
  if (!Array.isArray(value) || !value.every((item) => typeof item === 'string')) {
    throw new Error(`Invalid ${field}`);
  }
  if (!value.every((item) => isAllowedLocation(item))) {
    throw new Error(`Invalid ${field}`);
  }
  return value;
};

const parseAndValidateEventMarkdown = (markdown: string): Event => {
  const { data, content } = parseFrontmatter(markdown);
  if (data.type !== 'event') {
    throw new Error('Invalid type');
  }

  const id = getStringField(data, 'id');
  const title = getStringField(data, 'title');
  const date = getDateField(data, 'date');
  const who = getWhoField(data, 'who');
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

  events.sort((a, b) => a.date.localeCompare(b.date));
  return events;
}
