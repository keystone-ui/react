import { getLLMText } from "@/lib/get-llm-text";
import { filterComponentPages, LLMS_TEXT_HEADERS } from "@/lib/llms-utils";
import { source } from "@/lib/source";

// No try/catch: this prerenders, so a missing source file must fail the
// build rather than ship an error body.
export async function GET() {
  const pages = filterComponentPages(source.getPages());
  const results = await Promise.all(
    pages.map((page) => getLLMText(page.slugs))
  );

  return new Response(results.join("\n\n"), { headers: LLMS_TEXT_HEADERS });
}
