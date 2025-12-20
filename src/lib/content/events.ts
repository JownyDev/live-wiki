import { readFile } from 'node:fs/promises';
import path from 'node:path';
import {
  getDateField,
  getStringArrayField,
  getStringField,
  parseFrontmatter,
} from './frontmatter';
import { listMarkdownFiles } from './markdown-files';

type EventListItem = { id: string; title: string; date: string };
type Event = { id: string; title: string; date: string; who: string[]; body: string };

type NodeErrorWithCode = Error & { code?: string };

const getEventsDir = (baseDir?: string): string => {
  const resolvedBaseDir = baseDir ?? path.resolve(process.cwd(), 'content');
  return path.join(resolvedBaseDir, 'events');
};

const parseAndValidateEventMarkdown = (markdown: string): Event => {
  const { data, content } = parseFrontmatter(markdown);
  if (data.type !== 'event') {
    throw new Error('Invalid type');
  }

  const id = getStringField(data, 'id');
  const title = getStringField(data, 'title');
  const date = getDateField(data, 'date');
  const who = getStringArrayField(data, 'who');

  return { id, title, date, who, body: content };
};

const isEnoentError = (error: unknown): error is NodeErrorWithCode =>
  error instanceof Error && (error as NodeErrorWithCode).code === 'ENOENT';

const readEventFromFile = async (eventsDir: string, filename: string): Promise<Event> => {
  const filePath = path.join(eventsDir, filename);
  const markdown = await readFile(filePath, 'utf8');
  return parseAndValidateEventMarkdown(markdown);
};

const getCharacterTag = (characterId: string): string => `character:${characterId}`;

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

  const characterTag = getCharacterTag(characterId);
  const events: EventListItem[] = [];
  for (const filename of markdownFiles) {
    const { id, title, date, who } = await readEventFromFile(eventsDir, filename);
    if (who.includes(characterTag)) {
      events.push({ id, title, date });
    }
  }

  events.sort((a, b) => a.date.localeCompare(b.date));
  return events;
}
