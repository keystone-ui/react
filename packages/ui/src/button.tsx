"use client";

import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { LoaderCircleIcon } from "lucide-react";
import * as React from "react";

import { cn } from "./utils";

// ---------------------------------------------------------------------------
// Variants
// ---------------------------------------------------------------------------

const buttonVariants = cva(
  "relative z-0 inline-flex shrink-0 cursor-pointer select-none items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-lg font-medium text-sm transition-all focus:ring-0 focus:ring-offset-0 focus-visible:outline-2 focus-visible:outline-ring/50 focus-visible:outline-offset-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:active:scale-100 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/90 disabled:bg-primary/50 disabled:text-primary-foreground/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary-hover active:bg-secondary-hover disabled:bg-secondary/50 disabled:text-secondary-foreground/50",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:outline-destructive/50 active:bg-destructive/90 disabled:bg-destructive/50 disabled:text-destructive-foreground/50",
        ghost:
          "bg-transparent hover:bg-accent active:bg-accent disabled:bg-transparent disabled:text-foreground/50",
        outline:
          "border border-input bg-background shadow-xs hover:bg-accent hover:text-foreground active:bg-accent active:text-foreground disabled:border-border/50 disabled:bg-transparent disabled:text-foreground/50 aria-expanded:bg-accent aria-expanded:text-foreground dark:border-input dark:bg-input-bg dark:active:bg-input/50 dark:hover:bg-input/50",
        link: "text-primary underline-offset-4 hover:underline active:scale-100",
      },
      size: {
        default: "h-10 px-4 py-2",
        xs: "h-6 px-2.5 py-1 text-xs",
        sm: "h-8 px-3 py-1.5",
        lg: "h-12 px-5 py-3.5 text-base",
        icon: "size-10 p-2",
        "icon-xs": "size-6 p-0.5",
        "icon-sm": "size-8 p-1.5",
        "icon-lg": "size-12 p-2.5",
      },
      fullWidth: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

type ButtonVariantsProps = VariantProps<typeof buttonVariants>;

// ---------------------------------------------------------------------------
// Button
// ---------------------------------------------------------------------------

export interface ButtonProps
  extends ButtonPrimitive.Props,
    ButtonVariantsProps {
  /** Whether the button should span the full width of its container. */
  fullWidth?: boolean;
  /** Shows a loading spinner and disables the button. */
  isLoading?: boolean;
  /**
   * The size of the button.
   * @default "default"
   */
  size?:
    | "xs"
    | "sm"
    | "default"
    | "lg"
    | "icon"
    | "icon-xs"
    | "icon-sm"
    | "icon-lg";
  /**
   * The visual style of the button.
   * @default "default"
   */
  variant?:
    | "default"
    | "secondary"
    | "destructive"
    | "ghost"
    | "outline"
    | "link";
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
        className={cn(
          buttonVariants({ variant, size }),
          isLoading && "relative",
          className
        )}
        data-loading={isLoading || undefined}
        data-slot="button"
        disabled={isDisabled}
        ref={ref}
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
            <LoaderCircleIcon
              aria-hidden="true"
              className="animate-spin"
              size={16}
            />
          </div>
        )}
      </ButtonPrimitive>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
export type { ButtonVariantsProps };
