import { Accordion as AccordionPrimitive } from "@base-ui-components/react/accordion";
import * as React from "react";

export type AccordionVariant = "box" | "underline" | "ghost" | "table";

type RenderProp = React.ReactElement | ((props: any, state: any) => React.ReactElement);
type ClassNameProp = string | ((state: any) => string);

export type AccordionProps = Omit<React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Root>, 'className' | 'render'> & {
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

export type AccordionItemProps = Omit<React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>, 'className' | 'render'> & {
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

export type AccordionHeaderProps = Omit<React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Header>, 'className' | 'render'> & {
  /**
   * Optional class name or function that returns a class name
   */
  className?: ClassNameProp;
  /**
   * Optional render function
   */
  render?: RenderProp;
};

export type AccordionTriggerProps = Omit<React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>, 'className' | 'render'> & {
  /**
   * Custom icon to replace the default chevron
   */
  icon?: React.ReactNode;
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

export type AccordionPanelProps = Omit<React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Panel>, 'className' | 'render'> & {
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