import { searchIndex, type SearchIndexEntry } from '../lib/content/search-core';

type TypeLabelMap = Record<string, string>;

const root = document.querySelector<HTMLElement>('[data-search]');
if (!root) {
  throw new Error('Search root not found');
}

const input = root.querySelector<HTMLInputElement>('.search__input');
const status = root.querySelector<HTMLElement>('[data-search-status]');
const results = root.querySelector<HTMLUListElement>('[data-search-results]');

if (!input || !status || !results) {
  throw new Error('Search UI is missing required elements');
}

const searchEndpoint = root.dataset.searchEndpoint ?? '/search.json';
const limitValue = Number(root.dataset.searchLimit ?? '12');
const resultLimit = Number.isFinite(limitValue) && limitValue > 0 ? limitValue : 12;

const typeLabels: TypeLabelMap = {
  card: 'Carta',
  character: 'Personaje',
  element: 'Elemento',
  event: 'Evento',
  mechanic: 'Mecanica',
  place: 'Lugar',
  planet: 'Planeta',
};

let index: SearchIndexEntry[] = [];
let loadPromise: Promise<boolean> | null = null;

const setStatus = (message: string): void => {
  status.textContent = message;
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
    meta.textContent = typeLabels[entry.type] ?? entry.type;

    item.append(link, meta);
    results.append(item);
  }
};

const loadIndex = async (): Promise<boolean> => {
  if (loadPromise) {
    return loadPromise;
  }

  setStatus('Cargando indice...');
  loadPromise = (async () => {
    try {
      const response = await fetch(searchEndpoint);
      if (!response.ok) {
        throw new Error('Search index fetch failed');
      }
      const data: unknown = await response.json();
      index = Array.isArray(data) ? (data as SearchIndexEntry[]) : [];
      if (!input.value.trim()) {
        setStatus('Escribe para buscar.');
      }
      return true;
    } catch {
      setStatus('No se pudo cargar el indice.');
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
    setStatus('Escribe para buscar.');
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
    setStatus('Sin resultados.');
    return;
  }

  const count = matches.length;
  setStatus(`${String(count)} resultado${count === 1 ? '' : 's'}.`);
};

input.addEventListener('input', () => {
  void updateResults();
});
input.addEventListener('focus', () => {
  void loadIndex();
});
