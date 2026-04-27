"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@keystoneui/react/dropdown-menu";
import {
  SelectionBar,
  SelectionBarBullet,
  SelectionBarButton,
  SelectionBarClose,
  SelectionBarGroup,
  SelectionBarLabel,
  SelectionBarLink,
  SelectionBarSeparator,
} from "@keystoneui/react/selection-bar";
import {
  FileSpreadsheet as FileSpreadsheetIcon,
  Trash as TrashIcon,
} from "lucide-react";
import { useState } from "react";

const TOTAL_ROWS = 20;

export default function SelectionBarWithBulkActions() {
  const [count, setCount] = useState(1);
  const open = count > 0;

  return (
    <div className="relative flex min-h-[260px] flex-col items-center justify-end gap-4 pb-4">
      <div className="flex flex-wrap items-center justify-center gap-2 rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm">
        <span className="text-muted-foreground">Selected:</span>
        <span className="font-medium tabular-nums">{count}</span>
        <button
          className="cursor-pointer rounded-md border border-border bg-background px-2 py-1 text-xs hover:bg-accent"
          onClick={() => setCount(0)}
          type="button"
        >
          Clear
        </button>
        <button
          className="cursor-pointer rounded-md border border-border bg-background px-2 py-1 text-xs hover:bg-accent"
          onClick={() => setCount(1)}
          type="button"
        >
          Select 1
        </button>
        <button
          className="cursor-pointer rounded-md border border-border bg-background px-2 py-1 text-xs hover:bg-accent"
          onClick={() => setCount(TOTAL_ROWS)}
          type="button"
        >
          Select all
        </button>
      </div>

      <SelectionBar open={open} position="inline">
        <SelectionBarClose onClick={() => setCount(0)} />
        <SelectionBarGroup>
          <SelectionBarLabel>
            {count} {count === 1 ? "ticket" : "tickets"} selected
          </SelectionBarLabel>
          {count > 0 && count < TOTAL_ROWS ? (
            <>
              <SelectionBarBullet />
              <SelectionBarLink onClick={() => setCount(TOTAL_ROWS)}>
                Select all {TOTAL_ROWS}
              </SelectionBarLink>
            </>
          ) : null}
        </SelectionBarGroup>

        <DropdownMenu>
          <DropdownMenuTrigger render={<SelectionBarButton />}>
            Change status
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top">
            <DropdownMenuGroup>
              <DropdownMenuItem>Open</DropdownMenuItem>
              <DropdownMenuItem>Pending</DropdownMenuItem>
              <DropdownMenuItem>Resolved</DropdownMenuItem>
              <DropdownMenuItem>Closed</DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <SelectionBarButton>Assign</SelectionBarButton>
        <SelectionBarButton>Priority</SelectionBarButton>

        <SelectionBarSeparator />

        <SelectionBarButton tone="success">
          <FileSpreadsheetIcon />
          Export CSV
        </SelectionBarButton>
        <SelectionBarButton tone="destructive">
          <TrashIcon />
          Delete
        </SelectionBarButton>
      </SelectionBar>
    </div>
  );
}
