import { createMDX } from "fumadocs-mdx/next";
import type { NextConfig } from "next";

import { securityHeaders } from "./lib/security-headers";

/**
 * One year, in seconds. The only finite `revalidate` OpenNext's cache
 * interceptor treats as static output: every built-in `cacheLife` profile
 * is shorter (`max` is 30 days), and a shorter TTL on a route makes the
 * interceptor consider it stale and fall through to the Worker, where the
 * read-only static-assets cache cannot store anything.
 */
const ONE_YEAR = 31_536_000;

const config: NextConfig = {
  // The Cache Components model (Next 16.4 recommends it for every app and
  // it becomes the default in 17): caching is explicit via `use cache`, and
  // links prefetch one shared App Shell per route instead of a full page per
  // visible link. This site is fully static, so the shell is the whole
  // layout and `ensureStatic` on the layouts fails the build if anything
  // ever starts rendering at request time.
  cacheComponents: true,
  partialPrefetching: true,
  cacheLife: {
    static: {
      stale: 300,
      revalidate: ONE_YEAR,
      expire: ONE_YEAR,
    },
  },
  experimental: {
    // Next's testing API (the `next-instant-navigation-testing` cookie that
    // `instant()` from @next/playwright drives) stays out of production
    // builds unless the build asks for it. CI's e2e build sets this; deploy
    // builds never do.
    exposeTestingApiInProductionBuild: process.env.EXPOSE_TESTING_API === "1",
    // TypeScript 7 ships no JS API, so Next's in-process type-check can't
    // load it. Run the `tsc` CLI instead.
    useTypeScriptCli: true,
  },
  headers() {
    return Promise.resolve(securityHeaders());
  },
  redirects() {
    return Promise.resolve([
      {
        source: "/themes",
        destination: "/theme-builder",
        permanent: true,
      },
      {
        source: "/docs/getting-started",
        destination: "/docs",
        permanent: true,
      },
      {
        source: "/docs/getting-started/quick-start",
        destination: "/docs/installation/quick-start",
        permanent: true,
      },
      {
        source: "/docs/getting-started/registry",
        destination: "/docs/installation/registry",
        permanent: true,
      },
      {
        source: "/docs/getting-started/theming",
        destination: "/docs/theming",
        permanent: true,
      },
      {
        source: "/docs/getting-started/colors",
        destination: "/docs/theming/colors",
        permanent: true,
      },
      {
        source: "/docs/getting-started/dark-mode",
        destination: "/docs/theming/dark-mode",
        permanent: true,
      },
      {
        source: "/docs/getting-started/customization",
        destination: "/docs/theming/customization",
        permanent: true,
      },
      {
        source: "/docs/getting-started/llms-txt",
        destination: "/docs/agents/llms-txt",
        permanent: true,
      },
    ]);
  },
  rewrites() {
    return Promise.resolve([
      {
        source: "/docs/:path*.mdx",
        destination: "/llms.mdx/docs/:path*",
      },
    ]);
  },
};

const withMDX = createMDX();

export default withMDX(config);
