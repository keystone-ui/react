import fuzzysort from "fuzzysort";
import type { RegistryItem, RegistryManifest } from "./types.js";

export interface SearchResult {
  item: RegistryItem;
  score: number;
}

export function searchItems(
  manifest: RegistryManifest,
  query: string,
  opts: { limit?: number; offset?: number; type?: string } = {}
): { results: SearchResult[]; total: number } {
  const { limit = 20, offset = 0, type } = opts;

  let items = manifest.items;
  if (type) {
    items = items.filter((i) => i.type === `registry:${type}`);
  }

  const targets = items.map((item) => ({
    item,
    searchable: `${item.name} ${item.title ?? ""} ${item.description ?? ""}`,
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
  opts: { limit?: number; offset?: number; type?: string } = {}
): { items: RegistryItem[]; total: number } {
  const { limit = 20, offset = 0, type } = opts;

  let items = manifest.items;
  if (type) {
    items = items.filter((i) => i.type === `registry:${type}`);
  }

  return {
    items: items.slice(offset, offset + limit),
    total: items.length,
  };
}
