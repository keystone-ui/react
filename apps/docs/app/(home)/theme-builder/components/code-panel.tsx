"use client";

import { CopyButton } from "@keystoneui/react/copy-button";
import {
  Check as CheckIcon,
  Clipboard as ClipboardIcon,
  X as XIcon,
} from "lucide-react";
import { useDeferredValue, useState } from "react";

import type { ThemeState } from "../hooks/use-theme-state";
import { themeContrast } from "../utils/contrast";
import { generateCssOutput } from "../utils/generate-css-output";
import { encodeThemeCode } from "../utils/theme-code";

interface CodePanelProps {
  isVisible: boolean;
  onClose: () => void;
  state: ThemeState;
}

export function CodePanel({ state, isVisible, onClose }: CodePanelProps) {
  const [copied, setCopied] = useState(false);
  const cssCode = generateCssOutput(state);
  const deferredCss = useDeferredValue(cssCode);
  const installCommand = `npx shadcn@latest add https://keystoneui.io/r/theme/${encodeThemeCode(state)}.json`;
  const contrast = themeContrast(state);
  const failing = contrast.filter((r) => !r.pass);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(deferredCss);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="absolute inset-0 z-20 flex flex-col overflow-hidden rounded-xl border border-border bg-background">
      {/* Header */}
      <div className="flex items-center justify-between border-border border-b px-4 py-2">
        <span className="font-medium text-foreground text-sm">global.css</span>
        <div className="flex items-center gap-2">
          <button
            className="flex size-7 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            onClick={handleCopy}
            title="Copy to clipboard"
            type="button"
          >
            {copied ? (
              <CheckIcon className="size-4" />
            ) : (
              <ClipboardIcon className="size-4" />
            )}
          </button>
          <button
            className="flex size-7 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            onClick={onClose}
            title="Close"
            type="button"
          >
            <XIcon className="size-4" />
          </button>
        </div>
      </div>

      {/* Install by code: the code is the whole theme, served as a registry item */}
      <div className="flex items-center gap-2 border-border border-b bg-muted/40 px-4 py-2">
        <code className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-muted-foreground text-xs">
          {installCommand}
        </code>
        <CopyButton
          aria-label="Copy install command"
          size="icon-xs"
          value={installCommand}
          variant="ghost"
        />
      </div>

      {/* Contrast: the checks `keystoneui audit --theme` runs, live */}
      <div
        className="flex flex-col gap-1 border-border border-b px-4 py-2 text-xs"
        data-slot="theme-contrast"
      >
        <span className="font-medium text-foreground">
          Contrast · WCAG AA ·{" "}
          <span className="tabular-nums">
            {contrast.length - failing.length}/{contrast.length}
          </span>{" "}
          pairs pass
        </span>
        {failing.map((r) => (
          <span
            className="text-muted-foreground tabular-nums"
            key={`${r.mode}-${r.pair}`}
          >
            <span className="text-destructive">✖</span> {r.mode} {r.pair}{" "}
            {r.ratio.toFixed(2)}:1
          </span>
        ))}
      </div>

      {/* Code */}
      <div className="flex-1 overflow-auto">
        <pre className="p-4 text-foreground text-xs leading-relaxed">
          <code>{deferredCss}</code>
        </pre>
      </div>
    </div>
  );
}
