"use client";

import { Calendar as CalendarIcon } from "lucide-react";
import {
  type InputHTMLAttributes,
  type Ref,
  type RefAttributes,
  useCallback,
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

/** Assign `value` to a ref of either shape; returns a callback ref's cleanup. */
function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") {
    return ref(value);
  }
  if (ref) {
    ref.current = value;
  }
}

export const DateInput = ({
  className,
  ref,
  ...props
}: DateInputProps & RefAttributes<HTMLInputElement>) => {
  const innerRef = useRef<HTMLInputElement | null>(null);

  // The picker button needs the input element, so the component keeps its
  // own ref and forwards to the consumer's as well. It used to *adopt* the
  // forwarded ref instead, which only works for an object ref: a callback
  // ref -- what `register()` from react-hook-form hands you -- has no
  // `.current`, so the button silently did nothing.
  const inputRef = useCallback(
    (node: HTMLInputElement | null) => {
      innerRef.current = node;
      const cleanup = assignRef(ref, node);
      return () => {
        innerRef.current = null;
        if (typeof cleanup === "function") {
          cleanup();
        } else {
          assignRef(ref, null);
        }
      };
    },
    [ref]
  );

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
          onClick={() => innerRef.current?.showPicker?.()}
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
