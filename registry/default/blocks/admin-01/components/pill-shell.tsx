"use client";

import { XIcon } from "lucide-react";
import type { KeyboardEvent, ReactNode } from "react";
import { useRef, useSyncExternalStore } from "react";
import { X_SWAP } from "@/components/filter-trigger";
import { cn } from "@/lib/utils";

export interface ShellControls {
  /** Backspace / Delete on the trigger removes the filter. */
  keyDown: (event: KeyboardEvent<HTMLElement>) => void;
  remove: () => void;
}

/**
 * Wraps a pill's trigger with the X that swaps in for its chevron.
 *
 * The X is the trigger's sibling, not its child: a button inside a button is
 * invalid HTML and leaves the inner one unreachable to assistive tech. It sits
 * absolutely over the chevron's 16px slot — `end-3` is the `sm` button's `px-3`
 * — so showing it changes nothing about the pill's width.
 *
 * It is out of the tab order. Keyboard users have Backspace on the trigger,
 * which is announced through `aria-keyshortcuts`; one stop per pill keeps
 * tabbing along a row of eight pills at eight stops rather than sixteen.
 *
 * Every pill has one, the starting pair included, so the X means the same
 * thing wherever it appears. The label says which filter, "Remove Provider
 * filter", for the same reason the row actions do.
 */
export function PillShell({
  children,
  label,
  onRemove,
}: {
  children: (controls: ShellControls) => ReactNode;
  /** The filter's dimension, for the X's accessible name. */
  label: string;
  /** Handed the pill's trigger, so focus can move before it unmounts. */
  onRemove: (trigger: HTMLElement | null) => void;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const remove = () =>
    onRemove(
      ref.current?.querySelector<HTMLElement>("[data-filter-pill]") ?? null
    );
  const keyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (
      (event.key === "Backspace" || event.key === "Delete") &&
      !event.defaultPrevented &&
      event.currentTarget.getAttribute("aria-expanded") !== "true"
    ) {
      event.preventDefault();
      remove();
    }
  };

  return (
    <span className="group/pill relative inline-flex" ref={ref}>
      {children({ keyDown, remove })}
      <button
        aria-label={`Remove ${label} filter`}
        className={cn(
          "absolute end-3 top-1/2 z-10 grid size-4 -translate-y-1/2 cursor-pointer place-items-center rounded-sm text-muted-foreground before:absolute before:-inset-1 hover:bg-foreground/10 hover:text-foreground",
          X_SWAP
        )}
        data-filter-remove=""
        onClick={remove}
        tabIndex={-1}
        type="button"
      >
        <XIcon className="size-3.5" />
      </button>
    </span>
  );
}

/**
 * The pill's value, in its own slot so the set and unset cases are the same
 * element rather than a span and a bare text node — which is what lets a test
 * compare their colours at all.
 */
export function PillValue({
  empty,
  value,
}: {
  empty: string;
  value: string | null;
}) {
  return (
    <span
      className={value === null ? "font-normal text-muted-foreground" : ""}
      data-pill-value=""
    >
      {value ?? empty}
    </span>
  );
}

const HOVERLESS = "(hover: none)";

/**
 * Whether the device has no hover, and so never sees the X swap.
 *
 * Local to the block rather than `@keystoneui/react/hooks`: blocks install as
 * copies, and that subpath has no registry item to land at. The usual objection
 * to a media-query hook — it has to guess on the server and flip after
 * hydration — does not bite here, because its only callers render inside a
 * popup, which mounts on open, long after hydration.
 */
export function useHoverless(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const query = matchMedia(HOVERLESS);
      query.addEventListener("change", onChange);
      return () => query.removeEventListener("change", onChange);
    },
    () => matchMedia(HOVERLESS).matches,
    () => false
  );
}
