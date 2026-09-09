"use client";

import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "./utils";

/**
 * All of Card's padding and gap resolve from one custom property, so a
 * consumer can reach any spacing -- including none -- with
 * `className="[--card-spacing:0px]"`. That is the table-flush recipe: a Card
 * whose padding is zero lets a Table sit edge to edge, with `overflow-hidden`
 * clipping the table container's square corners to Card's radius.
 *
 * `size` therefore resolves through CVA rather than through
 * `data-[size=sm]:[--card-spacing:…]` variants on the base. That looks
 * equivalent and is not: a variant modifier is part of tailwind-merge's group
 * key, so an unmodified consumer override does not replace the size-scoped
 * declarations, and the survivors compile to class+attribute selectors --
 * specificity (0,2,0) against the consumer's (0,1,0). `<Card size="sm"
 * className="[--card-spacing:0px]">` silently kept its padding. Emitting
 * exactly one *unmodified* declaration per render makes tailwind-merge the
 * single arbiter, so the override wins at every size. card.test.tsx pins this
 * at all three sizes; a default-size-only test passes either way.
 *
 * Note `--card-spacing: 0px` also zeroes the root `gap`, so a CardHeader and a
 * flush Table become adjacent siblings. That is what a flush table card wants.
 * For a padded header above a flush table, keep normal spacing and put the
 * table in a bare `<div>` sibling rather than in CardContent.
 */
const cardVariants = cva(
  "group/card flex flex-col gap-(--card-spacing) overflow-hidden rounded-xl py-(--card-spacing) text-card-foreground text-sm has-[>img:first-child]:pt-0 has-data-[slot=card-footer]:pb-0 *:[img:first-child]:rounded-t-xl *:[img:last-child]:rounded-b-xl",
  {
    variants: {
      size: {
        md: "[--card-spacing:--spacing(6)]",
        sm: "[--card-spacing:--spacing(4)]",
        xs: "[--card-spacing:--spacing(3)]",
      },
      variant: {
        filled: "bg-card ring-1 ring-border-muted",
        outline: "ring-1 ring-border",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "filled",
    },
  }
);

export interface CardProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof cardVariants> {
  /**
   * The size variant of the card
   * @default "md"
   */
  size?: "md" | "sm" | "xs";
  /**
   * The surface treatment.
   *
   * `filled` paints `bg-card`. `outline` has no fill, so the page shows
   * through -- the tier to use for chart and table panels, where a filled card
   * inside a filled page reads as two stacked surfaces.
   *
   * Both use a ring rather than a border, deliberately: a ring is a box-shadow
   * with no layout impact, where a border insets the content box by 1px, so
   * flipping a row of cards between variants would shift every child. Note
   * `outline` rings `border` at full strength where `filled` rings
   * `border-muted` (the same color at half alpha) -- with no fill the edge is
   * the only thing defining the card, so it has to do more work.
   *
   * @default "filled"
   */
  variant?: "filled" | "outline";
}

export const Card = ({
  className,
  size = "md",
  variant = "filled",
  ref,
  ...props
}: CardProps & React.RefAttributes<HTMLDivElement>) => (
  <div
    className={cn(cardVariants({ size, variant }), className)}
    data-size={size}
    data-slot="card"
    data-variant={variant}
    ref={ref}
    {...props}
  />
);

Card.displayName = "Card";

export interface CardHeaderProps extends React.ComponentProps<"div"> {}

export const CardHeader = ({
  className,
  ref,
  ...props
}: CardHeaderProps & React.RefAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "group/card-header @container/card-header grid auto-rows-min items-start gap-1 rounded-t-xl px-(--card-spacing) has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-(--card-spacing)",
      className
    )}
    data-slot="card-header"
    ref={ref}
    {...props}
  />
);

CardHeader.displayName = "CardHeader";

export interface CardTitleProps extends React.ComponentProps<"div"> {}

export const CardTitle = ({
  className,
  ref,
  ...props
}: CardTitleProps & React.RefAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "font-medium text-base leading-snug group-data-[size=xs]/card:text-sm",
      className
    )}
    data-slot="card-title"
    ref={ref}
    {...props}
  />
);

CardTitle.displayName = "CardTitle";

export interface CardDescriptionProps extends React.ComponentProps<"div"> {}

export const CardDescription = ({
  className,
  ref,
  ...props
}: CardDescriptionProps & React.RefAttributes<HTMLDivElement>) => (
  <div
    className={cn("text-muted-foreground text-sm", className)}
    data-slot="card-description"
    ref={ref}
    {...props}
  />
);

CardDescription.displayName = "CardDescription";

export interface CardActionProps extends React.ComponentProps<"div"> {}

export const CardAction = ({
  className,
  ref,
  ...props
}: CardActionProps & React.RefAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
      className
    )}
    data-slot="card-action"
    ref={ref}
    {...props}
  />
);

CardAction.displayName = "CardAction";

export interface CardContentProps extends React.ComponentProps<"div"> {}

export const CardContent = ({
  className,
  ref,
  ...props
}: CardContentProps & React.RefAttributes<HTMLDivElement>) => (
  <div
    className={cn("px-(--card-spacing)", className)}
    data-slot="card-content"
    ref={ref}
    {...props}
  />
);

CardContent.displayName = "CardContent";

export interface CardFooterProps extends React.ComponentProps<"div"> {}

export const CardFooter = ({
  className,
  ref,
  ...props
}: CardFooterProps & React.RefAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex items-center rounded-b-xl border-border-muted border-t bg-muted/50 p-(--card-spacing)",
      className
    )}
    data-slot="card-footer"
    ref={ref}
    {...props}
  />
);

CardFooter.displayName = "CardFooter";
