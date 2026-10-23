import { NextResponse } from "next/server";

import { getLLMText } from "@/lib/get-llm-text";
import { LLMS_TEXT_HEADERS } from "@/lib/llms-utils";
import { source } from "@/lib/source";

export const revalidate = false;

/**
 * Every page is prerendered, including the docs root. Unknown slugs never
 * reach the handler, so they get Next's 404 instead of the 500 this route
 * used to return when `notFound()` was thrown inside a try/catch.
 */
export const dynamicParams = false;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug?: string[] }> }
) {
  const { slug } = await params;
  const page = source.getPage(slug ?? []);

  if (!page) {
    return new NextResponse("Not found", {
      headers: LLMS_TEXT_HEADERS,
      status: 404,
    });
  }

  // No try/catch: this runs at build time, so a missing MDX file must fail
  // the build rather than ship a placeholder body.
  const content = await getLLMText(page);

  return new NextResponse(content, { headers: LLMS_TEXT_HEADERS });
}

export function generateStaticParams() {
  return source.generateParams().map((param) => ({ slug: param.slug ?? [] }));
}
