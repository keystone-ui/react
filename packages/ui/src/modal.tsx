"use client";

import * as React from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { XIcon } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";
import { Button } from "./button";

// =============================================================================
// Modal (Root)
// =============================================================================
function Modal({ ...props }: DialogPrimitive.Root.Props) {
  return <DialogPrimitive.Root data-slot="modal" {...props} />;
}

// =============================================================================
// ModalTrigger
// =============================================================================
export interface ModalTriggerProps extends DialogPrimitive.Trigger.Props {}

function ModalTrigger({ className, ...props }: ModalTriggerProps) {
  return (
    <DialogPrimitive.Trigger
      data-slot="modal-trigger"
      className={className}
      {...props}
    />
  );
}

// =============================================================================
// ModalPortal
// =============================================================================
export interface ModalPortalProps extends DialogPrimitive.Portal.Props {}

function ModalPortal({ ...props }: ModalPortalProps) {
  return <DialogPrimitive.Portal data-slot="modal-portal" {...props} />;
}

// =============================================================================
// ModalClose
// =============================================================================
export interface ModalCloseProps extends DialogPrimitive.Close.Props {}

function ModalClose({ className, ...props }: ModalCloseProps) {
  return (
    <DialogPrimitive.Close
      data-slot="modal-close"
      className={className}
      {...props}
    />
  );
}

// =============================================================================
// ModalOverlay
// =============================================================================
export interface ModalOverlayProps extends DialogPrimitive.Backdrop.Props {}

function ModalOverlay({ className, ...props }: ModalOverlayProps) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="modal-overlay"
      className={cn(
        "data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className,
      )}
      {...props}
    />
  );
}

// =============================================================================
// ModalContent Variants
// =============================================================================
const modalContentVariants = cva(
  "bg-background data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 outline-none",
  {
    variants: {
      size: {
        sm: "sm:max-w-sm",
        default: "sm:max-w-lg",
        lg: "sm:max-w-2xl",
        xl: "sm:max-w-4xl",
        full: "sm:max-w-[calc(100vw-2rem)]",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

type ModalContentVariantsProps = VariantProps<typeof modalContentVariants>;

// =============================================================================
// ModalContent
// =============================================================================
export interface ModalContentProps
  extends DialogPrimitive.Popup.Props,
    ModalContentVariantsProps {
  /**
   * Whether to show the close button in the top-right corner.
   * @default true
   */
  showCloseButton?: boolean;
  /**
   * Where scrolling happens when content exceeds the viewport.
   * - `"inside"` — content scrolls within the modal (default)
   * - `"outside"` — the entire viewport scrolls, modal grows to fit
   * @default "inside"
   */
  scrollBehavior?: "inside" | "outside";
}

function ModalContent({
  className,
  children,
  size = "default",
  showCloseButton = true,
  scrollBehavior = "inside",
  ...props
}: ModalContentProps) {
  const closeButton = showCloseButton && (
    <DialogPrimitive.Close
      data-slot="modal-close"
      className="absolute top-4 right-4 cursor-pointer rounded-sm opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring/50 disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
    >
      <XIcon />
      <span className="sr-only">Close</span>
    </DialogPrimitive.Close>
  );

  const popup = (
    <DialogPrimitive.Popup
      data-slot="modal-content"
      className={cn(
        modalContentVariants({ size }),
        scrollBehavior === "outside" &&
          "relative top-auto left-auto translate-x-0 translate-y-0",
        className,
      )}
      {...props}
    >
      {children}
      {closeButton}
    </DialogPrimitive.Popup>
  );

  if (scrollBehavior === "outside") {
    return (
      <ModalPortal>
        <ModalOverlay />
        <div
          data-slot="modal-scroll-wrapper"
          className="fixed inset-0 z-50 overflow-y-auto"
        >
          <div className="flex min-h-full items-center justify-center p-4">
            {popup}
          </div>
        </div>
      </ModalPortal>
    );
  }

  return (
    <ModalPortal>
      <ModalOverlay />
      {popup}
    </ModalPortal>
  );
}

// =============================================================================
// ModalHeader
// =============================================================================
export interface ModalHeaderProps extends React.ComponentProps<"div"> {}

function ModalHeader({ className, ...props }: ModalHeaderProps) {
  return (
    <div
      data-slot="modal-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  );
}

// =============================================================================
// ModalFooter
// =============================================================================
export interface ModalFooterProps extends React.ComponentProps<"div"> {
  /**
   * Whether to show a "Close" outline button at the end of the footer.
   * @default false
   */
  showCloseButton?: boolean;
}

function ModalFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: ModalFooterProps) {
  return (
    <div
      data-slot="modal-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close render={<Button variant="outline" />}>
          Close
        </DialogPrimitive.Close>
      )}
    </div>
  );
}

// =============================================================================
// ModalTitle
// =============================================================================
export interface ModalTitleProps extends DialogPrimitive.Title.Props {}

function ModalTitle({ className, ...props }: ModalTitleProps) {
  return (
    <DialogPrimitive.Title
      data-slot="modal-title"
      className={cn("text-lg leading-none font-semibold", className)}
      {...props}
    />
  );
}

// =============================================================================
// ModalDescription
// =============================================================================
export interface ModalDescriptionProps
  extends DialogPrimitive.Description.Props {}

function ModalDescription({ className, ...props }: ModalDescriptionProps) {
  return (
    <DialogPrimitive.Description
      data-slot="modal-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

// =============================================================================
// Exports
// =============================================================================
export {
  Modal,
  ModalTrigger,
  ModalPortal,
  ModalOverlay,
  ModalClose,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalTitle,
  ModalDescription,
  modalContentVariants,
};

export type { ModalContentVariantsProps };
