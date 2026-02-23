"use client";

import { Button } from "@keystoneui/react/button";
import {
  Popover,
  PopoverArrow,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@keystoneui/react/popover";

export default function PopoverOpenOnHover() {
  return (
    <Popover>
      <PopoverTrigger
        closeDelay={0}
        delay={200}
        openOnHover
        render={<Button variant="outline">Hover Me</Button>}
      />
      <PopoverContent sideOffset={8}>
        <PopoverArrow />
        <PopoverHeader>
          <PopoverTitle>Hover Popover</PopoverTitle>
          <PopoverDescription>
            This popover opens on hover after a 200ms delay.
          </PopoverDescription>
        </PopoverHeader>
      </PopoverContent>
    </Popover>
  );
}
