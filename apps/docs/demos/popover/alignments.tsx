"use client";

import { Button } from "keystoneui/button";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "keystoneui/popover";

const ALIGNMENTS = ["start", "center", "end"] as const;

export default function PopoverAlignments() {
  return (
    <div className="flex flex-wrap gap-2">
      {ALIGNMENTS.map((align) => (
        <Popover key={align}>
          <PopoverTrigger render={<Button variant="outline" />}>
            Align: {align}
          </PopoverTrigger>
          <PopoverContent align={align}>
            <PopoverHeader>
              <PopoverTitle>Alignment: {align}</PopoverTitle>
              <PopoverDescription>
                This popover is aligned to the {align} of the trigger.
              </PopoverDescription>
            </PopoverHeader>
          </PopoverContent>
        </Popover>
      ))}
    </div>
  );
}
