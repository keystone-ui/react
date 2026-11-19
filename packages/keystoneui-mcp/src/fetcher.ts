import { displayUrl, redactUrlInError } from "./display-url.js";
import {
  type RegistrySource,
  registryCatalogueUrl,
  registryDemosUrl,
  registryItemUrl,
} from "./registry-url.js";
import { escapedError, shown } from "./render.js";
import type { RegistryItem, RegistryManifest } from "./types.js";

const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000;

/**
 * The HTTP status of a failed response, kept beside the error rather than on
 * it, so the error prints exactly as before: a 404 is not an outage.
 */
const failedStatus = new WeakMap<object, number>();

export function isNotFound(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    failedStatus.get(error) === 404
  );
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const cached = cache.get(url);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data as T;
  }

  let response: Response;
  try {
    // Called with the URL alone unless a caller bounds the request.
    response = await (init ? fetch(url, init) : fetch(url));
  } catch (error) {
    throw escapedError(redactUrlInError(error, url));
  }
  if (!response.ok) {
    const error = new Error(
      `Failed to fetch ${shown(displayUrl(url))}: ${response.status}`
    );
    failedStatus.set(error, response.status);
    throw error;
  }

  let data: T;
  try {
    data = (await response.json()) as T;
  } catch (error) {
    // A parse error quotes the response body.
    throw escapedError(error);
  }
  cache.set(url, { data, timestamp: Date.now() });
  return data;
}

export function fetchManifest(
  registry: RegistrySource | string
): Promise<RegistryManifest> {
  return fetchJson<RegistryManifest>(registryCatalogueUrl(registry));
}

/** Bound for the index lookups kits and flavours add; nothing else. */
export const LOOKUP_TIMEOUT_MS = 10_000;

/**
 * The index, given up on after `ms`: for the lookups that decorate or route
 * an answer that works without them. Shares the cache with `fetchManifest`.
 * Rejects when the answer is not an index.
 */
export async function lookupManifest(
  registry: RegistrySource | string,
  ms = LOOKUP_TIMEOUT_MS
): Promise<RegistryManifest> {
  const url = registryCatalogueUrl(registry);
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      controller.abort();
      reject(new Error(`Timed out after ${ms} ms: ${shown(displayUrl(url))}`));
    }, ms);
  });
  try {
    const manifest = await Promise.race([
      fetchJson<RegistryManifest>(url, { signal: controller.signal }),
      timeout,
    ]);
    if (!Array.isArray(manifest?.items)) {
      throw new Error(`Not a registry index: ${shown(displayUrl(url))}`);
    }
    // Entries that are not items are dropped, so the lookups that walk the
    // index fall back on a missing item, never on a malformed one. A copy:
    // the cached index is left as it was fetched.
    return {
      ...manifest,
      items: manifest.items.filter(
        (item) =>
          typeof item === "object" &&
          item !== null &&
          typeof item.name === "string"
      ),
    };
  } finally {
    clearTimeout(timer);
  }
}

export function fetchItem(
  registry: RegistrySource | string,
  name: string
): Promise<RegistryItem> {
  return fetchJson<RegistryItem>(registryItemUrl(registry, name));
}

export interface DemoFile {
  content: string;
  path: string;
}

export interface DemoBundle {
  files: DemoFile[];
  name: string;
}

export function fetchExamples(
  registry: RegistrySource | string,
  name: string
): Promise<DemoBundle> {
  return fetchJson<DemoBundle>(registryDemosUrl(registry, name));
}

export function clearCache(): void {
  cache.clear();
}
