"use client";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@keystoneui/react/input-group";
import { Eye as EyeIcon, EyeOff as EyeOffIcon } from "lucide-react";
import { useRef, useState } from "react";

export default function InputGroupPasswordToggle() {
  const [showPassword, setShowPassword] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <InputGroup>
      <InputGroupInput
        aria-label="Password"
        placeholder="Password"
        ref={inputRef}
        type={showPassword ? "text" : "password"}
      />
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          aria-label={showPassword ? "Hide password" : "Show password"}
          onClick={(event) => {
            setShowPassword(!showPassword);
            // A pointer press types into this field next; a key press
            // (detail 0) leaves focus on the button.
            if (event.detail > 0) {
              inputRef.current?.focus();
            }
          }}
          onMouseDown={(event) => {
            // Already typing here: keep focus, and the caret, in the field.
            if (
              event.button === 0 &&
              document.activeElement === inputRef.current
            ) {
              event.preventDefault();
            }
          }}
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
