import { HomeLayout } from "fumadocs-ui/layouts/home";
import type { ReactNode } from "react";
import { baseOptions } from "@/lib/layout.shared";

/** See app/docs/layout.tsx: fail the build if a page here goes dynamic. */
export const ensureStatic = "navigation";

export default function Layout({ children }: { children: ReactNode }) {
  return <HomeLayout {...baseOptions()}>{children}</HomeLayout>;
}
