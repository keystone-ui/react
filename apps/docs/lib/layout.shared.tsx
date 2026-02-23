import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: "Keystone UI",
    },
    githubUrl: "https://github.com/keystone-ui/react",
    links: [
      {
        text: "Docs",
        url: "/docs",
        active: "nested-url",
      },
      {
        text: "Theme Builder",
        url: "/theme-builder",
      },
      {
        text: "Gallery",
        url: "/gallery",
      },
      {
        text: "Changelog",
        url: "/changelog",
      },
    ],
  };
}
