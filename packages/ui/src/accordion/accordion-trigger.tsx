"use client";

import { Accordion as AccordionPrimitive } from "@base-ui-components/react/accordion";
import { ChevronDown } from "lucide-react";
import * as React from "react";

import { cn } from "../lib/utils";
import { AccordionVariantContext } from "./accordion";
import { AccordionTriggerProps } from "./types";

/**
 * Button that triggers the expansion/collapse of the accordion content.
 */
const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  AccordionTriggerProps
>(({ className, children, icon, variant: variantProp, ...props }, ref) => {
  const contextVariant = React.useContext(AccordionVariantContext);
  const variant = variantProp ?? contextVariant;

  return (
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        "group flex w-full cursor-pointer items-center justify-between gap-4 py-2 text-left text-sm font-semibold",
        (variant === "box" || variant === "table") && "px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-800",
        variant === "box" && "rounded-lg",
        variant !== "box" && variant !== "table" && "focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-800",
        className
      )}
      {...props}
    >
      {children}
      {icon || <ChevronDown className="size-3 shrink-0 transition-transform ease-out group-data-[panel-open]:rotate-180" />}
    </AccordionPrimitive.Trigger>
  );
});

AccordionTrigger.displayName = "AccordionTrigger";

export { AccordionTrigger }; 