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

export default function PopoverDefault() {
  return (
    <Popover>
      <PopoverTrigger render={<Button variant="outline" />}>
        Open Popover
      </PopoverTrigger>
      <PopoverContent>
        <PopoverHeader>
          <PopoverTitle>Dimensions</PopoverTitle>
          <PopoverDescription>
            Set the dimensions for the layer.
          </PopoverDescription>
        </PopoverHeader>
        <div className="grid gap-2">
          <div className="grid grid-cols-3 items-center gap-4">
            <span className="text-sm">Width</span>
            <span className="col-span-2 text-muted-foreground text-sm">
              100%
            </span>
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <span className="text-sm">Height</span>
            <span className="col-span-2 text-muted-foreground text-sm">
              25px
            </span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
