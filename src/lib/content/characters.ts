import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';

type CharacterListItem = { id: string; name: string };
type Character = { id: string; name: string; body: string };

type NodeErrorWithCode = Error & { code?: string };

const getCharactersDir = (baseDir?: string): string => {
  const resolvedBaseDir = baseDir ?? path.resolve(process.cwd(), 'content');
  return path.join(resolvedBaseDir, 'characters');
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

const parseAndValidateCharacterMarkdown = (markdown: string): Character => {
  const parsed = matter(markdown);
  const data: unknown = parsed.data;

  if (!isRecord(data)) {
    throw new Error('Invalid frontmatter');
  }
  if (data.type !== 'character') {
    throw new Error('Invalid type');
  }

  const id = getStringField(data, 'id');
  const name = getStringField(data, 'name');

  return { id, name, body: parsed.content };
};

const isEnoentError = (error: unknown): error is NodeErrorWithCode =>
  error instanceof Error && (error as NodeErrorWithCode).code === 'ENOENT';

export async function listCharacters(
  baseDir?: string,
): Promise<Array<CharacterListItem>> {
  const charactersDir = getCharactersDir(baseDir);
  const entries = await readdir(charactersDir, { withFileTypes: true });

  const markdownFiles = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => entry.name);

  const characters: CharacterListItem[] = [];
  for (const filename of markdownFiles) {
    const filePath = path.join(charactersDir, filename);
    const markdown = await readFile(filePath, 'utf8');
    const { id, name } = parseAndValidateCharacterMarkdown(markdown);
    characters.push({ id, name });
  }

  characters.sort((a, b) => a.id.localeCompare(b.id));
  return characters;
}

export async function getCharacterById(
  id: string,
  baseDir?: string,
): Promise<Character | null> {
  const charactersDir = getCharactersDir(baseDir);
  const filePath = path.join(charactersDir, `${id}.md`);

  let markdown: string;
  try {
    markdown = await readFile(filePath, 'utf8');
  } catch (error: unknown) {
    if (isEnoentError(error)) {
      return null;
    }
    throw error;
  }

  return parseAndValidateCharacterMarkdown(markdown);
}
