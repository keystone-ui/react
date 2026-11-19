"use client";

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";
import { cva, type VariantProps } from "class-variance-authority";
import {
  animate,
  cancelFrame,
  frame,
  MotionConfigContext,
  motion,
  useReducedMotion,
} from "motion/react";
import {
  Component,
  type ComponentProps,
  createContext,
  useContext,
  useInsertionEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Reel } from "./reel";
import { cn, mergeClassName } from "./utils";

type TabsValue = string | number | null;
type TabsListVariant = "default" | "line";

const TabsActiveContext = createContext<TabsValue>(null);
const TabsTriggerContext = createContext<{ isActive: boolean }>({
  isActive: false,
});

// The morphing pill's glide and the label's width share this spring. No
// bounce: tabs switch dozens of times a day, and an overshoot on every switch
// reads as the UI wobbling rather than settling.
const MORPH_SPRING = { type: "spring", duration: 0.4, bounce: 0 } as const;

// The morph label's fade runs on its own short tween (the `--ease-ks-out`
// curve) while its width stays on the spring: text that fades over the full
// 400ms spring is half-legible for most of a switch.
const LABEL_FADE = { duration: 0.125, ease: [0.23, 1, 0.32, 1] } as const;
const LABEL_TRANSITION = { ...MORPH_SPRING, opacity: LABEL_FADE } as const;

// =============================================================================
// Morphing pill (internal)
// =============================================================================
/** A box in a list's own coordinates: physical CSS px from its border box. */
interface PillBox {
  b: number;
  l: number;
  r: number;
  t: number;
}

/** The inline properties a glide owns; everything else on the pill is kept. */
const PILL_PROPERTIES = [
  "left",
  "top",
  "width",
  "height",
  "right",
  "bottom",
] as const;

const TRIGGER_SELECTOR = '[data-slot="tabs-trigger"]';
const LIST_SELECTOR = '[data-slot="tabs-list"]';

const px = (value: string) => Number.parseFloat(value) || 0;

/**
 * Each written edge is rounded inward to a fixed step before the size is
 * taken, so a browser that drops a length's fraction lays out no more than
 * the clamp allowed. A value within 1/1000 of a step of a step boundary is
 * taken as that boundary. Rounding moves an edge inward only, but it starts
 * from an estimate of the list's scale: on a very wide list that estimate can
 * put an edge a little past the tab's padding edge, which the tab's border
 * absorbs in stock styling.
 */
const WRITE_STEP = 1 / 64;
function roundInward(x: number, up: boolean) {
  const steps = x / WRITE_STEP;
  const nearest = Math.round(steps);
  if (Math.abs(steps - nearest) < 0.001) {
    return nearest * WRITE_STEP;
  }
  return (up ? Math.ceil(steps) : Math.floor(steps)) * WRITE_STEP;
}

/** Where a list is and how it is scaled, read once per frame. */
interface ListFrame {
  kx: number;
  ky: number;
  rect: DOMRect;
}

/**
 * The list's rectangle and its on-screen scale per axis (its rectangle against
 * its fractional layout size), or null when it has no usable size: a list
 * that is hidden, empty on either axis or disconnected never glides.
 */
function readList(list: HTMLElement): ListFrame | null {
  if (!list.isConnected) {
    return null;
  }
  const rect = list.getBoundingClientRect();
  const cs = getComputedStyle(list);
  const content = cs.boxSizing === "content-box";
  const width =
    px(cs.width) +
    (content
      ? px(cs.paddingLeft) +
        px(cs.paddingRight) +
        px(cs.borderLeftWidth) +
        px(cs.borderRightWidth)
      : 0);
  const height =
    px(cs.height) +
    (content
      ? px(cs.paddingTop) +
        px(cs.paddingBottom) +
        px(cs.borderTopWidth) +
        px(cs.borderBottomWidth)
      : 0);
  const kx = rect.width / width;
  const ky = rect.height / height;
  return Number.isFinite(kx) && Number.isFinite(ky) && kx > 0 && ky > 0
    ? { rect, kx, ky }
    : null;
}

function boxIn(el: Element, at: ListFrame): PillBox {
  const r = el.getBoundingClientRect();
  return {
    l: (r.left - at.rect.left) / at.kx,
    r: (r.right - at.rect.left) / at.kx,
    t: (r.top - at.rect.top) / at.ky,
    b: (r.bottom - at.rect.top) / at.ky,
  };
}

/**
 * Live padding boxes for one read phase: each element's border box inside its
 * four computed borders, measured once however often it is asked for.
 */
function paddingBoxes(at: ListFrame) {
  const seen = new Map<Element, PillBox>();
  return (el: Element): PillBox => {
    let box = seen.get(el);
    if (!box) {
      const border = boxIn(el, at);
      const cs = getComputedStyle(el);
      box = {
        l: border.l + px(cs.borderLeftWidth),
        t: border.t + px(cs.borderTopWidth),
        r: border.r - px(cs.borderRightWidth),
        b: border.b - px(cs.borderBottomWidth),
      };
      seen.set(el, box);
    }
    return box;
  };
}

/** The Base UI trigger host holding `el`, if `list` is its nearest list. */
function hostOf(el: Element, list: Element): HTMLElement | null {
  const host = el.closest<HTMLElement>(TRIGGER_SELECTOR);
  return host && host.closest(LIST_SELECTOR) === list ? host : null;
}

const usable = (box: PillBox) =>
  Number.isFinite(box.l + box.r + box.t + box.b) &&
  box.r - box.l > 0 &&
  box.b - box.t > 0;

/** The bounding box of the tabs' padding boxes. */
function envelopeOf(
  tabs: Iterable<Element>,
  pad: (el: Element) => PillBox
): PillBox {
  const box = {
    l: Number.POSITIVE_INFINITY,
    t: Number.POSITIVE_INFINITY,
    r: Number.NEGATIVE_INFINITY,
    b: Number.NEGATIVE_INFINITY,
  };
  for (const tab of tabs) {
    const p = pad(tab);
    box.l = Math.min(box.l, p.l);
    box.t = Math.min(box.t, p.t);
    box.r = Math.max(box.r, p.r);
    box.b = Math.max(box.b, p.b);
  }
  return box;
}

/** Each edge of `box` clamped into `to`. */
function clampTo(box: PillBox, to: PillBox): PillBox {
  const clamp = (x: number, lo: number, hi: number) =>
    Math.min(hi, Math.max(lo, x));
  return {
    l: clamp(box.l, to.l, to.r),
    r: clamp(box.r, to.l, to.r),
    t: clamp(box.t, to.t, to.b),
    b: clamp(box.b, to.t, to.b),
  };
}

/** One glide of one list's pill. */
interface PillRun {
  animation: { stop: () => void };
  /** The pill's own conversion from a border box to inline geometry. */
  box: { extraH: number; extraW: number; marginL: number; marginT: number };
  /** The pill's rest box when the glide started. */
  C: PillBox;
  done: boolean;
  /** The pill's rest box inside its trigger's padding box. */
  insets: PillBox;
  list: HTMLElement;
  owner: PillController;
  p: number;
  /** Every tab this glide involves. */
  participants: Set<HTMLElement>;
  pill: HTMLElement;
  released: boolean;
  /** The box the glide starts from: the box the pill left, within the tabs. */
  S: PillBox;
  /** The line's strip height: the strip keeps it on the tab's bottom edge. */
  strip: number | null;
  trigger: HTMLElement;
}

/** What the snapshot phase saw of the outgoing pill. */
interface PillSnapshotData {
  from: HTMLElement;
  list: HTMLElement;
  participants: Set<HTMLElement>;
  S: PillBox;
  used: boolean;
}

/** Every list that is gliding, served by one read-all, write-all pass. */
const runningPills = new Set<PillRun>();

/**
 * End a run, once: stop its spring, hand its pill back to CSS (the six
 * properties only) and let go of everything it held. The shared frame pass is
 * cancelled as soon as no run is left.
 */
function releasePill(run: PillRun) {
  if (run.released) {
    return;
  }
  run.released = true;
  run.animation.stop();
  runningPills.delete(run);
  if (runningPills.size === 0) {
    cancelFrame(stepPills);
  }
  const style = run.pill.style;
  for (const property of PILL_PROPERTIES) {
    style.removeProperty(property);
  }
  // Leave no empty `style=""` behind when the glide was all there was.
  if (!run.pill.getAttribute("style")?.trim()) {
    run.pill.removeAttribute("style");
  }
  run.participants.clear();
  if (run.owner.run === run) {
    run.owner.run = null;
  }
}

/** Write `box` (list-local) relative to the containing block's padding box. */
function writePill(run: PillRun, box: PillBox, container: PillBox) {
  const l = roundInward(box.l - container.l, true);
  const r = Math.max(l, roundInward(box.r - container.l, false));
  const t = roundInward(box.t - container.t, true);
  const b = Math.max(t, roundInward(box.b - container.t, false));
  const style = run.pill.style;
  style.left = `${l - run.box.marginL}px`;
  style.top = `${t - run.box.marginT}px`;
  style.width = `${Math.max(0, r - l - run.box.extraW)}px`;
  style.height = `${Math.max(0, b - t - run.box.extraH)}px`;
  style.right = "auto";
  style.bottom = "auto";
}

/** A tab of `list`: connected, with `list` as its nearest list. */
const isTabOf = (tab: HTMLElement, list: HTMLElement) =>
  tab.isConnected && hostOf(tab, list) === tab;

/**
 * Whether a run may go on. Anything the controller cannot vouch for (its pill
 * gone, a participant moved out of this list or into a nested one) ends it,
 * and the pill is back at its CSS position: it never writes on a guess.
 */
function stillValid(run: PillRun) {
  if (!(run.pill.isConnected && run.list.contains(run.pill))) {
    return false;
  }
  for (const tab of run.participants) {
    if (!isTabOf(tab, run.list)) {
      return false;
    }
  }
  return hostOf(run.pill, run.list) === run.trigger;
}

/** The pill's native rest box in its trigger, on the live padding box. */
function restBox(run: PillRun, pad: PillBox): PillBox {
  const b = pad.b - run.insets.b;
  return {
    l: pad.l + run.insets.l,
    r: pad.r - run.insets.r,
    t: run.strip === null ? pad.t + run.insets.t : b - run.strip,
    b,
  };
}

/**
 * Where the pill is at progress p: motion's shared-layout curve (scale and
 * translate from the box it left towards the rest box), applied to the live
 * rest box and clamped, edge by edge, to the involved tabs.
 */
function pillAt(run: PillRun, rest: PillBox, envelope: PillBox): PillBox {
  const q = 1 - run.p;
  const axis = (
    s0: number,
    s1: number,
    c0: number,
    c1: number,
    r0: number,
    r1: number
  ) => {
    const scale = 1 + q * ((s1 - s0) / (c1 - c0) - 1);
    const centre = (r0 + r1) / 2 + q * ((s0 + s1) / 2 - (c0 + c1) / 2);
    const half = (scale * (r1 - r0)) / 2;
    return [centre - half, centre + half];
  };
  const { S, C } = run;
  const [l, r] = axis(S.l, S.r, C.l, C.r, rest.l, rest.r);
  const [t, b] = axis(S.t, S.b, C.t, C.b, rest.t, rest.b);
  return clampTo({ l, r, t, b }, envelope);
}

/** One run's box and containing block this frame, or null to end it. */
function measureRun(run: PillRun): [PillBox, PillBox] | null {
  if (run.done || !stillValid(run)) {
    return null;
  }
  const at = readList(run.list);
  const container = run.pill.offsetParent;
  if (!(at && container)) {
    return null;
  }
  const pad = paddingBoxes(at);
  const rest = restBox(run, pad(run.trigger));
  const envelope = envelopeOf(run.participants, pad);
  if (!(usable(rest) && usable(envelope))) {
    return null;
  }
  return [pillAt(run, rest, envelope), pad(container)];
}

/**
 * One frame for every gliding list: all reads, then all writes, releases
 * included, so no list reads a layout another list's write invalidated.
 */
function stepPills() {
  const ends: PillRun[] = [];
  const writes: [PillRun, PillBox, PillBox][] = [];
  for (const run of runningPills) {
    const measured = measureRun(run);
    if (measured) {
      writes.push([run, ...measured]);
    } else {
      ends.push(run);
    }
  }
  for (const run of ends) {
    releasePill(run);
  }
  for (const [run, box, container] of writes) {
    if (!run.released) {
      writePill(run, box, container);
    }
  }
}

/**
 * Moves one list's morphing pill. The pill is a new element in each active
 * trigger; the controller carries the glide across the handoff: the
 * outgoing pill's box is read before React changes the DOM, the incoming
 * pill is placed on that box (within the tabs as they now are) before it is
 * painted, and each frame after that it follows the curve above on the live
 * layout until the spring settles, when it is handed back to its CSS.
 */
class PillController {
  pill: HTMLElement | null = null;
  pending: PillSnapshotData | null = null;
  run: PillRun | null = null;

  /** Snapshot phase of a commit that changes the selection. */
  capture() {
    this.pending = null;
    const pill = this.pill;
    const list = pill?.closest<HTMLElement>(LIST_SELECTOR);
    const from = pill && list ? hostOf(pill, list) : null;
    const at = list && from ? readList(list) : null;
    if (!(pill && list && from && at)) {
      return;
    }
    const S = boxIn(pill, at);
    // An interrupted glide keeps its tabs in the span; a finished one does not.
    const run = this.run;
    const gliding =
      run && !run.released && !run.done && run.pill === pill ? run : null;
    const participants = new Set(gliding?.participants);
    participants.add(from);
    this.pending = { S, from, list, participants, used: false };
  }

  /** A pill's layout effect: start a glide if this commit captured one. */
  mount(pill: HTMLElement, reduced: boolean, line: boolean) {
    this.pill = pill;
    const pending = this.pending;
    if (!pending || pending.used) {
      return;
    }
    pending.used = true;
    this.stop();
    const { from, list } = pending;
    const trigger = hostOf(pill, list);
    const container = pill.offsetParent;
    if (reduced || !(trigger && container) || trigger === from) {
      return;
    }
    // A tab the handoff inherits that is no longer this list's ends it here.
    for (const tab of pending.participants) {
      if (!isTabOf(tab, list)) {
        return;
      }
    }
    const at = readList(list);
    if (!at) {
      return;
    }
    const participants = new Set(pending.participants);
    participants.add(trigger);
    const pad = paddingBoxes(at);
    const C = boxIn(pill, at);
    // The box the pill left, within the tabs as this commit left them.
    const S = clampTo(pending.S, envelopeOf(participants, pad));
    if (!(usable(pending.S) && usable(S) && usable(C))) {
      return;
    }
    const tab = pad(trigger);
    const cs = getComputedStyle(pill);
    const content = cs.boxSizing === "content-box";
    const run: PillRun = {
      pill,
      list,
      owner: this,
      trigger,
      participants,
      S,
      C,
      insets: {
        l: C.l - tab.l,
        t: C.t - tab.t,
        r: tab.r - C.r,
        b: tab.b - C.b,
      },
      strip: line ? C.b - C.t : null,
      box: {
        marginL: px(cs.marginLeft),
        marginT: px(cs.marginTop),
        extraW: content
          ? px(cs.paddingLeft) +
            px(cs.paddingRight) +
            px(cs.borderLeftWidth) +
            px(cs.borderRightWidth)
          : 0,
        extraH: content
          ? px(cs.paddingTop) +
            px(cs.paddingBottom) +
            px(cs.borderTopWidth) +
            px(cs.borderBottomWidth)
          : 0,
      },
      p: 0,
      done: false,
      released: false,
      animation: { stop: () => undefined },
    };
    // At p = 0 the curve is exactly S: write it now, before the first paint.
    writePill(run, S, pad(container));
    run.animation = animate(0, 1, {
      ...MORPH_SPRING,
      onUpdate: (p) => {
        run.p = Math.min(1, Math.max(0, p));
      },
      // motion reports completion in a microtask, so the pill is handed
      // back to CSS in the frame after the one that draws p = 1.
      onComplete: () => {
        run.p = 1;
        run.done = true;
      },
    });
    this.run = run;
    if (runningPills.size === 0) {
      frame.postRender(stepPills, true);
    }
    runningPills.add(run);
  }

  /**
   * A pill's effect cleanup only forgets it: a StrictMode replay mounts the
   * same pill again, and the glide must survive that.
   */
  unmount(pill: HTMLElement) {
    if (this.pill === pill) {
      this.pill = null;
    }
  }

  /** The pill element was deleted: the run it carried ends with it. */
  deleted(pill: HTMLElement) {
    if (this.run?.pill === pill) {
      releasePill(this.run);
    }
  }

  /**
   * The end of a commit's layout phase: a snapshot lives for one commit. (A
   * glide whose pill this commit removed has already ended, at the pill's
   * deletion.)
   */
  endCommit() {
    this.pending = null;
  }

  stop() {
    if (this.run) {
      releasePill(this.run);
    }
  }

  dispose() {
    this.stop();
    this.pending = null;
    this.pill = null;
  }
}

/**
 * Reads the outgoing pill in React's snapshot phase, before the commit that
 * changes the selection touches the DOM. Rendered after the triggers, so its
 * update runs after their layout effects and closes the commit.
 */
// biome-ignore lint/style/useReactFunctionComponents: getSnapshotBeforeUpdate, the read before React mutates the DOM, has no hook equivalent
class PillSnapshot extends Component<{
  controller: PillController;
  value: TabsValue;
}> {
  getSnapshotBeforeUpdate(previous: { value: TabsValue }) {
    if (previous.value !== this.props.value) {
      this.props.controller.capture();
    }
    return null;
  }

  componentDidUpdate() {
    this.props.controller.endCommit();
  }

  componentWillUnmount() {
    this.props.controller.dispose();
  }

  render() {
    return null;
  }
}

function MorphingPillSnapshot() {
  const { pill } = useContext(TabsListContext);
  const value = useContext(TabsActiveContext);
  return <PillSnapshot controller={pill} value={value} />;
}

function MorphingPill({ className }: { className: string }) {
  const { pill: controller, variant } = useContext(TabsListContext);
  const config = useContext(MotionConfigContext);
  const systemReduced = useReducedMotion();
  const reduced = Boolean(
    systemReduced || config.reducedMotion === "always" || config.isStatic
  );
  const ref = useRef<HTMLSpanElement>(null);
  // The preference is read when the pill mounts, as `useReducedMotion` is.
  const reducedRef = useRef(reduced);
  reducedRef.current = reduced;
  // The line variant's pill is a strip on the trigger's bottom edge.
  const lineRef = useRef(variant === "line");
  lineRef.current = variant === "line";
  // The element the layout effect mounted; its cleanup leaves this set.
  const hostRef = useRef<HTMLElement | null>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }
    hostRef.current = el;
    controller.mount(el, reducedRef.current, lineRef.current);
    return () => controller.unmount(el);
  }, [controller]);
  // A run ends when its pill is deleted, by any path, including a commit
  // the list itself takes no part in. Insertion-effect cleanups run on a real
  // deletion and are not replayed under StrictMode, unlike the one above.
  useInsertionEffect(
    () => () => {
      const el = hostRef.current;
      if (el) {
        controller.deleted(el);
      }
    },
    [controller]
  );
  return (
    <span
      aria-hidden
      className={className}
      data-slot="tabs-morphing-pill"
      ref={ref}
    />
  );
}

// =============================================================================
// Tabs (Root)
// =============================================================================
export interface TabsProps extends TabsPrimitive.Root.Props {}

function Tabs({
  className,
  orientation = "horizontal",
  value,
  defaultValue,
  onValueChange,
  ...props
}: TabsProps) {
  // Lazily, and through an updater below: a tab's value may be a function,
  // which React would otherwise call.
  const [internalValue, setInternalValue] = useState<TabsValue>(
    () => defaultValue ?? null
  );
  // `null` is a real controlled value (no tab active); only `undefined` means
  // uncontrolled.
  const activeValue = value === undefined ? internalValue : value;

  const handleValueChange: TabsPrimitive.Root.Props["onValueChange"] = (
    next,
    eventDetails
  ) => {
    onValueChange?.(next, eventDetails);
    // Only a user's activation (reason "none") can be cancelled; Base UI
    // commits automatic changes ("initial", "missing", "disabled") before
    // notifying.
    if (eventDetails.reason !== "none" || !eventDetails.isCanceled) {
      setInternalValue(() => next);
    }
  };

  return (
    <TabsActiveContext.Provider value={activeValue}>
      <TabsPrimitive.Root
        className={mergeClassName(
          "group/tabs flex gap-2 data-[orientation=horizontal]:flex-col",
          className
        )}
        data-slot="tabs"
        defaultValue={defaultValue}
        onValueChange={handleValueChange}
        orientation={orientation}
        value={value}
        {...props}
      />
    </TabsActiveContext.Provider>
  );
}

// =============================================================================
// TabsList
// =============================================================================
const tabsListVariants = cva(
  "group/tabs-list relative inline-flex w-fit items-center justify-center rounded-lg p-1 text-muted-foreground data-[shape=pill]:rounded-full data-[variant=line]:rounded-none group-data-[orientation=vertical]/tabs:h-fit group-data-[orientation=vertical]/tabs:flex-col",
  {
    variants: {
      variant: {
        default: "bg-muted",
        line: "gap-1 bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const TabsListContext = createContext<{
  morphing: boolean;
  variant: TabsListVariant;
  pill: PillController;
}>({
  morphing: false,
  variant: "default",
  pill: new PillController(),
});

export interface TabsListProps
  extends TabsPrimitive.List.Props,
    VariantProps<typeof tabsListVariants> {
  /**
   * Collapse inactive triggers to icon-only and reveal the label only on the
   * active tab. Each trigger should pair an icon with `<TabsTriggerLabel>`.
   */
  morphing?: boolean;
  /**
   * Scroll horizontally in a Reel, with edge fades and bare chevrons. Reel
   * brings the active tab into view when the list gains room or the
   * selection changes, if the Reel's last measured content width and the
   * tab's width are positive.
   */
  scrollable?: boolean;
  /**
   * Shape of the tab list and its triggers
   * @default "rounded"
   */
  shape?: "rounded" | "pill";
}

function TabsList({
  className,
  variant = "default",
  shape = "rounded",
  scrollable,
  morphing = false,
  children,
  ...props
}: TabsListProps) {
  const [pill] = useState(() => new PillController());
  const contextValue = useMemo(
    () => ({ morphing, variant: variant ?? "default", pill }),
    [morphing, variant, pill]
  );

  if (scrollable) {
    return (
      <TabsListContext.Provider value={contextValue}>
        <ScrollableTabsList
          className={className}
          morphing={morphing}
          shape={shape}
          variant={variant}
          {...props}
        >
          {children}
        </ScrollableTabsList>
      </TabsListContext.Provider>
    );
  }

  // In morphing mode the active pill is a span inside the active TabsTrigger,
  // moved by the list's PillController — suppress Base UI's CSS indicator.
  return (
    <TabsListContext.Provider value={contextValue}>
      <TabsPrimitive.List
        className={mergeClassName(cn(tabsListVariants({ variant })), className)}
        data-morphing={morphing || undefined}
        data-shape={shape}
        data-slot="tabs-list"
        data-variant={variant}
        {...props}
      >
        {!morphing && <TabsIndicator />}
        {children}
        {morphing ? <MorphingPillSnapshot /> : null}
      </TabsPrimitive.List>
    </TabsListContext.Provider>
  );
}

// =============================================================================
// ScrollableTabsList (internal)
// =============================================================================
/**
 * The list in a Reel with plain arrows: a bare chevron at each edge with more
 * tabs, on every device, and the row hidden beneath it. The Reel's own
 * padding is zeroed so the list keeps its box; the list's padding keeps the
 * triggers' focus outlines clear of the scroller's clip at any root size.
 */
function ScrollableTabsList({
  className,
  variant = "default",
  shape = "rounded",
  morphing = false,
  children,
  ...props
}: Omit<TabsListProps, "scrollable">) {
  return (
    <Reel
      arrowVariant="plain"
      arrows="always"
      className="[&>[data-slot=reel-viewport]]:p-0"
    >
      <TabsPrimitive.List
        className={mergeClassName(
          cn(
            tabsListVariants({ variant }),
            "p-[max(4px,var(--spacing,0.25rem))]"
          ),
          className
        )}
        data-morphing={morphing || undefined}
        data-scrollable
        data-shape={shape}
        data-slot="tabs-list"
        data-variant={variant}
        {...props}
      >
        {!morphing && <TabsIndicator />}
        {children}
        {morphing ? <MorphingPillSnapshot /> : null}
      </TabsPrimitive.List>
    </Reel>
  );
}

// =============================================================================
// TabsTrigger
// =============================================================================
export interface TabsTriggerProps extends TabsPrimitive.Tab.Props {}

function TabsTrigger({
  className,
  children,
  value,
  ...props
}: TabsTriggerProps) {
  const { morphing, variant } = useContext(TabsListContext);
  const activeValue = useContext(TabsActiveContext);
  const isActive = activeValue === value;

  const triggerContext = useMemo(() => ({ isActive }), [isActive]);

  return (
    <TabsTriggerContext.Provider value={triggerContext}>
      <TabsPrimitive.Tab
        className={mergeClassName(
          cn(
            // Base styles
            "group/tabs-trigger relative z-[1] inline-flex h-8 flex-1 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-transparent px-2 py-0.5 font-medium text-muted-foreground text-sm transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring/50 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:cursor-not-allowed aria-disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
            // Shape-aware styles
            "group-data-[shape=pill]/tabs-list:rounded-full group-data-[shape=pill]/tabs-list:px-3",
            // Orientation-aware styles
            "group-data-[orientation=vertical]/tabs:h-8 group-data-[orientation=vertical]/tabs:w-full group-data-[orientation=vertical]/tabs:flex-initial group-data-[orientation=vertical]/tabs:justify-start",
            // Active state (text color only — background/shadow handled by indicator/pill)
            "data-active:text-foreground dark:data-active:text-foreground",
            // Morphing: triggers size to content so the active one can grow to
            // fit its label. Width animation lives on TabsTriggerLabel (motion).
            // Gap collapses to 0 — the label carries its own left padding so the
            // icon→label spacing animates with the motion spring.
            "data-[morphing]:flex-initial data-[morphing]:gap-0"
          ),
          className
        )}
        data-morphing={morphing || undefined}
        data-slot="tabs-trigger"
        value={value}
        {...props}
      >
        {morphing && isActive && (
          <MorphingPill
            className={cn(
              "absolute -z-[1]",
              // Default variant in morphing mode: always a fully-rounded pill,
              // no shadow. The pill is resized, never scaled, so its round
              // caps keep their shape on every frame of a glide.
              variant === "default" &&
                "inset-0 rounded-full bg-background dark:bg-input-bg",
              variant === "line" &&
                "right-0 bottom-0 left-0 h-0.5 bg-foreground"
            )}
          />
        )}
        {children}
      </TabsPrimitive.Tab>
    </TabsTriggerContext.Provider>
  );
}

// =============================================================================
// TabsTriggerLabel
// =============================================================================
export interface TabsTriggerLabelProps extends ComponentProps<"span"> {}

/**
 * Wraps a tab's text label so it can collapse to width 0 when the parent
 * `TabsList` has `morphing` enabled and the trigger is not active. The active
 * tab springs from 0 to natural width via `motion`, and the icon→label
 * spacing lives inside the label so it animates together with the width.
 *
 * Outside `morphing` mode this renders a plain `<span>`.
 */
function TabsTriggerLabel({
  className,
  children,
  ...props
}: TabsTriggerLabelProps) {
  const { morphing } = useContext(TabsListContext);
  const { isActive } = useContext(TabsTriggerContext);
  const shouldReduceMotion = useReducedMotion();

  if (!morphing) {
    return (
      <span className={className} data-slot="tabs-trigger-label" {...props}>
        {children}
      </span>
    );
  }

  return (
    <motion.span
      animate={{
        width: isActive ? "auto" : 0,
        opacity: isActive ? 1 : 0,
      }}
      className={cn(
        "inline-block overflow-hidden whitespace-nowrap",
        className
      )}
      data-slot="tabs-trigger-label"
      initial={false}
      transition={shouldReduceMotion ? { duration: 0 } : LABEL_TRANSITION}
      {...(props as ComponentProps<typeof motion.span>)}
    >
      <span className="pl-1.5">{children}</span>
    </motion.span>
  );
}

// =============================================================================
// TabsIndicator
// =============================================================================
export interface TabsIndicatorProps extends TabsPrimitive.Indicator.Props {}

function TabsIndicator({ className, ...props }: TabsIndicatorProps) {
  return (
    <TabsPrimitive.Indicator
      className={mergeClassName(
        cn(
          // Positioned at the list's origin and moved to the active tab with a
          // translate, from Base UI's `--active-tab-*` variables. Animating
          // `translate` keeps the slide on the compositor; animating `top` /
          // `left` relaid out the list on every frame.
          "absolute top-0 left-0 h-(--active-tab-height) w-(--active-tab-width) translate-x-(--active-tab-left) translate-y-(--active-tab-top)",
          // Sliding animation (reduced motion handled globally by base.css)
          "transition-[translate,width,height] duration-(--duration-base,180ms) ease-(--ease-ks-out,cubic-bezier(0.23,1,0.32,1))",
          // Default variant: pill/card sliding behind active tab
          "group-data-[variant=default]/tabs-list:rounded-md group-data-[variant=default]/tabs-list:bg-background group-data-[variant=default]/tabs-list:shadow-sm",
          "group-data-[variant=default]/tabs-list:group-data-[shape=pill]/tabs-list:rounded-full",
          "dark:group-data-[variant=default]/tabs-list:bg-input-bg",
          // Line variant (horizontal): 2px bar pinned to the list's bottom edge,
          // so only x follows the tab
          "group-data-[variant=line]/tabs-list:data-[orientation=horizontal]:top-auto group-data-[variant=line]/tabs-list:data-[orientation=horizontal]:bottom-0 group-data-[variant=line]/tabs-list:data-[orientation=horizontal]:h-0.5 group-data-[variant=line]/tabs-list:data-[orientation=horizontal]:translate-y-0",
          "group-data-[variant=line]/tabs-list:bg-foreground",
          // Line variant (vertical): 2px bar pinned to the list's right edge,
          // so only y follows the tab
          "group-data-[variant=line]/tabs-list:data-[orientation=vertical]:-right-1 group-data-[variant=line]/tabs-list:data-[orientation=vertical]:left-auto group-data-[variant=line]/tabs-list:data-[orientation=vertical]:w-0.5 group-data-[variant=line]/tabs-list:data-[orientation=vertical]:translate-x-0"
        ),
        className
      )}
      data-slot="tabs-indicator"
      renderBeforeHydration
      {...props}
    />
  );
}

// =============================================================================
// TabsContent
// =============================================================================
export interface TabsContentProps extends TabsPrimitive.Panel.Props {}

function TabsContent({ className, ...props }: TabsContentProps) {
  return (
    <TabsPrimitive.Panel
      className={mergeClassName("flex-1 text-sm outline-none", className)}
      data-slot="tabs-content"
      {...props}
    />
  );
}

export {
  Tabs,
  TabsContent,
  TabsIndicator,
  TabsList,
  TabsTrigger,
  TabsTriggerLabel,
  tabsListVariants,
};
