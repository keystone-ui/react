"use client";

import { Button } from "keystoneui/button";
import {
  Popover,
  PopoverArrow,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "keystoneui/popover";

export default function PopoverWithArrow() {
  return (
    <Popover>
      <PopoverTrigger render={<Button variant="outline" />}>
        With Arrow
      </PopoverTrigger>
      <PopoverContent>
        <PopoverArrow />
        <PopoverHeader>
          <PopoverTitle>Popover with Arrow</PopoverTitle>
          <PopoverDescription>
            This popover includes an arrow pointer that connects to the trigger
            element.
          </PopoverDescription>
        </PopoverHeader>
      </PopoverContent>
    </Popover>
  );
}
