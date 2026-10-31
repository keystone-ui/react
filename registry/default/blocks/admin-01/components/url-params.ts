import type { SortDirection, SortState } from "@/components/sort";

/**
 * Reading a table's query back out of a URL.
 *
 * A URL is input someone can type, so every reader here validates and falls
 * back rather than trusting it: `?status=bogus` opens the table unfiltered,
 * not broken. Writers leave defaults out, so an untouched table has a clean
 * URL and a shared link carries only what was changed.
 */

/** `value` if it is one of `allowed`, otherwise `fallback`. */
export function oneOf<T extends string>(
  value: string | null,
  allowed: readonly T[],
  fallback: T
): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

/** `amount.desc` — the column and the way, in one readable parameter. */
export function sortToParam<K extends string>(
  sort: SortState<K>,
  fallback: SortState<K>
): string {
  return sort.key === fallback.key && sort.direction === fallback.direction
    ? ""
    : `${sort.key}.${sort.direction}`;
}

export function sortFromParam<K extends string>(
  value: string | null,
  keys: readonly K[]
): SortState<K> | undefined {
  const [key, direction] = (value ?? "").split(".");
  if (
    !(keys.includes(key as K) && (direction === "asc" || direction === "desc"))
  ) {
    return;
  }
  return { direction: direction as SortDirection, key: key as K };
}

/** One-based in the URL, because that is what the footer says. */
export function pageToParams(
  pageIndex: number,
  pageSize: number,
  defaultSize: number
): { page: string; size: string } {
  return {
    page: pageIndex > 0 ? String(pageIndex + 1) : "",
    size: pageSize === defaultSize ? "" : String(pageSize),
  };
}

export function pageFromParams(
  params: URLSearchParams,
  sizes: readonly number[]
): { pageIndex?: number; pageSize?: number } {
  const page = Number(params.get("page"));
  const size = Number(params.get("size"));
  return {
    pageIndex: Number.isInteger(page) && page > 1 ? page - 1 : undefined,
    pageSize: sizes.includes(size) ? size : undefined,
  };
}
