import * as React from "react";

import { cn } from "./utils";

// =============================================================================
// DescriptionList
// =============================================================================

export interface DescriptionListProps extends React.ComponentProps<"dl"> {
  /**
   * The size variant of the description list
   * @default "default"
   */
  size?: "default" | "sm";
  /**
   * The visual variant of the description list
   * - `default`: Rows separated by bottom borders
   * - `card`: Spaced rows with rounded corners and background fill
   * @default "default"
   */
  variant?: "default" | "card";
}

const DescriptionList = React.forwardRef<HTMLDListElement, DescriptionListProps>(
  ({ className, size = "default", variant = "default", ...props }, ref) => {
    return (
      <dl
        ref={ref}
        data-slot="description-list"
        data-size={size}
        data-variant={variant}
        className={cn(
          "group/description-list flex w-full flex-col text-sm",
          "data-[variant=card]:gap-1",
          className
        )}
        {...props}
      />
    );
  }
);

DescriptionList.displayName = "DescriptionList";

// =============================================================================
// DescriptionListItem
// =============================================================================

export interface DescriptionListItemProps extends React.ComponentProps<"div"> {}

const DescriptionListItem = React.forwardRef<
  HTMLDivElement,
  DescriptionListItemProps
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-slot="description-list-item"
      className={cn(
        "flex w-full items-center justify-between px-3 py-2.5 group-data-[size=sm]/description-list:px-2.5 group-data-[size=sm]/description-list:py-1.5",
        "border-b border-border last:border-0 group-data-[variant=card]/description-list:border-0",
        "group-data-[variant=card]/description-list:rounded-lg group-data-[variant=card]/description-list:bg-muted/50",
        className
      )}
      {...props}
    />
  );
});

DescriptionListItem.displayName = "DescriptionListItem";

// =============================================================================
// DescriptionListTerm
// =============================================================================

export interface DescriptionListTermProps extends React.ComponentProps<"dt"> {}

const DescriptionListTerm = React.forwardRef<
  HTMLElement,
  DescriptionListTermProps
>(({ className, ...props }, ref) => {
  return (
    <dt
      ref={ref}
      data-slot="description-list-term"
      className={cn("text-muted-foreground", className)}
      {...props}
    />
  );
});

DescriptionListTerm.displayName = "DescriptionListTerm";

// =============================================================================
// DescriptionListDetails
// =============================================================================

export interface DescriptionListDetailsProps
  extends React.ComponentProps<"dd"> {}

const DescriptionListDetails = React.forwardRef<
  HTMLElement,
  DescriptionListDetailsProps
>(({ className, ...props }, ref) => {
  return (
    <dd
      ref={ref}
      data-slot="description-list-details"
      className={cn("ml-auto text-right", className)}
      {...props}
    />
  );
});

DescriptionListDetails.displayName = "DescriptionListDetails";

// =============================================================================
// Exports
// =============================================================================

export {
  DescriptionList,
  DescriptionListItem,
  DescriptionListTerm,
  DescriptionListDetails,
};
