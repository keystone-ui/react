"use client";

import { Button } from "@keystoneui/react/button";
import {
  SelectionBar,
  SelectionBarButton,
  SelectionBarClose,
  SelectionBarGroup,
  SelectionBarLabel,
  SelectionBarSeparator,
} from "@keystoneui/react/selection-bar";
import { TrashIcon } from "lucide-react";
import { useState } from "react";

export default function SelectionBarDefault() {
  const [open, setOpen] = useState(true);

  return (
    <div className="relative flex min-h-[220px] items-end justify-center pb-4">
      <Button
        className="absolute top-4 right-4"
        onClick={() => setOpen((o) => !o)}
        size="sm"
        variant="outline"
      >
        {open ? "Hide" : "Show"} selection
      </Button>

      <SelectionBar open={open} position="inline">
        <SelectionBarClose onClick={() => setOpen(false)} />
        <SelectionBarGroup>
          <SelectionBarLabel>3 items selected</SelectionBarLabel>
        </SelectionBarGroup>
        <SelectionBarButton>Move</SelectionBarButton>
        <SelectionBarButton>Tag</SelectionBarButton>
        <SelectionBarSeparator />
        <SelectionBarButton tone="destructive">
          <TrashIcon />
          Delete
        </SelectionBarButton>
      </SelectionBar>
    </div>
  );
}
