"use client";

import { Accordion as AccordionPrimitive } from "@base-ui-components/react/accordion";
import * as React from "react";

import { cn } from "../lib/utils";
import { AccordionVariantContext } from "./accordion";
import { AccordionItemProps } from "./types";

/**
 * Individual accordion item that contains a trigger and content.
 */
const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  AccordionItemProps
>(({ className, variant: variantProp, ...props }, ref) => {
  const contextVariant = React.useContext(AccordionVariantContext);
  const variant = variantProp ?? contextVariant;

  return (
    <AccordionPrimitive.Item
      ref={ref}
      className={cn(
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
        variant === "ghost" && "border-none",
        className
      )}
      {...props}
    />
  );
});

AccordionItem.displayName = "AccordionItem";

export { AccordionItem }; 