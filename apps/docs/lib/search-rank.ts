/**
 * Reorders search results by relevance to the query.
 *
 * Fumadocs' Orama search groups hits by page and returns the groups in index
 * order, not by score: "button" listed concept and block pages first and
 * the Button page 24th, past the default limit of 60 results. The route asks
 * for more candidates and this puts each page group where a reader expects
 * it: a page titled exactly the query first, then titles that start with it,
 * then titles that contain it, then the rest, each tier ordered by how many
 * of the page's sections matched.
 */

export interface SearchResult {
  breadcrumbs?: string[];
  content: string;
  id: string;
  type: "page" | "heading" | "text";
  url: string;
}

interface Group {
  hits: number;
  index: number;
  items: SearchResult[];
  tier: number;
}

function titleTier(title: string, query: string): number {
  const t = title.trim().toLowerCase();
  if (t === query) {
    return 0;
  }
  if (t.startsWith(query)) {
    return 1;
  }
  return t.includes(query) ? 2 : 3;
}

export function rankResults<T extends SearchResult>(
  results: T[],
  query: string,
  limit: number
): T[] {
  const q = query.trim().toLowerCase();
  const groups: (Group & { items: T[] })[] = [];
  for (const result of results) {
    const open = groups.at(-1);
    if (result.type === "page" || !open) {
      groups.push({
        hits: 0,
        index: groups.length,
        items: [result],
        tier: result.type === "page" ? titleTier(result.content, q) : 3,
      });
    } else {
      open.items.push(result);
      open.hits += 1;
    }
  }
  groups.sort(
    (a, b) => a.tier - b.tier || b.hits - a.hits || a.index - b.index
  );
  return groups.flatMap((g) => g.items).slice(0, limit);
}
