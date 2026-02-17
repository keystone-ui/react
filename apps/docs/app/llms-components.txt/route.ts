import { getLLMText } from "@/lib/get-llm-text";
import { filterComponentPages, LLMS_TEXT_HEADERS } from "@/lib/llms-utils";
import { source } from "@/lib/source";

export const revalidate = false;

export async function GET() {
  try {
    const pages = filterComponentPages(source.getPages());
    const results = await Promise.all(pages.map(getLLMText));

    return new Response(results.join("\n\n"), { headers: LLMS_TEXT_HEADERS });
  } catch (error) {
    console.error("Error generating llms-components.txt:", error);

    return new Response("Error generating component documentation", {
      headers: LLMS_TEXT_HEADERS,
      status: 500,
    });
  }
}
