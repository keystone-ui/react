"use client";

import { CheckIcon, ClipboardIcon, XIcon } from "lucide-react";
import { useDeferredValue, useState } from "react";

import type { ThemeState } from "../hooks/use-theme-state";
import { generateCssOutput } from "../utils/generate-css-output";

interface CodePanelProps {
  isVisible: boolean;
  onClose: () => void;
  state: ThemeState;
}

export function CodePanel({ state, isVisible, onClose }: CodePanelProps) {
  const [copied, setCopied] = useState(false);
  const cssCode = generateCssOutput(state);
  const deferredCss = useDeferredValue(cssCode);

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

      {/* Code */}
      <div className="flex-1 overflow-auto">
        <pre className="p-4 text-foreground text-xs leading-relaxed">
          <code>{deferredCss}</code>
        </pre>
      </div>
    </div>
  );
}
