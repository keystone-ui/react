import { createMDX } from "fumadocs-mdx/next";
import type { NextConfig } from "next";

import { securityHeaders } from "./lib/security-headers";

const config: NextConfig = {
  experimental: {
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
