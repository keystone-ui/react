"use client";

import { Accordion as AccordionPrimitive } from "@base-ui-components/react/accordion";
import * as React from "react";

import { cn } from "../lib/utils";
import { AccordionVariantContext } from "./accordion";
import { AccordionPanelProps } from "./types";

/**
 * Panel section of the accordion that expands/collapses.
 */
const AccordionPanel = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Panel>,
  AccordionPanelProps
>(({ className, children, variant: variantProp, ...props }, ref) => {
  const contextVariant = React.useContext(AccordionVariantContext);
  const variant = variantProp ?? contextVariant;

  return (
    <AccordionPrimitive.Panel
      ref={ref}
      className={cn(
        "h-[var(--accordion-panel-height)] overflow-hidden text-sm text-muted-foreground",
        "pb-3",
        "transition-[height] ease-out data-[ending-style]:h-0 data-[starting-style]:h-0",
        (variant === "box" || variant === "table") && "px-3",
        className
      )}
      {...props}
    >
      {children}
    </AccordionPrimitive.Panel>
  );
});

AccordionPanel.displayName = "AccordionPanel";

export { AccordionPanel }; 