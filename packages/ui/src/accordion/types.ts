import { Accordion as AccordionPrimitive } from "@base-ui-components/react/accordion";
import * as React from "react";

// Base props inferred from the primitive, excluding those we customize or add
type AccordionRootBaseProps = Omit<React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Root>, 'className' | 'render' | 'variant' | 'defaultValue' | 'value' | 'onValueChange' | 'hiddenUntilFound' | 'openMultiple' | 'disabled' | 'loop' | 'orientation' | 'keepMounted'>;
type AccordionItemBaseProps = Omit<React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>, 'className' | 'render' | 'variant' | 'onOpenChange' | 'disabled'>;
type AccordionHeaderBaseProps = Omit<React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Header>, 'className' | 'render'>;
type AccordionTriggerBaseProps = Omit<React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>, 'className' | 'render' | 'chevronIcon' | 'variant'>;
type AccordionPanelBaseProps = Omit<React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Panel>, 'className' | 'render' | 'variant' | 'hiddenUntilFound' | 'keepMounted'>;

// Custom utility types
export type AccordionVariant = "box" | "underline" | "ghost" | "table";
type RenderProp = React.ReactElement | ((props: any, state: any) => React.ReactElement);
type ClassNameProp = string | ((state: any) => string);

// Combine base props with our custom/overridden props
export type AccordionProps = AccordionRootBaseProps & {
  /**
   * The visual style variant of the accordion
   * @default "underline"
   */
  variant?: AccordionVariant;
  /**
   * The default value of the accordion
   */
  defaultValue?: string[];
  /**
   * The controlled value of the accordion
   */
  value?: string[];
  /**
   * Callback when value changes
   */
  onValueChange?: (value: string[]) => void;
  /**
   * Whether the accordion items should be hidden until found
   * @default false
   */
  hiddenUntilFound?: boolean;
  /**
   * Whether multiple items can be opened at once
   * @default true
   */
  openMultiple?: boolean;
  /**
   * Whether the accordion is disabled
   * @default false
   */
  disabled?: boolean;
  /**
   * Whether keyboard navigation should loop
   * @default true
   */
  loop?: boolean;
  /**
   * The orientation of the accordion
   * @default 'vertical'
   */
  orientation?: 'horizontal' | 'vertical';
  /**
   * Whether to keep the content mounted when closed
   * @default false
   */
  keepMounted?: boolean;
  /**
   * Optional class name or function that returns a class name
   */
  className?: ClassNameProp;
  /**
   * Optional render function
   */
  render?: RenderProp;
};

export type AccordionItemProps = AccordionItemBaseProps & {
  /**
   * The visual style variant of the accordion item
   * Inherited from parent Accordion if not specified
   */
  variant?: AccordionVariant;
  /**
   * Callback when item open state changes
   */
  onOpenChange?: (open: boolean) => void;
  /**
   * Whether the item is disabled
   * @default false
   */
  disabled?: boolean;
  /**
   * Optional class name or function that returns a class name
   */
  className?: ClassNameProp;
  /**
   * Optional render function
   */
  render?: RenderProp;
};

export type AccordionHeaderProps = AccordionHeaderBaseProps & {
  /**
   * Optional class name or function that returns a class name
   */
  className?: ClassNameProp;
  /**
   * Optional render function
   */
  render?: RenderProp;
};

export type AccordionTriggerProps = AccordionTriggerBaseProps & {
  /**
   * Icon to replace the default chevron icon on the right side.
   * If provided, this will not inherit the default chevron's animation and styling.
   */
  chevronIcon?: React.ReactNode;
  /**
   * The visual style variant of the trigger
   * Inherited from parent AccordionItem if not specified
   */
  variant?: AccordionVariant;
  /**
   * Optional class name or function that returns a class name
   */
  className?: ClassNameProp;
  /**
   * Optional render function
   */
  render?: RenderProp;
};

export type AccordionPanelProps = AccordionPanelBaseProps & {
  /**
   * The visual style variant of the panel
   * Inherited from parent AccordionItem if not specified
   */
  variant?: AccordionVariant;
  /**
   * Whether the panel should be hidden until found
   * @default false
   */
  hiddenUntilFound?: boolean;
  /**
   * Whether to keep the panel mounted when closed
   * @default false
   */
  keepMounted?: boolean;
  /**
   * Optional class name or function that returns a class name
   */
  className?: ClassNameProp;
  /**
   * Optional render function
   */
  render?: RenderProp;
}; 