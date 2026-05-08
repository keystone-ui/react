"use client";

import { Button } from "@keystoneui/react/button";
import { ChevronDown } from "lucide-react";
import React, { useState } from "react";

import { V0Logo } from "@/components/v0-logo";
import { cn } from "@/lib/cn";

const V0_URL = process.env.NEXT_PUBLIC_V0_URL;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL;
const V0_ENABLED = Boolean(V0_URL && APP_URL);

interface ComponentPreviewContainerProps
  extends React.HTMLAttributes<HTMLDivElement> {
  description?: string;
  hideCode?: boolean;
  name: string;
}

export function ComponentPreviewContainer({
  children,
  className,
  description,
  hideCode = false,
  name,
  ...props
}: ComponentPreviewContainerProps) {
  const [expanded, setExpanded] = useState(false);
  const childArray = React.Children.toArray(children) as React.ReactElement[];
  const Component = childArray[0];
  const Code = childArray[1];

  const v0Href = V0_ENABLED
    ? `${V0_URL}/chat/api/open?url=${encodeURIComponent(`${APP_URL}/r/${name}.json`)}`
    : undefined;

  return (
    <div
      className={cn("not-prose group relative my-6 w-full", className)}
      data-name={name}
      {...props}
    >
      {description && (
        <p className="mb-2 text-fd-muted-foreground text-sm">{description}</p>
      )}

      {/* Toolbar (only when v0 is configured) */}
      {v0Href && (
        <div className="flex flex-wrap items-center gap-2 rounded-t-xl border border-b-0 bg-fd-card px-3 py-2">
          <span className="font-mono text-fd-muted-foreground text-xs">
            {name}
          </span>
          <Button
            className="ml-auto"
            render={
              // biome-ignore lint/a11y/useAnchorContent: children are forwarded by Base UI's render prop
              <a href={v0Href} rel="noreferrer" target="_blank" />
            }
            size="sm"
            variant="default"
          >
            Open in <V0Logo className="size-5" />
          </Button>
        </div>
      )}

      {/* Preview Section */}
      <div
        className={cn(
          "flex min-h-[200px] w-full items-center justify-center overflow-hidden border border-b-0 bg-fd-background p-6 sm:p-10",
          !v0Href && "rounded-t-xl",
          hideCode && !Code && "rounded-b-xl border-b"
        )}
      >
        {Component}
      </div>

      {/* Code Section */}
      {!hideCode && Code && (
        <div className="relative overflow-hidden rounded-b-xl border">
          <div
            className={cn(
              "overflow-hidden transition-[max-height] duration-300 ease-in-out",
              expanded ? "max-h-[2000px]" : "max-h-[140px]"
            )}
          >
            {Code}
          </div>

          {/* Expand/Collapse gradient overlay + button */}
          <div
            className={cn(
              "absolute inset-x-0 bottom-0 flex items-end justify-center",
              expanded
                ? "h-10 bg-transparent"
                : "h-24 bg-linear-to-t from-fd-card to-transparent"
            )}
          >
            <button
              className="mb-2 inline-flex cursor-pointer items-center gap-1 rounded-lg border bg-fd-card px-3 py-1.5 font-medium text-fd-muted-foreground text-xs shadow-sm transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground"
              onClick={() => setExpanded((prev) => !prev)}
              type="button"
            >
              {expanded ? "Collapse" : "Expand"}
              <ChevronDown
                className={cn(
                  "size-3 transition-transform duration-200",
                  expanded && "rotate-180"
                )}
              />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
