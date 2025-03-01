"use client";

import { Accordion as AccordionPrimitive } from "@base-ui-components/react/accordion";
import { ChevronDown } from "lucide-react";
import * as React from "react";

import { cn } from "@acme/ui";
import { AccordionVariantContext } from "./accordion";
import { AccordionTriggerProps } from "./types";

/**
 * Button that triggers the expansion/collapse of the accordion content.
 */
const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  AccordionTriggerProps
>(({ className, children, chevronIcon, variant: variantProp, ...props }, ref) => {
  const contextVariant = React.useContext(AccordionVariantContext);
  const variant = variantProp ?? contextVariant;

  return (
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        "group flex w-full cursor-pointer items-center justify-between gap-4 py-2.5 text-left text-sm font-semibold",
        "focus:ring-0 focus:ring-offset-0",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-outline",
        variant === "box" && [
          "px-3",
          "rounded-lg"
        ],
        variant === "table" && "px-3",
        className
      )}
      {...props}
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