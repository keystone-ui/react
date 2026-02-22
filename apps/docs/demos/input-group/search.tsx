"use client";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@keystoneui/react/input-group";
import { SearchIcon } from "lucide-react";

export default function InputGroupSearch() {
  return (
    <InputGroup>
      <InputGroupAddon>
        <SearchIcon className="size-4" />
      </InputGroupAddon>
      <InputGroupInput placeholder="Search..." type="search" />
      <InputGroupAddon align="inline-end">
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded-sm border bg-muted px-1.5 font-medium font-mono text-[10px]">
          <span className="text-xs">⌘</span>K
        </kbd>
      </InputGroupAddon>
    </InputGroup>
  );
}
