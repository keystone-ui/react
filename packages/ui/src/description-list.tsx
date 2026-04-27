import type * as React from "react";

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

const DescriptionList = ({
  className,
  size = "default",
  variant = "default",
  ref,
  ...props
}: DescriptionListProps & React.RefAttributes<HTMLDListElement>) => (
  <dl
    className={cn(
      "group/description-list flex w-full flex-col text-sm",
      "data-[variant=card]:gap-1",
      className
    )}
    data-size={size}
    data-slot="description-list"
    data-variant={variant}
    ref={ref}
    {...props}
  />
);

DescriptionList.displayName = "DescriptionList";

// =============================================================================
// DescriptionListItem
// =============================================================================

export interface DescriptionListItemProps extends React.ComponentProps<"div"> {}

const DescriptionListItem = ({
  className,
  ref,
  ...props
}: DescriptionListItemProps & React.RefAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex w-full items-center justify-between px-3 py-2.5 group-data-[size=sm]/description-list:px-2.5 group-data-[size=sm]/description-list:py-1.5",
      "border-border border-b last:border-0 group-data-[variant=card]/description-list:border-0",
      "group-data-[variant=card]/description-list:rounded-lg group-data-[variant=card]/description-list:bg-muted/50",
      className
    )}
    data-slot="description-list-item"
    ref={ref}
    {...props}
  />
);

DescriptionListItem.displayName = "DescriptionListItem";

// =============================================================================
// DescriptionListTerm
// =============================================================================

export interface DescriptionListTermProps extends React.ComponentProps<"dt"> {}

const DescriptionListTerm = ({
  className,
  ref,
  ...props
}: DescriptionListTermProps & React.RefAttributes<HTMLElement>) => (
  <dt
    className={cn("text-muted-foreground", className)}
    data-slot="description-list-term"
    ref={ref}
    {...props}
  />
);

DescriptionListTerm.displayName = "DescriptionListTerm";

// =============================================================================
// DescriptionListDetails
// =============================================================================

export interface DescriptionListDetailsProps
  extends React.ComponentProps<"dd"> {}

const DescriptionListDetails = ({
  className,
  ref,
  ...props
}: DescriptionListDetailsProps & React.RefAttributes<HTMLElement>) => (
  <dd
    className={cn("ml-auto text-right", className)}
    data-slot="description-list-details"
    ref={ref}
    {...props}
  />
);

DescriptionListDetails.displayName = "DescriptionListDetails";

// =============================================================================
// Exports
// =============================================================================

export {
  DescriptionList,
  DescriptionListDetails,
  DescriptionListItem,
  DescriptionListTerm,
};
