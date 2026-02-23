"use client";

import { CodeIcon, ShareIcon } from "lucide-react";
import Link from "next/link";

import type { SetThemeState, ThemeState } from "../hooks/use-theme-state";

import { ModeSwitcher } from "./mode-switcher";

interface BuilderHeaderProps {
  isCodeVisible: boolean;
  onToggleCode: () => void;
  setState: SetThemeState;
  state: ThemeState;
}

export function BuilderHeader({
  state,
  setState,
  isCodeVisible,
  onToggleCode,
}: BuilderHeaderProps) {
  const handleShare = async () => {
    await navigator.clipboard.writeText(window.location.href);
  };

  return (
    <header className="flex h-14 items-center justify-between px-4">
      <Link className="font-semibold text-foreground text-sm" href="/">
        Keystone UI
      </Link>

      <div className="flex items-center gap-2">
        <ModeSwitcher setState={setState} state={state} />

        <button
          className="flex size-8 cursor-pointer items-center justify-center rounded-md border border-border text-foreground transition-colors hover:bg-muted"
          onClick={handleShare}
          title="Share theme link"
          type="button"
        >
          <ShareIcon className="size-4" />
        </button>

        <button
          className={`flex size-8 cursor-pointer items-center justify-center rounded-md border transition-colors ${
            isCodeVisible
              ? "border-foreground bg-foreground text-background"
              : "border-border text-foreground hover:bg-muted"
          }`}
          onClick={onToggleCode}
          title="View CSS code"
          type="button"
        >
          <CodeIcon className="size-4" />
        </button>
      </div>
    </header>
  );
}
