"use client";

import { MoonIcon, SunIcon } from "lucide-react";

import type { SetThemeState, ThemeState } from "../hooks/use-theme-state";

interface ModeSwitcherProps {
  state: ThemeState;
  setState: SetThemeState;
}

export function ModeSwitcher({ state, setState }: ModeSwitcherProps) {
  const isDark = state.mode === "dark";

  return (
    <button
      className="flex size-8 cursor-pointer items-center justify-center rounded-md border border-border text-foreground transition-colors hover:bg-muted"
      onClick={() => setState({ mode: isDark ? "light" : "dark" })}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      type="button"
    >
      {isDark ? (
        <SunIcon className="size-4" />
      ) : (
        <MoonIcon className="size-4" />
      )}
    </button>
  );
}
