import {
  formatAbsoluteUrl,
  generateIndexHeader,
  LLMS_TEXT_HEADERS,
} from "@/lib/llms-utils";
import { source } from "@/lib/source";

export const revalidate = false;

export function GET() {
  try {
    const lines = generateIndexHeader();
    const pages = source.getPages();

    const grouped = new Map<string, string[]>();

    for (const page of pages) {
      const section = page.slugs[0] ?? "docs";
      const list = grouped.get(section) ?? [];
      const absoluteUrl = formatAbsoluteUrl(page.url);

      if (page.data.description) {
        list.push(
          `- [${page.data.title}](${absoluteUrl}): ${page.data.description}`
        );
      } else {
        list.push(`- [${page.data.title}](${absoluteUrl})`);
      }

      grouped.set(section, list);
    }

    for (const [section, entries] of grouped) {
      const heading =
        section.charAt(0).toUpperCase() + section.slice(1).replace(/-/g, " ");

      lines.push(`### ${heading}`);
      lines.push("");
      lines.push(entries.join("\n"));
      lines.push("");
    }

    return new Response(lines.join("\n"), { headers: LLMS_TEXT_HEADERS });
  } catch (error) {
    console.error("Error generating llms.txt:", error);

    return new Response("Error generating documentation index", {
      headers: LLMS_TEXT_HEADERS,
      status: 500,
    });
  }
}
