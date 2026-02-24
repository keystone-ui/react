"use client";

import { Toast } from "@base-ui/react/toast";
import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
  XIcon,
} from "lucide-react";
import { type CSSProperties, isValidElement, type ReactNode } from "react";

import { cn } from "./utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ToastPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

interface ToastAction {
  label: ReactNode;
  onClick: () => void;
}

interface ToastData {
  /** Secondary cancel/dismiss button */
  cancel?: ToastAction;
  /** Whether to show a close button on this specific toast */
  closeButton?: boolean;
  /** Whether the toast can be dismissed by swiping or clicking close */
  dismissible?: boolean;
  /** Custom render function for fully custom toasts */
  render?: (id: string) => ReactNode;
}

interface ToastOptions {
  /** Primary action button */
  action?: ToastAction;
  /** Secondary cancel/dismiss button */
  cancel?: ToastAction;
  /** Show a close button on this specific toast */
  closeButton?: boolean;
  /** Description text shown below the title */
  description?: ReactNode;
  /** Whether the toast can be swiped away or closed. @default true */
  dismissible?: boolean;
  /** Duration in ms before auto-dismiss. `Infinity` keeps the toast open. */
  duration?: number;
  /** Pass an existing toast ID to update it in-place */
  id?: string;
  /** Callback when a toast auto-closes after its duration */
  onAutoClose?: () => void;
  /** Callback when a toast is manually dismissed */
  onDismiss?: () => void;
}

// ---------------------------------------------------------------------------
// Global toast manager
// ---------------------------------------------------------------------------

const toastManager = Toast.createToastManager();

// ---------------------------------------------------------------------------
// Imperative toast API
// ---------------------------------------------------------------------------

function createToast(
  title: ReactNode,
  options?: ToastOptions,
  type?: string
): string {
  const {
    id,
    description,
    duration,
    action,
    cancel,
    dismissible = true,
    closeButton,
    onAutoClose,
    onDismiss,
  } = options ?? {};

  // Resolve timeout: loading toasts don't auto-dismiss by default.
  // When updating an existing toast (id provided), reset to 5 000 ms unless
  // the caller set an explicit duration.
  let resolvedTimeout: number | undefined;
  if (duration === Number.POSITIVE_INFINITY) {
    resolvedTimeout = 0;
  } else if (duration != null) {
    resolvedTimeout = duration;
  } else if (type === "loading") {
    resolvedTimeout = 0;
  } else if (id != null) {
    resolvedTimeout = 5000;
  }

  const payload = {
    title,
    description,
    type: type ?? "default",
    timeout: resolvedTimeout,
    onClose: onAutoClose ?? onDismiss,
    actionProps: action
      ? { children: action.label, onClick: action.onClick }
      : undefined,
    data: { cancel, dismissible, closeButton } satisfies ToastData,
  };

  if (id) {
    toastManager.update(id, payload);
    return id;
  }

  return toastManager.add(payload);
}

// --- Main callable + attached methods ---

function toastFn(title: ReactNode, options?: ToastOptions): string {
  return createToast(title, options);
}

toastFn.success = (title: ReactNode, options?: ToastOptions) =>
  createToast(title, options, "success");

toastFn.error = (title: ReactNode, options?: ToastOptions) =>
  createToast(title, options, "error");

toastFn.warning = (title: ReactNode, options?: ToastOptions) =>
  createToast(title, options, "warning");

toastFn.info = (title: ReactNode, options?: ToastOptions) =>
  createToast(title, options, "info");

toastFn.loading = (title: ReactNode, options?: ToastOptions) =>
  createToast(title, options, "loading");

/**
 * Create a toast that tracks a promise through loading → success / error.
 *
 * String shortcuts are mapped to the toast **title** (matching Sonner's API).
 * Pass an object (`{ title, description, … }`) for richer control.
 */
toastFn.promise = <T,>(
  promise: Promise<T>,
  options: {
    loading: ReactNode | Record<string, unknown>;
    success: ReactNode | ((data: T) => ReactNode) | Record<string, unknown>;
    error: ReactNode | ((error: Error) => ReactNode) | Record<string, unknown>;
  }
): Promise<T> => {
  // Map shorthand string / ReactNode values to `{ title }` so the toast
  // shows the text as its title (Sonner compat — Base UI defaults to
  // `description` for string shortcuts).
  const mapOption = (
    opt: ReactNode | ((arg: never) => ReactNode) | Record<string, unknown>
  ): unknown => {
    if (typeof opt === "function") {
      return (arg: unknown) => {
        const result = (opt as (a: unknown) => ReactNode)(arg);
        if (
          typeof result === "object" &&
          result !== null &&
          !isValidElement(result)
        ) {
          return result; // Already a config object
        }
        return { title: result };
      };
    }
    if (typeof opt === "object" && opt !== null && !isValidElement(opt)) {
      return opt; // Already a config object
    }
    return { title: opt };
  };

  return toastManager.promise(promise, {
    loading: mapOption(options.loading),
    success: mapOption(options.success),
    error: mapOption(options.error),
  } as Parameters<typeof toastManager.promise>[1]);
};

/** Close and remove a toast by its ID. */
toastFn.dismiss = (id: string) => {
  toastManager.close(id);
};

/** Create a fully custom toast with arbitrary JSX. */
toastFn.custom = (
  render: (id: string) => ReactNode,
  options?: Pick<ToastOptions, "id" | "duration" | "dismissible">
): string => {
  const { id, duration, dismissible = true } = options ?? {};

  const payload = {
    timeout: duration === Number.POSITIVE_INFINITY ? 0 : duration,
    data: { render, dismissible } satisfies ToastData,
  };

  if (id) {
    toastManager.update(id, payload);
    return id;
  }

  return toastManager.add(payload);
};

/** Imperative toast API — call `toast("message")` or use typed helpers. */
const toast = toastFn;

// ---------------------------------------------------------------------------
// Icons
// ---------------------------------------------------------------------------

const TOAST_ICONS: Record<string, ReactNode> = {
  success: <CircleCheckIcon className="size-4" />,
  info: <InfoIcon className="size-4" />,
  warning: <TriangleAlertIcon className="size-4" />,
  error: <OctagonXIcon className="size-4" />,
  loading: <Loader2Icon className="size-4 animate-spin" />,
};

// ---------------------------------------------------------------------------
// Semantic color classes (icon + title only, matching Alert palette)
// ---------------------------------------------------------------------------

const TYPE_CLASSES: Record<string, string> = {
  success:
    "[&_[data-slot=toast-icon]]:text-green-600 dark:[&_[data-slot=toast-icon]]:text-green-500 [&_[data-slot=toast-title]]:text-green-600 dark:[&_[data-slot=toast-title]]:text-green-500",
  error:
    "[&_[data-slot=toast-icon]]:text-red-600 dark:[&_[data-slot=toast-icon]]:text-red-500 [&_[data-slot=toast-title]]:text-red-600 dark:[&_[data-slot=toast-title]]:text-red-500",
  warning:
    "[&_[data-slot=toast-icon]]:text-yellow-600 dark:[&_[data-slot=toast-icon]]:text-yellow-500 [&_[data-slot=toast-title]]:text-yellow-600 dark:[&_[data-slot=toast-title]]:text-yellow-500",
  info: "[&_[data-slot=toast-icon]]:text-blue-600 dark:[&_[data-slot=toast-icon]]:text-blue-500 [&_[data-slot=toast-title]]:text-blue-600 dark:[&_[data-slot=toast-title]]:text-blue-500",
};

// ---------------------------------------------------------------------------
// Viewport position mapping
// ---------------------------------------------------------------------------

const VIEWPORT_POSITION_CLASSES: Record<ToastPosition, string> = {
  "top-left": "top-0 left-0",
  "top-center": "top-0 left-1/2 -translate-x-1/2",
  "top-right": "top-0 right-0",
  "bottom-left": "bottom-0 left-0",
  "bottom-center": "bottom-0 left-1/2 -translate-x-1/2",
  "bottom-right": "bottom-0 right-0",
};

// ---------------------------------------------------------------------------
// Toast stacking classes (matching Base UI Toast example verbatim)
// All stacking logic lives here as Tailwind utilities — no separate CSS file.
// ---------------------------------------------------------------------------

/** Position-independent stacking, animation, and transition classes. */
const TOAST_STACK_BASE = [
  // CSS custom properties for stacking math
  "[--gap:0.75rem]",
  "[--peek:0.75rem]",
  "[--scale:calc(max(0,1-(var(--toast-index)*0.1)))]",
  "[--shrink:calc(1-var(--scale))]",
  "[--height:var(--toast-frontmost-height,var(--toast-height))]",
  // Absolute stacking
  "absolute w-full",
  "z-[calc(1000-var(--toast-index))]",
  // Height: match frontmost when collapsed, own height when expanded
  "h-[var(--height)]",
  "data-[expanded]:h-[var(--toast-height)]",
  // Transition
  "[transition:transform_0.5s_cubic-bezier(0.22,1,0.36,1),opacity_0.5s,height_0.15s]",
  "data-[swiping]:[transition:none]",
  // Invisible gap below for hover continuity between stacked toasts
  "after:absolute after:top-full after:left-0 after:h-[calc(var(--gap)+1px)] after:w-full after:content-['']",
  // Expanded: fan out using --offset-y (computed per-position below)
  "data-[expanded]:[transform:translateX(var(--toast-swipe-movement-x))_translateY(var(--offset-y))]",
  // Fade on exit / exceed limit
  "data-[ending-style]:opacity-0",
  "data-[limited]:opacity-0",
  // Swipe exit: down
  "data-[ending-style]:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))]",
  "data-[expanded]:data-[ending-style]:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))]",
  // Swipe exit: up
  "data-[ending-style]:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))]",
  "data-[expanded]:data-[ending-style]:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))]",
  // Swipe exit: left
  "data-[ending-style]:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))]",
  "data-[expanded]:data-[ending-style]:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))]",
  // Swipe exit: right
  "data-[ending-style]:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))]",
  "data-[expanded]:data-[ending-style]:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))]",
];

/** Bottom position: anchor to bottom edge, peek upward. */
const TOAST_BOTTOM_CLASSES = [
  "[--offset-y:calc(var(--toast-offset-y)*-1+calc(var(--toast-index)*var(--gap)*-1)+var(--toast-swipe-movement-y))]",
  "bottom-0 origin-bottom",
  "[transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)-(var(--toast-index)*var(--peek))-(var(--shrink)*var(--height))))_scale(var(--scale))]",
  "data-[starting-style]:[transform:translateY(150%)]",
  "[&[data-ending-style]:not([data-limited]):not([data-swipe-direction])]:[transform:translateY(150%)]",
];

/** Top position: anchor to top edge, peek downward. */
const TOAST_TOP_CLASSES = [
  "[--offset-y:calc(var(--toast-offset-y)+calc(var(--toast-index)*var(--gap))+var(--toast-swipe-movement-y))]",
  "top-0 origin-top",
  "[transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)+(var(--toast-index)*var(--peek))+(var(--shrink)*var(--height))))_scale(var(--scale))]",
  "data-[starting-style]:[transform:translateY(-150%)]",
  "[&[data-ending-style]:not([data-limited]):not([data-swipe-direction])]:[transform:translateY(-150%)]",
];

/** Content classes: height clipping for varying heights + behind/expanded opacity. */
const TOAST_CONTENT_CLASSES = [
  "h-full overflow-hidden",
  "transition-opacity [transition-duration:250ms]",
  "data-[behind]:pointer-events-none data-[behind]:opacity-0",
  "data-[expanded]:pointer-events-auto data-[expanded]:opacity-100",
];

// ---------------------------------------------------------------------------
// ToastList (internal — rendered inside Toast.Provider)
// ---------------------------------------------------------------------------

function ToastList({
  closeButton,
  isTop,
}: {
  closeButton?: boolean;
  isTop: boolean;
}) {
  const { toasts } = Toast.useToastManager();

  return toasts.map((t) => (
    <ToastItem closeButton={closeButton} isTop={isTop} key={t.id} toast={t} />
  ));
}

// ---------------------------------------------------------------------------
// ToastItem (internal)
// ---------------------------------------------------------------------------

function ToastItem({
  toast: t,
  closeButton: globalCloseButton,
  isTop,
}: {
  toast: ReturnType<typeof Toast.useToastManager>["toasts"][number];
  closeButton?: boolean;
  isTop: boolean;
}) {
  const data = (t.data ?? {}) as ToastData;
  const positionClasses = isTop ? TOAST_TOP_CLASSES : TOAST_BOTTOM_CLASSES;

  // ---- Custom render ----
  if (data.render) {
    return (
      <Toast.Root
        className={cn(
          TOAST_STACK_BASE,
          positionClasses,
          "pointer-events-auto select-none bg-clip-padding"
        )}
        swipeDirection={data.dismissible === false ? [] : ["down", "right"]}
        toast={t}
      >
        <Toast.Content className={cn(TOAST_CONTENT_CLASSES)}>
          {data.render(t.id)}
        </Toast.Content>
      </Toast.Root>
    );
  }

  // ---- Standard render ----
  const icon = t.type && t.type !== "default" ? TOAST_ICONS[t.type] : undefined;
  const typeClass = t.type ? TYPE_CLASSES[t.type] : undefined;
  const showCloseButton = data.closeButton ?? globalCloseButton ?? true;
  const isDismissible = data.dismissible !== false;

  return (
    <Toast.Root
      className={cn(
        // Stacking & animation (from Base UI example)
        TOAST_STACK_BASE,
        positionClasses,
        // Layout
        "group/toast pointer-events-auto",
        // Appearance
        "select-none rounded-lg border border-border-muted bg-popover bg-clip-padding text-popover-foreground shadow-lg",
        // Semantic type colors
        typeClass
      )}
      data-slot="toast"
      swipeDirection={isDismissible ? ["down", "right"] : []}
      toast={t}
    >
      <Toast.Content
        className={cn(
          // Stacking: height clipping + behind/expanded opacity
          TOAST_CONTENT_CLASSES,
          "flex w-full gap-2 p-3",
          // Mobile: wrap action buttons below content
          "max-sm:flex-wrap"
        )}
        data-slot="toast-content"
      >
        {icon && (
          <div className="mt-0.5 shrink-0" data-slot="toast-icon">
            {icon}
          </div>
        )}

        <div
          className={cn(
            "flex min-w-0 flex-1 flex-col gap-0.5",
            // Mobile with icon: ensure text block fills the row
            "max-sm:flex-[1_0_calc(100%-2rem)]"
          )}
          data-slot="toast-text"
        >
          {t.title != null && (
            <Toast.Title
              className="font-medium text-sm leading-snug"
              data-slot="toast-title"
            />
          )}
          {t.description != null && (
            <Toast.Description
              className="text-muted-foreground text-xs leading-snug"
              data-slot="toast-description"
            />
          )}
        </div>

        {/* Action buttons */}
        {(t.actionProps || data.cancel) && (
          <div
            className={cn(
              "flex shrink-0 items-center gap-1.5",
              // Mobile: full width row below the text
              "max-sm:mt-1 max-sm:ml-0",
              icon ? "max-sm:ml-6" : undefined
            )}
            data-slot="toast-actions"
          >
            {data.cancel && (
              <button
                className="inline-flex h-7 cursor-pointer items-center justify-center rounded-md px-2.5 font-medium text-muted-foreground text-xs transition-colors hover:bg-accent hover:text-accent-foreground"
                data-slot="toast-cancel"
                onClick={() => {
                  data.cancel?.onClick?.();
                  toastManager.close(t.id);
                }}
                type="button"
              >
                {data.cancel.label}
              </button>
            )}
            {t.actionProps && (
              <Toast.Action
                className="inline-flex h-7 cursor-pointer items-center justify-center rounded-md border border-border bg-background px-2.5 font-medium text-xs transition-colors hover:bg-accent hover:text-accent-foreground"
                data-slot="toast-action"
              />
            )}
          </div>
        )}
      </Toast.Content>

      {/* Close button — round pill at the top-right corner */}
      {showCloseButton && isDismissible && (
        <Toast.Close
          aria-label="Close"
          className={cn(
            // Position: centered on the top-right corner of the toast
            "absolute top-0 right-0 translate-x-1/2 -translate-y-1/2",
            // Size 20×20, circular
            "flex size-5 items-center justify-center rounded-full border border-border p-0 shadow-sm",
            // Colors: subtle background like ghost button
            "bg-background text-muted-foreground",
            "hover:bg-accent hover:text-foreground",
            // Hidden by default, revealed on toast hover
            "opacity-0 group-hover/toast:opacity-100",
            // Also reveal on keyboard focus for a11y
            "focus-visible:opacity-100",
            // Smooth transitions for reveal + hover background
            "cursor-pointer transition-[opacity,background-color,color]",
            // Mobile: always visible (no hover on touch)
            "max-sm:opacity-100"
          )}
          data-slot="toast-close"
        >
          <XIcon className="size-3" />
        </Toast.Close>
      )}
    </Toast.Root>
  );
}

// ---------------------------------------------------------------------------
// Toaster
// ---------------------------------------------------------------------------

export interface ToasterProps {
  /** Additional CSS class for the viewport container */
  className?: string;
  /** Show a close (×) button on every toast. @default true */
  closeButton?: boolean;
  /** Default auto-dismiss timeout in ms. @default 5000 */
  duration?: number;
  /** Maximum number of visible toasts. @default 3 */
  limit?: number;
  /** Where toasts appear on screen. @default "bottom-right" */
  position?: ToastPosition;
}

function Toaster({
  position = "bottom-right",
  duration = 5000,
  limit = 3,
  closeButton = true,
  className,
}: ToasterProps) {
  const isTop = position.startsWith("top");

  return (
    <Toast.Provider
      limit={limit}
      timeout={duration}
      toastManager={toastManager}
    >
      <Toast.Portal>
        <Toast.Viewport
          className={cn(
            "fixed z-[100] m-4 outline-none",
            // Width: fixed on desktop, full on mobile
            "w-(--width) max-sm:right-0 max-sm:left-0 max-sm:mx-2 max-sm:w-auto",
            // Position-specific
            VIEWPORT_POSITION_CLASSES[position],
            className
          )}
          data-position={isTop ? "top" : "bottom"}
          data-slot="toaster"
          style={{ "--width": "356px" } as CSSProperties}
        >
          <ToastList closeButton={closeButton} isTop={isTop} />
        </Toast.Viewport>
      </Toast.Portal>
    </Toast.Provider>
  );
}

Toaster.displayName = "Toaster";

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export { Toaster, toast };
export type { ToastOptions, ToastPosition, ToastAction, ToastData };
