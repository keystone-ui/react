import type { ProjectConfig } from "./config.js";
import { lookupManifest } from "./fetcher.js";
import { type DocsPointer, readMeta } from "./item-meta.js";
import { nameRefusal } from "./item-name.js";
import { docsResourceUrl } from "./registry-url.js";
import { shown } from "./render.js";
import type { RegistryItem } from "./types.js";

/**
 * A docs page for a name, shared by `get_docs` and the CLI's `docs`, which
 * each keep their own request headers, rendering and exit behaviour.
 *
 * Today's URL is requested first and its answer returned unchanged. Only
 * when it is a 404 is the registry index read: an item with a
 * `meta.keystoneui.docs` pointer, or a package flavour whose parent has one
 * (or failing that the parent's own page, by its type), is answered with
 * that page and one line naming the section. One hop, so no cycle. A failed
 * or timed-out index lookup, no pointer, or a pointed page that fails, all
 * give back today's 404.
 */
export type DocsResult =
  | { kind: "page"; text: string }
  | { kind: "status"; status: number; statusText: string; url: string }
  | { kind: "unreachable"; error: unknown; url: string };

export type DocsSection = "blocks" | "components";

const PARENT_SECTION: Record<string, DocsSection> = {
  "registry:block": "blocks",
  "registry:ui": "components",
};

/** Today's request, joined as it always was. */
function docsPageUrl(docsUrl: string, path: string): string {
  return `${docsUrl}/llms.mdx${path}`;
}

/** The pointer documenting `name`, read from the index, if any. */
async function pointerFor(
  config: ProjectConfig,
  name: string
): Promise<DocsPointer | null> {
  let items: RegistryItem[];
  try {
    items = (await lookupManifest(config.registry)).items;
  } catch {
    return null;
  }
  const item = items.find((candidate) => candidate.name === name);
  const meta = item && readMeta(item);
  if (!meta) {
    return null;
  }
  if (meta.docs) {
    return meta.docs;
  }
  const parent =
    meta.flavourOf &&
    items.find((candidate) => candidate.name === meta.flavourOf);
  if (!parent) {
    return null;
  }
  const parentMeta = readMeta(parent);
  if (parentMeta?.docs) {
    return parentMeta.docs;
  }
  // The parent's own page: its name follows the item-name rules, not the
  // pattern a supplied pointer must match.
  const section = Object.hasOwn(PARENT_SECTION, parent.type)
    ? PARENT_SECTION[parent.type]
    : undefined;
  return section && nameRefusal(parent.name) === null
    ? { path: `/docs/${section}/${parent.name}` }
    : null;
}

export async function resolveDocs(
  config: ProjectConfig,
  name: string,
  section: DocsSection,
  init: () => RequestInit
): Promise<DocsResult> {
  const url = docsPageUrl(config.docsUrl, `/docs/${section}/${name}`);
  let response: Response;
  let text: string;
  try {
    response = await fetch(url, init());
    if (response.ok) {
      text = await response.text();
      return { kind: "page", text };
    }
  } catch (error) {
    return { kind: "unreachable", error, url };
  }
  const notFound: DocsResult = {
    kind: "status",
    status: response.status,
    statusText: response.statusText,
    url,
  };
  if (response.status !== 404) {
    return notFound;
  }

  const pointer = await pointerFor(config, name);
  if (!pointer) {
    return notFound;
  }
  try {
    const pointed = await fetch(
      // A new request: composed into the docs URL (registry-url.ts).
      docsResourceUrl(config.docsUrl, `llms.mdx${pointer.path}`),
      init()
    );
    if (!pointed.ok) {
      return notFound;
    }
    const where = pointer.anchor
      ? `section #${shown(pointer.anchor)} of ${shown(pointer.path)}`
      : shown(pointer.path);
    return {
      kind: "page",
      text: `Documented in ${where}.\n\n${await pointed.text()}`,
    };
  } catch {
    return notFound;
  }
}
