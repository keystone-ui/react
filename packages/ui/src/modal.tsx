"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { XIcon } from "lucide-react";
import * as React from "react";
import { Button } from "./button";
import { cn } from "./utils";

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
      className={className}
      data-slot="modal-trigger"
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
      className={className}
      data-slot="modal-close"
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
      className={cn(
        "data-closed:fade-out-0 data-open:fade-in-0 fixed inset-0 z-50 bg-black/50 data-closed:animate-out data-open:animate-in",
        className
      )}
      data-slot="modal-overlay"
      {...props}
    />
  );
}

// =============================================================================
// ModalContent Variants
// =============================================================================
const modalContentVariants = cva(
  "data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg bg-background p-6 shadow-lg outline-none duration-200 data-closed:animate-out data-open:animate-in",
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
  }
);

type ModalContentVariantsProps = VariantProps<typeof modalContentVariants>;

// =============================================================================
// ModalContent
// =============================================================================
export interface ModalContentProps
  extends DialogPrimitive.Popup.Props,
    ModalContentVariantsProps {
  /**
   * Where scrolling happens when content exceeds the viewport.
   * - `"outside"` — the entire viewport scrolls, modal grows to fit (default)
   * - `"inside"` — content scrolls within the modal
   * @default "outside"
   */
  scrollBehavior?: "inside" | "outside";
  /**
   * Whether to show the close button in the top-right corner.
   * @default true
   */
  showCloseButton?: boolean;
}

function ModalContent({
  className,
  children,
  size = "default",
  showCloseButton = true,
  scrollBehavior = "outside",
  ...props
}: ModalContentProps) {
  // When scrolling outside, focus the popup container itself on open
  // instead of the first tabbable element. Without this, Base UI focuses
  // the first button (often at the bottom of long content), and the browser
  // auto-scrolls the overflow wrapper to reveal it — jumping to the bottom.
  const popupRef = React.useRef<HTMLDivElement>(null);

  const closeButton = showCloseButton && (
    <DialogPrimitive.Close
      className="absolute top-4 right-4"
      data-slot="modal-close"
      render={<Button size="icon-xs" variant="ghost" />}
    >
      <XIcon />
      <span className="sr-only">Close</span>
    </DialogPrimitive.Close>
  );

  const popup = (
    <DialogPrimitive.Popup
      className={cn(
        modalContentVariants({ size }),
        scrollBehavior === "outside" &&
          "relative top-auto left-auto translate-x-0 translate-y-0",
        className
      )}
      data-slot="modal-content"
      ref={popupRef}
      {...(scrollBehavior === "outside" && { initialFocus: popupRef })}
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
          className="fixed inset-0 z-50 overflow-y-auto"
          data-slot="modal-scroll-wrapper"
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
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      data-slot="modal-header"
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
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      )}
      data-slot="modal-footer"
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
      className={cn("font-semibold text-lg leading-none", className)}
      data-slot="modal-title"
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
      className={cn("text-muted-foreground text-sm", className)}
      data-slot="modal-description"
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
