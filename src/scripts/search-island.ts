import { searchIndex, type SearchIndexEntry } from '../lib/content/search-core';
import { ui } from '../i18n/ui';

const root = document.querySelector<HTMLElement>('[data-search]');
if (!root) {
  throw new Error('Search root not found');
}

const input = root.querySelector<HTMLInputElement>('#search-input');
const status = root.querySelector<HTMLElement>('[data-search-status]');
const results = root.querySelector<HTMLUListElement>('[data-search-results]');

if (!input || !status || !results) {
  throw new Error('Search UI is missing required elements');
}

const searchEndpoint = root.dataset.searchEndpoint ?? '/search.json';
const searchLang = (root.dataset.searchLang ?? 'es') as keyof typeof ui;
const limitValue = Number(root.dataset.searchLimit ?? '12');
const resultLimit = Number.isFinite(limitValue) && limitValue > 0 ? limitValue : 12;

const t = ui[searchLang] ?? ui.es;

let index: SearchIndexEntry[] = [];
let loadPromise: Promise<boolean> | null = null;

const setStatus = (message: string, isHtml = false): void => {
  if (isHtml) {
    status.innerHTML = message;
  } else {
    status.textContent = message;
  }
};

const renderResults = (entries: SearchIndexEntry[]): void => {
  results.innerHTML = '';
  if (entries.length === 0) {
    results.hidden = true;
    return;
  }

  results.hidden = false;
  for (const entry of entries) {
    const item = document.createElement('li');
    item.className = 'search__result';

    const link = document.createElement('a');
    link.className = 'search__result-link';
    link.href = entry.href;
    link.textContent = entry.title;

    const meta = document.createElement('span');
    meta.className = 'search__result-meta';
    const typeKey = `type.${entry.type}` as keyof typeof t;
    meta.textContent = t[typeKey] ?? entry.type;

    item.append(link, meta);
    results.append(item);
  }
};

const loadIndex = async (): Promise<boolean> => {
  if (loadPromise) {
    return loadPromise;
  }

  setStatus(
    `<span class="material-symbols-outlined animate-spin text-sm align-middle">progress_activity</span> <span class="align-middle">${t['ui.loading']}</span>`,
    true,
  );
  loadPromise = (async () => {
    try {
      const response = await fetch(searchEndpoint);
      if (!response.ok) {
        throw new Error('Search index fetch failed');
      }
      const data: unknown = await response.json();
      index = Array.isArray(data) ? (data as SearchIndexEntry[]) : [];
      if (!input.value.trim()) {
        setStatus(t['ui.type_to_search']);
      }
      return true;
    } catch {
      setStatus(t['ui.error_loading']);
      return false;
    }
  })();

  return loadPromise;
};

const updateResults = async (): Promise<void> => {
  const query = input.value;
  if (!query.trim()) {
    results.innerHTML = '';
    results.hidden = true;
    setStatus(t['ui.type_to_search']);
    return;
  }

  const loaded = await loadIndex();
  if (!loaded) {
    results.hidden = true;
    return;
  }

  const matches = searchIndex(query, index).slice(0, resultLimit);
  renderResults(matches);

  if (matches.length === 0) {
    setStatus(t['ui.no_results']);
    return;
  }

  const count = matches.length;
  const countLabel = count === 1 ? t['ui.result_count'] : t['ui.results_count'];
  setStatus(`${String(count)} ${countLabel}.`);
};

input.addEventListener('input', () => {
  void updateResults();
});
input.addEventListener('focus', () => {
  void loadIndex();
});
