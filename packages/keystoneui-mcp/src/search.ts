import fuzzysort from "fuzzysort";
import type { RegistryItem, RegistryManifest } from "./types.js";

export interface SearchResult {
  item: RegistryItem;
  score: number;
}

function applyFilters(
  items: RegistryItem[],
  type: string | undefined,
  category: string | undefined
): RegistryItem[] {
  let filtered = items;
  if (type) {
    filtered = filtered.filter((i) => i.type === `registry:${type}`);
  }
  if (category) {
    filtered = filtered.filter((i) => i.categories?.includes(category));
  }
  return filtered;
}

export function searchItems(
  manifest: RegistryManifest,
  query: string,
  opts: {
    category?: string;
    limit?: number;
    offset?: number;
    type?: string;
  } = {}
): { results: SearchResult[]; total: number } {
  const { limit = 20, offset = 0, type, category } = opts;
  const items = applyFilters(manifest.items, type, category);

  const targets = items.map((item) => ({
    item,
    searchable: `${item.name} ${item.title ?? ""} ${item.description ?? ""} ${(item.categories ?? []).join(" ")}`,
  }));

  const results = fuzzysort
    .go(query, targets, {
      key: "searchable",
      threshold: -10_000,
    })
    .map((r) => ({ item: r.obj.item, score: r.score }));

  return {
    results: results.slice(offset, offset + limit),
    total: results.length,
  };
}

export function listItems(
  manifest: RegistryManifest,
  opts: {
    category?: string;
    limit?: number;
    offset?: number;
    type?: string;
  } = {}
): { items: RegistryItem[]; total: number } {
  const { limit = 20, offset = 0, type, category } = opts;
  const items = applyFilters(manifest.items, type, category);

  return {
    items: items.slice(offset, offset + limit),
    total: items.length,
  };
}
