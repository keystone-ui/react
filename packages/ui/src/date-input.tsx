"use client";

import { CalendarIcon } from "lucide-react";
import * as React from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
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
          className={cn(
            "[&::-webkit-calendar-picker-indicator]:hidden",
            className
          )}
          ref={inputRef}
          type="date"
          {...props}
        />
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            aria-label="Open date picker"
            onClick={() => inputRef.current?.showPicker()}
            size="icon-xs"
            type="button"
          >
            <CalendarIcon className="size-4" />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    );
  }
);

DateInput.displayName = "DateInput";
