import React from "react";
import { LoaderCircleIcon } from "lucide-react";
import { cn } from "../utils";
import { 
  buttonVariants, 
  type ButtonVariantsProps
} from "./button-variants";

// Define the custom props we're adding to the button
interface ButtonCustomProps {
  /** If true the button will display a spinner */
  isLoading?: boolean;
  /** The variant of the button */
  variant?: ButtonVariantsProps["variant"];
  /** The size of the button */
  size?: ButtonVariantsProps["size"];
}

// Type for when Button is rendered as a button
export type ButtonProps = ButtonCustomProps & 
  Omit<React.ComponentProps<"button">, "color"> & {
    href?: never;
  };

// Type for when Button is rendered as an anchor
export type AnchorButtonProps = ButtonCustomProps & 
  Omit<React.ComponentProps<"a">, "color"> & {
    href: string;
  };

// Combined type for the Button component
export type ButtonElementProps = ButtonProps | AnchorButtonProps;

export const Button = React.forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ButtonElementProps
>(
  (
    {
      className,
      variant = "default",
      size = "default",
      isLoading = false,
      children,
      ...props
    },
    ref
  ) => {
    // Extract disabled from props for both button and anchor
    const disabled = 
      'disabled' in props ? Boolean(props.disabled) : false;
    const isDisabled = isLoading || disabled;

    const buttonStyles = cn(
      buttonVariants({
        variant,
        size,
      }),
      isLoading && "relative",
      className
    );

    // Set data-loading attribute for styling with CSS
    const dataAttributes = {
      'data-loading': isLoading || undefined
    };

    if ('href' in props && props.href !== undefined) {
      // Render as anchor
      return (
        <a
          href={disabled ? undefined : props.href}
          className={buttonStyles}
          aria-disabled={disabled}
          tabIndex={disabled ? -1 : undefined}
          ref={ref as React.Ref<HTMLAnchorElement>}
          {...dataAttributes}
          {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          <span className={cn("inline-flex items-center justify-center gap-2", isLoading ? "invisible" : "visible")}>
            {children}
          </span>
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <LoaderCircleIcon 
                className="animate-spin" 
                size={16} 
                aria-hidden="true" 
              />
            </div>
          )}
        </a>
      );
    }

    // Render as button
    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        disabled={isDisabled}
        className={buttonStyles}
        {...dataAttributes}
        {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        <span className={cn("inline-flex items-center justify-center gap-2", isLoading ? "invisible" : "visible")}>
          {children}
        </span>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <LoaderCircleIcon 
              className="animate-spin" 
              size={16} 
              aria-hidden="true" 
            />
          </div>
        )}
      </button>
    );
  }
);

Button.displayName = "Button"; 