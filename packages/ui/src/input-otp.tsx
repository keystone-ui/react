"use client";

import { OTPFieldPreview as OTPField } from "@base-ui/react/otp-field";
import {
  LoaderCircle as LoaderCircleIcon,
  Minus as MinusIcon,
} from "lucide-react";
import type * as React from "react";
import { cn } from "./utils";

export type InputOTPProps = Omit<OTPField.Root.Props, "render"> & {
  /**
   * Whether the input is in a loading state
   */
  isLoading?: boolean;
};

const InputOTP = ({
  className,
  isLoading = false,
  disabled,
  children,
  ...props
}: InputOTPProps) => (
  <div className="inline-flex items-center gap-2">
    <OTPField.Root
      className={cn(
        "cn-input-otp flex items-center has-disabled:opacity-50",
        className
      )}
      data-slot="input-otp"
      disabled={disabled || isLoading}
      {...props}
    >
      {children}
    </OTPField.Root>
    {isLoading && (
      <LoaderCircleIcon
        aria-hidden="true"
        className="animate-spin text-muted-foreground"
        size={16}
      />
    )}
  </div>
);

InputOTP.displayName = "InputOTP";

export interface InputOTPGroupProps extends React.ComponentProps<"div"> {}

export const InputOTPGroup = ({
  className,
  ref,
  ...props
}: InputOTPGroupProps & React.RefAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex items-center", className)}
    data-slot="input-otp-group"
    ref={ref}
    {...props}
  />
);

InputOTPGroup.displayName = "InputOTPGroup";

export type InputOTPSlotProps = OTPField.Input.Props;

export const InputOTPSlot = ({ className, ...props }: InputOTPSlotProps) => (
  <OTPField.Input
    className={cn(
      // 16px on mobile to prevent iOS zoom when the slot input takes focus
      "bg-input-bg text-center text-base tabular-nums md:text-sm",
      "relative h-10 w-10 outline-none transition-[color,box-shadow]",
      "border border-input shadow-xs",
      // Negative margin to overlap borders with the previous slot
      "[&:not(:first-child)]:-ml-px",
      // Round the corners of the first and last slot
      "first:rounded-l-md last:rounded-r-md",
      // Focus ring matching the Input component (z-10 keeps it above neighbors)
      "focus:z-10 focus:border-ring focus:ring-1 focus:ring-ring focus:ring-inset",
      // Invalid states — `aria-invalid` for keystone Field, `data-[invalid]` from Base UI Field.Root
      "aria-invalid:border-destructive aria-invalid:ring-destructive",
      "data-[invalid]:border-destructive data-[invalid]:ring-destructive",
      // Disabled
      "disabled:cursor-not-allowed",
      className
    )}
    data-slot="input-otp-slot"
    {...props}
  />
);

InputOTPSlot.displayName = "InputOTPSlot";

export type InputOTPSeparatorProps = OTPField.Separator.Props;

export const InputOTPSeparator = ({
  className,
  children,
  ...props
}: InputOTPSeparatorProps) => (
  <OTPField.Separator
    className={cn(
      "flex items-center [&_svg:not([class*='size-'])]:size-4",
      className
    )}
    data-slot="input-otp-separator"
    {...props}
  >
    {children ?? <MinusIcon aria-hidden="true" />}
  </OTPField.Separator>
);

InputOTPSeparator.displayName = "InputOTPSeparator";

export { InputOTP };
