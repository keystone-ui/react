import { DocsLayout } from "fumadocs-ui/layouts/notebook";
import {
  SidebarCollapseTrigger,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "fumadocs-ui/layouts/notebook/slots/sidebar";
import type { ReactNode } from "react";
import { DocsSidebar } from "@/components/docs-sidebar";
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
      // The page tree inside the sidebar shows one section at a time
      // (components/docs-sidebar.tsx); Fumadocs keeps everything around it.
      slots={{
        sidebar: {
          provider: SidebarProvider,
          root: DocsSidebar,
          trigger: SidebarTrigger,
          collapseTrigger: SidebarCollapseTrigger,
          useSidebar,
        },
      }}
      sidebar={{
        collapsible: false,
        defaultOpenLevel: 1,
        tabs: {
          // The icon goes inside the title, so the navbar tabs show it. The
          // mobile tab dropdown draws `icon` beside `title` as well, so the
          // separate icon is dropped or it would show twice.
          transform: (tab) => ({
            ...tab,
            icon: undefined,
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
