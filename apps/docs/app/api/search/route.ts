import type { StructuredData } from "fumadocs-core/mdx-plugins";
import { createFromSource } from "fumadocs-core/search/server";
import type { ContentType } from "@/lib/content-types";
import { rankResults, type SearchResult } from "@/lib/search-rank";
import { searchTag } from "@/lib/search-tag";
import { source } from "@/lib/source";

interface IndexedPageData {
  contentType?: ContentType;
  description?: string;
  load?: () => Promise<{ structuredData: StructuredData }>;
  structuredData?: StructuredData;
  title?: string;
}

const api = createFromSource(source, {
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

// The search returns page groups in index order, so ask for enough
// candidates to rank (lib/search-rank.ts), then return the requested number.
const CANDIDATES = 600;
const DEFAULT_LIMIT = 60;

export async function GET(request: Request): Promise<Response> {
  const params = new URL(request.url).searchParams;
  const query = params.get("query");
  if (!query) {
    return Response.json([]);
  }
  const requested = Number(params.get("limit"));
  const limit =
    Number.isInteger(requested) && requested > 0 ? requested : DEFAULT_LIMIT;
  const results = (await api.search(query, {
    tag: params.get("tag")?.split(","),
    limit: CANDIDATES,
  })) as SearchResult[];
  return Response.json(rankResults(results, query, limit));
}
