"use client";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@keystoneui/react/input-group";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useState } from "react";

export default function InputGroupPasswordToggle() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <InputGroup>
      <InputGroupInput
        placeholder="Password"
        type={showPassword ? "text" : "password"}
      />
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          aria-label={showPassword ? "Hide password" : "Show password"}
          onClick={() => setShowPassword(!showPassword)}
          size="icon-xs"
        >
          {showPassword ? (
            <EyeOffIcon className="size-4" />
          ) : (
            <EyeIcon className="size-4" />
          )}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
}
