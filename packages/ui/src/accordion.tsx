"use client";

import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion";
import { ChevronDown } from "lucide-react";
import * as React from "react";

import { cn } from "./utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type AccordionRootBaseProps = Omit<React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Root>, 'className' | 'render' | 'variant' | 'defaultValue' | 'value' | 'onValueChange' | 'hiddenUntilFound' | 'multiple' | 'disabled' | 'orientation' | 'keepMounted'>;
type AccordionItemBaseProps = Omit<React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>, 'className' | 'render' | 'variant' | 'onOpenChange' | 'disabled'>;
type AccordionHeaderBaseProps = Omit<React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Header>, 'className' | 'render'>;
type AccordionTriggerBaseProps = Omit<React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>, 'className' | 'render' | 'chevronIcon' | 'variant'>;
type AccordionPanelBaseProps = Omit<React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Panel>, 'className' | 'render' | 'variant' | 'hiddenUntilFound' | 'keepMounted'>;

export type AccordionVariant = "box" | "underline" | "ghost" | "table";
type RenderProp = React.ReactElement | ((props: any, state: any) => React.ReactElement);
type ClassNameProp = string | ((state: any) => string);

export type AccordionProps = AccordionRootBaseProps & {
  /** The visual style variant of the accordion @default "underline" */
  variant?: AccordionVariant;
  /** The default value of the accordion */
  defaultValue?: string[];
  /** The controlled value of the accordion */
  value?: string[];
  /** Callback when value changes */
  onValueChange?: (value: string[]) => void;
  /** Whether the accordion items should be hidden until found @default false */
  hiddenUntilFound?: boolean;
  /** Whether multiple items can be opened at once @default true */
  multiple?: boolean;
  /** Whether the accordion is disabled @default false */
  disabled?: boolean;
  /** The orientation of the accordion @default 'vertical' */
  orientation?: 'horizontal' | 'vertical';
  /** Whether to keep the content mounted when closed @default false */
  keepMounted?: boolean;
  /** Optional class name or function that returns a class name */
  className?: ClassNameProp;
  /** Optional render function */
  render?: RenderProp;
};

export type AccordionItemProps = AccordionItemBaseProps & {
  /** The visual style variant of the accordion item. Inherited from parent Accordion if not specified */
  variant?: AccordionVariant;
  /** Callback when item open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Whether the item is disabled @default false */
  disabled?: boolean;
  className?: ClassNameProp;
  render?: RenderProp;
};

export type AccordionHeaderProps = AccordionHeaderBaseProps & {
  className?: ClassNameProp;
  render?: RenderProp;
};

export type AccordionTriggerProps = AccordionTriggerBaseProps & {
  /** Icon to replace the default chevron icon on the right side. */
  chevronIcon?: React.ReactNode;
  /** The visual style variant of the trigger. Inherited from parent AccordionItem if not specified */
  variant?: AccordionVariant;
  className?: ClassNameProp;
  render?: RenderProp;
};

export type AccordionPanelProps = AccordionPanelBaseProps & {
  /** The visual style variant of the panel. Inherited from parent AccordionItem if not specified */
  variant?: AccordionVariant;
  /** Whether the panel should be hidden until found @default false */
  hiddenUntilFound?: boolean;
  /** Whether to keep the panel mounted when closed @default false */
  keepMounted?: boolean;
  className?: ClassNameProp;
  render?: RenderProp;
};

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const AccordionVariantContext = React.createContext<AccordionProps["variant"]>("underline");
const AccordionLeadingIconContext = React.createContext<boolean>(false);

// ---------------------------------------------------------------------------
// Accordion (root)
// ---------------------------------------------------------------------------

const Accordion = React.forwardRef<
  React.ComponentRef<typeof AccordionPrimitive.Root>,
  AccordionProps
>((
  { className: classNameProp, variant = "underline", defaultValue, value, onValueChange, hiddenUntilFound, multiple, disabled, orientation, ...props }, 
  ref
) => {

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
          multiple={multiple}
          disabled={disabled}
          orientation={orientation}
          className={cn(baseClasses, classNameProp)}
          {...props}
        />
      </AccordionLeadingIconContext.Provider>
    </AccordionVariantContext.Provider>
  );
});

Accordion.displayName = "Accordion";

// ---------------------------------------------------------------------------
// AccordionItem
// ---------------------------------------------------------------------------

const AccordionItem = React.forwardRef<
  React.ComponentRef<typeof AccordionPrimitive.Item>,
  AccordionItemProps
>(({ className: classNameProp, variant: variantProp, ...props }, ref) => {

  const contextVariant = React.useContext(AccordionVariantContext);
  const variant = variantProp ?? contextVariant;

  const baseClasses = cn(
    "group",
    variant === "box" && [
      "mb-2 rounded-lg border border-border"
    ],
    variant === "table" && [
      "border border-border",
      "[&:not(:first-child)]:-mt-[1px]",
      "first:rounded-t-lg last:rounded-b-lg"
    ],
    variant === "underline" && [
      "border-b border-border",
      "last:border-b-0"
    ],
    variant === "ghost" && "border-none"
  );

  return (
    <AccordionPrimitive.Item
      ref={ref}
      className={cn(baseClasses, classNameProp)}
      {...props}
    />
  );
});

AccordionItem.displayName = "AccordionItem";

// ---------------------------------------------------------------------------
// AccordionHeader
// ---------------------------------------------------------------------------

const AccordionHeader = React.forwardRef<
  React.ComponentRef<typeof AccordionPrimitive.Header>,
  AccordionHeaderProps
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Header
    ref={ref}
    className={cn(className)}
    {...props}
  />
));

AccordionHeader.displayName = "AccordionHeader";

// ---------------------------------------------------------------------------
// AccordionTrigger
// ---------------------------------------------------------------------------

const AccordionTrigger = React.forwardRef<
  React.ComponentRef<typeof AccordionPrimitive.Trigger>,
  AccordionTriggerProps
>(({ className: classNameProp, children, variant: variantProp, chevronIcon, ...props }, ref) => {

  const contextVariant = React.useContext(AccordionVariantContext);
  const variant = variantProp ?? contextVariant;

  const baseClasses = cn(
    "group flex w-full cursor-pointer items-center justify-between gap-4 py-2.5 text-left text-sm font-semibold",
    "focus:ring-0 focus:ring-offset-0",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring/50",
    variant === "box" && [
      "px-3",
      "rounded-lg"
    ],
    variant === "table" && "px-3"
  );

  return (
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(baseClasses, classNameProp)}
      {...props}
    >
      {children}
      {chevronIcon ? (
        <span className="flex shrink-0 items-center justify-center transition-transform ease-out group-data-[panel-open]:rotate-180" aria-hidden="true">
          {chevronIcon}
        </span>
      ) : (
        <ChevronDown 
          className="size-3 shrink-0 opacity-75 transition-transform ease-out group-data-[panel-open]:rotate-180" 
          aria-hidden="true" 
        />
      )}
    </AccordionPrimitive.Trigger>
  );
});

AccordionTrigger.displayName = "AccordionTrigger";

// ---------------------------------------------------------------------------
// AccordionPanel
// ---------------------------------------------------------------------------

const AccordionPanel = React.forwardRef<
  React.ComponentRef<typeof AccordionPrimitive.Panel>,
  AccordionPanelProps
>(({ className: classNameProp, children, variant: variantProp, ...props }, ref) => {

  const contextVariant = React.useContext(AccordionVariantContext);
  const variant = variantProp ?? contextVariant;

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

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export {
  Accordion,
  AccordionItem,
  AccordionHeader,
  AccordionTrigger,
  AccordionPanel,
  AccordionVariantContext,
  AccordionLeadingIconContext,
};
