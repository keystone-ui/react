import type { ReactNode } from "react";

/**
 * Nested under `(home)/layout.tsx`, which supplies the shared `HomeLayout`.
 * This layout only pins the builder to the viewport below the navbar; a
 * second `HomeLayout` here would render the header twice.
 */
export default function ThemesLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-[calc(100vh-var(--fd-nav-height))] flex-col overflow-hidden">
      {children}
    </div>
  );
}
