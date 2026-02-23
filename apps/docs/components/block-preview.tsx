"use client";

import { ChevronDown, Monitor, Smartphone, Tablet } from "lucide-react";
import React, { useState } from "react";

import { cn } from "@/lib/cn";

type Viewport = "desktop" | "tablet" | "mobile";

const viewportWidths: Record<Viewport, string> = {
  desktop: "w-full",
  tablet: "w-[768px]",
  mobile: "w-[375px]",
};

interface BlockPreviewContainerProps
  extends React.HTMLAttributes<HTMLDivElement> {
  description?: string;
  name: string;
}

export function BlockPreviewContainer({
  children,
  className,
  description,
  name,
  ...props
}: BlockPreviewContainerProps) {
  const [expanded, setExpanded] = useState(false);
  const [viewport, setViewport] = useState<Viewport>("desktop");
  const childArray = React.Children.toArray(children) as React.ReactElement[];
  const Component = childArray[0];
  const Code = childArray[1];

  return (
    <div
      className={cn("not-prose group relative my-6 w-full", className)}
      data-name={name}
      {...props}
    >
      {description && (
        <p className="mb-2 text-fd-muted-foreground text-sm">{description}</p>
      )}

      <div className="flex items-center justify-between rounded-t-xl border border-b-0 bg-fd-card px-4 py-2">
        <span className="font-mono text-fd-muted-foreground text-xs">
          {name}
        </span>
        <div className="flex items-center gap-1">
          {(
            [
              { key: "desktop", icon: Monitor },
              { key: "tablet", icon: Tablet },
              { key: "mobile", icon: Smartphone },
            ] as const
          ).map(({ key, icon: Icon }) => (
            <button
              className={cn(
                "inline-flex size-8 cursor-pointer items-center justify-center rounded-md text-fd-muted-foreground transition-colors hover:text-fd-foreground",
                viewport === key && "bg-fd-accent text-fd-foreground"
              )}
              key={key}
              onClick={() => setViewport(key)}
              type="button"
            >
              <Icon className="size-4" />
            </button>
          ))}
        </div>
      </div>

      <div className="flex w-full items-center justify-center overflow-hidden border border-b-0 bg-fd-background">
        <div
          className={cn(
            "relative min-h-[500px] transition-[width] duration-300 ease-in-out",
            viewportWidths[viewport]
          )}
        >
          {Component}
        </div>
      </div>

      {Code && (
        <div className="relative overflow-hidden rounded-b-xl border">
          <div
            className={cn(
              "overflow-hidden transition-[max-height] duration-300 ease-in-out",
              expanded ? "max-h-[3000px]" : "max-h-[140px]"
            )}
          >
            {Code}
          </div>

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
