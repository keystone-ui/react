import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

// ---------------------------------------------------------------------------
// Empty
// ---------------------------------------------------------------------------

export interface EmptyProps extends React.ComponentProps<"div"> {}

const Empty = React.forwardRef<HTMLDivElement, EmptyProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-slot="empty"
        className={cn(
          "flex w-full min-w-0 flex-1 flex-col items-center justify-center gap-4 rounded-xl border-dashed p-6 text-center text-balance",
          className
        )}
        {...props}
      />
    );
  }
);

Empty.displayName = "Empty";

// ---------------------------------------------------------------------------
// EmptyHeader
// ---------------------------------------------------------------------------

export interface EmptyHeaderProps extends React.ComponentProps<"div"> {}

const EmptyHeader = React.forwardRef<HTMLDivElement, EmptyHeaderProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-slot="empty-header"
        className={cn("flex max-w-sm flex-col items-center gap-2", className)}
        {...props}
      />
    );
  }
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
        icon: "bg-muted text-foreground flex size-8 shrink-0 items-center justify-center rounded-lg [&_svg:not([class*='size-'])]:size-4",
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

const EmptyMedia = React.forwardRef<HTMLDivElement, EmptyMediaProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-slot="empty-icon"
        data-variant={variant}
        className={cn(emptyMediaVariants({ variant, className }))}
        {...props}
      />
    );
  }
);

EmptyMedia.displayName = "EmptyMedia";

// ---------------------------------------------------------------------------
// EmptyTitle
// ---------------------------------------------------------------------------

export interface EmptyTitleProps extends React.ComponentProps<"div"> {}

const EmptyTitle = React.forwardRef<HTMLDivElement, EmptyTitleProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-slot="empty-title"
        className={cn("text-sm font-medium tracking-tight", className)}
        {...props}
      />
    );
  }
);

EmptyTitle.displayName = "EmptyTitle";

// ---------------------------------------------------------------------------
// EmptyDescription
// ---------------------------------------------------------------------------

export interface EmptyDescriptionProps extends React.ComponentProps<"div"> {}

const EmptyDescription = React.forwardRef<
  HTMLDivElement,
  EmptyDescriptionProps
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-slot="empty-description"
      className={cn(
        "text-muted-foreground [&>a]:hover:text-primary text-sm/relaxed [&>a]:underline [&>a]:underline-offset-4",
        className
      )}
      {...props}
    />
  );
});

EmptyDescription.displayName = "EmptyDescription";

// ---------------------------------------------------------------------------
// EmptyContent
// ---------------------------------------------------------------------------

export interface EmptyContentProps extends React.ComponentProps<"div"> {}

const EmptyContent = React.forwardRef<HTMLDivElement, EmptyContentProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-slot="empty-content"
        className={cn(
          "flex w-full max-w-sm min-w-0 flex-col items-center gap-2.5 text-sm text-balance",
          className
        )}
        {...props}
      />
    );
  }
);

EmptyContent.displayName = "EmptyContent";

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  emptyMediaVariants,
};
