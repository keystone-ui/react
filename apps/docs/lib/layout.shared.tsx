import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import Image from "next/image";

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <>
          <Image
            alt="Keystone UI"
            className="hidden dark:block"
            height={24}
            src="/logo-full-light.svg"
            width={120}
          />
          <Image
            alt="Keystone UI"
            className="block dark:hidden"
            height={24}
            src="/logo-full-dark.svg"
            width={120}
          />
        </>
      ),
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
