import { DocsLayout } from "fumadocs-ui/layouts/notebook";
import type { ReactNode } from "react";
import { baseOptions } from "@/lib/layout.shared";
import { source } from "@/lib/source";

/**
 * Every docs page is prerendered and served from static assets. Any
 * request-time server work under this layout (an uncached fetch or file
 * read, `cookies()`, `headers()`) would silently turn a page into a Worker
 * invocation; `ensureStatic` turns that into a build failure instead.
 */
export const ensureStatic = "navigation";

export default function Layout({ children }: { children: ReactNode }) {
  const base = baseOptions();
  return (
    <DocsLayout
      tabMode="navbar"
      tree={source.pageTree}
      {...base}
      nav={{
        ...base.nav,
        mode: "top",
      }}
      sidebar={{
        collapsible: false,
        defaultOpenLevel: 1,
        tabs: {
          transform: (tab) => ({
            ...tab,
            title: (
              <span className="inline-flex items-center gap-2 [&_svg]:size-4">
                {tab.icon}
                {tab.title}
              </span>
            ),
          }),
        },
      }}
    >
      {children}
    </DocsLayout>
  );
}
