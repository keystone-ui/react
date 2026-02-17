import type { ReactNode } from "react";

export default function ThemesLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen flex-col overflow-hidden">{children}</div>
  );
}
