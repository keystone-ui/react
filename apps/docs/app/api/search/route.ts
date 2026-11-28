import type { StructuredData } from "fumadocs-core/mdx-plugins";
import { createFromSource } from "fumadocs-core/search/server";
import type { ContentType } from "@/lib/content-types";
import { searchTag } from "@/lib/search-tag";
import { source } from "@/lib/source";

interface IndexedPageData {
  contentType?: ContentType;
  description?: string;
  load?: () => Promise<{ structuredData: StructuredData }>;
  structuredData?: StructuredData;
  title?: string;
}

export const { GET } = createFromSource(source, {
  async buildIndex(page) {
    const data = page.data as IndexedPageData;
    // Same lookup as fumadocs' default index: lazily loaded pages only
    // carry their structured data after load().
    const structuredData =
      data.structuredData ?? (await data.load?.())?.structuredData;
    if (!structuredData) {
      throw new Error(`No structured data for ${page.url}`);
    }
    return {
      id: page.url,
      url: page.url,
      title: data.title ?? page.url,
      description: data.description,
      structuredData,
      tag: searchTag(page.slugs, data.contentType),
    };
  },
});
