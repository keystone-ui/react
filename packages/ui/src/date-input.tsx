"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupButton,
} from "./input-group";
import { cn } from "./utils";

export interface DateInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {}

export const DateInput = React.forwardRef<HTMLInputElement, DateInputProps>(
  ({ className, ...props }, ref) => {
    const innerRef = React.useRef<HTMLInputElement>(null);
    const inputRef = (ref as React.RefObject<HTMLInputElement>) || innerRef;

    return (
      <InputGroup>
        <InputGroupInput
          ref={inputRef}
          type="date"
          className={cn(
            "[&::-webkit-calendar-picker-indicator]:hidden",
            className
          )}
          {...props}
        />
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            type="button"
            aria-label="Open date picker"
            onClick={() => inputRef.current?.showPicker()}
          >
            <CalendarIcon className="size-4" />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    );
  }
);

DateInput.displayName = "DateInput";
