"use client";

import * as React from "react";
import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { LoaderCircleIcon } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

// ---------------------------------------------------------------------------
// Variants
// ---------------------------------------------------------------------------

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 whitespace-nowrap relative cursor-pointer z-0 rounded-lg font-medium overflow-hidden select-none transition-all active:scale-[0.98] disabled:active:scale-100 disabled:cursor-not-allowed focus:ring-0 focus:ring-offset-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/90 disabled:bg-primary/50 disabled:text-primary-foreground/50",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary-hover active:bg-secondary-hover disabled:bg-secondary/50 disabled:text-secondary-foreground/50",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive/90 disabled:bg-destructive/50 disabled:text-destructive-foreground/50 focus-visible:outline-destructive/50",
        ghost: "bg-transparent hover:bg-accent active:bg-accent disabled:bg-transparent disabled:text-foreground/50",
        outline: "border border-input bg-background shadow-xs hover:bg-accent hover:text-foreground active:bg-accent active:text-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 dark:active:bg-input/50 aria-expanded:bg-accent aria-expanded:text-foreground disabled:bg-transparent disabled:border-border/50 disabled:text-foreground/50",
        link: "text-primary underline-offset-4 hover:underline active:scale-100",
      },
      size: {
        default: "text-sm h-10 px-4 py-2",
        xs: "text-xs h-6 py-1 px-2.5",
        sm: "text-sm h-8 py-1.5 px-3",
        lg: "text-base h-12 py-3.5 px-5",
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
export type { ButtonVariantsProps };
