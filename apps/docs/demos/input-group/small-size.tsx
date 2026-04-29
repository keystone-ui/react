"use client";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@keystoneui/react/input-group";
import { Copy as CopyIcon, Search as SearchIcon } from "lucide-react";

export default function InputGroupSmallSize() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <InputGroup size="sm">
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
        <InputGroupInput placeholder="Search..." />
      </InputGroup>
      <InputGroup size="sm">
        <InputGroupInput placeholder="Enter code" />
        <InputGroupAddon align="inline-end">
          <InputGroupButton>
            <CopyIcon />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}
