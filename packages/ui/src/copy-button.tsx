"use client";

import { Check as CheckIcon, Copy as CopyIcon } from "lucide-react";
import type * as React from "react";
import { useEffect, useRef, useState } from "react";

import { Button } from "./button";
import { cn } from "./utils";

const RESET_DELAY_MS = 2000;

export interface CopyButtonProps
  extends Omit<React.ComponentProps<typeof Button>, "children" | "value"> {
  /** Called after the value reaches the clipboard. */
  onCopied?: (value: string) => void;
  /** How long the confirmed state lasts, in milliseconds. @default 2000 */
  resetDelay?: number;
  /** The text placed on the clipboard. */
  value: string;
}

/**
 * Copies a value to the clipboard and confirms it.
 *
 * The affordance itself is trivial; the reason it is a component is that the
 * hand-rolled version is not. Every copy of it in this repo shared the same
 * three defects — the reset timer was never cleared, so a click followed by an
 * unmount set state on a dead component; `writeText` was not awaited, so a
 * rejection surfaced as an unhandled promise; and the failure path showed a
 * tick anyway, telling the user something was copied when nothing was.
 * Clipboard access throws whenever the document is not focused or the context
 * is insecure, which is not an edge case on a docs site.
 *
 * Pairs with a value rather than wrapping it, so it composes beside monospace
 * IDs, inside an `InputGroup`, or in a table cell without assuming a layout.
 */
function CopyButton({
  className,
  onCopied,
  resetDelay = RESET_DELAY_MS,
  size = "icon-sm",
  value,
  variant = "ghost",
  ...props
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timeout.current) {
        clearTimeout(timeout.current);
      }
    },
    []
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Leave the icon alone. A tick after a failed write is worse than no
      // feedback — it tells the user the value is on their clipboard when it
      // is not, and they find out when they paste.
      return;
    }

    onCopied?.(value);
    setCopied(true);

    if (timeout.current) {
      clearTimeout(timeout.current);
    }
    timeout.current = setTimeout(() => setCopied(false), resetDelay);
  };

  return (
    <Button
      aria-label={copied ? "Copied" : "Copy"}
      className={cn("text-muted-foreground", className)}
      data-copied={copied || undefined}
      data-slot="copy-button"
      onClick={handleCopy}
      size={size}
      type="button"
      variant={variant}
      {...props}
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
    </Button>
  );
}

CopyButton.displayName = "CopyButton";

export { CopyButton };
