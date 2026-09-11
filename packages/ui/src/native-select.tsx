"use client";

import { ChevronDown as ChevronDownIcon } from "lucide-react";
import type * as React from "react";
import { cn } from "./utils";

// =============================================================================
// NativeSelect
// =============================================================================
export type NativeSelectProps = Omit<React.ComponentProps<"select">, "size"> & {
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
      data-size={size}
      data-slot="native-select-wrapper"
    >
      <select
        className={cn(
          "h-10 w-full min-w-0 select-none appearance-none rounded-md border border-input bg-input-bg py-1 pr-8 pl-2.5 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground/70 focus:border-ring focus:ring-1 focus:ring-ring focus:ring-inset disabled:pointer-events-none disabled:cursor-not-allowed aria-invalid:border-destructive aria-invalid:ring-destructive data-[size=sm]:h-8 data-[size=sm]:rounded-md data-[size=sm]:py-0.5 dark:aria-invalid:ring-destructive",
          // The popup is painted by the browser, and Chromium derives its
          // background from the control's own. `--input-bg` is transparent in
          // light and a 5% white wash in dark, so with nothing opaque to paint
          // the list against Chromium falls back to its default white — giving
          // a white popup holding near-white text in dark mode. Naming the
          // popover tokens on the options fixes the list without touching the
          // closed control, which already matches `Input` exactly. Platforms
          // that draw the popup natively (macOS, iOS, Android) ignore these and
          // follow `color-scheme`, which is already correct there.
          "[&_option]:bg-popover [&_option]:text-popover-foreground",
          "[&_optgroup]:bg-popover [&_optgroup]:text-popover-foreground"
        )}
        data-size={size}
        data-slot="native-select"
        size={htmlSize}
        {...props}
      />
      <ChevronDownIcon
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-2.5 size-4 shrink-0 -translate-y-1/2 select-none text-muted-foreground"
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
      className={cn(className)}
      data-slot="native-select-optgroup"
      {...props}
    />
  );
}

export { NativeSelect, NativeSelectOptGroup, NativeSelectOption };
