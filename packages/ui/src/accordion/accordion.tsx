"use client";

import React from "react";
import { Accordion as AccordionPrimitive } from "@base-ui-components/react/accordion";

import { cn } from "@acme/ui";
import type { AccordionProps } from "./types";
import { 
  AccordionVariantContext, 
  AccordionLeadingIconContext 
} from ".";

/**
 * Accordion component that displays a list of expandable items.
 * Built on top of Base UI Components Accordion primitive.
 */
const Accordion = React.forwardRef<
  React.ComponentRef<typeof AccordionPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Root>
>((
  { className: classNameProp, ...props }, 
  ref
) => {
  const { 
    variant = "underline", 
    defaultValue,
    value,
    onValueChange,
    hiddenUntilFound,
    openMultiple,
    disabled,
    loop,
    orientation
  } = props as AccordionProps;

  const baseClasses = cn("flex w-full flex-col justify-center");

  return (
    <AccordionVariantContext.Provider value={variant}>
      <AccordionLeadingIconContext.Provider value={false}>
        <AccordionPrimitive.Root
          ref={ref}
          defaultValue={defaultValue}
          value={value}
          onValueChange={onValueChange}
          hiddenUntilFound={hiddenUntilFound}
          openMultiple={openMultiple}
          disabled={disabled}
          loop={loop}
          orientation={orientation}
          className={cn(baseClasses, classNameProp)}
          {...props}
        />
      </AccordionLeadingIconContext.Provider>
    </AccordionVariantContext.Provider>
  );
});

Accordion.displayName = "Accordion";

export { Accordion }; 