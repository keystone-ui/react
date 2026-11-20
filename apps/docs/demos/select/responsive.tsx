"use client";

import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@keystoneui/react/drawer";
import { useMediaQuery } from "@keystoneui/react/hooks";
import { Label } from "@keystoneui/react/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@keystoneui/react/select";
import { Check, ChevronDown } from "lucide-react";
import { useId, useRef, useState } from "react";

/*
 * A Select from 768px up, a Drawer with a list of options below it. The value
 * lives here, above both branches, so it survives the swap.
 *
 * First paint: `useMediaQuery` has no viewport on the server and reports
 * false, so the server HTML is the phone branch. A desktop visitor sees that
 * phone trigger until hydration, then the Select's. The two triggers share one
 * look (same box, border, padding, text and chevron), so the swap moves
 * nothing, and React hydrates against the server value before switching, so
 * there is no hydration warning. Before hydration the trigger does nothing.
 *
 * Crossing the breakpoint while open: each branch keeps its own `open` state,
 * so the open Drawer or Select unmounts with its branch. The value is kept,
 * nothing reopens on the other side, and the Drawer's scroll lock is released
 * as it unmounts.
 */

const timezones: Record<string, string> = {
  utc: "UTC",
  cet: "Central European Time",
  et: "Eastern Time",
  pt: "Pacific Time",
  jst: "Japan Standard Time",
};

// The Select trigger's look, for the Drawer's trigger.
const triggerClassName =
  "group flex h-(--ks-control-md,2.5rem) w-56 min-w-0 max-w-full cursor-pointer select-none items-center justify-between gap-1.5 whitespace-nowrap rounded-md border border-input bg-input-bg py-2 pr-2 pl-3 text-sm shadow-xs outline-none transition-[color] focus:border-ring focus:ring-1 focus:ring-ring focus:ring-inset data-[popup-open]:border-ring data-[popup-open]:ring-1 data-[popup-open]:ring-ring data-[popup-open]:ring-inset";

interface BranchProps {
  labelId: string;
  onValueChange: (value: string) => void;
  triggerId: string;
  value: string;
}

function DesktopSelect({
  labelId,
  triggerId,
  value,
  onValueChange,
}: BranchProps) {
  return (
    <Select
      items={timezones}
      onValueChange={(next) => next && onValueChange(next)}
      value={value}
    >
      <SelectTrigger
        aria-labelledby={labelId}
        className="w-56 cursor-pointer"
        id={triggerId}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {Object.entries(timezones).map(([key, label]) => (
            <SelectItem key={key} value={key}>
              {label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

function PhoneDrawer({
  labelId,
  triggerId,
  value,
  onValueChange,
}: BranchProps) {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const valueId = useId();
  const keys = Object.keys(timezones);
  const options = useRef<(HTMLDivElement | null)[]>([]);
  const selected = useRef<HTMLDivElement | null>(null);

  const choose = (key: string) => {
    onValueChange(key);
    // Closing returns focus to the trigger.
    setOpen(false);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const current = options.current.indexOf(
      document.activeElement as HTMLDivElement
    );
    const last = keys.length - 1;
    const targets: Record<string, number> = {
      ArrowDown: Math.min(current + 1, last),
      ArrowUp: Math.max(current - 1, 0),
      Home: 0,
      End: last,
    };
    const target = targets[event.key];
    if (target !== undefined) {
      event.preventDefault();
      options.current[target]?.focus();
    } else if ((event.key === "Enter" || event.key === " ") && current >= 0) {
      event.preventDefault();
      choose(keys[current]);
    }
  };

  return (
    <Drawer onOpenChange={setOpen} open={open}>
      <DrawerTrigger
        aria-haspopup="dialog"
        aria-labelledby={`${labelId} ${valueId}`}
        className={triggerClassName}
        id={triggerId}
      >
        <span className="block min-w-0 flex-1 truncate text-left" id={valueId}>
          {timezones[value]}
        </span>
        {/* Turns while the Drawer is open, as the Select's chevron does. */}
        <ChevronDown className="pointer-events-none size-4 shrink-0 text-muted-foreground transition-transform duration-(--duration-fast,125ms) ease-(--ease-ks-out,cubic-bezier(0.23,1,0.32,1)) group-data-[popup-open]:rotate-180" />
      </DrawerTrigger>
      {/* The chosen option takes focus when the Drawer opens. */}
      <DrawerContent initialFocus={selected}>
        <DrawerHeader>
          <DrawerTitle id={titleId}>Timezone</DrawerTitle>
        </DrawerHeader>
        <DrawerBody className="pb-4">
          <div
            aria-labelledby={titleId}
            className="grid gap-0.5"
            onKeyDown={onKeyDown}
            role="listbox"
          >
            {keys.map((key, index) => {
              const isSelected = key === value;
              return (
                // biome-ignore lint/a11y/useKeyWithClickEvents: the listbox handles Enter and Space for its options
                <div
                  aria-selected={isSelected}
                  className="flex h-11 cursor-pointer select-none items-center justify-between gap-2 rounded-md px-3 text-sm outline-none hover:bg-accent focus-visible:bg-accent focus-visible:text-accent-foreground aria-selected:font-medium"
                  key={key}
                  onClick={() => choose(key)}
                  ref={(el) => {
                    options.current[index] = el;
                    if (isSelected) {
                      selected.current = el;
                    }
                  }}
                  role="option"
                  tabIndex={isSelected ? 0 : -1}
                >
                  {timezones[key]}
                  {isSelected && <Check className="size-4 shrink-0" />}
                </div>
              );
            })}
          </div>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}

export default function SelectResponsive() {
  const [value, setValue] = useState("utc");
  const labelId = useId();
  // One id for whichever trigger is shown: only one branch is mounted at a
  // time, so it exists once in the document and the label always opens the
  // visible control.
  const triggerId = useId();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const Branch = isDesktop ? DesktopSelect : PhoneDrawer;

  return (
    <div className="grid gap-2">
      <Label htmlFor={triggerId} id={labelId}>
        Timezone
      </Label>
      <Branch
        labelId={labelId}
        onValueChange={setValue}
        triggerId={triggerId}
        value={value}
      />
    </div>
  );
}
