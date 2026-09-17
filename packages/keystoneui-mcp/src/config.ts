import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const DEFAULT_DOCS_URL = "https://keystoneui.io";
const DEFAULT_REGISTRY_URL = `${DEFAULT_DOCS_URL}/r`;

interface RegistryConfig {
  url: string;
}

export interface ProjectConfig {
  /** Origin for docs pages (`/llms.mdx/...`), distinct from the registry. */
  docsUrl: string;
  registry: RegistryConfig;
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
  const derivedRegistryUrl =
    docsUrl === DEFAULT_DOCS_URL ? DEFAULT_REGISTRY_URL : `${docsUrl}/r`;

  const registryUrlEnv = process.env.KEYSTONEUI_REGISTRY_URL;
  if (registryUrlEnv) {
    return { docsUrl, registry: { url: registryUrlEnv } };
  }

  const cwd = process.cwd();
  const configPath = resolve(cwd, "components.json");

  if (existsSync(configPath)) {
    try {
      const raw = JSON.parse(readFileSync(configPath, "utf-8"));
      const registryUrl =
        raw?.registries?.["@keystoneui"]?.url ?? derivedRegistryUrl;
      return { docsUrl, registry: { url: registryUrl } };
    } catch {
      // Fall through to defaults
    }
  }

  return { docsUrl, registry: { url: derivedRegistryUrl } };
}
