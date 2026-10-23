/**
 * Helpers behind `proxy.ts`, which answers unknown `/docs`, `/blog` and
 * `/preview` paths with the static 404 before Next can try to resume the
 * route's fallback shell (unsupported on the Worker's cache interception).
 * Pure so the rules can be unit-tested; the data comes from the generated
 * `lib/static-paths.json`.
 */

const ROUTE_GROUP = /^\(.*\)$/;
const MDX_EXT = /\.mdx$/;
const TRAILING_SLASH = /\/+$/;

/**
 * fumadocs URL for a file under `content/docs`: route-group segments and
 * the extension are dropped, `index` maps to its directory. Authoring
 * templates (`_*.mdx`) and non-MDX files yield null.
 */
export function docsUrlFromFile(relativePath: string): string | null {
  if (!MDX_EXT.test(relativePath)) {
    return null;
  }
  const segments = relativePath
    .replace(MDX_EXT, "")
    .split("/")
    .filter((segment) => segment && !ROUTE_GROUP.test(segment));
  if (segments.some((segment) => segment.startsWith("_"))) {
    return null;
  }
  if (segments.at(-1) === "index") {
    segments.pop();
  }
  return segments.length === 0 ? "/docs" : `/docs/${segments.join("/")}`;
}

export interface KnownPaths {
  blog: ReadonlySet<string>;
  docs: ReadonlySet<string>;
  preview: ReadonlySet<string>;
}

export function buildKnownPaths(input: {
  blog: readonly string[];
  docs: readonly string[];
  preview: readonly string[];
}): KnownPaths {
  return {
    blog: new Set(input.blog),
    docs: new Set(input.docs),
    preview: new Set(input.preview),
  };
}

/** Prefixes with a dynamic segment whose unknown params must not render. */
const GUARDED = ["/docs", "/blog", "/preview"] as const;

export function isKnownPath(pathname: string, known: KnownPaths): boolean {
  const path = pathname.replace(TRAILING_SLASH, "") || "/";
  const guarded = GUARDED.find((p) => path === p || path.startsWith(`${p}/`));
  if (!guarded) {
    return true;
  }
  if (guarded === "/preview") {
    return known.preview.has(path.slice("/preview/".length));
  }
  if (guarded === "/blog") {
    return known.blog.has(path);
  }
  // `/docs/<page>.mdx` is rewritten to the llms route for the same page.
  return known.docs.has(path.replace(MDX_EXT, ""));
}
