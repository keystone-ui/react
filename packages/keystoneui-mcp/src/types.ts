export interface RegistryItem {
  categories?: string[];
  dependencies?: string[];
  description?: string;
  files?: RegistryFile[];
  /** Free-form in the registry schema; this package reads `meta.keystoneui`. */
  meta?: Record<string, unknown>;
  name: string;
  registryDependencies?: string[];
  title?: string;
  type: string;
}

export interface RegistryFile {
  content?: string;
  path: string;
  target?: string;
  type: string;
}

export interface RegistryManifest {
  $schema: string;
  homepage: string;
  items: RegistryItem[];
  name: string;
}
