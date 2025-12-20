import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';

type PlaceListItem = { id: string; name: string };
type Place = { id: string; name: string; body: string };

type NodeErrorWithCode = Error & { code?: string };

const getPlacesDir = (baseDir?: string): string => {
  const resolvedBaseDir = baseDir ?? path.resolve(process.cwd(), 'content');
  return path.join(resolvedBaseDir, 'places');
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

const parseAndValidatePlaceMarkdown = (markdown: string): Place => {
  const parsed = matter(markdown);
  const data: unknown = parsed.data;

  if (!isRecord(data)) {
    throw new Error('Invalid frontmatter');
  }
  if (data.type !== 'place') {
    throw new Error('Invalid type');
  }

  const id = getStringField(data, 'id');
  const name = getStringField(data, 'name');

  return { id, name, body: parsed.content };
};

const isEnoentError = (error: unknown): error is NodeErrorWithCode =>
  error instanceof Error && (error as NodeErrorWithCode).code === 'ENOENT';

export async function listPlaces(baseDir?: string): Promise<Array<PlaceListItem>> {
  const placesDir = getPlacesDir(baseDir);
  const entries = await readdir(placesDir, { withFileTypes: true });

  const markdownFiles = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => entry.name);

  const places: PlaceListItem[] = [];
  for (const filename of markdownFiles) {
    const filePath = path.join(placesDir, filename);
    const markdown = await readFile(filePath, 'utf8');
    const { id, name } = parseAndValidatePlaceMarkdown(markdown);
    places.push({ id, name });
  }

  places.sort((a, b) => a.id.localeCompare(b.id));
  return places;
}

export async function getPlaceById(
  id: string,
  baseDir?: string,
): Promise<Place | null> {
  const placesDir = getPlacesDir(baseDir);
  const filePath = path.join(placesDir, `${id}.md`);

  let markdown: string;
  try {
    markdown = await readFile(filePath, 'utf8');
  } catch (error: unknown) {
    if (isEnoentError(error)) {
      return null;
    }
    throw error;
  }

  return parseAndValidatePlaceMarkdown(markdown);
}
