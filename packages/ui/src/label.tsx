"use client";

import type React from "react";
import { cn } from "./utils";

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {
  /**
   * Optional additional className for the label
   */
  className?: string;
}

export const Label = ({
  className,
  ref,
  ...props
}: LabelProps & React.RefAttributes<HTMLLabelElement>) => (
  <label
    className={cn(
      "select-none font-medium text-foreground text-sm leading-4",
      "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
      className
    )}
    ref={ref}
    {...props}
  />
);

Label.displayName = "Label";

export interface DescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {
  /**
   * Optional additional className for the description
   */
  className?: string;
}

export const Description = ({
  className,
  ref,
  ...props
}: DescriptionProps & React.RefAttributes<HTMLParagraphElement>) => (
  <p
    className={cn("text-[13px] text-muted-foreground", className)}
    ref={ref}
    {...props}
  />
);

Description.displayName = "Description";

export interface ErrorMessageProps
  extends React.HTMLAttributes<HTMLParagraphElement> {
  /**
   * Optional additional className for the error message
   */
  className?: string;
}

export const ErrorMessage = ({
  className,
  ref,
  ...props
}: ErrorMessageProps & React.RefAttributes<HTMLParagraphElement>) => (
  <p
    className={cn("text-[13px] text-destructive", className)}
    ref={ref}
    {...props}
  />
);

ErrorMessage.displayName = "ErrorMessage";

export interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  /**
   * Optional additional className for the form container
   */
  className?: string;
}

/**
 * Semantic `<form>` wrapper. Inputs nested inside submit on Enter.
 * Pass `onSubmit` to handle submission; remember to call `event.preventDefault()`.
 */
export const Form = ({
  className,
  ref,
  ...props
}: FormProps & React.RefAttributes<HTMLFormElement>) => (
  <form
    className={cn("grid w-full max-w-sm items-center gap-1.5", className)}
    ref={ref}
    {...props}
  />
);

Form.displayName = "Form";

export interface FieldGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Optional additional className for the field group container
   */
  className?: string;
}

/**
 * Non-semantic `<div>` wrapper with the same grid layout as `Form`.
 * Use when you need the layout without the `<form>` element
 * (e.g. inside an existing form, or for non-submittable field groups).
 */
export const FieldGroup = ({
  className,
  ref,
  ...props
}: FieldGroupProps & React.RefAttributes<HTMLDivElement>) => (
  <div
    className={cn("grid w-full max-w-sm items-center gap-1.5", className)}
    ref={ref}
    {...props}
  />
);

FieldGroup.displayName = "FieldGroup";
