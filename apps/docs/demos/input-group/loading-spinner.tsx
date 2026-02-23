"use client";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@keystoneui/react/input-group";
import { LoaderIcon } from "lucide-react";

export default function InputGroupLoadingSpinner() {
  return (
    <InputGroup className="max-w-sm">
      <InputGroupInput placeholder="Searching..." />
      <InputGroupAddon align="inline-end">
        <LoaderIcon className="size-4 animate-spin" />
      </InputGroupAddon>
    </InputGroup>
  );
}
