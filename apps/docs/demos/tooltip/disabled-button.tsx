"use client";

import { Button } from "keystoneui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "keystoneui/tooltip";

export default function TooltipDisabledButton() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
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
