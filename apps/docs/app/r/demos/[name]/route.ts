import { join } from "node:path";

import { cacheLife } from "next/cache";
import { NextResponse } from "next/server";

import { demoFiles } from "@/demos/files";
import { demoNamesFromFiles } from "@/lib/demo-names";
import {
  type DemoBundle,
  getDemoFiles,
  isValidDemoName,
} from "@/lib/get-demo-files";

/**
 * Cached so the route prerenders under Cache Components (an uncached fs
 * read in a GET handler would make it render on demand, where `demos/`
 * does not exist). The try/catch stays inside so an unknown name at request
 * time is a 404, not a 500.
 */
async function getDemoBundle(name: string): Promise<DemoBundle | null> {
  "use cache";
  cacheLife("static");
  try {
    return await getDemoFiles({
      name,
      demosRoot: join(process.cwd(), "demos"),
    });
  } catch {
    return null;
  }
}

/**
 * Prerendered for every component and block name.
 *
 * The filesystem this route reads does not exist inside the deployed Worker:
 * when this ran at request time, every name returned 404 in production and
 * the MCP `get_examples` tool was dead while CI stayed green (its unit test
 * reads the repo). Prerendering moves the read to `next build`, where the
 * files exist, and serves the JSON from static assets.
 */

export function generateStaticParams() {
  return demoNamesFromFiles(Object.values(demoFiles)).map((name) => ({
    name,
  }));
}

export async function GET(
  _: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;

  if (!isValidDemoName(name)) {
    return NextResponse.json({ error: "Invalid name", name }, { status: 400 });
  }

  const bundle = await getDemoBundle(name);

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
