import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { getStringField, parseFrontmatter } from './frontmatter';
import { listMarkdownFiles } from './markdown-files';

export type SearchIndexEntry = {
  type: string;
  id: string;
  title: string;
  href: string;
  text: string;
};

type SearchTypeConfig = {
  type: string;
  dir: string;
  titleField: 'name' | 'title';
  hrefPrefix: string;
};

const searchTypes: SearchTypeConfig[] = [
  { type: 'card', dir: 'cards', titleField: 'name', hrefPrefix: '/cards/' },
  { type: 'character', dir: 'characters', titleField: 'name', hrefPrefix: '/characters/' },
  { type: 'element', dir: 'elements', titleField: 'name', hrefPrefix: '/elements/' },
  { type: 'event', dir: 'events', titleField: 'title', hrefPrefix: '/events/' },
  { type: 'mechanic', dir: 'mechanics', titleField: 'name', hrefPrefix: '/mechanics/' },
  { type: 'place', dir: 'places', titleField: 'name', hrefPrefix: '/places/' },
  { type: 'planet', dir: 'planets', titleField: 'name', hrefPrefix: '/planets/' },
];

const normalizeWhitespace = (value: string): string =>
  value.replace(/\s+/g, ' ').trim();

const normalizeForSearch = (value: string): string =>
  normalizeWhitespace(value).toLowerCase();

const stripMarkdown = (value: string): string => {
  const withoutHeadings = value.replace(/^#+\s*.*$/gm, '');
  const withoutImages = withoutHeadings.replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1');
  const withoutLinks = withoutImages.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  const withoutMarkers = withoutLinks.replace(/[#*_`>~]/g, '');
  return normalizeWhitespace(withoutMarkers);
};

const buildIndexText = (id: string, title: string, body: string): string => {
  const plainBody = stripMarkdown(body);
  return normalizeWhitespace([id, title, plainBody].join(' '));
};

const buildEntriesForType = async (
  config: SearchTypeConfig,
  baseDir: string,
): Promise<SearchIndexEntry[]> => {
  const dir = path.join(baseDir, config.dir);
  const markdownFiles = await listMarkdownFiles(dir);

  const entries: SearchIndexEntry[] = [];
  for (const filename of markdownFiles) {
    const filePath = path.join(dir, filename);
    const markdown = await readFile(filePath, 'utf8');
    const { data, content } = parseFrontmatter(markdown);
    if (data.type !== config.type) {
      throw new Error('Invalid type');
    }
    const id = getStringField(data, 'id');
    const title = getStringField(data, config.titleField);
    entries.push({
      type: config.type,
      id,
      title,
      href: `${config.hrefPrefix}${id}`,
      text: buildIndexText(id, title, content),
    });
  }

  return entries;
};

export const buildSearchIndex = async (
  baseDir?: string,
): Promise<SearchIndexEntry[]> => {
  const resolvedBaseDir = baseDir ?? path.resolve(process.cwd(), 'content');
  const entriesByType = await Promise.all(
    searchTypes.map((config) => buildEntriesForType(config, resolvedBaseDir)),
  );
  const entries = entriesByType.flat();

  entries.sort((a, b) => {
    const typeDiff = a.type.localeCompare(b.type);
    return typeDiff !== 0 ? typeDiff : a.id.localeCompare(b.id);
  });

  return entries;
};

export const searchIndex = (
  query: string,
  index: SearchIndexEntry[],
): SearchIndexEntry[] => {
  const normalizedQuery = normalizeForSearch(query);
  if (!normalizedQuery) {
    return [];
  }

  return index.filter((entry) =>
    normalizeForSearch(entry.text).includes(normalizedQuery),
  );
};
