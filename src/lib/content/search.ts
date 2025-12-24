export type SearchIndexEntry = {
  type: string;
  id: string;
  title: string;
  href: string;
  text: string;
};

export const buildSearchIndex = async (
  baseDir?: string,
): Promise<SearchIndexEntry[]> => {
  void baseDir;
  await Promise.resolve();
  throw new Error('Not implemented');
};

export const searchIndex = (
  query: string,
  index: SearchIndexEntry[],
): SearchIndexEntry[] => {
  void query;
  void index;
  throw new Error('Not implemented');
};
