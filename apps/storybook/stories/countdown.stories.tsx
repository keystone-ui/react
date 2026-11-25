import { Badge } from "@keystoneui/react/badge";
import { Button } from "@keystoneui/react/button";
import {
  Countdown,
  type CountdownProps,
  type CountdownUnit,
  useCountdown,
} from "@keystoneui/react/countdown";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { memo, Suspense, use, useEffect, useState } from "react";
import { expect } from "storybook/test";
import { outsideVitest } from "./real-browser";

const meta: Meta<typeof Countdown> = {
  title: "Countdown",
  component: Countdown,
};

export default meta;
type Story = StoryObj<typeof Countdown>;

const TEST_ONLY: Story["tags"] = ["!dev", "!autodocs"];

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const hms = (h: number, m: number, s: number) =>
  h * HOUR + m * MINUTE + s * SECOND;
const ALL_UNITS: CountdownUnit[] = ["days", "hours", "minutes", "seconds"];

/** A display style set through the slots: light numerals, medium labels, dim colons. */
const DISPLAY_STYLE =
  "font-light [&_[data-slot=countdown-label]]:font-medium [&_[data-slot=countdown-separator]]:text-muted-foreground";

// ---------------------------------------------------------------------------
// Development stories: live clocks, targets set after mount
// ---------------------------------------------------------------------------

/** A target `ms` from the moment the story mounts. */
function useTargetIn(ms: number) {
  const [target, setTarget] = useState<number | null>(null);
  useEffect(() => {
    setTarget(Date.now() + ms);
  }, [ms]);
  return target;
}

function Live({
  in: ms,
  ...props
}: Omit<CountdownProps, "target"> & { in: number }) {
  return <Countdown target={useTargetIn(ms)} {...props} />;
}

export const Default: Story = {
  render: () => <Live in={hms(1, 36, 53)} />,
};

export const Labelled: Story = {
  render: () => (
    <Live
      animated
      className={DISPLAY_STYLE}
      in={hms(1, 36, 53)}
      size="lg"
      variant="labelled"
    />
  ),
};

export const WithDays: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <Live in={2 * DAY + hms(4, 12, 33)} units={ALL_UNITS} />
      <Live
        in={2 * DAY + hms(4, 12, 33)}
        units={ALL_UNITS}
        variant="labelled"
      />
    </div>
  ),
};

export const Animated: Story = {
  render: () => <Live animated in={hms(0, 1, 5)} />,
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-6">
      {(["sm", "default", "lg"] as const).map((size) => (
        <Live in={hms(1, 36, 53)} key={size} size={size} variant="labelled" />
      ))}
    </div>
  ),
};

function HookLayout() {
  const target = useTargetIn(hms(0, 4, 30));
  const { isPending, minutes, seconds } = useCountdown({
    target,
    units: ["minutes", "seconds"],
  });
  return (
    <p className="text-muted-foreground text-sm">
      {isPending
        ? "Starting…"
        : `Your table is held for ${minutes} min ${seconds} s.`}
    </p>
  );
}

export const Hook: Story = {
  render: () => <HookLayout />,
};

function OnCompleteDemo() {
  const [target, setTarget] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  return (
    <div className="flex items-center gap-4">
      <Countdown
        onComplete={() => setDone(true)}
        target={target}
        units={["minutes", "seconds"]}
      />
      {done ? (
        <Badge>Ready</Badge>
      ) : (
        <Button
          onClick={() => {
            setDone(false);
            setTarget(Date.now() + 5 * SECOND);
          }}
          size="sm"
          variant="outline"
        >
          Start 5 s
        </Button>
      )}
    </div>
  );
}

export const OnComplete: Story = {
  render: () => <OnCompleteDemo />,
};

export const Pending: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <Countdown target={null} />
      <Countdown target={null} variant="labelled" />
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Real-browser tests: a clock the play moves by hand
// ---------------------------------------------------------------------------

interface RealCommands {
  emulateReducedMotion: (reduce: boolean) => Promise<void>;
}
const realCommands = () =>
  (globalThis as { __realCommands?: RealCommands }).__realCommands;

const T0 = Date.UTC(2026, 10, 19, 12, 0, 0);
/** One clock per story; `now` reads it, a play moves it. */
const clock = { t: T0 };
const now = () => clock.t;
/** Moves the hand-driven clock and wakes every Countdown on the page. */
function moveClock(ms: number) {
  clock.t += ms;
  window.dispatchEvent(new Event("pageshow"));
}

const frame = () =>
  new Promise<void>((resolve) =>
    requestAnimationFrame(() => setTimeout(resolve, 0))
  );
/**
 * The digits' face loaded and one frame painted: geometry is measured in the
 * real font, or the play fails naming the face. Only the first family of the
 * list is loaded, as in the docs e2e: `document.fonts.load` on a whole list
 * rejects if any face in it fails, including a `local()` fallback that a
 * machine without that system font cannot load.
 */
const settled = async () => {
  const family = getComputedStyle(document.body)
    .fontFamily.split(",")[0]
    .trim();
  const faces = await document.fonts.load(`400 48px ${family}`, "0123456789:-");
  await document.fonts.ready;
  if (
    faces.length === 0 ||
    faces.some((fontFace) => fontFace.status !== "loaded")
  ) {
    throw new Error(
      `the digits' face ${family} did not load: ${faces.length} face(s), ${faces
        .map((fontFace) => fontFace.status)
        .join(", ")}`
    );
  }
  await frame();
};
const nextFrame = () =>
  new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
const wait = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

const byTestId = (root: HTMLElement, id: string) =>
  root.querySelector(`[data-testid="${id}"]`) as HTMLElement;
const box = (el: Element) => el.getBoundingClientRect();
const part = (scope: Element, unit: string, slot: string) =>
  scope.querySelector(
    `[data-unit="${unit}"] [data-slot="countdown-${slot}"]`
  ) as HTMLElement;

/** Painted text: outside `.sr-only` and `.invisible` subtrees. */
function visibleText(el: Element): string {
  let out = "";
  const walk = (node: Node) => {
    if (
      node instanceof HTMLElement &&
      (node.classList.contains("sr-only") ||
        node.classList.contains("invisible"))
    ) {
      return;
    }
    if (node.nodeType === Node.TEXT_NODE) {
      out += node.textContent;
    }
    for (const child of node.childNodes) {
      walk(child);
    }
  };
  walk(el);
  return out;
}

/** The selection's text when everything inside `el` is selected. */
function copied(el: Element) {
  const selection = getSelection() as Selection;
  selection.removeAllRanges();
  const range = document.createRange();
  range.selectNodeContents(el);
  selection.addRange(range);
  const text = selection.toString();
  selection.removeAllRanges();
  return text;
}

/** A RollingNumber digit column inside a group, by its place. */
const digit = (scope: Element, unit: string, place: number) =>
  scope.querySelector(
    `[data-unit="${unit}"] [data-slot="rolling-number-digit"][data-place="${place}"]`
  ) as HTMLElement;
const face = (col: HTMLElement) => col.firstElementChild as HTMLElement;
/** How far the face sits below (+) or above (−) its column, in px. */
const offset = (col: HTMLElement) => box(face(col)).top - box(col).top;

/** The labelled layout: label over value, colons on the value row, no tiles. */
export const LabelledLayout: Story = {
  tags: TEST_ONLY,
  render: () => {
    clock.t = T0;
    const display = {
      animated: true,
      className: DISPLAY_STYLE,
      now,
      size: "lg",
      variant: "labelled",
    } as const;
    return (
      <div className="flex flex-col items-start gap-8">
        <div data-testid="ltr">
          <Countdown target={T0 + hms(1, 36, 53)} {...display} />
        </div>
        <div data-testid="rtl" dir="rtl">
          <Countdown target={T0 + hms(1, 36, 53)} {...display} />
        </div>
        <div data-testid="days">
          <Countdown
            target={T0 + hms(1, 36, 53)}
            units={ALL_UNITS}
            {...display}
          />
        </div>
        <div data-testid="default-size">
          <Countdown
            now={now}
            target={T0 + hms(1, 36, 53)}
            variant="labelled"
          />
        </div>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    await settled();
    // Every measurement goes in `faults`, which must stay empty.
    const faults: string[] = [];
    const check = (ok: boolean, what: string) => {
      if (!ok) {
        faults.push(what);
      }
    };
    const centre = (r: DOMRect) => r.left + r.width / 2;
    for (const id of ["ltr", "rtl", "days", "default-size"]) {
      const scope = byTestId(canvasElement, id);
      // The groups sit 0.75em apart and each colon is raised by 0.1em from
      // the middle of the figures, at every size.
      const run = scope.querySelector(
        '[data-slot="countdown"] > [aria-hidden="true"]'
      ) as HTMLElement;
      const em = Number.parseFloat(getComputedStyle(run).fontSize);
      const gap = Number.parseFloat(getComputedStyle(run).columnGap);
      check(
        Math.abs(gap - 0.75 * em) < 0.01,
        `${id}: gap ${gap}px is not 0.75em of ${em}px`
      );
      const units =
        id === "days" ? ALL_UNITS : (["hours", "minutes", "seconds"] as const);
      // Left to right, whatever the page direction.
      const order = [...scope.querySelectorAll('[data-slot="countdown-group"]')]
        .sort((a, b) => box(a).left - box(b).left)
        .map((g) => g.getAttribute("data-unit"));
      check(order.join() === units.join(), `${id}: order ${order}`);
      const values = units.map((u) => visibleText(part(scope, u, "value")));
      const expected =
        id === "days" ? ["00", "01", "36", "53"] : ["01", "36", "53"];
      check(values.join() === expected.join(), `${id}: values ${values}`);
      for (const unit of units) {
        const label = box(part(scope, unit, "label"));
        const value = box(part(scope, unit, "value"));
        check(
          label.bottom <= value.top + 0.5,
          `${id} ${unit}: label bottom ${label.bottom} > value top ${value.top}`
        );
        check(
          Math.abs(centre(label) - centre(value)) < 1,
          `${id} ${unit}: label centre ${centre(label)} vs value ${centre(value)}`
        );
        const group = getComputedStyle(
          scope.querySelector(`[data-unit="${unit}"]`) as Element
        );
        check(
          group.backgroundColor === "rgba(0, 0, 0, 0)" &&
            group.borderTopWidth === "0px" &&
            group.boxShadow === "none",
          `${id} ${unit}: the group has a tile`
        );
      }
      const separators = [
        ...scope.querySelectorAll('[data-slot="countdown-separator"]'),
      ];
      check(
        separators.length === units.length - 1,
        `${id}: ${separators.length} separators`
      );
      for (const [i, separator] of separators.entries()) {
        const colon = box(separator);
        const middle = colon.top + colon.height / 2;
        const left = box(part(scope, units[i] as string, "value"));
        const lift = left.top + left.height / 2 - middle;
        check(
          Math.abs(lift - 0.1 * em) <= 0.5,
          `${id} colon ${i}: raised ${lift.toFixed(2)}px, not 0.1em of ${em}px`
        );
        for (const unit of [units[i], units[i + 1]]) {
          const value = box(part(scope, unit as string, "value"));
          check(
            middle >= value.top && middle <= value.bottom,
            `${id} colon ${i}: centre ${middle} outside ${unit} ${value.top}-${value.bottom}`
          );
        }
      }
    }
    await expect(faults).toEqual([]);
  },
};

/** Pending and running take the same width while groups fit two digits. */
function WidthRow({
  id,
  ...props
}: CountdownProps & {
  id: string;
}) {
  return (
    <p className="whitespace-nowrap" data-testid={id}>
      <Countdown now={now} {...props} />
      <span data-marker="">|</span>
    </p>
  );
}

/** Removes the value cells' 2ch floor. */
const NO_FLOOR = "[&_[data-slot=countdown-value]]:min-w-0";

const RESERVE_HOURS =
  "[&_[data-unit=hours]_[data-slot=countdown-value]]:min-w-[3ch]";

export const Width: Story = {
  tags: TEST_ONLY,
  render: () => {
    clock.t = T0;
    const running = T0 + hms(1, 36, 53);
    const german = {
      days: "Tage",
      hours: "Stunden",
      minutes: "Minuten",
      seconds: "Sekunden",
    };
    return (
      <div className="flex flex-col items-start gap-4">
        {(["sm", "default", "lg"] as const).map((size) => (
          <div key={size}>
            <WidthRow
              id={`compact-${size}-pending`}
              size={size}
              target={null}
            />
            <WidthRow
              id={`compact-${size}-running`}
              size={size}
              target={running}
            />
            <WidthRow
              id={`labelled-${size}-pending`}
              labels={german}
              size={size}
              target={null}
              variant="labelled"
            />
            <WidthRow
              id={`labelled-${size}-running`}
              labels={german}
              size={size}
              target={running}
              variant="labelled"
            />
            <WidthRow
              animated
              id={`animated-${size}-running`}
              size={size}
              target={running}
            />
          </div>
        ))}
        <WidthRow id="h100-running" target={T0 + 100 * HOUR} />
        <WidthRow id="h100-pending" target={null} />
        <WidthRow
          className={RESERVE_HOURS}
          id="h100r-running"
          target={T0 + 100 * HOUR}
        />
        <WidthRow className={RESERVE_HOURS} id="h100r-pending" target={null} />
        {/* The 2ch floor removed, so only the reservation holds the width. */}
        {(["compact", "labelled"] as const).map((variant) => (
          <div key={variant}>
            <WidthRow
              className={NO_FLOOR}
              id={`nofloor-${variant}-pending`}
              size="lg"
              target={null}
              variant={variant}
            />
            <WidthRow
              className={NO_FLOOR}
              id={`nofloor-${variant}-running`}
              size="lg"
              target={running}
              variant={variant}
            />
          </div>
        ))}
        <span className="text-5xl tabular-nums">
          <span data-probe="dashes">--</span>
          <span data-probe="digits">00</span>
        </span>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    await settled();
    // Without the floor, the placeholder alone is narrower than two digits,
    // so the no-floor rows below measure the reservation in any font.
    const probe = (name: string) =>
      box(canvasElement.querySelector(`[data-probe="${name}"]`) as Element)
        .width;
    await expect(probe("digits")).toBeGreaterThan(probe("dashes") + 1);
    const measure = (id: string) => {
      const row = byTestId(canvasElement, id);
      return {
        marker: box(row.querySelector("[data-marker]") as Element).left,
        width: box(row.querySelector('[data-slot="countdown"]') as Element)
          .width,
      };
    };
    // Every pair that differs by more than half a pixel lands in `faults`.
    const faults: string[] = [];
    const compare = (name: string, a: string, b: string) => {
      const pending = measure(a);
      const live = measure(b);
      const dw = Math.abs(pending.width - live.width);
      const dx = Math.abs(pending.marker - live.marker);
      if (dw > 0.5 || dx > 0.5) {
        faults.push(
          `${name}: width ${dw.toFixed(2)}px, marker ${dx.toFixed(2)}px`
        );
      }
    };
    for (const size of ["sm", "default", "lg"]) {
      for (const form of ["compact", "labelled"]) {
        compare(
          `${form} ${size}`,
          `${form}-${size}-pending`,
          `${form}-${size}-running`
        );
      }
      compare(
        `animated ${size}`,
        `compact-${size}-pending`,
        `animated-${size}-running`
      );
    }
    for (const variant of ["compact", "labelled"]) {
      compare(
        `no floor ${variant}`,
        `nofloor-${variant}-pending`,
        `nofloor-${variant}-running`
      );
    }
    await expect(faults).toEqual([]);
    // 100 hours: wider than the placeholder, the documented case; a
    // three-cell reservation on the hours value makes them equal.
    const wide = measure("h100-running");
    const narrow = measure("h100-pending");
    await expect(wide.width).toBeGreaterThan(narrow.width + 1);
    const reservedRunning = measure("h100r-running");
    const reservedPending = measure("h100r-pending");
    await expect(
      Math.abs(reservedRunning.width - reservedPending.width)
    ).toBeLessThanOrEqual(0.5);
  },
};

/** Copying gives the visible text once, and never the visually hidden time text. */
export const Copy: Story = {
  tags: TEST_ONLY,
  render: () => {
    clock.t = T0;
    const target = T0 + hms(1, 36, 53);
    return (
      <div className="flex flex-col items-start gap-4 text-2xl">
        <p data-testid="compact">
          Ends in <Countdown now={now} target={target} /> today
        </p>
        <p data-testid="animated">
          Ends in <Countdown animated now={now} target={target} /> today
        </p>
        <p data-testid="pending">
          Ends in <Countdown target={null} /> today
        </p>
        <div data-testid="labelled">
          <Countdown now={now} target={target} variant="labelled" />
        </div>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    await settled();
    await expect(copied(byTestId(canvasElement, "compact"))).toBe(
      "Ends in 01:36:53 today"
    );
    await expect(copied(byTestId(canvasElement, "pending"))).toBe(
      "Ends in --:--:-- today"
    );
    await expect(copied(byTestId(canvasElement, "labelled"))).toBe(
      "Hours\n01\n:\nMinutes\n36\n:\nSeconds\n53"
    );
    const animated = byTestId(canvasElement, "animated");
    await expect(copied(animated)).toBe("Ends in 01:36:53 today");
    moveClock(SECOND);
    await frame();
    // Mid-roll: the seconds' ones digit is moving.
    await expect(
      Math.abs(offset(digit(animated, "seconds", 0)))
    ).toBeGreaterThan(0);
    await expect(copied(animated)).toBe("Ends in 01:36:52 today");
  },
};

/** `className="flex"` makes either form block-level: full width, own line. */
export const BlockLayout: Story = {
  tags: TEST_ONLY,
  render: () => {
    clock.t = T0;
    const target = T0 + hms(1, 36, 53);
    return (
      <div className="flex w-[480px] flex-col gap-4">
        {(["compact", "labelled"] as const).map((variant) => (
          <div data-testid={`block-${variant}`} key={variant}>
            before{" "}
            <Countdown
              className="flex"
              now={now}
              target={target}
              variant={variant}
            />{" "}
            <span data-after="">after</span>
          </div>
        ))}
        {(["compact", "labelled"] as const).map((variant) => (
          <div data-testid={`own-${variant}`} key={variant}>
            <Countdown now={now} target={target} variant={variant} />
          </div>
        ))}
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    await settled();
    const own = (["compact", "labelled"] as const).map(
      (variant) =>
        getComputedStyle(
          byTestId(canvasElement, `own-${variant}`).querySelector(
            '[data-slot="countdown"]'
          ) as Element
        ).display
    );
    await expect(own).toEqual(["inline-block", "inline-flex"]);
    const layout = (["compact", "labelled"] as const).map((variant) => {
      const scope = byTestId(canvasElement, `block-${variant}`);
      const root = scope.querySelector('[data-slot="countdown"]') as Element;
      const after = box(scope.querySelector("[data-after]") as Element);
      return {
        variant,
        display: getComputedStyle(root).display,
        fullWidth: Math.abs(box(root).width - box(scope).width) <= 0.5,
        ownLine: after.top >= box(root).bottom - 0.5,
        text: visibleText(root),
      };
    });
    await expect(layout).toEqual([
      {
        variant: "compact",
        display: "flex",
        fullWidth: true,
        ownLine: true,
        text: "01:36:53",
      },
      {
        variant: "labelled",
        display: "flex",
        fullWidth: true,
        ownLine: true,
        text: "Hours01:Minutes36:Seconds53",
      },
    ]);
  },
};

/** 01:00 → 00:59: each changed column moves one row down, never through 1–4. */
export const TensRoll: Story = {
  tags: TEST_ONLY,
  render: () => {
    clock.t = T0;
    return (
      <div className="text-5xl" data-testid="roll">
        <Countdown
          animated
          now={now}
          target={T0 + MINUTE}
          units={["minutes", "seconds"]}
        />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const scope = byTestId(canvasElement, "roll");
    await settled();
    await expect(visibleText(scope)).toBe("01:00");
    moveClock(SECOND);
    await nextFrame();
    // Each changed column starts exactly one row up: minutes' ones (1 to 0),
    // seconds' tens (0 to 5) and seconds' ones (0 to 9).
    const starts = (
      [
        ["minutes", 0],
        ["seconds", 1],
        ["seconds", 0],
      ] as const
    ).map(([unit, place]) => {
      const transition = face(digit(scope, unit, place))
        .getAnimations()
        .find((a) => a instanceof CSSTransition) as CSSTransition | undefined;
      return (
        transition?.effect as KeyframeEffect | undefined
      )?.getKeyframes()[0]?.translate;
    });
    await expect(starts).toEqual(["0px -100%", "0px -100%", "0px -100%"]);
    const tens = () => digit(scope, "seconds", 1);
    const minuteOnes = () => digit(scope, "minutes", 0);
    const row = box(tens()).height;
    const trace: number[] = [];
    const minuteTrace: number[] = [];
    const glyphs = new Set<string>();
    const end = performance.now() + 400;
    while (performance.now() < end) {
      // biome-ignore lint/performance/noAwaitInLoops: one frame at a time
      await nextFrame();
      trace.push(offset(tens()));
      minuteTrace.push(offset(minuteOnes()));
      glyphs.add(face(tens()).textContent ?? "");
      glyphs.add(face(tens()).dataset.prev ?? "");
    }
    await expect(visibleText(scope)).toBe("00:59");
    await expect([...glyphs].sort()).toEqual(["0", "5"]);
    await expect(tens().dataset.direction).toBe("down");
    // From above, by at most one row, toward rest without turning back.
    const shape = (t: number[]) => ({
      startsAbove: (t[0] as number) < 0,
      withinOneRow: Math.abs(Math.min(...t)) <= row + 0.5,
      movedVisibly: Math.abs(Math.min(...t)) > row / 4,
      neverTurnsBack: t.every(
        (v, i) => i === 0 || v >= (t[i - 1] as number) - 0.01
      ),
      endsAtRest: t.at(-1) === 0,
    });
    const good = {
      startsAbove: true,
      withinOneRow: true,
      movedVisibly: true,
      neverTurnsBack: true,
      endsAtRest: true,
    };
    await expect(shape(trace)).toEqual(good);
    await expect(shape(minuteTrace)).toEqual(good);
  },
};

function AnimatedToggle() {
  const [animated, setAnimated] = useState(true);
  return (
    <div className="text-5xl" data-testid="toggle">
      <Countdown animated={animated} now={now} target={T0 + MINUTE} />
      <button
        className="sr-only"
        data-testid="toggle-static"
        onClick={() => setAnimated(false)}
        type="button"
      >
        static
      </button>
    </div>
  );
}

const runningTranslate = (col: HTMLElement) =>
  face(col)
    .getAnimations()
    .filter(
      (a) =>
        a instanceof CSSTransition &&
        a.transitionProperty === "translate" &&
        a.playState === "running"
    ).length;

/** Under prefers-reduced-motion an animated Countdown never moves. */
export const ReducedMotion: Story = {
  tags: TEST_ONLY,
  render: () => {
    clock.t = T0;
    return (
      <div className="flex flex-col gap-4">
        <div className="text-5xl" data-testid="reduced">
          <Countdown animated now={now} target={T0 + MINUTE} />
        </div>
        {/* A long normal roll, so it is surely in flight when the
            preference changes. */}
        <div className="text-5xl [--duration-slow:2000ms]" data-testid="flip">
          <Countdown animated now={now} target={T0 + MINUTE} />
        </div>
        <AnimatedToggle />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    if (outsideVitest()) {
      return;
    }
    const commands = realCommands();
    if (!commands) {
      throw new Error("The reduced-motion command is not available.");
    }
    const scope = byTestId(canvasElement, "reduced");
    await settled();
    await commands.emulateReducedMotion(true);
    try {
      await expect(
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ).toBe(true);
      for (const expected of ["00:00:59", "00:00:58"]) {
        moveClock(SECOND);
        const trace: number[] = [];
        for (let i = 0; i < 6; i++) {
          // biome-ignore lint/performance/noAwaitInLoops: one frame at a time
          await nextFrame();
          trace.push(
            ...[0, 1].map((place) => offset(digit(scope, "seconds", place)))
          );
        }
        await expect(visibleText(scope)).toBe(expected);
        await expect(trace.every((v) => v === 0)).toBe(true);
      }
    } finally {
      await commands.emulateReducedMotion(false);
    }

    // The preference turns on while a roll is in flight: the newest glyph is
    // at rest on the next frame and no translate transition runs.
    const flip = byTestId(canvasElement, "flip");
    moveClock(SECOND);
    await frame();
    await frame();
    const ones = digit(flip, "seconds", 0);
    await expect(Math.abs(offset(ones))).toBeGreaterThan(0);
    await expect(runningTranslate(ones)).toBe(1);
    await commands.emulateReducedMotion(true);
    try {
      await nextFrame();
      await expect(offset(digit(flip, "seconds", 0))).toBe(0);
      await expect(runningTranslate(digit(flip, "seconds", 0))).toBe(0);
      await expect(visibleText(flip)).toBe("00:00:57");
    } finally {
      await commands.emulateReducedMotion(false);
    }

    // animated={false} during a normal-motion roll: the newest text at once,
    // with no roll DOM left.
    const toggle = byTestId(canvasElement, "toggle");
    moveClock(SECOND);
    await frame();
    await expect(Math.abs(offset(digit(toggle, "seconds", 0)))).toBeGreaterThan(
      0
    );
    byTestId(canvasElement, "toggle-static").click();
    await frame();
    await expect(
      toggle.querySelector('[data-slot="rolling-number"]')
    ).toBeNull();
    await expect(visibleText(toggle)).toBe("00:00:56");
  },
};

/** A tick that has rolled does not roll again when shown after display: none. */
export const ReShow: Story = {
  tags: TEST_ONLY,
  render: () => {
    clock.t = T0;
    return (
      <div className="text-5xl" data-testid="reshow">
        <Countdown animated now={now} target={T0 + MINUTE} />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const scope = byTestId(canvasElement, "reshow");
    await settled();
    moveClock(SECOND);
    await wait(600);
    const ones = () => digit(scope, "seconds", 0);
    await expect(offset(ones())).toBe(0);
    await expect(face(ones()).dataset.prev).toBe("0");
    scope.style.display = "none";
    await frame();
    scope.style.display = "";
    const trace: number[] = [];
    for (let i = 0; i < 6; i++) {
      // biome-ignore lint/performance/noAwaitInLoops: one frame at a time
      await nextFrame();
      trace.push(offset(ones()), offset(digit(scope, "seconds", 1)));
    }
    await expect(trace.every((v) => v === 0)).toBe(true);
    await expect(face(ones()).getAnimations().length).toBe(0);
    await expect(visibleText(scope)).toBe("00:00:59");
  },
};

// ---------------------------------------------------------------------------
// Hidden by a Suspense fallback, shown again
// ---------------------------------------------------------------------------

function makeGate() {
  let release: () => void = () => undefined;
  const promise = new Promise<void>((resolve) => {
    release = resolve;
  });
  return { promise, release };
}

const revealGates = { plain: makeGate(), memo: makeGate() };
const revealCalls = { plain: 0, memo: 0 };

interface Frame {
  fallback: boolean;
  text: string;
  visible: boolean;
}

function SuspendsOn({ on }: { on: Promise<void> | null }) {
  if (on) {
    use(on);
  }
  return null;
}

function PlainRevealHost({ id }: { id: "plain" | "memo" }) {
  return (
    <Countdown
      now={now}
      onComplete={() => {
        revealCalls[id] += 1;
      }}
      target={T0 + 2 * SECOND}
    />
  );
}
const MemoRevealHost = memo(PlainRevealHost);

function RevealCase({ id }: { id: "plain" | "memo" }) {
  const [on, setOn] = useState<Promise<void> | null>(null);
  const Host = id === "plain" ? PlainRevealHost : MemoRevealHost;
  return (
    <div className="text-5xl" data-testid={`reveal-${id}`}>
      <button
        className="sr-only"
        data-testid={`reveal-${id}-hide`}
        onClick={() => setOn(revealGates[id].promise)}
        type="button"
      >
        hide
      </button>
      <Suspense fallback={<i data-testid={`reveal-${id}-fallback`}>…</i>}>
        <Host id={id} />
        <SuspendsOn on={on} />
      </Suspense>
    </div>
  );
}

/** Shown again after the deadline passed while hidden: the first frame is current. */
export const SuspenseReveal: Story = {
  tags: TEST_ONLY,
  render: () => {
    clock.t = T0;
    revealGates.plain = makeGate();
    revealGates.memo = makeGate();
    revealCalls.plain = 0;
    revealCalls.memo = 0;
    return (
      <div className="flex flex-col gap-4">
        <RevealCase id="plain" />
        <RevealCase id="memo" />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    await settled();
    const ids = ["plain", "memo"] as const;
    for (const id of ids) {
      byTestId(canvasElement, `reveal-${id}-hide`).click();
    }
    await wait(50);
    await expect(
      ids.map((id) => byTestId(canvasElement, `reveal-${id}-fallback`) !== null)
    ).toEqual([true, true]);
    // The deadline passes while both are hidden; no event is sent.
    clock.t = T0 + 10 * SECOND;
    const frames: Record<(typeof ids)[number], Frame[]> = {
      plain: [],
      memo: [],
    };
    let sampling = true;
    const sample = () => {
      for (const id of ids) {
        const scope = byTestId(canvasElement, `reveal-${id}`);
        const root = scope.querySelector('[data-slot="countdown"]');
        frames[id].push({
          fallback: byTestId(canvasElement, `reveal-${id}-fallback`) !== null,
          visible: root !== null && getComputedStyle(root).display !== "none",
          text: root ? visibleText(root) : "",
        });
      }
      if (sampling) {
        requestAnimationFrame(sample);
      }
    };
    requestAnimationFrame(sample);
    await nextFrame();
    await nextFrame();
    // Recorded before the release: the fallback is up and the timer hidden.
    await expect(
      ids.map((id) => frames[id].some((f) => f.fallback && !f.visible))
    ).toEqual([true, true]);
    for (const id of ids) {
      revealGates[id].release();
    }
    await wait(1200);
    sampling = false;
    const shownAgain = ids.map((id) => {
      const list = frames[id];
      const first = list.findIndex((f) => !f.fallback);
      return {
        id,
        firstVisible: list[first]?.visible,
        first: list[first]?.text,
        later: [...new Set(list.slice(first + 1).map((f) => f.text))],
      };
    });
    await expect(shownAgain).toEqual([
      {
        id: "plain",
        firstVisible: true,
        first: "00:00:00",
        later: ["00:00:00"],
      },
      {
        id: "memo",
        firstVisible: true,
        first: "00:00:00",
        later: ["00:00:00"],
      },
    ]);
    await expect(revealCalls).toEqual({ plain: 1, memo: 1 });
  },
};
