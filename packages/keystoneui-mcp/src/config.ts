import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const DEFAULT_REGISTRY_URL = "https://keystoneui.io/r";

interface RegistryConfig {
  url: string;
}

export interface ProjectConfig {
  registry: RegistryConfig;
}

export function loadProjectConfig(): ProjectConfig {
  const registryUrlEnv = process.env.KEYSTONEUI_REGISTRY_URL;
  if (registryUrlEnv) {
    return { registry: { url: registryUrlEnv } };
  }

  const cwd = process.cwd();
  const configPath = resolve(cwd, "components.json");

  if (existsSync(configPath)) {
    try {
      const raw = JSON.parse(readFileSync(configPath, "utf-8"));
      const registryUrl =
        raw?.registries?.["@keystoneui"]?.url ?? DEFAULT_REGISTRY_URL;
      return { registry: { url: registryUrl } };
    } catch {
      // Fall through to defaults
    }
  }

  return { registry: { url: DEFAULT_REGISTRY_URL } };
}
