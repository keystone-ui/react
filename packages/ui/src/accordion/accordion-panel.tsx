"use client";

import { Accordion as AccordionPrimitive } from "@base-ui-components/react/accordion";
import * as React from "react";

import { cn } from "@acme/ui";
import { AccordionVariantContext } from ".";
import type { AccordionPanelProps } from "./types";

/**
 * Panel section of the accordion that expands/collapses.
 */
const AccordionPanel = React.forwardRef<
  React.ComponentRef<typeof AccordionPrimitive.Panel>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Panel>
>(({ className: classNameProp, children, ...props }, ref) => {
  // Extract custom props needed
  const { variant: variantProp } = props as AccordionPanelProps;

  const contextVariant = React.useContext(AccordionVariantContext);
  const variant = variantProp ?? contextVariant;

  // Define base classes based on variant
  const baseClasses = cn(
    "h-[var(--accordion-panel-height)] overflow-hidden text-sm text-muted-foreground",
    "pb-3",
    "transition-[height] ease-out data-[ending-style]:h-0 data-[starting-style]:h-0",
    (variant === "box" || variant === "table") && "px-3"
  );

  return (
    <AccordionPrimitive.Panel
      ref={ref}
      className={cn(baseClasses, classNameProp)} // Pass base and original className
      {...props} // Spread remaining props
    >
      {children}
    </AccordionPrimitive.Panel>
  );
});

AccordionPanel.displayName = "AccordionPanel";

export { AccordionPanel }; 