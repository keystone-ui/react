"use client";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@keystoneui/react/input-group";

export default function InputGroupTextSuffix() {
  return (
    <InputGroup className="max-w-sm">
      <InputGroupInput placeholder="username" />
      <InputGroupAddon align="inline-end">
        <InputGroupText>@gmail.com</InputGroupText>
      </InputGroupAddon>
    </InputGroup>
  );
}
