/**
 * The morphing Tabs pill, frame by frame. Every play steps motion's frame loop
 * by hand (`MotionGlobalConfig.useManualTiming`), so no assertion depends on
 * wall-clock frame timing, and labels are either the self-hosted Geist face or
 * fixed-width boxes, so none depends on a font the runner may lack.
 */
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsTriggerLabel,
} from "@keystoneui/react/tabs";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  HomeIcon,
  InboxIcon,
  MessageSquareIcon,
  MicIcon,
  SearchIcon,
} from "lucide-react";
import {
  frame,
  frameData,
  frameSteps,
  MotionConfig,
  MotionGlobalConfig,
  prefersReducedMotion,
  spring,
} from "motion/react";
import {
  type ComponentProps,
  type CSSProperties,
  type ReactNode,
  StrictMode,
  useLayoutEffect,
  useState,
} from "react";
import { flushSync } from "react-dom";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { expect } from "storybook/test";
import { outsideVitest } from "./real-browser";
import BASE_TRACE from "./tabs-morphing-pill.base-trace.json";

const meta = {
  title: "Components/Tabs/Morphing Pill",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const TEST_ONLY: Story["tags"] = ["!dev", "!autodocs"];

// =============================================================================
// Clock: motion's frame loop, stepped by hand
// =============================================================================
const ORDER = [
  "setup",
  "read",
  "resolveKeyframes",
  "preUpdate",
  "update",
  "preRender",
  "render",
  "postRender",
] as const;
const FRAME = 16;

/**
 * Freeze motion's clock and step it. Real animation frames keep running but
 * see the same timestamp, so they change nothing.
 */
function manualClock() {
  MotionGlobalConfig.useManualTiming = true;
  let now = Math.round(performance.now());
  frameData.timestamp = now;
  const step = (ms = FRAME) => {
    now += ms;
    frameData.delta = ms;
    frameData.timestamp = now;
    frameData.isProcessing = true;
    for (const key of ORDER) {
      frameSteps[key].process(frameData);
    }
    frameData.isProcessing = false;
  };
  /** `n` frames, letting microtasks (React, motion's animation start) run. */
  const run = async (n: number) => {
    for (let i = 0; i < n; i++) {
      step();
      // biome-ignore lint/performance/noAwaitInLoops: frames are sequential
      await Promise.resolve();
      await Promise.resolve();
    }
  };
  return {
    step,
    run,
    get now() {
      return now;
    },
    restore() {
      MotionGlobalConfig.useManualTiming = false;
    },
  };
}

/** Let React and motion's microtasks run without advancing motion's time. */
const flush = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

/** The duration spring every switch runs on, as motion samples it. */
const progress = spring({ keyframes: [0, 1], duration: 400, bounce: 0 });
const pAt = (ms: number) => Math.min(1, Math.max(0, progress.next(ms).value));

// =============================================================================
// Geometry, in the list's own coordinates
// =============================================================================
interface Box {
  b: number;
  l: number;
  r: number;
  t: number;
}

/** The list's on-screen scale per axis: its rect against its layout size. */
function scaleOf(list: Element): [number, number] {
  const o = list.getBoundingClientRect();
  const cs = getComputedStyle(list);
  const w = Number.parseFloat(cs.width);
  const h = Number.parseFloat(cs.height);
  return [w > 0 ? o.width / w : 1, h > 0 ? o.height / h : 1];
}

/** A border box in the list's own CSS px (its layout units, any scale undone). */
function local(el: Element, list: Element): Box {
  const r = el.getBoundingClientRect();
  const o = list.getBoundingClientRect();
  const [kx, ky] = scaleOf(list);
  return {
    l: (r.left - o.left) / kx,
    r: (r.right - o.left) / kx,
    t: (r.top - o.top) / ky,
    b: (r.bottom - o.top) / ky,
  };
}

/** A trigger's padding box: its border box inside its borders (layout px). */
function paddingBox(el: HTMLElement, list: Element): Box {
  const box = local(el, list);
  const cs = getComputedStyle(el);
  return {
    l: box.l + Number.parseFloat(cs.borderLeftWidth),
    r: box.r - Number.parseFloat(cs.borderRightWidth),
    t: box.t + Number.parseFloat(cs.borderTopWidth),
    b: box.b - Number.parseFloat(cs.borderBottomWidth),
  };
}

/** Two boxes within `tol` px on every edge. */
const near = (a: Box | null, b: Box | null, tol = 0.5) =>
  !!(a && b) &&
  Math.abs(a.l - b.l) <= tol &&
  Math.abs(a.r - b.r) <= tol &&
  Math.abs(a.t - b.t) <= tol &&
  Math.abs(a.b - b.b) <= tol;

const fmt = (b: Box | null) =>
  b
    ? `${b.l.toFixed(1)}..${b.r.toFixed(1)} x ${b.t.toFixed(1)}..${b.b.toFixed(1)}`
    : "none";

function parts(root: HTMLElement, id: string) {
  const host = root.querySelector(`[data-lab="${id}"]`) as HTMLElement;
  const list = () =>
    host.querySelector('[data-slot="tabs-list"]') as HTMLElement;
  const tab = (v: string) =>
    host.querySelector(
      `[data-slot="tabs-trigger"][data-v="${v}"]`
    ) as HTMLElement;
  const pill = () =>
    host.querySelector(
      '[data-slot="tabs-morphing-pill"]'
    ) as HTMLElement | null;
  const pillBox = () => {
    const p = pill();
    return p ? local(p, list()) : null;
  };
  /** The pill's rest box in a trigger: fill, or the line's 2px bottom strip. */
  const rest = (v: string, line: boolean): Box => {
    const pb = paddingBox(tab(v), list());
    return line ? { ...pb, t: pb.b - 2 } : pb;
  };
  return { host, list, tab, pill, pillBox, rest };
}

// =============================================================================
// The fixture
// =============================================================================
const ICONS = [HomeIcon, MessageSquareIcon, MicIcon, InboxIcon, SearchIcon];
const VALUES = ["home", "chat", "meetings", "inbox", "search"];
/** The stories' own labels, and a 20-character one for the last tab. */
const STORY_LABELS = ["Home", "Chat", "Meetings", "Inbox", "Search"];
const LONG = "Billing and accounts";
/** The line stories' list: four tabs, ending in Inbox. */
const LINE_VALUES = VALUES.slice(0, 4);
/** Fixed-width stand-ins for the stories' labels in Geist (text widths). */
const FIXED = [34, 28, 58, 33, 46];

type Label = string | number;

interface LabProps {
  activateOnFocus?: boolean;
  cancel?: string;
  dir?: "ltr" | "rtl";
  /** Hide with `display: none` (default) or with a zero scale, laid out. */
  hideBy?: "display" | "scale";
  id: string;
  initial?: string | null;
  labels?: Label[];
  /** Inline style on the list. */
  listStyle?: CSSProperties;
  morphing?: boolean;
  motionConfig?: "always" | "user" | "never";
  mounted?: boolean;
  /** Called from a layout effect on every commit of the lab. */
  onLayout?: () => void;
  orientation?: "horizontal" | "vertical";
  /** Render this trigger inside a child component with its own visibility state. */
  ownState?: string;
  scale?: string;
  scrollable?: boolean;
  shape?: "rounded" | "pill";
  /** Wrap the lab in a static MotionConfig (motion off). */
  staticMotion?: boolean;
  /** Wrap the lab in StrictMode. */
  strict?: boolean;
  /** Inline style per trigger value; `*` applies to every trigger. */
  tabStyle?: Record<string, CSSProperties>;
  /** Leave the value to Tabs (`defaultValue`) instead of controlling it. */
  uncontrolled?: boolean;
  values?: string[];
  variant?: "default" | "line";
  width?: number;
  /** Render each trigger through a `render` wrapper whose child is a box-less span. */
  wrap?: boolean;
}

interface LabControls {
  setHidden: (hidden: boolean) => void;
  setLabels: (labels: Label[]) => void;
  setListStyle: (style: CSSProperties | undefined) => void;
  setMorphing: (on: boolean) => void;
  setMounted: (on: boolean) => void;
  setTabStyle: (style: Record<string, CSSProperties>) => void;
  setValue: (value: string | null) => void;
  setValues: (values: string[]) => void;
}

const labGlobal = globalThis as { __pillLabs?: Record<string, LabControls> };
labGlobal.__pillLabs = labGlobal.__pillLabs ?? {};
const labs = labGlobal.__pillLabs;

/** Setters of `OwnState` children, by lab id: they re-render only themselves. */
const ownVisible: Record<string, (visible: boolean) => void> = {};

/** A child that shows or removes its trigger on its own state, not the lab's. */
function OwnState({
  children,
  id,
  on,
}: {
  children: ReactNode;
  id: string;
  on: boolean;
}) {
  const [visible, setVisible] = useState(true);
  if (on) {
    ownVisible[id] = setVisible;
  }
  return visible ? children : null;
}

/** A trigger rendered through Base UI's `render`, its content in a box-less span. */
const boxlessWrapper = ({ children, ...rest }: ComponentProps<"button">) => (
  <button type="button" {...rest}>
    <span style={{ display: "contents" }}>{children}</span>
  </button>
);

function Lab(props: LabProps) {
  const [value, setValue] = useState<string | null>(
    props.initial === undefined ? "home" : props.initial
  );
  const [labels, setLabels] = useState<Label[]>(props.labels ?? STORY_LABELS);
  const [values, setValues] = useState<string[]>(props.values ?? VALUES);
  const [hidden, setHidden] = useState(false);
  const [morphing, setMorphing] = useState(props.morphing ?? true);
  const [mounted, setMounted] = useState(props.mounted ?? true);
  const [listStyle, setListStyle] = useState(props.listStyle);
  const [tabStyle, setTabStyle] = useState(props.tabStyle ?? {});
  labs[props.id] = {
    setValue,
    setLabels,
    setValues,
    setHidden,
    setMorphing,
    setMounted,
    setListStyle,
    setTabStyle,
  };
  const { onLayout } = props;
  useLayoutEffect(() => {
    onLayout?.();
  });
  const list = mounted ? (
    <Tabs
      onValueChange={(next, details) => {
        // Only a user's activation: Base UI's own picks ("initial",
        // "missing") would undo a controlled null or a value with no tab.
        if (details.reason !== "none") {
          return;
        }
        if (props.cancel && next === props.cancel) {
          details.cancel();
          return;
        }
        setValue(next as string);
      }}
      orientation={props.orientation}
      {...(props.uncontrolled ? { defaultValue: "home" } : { value })}
    >
      <TabsList
        activateOnFocus={props.activateOnFocus}
        morphing={morphing}
        scrollable={props.scrollable}
        shape={props.shape}
        style={listStyle}
        variant={props.variant}
      >
        {values.map((v) => {
          const i = VALUES.indexOf(v);
          const Icon = ICONS[i] ?? HomeIcon;
          // A value outside VALUES gets an empty label: its tab is its icon.
          const label = i < 0 ? 0 : (labels[i] ?? v);
          const content =
            typeof label === "number" ? (
              <span style={{ display: "inline-block", width: label }} />
            ) : (
              label
            );
          return (
            <OwnState id={props.id} key={v} on={v === props.ownState}>
              <TabsTrigger
                data-v={v}
                render={props.wrap ? boxlessWrapper : undefined}
                style={{ ...tabStyle["*"], ...tabStyle[v] }}
                value={v}
              >
                <Icon />
                {morphing ? (
                  <TabsTriggerLabel>{content}</TabsTriggerLabel>
                ) : (
                  content
                )}
              </TabsTrigger>
            </OwnState>
          );
        })}
      </TabsList>
    </Tabs>
  ) : null;
  const configured: ReactNode =
    props.motionConfig || props.staticMotion ? (
      <MotionConfig
        isStatic={props.staticMotion}
        reducedMotion={props.motionConfig}
      >
        {list}
      </MotionConfig>
    ) : (
      list
    );
  const wrapped = props.strict ? (
    <StrictMode>{configured}</StrictMode>
  ) : (
    configured
  );
  return (
    <div
      data-lab={props.id}
      dir={props.dir}
      style={{
        display: hidden && props.hideBy !== "scale" ? "none" : "block",
        width: props.width,
        transform:
          hidden && props.hideBy === "scale" ? "scale(0)" : props.scale,
        transformOrigin: "0 0",
        padding: 16,
      }}
    >
      {wrapped}
    </div>
  );
}

// =============================================================================
// Real input (Vitest) and shared plays
// =============================================================================
interface RealCommands {
  emulateReducedMotion: (reduce: boolean) => Promise<void>;
  writeFile: (path: string, data: string) => Promise<void>;
}
function realCommands() {
  const commands = (globalThis as { __realCommands?: RealCommands })
    .__realCommands;
  if (!commands) {
    throw new Error("real browser commands are required (run under Vitest)");
  }
  return commands;
}

/** A real (trusted) keyboard, so Enter on a focused button clicks it. */
function realKeyboard() {
  const ue = (
    globalThis as {
      __realUserEvent?: { keyboard: (keys: string) => Promise<void> };
    }
  ).__realUserEvent;
  if (!ue) {
    throw new Error("a real keyboard is required (run under Vitest)");
  }
  return ue;
}

/** motion's own view of the reduced-motion preference (read fresh each time). */
const motionPrefers = (): boolean | null => prefersReducedMotion.current;

async function ready() {
  await realCommands().emulateReducedMotion(false);
  await document.fonts.ready;
  await flush();
}

interface Frame {
  box: Box | null;
  /** Every trigger's label width in this frame (0 without a label), by value. */
  lw: Record<string, number>;
  /** Every trigger's border box and padding box, keyed by value. */
  pad: Record<string, Box>;
  t: number;
  tabs: Record<string, Box>;
}

function snapshot(p: ReturnType<typeof parts>, t: number): Frame {
  const tabs: Record<string, Box> = {};
  const pad: Record<string, Box> = {};
  const lw: Record<string, number> = {};
  for (const el of p
    .list()
    .querySelectorAll<HTMLElement>('[data-slot="tabs-trigger"]')) {
    const v = el.getAttribute("data-v") as string;
    tabs[v] = local(el, p.list());
    pad[v] = paddingBox(el, p.list());
    const label = el.querySelector('[data-slot="tabs-trigger-label"]');
    const box = label ? local(label, p.list()) : null;
    lw[v] = box ? box.r - box.l : 0;
  }
  return { t, box: p.pillBox(), tabs, pad, lw };
}

/** Run `act`, then record the pill and the tabs every frame for `ms`. */
async function record(
  clock: ReturnType<typeof manualClock>,
  p: ReturnType<typeof parts>,
  act: () => void | Promise<void>,
  ms = 640,
  onFrame?: (f: Frame, i: number) => void | Promise<void>
) {
  await act();
  await flush();
  const t0 = clock.now;
  const frames: Frame[] = [snapshot(p, 0)];
  while (clock.now - t0 < ms) {
    // biome-ignore lint/performance/noAwaitInLoops: frames are sequential
    await clock.run(1);
    const f = snapshot(p, clock.now - t0);
    frames.push(f);
    await onFrame?.(f, frames.length - 1);
  }
  return frames;
}

const glide = (
  clock: ReturnType<typeof manualClock>,
  p: ReturnType<typeof parts>,
  to: string,
  ms = 640
) => record(clock, p, () => p.tab(to).click(), ms);

/** Every frame inside the involved tabs' outer edges (0.5px in), not empty. */
function spanFailures(frames: Frame[], involved: string[], label: string) {
  const out: string[] = [];
  for (const f of frames) {
    const lo = Math.min(...involved.map((v) => f.tabs[v].l));
    const hi = Math.max(...involved.map((v) => f.tabs[v].r));
    if (!f.box) {
      out.push(`${label} ${f.t}ms: no pill`);
    } else if (f.box.l < lo + 0.5 || f.box.r > hi - 0.5 || f.box.r <= f.box.l) {
      out.push(
        `${label} ${f.t}ms: pill ${f.box.l.toFixed(1)}..${f.box.r.toFixed(1)} outside ${lo.toFixed(1)}..${hi.toFixed(1)}`
      );
    }
  }
  return out;
}

/** The pill's centre passes three distinct positions between the two tabs'. */
function travels(frames: Frame[], from: string, to: string) {
  const seen = new Set<number>();
  const mid = (b: Box) => (b.l + b.r) / 2;
  for (const f of frames) {
    const a = Math.min(mid(f.tabs[from]), mid(f.tabs[to])) + 2;
    const b = Math.max(mid(f.tabs[from]), mid(f.tabs[to])) - 2;
    if (f.box && mid(f.box) > a && mid(f.box) < b) {
      seen.add(Math.round(mid(f.box)));
    }
  }
  return seen.size;
}

const SHAPES = [
  { key: "pill", variant: "default", shape: "pill", line: false },
  { key: "rounded", variant: "default", shape: "rounded", line: false },
  { key: "line", variant: "line", shape: "rounded", line: true },
] as const;

function Labs({ make }: { make: (s: (typeof SHAPES)[number]) => LabProps }) {
  return (
    <div className="flex flex-col gap-2">
      {SHAPES.map((s) => (
        <Lab key={s.key} {...make(s)} />
      ))}
    </div>
  );
}

// =============================================================================
// The span: an adjacent switch onto a 20-character label, default font
// =============================================================================
export const SpanAdjacentLongLabel: Story = {
  tags: TEST_ONLY,
  render: () => (
    <Labs
      make={(s) =>
        s.line
          ? {
              id: s.key,
              variant: s.variant,
              shape: s.shape,
              initial: "chat",
              values: LINE_VALUES,
              labels: [...STORY_LABELS.slice(0, 3), LONG],
            }
          : {
              id: s.key,
              variant: s.variant,
              shape: s.shape,
              initial: "chat",
              labels: [...STORY_LABELS.slice(0, 4), LONG],
            }
      }
    />
  ),
  play: async ({ canvasElement }) => {
    if (outsideVitest()) {
      return;
    }
    await ready();
    const clock = manualClock();
    const failures: string[] = [];
    try {
      for (const s of SHAPES) {
        const p = parts(canvasElement, s.key);
        const [near0, long] = s.line
          ? ["meetings", "inbox"]
          : ["inbox", "search"];
        // An earlier switch, finished: its tabs must not widen the next span.
        // biome-ignore lint/performance/noAwaitInLoops: one list at a time
        await settleAt(clock, p, near0);
        for (const [from, to] of [
          [near0, long],
          [long, near0],
        ]) {
          // biome-ignore lint/performance/noAwaitInLoops: one switch at a time
          const frames = await glide(clock, p, to);
          const label = `${s.key} ${from}->${to}`;
          failures.push(...spanFailures(frames, [from, to], label));
          failures.push(...padFailures(frames, [from, to], label));
          if (travels(frames, from, to) < 3) {
            failures.push(`${label}: did not glide`);
          }
        }
      }
    } finally {
      clock.restore();
    }
    await expect(failures.slice(0, 12)).toEqual([]);
  },
};

// =============================================================================
// The curve: motion's shared-layout formula on live boxes, clamped
// =============================================================================
/** The pill's rest box in `v`'s trigger, from a frame's padding boxes. */
const restIn = (f: Frame, v: string, line: boolean): Box =>
  line ? { ...f.pad[v], t: f.pad[v].b - 2 } : f.pad[v];

/**
 * Where the pill must be at `t` ms after the commit: S, the box it left; C,
 * its rest box in the new tab at the commit; R, that rest box now; each edge
 * clamped to the padding boxes of `involved`.
 */
function expected(
  S: Box,
  C: Box,
  R: Box,
  f: Frame,
  involved: string[],
  t: number
): Box {
  const p = pAt(t);
  const axis = (
    s0: number,
    s1: number,
    c0: number,
    c1: number,
    r0: number,
    r1: number
  ) => {
    const scale = 1 + (1 - p) * ((s1 - s0) / (c1 - c0) - 1);
    const centre = (r0 + r1) / 2 + (1 - p) * ((s0 + s1) / 2 - (c0 + c1) / 2);
    const size = scale * (r1 - r0);
    return [centre - size / 2, centre + size / 2];
  };
  const [l, r] = axis(S.l, S.r, C.l, C.r, R.l, R.r);
  const [top, b] = axis(S.t, S.b, C.t, C.b, R.t, R.b);
  const lo = Math.min(...involved.map((v) => f.pad[v].l));
  const hi = Math.max(...involved.map((v) => f.pad[v].r));
  const top0 = Math.min(...involved.map((v) => f.pad[v].t));
  const bot = Math.max(...involved.map((v) => f.pad[v].b));
  const clamp = (x: number, a: number, z: number) =>
    Math.min(z, Math.max(a, x));
  return {
    l: clamp(l, lo, hi),
    r: clamp(r, lo, hi),
    t: clamp(top, top0, bot),
    b: clamp(b, top0, bot),
  };
}

/** Each frame's four edges within 0.5px of the curve. */
function curveFailures(
  S: Box,
  frames: Frame[],
  to: string,
  involved: string[],
  line: boolean,
  label: string
) {
  const out: string[] = [];
  const C = restIn(frames[0], to, line);
  for (const f of frames) {
    const want = expected(S, C, restIn(f, to, line), f, involved, f.t);
    const got = f.box;
    if (!got) {
      out.push(`${label} ${f.t}ms: no pill`);
      continue;
    }
    const worst = Math.max(
      Math.abs(got.l - want.l),
      Math.abs(got.r - want.r),
      Math.abs(got.t - want.t),
      Math.abs(got.b - want.b)
    );
    if (worst > 0.5) {
      out.push(`${label} ${f.t}ms: pill ${fmt(got)} want ${fmt(want)}`);
    }
  }
  return out;
}

async function settleAt(
  clock: ReturnType<typeof manualClock>,
  p: ReturnType<typeof parts>,
  v: string
) {
  if (p.tab(v).getAttribute("aria-selected") !== "true") {
    p.tab(v).click();
    await flush();
  }

  await clock.run(40);
}

// =============================================================================
// The look at the stories' labels: the curve, frame by frame
// =============================================================================
export const CurveStoryLabels: Story = {
  tags: TEST_ONLY,
  render: () => (
    <Labs
      make={(s) => ({
        id: s.key,
        variant: s.variant,
        shape: s.shape,
        labels: FIXED,
      })}
    />
  ),
  play: async ({ canvasElement }) => {
    if (outsideVitest()) {
      return;
    }
    await ready();
    const clock = manualClock();
    const failures: string[] = [];
    try {
      for (const s of SHAPES) {
        const p = parts(canvasElement, s.key);
        for (const [from, to] of [
          ["home", "search"],
          ["search", "home"],
          ["inbox", "search"],
          ["search", "inbox"],
        ]) {
          // biome-ignore lint/performance/noAwaitInLoops: one switch at a time
          await settleAt(clock, p, from);
          const S = p.pillBox() as Box;
          const frames = await glide(clock, p, to);
          failures.push(
            ...curveFailures(
              S,
              frames,
              to,
              [from, to],
              s.line,
              `${s.key} ${from}->${to}`
            )
          );
        }
      }
    } finally {
      clock.restore();
    }
    await expect(failures.slice(0, 12)).toEqual([]);
  },
};

// =============================================================================
// First paint during a synchronous selection: the box the pill left, also
// when the change commits inside a motion frame
// =============================================================================
export const FirstFrame: Story = {
  tags: TEST_ONLY,
  render: () => <Lab id="first" labels={FIXED} />,
  play: async ({ canvasElement }) => {
    if (outsideVitest()) {
      return;
    }
    await ready();
    const clock = manualClock();
    try {
      const p = parts(canvasElement, "first");
      await settleAt(clock, p, "home");
      const S = p.pillBox() as Box;
      frame.postRender(() => flushSync(() => labs.first.setValue("search")));
      clock.step();
      // Microtasks run before the browser paints; a timer would not.
      await Promise.resolve();
      await Promise.resolve();
      const box = p.pillBox();
      await expect(fmt(box), fmt(S)).toSatisfy(() => near(box, S));
    } finally {
      clock.restore();
    }
  },
};

// =============================================================================
// Server markup and hydration, under StrictMode: in place, no writes
// =============================================================================
export const Hydration: Story = {
  tags: TEST_ONLY,
  render: () => <div data-testid="ssr" />,
  play: async ({ canvasElement }) => {
    if (outsideVitest()) {
      return;
    }
    await ready();
    const clock = manualClock();
    let root: ReturnType<typeof hydrateRoot> | undefined;
    let observer: MutationObserver | undefined;
    try {
      const host = canvasElement.querySelector(
        '[data-testid="ssr"]'
      ) as HTMLElement;
      let committed: () => void = () => undefined;
      const hydrated = new Promise<void>((resolve) => {
        committed = resolve;
      });
      const element = (
        <StrictMode>
          <Lab
            id="ssr"
            initial="chat"
            labels={FIXED}
            onLayout={() => committed()}
          />
        </StrictMode>
      );
      host.innerHTML = renderToString(element);
      const pill = host.querySelector(
        '[data-slot="tabs-morphing-pill"]'
      ) as HTMLElement;
      await expect(pill).toBeTruthy();
      await expect(pill.hasAttribute("style")).toBe(false);
      const writes: string[] = [];
      observer = new MutationObserver((records) => {
        for (const r of records) {
          if (
            (r.target as HTMLElement).dataset?.slot === "tabs-morphing-pill"
          ) {
            writes.push((r.target as HTMLElement).getAttribute("style") ?? "");
          }
        }
      });
      observer.observe(host, {
        attributes: true,
        attributeFilter: ["style"],
        subtree: true,
      });
      const errors: unknown[] = [];
      root = hydrateRoot(host, element, {
        onRecoverableError: (e) => errors.push(e),
      });
      await hydrated;
      await clock.run(5);
      await flush();
      observer.disconnect();
      const p = parts(canvasElement, "ssr");
      await expect(errors).toEqual([]);
      await expect(writes).toEqual([]);
      await expect(p.pill()?.hasAttribute("style")).toBe(false);
      await expect(fmt(p.pillBox()), fmt(p.rest("chat", false))).toSatisfy(() =>
        near(p.pillBox(), p.rest("chat", false))
      );
      // The first real selection under StrictMode glides, and ends at rest.
      await clock.run(40);
      const frames = await glide(clock, p, "search");
      await expect(travels(frames, "chat", "search")).toBeGreaterThanOrEqual(3);
      await expect(padFailures(frames, ["chat", "search"], "strict")).toEqual(
        []
      );
      await expect(p.pill()?.hasAttribute("style")).toBe(false);
    } finally {
      observer?.disconnect();
      root?.unmount();
      clock.restore();
    }
  },
};

// =============================================================================
// No selection, or a value with no tab, then a tab: it appears in place
// =============================================================================
export const NullThenTab: Story = {
  tags: TEST_ONLY,
  render: () => <Lab id="null" labels={FIXED} />,
  play: async ({ canvasElement }) => {
    if (outsideVitest()) {
      return;
    }
    await ready();
    const clock = manualClock();
    const failures: string[] = [];
    const p = parts(canvasElement, "null");
    const inPlace = async (v: string, label: string) => {
      for (let i = 0; i < 6; i++) {
        const box = p.pillBox();
        const want = p.rest(v, false);
        if (!near(box, want) || p.pill()?.hasAttribute("style")) {
          failures.push(
            `${label} frame ${i}: ${fmt(box)} want ${fmt(want)} style ${p.pill()?.getAttribute("style")}`
          );
          return;
        }
        // biome-ignore lint/performance/noAwaitInLoops: frames are sequential
        await clock.run(1);
      }
    };
    try {
      await settleAt(clock, p, "home");
      // Settled, then no selection: the pill goes, the labels collapse.
      flushSync(() => labs.null.setValue(null));
      await flush();
      await clock.run(40);
      if (p.pill()) {
        failures.push("null: a pill remains");
      }
      for (const label of p
        .list()
        .querySelectorAll('[data-slot="tabs-trigger-label"]')) {
        if (label.getBoundingClientRect().width > 0.5) {
          failures.push("null: a label stays open");
        }
      }
      flushSync(() => labs.null.setValue("search"));
      await flush();
      await inPlace("search", "null then search");
      // Mid-glide, then no selection, then another tab.
      p.tab("chat").click();
      await flush();
      await clock.run(5);
      flushSync(() => labs.null.setValue(null));
      await flush();
      flushSync(() => labs.null.setValue("meetings"));
      await flush();
      await inPlace("meetings", "mid-glide null then meetings");
      // A value no tab has, then a tab.
      flushSync(() => labs.null.setValue("nope"));
      await flush();
      await clock.run(1);
      flushSync(() => labs.null.setValue("home"));
      await flush();
      await inPlace("home", "no tab then home");
    } finally {
      clock.restore();
    }
    await expect(failures).toEqual([]);
  },
};

// =============================================================================
// A cancelled activation moves nothing; mid-glide it changes nothing
// =============================================================================
export const CancelledActivation: Story = {
  tags: TEST_ONLY,
  render: () => (
    <div className="flex flex-col gap-2">
      <Lab cancel="search" id="cancel" labels={FIXED} />
      <Lab cancel="search" id="cancel-own" labels={FIXED} uncontrolled />
    </div>
  ),
  play: async ({ canvasElement }) => {
    if (outsideVitest()) {
      return;
    }
    await ready();
    const clock = manualClock();
    const failures: string[] = [];
    const p = parts(canvasElement, "cancel");
    try {
      // Uncontrolled: Tabs itself must not commit a cancelled activation.
      const own = parts(canvasElement, "cancel-own");
      const ownRest = fmt(own.pillBox());
      const ownRun = await record(
        clock,
        own,
        () => own.tab("search").click(),
        200
      );
      for (const f of ownRun) {
        if (fmt(f.box) !== ownRest || own.pill()?.hasAttribute("style")) {
          failures.push(
            `uncontrolled ${f.t}ms: ${fmt(f.box)} (was ${ownRest})`
          );
          break;
        }
      }
      await settleAt(clock, p, "home");
      const S = fmt(p.pillBox());
      const atRest = await record(clock, p, () => p.tab("search").click(), 200);
      for (const f of atRest) {
        if (fmt(f.box) !== S || p.pill()?.hasAttribute("style")) {
          failures.push(`at rest ${f.t}ms: ${fmt(f.box)} (was ${S})`);
          break;
        }
      }
      const control = await glide(clock, p, "chat");
      await settleAt(clock, p, "home");
      const cancelled = await record(
        clock,
        p,
        () => p.tab("chat").click(),
        640,
        async (_f, i) => {
          if (i === 4) {
            p.tab("search").click();
            await flush();
          }
        }
      );
      cancelled.forEach((f, i) => {
        if (!near(f.box, control[i]?.box ?? null)) {
          failures.push(
            `mid-glide ${f.t}ms: ${fmt(f.box)} vs ${fmt(control[i]?.box ?? null)}`
          );
        }
      });
    } finally {
      clock.restore();
    }
    await expect(failures.slice(0, 6)).toEqual([]);
  },
};

// =============================================================================
// The tabs shrink mid-glide: the pill keeps to them
// =============================================================================
export const ResizeMidGlide: Story = {
  tags: TEST_ONLY,
  render: () => <Lab id="resize" labels={FIXED} />,
  play: async ({ canvasElement }) => {
    if (outsideVitest()) {
      return;
    }
    await ready();
    const clock = manualClock();
    const root = document.documentElement;
    const before = root.style.fontSize;
    let failures: string[] = [];
    try {
      const p = parts(canvasElement, "resize");
      await settleAt(clock, p, "home");
      const frames = await record(
        clock,
        p,
        () => p.tab("search").click(),
        640,
        (_f, i) => {
          if (i === 8) {
            root.style.fontSize = "12px";
          }
        }
      );
      // From the frame after the change, re-read against the new layout.
      failures = spanFailures(frames.slice(9), ["home", "search"], "shrunk");
    } finally {
      root.style.fontSize = before;
      clock.restore();
    }
    await expect(failures.slice(0, 6)).toEqual([]);
  },
};

// =============================================================================
// At rest the pill carries no style of its own; a consumer's survives
// =============================================================================
export const RestCleanup: Story = {
  tags: TEST_ONLY,
  render: () => <Lab id="rest" labels={FIXED} />,
  play: async ({ canvasElement }) => {
    if (outsideVitest()) {
      return;
    }
    await ready();
    const clock = manualClock();
    try {
      const p = parts(canvasElement, "rest");
      await settleAt(clock, p, "home");
      await glide(clock, p, "search");
      await expect(p.pill()?.getAttribute("style") ?? null).toBe(null);
      flushSync(() => labs.rest.setLabels([34, 28, 58, 33, 90]));
      await flush();
      await clock.run(1);
      await expect(fmt(p.pillBox()), fmt(p.rest("search", false))).toSatisfy(
        () => near(p.pillBox(), p.rest("search", false))
      );
      // A consumer's own inline declaration outlives the glide.
      p.tab("home").click();
      await flush();
      (p.pill() as HTMLElement).style.opacity = "0.9";
      await clock.run(40);
      const pill = p.pill() as HTMLElement;
      await expect(pill.style.opacity).toBe("0.9");
      await expect(
        ["left", "top", "width", "height", "right", "bottom"].map((k) =>
          pill.style.getPropertyValue(k)
        )
      ).toEqual(["", "", "", "", "", ""]);
    } finally {
      clock.restore();
    }
  },
};

/** Style writes on pill elements under `host`, from now until stopped. */
function watchPillStyles(host: HTMLElement) {
  const writes: string[] = [];
  const pills = new Set<Element>(
    host.querySelectorAll('[data-slot="tabs-morphing-pill"]')
  );
  const observer = new MutationObserver((records) => {
    for (const r of records) {
      writes.push((r.target as HTMLElement).getAttribute("style") ?? "");
    }
  });
  for (const pill of pills) {
    observer.observe(pill, { attributes: true, attributeFilter: ["style"] });
  }
  return {
    writes,
    stop: () => {
      observer.takeRecords();
      observer.disconnect();
    },
  };
}

// =============================================================================
// The tab the pill left is removed mid-glide: it rests from the next frame
// =============================================================================
export const SourceRemoved: Story = {
  tags: TEST_ONLY,
  render: () => <Lab id="removed" labels={FIXED} />,
  play: async ({ canvasElement }) => {
    if (outsideVitest()) {
      return;
    }
    await ready();
    const clock = manualClock();
    try {
      const p = parts(canvasElement, "removed");
      await settleAt(clock, p, "home");
      p.tab("search").click();
      await flush();
      await clock.run(5);
      flushSync(() =>
        labs.removed.setValues(VALUES.filter((v) => v !== "home"))
      );
      await flush();
      await clock.run(1);
      await expect(p.pill()?.getAttribute("style") ?? null).toBe(null);
      const watch = watchPillStyles(p.host);
      await clock.run(5);
      watch.stop();
      await expect(watch.writes).toEqual([]);
      await expect(fmt(p.pillBox()), fmt(p.rest("search", false))).toSatisfy(
        () => near(p.pillBox(), p.rest("search", false))
      );
    } finally {
      clock.restore();
    }
  },
};

// =============================================================================
// Right to left, and a vertical list: the same curve in physical px
// =============================================================================
export const RightToLeft: Story = {
  tags: TEST_ONLY,
  render: () => <Lab dir="rtl" id="rtl" labels={[60, 20, 90, 15, 46]} />,
  play: async ({ canvasElement }) => {
    if (outsideVitest()) {
      return;
    }
    await ready();
    const clock = manualClock();
    const failures: string[] = [];
    try {
      const p = parts(canvasElement, "rtl");
      for (const [from, to] of [
        ["home", "search"],
        ["search", "chat"],
      ]) {
        // biome-ignore lint/performance/noAwaitInLoops: one switch at a time
        await settleAt(clock, p, from);
        const S = p.pillBox() as Box;
        const frames = await glide(clock, p, to);
        failures.push(
          ...curveFailures(
            S,
            frames,
            to,
            [from, to],
            false,
            `rtl ${from}->${to}`
          )
        );
        if (travels(frames, from, to) < 3) {
          failures.push(`rtl ${from}->${to}: did not glide`);
        }
      }
    } finally {
      clock.restore();
    }
    await expect(failures.slice(0, 8)).toEqual([]);
  },
};

export const Vertical: Story = {
  tags: TEST_ONLY,
  render: () => (
    <div className="flex gap-8">
      <Lab id="vertical" labels={FIXED} orientation="vertical" width={200} />
      <Lab
        id="vertical-line"
        labels={FIXED}
        orientation="vertical"
        variant="line"
        width={200}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    if (outsideVitest()) {
      return;
    }
    await ready();
    const clock = manualClock();
    const failures: string[] = [];
    try {
      for (const [id, line] of [
        ["vertical", false],
        ["vertical-line", true],
      ] as const) {
        const p = parts(canvasElement, id);
        // biome-ignore lint/performance/noAwaitInLoops: one list at a time
        await settleAt(clock, p, "home");
        const S = p.pillBox() as Box;
        const frames = await glide(clock, p, "search");
        failures.push(
          ...curveFailures(S, frames, "search", ["home", "search"], line, id)
        );
        const between = new Set<number>();
        for (const f of frames) {
          if (
            f.box &&
            f.box.t > f.pad.home.t + 2 &&
            f.box.t < f.pad.search.t - 2
          ) {
            between.add(Math.round(f.box.t));
          }
        }
        if (between.size < 3) {
          failures.push(`${id}: only ${between.size} positions between`);
        }
      }
    } finally {
      clock.restore();
    }
    await expect(failures.slice(0, 8)).toEqual([]);
  },
};

// =============================================================================
// Reduced motion, the system's and the app's: the pill jumps
// =============================================================================
export const ReducedMotion: Story = {
  tags: TEST_ONLY,
  render: () => (
    <div className="flex flex-col gap-2">
      <Lab id="os" labels={FIXED} mounted={false} />
      <Lab id="user" labels={FIXED} motionConfig="user" mounted={false} />
      <Lab id="app" labels={FIXED} motionConfig="always" />
      <Lab id="static" labels={FIXED} staticMotion />
    </div>
  ),
  play: async ({ canvasElement }) => {
    if (outsideVitest()) {
      return;
    }
    await ready();
    const commands = realCommands();
    const clock = manualClock();
    const failures: string[] = [];
    const jumps = async (id: string) => {
      const p = parts(canvasElement, id);
      await settleAt(clock, p, "home");
      p.tab("search").click();
      await flush();
      for (let i = 0; i < 3; i++) {
        if (
          !near(p.pillBox(), p.rest("search", false)) ||
          p.pill()?.hasAttribute("style")
        ) {
          failures.push(
            `${id} frame ${i}: ${fmt(p.pillBox())} style ${p.pill()?.getAttribute("style")}`
          );
          return;
        }
        // biome-ignore lint/performance/noAwaitInLoops: frames are sequential
        await clock.run(1);
      }
    };
    // motion learns the preference from a media-query change event.
    const until = async (want: boolean) => {
      for (let i = 0; i < 200 && motionPrefers() !== want; i++) {
        // biome-ignore lint/performance/noAwaitInLoops: waiting for the emulation
        await flush();
      }
      if (motionPrefers() !== want) {
        throw new Error(`motion never saw reduced motion = ${want}`);
      }
    };
    try {
      await commands.emulateReducedMotion(true);
      await until(true);
      await flush();
      flushSync(() => {
        labs.os.setMounted(true);
        labs.user.setMounted(true);
      });
      await flush();
      await jumps("os");
      await jumps("user");
      await commands.emulateReducedMotion(false);
      await until(false);
      await jumps("app");
      await jumps("static");
    } finally {
      await commands.emulateReducedMotion(false);
      clock.restore();
    }
    await expect(failures).toEqual([]);
  },
};

// =============================================================================
// Interrupted by a click and by the keyboard: continuous, inside the tabs
// =============================================================================
export const Interruption: Story = {
  tags: TEST_ONLY,
  render: () => <Lab activateOnFocus id="interrupt" labels={FIXED} />,
  play: async ({ canvasElement }) => {
    if (outsideVitest()) {
      return;
    }
    await ready();
    const clock = manualClock();
    const failures: string[] = [];
    const p = parts(canvasElement, "interrupt");
    const jump = (a: Box | null, b: Box | null, label: string) => {
      if (!(a && b)) {
        failures.push(`${label}: no pill`);
        return;
      }
      const d = Math.max(
        Math.abs(a.l - b.l),
        Math.abs(a.r - b.r),
        Math.abs(a.t - b.t),
        Math.abs(a.b - b.b)
      );
      if (d > 0.5) {
        failures.push(
          `${label}: jumps ${d.toFixed(1)}px (${fmt(a)} -> ${fmt(b)})`
        );
      }
    };
    try {
      await settleAt(clock, p, "home");
      const first = await glide(clock, p, "meetings", 6 * FRAME);
      const byClick = await glide(clock, p, "search", 6 * FRAME);
      jump(first.at(-1)?.box ?? null, byClick[0].box, "click");
      failures.push(
        ...spanFailures(byClick, ["home", "meetings", "search"], "after click")
      );
      // The keyboard: focus moves and, with activateOnFocus, selects.
      const before = p.pillBox();
      p.tab("search").focus();
      p.tab("search").dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true })
      );
      await flush();
      const byKey = await record(clock, p, () => undefined, 640);
      if (p.tab("inbox").getAttribute("aria-selected") !== "true") {
        failures.push("ArrowLeft did not select inbox");
      }
      jump(before, byKey[0].box, "key");
      failures.push(
        ...spanFailures(
          byKey,
          ["home", "meetings", "search", "inbox"],
          "after key"
        )
      );
      const end = byKey.at(-1)?.box ?? null;
      if (!near(end, p.rest("inbox", false))) {
        failures.push(
          `ends at ${fmt(end)}, not ${fmt(p.rest("inbox", false))}`
        );
      }
    } finally {
      clock.restore();
    }
    await expect(failures.slice(0, 8)).toEqual([]);
  },
};

// =============================================================================
// Two lists at once: each keeps its own glide
// =============================================================================
export const TwoLists: Story = {
  tags: TEST_ONLY,
  render: () => (
    <div className="flex flex-col gap-2">
      <Lab id="a" labels={FIXED} />
      <Lab id="b" labels={FIXED} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    if (outsideVitest()) {
      return;
    }
    await ready();
    const clock = manualClock();
    const failures: string[] = [];
    const a = parts(canvasElement, "a");
    const b = parts(canvasElement, "b");
    try {
      await settleAt(clock, b, "chat");
      const solo = await glide(clock, b, "meetings");
      await settleAt(clock, b, "chat");
      await settleAt(clock, a, "home");
      a.tab("search").click();
      await flush();
      await clock.run(3);
      const both = await record(
        clock,
        b,
        () => b.tab("meetings").click(),
        640,
        async (_f, i) => {
          if (i === 3) {
            a.tab("inbox").click();
            await flush();
          }
          if (i === 6) {
            flushSync(() => labs.a.setMounted(false));
            await flush();
          }
        }
      );
      both.forEach((f, i) => {
        if (!near(f.box, solo[i]?.box ?? null)) {
          failures.push(
            `b ${f.t}ms: ${fmt(f.box)} vs solo ${fmt(solo[i]?.box ?? null)}`
          );
        }
      });
    } finally {
      clock.restore();
    }
    await expect(failures.slice(0, 6)).toEqual([]);
  },
};

// =============================================================================
// Non-morphing lists have no pill; turning morphing off stops the glide
// =============================================================================
export const MorphingOff: Story = {
  tags: TEST_ONLY,
  render: () => (
    <div className="flex flex-col gap-2">
      <Lab id="plain" labels={FIXED} morphing={false} />
      <Lab id="toggle" labels={FIXED} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    if (outsideVitest()) {
      return;
    }
    await ready();
    const clock = manualClock();
    try {
      const plain = parts(canvasElement, "plain");
      await expect(plain.pill()).toBeNull();
      const p = parts(canvasElement, "toggle");
      await settleAt(clock, p, "home");
      p.tab("search").click();
      await flush();
      await clock.run(4);
      const old = p.pill() as HTMLElement;
      const writes: string[] = [];
      const observer = new MutationObserver(() =>
        writes.push(old.getAttribute("style") ?? "")
      );
      flushSync(() => labs.toggle.setMorphing(false));
      await flush();
      observer.observe(old, { attributes: true, attributeFilter: ["style"] });
      await clock.run(5);
      observer.disconnect();
      await expect(p.pill()).toBeNull();
      await expect(writes).toEqual([]);
      flushSync(() => labs.toggle.setMorphing(true));
      await flush();
      await expect(fmt(p.pillBox()), fmt(p.rest("search", false))).toSatisfy(
        () => near(p.pillBox(), p.rest("search", false))
      );
    } finally {
      clock.restore();
    }
  },
};

// =============================================================================
// In a scrolled Reel, either direction: still inside the tabs
// =============================================================================
export const ScrolledReel: Story = {
  tags: TEST_ONLY,
  render: () => (
    <div className="flex flex-col gap-2">
      <Lab id="reel-ltr" labels={FIXED} scrollable width={200} />
      <Lab dir="rtl" id="reel-rtl" labels={FIXED} scrollable width={200} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    if (outsideVitest()) {
      return;
    }
    await ready();
    const clock = manualClock();
    const failures: string[] = [];
    try {
      for (const [id, offset] of [
        ["reel-ltr", 40],
        ["reel-rtl", -40],
      ] as const) {
        const p = parts(canvasElement, id);
        // biome-ignore lint/performance/noAwaitInLoops: one list at a time
        await settleAt(clock, p, "chat");
        const viewport = p.host.querySelector(
          '[data-slot="reel-viewport"]'
        ) as HTMLElement;
        viewport.scrollLeft = offset;
        await flush();
        if (Math.abs(viewport.scrollLeft) < 1) {
          failures.push(`${id}: did not scroll`);
        }
        // Scrolled twice more while the pill moves.
        const seen = new Set<number>();
        const frames = await record(
          clock,
          p,
          () => p.tab("meetings").click(),
          640,
          (_f, i) => {
            if (i === 3 || i === 9) {
              viewport.scrollLeft = (i === 3 ? 0.5 : 1.5) * offset;
            }
            seen.add(Math.round(viewport.scrollLeft));
          }
        );
        if (seen.size < 3) {
          failures.push(`${id}: scrolled to only ${[...seen].join(", ")}`);
        }
        failures.push(...spanFailures(frames, ["chat", "meetings"], id));
        failures.push(...padFailures(frames, ["chat", "meetings"], id));
      }
    } finally {
      clock.restore();
    }
    await expect(failures.slice(0, 6)).toEqual([]);
  },
};

// =============================================================================
// Inside a scaled ancestor: inside the tabs, no jump at release
// =============================================================================
export const ScaledAncestor: Story = {
  tags: TEST_ONLY,
  render: () => <Lab id="scaled" labels={FIXED} scale="scale(0.8, 1)" />,
  play: async ({ canvasElement }) => {
    if (outsideVitest()) {
      return;
    }
    await ready();
    const clock = manualClock();
    const failures: string[] = [];
    try {
      const p = parts(canvasElement, "scaled");
      await settleAt(clock, p, "home");
      const S = p.pillBox() as Box;
      const frames = await glide(clock, p, "search");
      failures.push(...spanFailures(frames, ["home", "search"], "scaled"));
      // Screen boxes under a per-axis scale follow the same curve.
      failures.push(
        ...curveFailures(
          S,
          frames,
          "search",
          ["home", "search"],
          false,
          "scaled"
        )
      );
      const end = frames.at(-1)?.box ?? null;
      if (!near(end, p.rest("search", false))) {
        failures.push(
          `ends at ${fmt(end)}, not ${fmt(p.rest("search", false))}`
        );
      }
    } finally {
      clock.restore();
    }
    await expect(failures.slice(0, 6)).toEqual([]);
  },
};

// =============================================================================
// Changed while hidden, then shown: in place, nothing written
// =============================================================================
export const ChangedWhileHidden: Story = {
  tags: TEST_ONLY,
  render: () => (
    <div className="flex flex-col gap-2">
      <Lab id="hidden" labels={FIXED} />
      <Lab hideBy="scale" id="hidden-scale" labels={FIXED} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    if (outsideVitest()) {
      return;
    }
    await ready();
    const clock = manualClock();
    const failures: string[] = [];
    try {
      // `display: none` (no layout at all), and a zero scale (laid out, no size).
      for (const id of ["hidden", "hidden-scale"]) {
        const p = parts(canvasElement, id);
        // biome-ignore lint/performance/noAwaitInLoops: one list at a time
        await settleAt(clock, p, "home");
        const writes = watchAllPills(p.host);
        flushSync(() => labs[id].setHidden(true));
        await flush();
        flushSync(() => labs[id].setValue("search"));
        await flush();
        await clock.run(3);
        flushSync(() => labs[id].setHidden(false));
        await flush();
        await clock.run(1);
        const written = writes();
        if (written.length > 0) {
          failures.push(`${id}: wrote ${written.join(" | ")}`);
        }
        const style = p.pill()?.getAttribute("style") ?? null;
        if (style !== null) {
          failures.push(`${id}: style ${style}`);
        }
        if (!near(p.pillBox(), p.rest("search", false))) {
          failures.push(
            `${id}: ${fmt(p.pillBox())} not ${fmt(p.rest("search", false))}`
          );
        }
      }
    } finally {
      clock.restore();
    }
    await expect(failures).toEqual([]);
  },
};

// =============================================================================
// Unmounted mid-glide: no error, nothing read or written afterwards
// =============================================================================
export const UnmountMidGlide: Story = {
  tags: TEST_ONLY,
  render: () => (
    <div className="flex flex-col gap-2">
      <Lab id="unmount" labels={FIXED} />
      <Lab id="own-state" labels={FIXED} ownState="search" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    if (outsideVitest()) {
      return;
    }
    await ready();
    const clock = manualClock();
    const proto = Element.prototype;
    const original = proto.getBoundingClientRect;
    const frames = trackPostRender();
    let reads = 0;
    let live = -1;
    const writes: string[] = [];
    const errors: unknown[] = [];
    const onError = (e: ErrorEvent) => errors.push(e.message);
    window.addEventListener("error", onError);
    const observer = new MutationObserver((r) =>
      writes.push(
        ...r.map((m) => (m.target as HTMLElement).getAttribute("style") ?? "")
      )
    );
    try {
      const p = parts(canvasElement, "unmount");
      await settleAt(clock, p, "home");
      p.tab("search").click();
      await flush();
      await clock.run(4);
      const saved = p.pill() as HTMLElement;
      flushSync(() => labs.unmount.setMounted(false));
      // The shared frame callback ends with the commit that empties it.
      live = frames.live();
      observer.observe(saved, { attributes: true, attributeFilter: ["style"] });
      await flush();
      proto.getBoundingClientRect = function (this: Element) {
        reads++;
        return original.call(this);
      };
      await clock.run(5);
      writes.push(
        ...observer
          .takeRecords()
          .map((r) => (r.target as HTMLElement).getAttribute("style") ?? "")
      );
    } finally {
      observer.disconnect();
      proto.getBoundingClientRect = original;
      window.removeEventListener("error", onError);
      frames.restore();
      clock.restore();
    }
    await expect(errors).toEqual([]);
    await expect(reads).toBe(0);
    await expect(writes).toEqual([]);
    await expect(live, "frame callbacks left after unmount").toBe(0);
    await ownStateRemoval(canvasElement);
  },
};

/**
 * The active trigger removed by a child component's own state mid-glide: the
 * list itself does not re-render, and the run still ends with its pill.
 */
async function ownStateRemoval(root: HTMLElement) {
  const clock = manualClock();
  const frames = trackPostRender();
  const out = { before: -1, after: -1, writes: [] as string[], width: "" };
  try {
    const p = parts(root, "own-state");
    await settleAt(clock, p, "home");
    p.tab("search").click();
    await flush();
    await clock.run(4);
    out.before = frames.live();
    const saved = p.pill() as HTMLElement;
    flushSync(() => ownVisible["own-state"](false));
    out.after = frames.live();
    saved.style.width = "17px";
    const observer = new MutationObserver((r) =>
      out.writes.push(...r.map(() => saved.getAttribute("style") ?? ""))
    );
    observer.observe(saved, { attributes: true, attributeFilter: ["style"] });
    await clock.run(5);
    out.writes.push(
      ...observer.takeRecords().map(() => saved.getAttribute("style") ?? "")
    );
    observer.disconnect();
    out.width = saved.style.width;
  } finally {
    frames.restore();
    clock.restore();
  }
  // One assertion, so a failure shows every count at once.
  await expect(out).toEqual({
    before: 1,
    after: 0,
    writes: [],
    width: "17px",
  });
}

// =============================================================================
// The box the browser lays out: padding edges, to under one layout step
// =============================================================================
const fmt4 = (b: Box | null) =>
  b
    ? `${b.l.toFixed(4)}..${b.r.toFixed(4)} x ${b.t.toFixed(4)}..${b.b.toFixed(4)}`
    : "none";

/** The union of the padding boxes of `involved` in one frame. */
function spanOf(f: Frame, involved: string[]): Box {
  const pads = involved.map((v) => f.pad[v]).filter(Boolean);
  return {
    l: Math.min(...pads.map((b) => b.l)),
    r: Math.max(...pads.map((b) => b.r)),
    t: Math.min(...pads.map((b) => b.t)),
    b: Math.max(...pads.map((b) => b.b)),
  };
}

/**
 * Every frame inside the involved tabs' padding boxes on both axes, to within
 * `tol` px, with positive area.
 */
function padFailures(
  frames: Frame[],
  involved: string[],
  label: string,
  tol = 0.001
) {
  const out: string[] = [];
  for (const f of frames) {
    const span = spanOf(f, involved);
    const b = f.box;
    if (!b) {
      out.push(`${label} ${f.t}ms: no pill`);
    } else if (
      b.l < span.l - tol ||
      b.r > span.r + tol ||
      b.t < span.t - tol ||
      b.b > span.b + tol ||
      b.r <= b.l ||
      b.b <= b.t
    ) {
      out.push(`${label} ${f.t}ms: pill ${fmt4(b)} outside ${fmt4(span)}`);
    }
  }
  return out;
}

type Callback = (...args: never[]) => unknown;
interface StepLike {
  cancel: (fn: Callback) => void;
  schedule: (fn: Callback, keepAlive?: boolean, immediate?: boolean) => unknown;
}

/**
 * Watch motion's postRender step: which callbacks are kept alive and which are
 * cancelled, by identity. The pill's shared frame pass is the only keep-alive
 * postRender callback a Tabs list schedules.
 */
function trackPostRender() {
  const step = frameSteps.postRender as unknown as StepLike;
  const { schedule, cancel } = step;
  const kept = new Set<Callback>();
  const cancelled = new Set<Callback>();
  step.schedule = (fn, keepAlive, immediate) => {
    if (keepAlive) {
      kept.add(fn);
      cancelled.delete(fn);
    }
    return schedule.call(step, fn, keepAlive, immediate);
  };
  step.cancel = (fn) => {
    cancelled.add(fn);
    cancel.call(step, fn);
  };
  return {
    /** Kept-alive callbacks not cancelled since they were scheduled. */
    live: () => [...kept].filter((fn) => !cancelled.has(fn)).length,
    restore() {
      step.schedule = schedule;
      step.cancel = cancel;
    },
  };
}

/**
 * Record, in call order, every layout read ("R": getBoundingClientRect,
 * getComputedStyle) and every inline geometry write ("W") made while `fn`
 * runs. Synchronous wrappers, so the order inside one frame pass is exact.
 */
function readsAndWrites(fn: () => void) {
  const events: string[] = [];
  const proto = Element.prototype;
  const gbcr = proto.getBoundingClientRect;
  const gcs = window.getComputedStyle;
  const decl = CSSStyleDeclaration.prototype;
  const remove = decl.removeProperty;
  const setters: [string, PropertyDescriptor][] = [];
  proto.getBoundingClientRect = function (this: Element) {
    events.push("R");
    return gbcr.call(this);
  };
  window.getComputedStyle = (...args) => {
    events.push("R");
    return gcs.apply(window, args);
  };
  decl.removeProperty = function (this: CSSStyleDeclaration, name: string) {
    events.push("W");
    return remove.call(this, name);
  };
  for (const key of ["left", "top", "width", "height", "right", "bottom"]) {
    const d = Object.getOwnPropertyDescriptor(decl, key);
    if (d?.set) {
      setters.push([key, d]);
      const set = d.set;
      Object.defineProperty(decl, key, {
        ...d,
        set(this: CSSStyleDeclaration, v: string) {
          events.push("W");
          set.call(this, v);
        },
      });
    }
  }
  try {
    fn();
  } finally {
    proto.getBoundingClientRect = gbcr;
    window.getComputedStyle = gcs;
    decl.removeProperty = remove;
    for (const [key, d] of setters) {
      Object.defineProperty(decl, key, d);
    }
  }
  return events;
}

/** Style-attribute writes on any pill under `host`, including pills added later. */
function watchAllPills(host: HTMLElement, except?: Element | null) {
  const records: MutationRecord[] = [];
  const observer = new MutationObserver((r) => records.push(...r));
  observer.observe(host, {
    attributes: true,
    attributeFilter: ["style"],
    subtree: true,
  });
  return () => {
    records.push(...observer.takeRecords());
    const writes = records
      .filter(
        (r) =>
          (r.target as HTMLElement).dataset?.slot === "tabs-morphing-pill" &&
          r.target !== except
      )
      .map((r) => (r.target as HTMLElement).getAttribute("style") ?? "");
    observer.disconnect();
    return writes;
  };
}

/** Run `act` inside a motion frame's postRender, step that frame, run microtasks. */
async function commitInFrame(
  clock: ReturnType<typeof manualClock>,
  act: () => void
) {
  frame.postRender(() => flushSync(act));
  clock.step();
  // Microtasks run before the browser paints; a timer would not.
  await Promise.resolve();
  await Promise.resolve();
}

const EIGHTY: Record<string, CSSProperties> = {
  "*": { width: 80, flex: "none" },
};
const FLUSH_LIST: CSSProperties = { padding: 0, gap: 0 };

// =============================================================================
// The first painted frame when the same commit moves the tabs
// =============================================================================
export const FirstFrameTabsMoved: Story = {
  tags: TEST_ONLY,
  render: () => (
    <div className="flex flex-col gap-2">
      <Lab
        id="moved-away"
        initial="a"
        listStyle={FLUSH_LIST}
        tabStyle={EIGHTY}
        values={["p", "q", "r", "a", "b"]}
      />
      <Lab
        id="moved-partly"
        initial="a"
        listStyle={FLUSH_LIST}
        tabStyle={{ ...EIGHTY, p: { width: 40, flex: "none" } }}
        values={["p", "q", "r", "b", "a"]}
      />
      <Lab
        id="retarget-removed"
        initial="a"
        listStyle={FLUSH_LIST}
        tabStyle={EIGHTY}
        values={["a", "b", "c"]}
      />
      <Lab
        id="retarget-nested"
        initial="a"
        listStyle={FLUSH_LIST}
        tabStyle={EIGHTY}
        values={["a", "b", "c"]}
      />
      <Lab
        id="nested-mid-glide"
        initial="a"
        listStyle={FLUSH_LIST}
        tabStyle={EIGHTY}
        values={["a", "b", "c"]}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    if (outsideVitest()) {
      return;
    }
    await ready();
    const clock = manualClock();
    const failures: string[] = [];
    try {
      // P, Q and R removed as B is selected: the box the pill left lies wholly
      // past the two tabs, so there is no glide and the pill is at B at once.
      const away = parts(canvasElement, "moved-away");
      await clock.run(2);
      await commitInFrame(clock, () => {
        labs["moved-away"].setValues(["a", "b"]);
        labs["moved-away"].setValue("b");
      });
      const a0 = snapshot(away, 0);
      failures.push(...padFailures([a0], ["a", "b"], "moved away"));
      if (!near(a0.box, away.rest("b", false), 0.001)) {
        failures.push(
          `moved away: ${fmt4(a0.box)}, not at B ${fmt4(away.rest("b", false))}`
        );
      }
      if (away.pill()?.hasAttribute("style")) {
        failures.push(
          `moved away: style ${away.pill()?.getAttribute("style")}`
        );
      }
      // P removed as B (left of A) is selected: the box the pill left now
      // overlaps the tabs in part; the first frame is that box clamped to them.
      const partly = parts(canvasElement, "moved-partly");
      const S = partly.pillBox() as Box;
      await commitInFrame(clock, () => {
        labs["moved-partly"].setValues(["q", "r", "b", "a"]);
        labs["moved-partly"].setValue("b");
      });
      const p0 = snapshot(partly, 0);
      failures.push(...padFailures([p0], ["a", "b"], "moved partly"));
      const span = spanOf(p0, ["a", "b"]);
      const want = {
        l: Math.max(S.l, span.l),
        r: Math.min(S.r, span.r),
        t: Math.max(S.t, span.t),
        b: Math.min(S.b, span.b),
      };
      if (!near(p0.box, want, 1 / 64)) {
        failures.push(`moved partly: ${fmt4(p0.box)}, want ${fmt4(want)}`);
      }
      const rest = await record(clock, partly, () => undefined, 640);
      failures.push(...padFailures(rest, ["a", "b"], "moved partly, glide"));
      // A -> B, then C selected mid-glide in the commit that removes A: the
      // handoff inherits a removed tab, so no glide and nothing written.
      const re = parts(canvasElement, "retarget-removed");
      re.tab("b").click();
      await flush();
      await clock.run(3);
      const old = re.pill();
      const writes = watchAllPills(re.host, old);
      await commitInFrame(clock, () => {
        labs["retarget-removed"].setValues(["b", "c"]);
        labs["retarget-removed"].setValue("c");
      });
      await clock.run(3);
      const written = writes();
      if (written.length > 0) {
        failures.push(`retarget, A removed: wrote ${written.join(" | ")}`);
      }
      if (!near(re.pillBox(), re.rest("c", false), 0.001)) {
        failures.push(
          `retarget, A removed: ${fmt4(re.pillBox())}, not at C ${fmt4(re.rest("c", false))}`
        );
      }
      failures.push(...(await nestedParticipant(canvasElement, clock)));
    } finally {
      clock.restore();
    }
    await expect(failures.slice(0, 8)).toEqual([]);
  },
};

/**
 * Move a trigger's own node into a nested tabs list inside the same list (a
 * box-less wrapper, so nothing moves on screen). It stays connected and inside
 * the outer list, but it is no longer one of that list's tabs. Returns the undo.
 */
function nestInList(tab: HTMLElement) {
  const nested = document.createElement("div");
  nested.setAttribute("data-slot", "tabs-list");
  nested.style.display = "contents";
  tab.before(nested);
  nested.append(tab);
  return () => nested.replaceWith(tab);
}

/**
 * A participant moved into a nested list mid-glide: retargeting then writes
 * nothing to the new pill, and a glide stepped once afterwards ends.
 */
async function nestedParticipant(
  root: HTMLElement,
  clock: ReturnType<typeof manualClock>
) {
  const failures: string[] = [];
  // A -> B, then A nested and C selected before another frame.
  const re = parts(root, "retarget-nested");
  re.tab("b").click();
  await flush();
  await clock.run(3);
  const old = re.pill();
  const writes = watchAllPills(re.host, old);
  let undo: () => void = () => undefined;
  try {
    await commitInFrame(clock, () => {
      undo = nestInList(re.tab("a"));
      labs["retarget-nested"].setValue("c");
    });
    const first = re.pillBox();
    await clock.run(3);
    const written = writes();
    if (written.length > 0) {
      failures.push(`retarget, A nested: wrote ${written.join(" | ")}`);
    }
    if (!near(first, re.rest("c", false))) {
      failures.push(
        `retarget, A nested: first box ${fmt(first)}, not at C ${fmt(re.rest("c", false))}`
      );
    }
  } finally {
    undo();
  }
  // A -> B, A nested mid-glide, one frame: the glide ends, the pill is at CSS.
  const mid = parts(root, "nested-mid-glide");
  mid.tab("b").click();
  await flush();
  await clock.run(3);
  const pill = mid.pill() as HTMLElement;
  if (!pill.hasAttribute("style")) {
    failures.push("nested mid-glide: no glide to end");
  }
  const restore = nestInList(mid.tab("a"));
  try {
    await clock.run(1);
    if (pill.hasAttribute("style")) {
      failures.push(
        `nested mid-glide: still written after a frame: ${pill.getAttribute("style")}`
      );
    }
  } finally {
    restore();
  }
  return failures;
}

// =============================================================================
// The line's strip keeps its height on the bottom edge while the tabs grow or
// shrink
// =============================================================================
export const LineTabHeightMidGlide: Story = {
  tags: TEST_ONLY,
  render: () => (
    <div className="flex flex-col gap-2">
      {["grow", "shrink"].map((id) => (
        <Lab
          id={id}
          key={id}
          labels={FIXED}
          tabStyle={{ "*": { height: 32 } }}
          values={LINE_VALUES}
          variant="line"
        />
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    if (outsideVitest()) {
      return;
    }
    await ready();
    const clock = manualClock();
    const failures: string[] = [];
    try {
      for (const [id, h] of [
        ["grow", 48],
        ["shrink", 24],
      ] as const) {
        const p = parts(canvasElement, id);
        // biome-ignore lint/performance/noAwaitInLoops: one list at a time
        await settleAt(clock, p, "home");
        const frames = await record(
          clock,
          p,
          () => p.tab("inbox").click(),
          640,
          (_f, i) => {
            if (i === 3) {
              flushSync(() => labs[id].setTabStyle({ "*": { height: h } }));
            }
          }
        );
        const after = frames.slice(4);
        for (const f of after) {
          const b = f.box;
          if (
            !b ||
            Math.abs(b.b - f.pad.inbox.b) > 0.02 ||
            Math.abs(b.b - b.t - 2) > 0.02
          ) {
            failures.push(
              `${id} ${f.t}ms: ${fmt4(b)}, want a 2px strip on ${f.pad.inbox.b.toFixed(4)}`
            );
            break;
          }
        }
        failures.push(...padFailures(frames, ["home", "inbox"], id));
        if (travels(after, "home", "inbox") < 3) {
          failures.push(`${id}: the glide ended when the tabs changed`);
        }
        await clock.run(1);
        if (
          !near(p.pillBox(), p.rest("inbox", true), 0.001) ||
          p.pill()?.hasAttribute("style")
        ) {
          failures.push(
            `${id} after release: ${fmt4(p.pillBox())} style ${p.pill()?.getAttribute("style")}`
          );
        }
      }
    } finally {
      clock.restore();
    }
    await expect(failures.slice(0, 8)).toEqual([]);
  },
};

// =============================================================================
// A tab's border changes mid-glide: the pill keeps to the live padding edges
// =============================================================================
export const BorderMidGlide: Story = {
  tags: TEST_ONLY,
  render: () => (
    <Lab
      id="border"
      labels={FIXED}
      listStyle={FLUSH_LIST}
      tabStyle={EIGHTY}
      values={["home", "chat"]}
    />
  ),
  play: async ({ canvasElement }) => {
    if (outsideVitest()) {
      return;
    }
    await ready();
    const clock = manualClock();
    let failures: string[] = [];
    try {
      const p = parts(canvasElement, "border");
      await settleAt(clock, p, "home");
      const frames = await record(
        clock,
        p,
        () => p.tab("chat").click(),
        640,
        (_f, i) => {
          if (i === 3) {
            flushSync(() =>
              labs.border.setTabStyle({
                ...EIGHTY,
                chat: { width: 80, flex: "none", borderRightWidth: 13 },
              })
            );
          }
        }
      );
      failures = padFailures(frames.slice(4), ["home", "chat"], "border 13px");
    } finally {
      clock.restore();
    }
    await expect(failures.slice(0, 6)).toEqual([]);
  },
};

// =============================================================================
// Lists with no width or no height: no glide, and in place when revealed
// =============================================================================
export const ZeroSizeList: Story = {
  tags: TEST_ONLY,
  render: () => (
    <div className="flex flex-col gap-12">
      <Lab
        id="no-width"
        labels={FIXED}
        listStyle={{ width: 0, padding: 0, overflow: "visible" }}
        tabStyle={EIGHTY}
        values={["home", "chat"]}
      />
      <Lab
        id="no-height"
        labels={FIXED}
        listStyle={{ height: 0, padding: 0, overflow: "visible" }}
        tabStyle={EIGHTY}
        values={["home", "chat"]}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    if (outsideVitest()) {
      return;
    }
    await ready();
    const clock = manualClock();
    const failures: string[] = [];
    try {
      for (const id of ["no-width", "no-height"]) {
        const p = parts(canvasElement, id);
        const r = p.list().getBoundingClientRect();
        if (r.width > 0 && r.height > 0) {
          failures.push(`${id}: the list has a size (${r.width}x${r.height})`);
        }
        const writes = watchAllPills(p.host);
        p.tab("chat").click();
        // biome-ignore lint/performance/noAwaitInLoops: one list at a time
        await flush();
        await clock.run(10);
        flushSync(() => labs[id].setListStyle(undefined));
        await flush();
        await clock.run(2);
        const written = writes();
        if (written.length > 0) {
          failures.push(`${id}: wrote ${written.join(" | ")}`);
        }
        if (!near(p.pillBox(), p.rest("chat", false), 0.001)) {
          failures.push(
            `${id} revealed: ${fmt4(p.pillBox())}, not ${fmt4(p.rest("chat", false))}`
          );
        }
      }
    } finally {
      clock.restore();
    }
    await expect(failures).toEqual([]);
  },
};

// =============================================================================
// Scales near one and far from it: the real per-axis scale, in layout units
// =============================================================================
export const AncestorScales: Story = {
  tags: TEST_ONLY,
  render: () => (
    <div className="flex flex-col gap-2">
      <Lab
        id="near-one"
        labels={FIXED}
        listStyle={{ gap: 1000 }}
        scale="scaleX(1.0005)"
        values={["home", "chat"]}
      />
      <Lab id="quarter" labels={FIXED} scale="scale(0.25)" />
      <Lab
        id="wide"
        initial="a"
        listStyle={WIDE_LIST}
        tabStyle={EIGHTY}
        values={["a", "b"]}
      />
      <Lab
        id="wide-near-one"
        initial="a"
        listStyle={WIDE_LIST}
        scale="scaleX(1.0005)"
        tabStyle={EIGHTY}
        values={["a", "b"]}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    if (outsideVitest()) {
      return;
    }
    await ready();
    const clock = manualClock();
    const failures: string[] = [];
    try {
      for (const [id, to] of [
        ["near-one", "chat"],
        ["quarter", "search"],
      ] as const) {
        const p = parts(canvasElement, id);
        // biome-ignore lint/performance/noAwaitInLoops: one list at a time
        await settleAt(clock, p, "home");
        const frames = await glide(clock, p, to);
        failures.push(...padFailures(frames, ["home", to], id, 0.005));
        if (travels(frames, "home", to) < 3) {
          failures.push(`${id}: did not glide`);
        }
      }
      for (const [id, k] of [
        ["wide", 1],
        ["wide-near-one", 1.0005],
      ] as const) {
        // biome-ignore lint/performance/noAwaitInLoops: one list at a time
        failures.push(...(await wideGlide(canvasElement, clock, id, k)));
      }
    } finally {
      clock.restore();
    }
    await expect(failures.slice(0, 8)).toEqual([]);
  },
};

/** A list whose width is not short in decimal, its two tabs at either end. */
const WIDE_LIST: CSSProperties = {
  width: "10000.0625px",
  boxSizing: "border-box",
  padding: 0,
  gap: 0,
  justifyContent: "space-between",
};

/**
 * The guarantee, measured on screen and independently of any scale estimate:
 * every frame, the pill within the two tabs' outer edges to one CSS pixel
 * (`k` screen px under the known scale `k`).
 */
async function wideGlide(
  root: HTMLElement,
  clock: ReturnType<typeof manualClock>,
  id: string,
  k: number
) {
  const p = parts(root, id);
  const failures: string[] = [];
  const list = p.list();
  const css = getComputedStyle(list).width;
  const rect = list.getBoundingClientRect().width;
  // The story log keeps what the browser serialised against what it laid out.
  console.info(`${id}: computed width ${css}, rect width ${rect}`);
  const check = (ms: number) => {
    const pill = p.pill()?.getBoundingClientRect();
    const a = p.tab("a").getBoundingClientRect();
    const b = p.tab("b").getBoundingClientRect();
    const lo = Math.min(a.left, b.left) - k;
    const hi = Math.max(a.right, b.right) + k;
    if (!pill) {
      failures.push(`${id} ${ms}ms: no pill`);
    } else if (pill.left < lo || pill.right > hi || pill.width <= 0) {
      failures.push(
        `${id} ${ms}ms: pill ${pill.left}..${pill.right} outside ${lo}..${hi}`
      );
    }
  };
  let moved = 0;
  p.tab("b").click();
  await flush();
  check(0);
  for (let ms = FRAME; ms <= 640; ms += FRAME) {
    // biome-ignore lint/performance/noAwaitInLoops: frames are sequential
    await clock.run(1);
    check(ms);
    moved += p.pill()?.hasAttribute("style") ? 1 : 0;
  }
  if (moved < 3) {
    failures.push(`${id}: did not glide`);
  }
  return failures;
}

// =============================================================================
// Triggers rendered through a wrapper whose child span has no box
// =============================================================================
export const RenderWrapper: Story = {
  tags: TEST_ONLY,
  render: () => <Lab id="wrap" labels={FIXED} wrap />,
  play: async ({ canvasElement }) => {
    if (outsideVitest()) {
      return;
    }
    await ready();
    const clock = manualClock();
    const failures: string[] = [];
    try {
      const p = parts(canvasElement, "wrap");
      await settleAt(clock, p, "home");
      const frames = await glide(clock, p, "search");
      failures.push(...padFailures(frames, ["home", "search"], "wrapped"));
      if (travels(frames, "home", "search") < 3) {
        failures.push("wrapped: did not glide");
      }
      await settleAt(clock, p, "home");
      const first = await glide(clock, p, "meetings", 6 * FRAME);
      const byClick = await glide(clock, p, "search");
      if (!near(first.at(-1)?.box ?? null, byClick[0].box)) {
        failures.push(
          `wrapped interruption jumps: ${fmt(first.at(-1)?.box ?? null)} -> ${fmt(byClick[0].box)}`
        );
      }
      failures.push(
        ...padFailures(
          byClick,
          ["home", "meetings", "search"],
          "wrapped interruption"
        )
      );
      if (travels(byClick, "meetings", "search") < 3) {
        failures.push("wrapped interruption: did not glide");
      }
    } finally {
      clock.restore();
    }
    await expect(failures.slice(0, 8)).toEqual([]);
  },
};

// =============================================================================
// Ownership ends with the run: a settled pill, a null selection mid-glide
// =============================================================================
export const SettledThenUnmounted: Story = {
  tags: TEST_ONLY,
  render: () => <Lab id="settled" labels={FIXED} />,
  play: async ({ canvasElement }) => {
    if (outsideVitest()) {
      return;
    }
    await ready();
    const clock = manualClock();
    try {
      const p = parts(canvasElement, "settled");
      await settleAt(clock, p, "home");
      await glide(clock, p, "search");
      const pill = p.pill() as HTMLElement;
      pill.style.width = "17px";
      flushSync(() => labs.settled.setMounted(false));
      await flush();
      await clock.run(2);
      await expect(pill.style.width).toBe("17px");
    } finally {
      clock.restore();
    }
  },
};

export const NullMidGlide: Story = {
  tags: TEST_ONLY,
  render: () => <Lab id="null-mid" labels={FIXED} />,
  play: async ({ canvasElement }) => {
    if (outsideVitest()) {
      return;
    }
    await ready();
    const clock = manualClock();
    const frames = trackPostRender();
    let live = -1;
    const writes: string[] = [];
    try {
      const p = parts(canvasElement, "null-mid");
      await settleAt(clock, p, "home");
      p.tab("search").click();
      await flush();
      await clock.run(3);
      const old = p.pill() as HTMLElement;
      flushSync(() => labs["null-mid"].setValue(null));
      live = frames.live();
      const observer = new MutationObserver((r) =>
        writes.push(...r.map(() => old.getAttribute("style") ?? ""))
      );
      observer.observe(old, { attributes: true, attributeFilter: ["style"] });
      await clock.run(5);
      writes.push(
        ...observer.takeRecords().map(() => old.getAttribute("style") ?? "")
      );
      observer.disconnect();
    } finally {
      frames.restore();
      clock.restore();
    }
    await expect(writes).toEqual([]);
    await expect(live, "frame callbacks left after the null commit").toBe(0);
  },
};

// =============================================================================
// Two lists, one finishing while the other moves: every read before any write
// =============================================================================
export const StaggeredFinish: Story = {
  tags: TEST_ONLY,
  render: () => (
    <div className="flex flex-col gap-2">
      <Lab id="first-done" labels={FIXED} />
      <Lab id="still-moving" labels={FIXED} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    if (outsideVitest()) {
      return;
    }
    await ready();
    const clock = manualClock();
    const failures: string[] = [];
    let sawFinish = false;
    try {
      const a = parts(canvasElement, "first-done");
      const b = parts(canvasElement, "still-moving");
      await settleAt(clock, a, "home");
      await settleAt(clock, b, "home");
      a.tab("search").click();
      await flush();
      await clock.run(4);
      b.tab("search").click();
      await flush();
      for (let i = 0; i < 40; i++) {
        const aMoving = a.pill()?.hasAttribute("style");
        const events = readsAndWrites(() => clock.step());
        const firstWrite = events.indexOf("W");
        if (firstWrite >= 0 && events.indexOf("R", firstWrite) >= 0) {
          failures.push(
            `frame ${i}: a read after a write (${events.join("")})`
          );
        }
        if (aMoving && !a.pill()?.hasAttribute("style")) {
          sawFinish = Boolean(b.pill()?.hasAttribute("style"));
        }
        // biome-ignore lint/performance/noAwaitInLoops: frames are sequential
        await Promise.resolve();
        await Promise.resolve();
      }
    } finally {
      clock.restore();
    }
    await expect(sawFinish, "one list finished while the other moved").toBe(
      true
    );
    await expect(failures.slice(0, 4)).toEqual([]);
  },
};

// =============================================================================
// An interruption while the pill is still near the first tab, by click and by
// Enter on a focused third tab: the first stepped frame follows every tab
// involved
// =============================================================================
export const InterruptionEarly: Story = {
  tags: TEST_ONLY,
  render: () => <Lab id="early" labels={FIXED} />,
  play: async ({ canvasElement }) => {
    if (outsideVitest()) {
      return;
    }
    await ready();
    const clock = manualClock();
    const failures: string[] = [];
    const p = parts(canvasElement, "early");
    const firstStep = async (
      act: () => Promise<void>,
      to: string,
      involved: string[],
      label: string
    ) => {
      const S = p.pillBox() as Box;
      await act();
      await flush();
      if (p.tab(to).getAttribute("aria-selected") !== "true") {
        failures.push(`${label}: ${to} not selected`);
        return;
      }
      const f0 = snapshot(p, 0);
      if (!near(f0.box, S)) {
        failures.push(`${label}: jumps ${fmt(S)} -> ${fmt(f0.box)}`);
      }
      await clock.run(1);
      const f1 = snapshot(p, FRAME);
      const want = expected(
        S,
        restIn(f0, to, false),
        restIn(f1, to, false),
        f1,
        involved,
        FRAME
      );
      if (!near(f1.box, want)) {
        failures.push(`${label}: first step ${fmt(f1.box)} want ${fmt(want)}`);
      }
      failures.push(...padFailures([f0, f1], involved, label));
    };
    try {
      await settleAt(clock, p, "home");
      p.tab("search").click();
      await flush();
      await clock.run(2);
      // Still near Home, outside the last pair (Search, Inbox).
      await firstStep(
        async () => p.tab("inbox").click(),
        "inbox",
        ["home", "search", "inbox"],
        "click"
      );
      await clock.run(1);
      await firstStep(
        async () => {
          p.tab("chat").focus();
          await realKeyboard().keyboard("{Enter}");
        },
        "chat",
        ["home", "search", "inbox", "chat"],
        "Enter"
      );
      const rest = await record(clock, p, () => undefined, 640);
      failures.push(
        ...padFailures(rest, ["home", "search", "inbox", "chat"], "after Enter")
      );
      if (!near(rest.at(-1)?.box ?? null, p.rest("chat", false), 0.001)) {
        failures.push(`ends at ${fmt4(rest.at(-1)?.box ?? null)}`);
      }
    } finally {
      clock.restore();
    }
    await expect(failures.slice(0, 8)).toEqual([]);
  },
};

// =============================================================================
// How this browser lays out fractional lengths, read back
// =============================================================================
export const LayoutGrid: Story = {
  tags: TEST_ONLY,
  render: () => (
    <div data-testid="grid" style={{ position: "relative", height: 8 }}>
      <span style={{ position: "absolute", left: 0, top: 0, height: 4 }} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const host = canvasElement.querySelector(
      '[data-testid="grid"]'
    ) as HTMLElement;
    const probe = host.firstElementChild as HTMLElement;
    const laidOut = (css: number) => {
      probe.style.left = `${css}px`;
      probe.style.width = `${css}px`;
      const o = host.getBoundingClientRect();
      const r = probe.getBoundingClientRect();
      return [r.left - o.left, r.width];
    };
    // A length the browser keeps lays out exactly; any other lays out short of it.
    await expect(laidOut(10 + 1 / 64)).toEqual([10 + 1 / 64, 10 + 1 / 64]);
    await expect(laidOut(10.99)).toEqual([10.984_375, 10.984_375]);
    await expect(laidOut(1 / 128)).toEqual([0, 0]);
  },
};

// =============================================================================
// The curve at the stories' widths against a trace recorded from the previous
// release (motion's layoutId pill), frame by frame
// =============================================================================
interface TraceFrame {
  b: number;
  l: number;
  /** Label widths by tab value. */
  lw: Record<string, number>;
  ms: number;
  r: number;
  t: number;
}

const TRACE_LOOKS = [
  { key: "pill", far: ["home", "search"], near: ["inbox", "search"] },
  { key: "rounded", far: ["home", "search"], near: ["inbox", "search"] },
  { key: "line", far: ["home", "inbox"], near: ["meetings", "inbox"] },
] as const;

function TraceLabs() {
  return (
    <Labs
      make={(s) => ({
        id: `trace-${s.key}`,
        variant: s.variant,
        shape: s.shape,
        labels: FIXED,
        values: s.line ? LINE_VALUES : VALUES,
      })}
    />
  );
}

const r4 = (x: number) => Math.round(x * 1e4) / 1e4;

/** Both directions of the far and the near switch, for each look. */
async function traceRuns(
  root: HTMLElement,
  clock: ReturnType<typeof manualClock>
) {
  const out: Record<string, TraceFrame[]> = {};
  for (const look of TRACE_LOOKS) {
    const p = parts(root, `trace-${look.key}`);
    for (const travel of ["far", "near"] as const) {
      const [a, b] = look[travel];
      // biome-ignore lint/performance/noAwaitInLoops: one switch at a time
      await settleAt(clock, p, a);
      for (const [dir, to] of [
        ["fwd", b],
        ["back", a],
      ] as const) {
        // biome-ignore lint/performance/noAwaitInLoops: one switch at a time
        const frames = await record(clock, p, () => p.tab(to).click(), 560);
        // Label widths come from each frame's own snapshot, as the edges do.
        out[`${look.key}-${travel}-${dir}`] = frames.map((f) => {
          const box = f.box as Box;
          return {
            ms: f.t,
            l: r4(box.l),
            r: r4(box.r),
            t: r4(box.t),
            b: r4(box.b),
            lw: Object.fromEntries(
              Object.entries(f.lw).map(([v, w]) => [v, r4(w)])
            ),
          };
        });
      }
    }
  }
  return out;
}

/**
 * The labels animate: a label whose width changes passes between its first
 * and last width on some frame.
 */
function labelsMove(name: string, frames: TraceFrame[]) {
  const out: string[] = [];
  const first = frames[0].lw;
  const last = frames.at(-1)?.lw ?? first;
  const changing = Object.keys(first).filter(
    (v) => Math.abs(first[v] - last[v]) > 1
  );
  if (changing.length === 0) {
    out.push(`${name}: no label changes width`);
  }
  for (const v of changing) {
    const lo = Math.min(first[v], last[v]) + 0.5;
    const hi = Math.max(first[v], last[v]) - 0.5;
    if (!frames.some((f) => f.lw[v] > lo && f.lw[v] < hi)) {
      out.push(
        `${name}: ${v}'s label never between ${first[v]} and ${last[v]}`
      );
    }
  }
  return out;
}

export const CurveRecordedTrace: Story = {
  tags: TEST_ONLY,
  render: () => <TraceLabs />,
  play: async ({ canvasElement }) => {
    if (outsideVitest()) {
      return;
    }
    await ready();
    const clock = manualClock();
    const failures: string[] = [];
    try {
      const got = await traceRuns(canvasElement, clock);
      const want = BASE_TRACE as Record<string, TraceFrame[]>;
      for (const [key, frames] of Object.entries(want)) {
        const run = got[key] ?? [];
        if (run.length !== frames.length) {
          failures.push(`${key}: ${run.length} frames, want ${frames.length}`);
          continue;
        }
        // One line per switch: its worst edge and its worst label width.
        let edge = { off: 0, ms: -1 };
        let label = { off: 0, ms: -1 };
        frames.forEach((w, i) => {
          const g = run[i];
          if (g.ms !== w.ms) {
            failures.push(`${key} frame ${i}: at ${g.ms}ms, want ${w.ms}ms`);
          }
          const e = Math.max(
            ...(["l", "r", "t", "b"] as const).map((k) => Math.abs(g[k] - w[k]))
          );
          const l = Math.max(
            ...Object.keys(w.lw).map((v) =>
              Math.abs((g.lw[v] ?? -99) - w.lw[v])
            )
          );
          if (e > edge.off) {
            edge = { off: e, ms: w.ms };
          }
          if (l > label.off) {
            label = { off: l, ms: w.ms };
          }
        });
        if (edge.off > 0.5) {
          failures.push(
            `${key}: edges off by ${edge.off.toFixed(2)} at ${edge.ms}ms`
          );
        }
        if (label.off > 0.5) {
          failures.push(
            `${key}: label widths off by ${label.off.toFixed(2)} at ${label.ms}ms`
          );
        }
        failures.push(
          ...labelsMove(`${key} recorded`, frames),
          ...labelsMove(`${key} now`, run)
        );
      }
    } finally {
      clock.restore();
    }
    await expect(failures.slice(0, 40)).toEqual([]);
  },
};

// =============================================================================
// One layout step: the line onto a long label, at a frame phase where the
// written box used to lay out a fraction of a px into the tab's border
// =============================================================================
/** The line stories' labels as Helvetica sets them on macOS (text widths). */
const HELVETICA_WIDTHS = [37.359_375, 29.578_125, 56.8125, 124.531_25];

export const LayoutStepLongLabel: Story = {
  tags: TEST_ONLY,
  render: () => (
    <Lab
      id="step"
      initial="meetings"
      labels={HELVETICA_WIDTHS}
      values={LINE_VALUES}
      variant="line"
    />
  ),
  play: async ({ canvasElement }) => {
    if (outsideVitest()) {
      return;
    }
    await ready();
    const clock = manualClock();
    let failures: string[] = [];
    try {
      const p = parts(canvasElement, "step");
      await settleAt(clock, p, "meetings");
      // The switch starts 1ms before a frame: frame 14 is the one that failed.
      const frames = await record(
        clock,
        p,
        async () => {
          p.tab("inbox").click();
          await flush();
          clock.step(1);
        },
        640
      );
      failures = padFailures(frames, ["meetings", "inbox"], "line", 0.001);
    } finally {
      clock.restore();
    }
    await expect(failures.slice(0, 6)).toEqual([]);
  },
};
