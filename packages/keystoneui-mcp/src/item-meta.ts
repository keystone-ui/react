import { displayUrl } from "./display-url.js";
import { docsResourceUrl } from "./registry-url.js";
import { shown } from "./render.js";
import type { RegistryItem } from "./types.js";

/**
 * What a registry item says about itself under `meta.keystoneui`: the docs
 * section that documents it, the item it is the package flavour of, the
 * lowest `@keystoneui/react` version that flavour supports, and the blocks a
 * kit was taken from.
 *
 * This is the only source of kit and flavour facts: no name convention (an
 * `npm/` prefix proves nothing) and no description is read. Each key is
 * checked on its own and a malformed one is ignored, so an item with bad
 * metadata is still an ordinary item. A registry without the key gets none
 * of the lines or relations built from it.
 */
export interface KeystoneMeta {
  docs?: DocsPointer;
  flavourOf?: string;
  minPackageVersion?: string;
  partOf?: string[];
}

export interface DocsPointer {
  anchor?: string;
  /** Site-relative page path, without the anchor. */
  path: string;
}

const DOCS_POINTER = /^(\/docs\/[a-z0-9/-]+)(?:#([a-z0-9-]+))?$/;

export function parseDocsPointer(value: unknown): DocsPointer | undefined {
  if (typeof value !== "string") {
    return;
  }
  const match = DOCS_POINTER.exec(value);
  if (!match) {
    return;
  }
  return match[2] ? { path: match[1], anchor: match[2] } : { path: match[1] };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** The item's valid metadata, or null when it has none. */
export function readMeta(item: RegistryItem): KeystoneMeta | null {
  const raw =
    isRecord(item) && isRecord(item.meta) ? item.meta.keystoneui : undefined;
  if (!isRecord(raw)) {
    return null;
  }
  const meta: KeystoneMeta = {};
  const docs = parseDocsPointer(raw.docs);
  if (docs) {
    meta.docs = docs;
  }
  if (
    typeof raw.flavourOf === "string" &&
    raw.flavourOf !== "" &&
    raw.flavourOf !== item.name
  ) {
    meta.flavourOf = raw.flavourOf;
  }
  if (typeof raw.minPackageVersion === "string" && raw.minPackageVersion) {
    meta.minPackageVersion = raw.minPackageVersion;
  }
  if (
    Array.isArray(raw.partOf) &&
    raw.partOf.length > 0 &&
    raw.partOf.every((name) => typeof name === "string" && name !== "")
  ) {
    meta.partOf = raw.partOf as string[];
  }
  return Object.keys(meta).length > 0 ? meta : null;
}

/**
 * For each item that another item declares itself the package flavour of,
 * that flavour's name. Built over the whole index, before any filter or
 * page, so the line holds when the two land on different pages. The first
 * flavour in index order wins; one naming an item not in the index counts
 * for nothing.
 */
export function packageFlavours(entries: RegistryItem[]): Map<string, string> {
  // An entry that is not an item is skipped, not read.
  const items = entries.filter((entry) => isRecord(entry));
  const names = new Set(items.map((item) => item.name));
  const flavours = new Map<string, string>();
  for (const item of items) {
    const parent = readMeta(item)?.flavourOf;
    if (parent && names.has(parent) && !flavours.has(parent)) {
      flavours.set(parent, item.name);
    }
  }
  return flavours;
}

/**
 * The page a pointer names, as printed: composed into the docs URL, shown
 * without a credential, then the validated anchor.
 */
export function pointerUrl(docsUrl: string, pointer: DocsPointer): string {
  const page = displayUrl(docsResourceUrl(docsUrl, pointer.path.slice(1)));
  return pointer.anchor ? `${page}#${pointer.anchor}` : page;
}

/**
 * The lines appended to an item's entry, from its own metadata and, in a
 * listing, the package flavour another item declares for it. Empty for an
 * item with neither. Registry text is rendered as prose (render.ts).
 */
export function metaLines(
  item: RegistryItem,
  docsUrl: string,
  flavours?: Map<string, string>
): string[] {
  const meta = readMeta(item);
  const lines: string[] = [];
  if (meta && item.type === "registry:component") {
    lines.push("Kind: kit");
  }
  if (meta?.partOf) {
    lines.push(`Part of: ${meta.partOf.map(shown).join(", ")}`);
  }
  if (meta?.flavourOf) {
    lines.push(
      `Flavour of: ${shown(meta.flavourOf)} — for apps that use the @keystoneui/react package`
    );
  }
  if (meta?.minPackageVersion) {
    lines.push(
      `Needs @keystoneui/react ${shown(meta.minPackageVersion)} or later`
    );
  }
  const flavour = flavours?.get(item.name);
  if (flavour) {
    lines.push(`Package flavour: ${shown(flavour)}`);
  }
  if (meta?.docs) {
    lines.push(`Docs: ${shown(pointerUrl(docsUrl, meta.docs))}`);
  }
  return lines;
}
