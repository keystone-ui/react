"use client";

import React from "react";
import { cn } from "./utils";

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {
  /**
   * Optional additional className for the label
   */
  className?: string;
}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => {
    return (
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
  }
);

Label.displayName = "Label";

export interface DescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {
  /**
   * Optional additional className for the description
   */
  className?: string;
}

export const Description = React.forwardRef<
  HTMLParagraphElement,
  DescriptionProps
>(({ className, ...props }, ref) => {
  return (
    <p
      className={cn("text-[13px] text-muted-foreground", className)}
      ref={ref}
      {...props}
    />
  );
});

Description.displayName = "Description";

export interface ErrorMessageProps
  extends React.HTMLAttributes<HTMLParagraphElement> {
  /**
   * Optional additional className for the error message
   */
  className?: string;
}

export const ErrorMessage = React.forwardRef<
  HTMLParagraphElement,
  ErrorMessageProps
>(({ className, ...props }, ref) => {
  return (
    <p
      className={cn("text-[13px] text-destructive", className)}
      ref={ref}
      {...props}
    />
  );
});

ErrorMessage.displayName = "ErrorMessage";

export interface FormProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Optional additional className for the form container
   */
  className?: string;
}

export const Form = React.forwardRef<HTMLDivElement, FormProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        className={cn("grid w-full max-w-sm items-center gap-1.5", className)}
        ref={ref}
        {...props}
      />
    );
  }
);

Form.displayName = "Form";
