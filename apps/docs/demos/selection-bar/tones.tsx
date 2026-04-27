"use client";

import {
  SelectionBar,
  SelectionBarButton,
  SelectionBarClose,
  SelectionBarGroup,
  SelectionBarLabel,
  SelectionBarSeparator,
} from "@keystoneui/react/selection-bar";
import {
  Check as CheckIcon,
  FileSpreadsheet as FileSpreadsheetIcon,
  Trash as TrashIcon,
} from "lucide-react";

export default function SelectionBarTones() {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-end gap-4 pb-4">
      <SelectionBar open position="inline">
        <SelectionBarClose />
        <SelectionBarGroup>
          <SelectionBarLabel>5 selected</SelectionBarLabel>
        </SelectionBarGroup>
        <SelectionBarButton>
          <CheckIcon />
          Approve
        </SelectionBarButton>
        <SelectionBarSeparator />
        <SelectionBarButton tone="success">
          <FileSpreadsheetIcon />
          Export
        </SelectionBarButton>
        <SelectionBarButton tone="destructive">
          <TrashIcon />
          Delete
        </SelectionBarButton>
      </SelectionBar>
    </div>
  );
}
