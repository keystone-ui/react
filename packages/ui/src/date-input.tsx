"use client";

import { Calendar as CalendarIcon } from "lucide-react";
import {
  type InputHTMLAttributes,
  type RefAttributes,
  type RefObject,
  useRef,
} from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "./input-group";
import { cn } from "./utils";

export interface DateInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {}

export const DateInput = ({
  className,
  ref,
  ...props
}: DateInputProps & RefAttributes<HTMLInputElement>) => {
  const innerRef = useRef<HTMLInputElement>(null);
  const inputRef = (ref as RefObject<HTMLInputElement>) || innerRef;

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
};

DateInput.displayName = "DateInput";
