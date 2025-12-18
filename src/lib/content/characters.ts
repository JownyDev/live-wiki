import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';

type CharacterListItem = { id: string; name: string };
type Character = { id: string; name: string; body: string };

const getCharactersDir = (baseDir?: string): string => {
  const resolvedBaseDir =
    baseDir ?? path.resolve(process.cwd(), 'content');
  return path.join(resolvedBaseDir, 'characters');
};

const parseAndValidateCharacterMarkdown = (
  markdown: string,
): { id: string; name: string; body: string } => {
  const parsed = matter(markdown);
  const data: unknown = parsed.data;

  if (typeof data !== 'object' || data === null) {
    throw new Error('Invalid frontmatter');
  }

  const record = data as Record<string, unknown>;

  if (record.type !== 'character') {
    throw new Error('Invalid type');
  }
  if (typeof record.id !== 'string') {
    throw new Error('Invalid id');
  }
  if (typeof record.name !== 'string') {
    throw new Error('Invalid name');
  }

  return { id: record.id, name: record.name, body: parsed.content };
};

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
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: unknown }).code === 'ENOENT'
    ) {
      return null;
    }
    throw error;
  }

  const parsed = parseAndValidateCharacterMarkdown(markdown);
  return { id: parsed.id, name: parsed.name, body: parsed.body };
}
