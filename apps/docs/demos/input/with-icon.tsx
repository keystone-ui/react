"use client";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@keystoneui/react/input-group";
import { SearchIcon } from "lucide-react";

export default function InputWithIcon() {
  return (
    <InputGroup className="max-w-sm">
      <InputGroupAddon>
        <SearchIcon className="size-4" />
      </InputGroupAddon>
      <InputGroupInput placeholder="Search..." />
    </InputGroup>
  );
}
