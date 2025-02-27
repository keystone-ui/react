import React from "react";
import { cn } from "../utils";
import { 
  buttonVariants, 
  type ButtonVariantsProps,
  type ButtonSizesProps,
  type ButtonVariantProps
} from "./button-variants";
// TODO: Fix Loader import when Loader component is added

// Common props shared by button and anchor
type CommonButtonProps = {
  /** If true the button will display a spinner */
  isLoading?: boolean;
  /** Button will extend full width of the container */
  fullWidth?: boolean;
  /** If button is disabled or not */
  disabled?: boolean;
  /** Custom styles applied through className */
  className?: string;
  /** The size of the button */
  size?: ButtonSizesProps;
  /** The variant of the button */
  variant?: ButtonVariantProps;
};

// Type for when Button is rendered as an anchor
type AnchorButtonProps = CommonButtonProps & 
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'color'> & 
  Omit<ButtonVariantsProps, 'variant' | 'size' | 'fullWidth'> & {
    href: string;
  };

// Type for when Button is rendered as a button
type ButtonElementProps = CommonButtonProps & 
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'color'> & 
  Omit<ButtonVariantsProps, 'variant' | 'size' | 'fullWidth'> & {
    href?: never;
  };

// Combined type for the Button component
export type ButtonProps = AnchorButtonProps | ButtonElementProps;

export const Button = React.forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ButtonProps
>(
  (
    {
      className,
      variant = "default",
      size = "default",
      fullWidth = false,
      isLoading = false,
      disabled = false,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = isLoading || disabled;

    const buttonStyles = cn(
      buttonVariants({
        variant: variant as ButtonVariantProps,
        size: size as ButtonSizesProps,
        fullWidth: fullWidth
      }),
      className
    );

    const content = (
      <>
        {isLoading && (
          <span
            className={cn([
              "flex items-center justify-center",
              isLoading && "min-w-20",
              children && "mr-1",
            ])}
          >
            {/* Loader placeholder - add when component is available */}
            <svg
              className={cn(
                "animate-spin w-5 h-5",
                variant === "default" ? "text-primary-foreground" : 
                variant === "secondary" ? "text-secondary-foreground" :
                variant === "destructive" ? "text-destructive-foreground" : "text-muted-foreground"
              )}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </span>
        )}
        {!isLoading && children}
      </>
    );

    if ('href' in props && props.href !== undefined) {
      // Render as anchor
      return (
        <a
          href={disabled ? undefined : props.href}
          className={buttonStyles}
          aria-disabled={disabled}
          tabIndex={disabled ? -1 : undefined}
          ref={ref as React.Ref<HTMLAnchorElement>}
          {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {content}
        </a>
      );
    }

    // Render as button
    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        disabled={isDisabled}
        className={buttonStyles}
        {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {content}
      </button>
    );
  }
);

Button.displayName = "Button"; 