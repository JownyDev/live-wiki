import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';

type PlanetListItem = { id: string; name: string };
type Planet = { id: string; name: string; body: string };

type NodeErrorWithCode = Error & { code?: string };

const getPlanetsDir = (baseDir?: string): string => {
  const resolvedBaseDir = baseDir ?? path.resolve(process.cwd(), 'content');
  return path.join(resolvedBaseDir, 'planets');
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

const parseAndValidatePlanetMarkdown = (markdown: string): Planet => {
  const parsed = matter(markdown);
  const data: unknown = parsed.data;

  if (!isRecord(data)) {
    throw new Error('Invalid frontmatter');
  }
  if (data.type !== 'planet') {
    throw new Error('Invalid type');
  }

  const id = getStringField(data, 'id');
  const name = getStringField(data, 'name');

  return { id, name, body: parsed.content };
};

const isEnoentError = (error: unknown): error is NodeErrorWithCode =>
  error instanceof Error && (error as NodeErrorWithCode).code === 'ENOENT';

export async function listPlanets(baseDir?: string): Promise<Array<PlanetListItem>> {
  const planetsDir = getPlanetsDir(baseDir);
  const entries = await readdir(planetsDir, { withFileTypes: true });

  const markdownFiles = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => entry.name);

  const planets: PlanetListItem[] = [];
  for (const filename of markdownFiles) {
    const filePath = path.join(planetsDir, filename);
    const markdown = await readFile(filePath, 'utf8');
    const { id, name } = parseAndValidatePlanetMarkdown(markdown);
    planets.push({ id, name });
  }

  planets.sort((a, b) => a.id.localeCompare(b.id));
  return planets;
}

export async function getPlanetById(
  id: string,
  baseDir?: string,
): Promise<Planet | null> {
  const planetsDir = getPlanetsDir(baseDir);
  const filePath = path.join(planetsDir, `${id}.md`);

  let markdown: string;
  try {
    markdown = await readFile(filePath, 'utf8');
  } catch (error: unknown) {
    if (isEnoentError(error)) {
      return null;
    }
    throw error;
  }

  return parseAndValidatePlanetMarkdown(markdown);
}
