export interface RegistryItem {
  dependencies?: string[];
  description?: string;
  files?: RegistryFile[];
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
