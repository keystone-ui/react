"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  type MouseEvent,
  type ReactElement,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { Button } from "./button";
import { cn } from "./utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * When the arrows show. `pointer`: only on a device with a mouse or trackpad
 * (`hover: hover` and `pointer: fine`); a touch screen swipes and the fade is
 * its cue. `always`: on every device. `none`: never.
 */
type ReelArrows = "pointer" | "always" | "none";

/**
 * The whole public API: when the arrows show, a class for the root, and the
 * row. Semantics (a `nav` and its label, the list, the current item) stay
 * with the row and its container.
 */
interface ReelProps {
  /**
   * When the scroll arrows show. An arrow only ever appears at an end with
   * more content beyond it; it is never a Tab stop and is hidden from
   * assistive technology.
   * @default "pointer"
   */
  arrows?: ReelArrows;
  /** Exactly one child: the row to scroll (a list of links, FilterChips…). */
  children: ReactElement;
  /** Classes for the root, which is `position: relative`. */
  className?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * The row's current item: a link with a meaningful `aria-current` (not empty,
 * not "false" in any case) or a selected chip (`data-selected` with any value
 * but "false", which React renders for `data-selected={false}`).
 */
const CURRENT_ITEM =
  '[aria-current]:not([aria-current=""], [aria-current="false" i]), [data-selected]:not([data-selected="false" i])';

/**
 * A press on an arrow must not take focus: the arrow is hidden from
 * assistive technology, so focus on it would be focus nowhere.
 */
function keepFocus(event: { preventDefault: () => void }) {
  event.preventDefault();
}

/** How much of the visible width one arrow press scrolls. */
const PAGE_FRACTION = 0.8;

function scrollBehavior(): ScrollBehavior {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? "instant"
    : "smooth";
}

/**
 * Scroll the viewport sideways just enough that `item` clears the viewport's
 * inline scroll padding, which the Reel sets to the fade's rendered depth (and
 * at least 48px), so neither the fade nor an arrow covers it. An item too wide
 * for both margins is aligned by its start edge, with the inset capped to the
 * room it leaves. The distance is limited to the scroll range, and under half
 * a pixel nothing is requested at all, so a clear item, or one at the very
 * end of the row, leaves any scroll in progress alone. Horizontal only, on the
 * viewport only: unlike `scrollIntoView`, it never scrolls the page.
 */
function revealInline(
  viewport: HTMLElement,
  item: HTMLElement,
  behavior: ScrollBehavior
) {
  const style = getComputedStyle(viewport);
  const rtl = style.direction === "rtl";
  const startInset = Number.parseFloat(style.scrollPaddingInlineStart) || 0;
  const endInset = Number.parseFloat(style.scrollPaddingInlineEnd) || 0;
  const left = rtl ? endInset : startInset;
  const right = rtl ? startInset : endInset;
  const v = viewport.getBoundingClientRect();
  const a = item.getBoundingClientRect();
  let delta = 0;
  if (a.width > v.width - left - right) {
    const inset = Math.min(startInset, Math.max(0, v.width - a.width));
    delta = rtl ? a.right - (v.right - inset) : a.left - (v.left + inset);
  } else if (a.left < v.left + left) {
    delta = a.left - v.left - left;
  } else if (a.right > v.right - right) {
    delta = a.right - v.right + right;
  }
  // scrollLeft runs from 0 to the range, or from 0 down to minus the range
  // when the direction is rtl.
  const range = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
  const [min, max] = rtl ? [-range, 0] : [0, range];
  const from = viewport.scrollLeft;
  const limited = Math.min(max, Math.max(min, from + delta)) - from;
  if (Math.abs(limited) >= 0.5) {
    viewport.scrollBy({ left: limited, behavior });
  }
}

/**
 * The viewport's room: its content width, without its own padding. A Reel
 * squeezed to nothing still has the padding's width.
 */
function hasRoom(viewport: HTMLElement) {
  const style = getComputedStyle(viewport);
  return (
    viewport.clientWidth -
      (Number.parseFloat(style.paddingLeft) || 0) -
      (Number.parseFloat(style.paddingRight) || 0) >
    0
  );
}

// ---------------------------------------------------------------------------
// Reel
// ---------------------------------------------------------------------------

const ARROW_GATE: Record<ReelArrows, string> = {
  pointer: "hidden [@media(hover:hover)_and_(pointer:fine)]:inline-flex",
  always: "inline-flex",
  none: "hidden",
};

/**
 * The fade under an arrow is deeper (3rem) so the arrow sits on faded
 * content; without arrows it is the utility's own 1.5rem.
 */
const FADE_SIZE: Record<ReelArrows, string> = {
  pointer:
    "[--ks-scroll-fade-size:1.5rem] [@media(hover:hover)_and_(pointer:fine)]:[--ks-scroll-fade-size:3rem]",
  always: "[--ks-scroll-fade-size:3rem]",
  none: "[--ks-scroll-fade-size:1.5rem]",
};

function Reel({ arrows = "pointer", children, className }: ReelProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [overflow, setOverflow] = useState({ start: false, end: false });

  // Which ends have more content beyond them: on scroll, and whenever the
  // viewport or the row changes size.
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }
    const update = () => {
      const max = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
      // scrollLeft runs negative from the start when the direction is rtl.
      // Clamped into the range: an elastic bounce past either end must not
      // advertise an edge that is not there.
      const rtl = getComputedStyle(viewport).direction === "rtl";
      const offset = rtl ? -viewport.scrollLeft : viewport.scrollLeft;
      const position = Math.min(max, Math.max(0, offset));
      const start = position > 1;
      const end = position < max - 1;
      setOverflow((prev) =>
        prev.start === start && prev.end === end ? prev : { start, end }
      );
    };
    update();
    viewport.addEventListener("scroll", update, { passive: true });
    const resize = new ResizeObserver(update);
    resize.observe(viewport);
    // The row is observed too, and followed when it is replaced: a skeleton
    // swapped for the real list must not leave the old element observed.
    let row: Element | null = null;
    const followRow = () => {
      const next = viewport.firstElementChild;
      if (next !== row) {
        if (row) {
          resize.unobserve(row);
        }
        row = next;
        if (row) {
          resize.observe(row);
        }
      }
    };
    followRow();
    // Items added, removed or relabelled can change the overflow without
    // changing the row's own box (a fixed-width row, say).
    const structure = new MutationObserver(() => {
      followRow();
      update();
    });
    structure.observe(viewport, {
      characterData: true,
      childList: true,
      subtree: true,
    });
    return () => {
      viewport.removeEventListener("scroll", update);
      resize.disconnect();
      structure.disconnect();
    };
  }, []);

  // The current item is revealed when the Reel comes to have room (at mount,
  // or shown or widened from none) and whenever a different item becomes
  // current; a keyboard-focused item is moved clear of the fade. Neither
  // moves focus or scrolls the page.
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }
    // The item matched at the last evaluation, whether the first reveal
    // (instant) is still owed, and whether the viewport had room at the last
    // size check. A match without measurable width is remembered. Gaining
    // room reevaluates the current match. Each marker delivery evaluates its
    // current match if it differs from the remembered match, including after
    // an empty delivery.
    let match: HTMLElement | null = null;
    let firstOwed = true;
    let room = false;
    const evaluate = (next: HTMLElement | null, instant: boolean) => {
      match = next;
      if (!(next && room) || next.getBoundingClientRect().width <= 0) {
        return;
      }
      revealInline(
        viewport,
        next,
        instant || firstOwed ? "instant" : scrollBehavior()
      );
      firstOwed = false;
    };
    // A current item marked, unmarked, inserted already marked, or arriving
    // in a replaced row: the final DOM, once per delivery.
    const markers = new MutationObserver(() => {
      const next = viewport.querySelector<HTMLElement>(CURRENT_ITEM);
      if (next !== match) {
        evaluate(next, false);
      }
    });
    markers.observe(viewport, {
      attributeFilter: ["aria-current", "data-selected"],
      childList: true,
      subtree: true,
    });
    // The change from no room to room: shown after being hidden, or widened
    // from nothing. The match in the DOM then is evaluated again, instantly.
    const size = new ResizeObserver(() => {
      const had = room;
      room = hasRoom(viewport);
      if (room && !had) {
        evaluate(viewport.querySelector<HTMLElement>(CURRENT_ITEM), true);
      }
    });
    size.observe(viewport);
    room = hasRoom(viewport);
    if (room) {
      evaluate(viewport.querySelector<HTMLElement>(CURRENT_ITEM), true);
    }
    // The browser only scrolls a focused item that is entirely hidden; one
    // half under the fade or an arrow stays there. Keyboard focus only: a
    // pointer press focuses too, and moving the item under the pointer
    // mid-click could lose the click.
    const onFocusIn = (event: FocusEvent) => {
      const target = event.target as HTMLElement;
      if (target !== viewport && target.matches(":focus-visible")) {
        revealInline(viewport, target, "instant");
      }
    };
    viewport.addEventListener("focusin", onFocusIn);
    return () => {
      markers.disconnect();
      size.disconnect();
      match = null;
      viewport.removeEventListener("focusin", onFocusIn);
    };
  }, []);

  // Pages towards the arrow's own side, in the reading direction.
  const onArrowClick = useCallback((event: MouseEvent<HTMLElement>) => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }
    const direction = event.currentTarget.dataset.side === "start" ? -1 : 1;
    const rtl = getComputedStyle(viewport).direction === "rtl";
    viewport.scrollBy({
      left:
        (rtl ? -direction : direction) * viewport.clientWidth * PAGE_FRACTION,
      behavior: scrollBehavior(),
    });
  }, []);

  return (
    <div
      className={cn("relative", className)}
      data-arrows={arrows}
      data-slot="reel"
    >
      <div
        className={cn(
          "ks-scroll-fade-x overflow-x-auto overscroll-x-contain p-[4px] [scroll-padding-inline:max(48px,var(--ks-scroll-fade-size,1.5rem))] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          FADE_SIZE[arrows]
        )}
        data-slot="reel-viewport"
        ref={viewportRef}
      >
        {children}
      </div>
      {(["start", "end"] as const).map((side) => (
        // The hit area: a plain span, so no arrow can take focus, not even by
        // script. It carries the press, the position and the visibility gate;
        // the button inside is only the picture of one.
        <span
          aria-hidden="true"
          className={cn(
            "group/reel-arrow absolute inset-y-0 my-auto h-fit cursor-pointer touch-manipulation select-none rounded-full transition-[opacity,visibility] duration-(--duration-fast,125ms) ease-(--ease-ks-out,cubic-bezier(0.23,1,0.32,1)) [-webkit-tap-highlight-color:transparent]",
            side === "start" ? "start-0" : "end-0",
            ARROW_GATE[arrows],
            !overflow[side] && "invisible opacity-0"
          )}
          data-side={side}
          key={side}
          onClick={onArrowClick}
          onMouseDown={keepFocus}
        >
          <Button
            className={
              // The arrow sits on the faded end of the row, so its fill must
              // be opaque: the outline variant's dark fills are translucent.
              // Hover and press come from the hit area around it.
              "pointer-events-none rounded-full group-hover/reel-arrow:bg-accent group-hover/reel-arrow:text-foreground group-active/reel-arrow:scale-[0.98] group-active/reel-arrow:bg-accent group-active/reel-arrow:text-foreground dark:bg-background dark:group-active/reel-arrow:bg-accent dark:group-hover/reel-arrow:bg-accent [&_svg]:[scale:var(--ks-reel-chevron-x,1)_1]"
            }
            data-side={side}
            data-slot="reel-arrow"
            inert
            size="icon-sm"
            tabIndex={-1}
            variant="outline"
          >
            {side === "start" ? <ChevronLeft /> : <ChevronRight />}
          </Button>
        </span>
      ))}
    </div>
  );
}

export type { ReelProps };
export { Reel };
