"use client";

import * as React from "react";
import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { LoaderCircleIcon } from "lucide-react";
import { cn } from "@acme/ui";
import { buttonVariants, type ButtonVariantsProps } from "./button-variants";

export interface ButtonProps
  extends ButtonPrimitive.Props,
    ButtonVariantsProps {
  /** If true the button will display a spinner */
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = isLoading || disabled;

    return (
      <ButtonPrimitive
        ref={ref}
        data-slot="button"
        data-loading={isLoading || undefined}
        disabled={isDisabled}
        className={cn(
          buttonVariants({ variant, size }),
          isLoading && "relative",
          className
        )}
        {...props}
      >
        <span
          className={cn(
            "inline-flex items-center justify-center gap-2",
            isLoading ? "invisible" : "visible"
          )}
        >
          {children}
        </span>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <LoaderCircleIcon className="animate-spin" size={16} aria-hidden="true" />
          </div>
        )}
      </ButtonPrimitive>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
