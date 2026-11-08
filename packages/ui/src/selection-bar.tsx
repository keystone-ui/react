"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { X as XIcon } from "lucide-react";
import {
  type HTMLAttributes,
  type RefAttributes,
  type TransitionEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import { Button, type ButtonProps } from "./button";
import { cn } from "./utils";

function clearTimer(ref: { current: number | null }) {
  if (ref.current !== null) {
    window.clearTimeout(ref.current);
    ref.current = null;
  }
}

/** Longest computed transition on the bar, plus a frame of slack. */
function getExitFallbackMs(element: HTMLElement | null): number {
  if (!element) {
    return 0;
  }
  const durations = getComputedStyle(element)
    .transitionDuration.split(",")
    .map(
      (value) =>
        Number.parseFloat(value) * (value.trim().endsWith("ms") ? 1 : 1000)
    )
    .filter((value) => Number.isFinite(value));
  return Math.max(0, ...durations) + 50;
}

interface SelectionBarProps extends HTMLAttributes<HTMLDivElement> {
  /** Whether the bar is visible. Drives the enter/exit animation. */
  open: boolean;
  /** Where the bar is positioned. `fixed` (default) anchors to the viewport bottom; `inline` lets the consumer place it. */
  position?: "fixed" | "inline";
}

function SelectionBar({
  open,
  position = "fixed",
  className,
  children,
  style,
  ...props
}: SelectionBarProps) {
  const [shouldRender, setShouldRender] = useState(open);
  const [isVisible, setIsVisible] = useState(open);
  const innerRef = useRef<HTMLDivElement>(null);
  const exitTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    clearTimer(exitTimeoutRef);

    if (open) {
      // Mount straight into the visible state; `starting:` (@starting-style)
      // supplies the from-values, so no rAF dance is needed.
      setShouldRender(true);
      setIsVisible(true);
      return;
    }

    setIsVisible(false);
    // Unmount on `transitionend`; this timer is the fallback for when no
    // transition runs (reduced motion, display:none ancestors).
    exitTimeoutRef.current = window.setTimeout(() => {
      setShouldRender(false);
      exitTimeoutRef.current = null;
    }, getExitFallbackMs(innerRef.current));

    return () => clearTimer(exitTimeoutRef);
  }, [open]);

  const handleTransitionEnd = (event: TransitionEvent<HTMLDivElement>) => {
    if (
      !open &&
      event.target === event.currentTarget &&
      event.propertyName === "opacity"
    ) {
      clearTimer(exitTimeoutRef);
      setShouldRender(false);
    }
  };

  if (!shouldRender) {
    return null;
  }

  const inner = (
    <div
      className={cn(barInnerClass, isVisible ? barVisible : barHidden)}
      onTransitionEnd={handleTransitionEnd}
      ref={innerRef}
    >
      {children}
    </div>
  );

  if (position === "inline") {
    return (
      <div
        className={cn("flex w-full justify-center", className)}
        data-slot="selection-bar"
        data-state={isVisible ? "open" : "closed"}
        style={style}
        {...props}
      >
        {inner}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "pointer-events-none fixed z-40 flex justify-center px-1 sm:px-2",
        className
      )}
      data-slot="selection-bar"
      data-state={isVisible ? "open" : "closed"}
      style={{
        bottom: "calc(env(safe-area-inset-bottom, 0px) + 1rem)",
        left: 0,
        width: "100%",
        ...style,
      }}
      {...props}
    >
      {inner}
    </div>
  );
}

const barInnerClass =
  "pointer-events-auto flex w-fit max-w-full items-center gap-1 overflow-x-auto overflow-y-hidden rounded-2xl border border-zinc-800/90 bg-zinc-950 px-1.5 py-1.5 text-zinc-100 shadow-xl ring-1 ring-black/20 dark:border-zinc-300/80 dark:bg-zinc-100 dark:text-zinc-900 dark:ring-white/25 transition-[opacity,translate] ease-(--ease-ks-out,cubic-bezier(0.23,1,0.32,1)) motion-reduce:transition-none";
// Enter at --duration-base from the @starting-style values; exit faster.
const barVisible =
  "translate-y-0 opacity-100 duration-(--duration-base,180ms) starting:translate-y-3 starting:opacity-0";
const barHidden = "translate-y-3 opacity-0 duration-(--duration-fast,125ms)";

function SelectionBarGroup({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex h-8 shrink-0 items-center gap-1.5 border-white/10 border-r pr-2 dark:border-black/10",
        className
      )}
      data-slot="selection-bar-group"
      {...props}
    />
  );
}

function SelectionBarLabel({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      aria-live="polite"
      className={cn("font-medium text-xs sm:text-sm", className)}
      data-slot="selection-bar-label"
      {...props}
    />
  );
}

function SelectionBarBullet({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      aria-hidden="true"
      className={cn("text-zinc-500 dark:text-zinc-500", className)}
      data-slot="selection-bar-bullet"
      {...props}
    >
      {children ?? "•"}
    </span>
  );
}

const linkClass =
  "h-7 rounded-md px-2 text-xs font-medium text-inherit underline-offset-4 hover:bg-white/10 hover:text-inherit hover:underline dark:hover:bg-black/8 dark:hover:text-inherit";

function SelectionBarLink({ className, ...props }: ButtonProps) {
  return (
    <Button
      className={cn(linkClass, className)}
      data-slot="selection-bar-link"
      size="sm"
      variant="ghost"
      {...props}
    />
  );
}

function SelectionBarSeparator({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "h-6 w-px shrink-0 bg-white/10 dark:bg-black/10",
        className
      )}
      data-slot="selection-bar-separator"
      {...props}
    />
  );
}

const selectionBarButtonVariants = cva(
  "shrink-0 text-inherit hover:text-inherit dark:hover:text-inherit",
  {
    variants: {
      tone: {
        default:
          "hover:bg-white/10 aria-expanded:bg-white/10 dark:aria-expanded:bg-black/8 dark:hover:bg-black/8",
        // The bar is an inverted surface — dark on a light page, light on a
        // dark one — so a status token tuned for the page reads wrong on it.
        // Mixing it toward --background moves it the right way in both
        // modes: lighter on the dark bar, darker on the light bar. Mixed in
        // oklab, not oklch: white is `oklch(1 0 0)`, hue 0, so an oklch mix
        // drags green's hue toward red and Export renders yellow.
        success:
          "text-[color-mix(in_oklab,var(--success)_70%,var(--background))] hover:bg-success/15 hover:text-[color-mix(in_oklab,var(--success)_55%,var(--background))]",
        destructive:
          "text-[color-mix(in_oklab,var(--destructive)_70%,var(--background))] hover:bg-destructive/15 hover:text-[color-mix(in_oklab,var(--destructive)_55%,var(--background))]",
      },
      shape: {
        text: "h-8 rounded-lg px-2.5 text-[13px]",
        icon: "size-8 rounded-lg",
      },
    },
    defaultVariants: {
      tone: "default",
      shape: "text",
    },
  }
);

type SelectionBarButtonShape = "text" | "icon";
type SelectionBarButtonTone = "default" | "success" | "destructive";

interface SelectionBarButtonProps
  extends Omit<ButtonProps, "size" | "variant">,
    VariantProps<typeof selectionBarButtonVariants> {
  shape?: SelectionBarButtonShape;
  tone?: SelectionBarButtonTone;
}

const SelectionBarButton = ({
  className,
  shape = "text",
  tone = "default",
  ref,
  ...props
}: SelectionBarButtonProps & RefAttributes<HTMLButtonElement>) => (
  <Button
    className={cn(selectionBarButtonVariants({ shape, tone }), className)}
    data-slot="selection-bar-button"
    ref={ref}
    size={shape === "icon" ? "icon-sm" : "sm"}
    variant="ghost"
    {...props}
  />
);

SelectionBarButton.displayName = "SelectionBarButton";

interface SelectionBarCloseProps
  extends Omit<SelectionBarButtonProps, "shape" | "tone" | "children"> {
  "aria-label"?: string;
}

function SelectionBarClose({
  "aria-label": ariaLabel = "Clear selection",
  ...props
}: SelectionBarCloseProps) {
  return (
    <SelectionBarButton
      aria-label={ariaLabel}
      data-slot="selection-bar-close"
      shape="icon"
      {...props}
    >
      <XIcon />
    </SelectionBarButton>
  );
}

export type {
  SelectionBarButtonProps,
  SelectionBarCloseProps,
  SelectionBarProps,
};
export {
  SelectionBar,
  SelectionBarBullet,
  SelectionBarButton,
  SelectionBarClose,
  SelectionBarGroup,
  SelectionBarLabel,
  SelectionBarLink,
  SelectionBarSeparator,
  selectionBarButtonVariants,
};
