"use client";

import { Accordion as AccordionPrimitive } from "@base-ui-components/react/accordion";
import * as React from "react";

import { cn } from "../lib/utils";
import { AccordionProps } from "./types";

const AccordionVariantContext = React.createContext<AccordionProps["variant"]>("underline");
const AccordionLeadingIconContext = React.createContext<boolean>(false);

/**
 * Accordion component that displays a list of expandable items.
 * Built on top of Base UI Components Accordion primitive.
 */
const Accordion = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Root>,
  AccordionProps
>(({ 
  defaultValue,
  value,
  onValueChange,
  hiddenUntilFound = false,
  openMultiple = true,
  disabled = false,
  loop = true,
  orientation = 'vertical',
  className,
  variant = "underline",
  ...props 
}, ref) => (
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
        className={cn("flex w-full flex-col justify-center", className)}
        {...props}
      />
    </AccordionLeadingIconContext.Provider>
  </AccordionVariantContext.Provider>
));

Accordion.displayName = "Accordion";

export { Accordion, AccordionVariantContext, AccordionLeadingIconContext }; 