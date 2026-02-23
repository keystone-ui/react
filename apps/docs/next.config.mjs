import { createMDX } from "fumadocs-mdx/next";

/** @type {import('next').NextConfig} */
const config = {
  async redirects() {
    return [
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
    ];
  },
  async rewrites() {
    return [
      {
        source: "/docs/:path*.mdx",
        destination: "/llms.mdx/docs/:path*",
      },
    ];
  },
};

const withMDX = createMDX();

export default withMDX(config);
