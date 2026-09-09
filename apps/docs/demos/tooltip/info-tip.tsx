"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@keystoneui/react/tooltip";
import { Info as InfoIcon } from "lucide-react";
import { useId, useState } from "react";

/**
 * An explanatory ⓘ affordance, and the pattern to copy whenever a Tooltip is
 * the only place some text appears.
 *
 * Base UI's tooltip is a visual enhancement and nothing more: it wires no
 * `aria-describedby` and no `role`, and its trigger is `mouseOnly`. So a
 * tooltip on its own reaches neither a screen reader nor a touch device. Three
 * things fix that, and all three matter:
 *
 *  1. The text is rendered in an always-present `sr-only` span and associated
 *     with the trigger via `aria-describedby`. That span -- not the popup --
 *     is what assistive tech reads, on every device, whether or not the
 *     tooltip is open. Pointing `aria-describedby` at the popup would not
 *     work: it is unmounted while closed, so the reference dangles.
 *  2. The popup is `aria-hidden`, because the same string would otherwise sit
 *     in the accessibility tree twice while open and be read twice.
 *  3. Controlled `open` plus an `onClick` toggle makes it work on touch, and
 *     `closeOnClick={false}` stops Base UI's own click-to-close from fighting
 *     the toggle.
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
              className="inline-flex cursor-help items-center rounded-sm text-muted-foreground focus-visible:outline-2 focus-visible:outline-ring/50 focus-visible:outline-offset-2 [&_svg:not([class*='size-'])]:size-3 [&_svg]:pointer-events-none [&_svg]:shrink-0"
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

export default function TooltipInfoTip() {
  return (
    <dl className="flex w-full max-w-sm flex-col gap-3">
      <div className="flex items-baseline justify-between gap-2">
        <dt className="inline-flex items-center gap-1 text-muted-foreground text-sm">
          Pickup p50
          <InfoTip
            content="Ready-and-requested until someone other than the author reviews. The most common place teams lose days."
            label="Pickup p50"
          />
        </dt>
        <dd className="font-medium text-sm tabular-nums">3h 12m</dd>
      </div>
      <div className="flex items-baseline justify-between gap-2">
        <dt className="inline-flex items-center gap-1 text-muted-foreground text-sm">
          Coding p50
          <InfoTip
            content="First commit until the PR is ready and a review has been requested. Includes draft time — the author was still working."
            label="Coding p50"
          />
        </dt>
        <dd className="font-medium text-sm tabular-nums">1d 4h</dd>
      </div>
    </dl>
  );
}
