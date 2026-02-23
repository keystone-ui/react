import { readFile } from "node:fs/promises";
import { join } from "node:path";

const SITE_URL = "https://keystoneui.io";

export const revalidate = false;

export async function GET() {
  try {
    const scriptPath = join(process.cwd(), "skills", "install.sh");
    let script = await readFile(scriptPath, "utf-8");

    script = script.replace(/\{\{BASE_URL\}\}/g, SITE_URL);

    return new Response(script, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        "Content-Type": "text/x-shellscript; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("Error serving install script:", error);
    return new Response("Error serving install script", { status: 500 });
  }
}
