import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { docsRegistryUrl, type RegistrySource } from "./registry-url.js";

const DEFAULT_DOCS_URL = "https://keystoneui.io";
const DEFAULT_REGISTRY_URL = `${DEFAULT_DOCS_URL}/r`;

export interface ProjectConfig {
  /** Origin for docs pages (`/llms.mdx/...`), distinct from the registry. */
  docsUrl: string;
  registry: RegistrySource;
}

/** A components.json `{name}` template, with its string `params`. */
function templateSource(entry: {
  params?: unknown;
  url: string;
}): RegistrySource {
  // Built from entries, not by assignment: assigning a `__proto__` key would
  // set the prototype instead of keeping the param.
  const params: Record<string, string> =
    entry.params && typeof entry.params === "object"
      ? Object.fromEntries(
          Object.entries(entry.params).filter(
            (pair): pair is [string, string] => typeof pair[1] === "string"
          )
        )
      : {};
  return { url: entry.url, template: true, params };
}

/**
 * Docs origin, which the registry URL derives from unless overridden.
 *
 * These used to be fully independent env vars, so pointing KEYSTONEUI_URL at a
 * local docs server left the registry on production and vice versa -- you had
 * to know to set both. Now KEYSTONEUI_URL moves both, and
 * KEYSTONEUI_REGISTRY_URL still overrides the registry alone when a project
 * genuinely serves its registry from somewhere else.
 */
export function resolveDocsUrl(): string {
  return process.env.KEYSTONEUI_URL ?? DEFAULT_DOCS_URL;
}

export function loadProjectConfig(): ProjectConfig {
  const docsUrl = resolveDocsUrl();
  // Derived, so overriding the docs origin moves the registry with it.
  const derivedRegistry: RegistrySource =
    docsUrl === DEFAULT_DOCS_URL
      ? { url: DEFAULT_REGISTRY_URL }
      : { url: docsRegistryUrl(docsUrl), docsUrl };

  const registryUrlEnv = process.env.KEYSTONEUI_REGISTRY_URL;
  if (registryUrlEnv) {
    return { docsUrl, registry: { url: registryUrlEnv } };
  }

  const cwd = process.cwd();
  const configPath = resolve(cwd, "components.json");

  if (existsSync(configPath)) {
    try {
      const raw = JSON.parse(readFileSync(configPath, "utf-8"));
      const entry = raw?.registries?.["@keystoneui"];
      if (typeof entry?.url === "string" && entry.url.includes("{name}")) {
        return { docsUrl, registry: templateSource(entry) };
      }
      const registry =
        entry?.url === undefined || entry?.url === null
          ? derivedRegistry
          : { url: entry.url };
      return { docsUrl, registry };
    } catch {
      // Fall through to defaults
    }
  }

  return { docsUrl, registry: derivedRegistry };
}
