"use client";

import { Button } from "@keystoneui/react/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@keystoneui/react/tooltip";

export default function TooltipDisabledButton() {
  return (
    <TooltipProvider>
      <Tooltip>
        {/*
          TooltipTrigger renders as a <span> so the disabled <button> nested
          inside isn't wrapped in another <button>. The span also still
          receives pointer events while the inner button is disabled, so the
          tooltip can open.
        */}
        <TooltipTrigger render={<span />}>
          <Button disabled variant="outline">
            Disabled Button
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>You don&apos;t have permission to perform this action.</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
