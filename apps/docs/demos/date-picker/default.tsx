"use client";

import { Button } from "@keystoneui/react/button";
import { Calendar } from "@keystoneui/react/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@keystoneui/react/popover";
import { format } from "date-fns";
import { ChevronDown as ChevronDownIcon } from "lucide-react";
import { useState } from "react";

export default function DatePickerDefault() {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger
        render={
          <Button
            className="w-56 justify-between font-normal data-[empty=true]:text-muted-foreground"
            data-empty={!date}
            variant="outline"
          >
            {date ? format(date, "PPP") : "Pick a date"}
            <ChevronDownIcon className="text-muted-foreground" />
          </Button>
        }
      />
      <PopoverContent
        align="start"
        aria-label="Choose a date"
        className="w-auto overflow-hidden p-0"
      >
        <Calendar
          defaultMonth={date}
          mode="single"
          onSelect={(d) => {
            setDate(d);
            setOpen(false);
          }}
          selected={date}
        />
      </PopoverContent>
    </Popover>
  );
}
