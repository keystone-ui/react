"use client";

import { Button } from "@keystoneui/react/button";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
} from "@keystoneui/react/combobox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@keystoneui/react/popover";
import {
  ChevronDown as ChevronDownIcon,
  CircleX as CircleXIcon,
} from "lucide-react";
import { useState } from "react";

const labels = ["Bug", "Feature", "Docs", "Design", "Performance"] as const;
type Label = (typeof labels)[number];

export default function ComboboxMultipleInPopover() {
  const [value, setValue] = useState<Label[]>(["Bug"]);

  return (
    <Popover>
      <PopoverTrigger render={<Button size="sm" variant="outline" />}>
        <span className="font-normal text-muted-foreground">Labels:</span>
        {value.length === 0
          ? "All"
          : `${value[0]}${value.length > 1 ? `, +${value.length - 1}` : ""}`}
        <ChevronDownIcon className="text-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-1">
        {/* `inline` renders the list in place rather than in a popup of its
            own: the popover is already the popup. Picked items stay in the
            list with a check, so nothing moves under the pointer. */}
        <Combobox
          autoHighlight
          inline
          items={labels}
          multiple
          onValueChange={(next: Label[]) => setValue(next)}
          open
          value={value}
        >
          <div className="px-1 py-1">
            <ComboboxChips className="min-h-8 py-0.5 pe-1">
              <ComboboxValue>
                {(values: Label[]) => (
                  <>
                    {values.map((item) => (
                      <ComboboxChip key={item}>{item}</ComboboxChip>
                    ))}
                    <ComboboxChipsInput
                      aria-label="Search labels"
                      placeholder={values.length > 0 ? "" : "Search…"}
                    />
                  </>
                )}
              </ComboboxValue>
              {value.length > 0 && (
                <Button
                  aria-label="Clear labels"
                  className="ms-auto shrink-0 rounded-full text-muted-foreground"
                  onClick={() => setValue([])}
                  size="icon-xs"
                  variant="ghost"
                >
                  <CircleXIcon />
                </Button>
              )}
            </ComboboxChips>
          </div>
          <ComboboxEmpty className="px-2 py-1.5 text-muted-foreground text-sm">
            No match
          </ComboboxEmpty>
          <ComboboxList className="max-h-none p-0" data-size="compact">
            {(item: Label) => (
              <ComboboxItem key={item} value={item}>
                {item}
              </ComboboxItem>
            )}
          </ComboboxList>
        </Combobox>
      </PopoverContent>
    </Popover>
  );
}
