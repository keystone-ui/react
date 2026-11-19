import { Button } from "@keystoneui/react/button";
import {
  RollingNumber,
  type RollingNumberProps,
} from "@keystoneui/react/rolling-number";
import { StatValue } from "@keystoneui/react/stat";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect } from "storybook/test";

const meta: Meta<typeof RollingNumber> = {
  title: "RollingNumber",
  component: RollingNumber,
};

export default meta;
type Story = StoryObj<typeof RollingNumber>;

const TEST_ONLY: Story["tags"] = ["!dev", "!autodocs"];

// ---------------------------------------------------------------------------
// Development stories
// ---------------------------------------------------------------------------

function Counter(props: Omit<RollingNumberProps, "value">) {
  const [value, setValue] = useState(1234);
  return (
    <div className="flex flex-col items-start gap-4">
      <RollingNumber
        className="font-semibold text-4xl"
        value={value}
        {...props}
      />
      <div className="flex gap-2">
        <Button
          onClick={() => setValue((v) => v - 1)}
          size="sm"
          variant="outline"
        >
          −1
        </Button>
        <Button
          onClick={() => setValue((v) => v + 1)}
          size="sm"
          variant="outline"
        >
          +1
        </Button>
        <Button
          onClick={() => setValue((v) => v + 100)}
          size="sm"
          variant="outline"
        >
          +100
        </Button>
      </div>
    </div>
  );
}

export const Default: Story = {
  render: () => <Counter />,
};

export const Currency: Story = {
  render: () => (
    <Counter format={{ style: "currency", currency: "EUR" }} locale="de-DE" />
  ),
};

export const TrendDown: Story = {
  render: () => <Counter trend="down" />,
};

export const NotAnimated: Story = {
  render: () => <Counter animated={false} />,
};

export const Stat: Story = {
  render() {
    const [value, setValue] = useState(48_210);
    return (
      <div className="flex flex-col items-start gap-4">
        <StatValue>
          <RollingNumber
            format={{
              style: "currency",
              currency: "USD",
              maximumFractionDigits: 0,
            }}
            value={value}
          />
          <span className="font-normal text-muted-foreground text-sm">
            this month
          </span>
        </StatValue>
        <Button
          onClick={() => setValue((v) => v + 137)}
          size="sm"
          variant="outline"
        >
          Add a sale
        </Button>
      </div>
    );
  },
};

export const Locales: Story = {
  render() {
    const [value, setValue] = useState(1_234_567.89);
    return (
      <div className="flex flex-col items-start gap-2 text-2xl">
        {["en-US", "de-DE", "en-IN"].map((locale) => (
          <div className="flex gap-4" key={locale}>
            <span className="w-24 text-muted-foreground text-sm">{locale}</span>
            <RollingNumber locale={locale} value={value} />
          </div>
        ))}
        <Button
          onClick={() => setValue((v) => v + 11.11)}
          size="sm"
          variant="outline"
        >
          +11.11
        </Button>
      </div>
    );
  },
};

// ---------------------------------------------------------------------------
// Real-browser tests
// ---------------------------------------------------------------------------

interface RealCommands {
  emulateReducedMotion: (reduce: boolean) => Promise<void>;
}
const realCommands = () =>
  (globalThis as { __realCommands?: RealCommands }).__realCommands;

const frame = () =>
  new Promise<void>((resolve) =>
    requestAnimationFrame(() => setTimeout(resolve, 0))
  );
const wait = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * One RollingNumber whose value is set by clicking a hidden button per
 * target value (`<id>-to-<value>`), so a play changes it as a user would.
 */
function Settable({
  id,
  values,
  initial,
  toggleAnimated = false,
  ...props
}: Omit<RollingNumberProps, "value"> & {
  id: string;
  initial: number;
  toggleAnimated?: boolean;
  values: number[];
}) {
  const [value, setValue] = useState(initial);
  const [animated, setAnimated] = useState(true);
  return (
    <>
      <RollingNumber
        animated={animated}
        data-testid={id}
        value={value}
        {...props}
      />
      <span className="sr-only">
        {values.map((v) => (
          <button
            data-testid={`${id}-to-${v}`}
            key={v}
            onClick={() => setValue(v)}
            type="button"
          >
            {v}
          </button>
        ))}
        {toggleAnimated ? (
          <button
            data-testid={`${id}-static`}
            onClick={() => setAnimated(false)}
            type="button"
          >
            static
          </button>
        ) : null}
      </span>
    </>
  );
}

const byTestId = (root: HTMLElement, id: string) =>
  root.querySelector(`[data-testid="${id}"]`) as HTMLElement;
const set = (root: HTMLElement, id: string, value: number) =>
  byTestId(root, `${id}-to-${value}`).click();
const column = (root: HTMLElement, id: string, place: number) =>
  byTestId(root, id).querySelector(
    `[data-slot="rolling-number-digit"][data-place="${place}"]`
  ) as HTMLElement;
const face = (col: HTMLElement) => col.firstElementChild as HTMLElement;
/** How far the face sits below (+) or above (−) its column, in px. */
const offset = (col: HTMLElement) =>
  face(col).getBoundingClientRect().top - col.getBoundingClientRect().top;
const ms = (duration: string) =>
  Number.parseFloat(duration) * (duration.trim().endsWith("ms") ? 1 : 1000);

/** the duration token drives the roll. */
export const TokenDrivesRoll: Story = {
  tags: TEST_ONLY,
  render: () => (
    <div className="flex gap-8 text-2xl">
      <Settable id="normal" initial={5} values={[6]} />
      <div className="[--duration-slow:0.01ms]">
        <Settable id="reduced" initial={5} values={[6]} />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const reducedTokens: string[] = [];
    const walk = (rules: CSSRuleList, reduced: boolean) => {
      for (const rule of rules) {
        const inReduced =
          reduced ||
          (rule instanceof CSSMediaRule &&
            rule.conditionText.includes("prefers-reduced-motion: reduce"));
        if (
          inReduced &&
          rule instanceof CSSStyleRule &&
          rule.selectorText === ":root"
        ) {
          reducedTokens.push(rule.style.getPropertyValue("--duration-slow"));
        }
        if ("cssRules" in rule) {
          walk((rule as CSSGroupingRule).cssRules, inReduced);
        }
      }
    };
    for (const sheet of document.styleSheets) {
      walk(sheet.cssRules, false);
    }
    await expect(reducedTokens.map((v) => v.trim())).toContain("0.01ms");

    set(canvasElement, "normal", 6);
    set(canvasElement, "reduced", 6);
    await frame();
    const normal = face(column(canvasElement, "normal", 0));
    const reduced = face(column(canvasElement, "reduced", 0));
    await expect(normal.dataset.prev).toBe("5");
    await expect(reduced.dataset.prev).toBe("5");
    await expect(ms(getComputedStyle(normal).transitionDuration)).toBe(250);
    await expect(ms(getComputedStyle(reduced).transitionDuration)).toBeCloseTo(
      0.01,
      5
    );
    await expect(getComputedStyle(normal).transitionProperty).toBe("translate");
  },
};

/** prefers-reduced-motion, for real. */
export const ReducedMotion: Story = {
  tags: TEST_ONLY,
  render: () => (
    <div className="flex flex-col gap-4 text-2xl">
      <Settable id="pref" initial={5} values={[6, 7, 8]} />
      {/* A long normal roll, so it is surely in flight when the
          preference changes. */}
      <div className="[--duration-slow:2000ms]">
        <Settable id="flip" initial={5} values={[6]} />
        <Settable id="flipdown" initial={6} values={[5]} />
      </div>
      <Settable id="toggle" initial={5} toggleAnimated values={[6]} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const commands = realCommands();
    if (!commands) {
      return;
    }
    await commands.emulateReducedMotion(true);
    try {
      await expect(
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ).toBe(true);
      // The start position is motion-safe only, so the new face is at rest
      // on the first frame after the change and never moves.
      const col = () => column(canvasElement, "pref", 0);
      for (const next of [6, 7]) {
        set(canvasElement, "pref", next);
        // biome-ignore lint/performance/noAwaitInLoops: one change at a time
        const trace = await sampleFrames(col, 6);
        await expect(face(col()).textContent).toBe(String(next));
        await expect(face(col()).dataset.prev).toBe(String(next - 1));
        await expect(trace).toEqual([0, 0, 0, 0, 0, 0]);
      }
    } finally {
      await commands.emulateReducedMotion(false);
    }

    // The preference turns on mid-roll: the roll stops on the next frame,
    // up and down alike.
    const runningTranslate = (col: HTMLElement) =>
      face(col)
        .getAnimations()
        .filter(
          (a) =>
            a instanceof CSSTransition &&
            a.transitionProperty === "translate" &&
            a.playState === "running"
        ).length;
    for (const [id, next] of [
      ["flip", 6],
      ["flipdown", 5],
    ] as const) {
      set(canvasElement, id, next);
      // biome-ignore lint/performance/noAwaitInLoops: one direction at a time
      await frame();
      await frame();
      const col = column(canvasElement, id, 0);
      await expect(Math.abs(offset(col))).toBeGreaterThan(0);
      await expect(runningTranslate(col)).toBe(1);
      await commands.emulateReducedMotion(true);
      try {
        await new Promise<void>((r) => requestAnimationFrame(() => r()));
        await expect(`${id}: ${offset(col)}`).toBe(`${id}: 0`);
        await expect(runningTranslate(col)).toBe(0);
        await expect(face(col).textContent).toBe(String(next));
      } finally {
        await commands.emulateReducedMotion(false);
      }
    }

    // animated={false} mid-roll: the newest text, no roll DOM.
    set(canvasElement, "toggle", 6);
    await frame();
    byTestId(canvasElement, "toggle-static").click();
    await frame();
    const toggle = byTestId(canvasElement, "toggle");
    await expect(
      toggle.querySelector('[data-slot="rolling-number-digit"]')
    ).toBeNull();
    await expect(toggle.textContent).toBe("6");
  },
};

/** copying across the number gives the formatted text once. */
function CopyFixture() {
  const [value, setValue] = useState(1239);
  return (
    <div className="flex flex-col gap-2">
      <p className="text-2xl" data-testid="para">
        Balance{" "}
        <RollingNumber
          data-testid="copy"
          format={{ style: "currency", currency: "EUR" }}
          locale="de-DE"
          value={value}
        />{" "}
        EUR
      </p>
      <button
        data-testid="copy-to-1240"
        onClick={() => setValue(1240)}
        type="button"
      >
        1240
      </button>
    </div>
  );
}

export const Copy: Story = {
  tags: TEST_ONLY,
  render: () => <CopyFixture />,
  play: async ({ canvasElement }) => {
    const para = byTestId(canvasElement, "para");
    const selection = getSelection() as Selection;
    const copied = () => {
      selection.removeAllRanges();
      const range = document.createRange();
      range.setStartBefore(para.firstChild as Node);
      range.setEndAfter(para.lastChild as Node);
      selection.addRange(range);
      const text = selection.toString();
      selection.removeAllRanges();
      return Array.from(text);
    };
    const expected = (v: number) =>
      Array.from(
        `Balance ${new Intl.NumberFormat("de-DE", {
          style: "currency",
          currency: "EUR",
        }).format(v)} EUR`
      );
    await expect(copied()).toEqual(expected(1239));
    set(canvasElement, "copy", 1240);
    await frame();
    // Mid-roll: two columns are moving and both outgoing glyphs are painted.
    const ones = column(canvasElement, "copy", 0);
    await expect(Math.abs(offset(ones))).toBeGreaterThan(0);
    await expect(copied()).toEqual(expected(1240));
  },
};

/** Samples the incoming face's offset once per frame, from the first frame on. */
async function sampleRoll(col: () => HTMLElement, durationMs: number) {
  const samples: number[] = [];
  const end = performance.now() + durationMs;
  while (performance.now() < end) {
    // biome-ignore lint/performance/noAwaitInLoops: one frame at a time
    await new Promise<void>((r) => requestAnimationFrame(() => r()));
    samples.push(offset(col()));
  }
  return samples;
}

async function sampleFrames(col: () => HTMLElement, frames: number) {
  const samples: number[] = [];
  for (let i = 0; i < frames; i++) {
    // biome-ignore lint/performance/noAwaitInLoops: one frame at a time
    await new Promise<void>((r) => requestAnimationFrame(() => r()));
    samples.push(offset(col()));
  }
  return samples;
}

/** The running roll's start position, from its CSS transition keyframes. */
function rollStart(col: HTMLElement) {
  const transition = face(col)
    .getAnimations()
    .find((a) => a instanceof CSSTransition) as CSSTransition | undefined;
  const effect = transition?.effect as KeyframeEffect | null | undefined;
  const keyframes = effect?.getKeyframes() ?? [];
  return keyframes[0]?.translate ?? null;
}

/** direction, wrap, and exactly one row. */
export const DirectionAndWrap: Story = {
  tags: TEST_ONLY,
  render: () => (
    <div className="flex gap-8 text-4xl">
      <Settable id="up" initial={9} trend="up" values={[10, 0]} />
      <Settable id="down" initial={0} trend="down" values={[9]} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const row = column(canvasElement, "up", 0).getBoundingClientRect().height;
    await expect(row).toBeGreaterThan(0);
    // translate 100% is the face's own height: one line, the column's height.
    await expect(
      Math.abs(
        face(column(canvasElement, "up", 0)).getBoundingClientRect().height -
          row
      )
    ).toBeLessThanOrEqual(0.5);

    // 9 → 0 rolling up: starts exactly one row below and rises to rest.
    set(canvasElement, "up", 0);
    await new Promise<void>((r) => requestAnimationFrame(() => r()));
    await expect(rollStart(column(canvasElement, "up", 0))).toBe("0px 100%");
    const up = await sampleRoll(() => column(canvasElement, "up", 0), 450);
    await expect(up[0]).toBeGreaterThan(0);
    await expect(Math.max(...up)).toBeLessThanOrEqual(row + 0.5);
    await expect(up.every((v, i) => i === 0 || v <= up[i - 1] + 0.01)).toBe(
      true
    );
    await expect(up.at(-1)).toBe(0);
    await expect(face(column(canvasElement, "up", 0)).dataset.prev).toBe("9");

    // 0 → 9 rolling down: starts exactly one row above: one step, not nine.
    set(canvasElement, "down", 9);
    await new Promise<void>((r) => requestAnimationFrame(() => r()));
    await expect(rollStart(column(canvasElement, "down", 0))).toBe("0px -100%");
    const down = await sampleRoll(() => column(canvasElement, "down", 0), 450);
    await expect(down[0]).toBeLessThan(0);
    await expect(Math.min(...down)).toBeGreaterThanOrEqual(-row - 0.5);
    await expect(down.every((v, i) => i === 0 || v >= down[i - 1] - 0.01)).toBe(
      true
    );
    await expect(down.at(-1)).toBe(0);
  },
};

/** 2, then values that round to the same text, one per frame. */
const STREAM = [2, ...Array.from({ length: 30 }, (_, i) => 2 + (i + 1) / 1000)];

/** A settled face does not roll again when its number is shown again. */
function ReShowFixture() {
  const [hidden, setHidden] = useState(false);
  return (
    <div className="text-4xl">
      <div hidden={hidden}>
        <Settable id="reshow" initial={5} values={[6, 7, 8, 9]} />
        <Settable id="hiddenset" initial={1} values={[2]} />
        <Settable
          format={{ maximumFractionDigits: 0 }}
          id="stream"
          initial={1}
          values={STREAM}
        />
      </div>
      <button
        data-testid="reshow-toggle"
        onClick={() => setHidden((h) => !h)}
        type="button"
      >
        toggle
      </button>
    </div>
  );
}

export const ReShow: Story = {
  tags: TEST_ONLY,
  render: () => <ReShowFixture />,
  play: async ({ canvasElement }) => {
    const col = () => column(canvasElement, "reshow", 0);
    const toggle = () => byTestId(canvasElement, "reshow-toggle").click();
    const hideAndShow = async () => {
      toggle();
      await frame();
      toggle();
      return await sampleFrames(col, 6);
    };

    // A roll, at rest, then hidden for a frame and shown: no movement.
    set(canvasElement, "reshow", 6);
    await frame();
    await expect(offset(col())).toBeGreaterThan(0);
    await wait(400);
    await expect(offset(col())).toBe(0);
    await expect(await hideAndShow()).toEqual([0, 0, 0, 0, 0, 0]);
    await expect(face(col()).getAnimations()).toEqual([]);
    await expect(face(col()).dataset.prev).toBe("5");

    // A second change inside the first two frames still ends on its glyph,
    // at rest, and does not replay when shown again.
    set(canvasElement, "reshow", 7);
    await new Promise<void>((r) => requestAnimationFrame(() => r()));
    await expect(face(col()).textContent).toBe("7");
    set(canvasElement, "reshow", 8);
    await frame();
    await wait(400);
    await expect(face(col()).textContent).toBe("8");
    await expect(face(col()).dataset.prev).toBe("7");
    await expect(offset(col())).toBe(0);
    await expect(await hideAndShow()).toEqual([0, 0, 0, 0, 0, 0]);

    // A value committed while hidden: two frames later it is shown at rest.
    const hiddenCol = () => column(canvasElement, "hiddenset", 0);
    toggle();
    await frame();
    set(canvasElement, "hiddenset", 2);
    await sampleFrames(hiddenCol, 3);
    toggle();
    await expect(await sampleFrames(hiddenCol, 6)).toEqual([0, 0, 0, 0, 0, 0]);
    await expect(face(hiddenCol()).textContent).toBe("2");
    await expect(face(hiddenCol()).getAnimations()).toEqual([]);

    // A stream of values with the same text, one per frame, after a roll:
    // hidden and shown again during the stream, nothing replays.
    const streamCol = () => column(canvasElement, "stream", 0);
    // The stream starts inside the roll's first two frames.
    set(canvasElement, "stream", 2);
    const offsets: number[] = [];
    for (const [i, v] of STREAM.slice(1).entries()) {
      // biome-ignore lint/performance/noAwaitInLoops: one value per frame
      await new Promise<void>((r) => requestAnimationFrame(() => r()));
      set(canvasElement, "stream", v);
      // Hidden and shown again after the roll itself has ended (~20 frames).
      if (i === 22) {
        toggle();
      }
      if (i === 23) {
        toggle();
      }
      if (i > 23) {
        offsets.push(offset(streamCol()));
      }
    }
    await expect(offsets.every((v) => v === 0)).toBe(true);
    await expect(face(streamCol()).textContent).toBe("2");

    // Reduced motion: neither the roll nor a re-show moves.
    const commands = realCommands();
    if (!commands) {
      return;
    }
    await commands.emulateReducedMotion(true);
    try {
      set(canvasElement, "reshow", 9);
      await expect(await sampleFrames(col, 6)).toEqual([0, 0, 0, 0, 0, 0]);
      await expect(face(col()).textContent).toBe("9");
      await expect(await hideAndShow()).toEqual([0, 0, 0, 0, 0, 0]);
    } finally {
      await commands.emulateReducedMotion(false);
    }
  },
};

/** a change during a roll restarts it from the previous glyph. */
export const Interrupt: Story = {
  tags: TEST_ONLY,
  render: () => (
    <div className="text-4xl">
      <Settable id="int" initial={5} values={[6, 7]} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const col = () => column(canvasElement, "int", 0);
    const row = col().getBoundingClientRect().height;
    set(canvasElement, "int", 6);
    const first = face(col());
    await frame();
    await expect(offset(col())).toBeGreaterThan(0);
    await wait(50);
    set(canvasElement, "int", 7);
    await frame();
    // The second roll starts from 6, one full row away: the face remounted.
    await expect(face(col()).dataset.prev).toBe("6");
    await expect(face(col()).textContent).toBe("7");
    await expect(face(col())).not.toBe(first);
    await expect(rollStart(col())).toBe("0px 100%");
    await expect(offset(col())).toBeGreaterThan(row * 0.5);
    // After --duration-slow, the newest glyph is at rest and stays there.
    const after = await sampleRoll(col, 600);
    await expect(after.at(-1)).toBe(0);
    const rest = after.indexOf(0);
    await expect(after.slice(rest).every((v) => v === 0)).toBe(true);
    await expect(face(col()).textContent).toBe("7");
  },
};

const textBottom = (el: Element) => {
  const range = document.createRange();
  range.selectNodeContents(el);
  return range.getBoundingClientRect().bottom;
};

/** layout during a roll. */
export const Layout: Story = {
  tags: TEST_ONLY,
  render: () => (
    <div className="flex flex-col gap-6">
      <p className="text-3xl">
        <Settable
          format={{ style: "currency", currency: "USD" }}
          id="layout"
          initial={1234}
          values={[1235]}
        />
        <span data-testid="marker">|</span>
      </p>
      <p className="text-3xl">
        <Settable id="gain" initial={999} values={[1000, 999]} />
        <span data-testid="gain-marker">|</span>
      </p>
      <div className="w-[1ch] text-3xl">
        <Settable id="narrow" initial={1_234_567} values={[1_234_568]} />
      </div>
      <StatValue className="w-[140px] text-3xl">
        <Settable id="narrowstat" initial={1_234_567.89} values={[1]} />
        <span className="font-normal text-sm">this month</span>
      </StatValue>
      <StatValue className="text-3xl">
        <Settable
          format={{ style: "currency", currency: "USD" }}
          id="stat"
          initial={48}
          values={[49]}
        />
        <span className="font-normal text-sm" data-testid="unit">
          this month
        </span>
      </StatValue>
    </div>
  ),
  play: async ({ canvasElement }) => {
    // A number never breaks between two digits, however narrow its box.
    for (const id of ["narrow", "narrowstat"]) {
      const rootHeight = byTestId(canvasElement, id).getBoundingClientRect()
        .height;
      const columnHeight = column(canvasElement, id, 0).getBoundingClientRect()
        .height;
      // biome-ignore lint/performance/noAwaitInLoops: one box at a time
      await expect(Math.abs(rootHeight - columnHeight)).toBeLessThanOrEqual(
        0.5
      );
    }
    const marker = byTestId(canvasElement, "marker");
    const x = marker.getBoundingClientRect().left;
    for (const id of ["layout", "stat"]) {
      const root = byTestId(canvasElement, id);
      const symbol = root.querySelector('[data-type="currency"]') as Element;
      const digit = face(column(canvasElement, id, 0));
      // biome-ignore lint/performance/noAwaitInLoops: one row at a time
      await expect(
        Math.abs(textBottom(digit) - textBottom(symbol))
      ).toBeLessThanOrEqual(1);
    }
    set(canvasElement, "layout", 1235);
    set(canvasElement, "stat", 49);
    await frame();
    await expect(
      Math.abs(offset(column(canvasElement, "layout", 0)))
    ).toBeGreaterThan(0);
    await expect(marker.getBoundingClientRect().left).toBe(x);
    await wait(400);
    await expect(marker.getBoundingClientRect().left).toBe(x);
    // Gaining or losing a digit changes the width at once, not over the roll.
    const gainMarker = byTestId(canvasElement, "gain-marker");
    const gainRoot = byTestId(canvasElement, "gain");
    const x999 = gainMarker.getBoundingClientRect().left;
    const w999 = gainRoot.getBoundingClientRect().width;
    set(canvasElement, "gain", 1000);
    await frame();
    const x1000 = gainMarker.getBoundingClientRect().left;
    await expect(x1000).toBeGreaterThan(x999);
    await wait(400);
    await expect(gainMarker.getBoundingClientRect().left).toBe(x1000);
    set(canvasElement, "gain", 999);
    await frame();
    await expect(gainMarker.getBoundingClientRect().left).toBe(x999);
    await expect(gainRoot.getBoundingClientRect().width).toBe(w999);
    await wait(400);
    await expect(gainMarker.getBoundingClientRect().left).toBe(x999);
    for (const id of ["layout", "stat"]) {
      const root = byTestId(canvasElement, id);
      const symbol = root.querySelector('[data-type="currency"]') as Element;
      const digit = face(column(canvasElement, id, 0));
      // biome-ignore lint/performance/noAwaitInLoops: one row at a time
      await expect(
        Math.abs(textBottom(digit) - textBottom(symbol))
      ).toBeLessThanOrEqual(1);
    }
  },
};

// part order against a plain span. The numeric core runs in the digits'
// own direction; in mixed-direction text plain text can place digit groups,
// signs, currency and percent symbols differently. The cases outside the two
// lists below match plain text; the listed ones are asserted DIFFERENT, so a
// regression and a fix both turn this red.
interface OrderCase {
  dir: "ltr" | "rtl";
  format: Intl.NumberFormatOptions;
  locale: string;
  value: number;
}
const ORDER_FORMATS: Omit<OrderCase, "dir">[] = [
  {
    locale: "ar-EG",
    format: { style: "percent", signDisplay: "always" },
    value: -0.25,
  },
  {
    locale: "he-IL",
    format: { style: "currency", currency: "ILS" },
    value: -1234.5,
  },
  {
    locale: "fa-IR",
    format: { style: "currency", currency: "IRR", signDisplay: "always" },
    value: -1234,
  },
  {
    locale: "ar-EG",
    format: { style: "currency", currency: "EGP" },
    value: -1234.5,
  },
  { locale: "fa-IR", format: { style: "percent" }, value: 0.25 },
  // Left-to-right locales, also under a right-to-left page.
  {
    locale: "en-US",
    format: { style: "currency", currency: "USD" },
    value: 1234.5,
  },
  { locale: "en-US", format: { style: "percent" }, value: 0.25 },
  // Numbering systems whose digits are right to left (bidi class R).
  // Named by `-u-nu-`: Chromium's Intl formats `ff-Adlm-GN` and `nqo` with
  // Latin digits.
  { locale: "en-US-u-nu-adlm", format: {}, value: 1234.5 },
  { locale: "en-US-u-nu-nkoo", format: {}, value: 1234.5 },
  // Swiss German groups with an apostrophe, a neutral character.
  { locale: "de-CH", format: {}, value: 1234.5 },
];
const ORDER_CASES: (OrderCase & { id: string })[] = (
  ["ltr", "rtl"] as const
).flatMap((dir) =>
  ORDER_FORMATS.map((c, i) => ({ ...c, dir, id: `${dir}-${i}` }))
);
const caseName = (c: OrderCase) =>
  `${c.dir} ${c.locale} ${JSON.stringify(c.format)} ${c.value}`;

/**
 * Case names whose part order differs from plain text, measured in Chromium
 * with the numeric core as an `isolate-override` running the digits' own
 * direction. Each is a sign, currency or percent on the other side, except
 * `de-CH`, whose digit groups are reordered (see `KNOWN_CORE_DIVERGENT`).
 */
const KNOWN_DIVERGENT: string[] = [
  'ltr fa-IR {"style":"currency","currency":"IRR","signDisplay":"always"} -1234',
  'rtl he-IL {"style":"currency","currency":"ILS"} -1234.5',
  'rtl fa-IR {"style":"percent"} 0.25',
  'rtl en-US {"style":"currency","currency":"USD"} 1234.5',
  'rtl en-US {"style":"percent"} 0.25',
  "rtl de-CH {} 1234.5",
];

/**
 * Case names whose numeric core is painted differently from plain text. In a
 * right-to-left paragraph plain text reorders the digit groups around the
 * Swiss German apostrophe; the core keeps them in the digits' direction.
 * The Adlam and N'Ko cores match plain text in both directions.
 */
const KNOWN_CORE_DIVERGENT: string[] = ["rtl de-CH {} 1234.5"];

/** Each part's box, left to right, as part indices. */
function partOrder(boxes: { index: number; left: number; width: number }[]) {
  return boxes
    .filter((b) => b.width > 0)
    .sort((a, b) => a.left - b.left)
    .map((b) => b.index)
    .join(",");
}

function plainOrder(span: HTMLElement, c: OrderCase) {
  const parts = new Intl.NumberFormat(c.locale, c.format).formatToParts(
    c.value
  );
  const text = span.firstChild as Text;
  let at = 0;
  return partOrder(
    parts.map((p, index) => {
      const range = document.createRange();
      range.setStart(text, at);
      range.setEnd(text, at + p.value.length);
      at += p.value.length;
      const box = range.getBoundingClientRect();
      return { index, left: box.left, width: box.width };
    })
  );
}

function componentOrder(root: HTMLElement, c: OrderCase) {
  const parts = new Intl.NumberFormat(c.locale, c.format).formatToParts(
    c.value
  );
  const pieces = [
    ...root.querySelectorAll(
      '[data-slot="rolling-number-digit"], [data-slot="rolling-number-symbol"]'
    ),
  ] as HTMLElement[];
  // Walk the parts and consume the DOM pieces that spell each one.
  let k = 0;
  return partOrder(
    parts.map((p, index) => {
      let spelled = "";
      let left = Number.POSITIVE_INFINITY;
      let right = Number.NEGATIVE_INFINITY;
      while (spelled.length < p.value.length && k < pieces.length) {
        const piece = pieces[k++];
        spelled += piece.textContent ?? "";
        const box = piece.getBoundingClientRect();
        if (box.width > 0) {
          left = Math.min(left, box.left);
          right = Math.max(right, box.right);
        }
      }
      return { index, left, width: Math.max(0, right - left) };
    })
  );
}

/** The core's glyphs as painted, left to right. */
function paintedCore(root: HTMLElement) {
  const core = root.querySelector(
    '[aria-hidden="true"] > [dir]'
  ) as HTMLElement;
  return [...core.querySelectorAll("[data-slot]")]
    .map((el) => ({
      left: el.getBoundingClientRect().left,
      text: el.textContent ?? "",
    }))
    .sort((a, b) => a.left - b.left)
    .map((g) => g.text)
    .join("");
}

/**
 * The plain number's digits and separators (first integer to last
 * fraction) as painted, left to right: one Range per code point, advancing
 * the UTF-16 offset by each code point's length.
 */
function plainCore(span: HTMLElement, c: OrderCase) {
  const parts = new Intl.NumberFormat(c.locale, c.format).formatToParts(
    c.value
  );
  const first = parts.findIndex((p) => p.type === "integer");
  let last = first;
  for (const [i, p] of parts.entries()) {
    if (p.type === "integer" || p.type === "fraction") {
      last = i;
    }
  }
  const start = parts.slice(0, first).reduce((n, p) => n + p.value.length, 0);
  const core = parts
    .slice(first, last + 1)
    .map((p) => p.value)
    .join("");
  const text = span.firstChild as Text;
  let at = start;
  const glyphs: { left: number; text: string }[] = [];
  for (const glyph of Array.from(core)) {
    const range = document.createRange();
    range.setStart(text, at);
    range.setEnd(text, at + glyph.length);
    at += glyph.length;
    glyphs.push({ left: range.getBoundingClientRect().left, text: glyph });
  }
  return glyphs
    .sort((a, b) => a.left - b.left)
    .map((g) => g.text)
    .join("");
}

export const PartOrder: Story = {
  tags: TEST_ONLY,
  render: () => (
    <div className="flex flex-col gap-2 text-xl">
      {ORDER_CASES.map((c) => (
        <div dir={c.dir} key={c.id}>
          <RollingNumber
            data-testid={`order-${c.id}`}
            format={c.format}
            locale={c.locale}
            value={c.value}
          />
          <br />
          <span data-testid={`plain-${c.id}`}>
            {new Intl.NumberFormat(c.locale, c.format).format(c.value)}
          </span>
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const report = ORDER_CASES.map((c) => ({
      name: caseName(c),
      plain: plainOrder(byTestId(canvasElement, `plain-${c.id}`), c),
      rolling: componentOrder(byTestId(canvasElement, `order-${c.id}`), c),
      core: paintedCore(byTestId(canvasElement, `order-${c.id}`)),
      plainCore: plainCore(byTestId(canvasElement, `plain-${c.id}`), c),
    }));
    // The number itself is painted as plain text paints it, glyph by glyph
    // (Adlam and N'Ko digits right to left included), except the cases in
    // `KNOWN_CORE_DIVERGENT`.
    const coreMismatch = report
      .filter((r) => r.core !== r.plainCore)
      .map((r) => r.name);
    const divergent = report
      .filter((r) => r.plain !== r.rolling)
      .map((r) => r.name);
    await expect({ coreMismatch, divergent, report }).toEqual({
      coreMismatch: KNOWN_CORE_DIVERGENT,
      divergent: KNOWN_DIVERGENT,
      report,
    });
  },
};
