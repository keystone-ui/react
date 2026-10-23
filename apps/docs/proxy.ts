import { type NextRequest, NextResponse } from "next/server";

import { buildKnownPaths, isKnownPath } from "@/lib/known-paths";
import staticPaths from "@/lib/static-paths.json";

/**
 * Unknown params under the dynamic routes answer with the static 404.
 *
 * Under Cache Components + Partial Prefetching each dynamic route also has
 * a fallback shell for params that generateStaticParams did not return.
 * The Worker serves prerendered pages through cache interception, which
 * cannot resume that shell: `/docs/<garbage>` hung and returned 500, and
 * `/preview/<garbage>` served an empty 200. Every valid path is known at
 * build time (lib/static-paths.json, generated), so anything else is
 * rewritten to a path that does not exist and Next's prerendered not-found
 * page answers with 404.
 */
const known = buildKnownPaths(staticPaths);

export function proxy(request: NextRequest) {
  if (isKnownPath(request.nextUrl.pathname, known)) {
    return NextResponse.next();
  }
  return NextResponse.rewrite(new URL("/__not-found", request.url), {
    status: 404,
  });
}

export const config = {
  matcher: ["/docs/:path*", "/blog/:path*", "/preview/:path*"],
};
