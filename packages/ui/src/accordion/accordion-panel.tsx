"use client";

import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion";
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

  // Keyframe-based animation like shadcn
  const baseClasses = cn(
    "overflow-hidden text-sm text-muted-foreground",
    "data-[open]:animate-accordion-down data-[closed]:animate-accordion-up"
  );

  const innerClasses = cn(
    "pb-3",
    (variant === "box" || variant === "table") && "px-3"
  );

  return (
    <AccordionPrimitive.Panel
      ref={ref}
      className={cn(baseClasses, classNameProp)}
      {...props}
    >
      <div className={innerClasses}>{children}</div>
    </AccordionPrimitive.Panel>
  );
});

AccordionPanel.displayName = "AccordionPanel";

export { AccordionPanel }; 