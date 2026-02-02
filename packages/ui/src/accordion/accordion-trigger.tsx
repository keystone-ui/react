"use client";

import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion";
import { ChevronDown } from "lucide-react";
import * as React from "react";

import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@acme/ui";
import { AccordionVariantContext } from ".";
import type { AccordionTriggerProps } from "./types";

/**
 * Button that triggers the expansion/collapse of the accordion content.
 */
const AccordionTrigger = React.forwardRef<
  React.ComponentRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className: classNameProp, children, ...props }, ref) => {
  // Extract custom props needed
  const { variant: variantProp, chevronIcon } = props as AccordionTriggerProps;

  const contextVariant = React.useContext(AccordionVariantContext);
  const variant = variantProp ?? contextVariant;

  // Define base classes based on variant
  const baseClasses = cn(
    "group flex w-full cursor-pointer items-center justify-between gap-4 py-2.5 text-left text-sm font-semibold",
    "focus:ring-0 focus:ring-offset-0",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring/50",
    variant === "box" && [
      "px-3",
      "rounded-lg"
    ],
    variant === "table" && "px-3"
  );

  return (
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(baseClasses, classNameProp)} // Pass base and original className
      {...props} // Spread remaining props
    >
      {children}
      {chevronIcon ? (
        <span className="flex shrink-0 items-center justify-center transition-transform ease-out group-data-[panel-open]:rotate-180" aria-hidden="true">
          {chevronIcon}
        </span>
      ) : (
        <ChevronDown 
          className="size-3 shrink-0 opacity-75 transition-transform ease-out group-data-[panel-open]:rotate-180" 
          aria-hidden="true" 
        />
      )}
    </AccordionPrimitive.Trigger>
  );
});

AccordionTrigger.displayName = "AccordionTrigger";

export { AccordionTrigger };