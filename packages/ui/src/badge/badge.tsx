import React from "react";
import { cn } from "@acme/ui";
import { badgeVariants, type BadgeVariantsProps } from "./badge-variants";

// Custom props for the Badge component
interface BadgeCustomProps {
  /**
   * The variant of the badge
   */
  variant?: BadgeVariantsProps["variant"];
  /**
   * The size of the badge
   */
  size?: BadgeVariantsProps["size"];
  /**
   * If true, renders the badge as a button
   */
  asButton?: boolean;
  /**
   * Optional click handler
   */
  onClick?: React.MouseEventHandler<HTMLButtonElement | HTMLSpanElement>;
}

// Type for the Badge component when rendered as a span
export type BadgeProps = BadgeCustomProps & 
  Omit<React.HTMLAttributes<HTMLSpanElement>, "onClick"> & {
    asButton?: false;
  };

// Type for the Badge component when rendered as a button
export type BadgeButtonProps = BadgeCustomProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "color"> & {
    asButton: true;
  };

// Combined type for the Badge component
export type BadgeElementProps = BadgeProps | BadgeButtonProps;

export const Badge = React.forwardRef<HTMLSpanElement | HTMLButtonElement, BadgeElementProps>(
  (
    {
      className,
      variant,
      size,
      children,
      asButton = false,
      onClick,
      ...props
    },
    ref
  ) => {
    const badgeClasses = cn(
      badgeVariants({ 
        variant, 
        size
      }), 
      asButton && "cursor-pointer",
      className
    );

    // Render as button
    if (asButton) {
      return (
        <button
          ref={ref as React.Ref<HTMLButtonElement>}
          className={badgeClasses}
          onClick={onClick}
          type="button"
          {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
        >
          {children}
        </button>
      );
    }

    // Render as span
    return (
      <span
        ref={ref as React.Ref<HTMLSpanElement>}
        className={badgeClasses}
        onClick={onClick}
        {...(props as React.HTMLAttributes<HTMLSpanElement>)}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge"; 