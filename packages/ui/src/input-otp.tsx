"use client";

import {
  OTPInput,
  OTPInputContext,
  REGEXP_ONLY_DIGITS,
  REGEXP_ONLY_DIGITS_AND_CHARS,
} from "input-otp";
import { LoaderCircleIcon, MinusIcon } from "lucide-react";
import * as React from "react";
import { cn } from "./utils";

type OTPInputElement = React.ComponentRef<typeof OTPInput>;

export type InputOTPProps = Omit<
  React.ComponentPropsWithoutRef<typeof OTPInput>,
  "render"
> & {
  /**
   * Whether the input is in a loading state
   */
  isLoading?: boolean;
};

const InputOTP = React.forwardRef<OTPInputElement, InputOTPProps>(
  (
    {
      className,
      containerClassName,
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div className="inline-flex items-center gap-2">
        <OTPInput
          className={cn("disabled:cursor-not-allowed", className)}
          containerClassName={cn(
            "cn-input-otp flex items-center has-disabled:opacity-50",
            containerClassName
          )}
          data-slot="input-otp"
          disabled={disabled || isLoading}
          ref={ref}
          spellCheck={false}
          {...props}
        >
          {children}
        </OTPInput>
        {isLoading && (
          <LoaderCircleIcon
            aria-hidden="true"
            className="animate-spin text-muted-foreground"
            size={16}
          />
        )}
      </div>
    );
  }
);

InputOTP.displayName = "InputOTP";

export interface InputOTPGroupProps extends React.ComponentProps<"div"> {}

export const InputOTPGroup = React.forwardRef<
  HTMLDivElement,
  InputOTPGroupProps
>(({ className, ...props }, ref) => {
  return (
    <div
      className={cn("flex items-center", className)}
      data-slot="input-otp-group"
      ref={ref}
      {...props}
    />
  );
});

InputOTPGroup.displayName = "InputOTPGroup";

export interface InputOTPSlotProps extends React.ComponentProps<"div"> {
  /**
   * The index of this slot in the OTP input
   */
  index: number;
}

export const InputOTPSlot = React.forwardRef<HTMLDivElement, InputOTPSlotProps>(
  ({ index, className, ...props }, ref) => {
    const inputOTPContext = React.useContext(OTPInputContext);
    const { char, hasFakeCaret, isActive } =
      inputOTPContext?.slots[index] ?? {};

    return (
      <div
        className={cn(
          // Base styles matching Input component
          "bg-input-bg text-sm",
          "relative flex h-10 w-10 items-center justify-center",
          "border border-input shadow-xs",
          "outline-none transition-[color,box-shadow]",
          // Negative margin to overlap borders, first slot has no negative margin
          "[&:not(:first-child)]:-ml-px",
          // First and last slot border radius
          "first:rounded-l-md last:rounded-r-md",
          // Active state - matches Input focus styles, z-10 ensures active border shows on top
          "data-[active=true]:z-10 data-[active=true]:border-ring data-[active=true]:ring-1 data-[active=true]:ring-ring data-[active=true]:ring-inset",
          // Invalid states - matches Input component
          "aria-invalid:border-destructive aria-invalid:ring-destructive dark:aria-invalid:ring-destructive",
          // Active + Invalid - ensure destructive colors override active colors
          "data-[active=true]:aria-invalid:border-destructive data-[active=true]:aria-invalid:ring-destructive",
          className
        )}
        data-active={isActive}
        data-slot="input-otp-slot"
        ref={ref}
        {...props}
      >
        {char}
        {hasFakeCaret && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-4 w-px animate-caret-blink bg-foreground duration-1000" />
          </div>
        )}
      </div>
    );
  }
);

InputOTPSlot.displayName = "InputOTPSlot";

export interface InputOTPSeparatorProps extends React.ComponentProps<"div"> {}

export const InputOTPSeparator = React.forwardRef<
  HTMLDivElement,
  InputOTPSeparatorProps
>(({ className, ...props }, ref) => {
  return (
    <div
      className={cn(
        "flex items-center [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      data-slot="input-otp-separator"
      ref={ref}
      role="separator"
      {...props}
    >
      <MinusIcon aria-hidden="true" />
    </div>
  );
});

InputOTPSeparator.displayName = "InputOTPSeparator";

export { InputOTP, REGEXP_ONLY_DIGITS, REGEXP_ONLY_DIGITS_AND_CHARS };
