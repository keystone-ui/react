import type { RegistryItem, RegistryManifest } from "./types.js";

const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000;

async function fetchJson<T>(url: string): Promise<T> {
  const cached = cache.get(url);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data as T;
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }

  const data = (await response.json()) as T;
  cache.set(url, { data, timestamp: Date.now() });
  return data;
}

export function fetchManifest(registryUrl: string): Promise<RegistryManifest> {
  return fetchJson<RegistryManifest>(`${registryUrl}/registry.json`);
}

export function fetchItem(
  registryUrl: string,
  name: string
): Promise<RegistryItem> {
  return fetchJson<RegistryItem>(`${registryUrl}/${name}.json`);
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
  registryUrl: string,
  name: string
): Promise<DemoBundle> {
  return fetchJson<DemoBundle>(`${registryUrl}/demos/${name}`);
}

export function clearCache(): void {
  cache.clear();
}
