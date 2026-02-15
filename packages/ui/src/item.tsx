import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "./utils";

// ---------------------------------------------------------------------------
// ItemGroup
// ---------------------------------------------------------------------------

function ItemGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "group/item-group flex w-full flex-col rounded-lg border border-border",
        className
      )}
      data-slot="item-group"
      role="list"
      {...props}
    />
  );
}

// ---------------------------------------------------------------------------
// ItemSeparator
// ---------------------------------------------------------------------------

function ItemSeparator({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("h-px bg-border", className)}
      data-slot="item-separator"
      role="separator"
      {...props}
    />
  );
}

// ---------------------------------------------------------------------------
// Variants
// ---------------------------------------------------------------------------

const itemVariants = cva(
  "group/item flex w-full flex-wrap items-center rounded-lg border text-sm transition-colors duration-100 focus:ring-0 focus:ring-offset-0 focus-visible:outline-2 focus-visible:outline-ring/50 focus-visible:outline-offset-2 [a]:transition-colors [a]:hover:bg-muted",
  {
    variants: {
      variant: {
        default: "border-transparent",
        outline: "border-border",
        muted: "border-transparent bg-muted/50",
      },
      size: {
        default: "gap-2.5 px-3 py-2.5",
        sm: "gap-2 px-2.5 py-2",
        xs: "gap-2 in-data-[slot=dropdown-menu-content]:p-0 px-2.5 py-2",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

// ---------------------------------------------------------------------------
// Item
// ---------------------------------------------------------------------------

function Item({
  className,
  variant = "default",
  size = "default",
  render,
  ...props
}: useRender.ComponentProps<"div"> & VariantProps<typeof itemVariants>) {
  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        className: cn(itemVariants({ variant, size, className })),
      },
      props
    ),
    render,
    state: {
      slot: "item",
      variant,
      size,
    },
  });
}

// ---------------------------------------------------------------------------
// ItemMedia
// ---------------------------------------------------------------------------

const itemMediaVariants = cva(
  "flex shrink-0 items-center justify-center gap-2 group-has-data-[slot=item-description]/item:translate-y-0.5 group-has-data-[slot=item-description]/item:self-start [&_svg]:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        icon: "[&_svg:not([class*='size-'])]:size-4",
        image:
          "size-10 overflow-hidden rounded-sm group-data-[size=sm]/item:size-8 group-data-[size=xs]/item:size-6 [&_img]:size-full [&_img]:object-cover",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function ItemMedia({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof itemMediaVariants>) {
  return (
    <div
      className={cn(itemMediaVariants({ variant, className }))}
      data-slot="item-media"
      data-variant={variant}
      {...props}
    />
  );
}

// ---------------------------------------------------------------------------
// ItemContent
// ---------------------------------------------------------------------------

function ItemContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-1 flex-col gap-0.5 group-data-[size=xs]/item:gap-0 [&+[data-slot=item-content]]:flex-none",
        className
      )}
      data-slot="item-content"
      {...props}
    />
  );
}

// ---------------------------------------------------------------------------
// ItemTitle
// ---------------------------------------------------------------------------

function ItemTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "line-clamp-1 flex w-fit items-center gap-2 font-medium text-sm leading-snug underline-offset-4",
        className
      )}
      data-slot="item-title"
      {...props}
    />
  );
}

// ---------------------------------------------------------------------------
// ItemDescription
// ---------------------------------------------------------------------------

function ItemDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      className={cn(
        "line-clamp-2 text-left font-normal text-muted-foreground text-sm leading-normal group-data-[size=xs]/item:text-xs [&>a]:underline [&>a]:underline-offset-4 [&>a]:hover:text-primary",
        className
      )}
      data-slot="item-description"
      {...props}
    />
  );
}

// ---------------------------------------------------------------------------
// ItemActions
// ---------------------------------------------------------------------------

function ItemActions({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex items-center gap-2", className)}
      data-slot="item-actions"
      {...props}
    />
  );
}

// ---------------------------------------------------------------------------
// ItemHeader
// ---------------------------------------------------------------------------

function ItemHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex basis-full items-center justify-between gap-2 text-muted-foreground text-xs [&_svg:not([class*='size-'])]:size-3.5",
        className
      )}
      data-slot="item-header"
      {...props}
    />
  );
}

// ---------------------------------------------------------------------------
// ItemFooter
// ---------------------------------------------------------------------------

function ItemFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex w-full items-center gap-2 pt-2 text-muted-foreground text-xs [&_svg:not([class*='size-'])]:size-3",
        className
      )}
      data-slot="item-footer"
      {...props}
    />
  );
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export {
  Item,
  ItemMedia,
  ItemContent,
  ItemActions,
  ItemGroup,
  ItemSeparator,
  ItemTitle,
  ItemDescription,
  ItemHeader,
  ItemFooter,
  itemVariants,
  itemMediaVariants,
};
