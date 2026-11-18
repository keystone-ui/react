import { displayUrl, redactUrlInError } from "./display-url.js";
import {
  type RegistrySource,
  registryCatalogueUrl,
  registryDemosUrl,
  registryItemUrl,
} from "./registry-url.js";
import type { RegistryItem, RegistryManifest } from "./types.js";

const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000;

async function fetchJson<T>(url: string): Promise<T> {
  const cached = cache.get(url);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data as T;
  }

  let response: Response;
  try {
    response = await fetch(url);
  } catch (error) {
    throw redactUrlInError(error, url);
  }
  if (!response.ok) {
    throw new Error(`Failed to fetch ${displayUrl(url)}: ${response.status}`);
  }

  const data = (await response.json()) as T;
  cache.set(url, { data, timestamp: Date.now() });
  return data;
}

export function fetchManifest(
  registry: RegistrySource | string
): Promise<RegistryManifest> {
  return fetchJson<RegistryManifest>(registryCatalogueUrl(registry));
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
