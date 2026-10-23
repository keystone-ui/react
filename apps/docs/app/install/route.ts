import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { cacheLife } from "next/cache";

const SITE_URL = "https://keystoneui.io";

/**
 * Cached so the route prerenders under Cache Components: an uncached file
 * read in a GET handler would make it render on demand, and `skills/` does
 * not exist inside the deployed Worker.
 */
async function getInstallScript(): Promise<string> {
  "use cache";
  cacheLife("static");
  const scriptPath = join(process.cwd(), "skills", "install.sh");
  const script = await readFile(scriptPath, "utf-8");
  return script.replace(/\{\{BASE_URL\}\}/g, SITE_URL);
}

export async function GET() {
  const script = await getInstallScript();

  return new Response(script, {
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      "Content-Type": "text/x-shellscript; charset=utf-8",
    },
  });
}
