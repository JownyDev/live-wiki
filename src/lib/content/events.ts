import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';

type EventListItem = { id: string; title: string; date: string };
type Event = { id: string; title: string; date: string; who: string[]; body: string };

type NodeErrorWithCode = Error & { code?: string };

const getEventsDir = (baseDir?: string): string => {
  const resolvedBaseDir = baseDir ?? path.resolve(process.cwd(), 'content');
  return path.join(resolvedBaseDir, 'events');
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const getStringField = (record: Record<string, unknown>, field: string): string => {
  const value = record[field];
  if (typeof value !== 'string') {
    throw new Error(`Invalid ${field}`);
  }
  return value;
};

const isIsoDate = (value: string): boolean => /^\d{4}-\d{2}-\d{2}$/.test(value);

const getDateField = (record: Record<string, unknown>, field: string): string => {
  const value = record[field];
  if (typeof value === 'string') {
    if (!isIsoDate(value)) {
      throw new Error(`Invalid ${field}`);
    }
    return value;
  }
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    // Normaliza Date de frontmatter a YYYY-MM-DD para un formato estable.
    return value.toISOString().slice(0, 10);
  }
  throw new Error(`Invalid ${field}`);
};

const getStringArrayField = (
  record: Record<string, unknown>,
  field: string,
): string[] => {
  const value = record[field];
  if (typeof value === 'undefined') {
    // Permite ausencia de "who" para no romper eventos validos sin personajes.
    return [];
  }
  if (!Array.isArray(value) || !value.every((item) => typeof item === 'string')) {
    throw new Error(`Invalid ${field}`);
  }
  return value;
};

const parseAndValidateEventMarkdown = (markdown: string): Event => {
  const parsed = matter(markdown);
  const data: unknown = parsed.data;

  if (!isRecord(data)) {
    throw new Error('Invalid frontmatter');
  }
  if (data.type !== 'event') {
    throw new Error('Invalid type');
  }

  const id = getStringField(data, 'id');
  const title = getStringField(data, 'title');
  const date = getDateField(data, 'date');
  const who = getStringArrayField(data, 'who');

  return { id, title, date, who, body: parsed.content };
};

const isEnoentError = (error: unknown): error is NodeErrorWithCode =>
  error instanceof Error && (error as NodeErrorWithCode).code === 'ENOENT';

export async function listEvents(baseDir?: string): Promise<Array<EventListItem>> {
  const eventsDir = getEventsDir(baseDir);
  const entries = await readdir(eventsDir, { withFileTypes: true });

  const markdownFiles = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => entry.name);

  const events: EventListItem[] = [];
  for (const filename of markdownFiles) {
    const filePath = path.join(eventsDir, filename);
    const markdown = await readFile(filePath, 'utf8');
    const { id, title, date } = parseAndValidateEventMarkdown(markdown);
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
  const entries = await readdir(eventsDir, { withFileTypes: true });

  const markdownFiles = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => entry.name);

  const characterTag = `character:${characterId}`;
  const events: EventListItem[] = [];
  for (const filename of markdownFiles) {
    const filePath = path.join(eventsDir, filename);
    const markdown = await readFile(filePath, 'utf8');
    const { id, title, date, who } = parseAndValidateEventMarkdown(markdown);
    if (who.includes(characterTag)) {
      events.push({ id, title, date });
    }
  }

  events.sort((a, b) => a.date.localeCompare(b.date));
  return events;
}
