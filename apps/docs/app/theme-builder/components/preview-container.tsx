"use client";

import { useEffect, useState } from "react";

import { THEME_PREVIEW_ID } from "../constants";
import { useCssSync } from "../hooks/use-css-sync";
import type { ThemeState } from "../hooks/use-theme-state";

import { DemoComponents } from "./demo-components";

interface PreviewContainerProps {
  state: ThemeState;
}

export function PreviewContainer({ state }: PreviewContainerProps) {
  const [mounted, setMounted] = useState(false);

  useCssSync(state);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      className="min-h-0 flex-1 overflow-auto rounded-xl border border-border"
      data-mode={state.mode}
      id={THEME_PREVIEW_ID}
      style={{
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
        fontFamily: "var(--font-sans, var(--font-inter)), sans-serif",
      }}
    >
      {mounted ? <DemoComponents /> : null}
    </div>
  );
}
