"use client";

import { useDirection } from "@base-ui/react/direction-provider";
import { Radio as RadioPrimitive } from "@base-ui/react/radio";
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group";
import { cva } from "class-variance-authority";
import type * as React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { flushSync } from "react-dom";

import { cn } from "./utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type FilterChipsSize = "sm" | "default" | "lg";

/** State passed to a function `className` or `render` on `FilterChips`. */
interface FilterChipsState {
  disabled: boolean;
  size: FilterChipsSize;
}

/** State passed to a function `className` or `render` on `FilterChip`. */
interface FilterChipState {
  /** The chip cannot be chosen: row disabled, chip disabled, or empty. */
  disabled: boolean;
  /** The chip's count is 0. */
  empty: boolean;
  /** The chip's value is the row's value. */
  selected: boolean;
  size: FilterChipsSize;
}

/** The details object passed to `onValueChange`. Base UI's own. */
type FilterChipsChangeEventDetails = RadioGroupPrimitive.ChangeEventDetails;

type RenderProp<State> =
  | React.ReactElement
  | ((
      props: React.HTMLAttributes<HTMLElement> & {
        ref?: React.Ref<HTMLElement>;
      },
      state: State
    ) => React.ReactElement);

interface FilterChipsProps
  extends Omit<
    RadioGroupPrimitive.Props,
    | "className"
    | "defaultValue"
    | "disabled"
    | "form"
    | "inputRef"
    | "name"
    | "onValueChange"
    | "readOnly"
    | "ref"
    | "render"
    | "required"
    | "style"
    | "value"
  > {
  className?: string | ((state: FilterChipsState) => string | undefined);
  /** The initially selected chip's value; `null` selects none. */
  defaultValue?: string | null;
  /** Disables every chip. */
  disabled?: boolean;
  /**
   * Disable unselected chips whose count is 0.
   * @default true
   */
  disableEmpty?: boolean;
  /** Formats every chip's count. Must give the same text on server and client. */
  formatCount?: (count: number) => string;
  /** Called when the user picks a chip. */
  onValueChange?: (
    value: string,
    details: FilterChipsChangeEventDetails
  ) => void;
  ref?: React.Ref<HTMLDivElement>;
  render?: RenderProp<FilterChipsState>;
  /**
   * The size of every chip.
   * @default "default"
   */
  size?: FilterChipsSize;
  style?: React.CSSProperties;
  /** The selected chip's value; `null` selects none. Controlled. */
  value?: string | null;
}

interface FilterChipProps
  extends Omit<
    RadioPrimitive.Root.Props,
    | "children"
    | "className"
    | "disabled"
    | "inputRef"
    | "nativeButton"
    | "readOnly"
    | "ref"
    | "render"
    | "required"
    | "style"
    | "tabIndex"
    | "value"
  > {
  /** The label. */
  children?: React.ReactNode;
  className?: string | ((state: FilterChipState) => string | undefined);
  /** A non-negative integer drawn in a pill after the label. */
  count?: number;
  /** Disables this chip. */
  disabled?: boolean;
  ref?: React.Ref<HTMLSpanElement>;
  render?: RenderProp<FilterChipState>;
  style?: React.CSSProperties;
  /** The chip's value. Unique within its row. */
  value: string;
}

// ---------------------------------------------------------------------------
// Variants
// ---------------------------------------------------------------------------

// Colour only, no movement: background, border and text ease together, and
// the pill uses the same timing so it recolours in step with its chip. The
// chip also eases its shadow, which selection removes; the pill has none.
const TIMING =
  "duration-(--duration-base,180ms) ease-(--ease-ks-in-out,cubic-bezier(0.77,0,0.175,1))";
const CHIP_MOTION = cn(
  "transition-[color,background-color,border-color,box-shadow]",
  TIMING
);
const PILL_MOTION = cn(
  "transition-[color,background-color,border-color]",
  TIMING
);

// Idle, selected and hover are chosen from the chip's state rather than
// declared side by side as variants: a selected chip then carries no hover or
// dark-mode idle rule that could out-rank its fill, and a disabled chip carries
// no hover fill at all. A press changes nothing but colour.
const filterChipVariants = cva(
  cn(
    "group/filter-chip inline-flex shrink-0 cursor-pointer touch-manipulation select-none items-center gap-1.5 whitespace-nowrap rounded-full border font-medium [-webkit-tap-highlight-color:transparent]",
    CHIP_MOTION,
    "focus-visible:outline-2 focus-visible:outline-ring/50 focus-visible:outline-offset-2",
    "disabled:cursor-not-allowed disabled:opacity-50 data-disabled:cursor-not-allowed data-disabled:opacity-50",
    "[&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0"
  ),
  {
    variants: {
      size: {
        sm: "h-(--ks-control-xs,1.5rem) ps-3 text-xs",
        default: "h-(--ks-control-sm,2rem) ps-3.5 text-sm",
        lg: "h-(--ks-control-md,2.5rem) ps-4 text-sm",
      },
      // End padding: tight when the pill sits at the end, else the start's.
      end: { count: "pe-1.5", sm: "pe-3", default: "pe-3.5", lg: "pe-4" },
      look: {
        // The outline button's surface, its hairline shadow included: kept
        // when hovered or disabled, in both themes, as the button keeps it.
        idle: "border-input bg-background text-foreground shadow-xs dark:bg-input-bg",
        // Forced colours replace both the fill and the border, which would
        // leave the selected chip looking idle: paint it with the system
        // highlight pair instead. System colours survive forcing, so the
        // adjustment stays on for the pill and the focus outline.
        selected:
          "border-primary bg-primary text-primary-foreground forced-colors:border-[Highlight] forced-colors:bg-[Highlight] forced-colors:text-[HighlightText]",
      },
      interactive: {
        true: "",
        false: "",
      },
    },
    compoundVariants: [
      {
        look: "idle",
        interactive: true,
        className:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-input/50",
      },
    ],
  }
);

const filterChipCountVariants = cva(
  cn(
    "inline-flex items-center justify-center rounded-full font-medium font-mono tabular-nums",
    PILL_MOTION
  ),
  {
    variants: {
      size: {
        sm: "h-4 min-w-4 px-1 text-[10px]",
        default: "h-5 min-w-5 px-1.5 text-xs",
        lg: "h-5 min-w-5 px-1.5 text-xs",
      },
      // One rule in every state: the pill is a faint tint of the chip's own
      // text colour laid over whatever the chip's fill is, so it darkens a
      // light chip and lightens a dark one, idle, hovered or disabled, on
      // any surface. The selected pill is the same rule with the selected
      // text colour, at a weaker 10%: on the solid fill a stronger tint
      // reads as a hard gray patch.
      look: {
        idle: "bg-foreground/8 text-foreground",
        selected:
          "bg-primary-foreground/10 text-primary-foreground forced-colors:bg-transparent forced-colors:text-[HighlightText]",
      },
    },
  }
);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// Bundlers replace `process.env.NODE_ENV`; the package ships no Node types,
// so declare the one field read here.
declare const process: { env: { NODE_ENV?: string } };
const DEV = process.env.NODE_ENV !== "production";

/** A count the pill can show: a safe, non-negative integer. */
function isValidCount(count: unknown): count is number {
  return typeof count === "number" && Number.isSafeInteger(count) && count >= 0;
}

/**
 * Props the primitives accept that are not part of this component's contract. The types
 * leave them out; this drops them at run time too, for untyped callers.
 */
const ROW_DROPPED = ["form", "inputRef", "name", "readOnly", "required"];
const CHIP_DROPPED = [
  "inputRef",
  "nativeButton",
  "readOnly",
  "required",
  // The row owns every chip's tab stop.
  "tabIndex",
];

function without<T extends object>(props: T, keys: string[]): T {
  const kept = { ...props } as Record<string, unknown>;
  for (const key of keys) {
    delete kept[key];
  }
  return kept as T;
}

function chain<E>(
  ...handlers: Array<((event: E) => void) | undefined>
): (event: E) => void {
  return (event) => {
    for (const handler of handlers) {
      handler?.(event);
    }
  };
}

/** Maps a Base UI `className` / `render` to one that receives our state. */
function mapClassName<State>(
  base: string,
  className: string | ((state: State) => string | undefined) | undefined,
  state: State
): string {
  return cn(
    base,
    typeof className === "function" ? className(state) : className
  );
}

/** Attaches a consumer's ref and returns how to detach it (React 19 cleanup). */
function attachRef<T>(ref: React.Ref<T> | undefined, node: T): () => void {
  if (typeof ref === "function") {
    const cleanup = ref(node);
    return typeof cleanup === "function" ? cleanup : () => ref(null);
  }
  if (ref) {
    ref.current = node;
    return () => {
      ref.current = null;
    };
  }
  return () => undefined;
}

function mapRender<State>(
  render: RenderProp<State> | undefined,
  state: State
): React.ReactElement | ((props: object) => React.ReactElement) | undefined {
  if (typeof render !== "function") {
    return render;
  }
  return (props: object) =>
    render(props as React.HTMLAttributes<HTMLElement>, state);
}

// ---------------------------------------------------------------------------
// Focus adapter
// ---------------------------------------------------------------------------

// The row keeps no copy of its chips: which chips it has, their order,
// element, selection and availability are read from the DOM when needed.
// It owns three things:
//
// 1. Arrow keys. The row handles every arrow itself and stops Base UI's
//    composite from acting on it. It reads the row's own chips at that
//    moment, finds the destination once, and focuses it under a permission
//    that names that one element and lasts for that one synchronous focus
//    call. Only when that exact element took that focus does the arrow
//    select it, by clicking the chip's own radio input, so Base UI still
//    reports the change, its details and its cancellation. Every chip
//    focus prevents Base UI's selection on focus, so nothing else selects.
// 2. The Tab stop while focus is outside the row: the selected available
//    chip, else the first available one. It is the only fact kept ahead
//    of time. Observers on the row refresh it after a change to the row's
//    children or to the attributes listed in OBSERVED_ATTRIBUTES, and a
//    Tab key pressed while focus is outside the row recomputes it before
//    the browser moves focus, which covers stylesheet and media changes.
// 3. Recovery. When the chip that had focus leaves the document or is
//    hidden, the browser drops focus to the document; the row then focuses
//    that chip again if it is still there, else the Tab stop, and selects
//    nothing. A deliberate exit, or focus going anywhere else, retires the
//    record, so a later change never pulls focus back.
//
// A chip belongs to the row when its nearest `filter-chips` ancestor is the
// row: chips of a nested row are not this row's. Chips must be ordinary
// descendants of the row's element (not portalled, not in a shadow root).

const ROW_SELECTOR = '[data-slot="filter-chips"]';
const CHIP_SELECTOR = '[data-slot="filter-chip"]';
const IGNORED_MODIFIERS = ["Control", "Alt", "Meta"] as const;
const OBSERVED_ATTRIBUTES = [
  "data-selected",
  "data-disabled",
  "hidden",
  "inert",
  "class",
  "style",
  "value",
];

/** Whether `node` is one of `root`'s own chips. */
function isOwned(root: Element, node: unknown): node is HTMLElement {
  const el = node as Element | null;
  return (
    !!el &&
    typeof el.matches === "function" &&
    el.matches(CHIP_SELECTOR) &&
    el.closest(ROW_SELECTOR) === root
  );
}

/** The row's own chips, in document order. */
function ownedChips(root: Element): HTMLElement[] {
  return [...root.querySelectorAll<HTMLElement>(CHIP_SELECTOR)].filter(
    (el) => el.closest(ROW_SELECTOR) === root
  );
}

/** Whether the browser can focus this chip: Base UI's test, plus `inert`. */
function isReachable(el: HTMLElement) {
  if (!el.isConnected || el.closest("[inert]")) {
    return false;
  }
  const style = getComputedStyle(el);
  if (style.visibility === "hidden" || style.visibility === "collapse") {
    return false;
  }
  return typeof el.checkVisibility === "function"
    ? el.checkVisibility()
    : style.display !== "none" && style.display !== "contents";
}

function isAvailable(el: HTMLElement) {
  return !el.hasAttribute("data-disabled") && isReachable(el);
}

/** The selected available chip, else the first available one. */
function findEntryTarget(root: Element): HTMLElement | null {
  const chips = ownedChips(root);
  return (
    chips.find((el) => el.hasAttribute("data-selected") && isAvailable(el)) ??
    chips.find(isAvailable) ??
    null
  );
}

/** One step from `from`, wrapping only from an available end. */
function step(available: boolean[], from: number, forward: boolean) {
  const first = available.indexOf(true);
  const last = available.lastIndexOf(true);
  if (available[from] && forward && from === last) {
    return first;
  }
  if (available[from] && !forward && from === first) {
    return last;
  }
  let next = from;
  do {
    next += forward ? 1 : -1;
  } while (next >= 0 && next < available.length && !available[next]);
  return next;
}

/**
 * The chip an arrow key moves focus to from `from`, or `undefined` when it
 * moves nothing: Left/Right follow the reading direction, Up/Down are
 * back/forward, unavailable chips are skipped, and Ctrl, Alt and Meta
 * arrows do nothing.
 */
function arrowDestination(
  root: Element,
  from: HTMLElement,
  event: React.KeyboardEvent,
  rtl: boolean
): HTMLElement | undefined {
  if (IGNORED_MODIFIERS.some((key) => event.getModifierState(key))) {
    return;
  }
  const forward =
    event.key === "ArrowDown" ||
    event.key === (rtl ? "ArrowLeft" : "ArrowRight");
  const backward =
    event.key === "ArrowUp" || event.key === (rtl ? "ArrowRight" : "ArrowLeft");
  if (!(forward || backward)) {
    return;
  }
  const chips = ownedChips(root);
  const index = chips.indexOf(from);
  const next = step(chips.map(isAvailable), index, forward);
  return next === index ? undefined : chips[next];
}

type BaseUIEvent<E> = E & {
  baseUIHandlerPrevented?: boolean;
  preventBaseUIHandler?: () => void;
};

interface FilterChipsContextValue {
  /** Spends the arrow's permission if this chip is the one it names. */
  consume: (element: HTMLElement) => void;
  disabled: boolean;
  disableEmpty: boolean;
  focusInside: boolean;
  formatCount: ((count: number) => string) | undefined;
  /** Each chip's current element, to its own radio input. */
  inputs: WeakMap<Element, () => HTMLInputElement | null>;
  /** Re-reads where focus is, after a chip's focus callbacks. */
  reconcile: () => void;
  size: FilterChipsSize;
  /** `undefined` until the row is attached; see (2). */
  target: HTMLElement | null | undefined;
  value: string | null;
}

const FilterChipsContext = createContext<FilterChipsContextValue | null>(null);

// ---------------------------------------------------------------------------
// FilterChips
// ---------------------------------------------------------------------------

function FilterChips({
  className,
  render,
  value: valueProp,
  defaultValue,
  onValueChange,
  disabled = false,
  size = "default",
  disableEmpty = true,
  formatCount,
  onBlur,
  onFocus,
  onKeyDown,
  ref,
  ...props
}: FilterChipsProps) {
  const controlled = valueProp !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState<string | null>(
    defaultValue ?? null
  );
  const value = controlled ? (valueProp ?? null) : uncontrolledValue;

  const wasControlled = useRef(controlled);
  if (DEV && wasControlled.current !== controlled) {
    wasControlled.current = controlled;
    console.error(
      "FilterChips: a row switched between controlled and uncontrolled `value`. Keep `value` defined (use null for no selection) or leave it undefined for the row's lifetime."
    );
  }

  const rootRef = useRef<HTMLDivElement | null>(null);
  // `undefined` until the row is attached: the server markup and the first
  // client render then carry Base UI's own tabindex, and match.
  const [target, setTarget] = useState<HTMLElement | null | undefined>();
  const [focusInside, setFocusInside] = useState(false);
  const [inputs] = useState(
    () => new WeakMap<Element, () => HTMLInputElement | null>()
  );
  /** The row's chip that has, or last had, focus; see (3). */
  const focusRecord = useRef<HTMLElement | null>(null);
  /** The element the record was kept for; a re-attached ref keeps it. */
  const attachedRoot = useRef<HTMLDivElement | null>(null);
  const permit = useRef<HTMLElement | null>(null);
  const consumed = useRef<HTMLElement | null>(null);
  /** Bumped on every attach and detach; stale callbacks compare it. */
  const generation = useRef(0);
  const reportedDuplicates = useRef(new Set<string>());
  const direction = useDirection();

  const reconcile = useCallback(() => {
    const root = rootRef.current;
    if (!root) {
      return;
    }
    const active = root.ownerDocument.activeElement;
    if (isOwned(root, active)) {
      focusRecord.current = active;
      setFocusInside(true);
    } else {
      setFocusInside(false);
    }
  }, []);

  const consume = useCallback((element: HTMLElement) => {
    if (permit.current === element) {
      permit.current = null;
      consumed.current = element;
    }
  }, []);

  const checkDuplicates = useCallback(
    (root: Element) => {
      if (!DEV) {
        return;
      }
      const seen = new Set<string>();
      for (const el of ownedChips(root)) {
        const input = inputs.get(el)?.();
        // A missing input is skipped, never read as the radio default "on".
        const chipValue = input?.isConnected
          ? input.getAttribute("value")
          : null;
        if (chipValue === null) {
          continue;
        }
        if (seen.has(chipValue) && !reportedDuplicates.current.has(chipValue)) {
          reportedDuplicates.current.add(chipValue);
          console.error(
            `FilterChips: two chips share the value "${chipValue}". Values must be unique within a row.`
          );
        }
        seen.add(chipValue);
      }
    },
    [inputs]
  );

  const refresh = useCallback(
    // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: recovery, then the attachment recheck it needs, then the publish, read best in order
    (gen: number, structural: boolean, sync = false) => {
      const root = rootRef.current;
      if (!root || gen !== generation.current) {
        return;
      }
      const doc = root.ownerDocument;
      const active = doc.activeElement;
      if (isOwned(root, active)) {
        // Focus is on a chip, so the record follows it, even when no focus
        // event said so: a window that loses focus blurs the chip and
        // leaves it the active element.
        focusRecord.current = active;
      } else {
        // See (3): the record is spent here either way.
        const lost = focusRecord.current;
        focusRecord.current = null;
        if (lost && (!active || active === doc.body)) {
          const destination =
            isOwned(root, lost) && isAvailable(lost)
              ? lost
              : findEntryTarget(root);
          destination?.focus();
        }
      }
      // Recovery can run a consumer callback that replaces the root.
      if (rootRef.current !== root || gen !== generation.current) {
        return;
      }
      const next = findEntryTarget(root);
      const inside = isOwned(root, doc.activeElement);
      const publish = () => {
        setTarget(next);
        setFocusInside(inside);
      };
      if (sync) {
        flushSync(publish);
      } else {
        publish();
      }
      if (structural) {
        checkDuplicates(root);
      }
    },
    [checkDuplicates]
  );

  /** Observes the row's element; returns the detach. */
  const observe = useCallback(
    (root: HTMLDivElement, gen: number) => {
      const doc = root.ownerDocument;
      const watched = new Set<Element>();
      const resize =
        typeof ResizeObserver === "undefined"
          ? null
          : new ResizeObserver(() => refresh(gen, false));
      // Only chips that arrive or leave change what is observed.
      const syncWatched = () => {
        if (!resize) {
          return;
        }
        const now = new Set<Element>(ownedChips(root));
        for (const el of watched) {
          if (!now.has(el)) {
            resize.unobserve(el);
            watched.delete(el);
          }
        }
        for (const el of now) {
          if (!watched.has(el)) {
            resize.observe(el);
            watched.add(el);
          }
        }
      };
      const mutation = new MutationObserver((records) => {
        const children = records.some((r) => r.type === "childList");
        if (children) {
          syncWatched();
        }
        refresh(
          gen,
          children || records.some((r) => r.attributeName === "value")
        );
      });
      mutation.observe(root, {
        attributes: true,
        attributeFilter: OBSERVED_ATTRIBUTES,
        childList: true,
        subtree: true,
      });
      const onTab = (event: KeyboardEvent) => {
        if (event.key === "Tab" && !isOwned(root, doc.activeElement)) {
          refresh(gen, false, true);
        }
      };
      const onFocusIn = (event: FocusEvent) => {
        if (!isOwned(root, event.target)) {
          focusRecord.current = null;
        }
      };
      doc.addEventListener("keydown", onTab, true);
      doc.addEventListener("focusin", onFocusIn, true);
      syncWatched();
      refresh(gen, true);
      return () => {
        mutation.disconnect();
        resize?.disconnect();
        watched.clear();
        doc.removeEventListener("keydown", onTab, true);
        doc.removeEventListener("focusin", onFocusIn, true);
      };
    },
    [refresh]
  );

  const setRootRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node) {
        return;
      }
      // A consumer's inline ref re-attaches this one on every render of the
      // row: only a different element starts without a record; see (3).
      if (attachedRoot.current !== node) {
        attachedRoot.current = node;
        focusRecord.current = null;
      }
      rootRef.current = node;
      generation.current += 1;
      const detach = observe(node, generation.current);
      const consumerCleanup = attachRef(ref, node);
      return () => {
        detach();
        generation.current += 1;
        if (rootRef.current === node) {
          rootRef.current = null;
        }
        permit.current = null;
        consumed.current = null;
        consumerCleanup();
      };
    },
    [ref, observe]
  );

  useEffect(() => {
    if (!DEV) {
      return;
    }
    // Read the rendered attributes, not the props, and only after the first
    // commits settle: a Fieldset legend names the group through an id that
    // reaches it a render later.
    const timer = setTimeout(() => {
      const root = rootRef.current;
      if (
        root &&
        !root.hasAttribute("aria-label") &&
        !root.hasAttribute("aria-labelledby")
      ) {
        console.warn(
          "FilterChips: give the row a name with `aria-label` or `aria-labelledby`."
        );
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleKeyDown = (
    event: BaseUIEvent<React.KeyboardEvent<HTMLDivElement>>
  ) => {
    // See (1).
    if (!event.key.startsWith("Arrow") || event.baseUIHandlerPrevented) {
      return;
    }
    const root = rootRef.current;
    // The composite never moves focus: not for this row's chips, and not for
    // a nested row's key that reaches this row unhandled.
    event.preventBaseUIHandler?.();
    if (!(root && isOwned(root, event.target))) {
      return;
    }
    const destination = arrowDestination(
      root,
      event.target,
      event,
      direction === "rtl"
    );
    if (!destination) {
      return;
    }
    event.preventDefault();
    const gen = generation.current;
    permit.current = destination;
    consumed.current = null;
    try {
      destination.focus();
    } finally {
      permit.current = null;
    }
    const landed = consumed.current === destination;
    consumed.current = null;
    // Only the exact element this arrow focused, still this row's, still
    // available and still focused, is selected.
    const stillHere =
      landed &&
      gen === generation.current &&
      rootRef.current === root &&
      isOwned(root, destination) &&
      isAvailable(destination) &&
      root.ownerDocument.activeElement === destination;
    const input = stillHere ? inputs.get(destination)?.() : null;
    if (input?.isConnected) {
      input.click();
    }
  };

  const handleValueChange = useCallback(
    (next: unknown, details: FilterChipsChangeEventDetails) => {
      onValueChange?.(next as string, details);
      if (!(details.isCanceled || controlled)) {
        setUncontrolledValue(next as string);
      }
    },
    [onValueChange, controlled]
  );

  const state: FilterChipsState = { disabled, size };

  const context = useMemo<FilterChipsContextValue>(
    () => ({
      value,
      size,
      disabled,
      disableEmpty,
      formatCount,
      target,
      focusInside,
      inputs,
      consume,
      reconcile,
    }),
    [
      value,
      size,
      disabled,
      disableEmpty,
      formatCount,
      target,
      focusInside,
      inputs,
      consume,
      reconcile,
    ]
  );

  return (
    <FilterChipsContext.Provider value={context}>
      <RadioGroupPrimitive
        {...without(props, ROW_DROPPED)}
        className={mapClassName("flex flex-wrap gap-2", className, state)}
        data-disabled={disabled ? "" : undefined}
        data-size={size}
        data-slot="filter-chips"
        disabled={disabled}
        onBlur={chain(onBlur, (event: React.FocusEvent<HTMLDivElement>) => {
          const root = rootRef.current;
          const from = event.target;
          if (
            !(root && isOwned(root, from)) ||
            isOwned(root, event.relatedTarget)
          ) {
            return;
          }
          // Focus leaves the row. A chip that is still there and visible
          // was left on purpose, and so was any chip that focus leaves for
          // another element: retire the record. A hidden chip that focus
          // only drops from keeps it, and the refresh below recovers; see (3).
          if (isReachable(from) || event.relatedTarget) {
            focusRecord.current = null;
          }
          setFocusInside(false);
          refresh(generation.current, false);
        })}
        onFocus={chain(onFocus, reconcile)}
        onKeyDown={chain(onKeyDown, handleKeyDown)}
        onValueChange={handleValueChange}
        ref={setRootRef}
        render={mapRender(render, state) as RadioGroupPrimitive.Props["render"]}
        value={value}
      />
    </FilterChipsContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// FilterChip
// ---------------------------------------------------------------------------

function FilterChip({
  className,
  render,
  value,
  children,
  count,
  disabled,
  onFocus,
  ref,
  ...props
}: FilterChipProps) {
  const context = useContext(FilterChipsContext);
  if (!context) {
    throw new Error("FilterChip must be used within <FilterChips>.");
  }
  const elementRef = useRef<HTMLSpanElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const hasCount = isValidCount(count);
  useEffect(() => {
    if (DEV && count !== undefined && !hasCount) {
      console.warn(
        `FilterChip "${value}": count must be a non-negative safe integer; got ${String(count)}. The count is ignored.`
      );
    }
  }, [count, hasCount, value]);

  const selected = context.value === value;
  const empty = hasCount && count === 0;
  const unavailable =
    context.disabled ||
    disabled === true ||
    (context.disableEmpty && empty && !selected);

  const { inputs } = context;
  const setChipRef = useCallback(
    (node: HTMLSpanElement | null) => {
      if (!node) {
        return;
      }
      elementRef.current = node;
      inputs.set(node, () => inputRef.current);
      const consumerCleanup = attachRef(ref, node);
      return () => {
        inputs.delete(node);
        if (elementRef.current === node) {
          elementRef.current = null;
        }
        consumerCleanup();
      };
    },
    [ref, inputs]
  );

  const { size } = context;
  const state: FilterChipState = {
    selected,
    disabled: unavailable,
    empty,
    size,
  };
  const look = selected ? "selected" : "idle";
  // While focus is outside the row the row decides the Tab stop; before the
  // row is attached, and while focus is on one of its chips, the key is
  // left out so Base UI's roving index owns it.
  let tabIndex: number | undefined;
  if (!(context.target === undefined || context.focusInside)) {
    const element = elementRef.current;
    tabIndex = element !== null && element === context.target ? 0 : -1;
  }

  const { consume, reconcile } = context;
  const handleFocus = useCallback(
    (event: Parameters<NonNullable<FilterChipProps["onFocus"]>>[0]) => {
      const chipElement = event.currentTarget;
      // See (1): spend the arrow's permission before any callback, and
      // never let Base UI select on focus.
      consume(chipElement);
      event.preventDefault();
      onFocus?.(event);
      // A callback that moved focus on: this focus is superseded, so Base
      // UI must not record it as the roving stop over the newer one.
      if (chipElement.ownerDocument.activeElement !== chipElement) {
        event.preventBaseUIHandler();
      }
      reconcile();
    },
    [consume, reconcile, onFocus]
  );

  return (
    <RadioPrimitive.Root
      {...without(props, CHIP_DROPPED)}
      className={mapClassName(
        filterChipVariants({
          size,
          end: hasCount ? "count" : size,
          look,
          interactive: !unavailable,
        }),
        className,
        state
      )}
      data-disabled={unavailable ? "" : undefined}
      data-empty={empty ? "" : undefined}
      data-selected={selected ? "" : undefined}
      data-slot="filter-chip"
      disabled={unavailable}
      inputRef={inputRef}
      onFocus={handleFocus}
      ref={setChipRef}
      render={mapRender(render, state) as RadioPrimitive.Root.Props["render"]}
      value={value}
      {...(tabIndex === undefined ? {} : { tabIndex })}
    >
      {children}
      {hasCount ? (
        <>
          {/* A real space, so the name reads "Typography 3". */}{" "}
          <span
            className={filterChipCountVariants({ size, look })}
            data-slot="filter-chip-count"
          >
            {context.formatCount ? context.formatCount(count) : String(count)}
          </span>
        </>
      ) : null}
    </RadioPrimitive.Root>
  );
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export type {
  FilterChipProps,
  FilterChipState,
  FilterChipsChangeEventDetails,
  FilterChipsProps,
  FilterChipsSize,
  FilterChipsState,
};
export { FilterChip, FilterChips };
