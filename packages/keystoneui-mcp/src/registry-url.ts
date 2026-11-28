/**
 * Request URLs for the catalogue, an item and its demos, composed from the
 * configured registry.
 *
 * A registry is either a base URL (`KEYSTONEUI_REGISTRY_URL`, a
 * components.json `{url}` object without `{name}`, the docs site's `/r`, or
 * the default), to which `registry.json`, `<name>.json` and `demos/<name>`
 * are appended, or a components.json `{name}` template
 * (`https://host/r/{name}.json`), into whose path the item name is put, as
 * shadcn does.
 *
 * Either way the path goes before the URL's query, not after it; the
 * fragment, which is never sent, is dropped; trailing slashes on a base do
 * not double. A template's `params` are appended after its own query, both
 * kept when they share a key.
 *
 * Composition is textual, so a URL is sent and printed in the spelling it was
 * configured in. The name is inserted as given, at a path position: the URL
 * parser may still read part of it as a query or fragment (after a `?` or
 * `#` in it) or resolve a `..` in it, as it did before. A URL that does not
 * parse as http(s), one whose text does not show the scheme and authority
 * the parser reads (an empty authority, more than two slashes, a tab or
 * newline), or a template with a placeholder outside its path (or `{style}`,
 * which this package does not resolve), keeps the plain `<url>/<path>` join
 * it always had.
 */

export interface RegistrySource {
  /**
   * For the registry a docs site serves at `/r`: the docs-site URL as
   * configured, from which every resource is composed (`url` is its `/r`).
   */
  docsUrl?: string;
  /** Item query parameters of a `{name}` template, appended to every URL. */
  params?: Record<string, string>;
  /** True for a components.json url holding `{name}`. */
  template?: boolean;
  url: string;
}

const NAME = "{name}";
const ITEM_FILE = `/${NAME}.json`;
const PLACEHOLDER = /\{(?:name|style)\}/;
// Scheme and authority: the authority ends at the first slash of either
// kind (the URL parser reads `\` as `/` in http(s) URLs).
const HEAD = /^([^:/?#]*:[/\\]{2}[^/\\]*)(.*)$/s;
const TRAILING_SLASHES = /\/+$/;
const IGNORED_BY_PARSER = /[\t\n\r]|^[\0- ]|[\0- ]$/;

interface Parts {
  /** Scheme and authority, as configured. */
  head: string;
  /** Everything up to the query, as configured; may be empty. */
  path: string;
  /** The query without its `?`; empty when there is none. */
  query: string;
}

/**
 * Whether the text taken as scheme and authority is, on its own, read with
 * the same scheme, userinfo, host and port as the whole URL. It is not when
 * the parser takes the authority from elsewhere, as it does for an empty one
 * or for more than two slashes after the scheme.
 */
function sameAuthority(head: string, url: URL): boolean {
  let own: URL;
  try {
    own = new URL(head);
  } catch {
    return false;
  }
  return (
    own.protocol === url.protocol &&
    own.username === url.username &&
    own.password === url.password &&
    own.host === url.host
  );
}

function split(raw: string): Parts | null {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return null;
  }
  // The parser drops tabs and newlines anywhere and C0 controls and spaces
  // at either end, so the text would no longer show where it reads the
  // host: such a URL is not composed.
  if (IGNORED_BY_PARSER.test(raw)) {
    return null;
  }
  // In an http(s) URL the path ends at the first `?` or `#`, and the query
  // at the first `#`.
  const hashAt = raw.indexOf("#");
  const beforeHash = hashAt === -1 ? raw : raw.slice(0, hashAt);
  const queryAt = beforeHash.indexOf("?");
  const beforeQuery =
    queryAt === -1 ? beforeHash : beforeHash.slice(0, queryAt);
  const match = HEAD.exec(beforeQuery);
  if (!(match && sameAuthority(match[1], url))) {
    return null;
  }
  return {
    head: match[1],
    path: match[2],
    query: queryAt === -1 ? "" : beforeHash.slice(queryAt + 1),
  };
}

function count(text: string, part: string): number {
  return text.split(part).length - 1;
}

function withQuery(query: string, params?: Record<string, string>): string {
  const extra = params ? new URLSearchParams(params).toString() : "";
  const joined = [query, extra].filter(Boolean).join("&");
  return joined ? `?${joined}` : "";
}

/** A template whose only placeholders are `{name}` in its path. */
function templateParts(source: RegistrySource): Parts | null {
  if (!(source.template && source.url.includes(NAME))) {
    return null;
  }
  const parts = split(source.url);
  if (!parts || source.url.includes("{style}")) {
    return null;
  }
  // Every `{name}` must be in the path: none in the host, query or fragment.
  if (
    count(parts.path, NAME) === 0 ||
    count(parts.path, NAME) !== count(source.url, NAME)
  ) {
    return null;
  }
  return parts;
}

/**
 * `<url>/<path>`, or `path` composed into the base as described above.
 *
 * For a base URL, whether it is composed is decided here, on the URL as
 * configured, and each resource is built from that URL in this one step: a
 * registry derived from the docs site is joined as `r/<path>` into the docs
 * URL, never composed again from its own `/r`, so every resource of a base
 * is either fully composed or exactly the plain join it always was.
 */
function joinBase(raw: string, path: string): string {
  const parts = PLACEHOLDER.test(raw) ? null : split(raw);
  if (!parts) {
    return `${raw}/${path}`;
  }
  const dir = parts.path.replace(TRAILING_SLASHES, "");
  return `${parts.head}${dir}/${path}${withQuery(parts.query)}`;
}

/**
 * A page path (`docs/reference/shadcn-sidebar`, `llms.mdx/docs/reference/shadcn-sidebar`) composed into the
 * docs URL by the same rules as a resource into a base URL.
 */
export function docsResourceUrl(docsUrl: string, path: string): string {
  return joinBase(docsUrl, path);
}

/**
 * The registry a docs site serves at `/r`, composed into the docs URL by the
 * same rules as a resource into a base URL.
 */
export function docsRegistryUrl(docsUrl: string): string {
  return joinBase(docsUrl, "r");
}

function normalise(source: RegistrySource | string): RegistrySource {
  return typeof source === "string" ? { url: source } : source;
}

/** `path` joined into the configured URL the source was built from. */
function joinSource(source: RegistrySource, path: string): string {
  return source.docsUrl === undefined
    ? joinBase(source.url, path)
    : joinBase(source.docsUrl, `r/${path}`);
}

/**
 * For the catalogue and demos of a template: the directory its item file
 * sits in, when the path ends in `/{name}.json` and has no other `{name}`.
 */
function templateDir(parts: Parts): string | null {
  const { path } = parts;
  if (!path.endsWith(ITEM_FILE) || count(path, NAME) !== 1) {
    return null;
  }
  return path.slice(0, -ITEM_FILE.length);
}

export function registryItemUrl(
  registry: RegistrySource | string,
  name: string
): string {
  const source = normalise(registry);
  const parts = templateParts(source);
  if (!parts) {
    return joinSource(source, `${name}.json`);
  }
  return `${parts.head}${parts.path.replaceAll(NAME, () => name)}${withQuery(
    parts.query,
    source.params
  )}`;
}

function templateSibling(source: RegistrySource, path: string): string | null {
  const parts = templateParts(source);
  const dir = parts && templateDir(parts);
  if (!(parts && dir !== null)) {
    return null;
  }
  return `${parts.head}${dir}/${path}${withQuery(parts.query, source.params)}`;
}

export function registryCatalogueUrl(
  registry: RegistrySource | string
): string {
  const source = normalise(registry);
  return (
    templateSibling(source, "registry.json") ??
    joinSource(source, "registry.json")
  );
}

export function registryDemosUrl(
  registry: RegistrySource | string,
  name: string
): string {
  const source = normalise(registry);
  return (
    templateSibling(source, `demos/${name}`) ??
    joinSource(source, `demos/${name}`)
  );
}
