import { HomeLayout } from "fumadocs-ui/layouts/home";
import type { ReactNode } from "react";
import { baseOptions } from "@/lib/layout.shared";

export default function ThemesLayout({ children }: { children: ReactNode }) {
  return (
    <HomeLayout {...baseOptions()}>
      <div className="flex h-[calc(100vh-var(--fd-nav-height))] flex-col overflow-hidden">
        {children}
      </div>
    </HomeLayout>
  );
}
