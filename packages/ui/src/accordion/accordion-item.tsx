"use client";

import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion";
import * as React from "react";

import { cn } from "@acme/ui";
import { AccordionVariantContext } from ".";
import type { AccordionItemProps } from "./types";

/**
 * Individual accordion item that contains a trigger and content.
 */
const AccordionItem = React.forwardRef<
  React.ComponentRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className: classNameProp, ...props }, ref) => {
  const { variant: variantProp } = props as AccordionItemProps;

  const contextVariant = React.useContext(AccordionVariantContext);
  const variant = variantProp ?? contextVariant;

  // Define base classes based on variant
  const baseClasses = cn(
    "group",
    variant === "box" && [
      "mb-2 rounded-lg border border-border"
    ],
    variant === "table" && [
      "border border-border",
      "[&:not(:first-child)]:-mt-[1px]",
      "first:rounded-t-lg last:rounded-b-lg"
    ],
    variant === "underline" && [
      "border-b border-border",
      "last:border-b-0"
    ],
    variant === "ghost" && "border-none"
  );

  return (
    <AccordionPrimitive.Item
      ref={ref}
      // Pass the base classes and the original classNameProp (potentially a function)
      // The primitive component should handle merging/calling the function with state
      className={cn(baseClasses, classNameProp)}
      {...props}
    />
  );
});

AccordionItem.displayName = "AccordionItem";

export { AccordionItem }; 