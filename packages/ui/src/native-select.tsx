"use client";

import * as React from "react";
import { ChevronDownIcon } from "lucide-react";
import { cn } from "./utils";

// =============================================================================
// NativeSelect
// =============================================================================
export type NativeSelectProps = Omit<
  React.ComponentProps<"select">,
  "size"
> & {
  /**
   * Size variant of the native select.
   * Controls the visual height (`"default"` = 40px, `"sm"` = 32px).
   * @default "default"
   */
  size?: "sm" | "default";
  /**
   * Maps to the native HTML `size` attribute on `<select>`.
   * Controls how many options are visible at once.
   */
  htmlSize?: number;
};

function NativeSelect({
  className,
  size = "default",
  htmlSize,
  ...props
}: NativeSelectProps) {
  return (
    <div
      className={cn(
        "group/native-select relative w-fit has-[select:disabled]:opacity-50",
        className
      )}
      data-slot="native-select-wrapper"
      data-size={size}
    >
      <select
        data-slot="native-select"
        data-size={size}
        size={htmlSize}
        className="border-input bg-input-bg placeholder:text-muted-foreground/70 h-10 w-full min-w-0 appearance-none rounded-md border py-1 pr-8 pl-2.5 text-sm shadow-xs transition-[color,box-shadow] outline-none select-none focus:ring-1 focus:ring-inset focus:ring-ring focus:border-ring disabled:pointer-events-none disabled:cursor-not-allowed aria-invalid:ring-destructive dark:aria-invalid:ring-destructive aria-invalid:border-destructive data-[size=sm]:h-8 data-[size=sm]:rounded-md data-[size=sm]:py-0.5"
        {...props}
      />
      <ChevronDownIcon
        className="text-muted-foreground pointer-events-none absolute top-1/2 right-2.5 shrink-0 size-4 -translate-y-1/2 select-none"
        aria-hidden="true"
        data-slot="native-select-icon"
      />
    </div>
  );
}

// =============================================================================
// NativeSelectOption
// =============================================================================
function NativeSelectOption({ ...props }: React.ComponentProps<"option">) {
  return <option data-slot="native-select-option" {...props} />;
}

// =============================================================================
// NativeSelectOptGroup
// =============================================================================
function NativeSelectOptGroup({
  className,
  ...props
}: React.ComponentProps<"optgroup">) {
  return (
    <optgroup
      data-slot="native-select-optgroup"
      className={cn(className)}
      {...props}
    />
  );
}

export { NativeSelect, NativeSelectOptGroup, NativeSelectOption };
