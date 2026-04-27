import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "./utils";

// ---------------------------------------------------------------------------
// Empty
// ---------------------------------------------------------------------------

export interface EmptyProps extends React.ComponentProps<"div"> {}

const Empty = ({
  className,
  ref,
  ...props
}: EmptyProps & React.RefAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex w-full min-w-0 flex-1 flex-col items-center justify-center gap-4 text-balance rounded-xl border-dashed p-6 text-center",
      className
    )}
    data-slot="empty"
    ref={ref}
    {...props}
  />
);

Empty.displayName = "Empty";

// ---------------------------------------------------------------------------
// EmptyHeader
// ---------------------------------------------------------------------------

export interface EmptyHeaderProps extends React.ComponentProps<"div"> {}

const EmptyHeader = ({
  className,
  ref,
  ...props
}: EmptyHeaderProps & React.RefAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex max-w-sm flex-col items-center gap-2", className)}
    data-slot="empty-header"
    ref={ref}
    {...props}
  />
);

EmptyHeader.displayName = "EmptyHeader";

// ---------------------------------------------------------------------------
// EmptyMedia
// ---------------------------------------------------------------------------

const emptyMediaVariants = cva(
  "mb-2 flex shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        icon: "flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground [&_svg:not([class*='size-'])]:size-4",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

type EmptyMediaVariantsProps = VariantProps<typeof emptyMediaVariants>;

export interface EmptyMediaProps
  extends React.ComponentProps<"div">,
    EmptyMediaVariantsProps {}

const EmptyMedia = ({
  className,
  variant = "default",
  ref,
  ...props
}: EmptyMediaProps & React.RefAttributes<HTMLDivElement>) => (
  <div
    className={cn(emptyMediaVariants({ variant, className }))}
    data-slot="empty-icon"
    data-variant={variant}
    ref={ref}
    {...props}
  />
);

EmptyMedia.displayName = "EmptyMedia";

// ---------------------------------------------------------------------------
// EmptyTitle
// ---------------------------------------------------------------------------

export interface EmptyTitleProps extends React.ComponentProps<"div"> {}

const EmptyTitle = ({
  className,
  ref,
  ...props
}: EmptyTitleProps & React.RefAttributes<HTMLDivElement>) => (
  <div
    className={cn("font-medium text-sm tracking-tight", className)}
    data-slot="empty-title"
    ref={ref}
    {...props}
  />
);

EmptyTitle.displayName = "EmptyTitle";

// ---------------------------------------------------------------------------
// EmptyDescription
// ---------------------------------------------------------------------------

export interface EmptyDescriptionProps extends React.ComponentProps<"div"> {}

const EmptyDescription = ({
  className,
  ref,
  ...props
}: EmptyDescriptionProps & React.RefAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "text-muted-foreground text-sm/relaxed [&>a]:underline [&>a]:underline-offset-4 [&>a]:hover:text-primary",
      className
    )}
    data-slot="empty-description"
    ref={ref}
    {...props}
  />
);

EmptyDescription.displayName = "EmptyDescription";

// ---------------------------------------------------------------------------
// EmptyContent
// ---------------------------------------------------------------------------

export interface EmptyContentProps extends React.ComponentProps<"div"> {}

const EmptyContent = ({
  className,
  ref,
  ...props
}: EmptyContentProps & React.RefAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex w-full min-w-0 max-w-sm flex-col items-center gap-2.5 text-balance text-sm",
      className
    )}
    data-slot="empty-content"
    ref={ref}
    {...props}
  />
);

EmptyContent.displayName = "EmptyContent";

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  emptyMediaVariants,
};
