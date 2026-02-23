"use client";

import { Button } from "@keystoneui/react/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@keystoneui/react/command";
import {
  CalculatorIcon,
  CalendarIcon,
  SettingsIcon,
  SmileIcon,
} from "lucide-react";
import { useState } from "react";

export default function CommandDisabledItems() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <Button className="w-fit" onClick={() => setOpen(true)} variant="outline">
        Open Menu
      </Button>
      <CommandDialog onOpenChange={setOpen} open={open}>
        <Command>
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Actions">
              <CommandItem>
                <CalendarIcon />
                <span>Calendar</span>
              </CommandItem>
              <CommandItem disabled>
                <SmileIcon />
                <span>Search Emoji (Coming Soon)</span>
              </CommandItem>
              <CommandItem>
                <CalculatorIcon />
                <span>Calculator</span>
              </CommandItem>
              <CommandItem disabled>
                <SettingsIcon />
                <span>Advanced Settings (Locked)</span>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </div>
  );
}
