export type SearchEntry = {
  id: string; title: string; category: string; group: string; typeLabel: string;
  href: string; searchText: string; order: number; external: boolean;
};

let pending: Promise<SearchEntry[]> | undefined;
export function loadSearchIndex(): Promise<SearchEntry[]> {
  if (!pending) {
    pending = fetch("/search-index.json").then(async (response) => {
      if (!response.ok) throw new Error(`Search index request failed: ${response.status}`);
      return response.json() as Promise<SearchEntry[]>;
    }).catch((error) => { pending = undefined; throw error; });
  }
  return pending;
}
