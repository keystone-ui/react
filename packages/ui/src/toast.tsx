"use client";

import * as React from "react";
import {
  Toaster as SonnerToaster,
  toast,
  type ToasterProps,
} from "sonner";
import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
  XIcon,
} from "lucide-react";

import { cn } from "./utils";

// ---------------------------------------------------------------------------
// Theme detection
// ---------------------------------------------------------------------------

/**
 * Auto-detects light/dark theme by watching the `.dark` class on
 * `document.documentElement`. Falls back to `"light"` on the server.
 */
function useThemeDetection(): "light" | "dark" {
  const getSnapshot = React.useCallback(
    () =>
      typeof document !== "undefined" &&
      document.documentElement.classList.contains("dark")
        ? ("dark" as const)
        : ("light" as const),
    []
  );

  const getServerSnapshot = React.useCallback(
    () => "light" as const,
    []
  );

  const subscribe = React.useCallback((onStoreChange: () => void) => {
    const target = document.documentElement;
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "class"
        ) {
          onStoreChange();
        }
      }
    });

    observer.observe(target, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

// ---------------------------------------------------------------------------
// Toaster
// ---------------------------------------------------------------------------

export interface ToasterComponentProps extends ToasterProps {}

const Toaster = ({ theme, className, ...props }: ToasterComponentProps) => {
  const detectedTheme = useThemeDetection();
  const resolvedTheme = theme ?? detectedTheme;

  return (
    <SonnerToaster
      data-slot="toaster"
      theme={resolvedTheme}
      closeButton
      className={cn("toaster group", className)}
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
        close: <XIcon className="size-3" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border-muted)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast:
            "group/toast !gap-1 !overflow-visible max-sm:!flex-wrap max-sm:[&_[data-content]]:!flex-[1_0_calc(100%-2rem)] max-sm:[&_[data-button]]:!ml-0 max-sm:[&_[data-button]]:!mt-1.5 max-sm:has-data-[icon]:[&_[data-button]]:!ml-5 max-sm:has-data-[icon]:[&_[data-button]~[data-button]]:!ml-0 has-data-[description]:[&_[data-icon]]:!self-start has-data-[description]:[&_[data-icon]]:!mt-[3px] data-[dismissible=false]:[&_[data-close-button]]:!hidden",
          closeButton: cn(
            // Position: centered on the top-right corner of the toast
            "!left-auto !right-0 !top-0 !translate-x-1/2 !-translate-y-1/2 ![transform:none]",
            // Size 20×20, circular
            "!size-5 !rounded-full !p-0 !border !border-border !shadow-sm",
            // Colors: subtle background like ghost button
            "!bg-background !text-muted-foreground",
            "hover:!bg-accent hover:!text-foreground",
            // Hidden by default, revealed on toast hover
            "!opacity-0 group-hover/toast:!opacity-100",
            // Also reveal on keyboard focus for a11y
            "focus-visible:!opacity-100",
            // Smooth transitions for reveal + hover background
            "!transition-[opacity,background-color,color] !cursor-pointer",
            // Mobile: always visible (no hover on touch)
            "max-sm:!opacity-100"
          ),
          success:
            "[&_[data-icon]]:!text-green-600 dark:[&_[data-icon]]:!text-green-500 [&_[data-title]]:!text-green-600 dark:[&_[data-title]]:!text-green-500",
          error:
            "[&_[data-icon]]:!text-red-600 dark:[&_[data-icon]]:!text-red-500 [&_[data-title]]:!text-red-600 dark:[&_[data-title]]:!text-red-500",
          warning:
            "[&_[data-icon]]:!text-yellow-600 dark:[&_[data-icon]]:!text-yellow-500 [&_[data-title]]:!text-yellow-600 dark:[&_[data-title]]:!text-yellow-500",
          info:
            "[&_[data-icon]]:!text-blue-600 dark:[&_[data-icon]]:!text-blue-500 [&_[data-title]]:!text-blue-600 dark:[&_[data-title]]:!text-blue-500",
        },
      }}
      {...props}
    />
  );
};

Toaster.displayName = "Toaster";

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export { Toaster, toast };
export type { ToasterProps };
