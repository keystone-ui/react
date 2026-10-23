import { join } from "node:path";

import { NextResponse } from "next/server";

import { demos } from "@/demos";
import { demoNamesFromFiles } from "@/lib/demo-names";
import { getDemoFiles, isValidDemoName } from "@/lib/get-demo-files";

/**
 * Prerendered for every component and block name.
 *
 * The filesystem this route reads does not exist inside the deployed Worker:
 * when this ran at request time, every name returned 404 in production and
 * the MCP `get_examples` tool was dead while CI stayed green (its unit test
 * reads the repo). Prerendering moves the read to `next build`, where the
 * files exist, and serves the JSON from static assets.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return demoNamesFromFiles(Object.values(demos).map((demo) => demo.file)).map(
    (name) => ({ name })
  );
}

export async function GET(
  _: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;

  if (!isValidDemoName(name)) {
    return NextResponse.json({ error: "Invalid name", name }, { status: 400 });
  }

  const demosRoot = join(process.cwd(), "demos");
  let bundle: Awaited<ReturnType<typeof getDemoFiles>> = null;
  try {
    bundle = await getDemoFiles({ name, demosRoot });
  } catch {
    // Only reachable off the build machine (no `demos/` on disk): answer
    // like a miss rather than a server fault.
    bundle = null;
  }

  if (!bundle) {
    return NextResponse.json(
      { error: "Demo not found", name },
      { status: 404 }
    );
  }

  return NextResponse.json(bundle, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
    },
  });
}
