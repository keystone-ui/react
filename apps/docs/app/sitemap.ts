import type { MetadataRoute } from "next";

import { blogPosts } from "@/.source/server";
import { buildSitemapEntries } from "@/lib/sitemap-entries";
import { source } from "@/lib/source";

const SITE_URL = "https://keystoneui.io";
const MDX_EXT = /\.mdx?$/;

export default function sitemap(): MetadataRoute.Sitemap {
  return buildSitemapEntries({
    siteUrl: SITE_URL,
    docsUrls: source.getPages().map((page) => page.url),
    blogSlugs: blogPosts.map((post) => post.info.path.replace(MDX_EXT, "")),
  });
}
