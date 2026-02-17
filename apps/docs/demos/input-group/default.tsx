"use client";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "keystoneui/input-group";
import { MailIcon } from "lucide-react";

export default function InputGroupDefault() {
  return (
    <InputGroup>
      <InputGroupAddon>
        <MailIcon className="size-4" />
      </InputGroupAddon>
      <InputGroupInput placeholder="you@example.com" type="email" />
    </InputGroup>
  );
}
