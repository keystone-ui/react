import * as React from "react";
import type { AccordionProps } from "./types";

/**
 * Context for the accordion variant
 */
export const AccordionVariantContext = React.createContext<AccordionProps["variant"]>("underline");

/**
 * Context for tracking if the accordion has a leading icon
 */
export const AccordionLeadingIconContext = React.createContext<boolean>(false); 