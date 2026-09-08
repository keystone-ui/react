"use client";

import { Toast } from "@base-ui/react/toast";
import {
  CircleCheck as CircleCheckIcon,
  Info as InfoIcon,
  LoaderCircle as Loader2Icon,
  OctagonX as OctagonXIcon,
  TriangleAlert as TriangleAlertIcon,
  X as XIcon,
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

/** Behavior options — content lives on {@link ToastInput}. */
interface ToastOptions {
  /** Primary action button */
  action?: ToastAction;
  /** Secondary cancel/dismiss button */
  cancel?: ToastAction;
  /** Show a close button on this specific toast */
  closeButton?: boolean;
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

/** A toast's full payload: content plus behavior. */
interface ToastInput extends ToastOptions {
  /**
   * The toast message. This is the default content field — a bare
   * `toast("message")` fills it, matching Base UI.
   */
  description?: ReactNode;
  /** Emphasized line rendered above the description. Optional. */
  title?: ReactNode;
}

/** A `toast.promise` state: a bare message, or the same input `toast()` takes. */
type ToastPromiseState<T> =
  | ReactNode
  | ToastInput
  | ((arg: T) => ReactNode | ToastInput);

interface ToastPromiseOptions<T> {
  error: ToastPromiseState<Error>;
  loading: ReactNode | ToastInput;
  success: ToastPromiseState<T>;
}

/**
 * Two call forms:
 * - `toast("message")` — the message becomes the **description**, the muted
 *   single line. Base UI's own default-content rule.
 * - `toast({ title, description, ... })` — full control; `title` adds the
 *   emphasized line above.
 */
interface ToastFn {
  (input: ToastInput): string;
  (message: ReactNode, options?: ToastOptions): string;
}

// ---------------------------------------------------------------------------
// Global toast manager
// ---------------------------------------------------------------------------

const toastManager = Toast.createToastManager();

// ---------------------------------------------------------------------------
// Imperative toast API
// ---------------------------------------------------------------------------

const WHITESPACE_RE = /\s+/;

function nodeToText(n: ReactNode): string {
  if (typeof n === "string") {
    return n;
  }
  if (typeof n === "number") {
    return String(n);
  }
  return "";
}

/**
 * Content-length-aware timeout used when **updating** an existing toast (a new
 * toast takes the `Toaster`'s flat `duration`). A three-word toast dismisses
 * faster than a forty-word one: reading speed ≈ 250 WPM (~240 ms/word) plus a
 * grace window, clamped to [3000ms, 10000ms]. Explicit `duration` always wins.
 * Non-text nodes count as zero words, so an element-only toast lands on MIN.
 */
function readingTimeMs(nodes: ReactNode[]): number {
  const text = nodes.map(nodeToText).join(" ");
  const words = text.trim().split(WHITESPACE_RE).filter(Boolean).length;
  const MIN = 3000;
  const MAX = 10_000;
  const GRACE = 2000;
  const MS_PER_WORD = 240;
  return Math.min(MAX, Math.max(MIN, GRACE + words * MS_PER_WORD));
}

/**
 * Build the Base UI toast payload from our vocabulary (`duration` → `timeout`,
 * `action` → `actionProps`, `cancel`/`dismissible`/`closeButton` → `data`).
 */
function toPayload(input: ToastInput, type?: string) {
  const {
    id,
    title,
    description,
    duration,
    action,
    cancel,
    dismissible = true,
    closeButton,
    onAutoClose,
    onDismiss,
  } = input;

  // Resolve timeout: loading toasts don't auto-dismiss by default.
  // When updating an existing toast (id provided), reset to a content-aware
  // timeout unless the caller set an explicit duration.
  let resolvedTimeout: number | undefined;
  if (duration === Number.POSITIVE_INFINITY) {
    resolvedTimeout = 0;
  } else if (duration != null) {
    resolvedTimeout = duration;
  } else if (type === "loading") {
    resolvedTimeout = 0;
  } else if (id != null) {
    resolvedTimeout = readingTimeMs([title, description]);
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

  return payload;
}

function createToast(input: ToastInput, type?: string): string {
  const payload = toPayload(input, type);

  if (input.id) {
    toastManager.update(input.id, payload);
    return input.id;
  }

  return toastManager.add(payload);
}

// --- Main callable + attached methods ---

/**
 * Distinguishes `toast({ ... })` from `toast(message)`. Most `ReactNode`s are
 * objects too, so each kind has to be excluded explicitly: elements, portals
 * and other `$$typeof`-tagged nodes, iterables (arrays included), and
 * thenables (`Promise<ReactNode>`). Anything left is treated as our options
 * bag — which also means a typo'd key surfaces as a type error rather than
 * React's "Objects are not valid as a React child".
 *
 * Note: this relies on `ToastInput` sharing no keys with `ReactElement`
 * (`type`/`props`/`key`) — adding such a field would break overload
 * resolution for `toast(<El />)`.
 */
function isToastInput(value: unknown): value is ToastInput {
  return (
    typeof value === "object" &&
    value !== null &&
    !isValidElement(value) &&
    !("$$typeof" in value) &&
    !(Symbol.iterator in value) &&
    typeof (value as { then?: unknown }).then !== "function"
  );
}

function createToastFn(type?: string): ToastFn {
  return ((
    messageOrInput: ReactNode | ToastInput,
    options?: ToastOptions
  ): string =>
    createToast(
      isToastInput(messageOrInput)
        ? messageOrInput
        : { ...options, description: messageOrInput },
      type
    )) as ToastFn;
}

/**
 * Create a toast that tracks a promise through loading → success / error.
 *
 * Each state accepts whatever `toast()` accepts: a bare message becomes the
 * **description**, or pass `{ title, description, action, ... }` for the full
 * shape. States are normalized here rather than handed to Base UI raw, so our
 * vocabulary (`duration`, `action`, `cancel`) works the same as everywhere
 * else — and non-string nodes (`<Spinner />`) resolve correctly.
 *
 * `type` is not passed: Base UI overrides it per state
 * (`loading` → `success`/`error`) after spreading what we return.
 */
function resolvePromiseState(state: ReactNode | ToastInput) {
  return toPayload(isToastInput(state) ? state : { description: state });
}

function mapPromiseState<A>(state: ToastPromiseState<A>) {
  if (typeof state === "function") {
    return (arg: A) =>
      resolvePromiseState((state as (a: A) => ReactNode | ToastInput)(arg));
  }
  return resolvePromiseState(state);
}

function promise<T>(
  value: Promise<T>,
  options: ToastPromiseOptions<T>
): Promise<T> {
  return toastManager.promise(value, {
    error: mapPromiseState(options.error),
    loading: resolvePromiseState(options.loading),
    success: mapPromiseState(options.success),
  } as Parameters<typeof toastManager.promise>[1]);
}

/**
 * Close and remove a toast by its ID. Called bare, closes every toast and
 * clears their timers (Base UI's `close(id?)`).
 */
function dismiss(id?: string): void {
  toastManager.close(id);
}

/** Create a fully custom toast with arbitrary JSX. */
function custom(
  render: (id: string) => ReactNode,
  options?: Pick<ToastOptions, "id" | "duration" | "dismissible">
): string {
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
}

/**
 * Imperative toast API — `toast("message")` for a single muted line, or
 * `toast({ title, description })` to add the emphasized line above it.
 */
const toast = Object.assign(createToastFn(), {
  custom,
  dismiss,
  error: createToastFn("error"),
  info: createToastFn("info"),
  loading: createToastFn("loading"),
  promise,
  success: createToastFn("success"),
  warning: createToastFn("warning"),
});

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
// Semantic color classes (icon only — the title stays neutral)
// ---------------------------------------------------------------------------

const TYPE_CLASSES: Record<string, string> = {
  success:
    "[&_[data-slot=toast-icon]]:text-green-600 dark:[&_[data-slot=toast-icon]]:text-green-500",
  error:
    "[&_[data-slot=toast-icon]]:text-red-600 dark:[&_[data-slot=toast-icon]]:text-red-500",
  warning:
    "[&_[data-slot=toast-icon]]:text-yellow-600 dark:[&_[data-slot=toast-icon]]:text-yellow-500",
  info: "[&_[data-slot=toast-icon]]:text-blue-600 dark:[&_[data-slot=toast-icon]]:text-blue-500",
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
  // Base UI renders the root as role="dialog"/"alertdialog" and names it via
  // `aria-labelledby` -> the title. A description-only toast registers no
  // title, so name it from the description text instead.
  const ariaLabel =
    t.title == null ? nodeToText(t.description) || undefined : undefined;
  const isDismissible = data.dismissible !== false;

  return (
    <Toast.Root
      className={cn(
        // Stacking & animation (from Base UI example)
        TOAST_STACK_BASE,
        positionClasses,
        // Layout
        "pointer-events-auto",
        // Appearance
        "select-none rounded-lg border border-border-muted bg-popover bg-clip-padding text-popover-foreground shadow-lg",
        // Semantic type colors
        typeClass
      )}
      aria-label={ariaLabel}
      data-slot="toast"
      swipeDirection={isDismissible ? ["down", "right"] : []}
      toast={t}
    >
      <Toast.Content
        className={cn(
          // Stacking: height clipping + behind/expanded opacity
          TOAST_CONTENT_CLASSES,
          "flex w-full items-center gap-2 p-3"
        )}
        data-slot="toast-content"
      >
        {icon && (
          <div className="shrink-0" data-slot="toast-icon">
            {icon}
          </div>
        )}

        <div
          className="flex min-w-0 flex-1 flex-col gap-0.5"
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
              className="text-muted-foreground text-sm leading-snug"
              data-slot="toast-description"
            />
          )}
        </div>

        {/* Action buttons */}
        {(t.actionProps || data.cancel) && (
          <div
            className="flex shrink-0 items-center gap-1.5"
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

        {/* Close button — inline at the end of the content row */}
        {showCloseButton && isDismissible && (
          <Toast.Close
            aria-label="Close"
            className={cn(
              // Inline at the end of the row, vertically centered
              "relative shrink-0 self-center",
              // 28×28 ghost icon button
              "inline-flex size-7 cursor-pointer items-center justify-center rounded-md p-0",
              "text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
              // 44px tap target via invisible pseudo (28 + 2×8). `after:` is free
              // here — the root's `after:` hover strip is a different element.
              "after:absolute after:-inset-2 after:content-['']",
              // Focus ring matching Button
              "outline-none focus-visible:outline-2 focus-visible:outline-ring/50 focus-visible:outline-offset-2"
            )}
            data-slot="toast-close"
          >
            <XIcon className="size-4" />
          </Toast.Close>
        )}
      </Toast.Content>
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
            "fixed z-[var(--z-toast)] m-4 outline-none",
            // Width: fixed on desktop, full on mobile
            "w-(--width) max-sm:right-0 max-sm:left-0 max-sm:mx-2 max-sm:w-auto",
            // Respect device safe areas (notch, home bar)
            "pt-[env(safe-area-inset-top)] pr-[env(safe-area-inset-right)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)]",
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

export type {
  ToastAction,
  ToastData,
  ToastInput,
  ToastOptions,
  ToastPosition,
  ToastPromiseOptions,
};
export { Toaster, toast };
