import React from "react";
import { LoaderCircleIcon } from "lucide-react";
import { cn } from "../utils";
import { 
  buttonVariants, 
  type ButtonVariantsProps
} from "./button-variants";
// TODO: Fix Loader import when Loader component is added

// Define the custom props we're adding to the button
interface ButtonCustomProps {
  /** If true the button will display a spinner */
  isLoading?: boolean;
  /** Button will extend full width of the container */
  fullWidth?: boolean;
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
      fullWidth = false,
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
      fullWidth && "w-full",
      className
    );

    const content = (
      <>
        {isLoading && (
        <LoaderCircleIcon 
            className={cn( "animate-spin")}
            size={16} 
            aria-hidden="true" 
        />
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