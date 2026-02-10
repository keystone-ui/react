import * as React from "react";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

// ---------------------------------------------------------------------------
// ItemGroup
// ---------------------------------------------------------------------------

function ItemGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      role="list"
      data-slot="item-group"
      className={cn(
        "group/item-group flex w-full flex-col rounded-lg border border-border",
        className
      )}
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
      data-slot="item-separator"
      role="separator"
      className={cn("bg-border h-px", className)}
      {...props}
    />
  );
}

// ---------------------------------------------------------------------------
// Variants
// ---------------------------------------------------------------------------

const itemVariants = cva(
  "[a]:hover:bg-muted rounded-lg border text-sm w-full group/item focus-visible:border-ring focus-visible:ring-ring/50 flex items-center flex-wrap outline-none transition-colors duration-100 focus-visible:ring-[3px] [a]:transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent",
        outline: "border-border",
        muted: "bg-muted/50 border-transparent",
      },
      size: {
        default: "gap-2.5 px-3 py-2.5",
        sm: "gap-2 px-2.5 py-2",
        xs: "gap-2 px-2.5 py-2 in-data-[slot=dropdown-menu-content]:p-0",
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
  "gap-2 group-has-data-[slot=item-description]/item:translate-y-0.5 group-has-data-[slot=item-description]/item:self-start flex shrink-0 items-center justify-center [&_svg]:pointer-events-none",
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
      data-slot="item-media"
      data-variant={variant}
      className={cn(itemMediaVariants({ variant, className }))}
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
      data-slot="item-content"
      className={cn(
        "flex min-w-0 flex-1 flex-col gap-0.5 group-data-[size=xs]/item:gap-0 [&+[data-slot=item-content]]:flex-none",
        className
      )}
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
      data-slot="item-title"
      className={cn(
        "line-clamp-1 flex w-fit items-center gap-2 text-sm leading-snug font-medium underline-offset-4",
        className
      )}
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
      data-slot="item-description"
      className={cn(
        "text-muted-foreground [&>a:hover]:text-primary line-clamp-2 text-left text-sm leading-normal font-normal group-data-[size=xs]/item:text-xs [&>a]:underline [&>a]:underline-offset-4",
        className
      )}
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
      data-slot="item-actions"
      className={cn("flex items-center gap-2", className)}
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
      data-slot="item-header"
      className={cn(
        "text-muted-foreground flex basis-full items-center justify-between gap-2 text-xs [&_svg:not([class*='size-'])]:size-3.5",
        className
      )}
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
      data-slot="item-footer"
      className={cn(
        "text-muted-foreground flex w-full items-center gap-2 pt-2 text-xs [&_svg:not([class*='size-'])]:size-3",
        className
      )}
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
