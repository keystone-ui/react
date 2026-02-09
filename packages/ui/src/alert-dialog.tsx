"use client";

import * as React from "react";
import { AlertDialog as AlertDialogPrimitive } from "@base-ui/react/alert-dialog";

import { cn } from "./utils";
import { Button } from "./button";

// =============================================================================
// AlertDialog (Root)
// =============================================================================
function AlertDialog({ ...props }: AlertDialogPrimitive.Root.Props) {
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />;
}

// =============================================================================
// AlertDialogTrigger
// =============================================================================
export interface AlertDialogTriggerProps
  extends AlertDialogPrimitive.Trigger.Props {}

function AlertDialogTrigger({ ...props }: AlertDialogTriggerProps) {
  return (
    <AlertDialogPrimitive.Trigger
      data-slot="alert-dialog-trigger"
      {...props}
    />
  );
}

// =============================================================================
// AlertDialogPortal
// =============================================================================
export interface AlertDialogPortalProps
  extends AlertDialogPrimitive.Portal.Props {}

function AlertDialogPortal({ ...props }: AlertDialogPortalProps) {
  return (
    <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />
  );
}

// =============================================================================
// AlertDialogOverlay
// =============================================================================
export interface AlertDialogOverlayProps
  extends AlertDialogPrimitive.Backdrop.Props {}

function AlertDialogOverlay({ className, ...props }: AlertDialogOverlayProps) {
  return (
    <AlertDialogPrimitive.Backdrop
      data-slot="alert-dialog-overlay"
      className={cn(
        "data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className,
      )}
      {...props}
    />
  );
}

// =============================================================================
// AlertDialogContent
// =============================================================================
export interface AlertDialogContentProps
  extends AlertDialogPrimitive.Popup.Props {
  /**
   * The size of the alert dialog.
   * - `"default"` — standard width (max-w-xs on mobile, sm:max-w-sm on desktop)
   * - `"sm"` — compact width (max-w-xs at all breakpoints)
   * @default "default"
   */
  size?: "default" | "sm";
}

function AlertDialogContent({
  className,
  size = "default",
  ...props
}: AlertDialogContentProps) {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Popup
        data-slot="alert-dialog-content"
        data-size={size}
        className={cn(
          "bg-background data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 group/alert-dialog-content fixed top-[50%] left-[50%] z-50 grid w-full -translate-x-[50%] -translate-y-[50%] gap-4 rounded-xl p-4 shadow-lg duration-200 outline-none data-[size=default]:max-w-xs data-[size=sm]:max-w-xs data-[size=default]:sm:max-w-sm",
          className,
        )}
        {...props}
      />
    </AlertDialogPortal>
  );
}

// =============================================================================
// AlertDialogHeader
// =============================================================================
export interface AlertDialogHeaderProps extends React.ComponentProps<"div"> {}

function AlertDialogHeader({ className, ...props }: AlertDialogHeaderProps) {
  return (
    <div
      data-slot="alert-dialog-header"
      className={cn(
        "grid grid-rows-[auto_1fr] place-items-center gap-1.5 text-center has-data-[slot=alert-dialog-media]:grid-rows-[auto_auto_1fr] has-data-[slot=alert-dialog-media]:gap-x-4 sm:group-data-[size=default]/alert-dialog-content:place-items-start sm:group-data-[size=default]/alert-dialog-content:text-left sm:group-data-[size=default]/alert-dialog-content:has-data-[slot=alert-dialog-media]:grid-rows-[auto_1fr]",
        className,
      )}
      {...props}
    />
  );
}

// =============================================================================
// AlertDialogFooter
// =============================================================================
export interface AlertDialogFooterProps extends React.ComponentProps<"div"> {}

function AlertDialogFooter({ className, ...props }: AlertDialogFooterProps) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    />
  );
}

// =============================================================================
// AlertDialogMedia
// =============================================================================
export interface AlertDialogMediaProps extends React.ComponentProps<"div"> {}

function AlertDialogMedia({ className, ...props }: AlertDialogMediaProps) {
  return (
    <div
      data-slot="alert-dialog-media"
      className={cn(
        "bg-muted mb-2 inline-flex size-10 items-center justify-center rounded-md sm:group-data-[size=default]/alert-dialog-content:row-span-2 *:[svg:not([class*='size-'])]:size-6",
        className,
      )}
      {...props}
    />
  );
}

// =============================================================================
// AlertDialogTitle
// =============================================================================
export interface AlertDialogTitleProps
  extends React.ComponentProps<typeof AlertDialogPrimitive.Title> {}

function AlertDialogTitle({ className, ...props }: AlertDialogTitleProps) {
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      className={cn(
        "text-base font-medium sm:group-data-[size=default]/alert-dialog-content:group-has-data-[slot=alert-dialog-media]/alert-dialog-content:col-start-2",
        className,
      )}
      {...props}
    />
  );
}

// =============================================================================
// AlertDialogDescription
// =============================================================================
export interface AlertDialogDescriptionProps
  extends React.ComponentProps<typeof AlertDialogPrimitive.Description> {}

function AlertDialogDescription({
  className,
  ...props
}: AlertDialogDescriptionProps) {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={cn(
        "text-muted-foreground text-sm text-balance *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground md:text-pretty",
        className,
      )}
      {...props}
    />
  );
}

// =============================================================================
// AlertDialogAction
// =============================================================================
export interface AlertDialogActionProps
  extends React.ComponentProps<typeof Button> {}

function AlertDialogAction({ className, ...props }: AlertDialogActionProps) {
  return (
    <Button
      data-slot="alert-dialog-action"
      className={cn(className)}
      {...props}
    />
  );
}

// =============================================================================
// AlertDialogCancel
// =============================================================================
export interface AlertDialogCancelProps
  extends AlertDialogPrimitive.Close.Props,
    Pick<React.ComponentProps<typeof Button>, "variant" | "size"> {}

function AlertDialogCancel({
  className,
  variant = "outline",
  size = "default",
  ...props
}: AlertDialogCancelProps) {
  return (
    <AlertDialogPrimitive.Close
      data-slot="alert-dialog-cancel"
      className={cn(className)}
      render={<Button variant={variant} size={size} />}
      {...props}
    />
  );
}

// =============================================================================
// Exports
// =============================================================================
export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
};
