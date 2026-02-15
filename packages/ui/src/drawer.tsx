"use client";

import { DrawerPreview as DrawerPrimitive } from "@base-ui/react/drawer";
import type * as React from "react";

import { cn } from "./utils";

// =============================================================================
// Drawer (Root)
// =============================================================================
function Drawer({ ...props }: DrawerPrimitive.Root.Props) {
  return <DrawerPrimitive.Root data-slot="drawer" {...props} />;
}

// =============================================================================
// DrawerTrigger
// =============================================================================
export interface DrawerTriggerProps extends DrawerPrimitive.Trigger.Props {}

function DrawerTrigger({ ...props }: DrawerTriggerProps) {
  return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />;
}

// =============================================================================
// DrawerPortal
// =============================================================================
export interface DrawerPortalProps extends DrawerPrimitive.Portal.Props {}

function DrawerPortal({ ...props }: DrawerPortalProps) {
  return <DrawerPrimitive.Portal data-slot="drawer-portal" {...props} />;
}

// =============================================================================
// DrawerClose
// =============================================================================
export interface DrawerCloseProps extends DrawerPrimitive.Close.Props {}

function DrawerClose({ ...props }: DrawerCloseProps) {
  return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />;
}

// =============================================================================
// DrawerOverlay
// =============================================================================
export interface DrawerOverlayProps extends DrawerPrimitive.Backdrop.Props {}

function DrawerOverlay({ className, ...props }: DrawerOverlayProps) {
  return (
    <DrawerPrimitive.Backdrop
      className={cn("fixed inset-0 z-50 bg-black/50", className)}
      data-slot="drawer-overlay"
      {...props}
    />
  );
}

// =============================================================================
// DrawerContent
// =============================================================================
export interface DrawerContentProps extends DrawerPrimitive.Popup.Props {}

function DrawerContent({ className, children, ...props }: DrawerContentProps) {
  return (
    <DrawerPortal>
      <DrawerOverlay />
      <DrawerPrimitive.Viewport
        className="fixed inset-0 z-50"
        data-slot="drawer-viewport"
      >
        <DrawerPrimitive.Popup
          className={cn(
            "group/drawer-content fixed z-50 flex h-auto flex-col bg-background text-sm outline-none",
            // Bottom (swipeDirection="down", default)
            "data-[swipe-direction=down]:inset-x-0 data-[swipe-direction=down]:bottom-0 data-[swipe-direction=down]:mt-24 data-[swipe-direction=down]:max-h-[80vh] data-[swipe-direction=down]:rounded-t-xl data-[swipe-direction=down]:border-t",
            // Top (swipeDirection="up")
            "data-[swipe-direction=up]:inset-x-0 data-[swipe-direction=up]:top-0 data-[swipe-direction=up]:mb-24 data-[swipe-direction=up]:max-h-[80vh] data-[swipe-direction=up]:rounded-b-xl data-[swipe-direction=up]:border-b",
            // Left (swipeDirection="left")
            "data-[swipe-direction=left]:inset-y-0 data-[swipe-direction=left]:left-0 data-[swipe-direction=left]:w-3/4 data-[swipe-direction=left]:rounded-r-xl data-[swipe-direction=left]:border-r data-[swipe-direction=left]:sm:max-w-sm",
            // Right (swipeDirection="right")
            "data-[swipe-direction=right]:inset-y-0 data-[swipe-direction=right]:right-0 data-[swipe-direction=right]:w-3/4 data-[swipe-direction=right]:rounded-l-xl data-[swipe-direction=right]:border-l data-[swipe-direction=right]:sm:max-w-sm",
            className
          )}
          data-slot="drawer-content"
          {...props}
        >
          {/* Drag handle for bottom drawer */}
          <div className="mx-auto mt-4 hidden h-1 w-[50px] shrink-0 rounded-full bg-muted group-data-[swipe-direction=down]/drawer-content:block" />
          <DrawerPrimitive.Content data-slot="drawer-inner-content">
            {children}
          </DrawerPrimitive.Content>
        </DrawerPrimitive.Popup>
      </DrawerPrimitive.Viewport>
    </DrawerPortal>
  );
}

// =============================================================================
// DrawerHeader
// =============================================================================
export interface DrawerHeaderProps extends React.ComponentProps<"div"> {}

function DrawerHeader({ className, ...props }: DrawerHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-0.5 p-4 group-data-[swipe-direction=down]/drawer-content:text-center group-data-[swipe-direction=up]/drawer-content:text-center md:gap-0.5 md:text-left",
        className
      )}
      data-slot="drawer-header"
      {...props}
    />
  );
}

// =============================================================================
// DrawerFooter
// =============================================================================
export interface DrawerFooterProps extends React.ComponentProps<"div"> {}

function DrawerFooter({ className, ...props }: DrawerFooterProps) {
  return (
    <div
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      data-slot="drawer-footer"
      {...props}
    />
  );
}

// =============================================================================
// DrawerTitle
// =============================================================================
export interface DrawerTitleProps extends DrawerPrimitive.Title.Props {}

function DrawerTitle({ className, ...props }: DrawerTitleProps) {
  return (
    <DrawerPrimitive.Title
      className={cn("font-medium text-base text-foreground", className)}
      data-slot="drawer-title"
      {...props}
    />
  );
}

// =============================================================================
// DrawerDescription
// =============================================================================
export interface DrawerDescriptionProps
  extends DrawerPrimitive.Description.Props {}

function DrawerDescription({ className, ...props }: DrawerDescriptionProps) {
  return (
    <DrawerPrimitive.Description
      className={cn("text-muted-foreground text-sm", className)}
      data-slot="drawer-description"
      {...props}
    />
  );
}

// =============================================================================
// Exports
// =============================================================================
export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
};
