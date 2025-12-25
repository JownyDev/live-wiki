export type SearchIndexEntry = {
  type: string;
  id: string;
  title: string;
  href: string;
  text: string;
};

export const normalizeWhitespace = (value: string): string =>
  value.replace(/\s+/g, ' ').trim();

const normalizeForSearch = (value: string): string =>
  normalizeWhitespace(value).toLowerCase();

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
