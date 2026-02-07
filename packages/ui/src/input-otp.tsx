"use client";

import * as React from "react";
import { OTPInput, OTPInputContext, REGEXP_ONLY_DIGITS, REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
import { MinusIcon, LoaderCircleIcon } from "lucide-react";
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
  ({ className, containerClassName, isLoading = false, disabled, children, ...props }, ref) => {
    return (
      <div className="inline-flex items-center gap-2">
        <OTPInput
          ref={ref}
          data-slot="input-otp"
          disabled={disabled || isLoading}
          containerClassName={cn(
            "cn-input-otp flex items-center has-disabled:opacity-50",
            containerClassName
          )}
          spellCheck={false}
          className={cn("disabled:cursor-not-allowed", className)}
          {...props}
        >
          {children}
        </OTPInput>
        {isLoading && (
          <LoaderCircleIcon
            className="text-muted-foreground animate-spin"
            size={16}
            aria-hidden="true"
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
      ref={ref}
      data-slot="input-otp-group"
      className={cn("flex items-center", className)}
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
    const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {};

    return (
      <div
        ref={ref}
        data-slot="input-otp-slot"
        data-active={isActive}
        className={cn(
          // Base styles matching Input component
          "bg-input-bg text-sm",
          "relative flex h-10 w-10 items-center justify-center",
          "border border-input shadow-xs",
          "transition-[color,box-shadow] outline-none",
          // Negative margin to overlap borders, first slot has no negative margin
          "[&:not(:first-child)]:-ml-px",
          // First and last slot border radius
          "first:rounded-l-md last:rounded-r-md",
          // Active state - matches Input focus styles, z-10 ensures active border shows on top
          "data-[active=true]:z-10 data-[active=true]:border-ring data-[active=true]:ring-1 data-[active=true]:ring-inset data-[active=true]:ring-ring",
          // Invalid states - matches Input component
          "aria-invalid:ring-destructive dark:aria-invalid:ring-destructive aria-invalid:border-destructive",
          // Active + Invalid - ensure destructive colors override active colors
          "data-[active=true]:aria-invalid:border-destructive data-[active=true]:aria-invalid:ring-destructive",
          className
        )}
        {...props}
      >
        {char}
        {hasFakeCaret && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="animate-caret-blink bg-foreground h-4 w-px duration-1000" />
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
      ref={ref}
      data-slot="input-otp-separator"
      className={cn(
        "flex items-center [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      role="separator"
      {...props}
    >
      <MinusIcon aria-hidden="true" />
    </div>
  );
});

InputOTPSeparator.displayName = "InputOTPSeparator";

export { InputOTP, REGEXP_ONLY_DIGITS, REGEXP_ONLY_DIGITS_AND_CHARS };
