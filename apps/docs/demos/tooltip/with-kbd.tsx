"use client";

import { Button } from "@keystoneui/react/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@keystoneui/react/tooltip";
import { Bold as BoldIcon } from "lucide-react";

export default function TooltipWithKbd() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger render={<Button size="icon" variant="outline" />}>
          <BoldIcon />
        </TooltipTrigger>
        <TooltipContent>
          <p className="flex items-center gap-1.5">
            Bold
            <kbd className="rounded bg-background/20 px-1.5 py-0.5 font-mono text-[10px]">
              ⌘B
            </kbd>
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
