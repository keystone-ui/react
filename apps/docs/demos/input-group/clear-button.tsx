"use client";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@keystoneui/react/input-group";
import { XIcon } from "lucide-react";
import { useState } from "react";

export default function InputGroupClearButton() {
  const [value, setValue] = useState("Click to clear");

  return (
    <InputGroup className="max-w-sm">
      <InputGroupInput
        onChange={(e) => setValue(e.target.value)}
        placeholder="Type something..."
        value={value}
      />
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          aria-label="Clear input"
          disabled={!value}
          onClick={() => setValue("")}
          size="icon-xs"
        >
          <XIcon className="size-4" />
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
}
