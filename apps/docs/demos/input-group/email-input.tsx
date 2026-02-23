"use client";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@keystoneui/react/input-group";
import { MailIcon } from "lucide-react";

export default function InputGroupEmailInput() {
  return (
    <InputGroup className="max-w-sm">
      <InputGroupAddon>
        <MailIcon className="size-4" />
      </InputGroupAddon>
      <InputGroupInput placeholder="you@example.com" type="email" />
    </InputGroup>
  );
}
