"use client";

import { Button } from "@keystoneui/react/button";
import { ToggleGroup, ToggleGroupItem } from "@keystoneui/react/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@keystoneui/react/tooltip";
import { Download as DownloadIcon, Info as InfoIcon } from "lucide-react";
import { useId, useState } from "react";

import { RANGES, type Range } from "./mock-analytics";

/**
 * The accessible info-tip pattern: Base UI's tooltip wires no
 * `aria-describedby` and is mouse-only, so the text lives in an always-present
 * `sr-only` span, the popup is `aria-hidden` to avoid being read twice, and a
 * controlled click toggle (with `closeOnClick={false}`) makes it work on touch.
 */
function InfoTip({ content, label }: { content: string; label: string }) {
  const descriptionId = useId();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Tooltip onOpenChange={setOpen} open={open}>
        <TooltipTrigger
          closeOnClick={false}
          render={
            <button
              aria-describedby={descriptionId}
              aria-label={`${label} definition`}
              className="inline-flex cursor-help items-center rounded-sm text-muted-foreground focus-visible:outline-2 focus-visible:outline-ring/50 focus-visible:outline-offset-2 [&_svg:not([class*='size-'])]:size-3.5 [&_svg]:pointer-events-none [&_svg]:shrink-0"
              onClick={() => setOpen((previous) => !previous)}
              type="button"
            />
          }
        >
          <InfoIcon aria-hidden="true" />
        </TooltipTrigger>
        <TooltipContent aria-hidden="true" className="max-w-64">
          {content}
        </TooltipContent>
      </Tooltip>
      <span className="sr-only" id={descriptionId}>
        {content}
      </span>
    </>
  );
}

interface DashboardToolbarProps {
  onRangeChange: (range: Range) => void;
  range: Range;
}

export function DashboardToolbar({
  onRangeChange,
  range,
}: DashboardToolbarProps) {
  return (
    // min-w-0 flex-1 on the text column so a long title truncates instead of
    // pushing the actions off-screen; shrink-0 flex-wrap so the actions never
    // squash; items-end so they align to the bottom of the description.
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0 flex-1">
        <h1 className="font-semibold text-2xl tracking-tight">Analytics</h1>
        <p className="mt-1 inline-flex items-center gap-1.5 text-muted-foreground text-sm">
          Weekly performance across acquisition channels
          <InfoTip
            content="Revenue is attributed on a last-touch basis and excludes refunds. Sessions are de-duplicated per visitor per day."
            label="Attribution"
          />
        </p>
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        {/* size="lg" is 40px, which is what matches a default Button. The two
            scales do not line up at their defaults -- Button default is 40 and
            Toggle default is 36 -- so a toolbar mixing them has to pick a tier
            deliberately. */}
        <ToggleGroup
          aria-label="Reporting range"
          size="lg"
          onValueChange={(next) => {
            // The group is array-valued; take the last pressed item and keep
            // the control single-select.
            const last = next.at(-1);
            if (last && (RANGES as readonly string[]).includes(last)) {
              onRangeChange(last as Range);
            }
          }}
          value={[range]}
          variant="outline"
        >
          {RANGES.map((option) => (
            <ToggleGroupItem key={option} value={option}>
              {option}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <Button variant="outline">
          <DownloadIcon data-icon="inline-start" />
          Export
        </Button>
      </div>
    </header>
  );
}
