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
        text: "Components",
        url: "/docs/components/button",
        active: "nested-url",
      },
      {
        text: "Themes",
        url: "/themes",
      },
      {
        text: "Gallery",
        url: "/gallery",
      },
      {
        text: "Blog",
        url: "/blog",
      },
      {
        text: "Changelog",
        url: "/changelog",
      },
    ],
  };
}
