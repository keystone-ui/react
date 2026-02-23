import { DocsLayout } from "fumadocs-ui/layouts/notebook";
import type { ReactNode } from "react";
import { baseOptions } from "@/lib/layout.shared";
import { source } from "@/lib/source";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
      tabMode="navbar"
      tree={source.pageTree}
      {...baseOptions()}
      nav={{
        ...baseOptions().nav,
        mode: "top",
      }}
      sidebar={{
        collapsible: false,
        defaultOpenLevel: 1,
        tabs: {
          transform: (tab) => ({
            ...tab,
            title: (
              <span className="inline-flex items-center gap-2">
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
