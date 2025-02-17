"use client";

import { Accordion as AccordionPrimitive } from "@base-ui-components/react/accordion";
import * as React from "react";

import { cn } from "../lib/utils";
import { AccordionHeaderProps } from "./types";

/**
 * Header component that contains the trigger.
 */
const AccordionHeader = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Header>,
  AccordionHeaderProps
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Header
    ref={ref}
    className={cn(className)}
    {...props}
  />
));

AccordionHeader.displayName = "AccordionHeader";

export { AccordionHeader }; 