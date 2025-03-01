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
}

// Type for the Badge component
export type BadgeProps = BadgeCustomProps & React.HTMLAttributes<HTMLDivElement>;

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  (
    {
      className,
      variant,
      size,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          badgeVariants({ 
            variant, 
            size
          }), 
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Badge.displayName = "Badge"; 