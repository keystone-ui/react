"use client";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@keystoneui/react/input-group";
import { Euro as EuroIcon } from "lucide-react";

export default function InputGroupStakeButtons() {
  return (
    <InputGroup className="max-w-sm">
      <InputGroupAddon>
        <EuroIcon />
      </InputGroupAddon>
      <InputGroupInput placeholder="0.00" type="number" />
      <InputGroupAddon align="inline-end">
        <InputGroupButton variant="secondary">½</InputGroupButton>
        <InputGroupButton variant="secondary">2×</InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
}
