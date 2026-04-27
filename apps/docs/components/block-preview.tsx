"use client";

import { Button } from "@keystoneui/react/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@keystoneui/react/resizable";
import { Separator } from "@keystoneui/react/separator";
import { ToggleGroup, ToggleGroupItem } from "@keystoneui/react/toggle-group";
import {
  ChevronDownIcon,
  ExternalLinkIcon,
  MonitorIcon,
  RotateCwIcon,
  SmartphoneIcon,
  TabletIcon,
} from "lucide-react";
import { useRef, useState } from "react";
import type { PanelImperativeHandle } from "react-resizable-panels";

import { cn } from "@/lib/cn";

const VIEWPORT_PRESETS = [
  { value: "100%", label: "Desktop", Icon: MonitorIcon },
  { value: "60%", label: "Tablet", Icon: TabletIcon },
  { value: "30%", label: "Mobile", Icon: SmartphoneIcon },
] as const;

const V0_URL = process.env.NEXT_PUBLIC_V0_URL;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL;
const V0_ENABLED = Boolean(V0_URL && APP_URL);

const BLOCK_PREFIX_REGEX = /^block-/;

interface BlockPreviewContainerProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Optional description shown above the toolbar. */
  description?: string;
  /** Iframe height. Accepts any Tailwind height class. */
  heightClassName?: string;
  /** The demo's registry name, e.g. `block-tickets-01`. Drives the iframe `src`. */
  name: string;
}

export function BlockPreviewContainer({
  children,
  className,
  description,
  heightClassName = "h-[640px]",
  name,
  ...props
}: BlockPreviewContainerProps) {
  const [expanded, setExpanded] = useState(false);
  const [viewport, setViewport] = useState<string>("100%");
  const [iframeKey, setIframeKey] = useState(0);
  const panelRef = useRef<PanelImperativeHandle>(null);

  const registryName = name.replace(BLOCK_PREFIX_REGEX, "");
  const v0Href = V0_ENABLED
    ? `${V0_URL}/chat/api/open?url=${encodeURIComponent(`${APP_URL}/r/${registryName}.json`)}`
    : undefined;

  const handleViewportChange = (next: string[]) => {
    const last = next.at(-1);
    if (!last) {
      return;
    }
    setViewport(last);
    panelRef.current?.resize(last);
  };

  return (
    <div
      className={cn("not-prose group relative my-6 w-full", className)}
      data-name={name}
      {...props}
    >
      {description && (
        <p className="mb-2 text-fd-muted-foreground text-sm">{description}</p>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 rounded-t-xl border border-b-0 bg-fd-card px-3 py-2">
        <span className="font-mono text-fd-muted-foreground text-xs">
          {name}
        </span>
        <div className="ml-auto flex items-center gap-1.5 rounded-md border border-border bg-background p-[3px]">
          <ToggleGroup
            aria-label="Viewport size"
            onValueChange={handleViewportChange}
            value={[viewport]}
          >
            {VIEWPORT_PRESETS.map(({ value, label, Icon }) => (
              <ToggleGroupItem
                aria-label={label}
                key={value}
                size="sm"
                title={label}
                value={value}
              >
                <Icon className="size-4" />
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <Separator className="mx-0.5 h-4" orientation="vertical" />
          <Button
            aria-label="Refresh preview"
            onClick={() => setIframeKey((k) => k + 1)}
            size="icon-sm"
            title="Refresh"
            variant="ghost"
          >
            <RotateCwIcon className="size-4" />
          </Button>
          <Button
            aria-label="Open preview in new tab"
            render={
              // biome-ignore lint/a11y/useAnchorContent: children are forwarded by Base UI's render prop
              <a href={`/preview/${name}`} rel="noreferrer" target="_blank" />
            }
            size="icon-sm"
            title="Open in new tab"
            variant="ghost"
          >
            <ExternalLinkIcon className="size-4" />
          </Button>
        </div>
        {v0Href && (
          <Button
            render={
              // biome-ignore lint/a11y/useAnchorContent: children are forwarded by Base UI's render prop
              <a href={v0Href} rel="noreferrer" target="_blank" />
            }
            size="sm"
            variant="default"
          >
            Open in v0
          </Button>
        )}
      </div>

      {/* Iframe inside resizable panels */}
      <div
        className={cn(
          "flex w-full items-stretch overflow-hidden border border-b-0 bg-background",
          heightClassName
        )}
      >
        <ResizablePanelGroup className="h-full w-full" orientation="horizontal">
          <ResizablePanel defaultSize="100%" minSize="30%" panelRef={panelRef}>
            <iframe
              className="size-full bg-background"
              key={iframeKey}
              loading="lazy"
              src={`/preview/${name}`}
              title={`${name} preview`}
            />
          </ResizablePanel>
          <ResizableHandle className="hidden md:flex" withHandle />
          <ResizablePanel defaultSize="0%" minSize="0%" />
        </ResizablePanelGroup>
      </div>

      {/* Source code (passed as children) */}
      {children && (
        <div className="relative overflow-hidden rounded-b-xl border">
          <div
            className={cn(
              "overflow-hidden transition-[max-height] duration-300 ease-in-out",
              expanded ? "max-h-[3000px]" : "max-h-[140px]"
            )}
          >
            {children}
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
              <ChevronDownIcon
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
