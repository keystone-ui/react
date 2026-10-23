import type { MetadataRoute } from "next";

/** Top-level sections that are not part of the docs content tree. */
const STATIC_PATHS = [
  "/",
  "/gallery",
  "/blocks",
  "/theme-builder",
  "/changelog",
  "/blog",
];

/** `_template`, `_block-template`: authoring references, never pages. */
const HIDDEN_SEGMENT = /\/_/;

interface SitemapInput {
  /** `/blog/<slug>` for each post. */
  blogSlugs: readonly string[];
  /** `page.url` for every docs page, e.g. `/docs/components/button`. */
  docsUrls: readonly string[];
  /** Origin without a trailing slash. */
  siteUrl: string;
}

/**
 * Absolute, de-duplicated, sorted sitemap entries. `/preview/*` is excluded:
 * those pages exist only to be iframed by the block docs.
 */
export function buildSitemapEntries({
  blogSlugs,
  docsUrls,
  siteUrl,
}: SitemapInput): MetadataRoute.Sitemap {
  const paths = new Set<string>(STATIC_PATHS);
  for (const url of docsUrls) {
    paths.add(url);
  }
  for (const slug of blogSlugs) {
    paths.add(`/blog/${slug}`);
  }

  return [...paths]
    .filter(
      (path) => !(HIDDEN_SEGMENT.test(path) || path.startsWith("/preview/"))
    )
    .map((path) => (path === "/" ? siteUrl : `${siteUrl}${path}`))
    .sort()
    .map((url) => ({ url }));
}
