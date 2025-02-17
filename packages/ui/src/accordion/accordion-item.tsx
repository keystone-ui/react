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
        variant === "underline" && "border-b border-gray-200",
        variant === "box" && "mb-2 rounded-lg border border-gray-200 bg-white",
        variant === "table" && [
          "border border-gray-200 bg-white [&:not(:first-child)]:-mt-[1px]",
          "first:rounded-t-lg last:rounded-b-lg"
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