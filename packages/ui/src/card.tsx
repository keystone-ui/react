"use client";

import * as React from "react";
import { cn } from "./utils";

export interface CardProps extends React.ComponentProps<"div"> {
  /**
   * The size variant of the card
   * @default "default"
   */
  size?: "default" | "sm";
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, size = "default", ...props }, ref) => {
    return (
      <div
        className={cn(
          "group/card flex flex-col gap-4 overflow-hidden rounded-xl bg-card py-4 text-card-foreground text-sm ring-1 ring-border-muted has-[>img:first-child]:pt-0 has-data-[slot=card-footer]:pb-0 data-[size=sm]:gap-3 data-[size=sm]:py-3 data-[size=sm]:has-data-[slot=card-footer]:pb-0 *:[img:first-child]:rounded-t-xl *:[img:last-child]:rounded-b-xl",
          className
        )}
        data-size={size}
        data-slot="card"
        ref={ref}
        {...props}
      />
    );
  }
);

Card.displayName = "Card";

export interface CardHeaderProps extends React.ComponentProps<"div"> {}

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        className={cn(
          "group/card-header @container/card-header grid auto-rows-min items-start gap-1 rounded-t-xl px-4 has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] group-data-[size=sm]/card:px-3 [.border-b]:pb-4 group-data-[size=sm]/card:[.border-b]:pb-3",
          className
        )}
        data-slot="card-header"
        ref={ref}
        {...props}
      />
    );
  }
);

CardHeader.displayName = "CardHeader";

export interface CardTitleProps extends React.ComponentProps<"div"> {}

export const CardTitle = React.forwardRef<HTMLDivElement, CardTitleProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        className={cn(
          "font-medium text-base leading-snug group-data-[size=sm]/card:text-sm",
          className
        )}
        data-slot="card-title"
        ref={ref}
        {...props}
      />
    );
  }
);

CardTitle.displayName = "CardTitle";

export interface CardDescriptionProps extends React.ComponentProps<"div"> {}

export const CardDescription = React.forwardRef<
  HTMLDivElement,
  CardDescriptionProps
>(({ className, ...props }, ref) => {
  return (
    <div
      className={cn("text-muted-foreground text-sm", className)}
      data-slot="card-description"
      ref={ref}
      {...props}
    />
  );
});

CardDescription.displayName = "CardDescription";

export interface CardActionProps extends React.ComponentProps<"div"> {}

export const CardAction = React.forwardRef<HTMLDivElement, CardActionProps>(
  ({ className, ...props }, ref) => {
    return (
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
  }
);

CardAction.displayName = "CardAction";

export interface CardContentProps extends React.ComponentProps<"div"> {}

export const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        className={cn("px-4 group-data-[size=sm]/card:px-3", className)}
        data-slot="card-content"
        ref={ref}
        {...props}
      />
    );
  }
);

CardContent.displayName = "CardContent";

export interface CardFooterProps extends React.ComponentProps<"div"> {}

export const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        className={cn(
          "flex items-center rounded-b-xl border-border-muted border-t bg-muted/50 p-4 group-data-[size=sm]/card:p-3",
          className
        )}
        data-slot="card-footer"
        ref={ref}
        {...props}
      />
    );
  }
);

CardFooter.displayName = "CardFooter";
