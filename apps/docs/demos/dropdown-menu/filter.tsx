"use client";

import { Button } from "@keystoneui/react/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@keystoneui/react/dropdown-menu";
import { ChevronDown as ChevronDownIcon } from "lucide-react";
import { useState } from "react";

const statuses = [
  { label: "All", value: "all" },
  { label: "Completed", value: "completed" },
  { label: "In progress", value: "in-progress" },
  { label: "Failed", value: "failed" },
];

export default function DropdownMenuFilter() {
  const [status, setStatus] = useState("all");
  const current = statuses.find((option) => option.value === status);

  return (
    <DropdownMenu>
      {/* The trigger names the dimension, muted, then the value — "Status:
          Failed", never a bare "Failed" beside another bare value. Unset, the
          value is muted too, so a filter doing something stands out. */}
      <DropdownMenuTrigger render={<Button size="sm" variant="outline" />}>
        <span className="font-normal text-muted-foreground">Status:</span>
        <span
          className={
            status === "all" ? "font-normal text-muted-foreground" : undefined
          }
        >
          {current?.label}
        </span>
        <ChevronDownIcon className="text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-44">
        <DropdownMenuGroup>
          {/* Radio items close the menu on pick: a filter is single-select. */}
          <DropdownMenuRadioGroup onValueChange={setStatus} value={status}>
            {statuses.map((option) => (
              <DropdownMenuRadioItem key={option.value} value={option.value}>
                {option.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
