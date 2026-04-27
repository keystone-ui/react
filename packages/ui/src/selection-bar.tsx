"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { X as XIcon } from "lucide-react";
import * as React from "react";

import { Button, type ButtonProps } from "./button";
import { cn } from "./utils";

const EXIT_DURATION_MS = 220;

interface SelectionBarProps extends React.HTMLAttributes<HTMLDivElement> {
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
  const [shouldRender, setShouldRender] = React.useState(open);
  const [isVisible, setIsVisible] = React.useState(open);
  const exitTimeoutRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    if (exitTimeoutRef.current !== null) {
      window.clearTimeout(exitTimeoutRef.current);
      exitTimeoutRef.current = null;
    }

    if (open) {
      const frameId = window.requestAnimationFrame(() => {
        setShouldRender(true);
        setIsVisible(true);
      });
      return () => window.cancelAnimationFrame(frameId);
    }

    setIsVisible(false);
    exitTimeoutRef.current = window.setTimeout(() => {
      setShouldRender(false);
      exitTimeoutRef.current = null;
    }, EXIT_DURATION_MS);

    return () => {
      if (exitTimeoutRef.current !== null) {
        window.clearTimeout(exitTimeoutRef.current);
        exitTimeoutRef.current = null;
      }
    };
  }, [open]);

  if (!shouldRender) {
    return null;
  }

  const inner = (
    <div className={cn(barInnerClass, isVisible ? barVisible : barHidden)}>
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
  "pointer-events-auto flex w-fit max-w-full transform-gpu items-center gap-1 overflow-x-auto rounded-2xl border border-zinc-800/90 bg-zinc-950 px-1.5 py-1.5 text-zinc-100 shadow-xl ring-1 ring-black/20 will-change-[transform,opacity] dark:border-zinc-300/80 dark:bg-zinc-100 dark:text-zinc-900 dark:ring-white/25 transition-[opacity,transform] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none";
const barVisible = "translate-y-0 opacity-100";
const barHidden = "translate-y-3 opacity-0";

function SelectionBarGroup({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
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
}: React.HTMLAttributes<HTMLSpanElement>) {
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
}: React.HTMLAttributes<HTMLSpanElement>) {
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
}: React.HTMLAttributes<HTMLDivElement>) {
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
        success:
          "text-emerald-300 hover:bg-emerald-500/10 hover:text-emerald-200 dark:text-emerald-700 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-800",
        destructive:
          "text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 dark:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-700",
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
}: SelectionBarButtonProps & React.RefAttributes<HTMLButtonElement>) => (
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
