"use client";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@keystoneui/react/input-group";
import { PhoneIcon } from "lucide-react";

export default function InputGroupPhoneInput() {
  return (
    <InputGroup className="max-w-sm">
      <InputGroupAddon>
        <PhoneIcon className="size-4" />
      </InputGroupAddon>
      <InputGroupAddon>
        <InputGroupText>+1</InputGroupText>
      </InputGroupAddon>
      <InputGroupInput placeholder="(555) 123-4567" type="tel" />
    </InputGroup>
  );
}
