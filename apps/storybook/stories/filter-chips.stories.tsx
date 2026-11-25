import { DirectionProvider } from "@base-ui/react/direction-provider";
import { Button } from "@keystoneui/react/button";
import { Card, CardContent } from "@keystoneui/react/card";
import {
  FilterChip,
  type FilterChipState,
  FilterChips,
  type FilterChipsRenderProp,
  type FilterChipsSize,
  type FilterChipsState,
} from "@keystoneui/react/filter-chips";
import { Tabs, TabsList, TabsTrigger } from "@keystoneui/react/tabs";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Clapperboard as ClapperboardIcon,
  Newspaper as NewspaperIcon,
} from "lucide-react";
import {
  type CSSProperties,
  createElement,
  type KeyboardEvent,
  memo,
  Profiler,
  type ReactElement,
  type RefObject,
  useMemo,
  useState,
} from "react";
import { flushSync } from "react-dom";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { expect, waitFor, within } from "storybook/test";
import { outsideVitest } from "./real-browser";

const meta = {
  title: "Components/FilterChips",
  component: FilterChips,
  excludeStories: ["typeContract"],
  parameters: {
    docs: {
      description: {
        component: `
Pill-shaped choices that filter one list in place: at most one chip is selected, and each chip can show a result count.

\`\`\`tsx
import { FilterChip, FilterChips } from "@keystoneui/react/filter-chips";

<FilterChips aria-label="Topic" value={topic} onValueChange={setTopic}>
  <FilterChip value="all" count={6}>All</FilterChip>
  <FilterChip value="typography" count={3}>Typography</FilterChip>
  <FilterChip value="color" count={2}>Color</FilterChip>
  <FilterChip value="motion" count={0}>Motion</FilterChip>
</FilterChips>
\`\`\`

- A radio group: arrow keys move focus and the choice together and wrap; Space picks; Enter does nothing.
- The selected chip cannot be switched off by clicking it again.
- Unselected chips with a count of 0 are disabled (\`disableEmpty={false}\` opts out).
- Not a multi-select, not tabs, and a chip is not a link or a button.

The behaviour tests and review aids are hidden from the sidebar and this page; they still run in Vitest.
`,
      },
    },
  },
} satisfies Meta<typeof FilterChips>;

export default meta;
type Story = StoryObj<typeof meta>;

// Behaviour tests and review aids: out of the sidebar and the docs page,
// still run by Vitest (they keep Storybook's default `test` tag).
const TEST_ONLY: Story["tags"] = ["!dev", "!autodocs"];

const TOPICS = [
  { value: "all", label: "All", count: 6 },
  { value: "typography", label: "Typography", count: 3 },
  { value: "color", label: "Color", count: 2 },
  { value: "motion", label: "Motion", count: 0 },
];

// ---------------------------------------------------------------------------
// Stories that mirror the docs demos
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: () => (
    <FilterChips aria-label="Topic" defaultValue="all">
      {TOPICS.map((t) => (
        <FilterChip count={t.count} key={t.value} value={t.value}>
          {t.label}
        </FilterChip>
      ))}
    </FilterChips>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-4">
      {(["sm", "default", "lg"] as const).map((size) => (
        <FilterChips
          aria-label={`Topic, ${size}`}
          defaultValue="all"
          key={size}
          size={size}
        >
          {TOPICS.map((t) => (
            <FilterChip count={t.count} key={t.value} value={t.value}>
              {t.label}
            </FilterChip>
          ))}
        </FilterChips>
      ))}
    </div>
  ),
};

export const Counts: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-4">
      <FilterChips aria-label="Topic" defaultValue="all">
        {TOPICS.map((t) => (
          <FilterChip count={t.count} key={t.value} value={t.value}>
            {t.label}
          </FilterChip>
        ))}
      </FilterChips>
      <FilterChips
        aria-label="Topic, empty chips enabled"
        defaultValue="all"
        disableEmpty={false}
      >
        {TOPICS.map((t) => (
          <FilterChip count={t.count} key={t.value} value={t.value}>
            {t.label}
          </FilterChip>
        ))}
      </FilterChips>
      <FilterChips
        aria-label="Region"
        defaultValue="all"
        formatCount={formatCompact}
      >
        <FilterChip count={12_840} value="all">
          All
        </FilterChip>
        <FilterChip count={1200} value="europe">
          Europe
        </FilterChip>
        <FilterChip count={940} value="asia">
          Asia
        </FilterChip>
      </FilterChips>
    </div>
  ),
};

const compact = new Intl.NumberFormat("en-US", { notation: "compact" });
const grouped = new Intl.NumberFormat("en-US");
function formatGrouped(count: number) {
  return grouped.format(count);
}
function formatCompact(count: number) {
  return compact.format(count);
}

const ARTICLES = [
  { title: "Choosing a type scale", topic: "typography" },
  { title: "Line height for long text", topic: "typography" },
  { title: "Tinted neutrals", topic: "color" },
  { title: "Contrast on coloured surfaces", topic: "color" },
  { title: "Picking a typeface pair", topic: "typography" },
  { title: "Easing for small elements", topic: "motion" },
];

function ControlledList() {
  const [topic, setTopic] = useState<string | null>("all");
  const shown = ARTICLES.filter((a) => topic === "all" || a.topic === topic);
  const count = (value: string) =>
    value === "all"
      ? ARTICLES.length
      : ARTICLES.filter((a) => a.topic === value).length;
  return (
    <div className="flex w-80 flex-col gap-3">
      <FilterChips aria-label="Topic" onValueChange={setTopic} value={topic}>
        {["all", "typography", "color", "motion"].map((value) => (
          <FilterChip count={count(value)} key={value} value={value}>
            {value[0].toUpperCase() + value.slice(1)}
          </FilterChip>
        ))}
      </FilterChips>
      <ul className="flex flex-col gap-1 text-sm" data-testid="list">
        {shown.map((a) => (
          <li key={a.title}>{a.title}</li>
        ))}
      </ul>
    </div>
  );
}

export const Controlled: Story = {
  render: () => <ControlledList />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const list = canvas.getByTestId("list");
    await expect(list.children).toHaveLength(6);
    canvas.getByRole("radio", named("Color 2")).click();
    await waitFor(() => expect(list.children).toHaveLength(2));
    // Motion has a count of 1 here, so it is available.
    await expect(
      canvas.getByRole("radio", named("Motion 1"))
    ).not.toHaveAttribute("data-disabled");
  },
};

function UnderTabsExample() {
  return (
    <Tabs className="w-fit" defaultValue="articles">
      <TabsList>
        <TabsTrigger value="articles">Articles</TabsTrigger>
        <TabsTrigger value="videos">Videos</TabsTrigger>
      </TabsList>
      <FilterChips aria-label="Topic" className="mt-3" defaultValue="all">
        {TOPICS.map((t) => (
          <FilterChip count={t.count} key={t.value} value={t.value}>
            {t.label}
          </FilterChip>
        ))}
      </FilterChips>
    </Tabs>
  );
}

export const UnderTabs: Story = {
  name: "Under Tabs",
  render: () => <UnderTabsExample />,
};

// ---------------------------------------------------------------------------
// Real-browser fixtures
// ---------------------------------------------------------------------------

type RealUser = typeof import("vitest/browser").userEvent;

/** Vitest's real (Playwright) input; absent when Storybook runs the play. */
const realUser = () =>
  (globalThis as { __realUserEvent?: RealUser }).__realUserEvent;

const settle = () =>
  new Promise<void>((resolve) =>
    requestAnimationFrame(() => setTimeout(resolve, 0))
  );

/** A role query option, kept out of story-name scans. */
const named = (accessibleName: string) => ({ name: accessibleName });

/** Polls a read-only check; never touches the DOM. */
const eventually = (check: () => unknown) => waitFor(async () => check());

interface ChipSpec {
  count?: number;
  disabled?: boolean;
  /** Hide the chip with an inline `display: none`. */
  hide?: boolean;
  /** Render the chip as a `<div>` instead of its own `<span>`. */
  tag?: "div";
  value: string;
  /** Put the chip inside an element of its own with this style. */
  wrap?: CSSProperties;
}

interface HarnessState {
  cancel: boolean;
  chips: ChipSpec[];
  controlled: boolean;
  /** A controlled parent that never accepts a change. */
  ignore: boolean;
  label: string;
  /** Unmounts the row when false. */
  mounted: boolean;
  /** Wraps the row in a right-to-left DirectionProvider. */
  provider: boolean;
  rootDisabled: boolean;
  rtl: boolean;
  value: string | null;
}

const FOUR: ChipSpec[] = [
  { value: "a", count: 3 },
  { value: "b", count: 2 },
  { value: "c", count: 1 },
  { value: "d", count: 4 },
];

const INITIAL: HarnessState = {
  controlled: true,
  value: null,
  chips: FOUR,
  rootDisabled: false,
  cancel: false,
  ignore: false,
  label: "Topic",
  mounted: true,
  provider: false,
  rtl: false,
};

/** Lets a play reach into the fixture: set its state, read its changes. */
const harness: {
  set?: (patch: Partial<HarnessState>) => void;
  changes: string[];
  /** Runs from the row's own `onKeyDown`, as an app's handler would. */
  keyDown?: (event: KeyboardEvent<HTMLDivElement>) => void;
  /** Runs from `onValueChange`, after the change is recorded. */
  onChange?: (value: string) => void;
  /** More props for each chip, spread last. */
  chipProps?: (value: string) => Record<string, unknown>;
  /** More props for the row. */
  rowProps?: Record<string, unknown>;
} = { changes: [] };

function Harness() {
  const [state, setState] = useState(INITIAL);
  const [generation, setGeneration] = useState(0);
  harness.set = (patch) => {
    if ("controlled" in patch) {
      setGeneration((n) => n + 1);
    }
    setState((prev) => ({ ...prev, ...patch }));
  };
  const onValueChange = (next: string, details: { cancel: () => void }) => {
    harness.changes.push(next);
    harness.onChange?.(next);
    if (state.cancel) {
      details.cancel();
      return;
    }
    if (state.controlled && !state.ignore) {
      setState((prev) => ({ ...prev, value: next }));
    }
  };
  const row = (
    <FilterChips
      aria-label={state.label}
      disabled={state.rootDisabled}
      key={generation}
      onKeyDown={(event) => harness.keyDown?.(event)}
      onValueChange={onValueChange}
      {...(state.controlled
        ? { value: state.value }
        : { defaultValue: state.value })}
      {...harness.rowProps}
    >
      {state.chips.map((c) => {
        const chip = (
          <FilterChip
            count={c.count}
            data-chip={c.value}
            disabled={c.disabled}
            key={c.value}
            render={c.tag === "div" ? <div /> : undefined}
            style={c.hide ? { display: "none" } : undefined}
            value={c.value}
            {...harness.chipProps?.(c.value)}
          >
            {c.value.toUpperCase()}
          </FilterChip>
        );
        return c.wrap ? (
          <span data-wrap={c.value} key={c.value} style={c.wrap}>
            {chip}
          </span>
        ) : (
          chip
        );
      })}
    </FilterChips>
  );
  const placed = state.provider ? (
    <DirectionProvider direction="rtl">{row}</DirectionProvider>
  ) : (
    row
  );
  return (
    <div className="flex flex-col items-start gap-2 p-4">
      <button data-testid="before" type="button">
        before
      </button>
      <div dir={state.rtl ? "rtl" : undefined}>
        {state.mounted ? placed : null}
      </div>
      <button data-testid="after" type="button">
        after
      </button>
    </div>
  );
}

function tools(canvasElement: HTMLElement) {
  const user = realUser() as RealUser;
  const canvas = within(canvasElement);
  const before = canvas.getByTestId("before");
  const after = canvas.getByTestId("after");
  const chip = (value: string) =>
    canvasElement.querySelector(`[data-chip="${value}"]`) as HTMLElement;
  const values = ["a", "b", "c", "d"];
  const focused = () => {
    const active = document.activeElement as HTMLElement | null;
    if (!active || active === document.body) {
      return "body";
    }
    return active.dataset.chip ?? active.dataset.testid ?? "?";
  };
  const tabStops = () =>
    values.filter((v) => chip(v)?.tabIndex === 0).join(",");
  const checked = () =>
    values
      .filter((v) => chip(v)?.getAttribute("aria-checked") === "true")
      .join(",");
  const reset = async (
    patch: Partial<HarnessState> = {},
    hooks: Pick<typeof harness, "chipProps" | "rowProps"> = {}
  ) => {
    (document.activeElement as HTMLElement | null)?.blur?.();
    harness.keyDown = undefined;
    harness.onChange = undefined;
    harness.chipProps = hooks.chipProps;
    harness.rowProps = hooks.rowProps;
    harness.set?.({
      ...INITIAL,
      ...patch,
      controlled: patch.controlled ?? true,
    });
    await settle();
    harness.changes.length = 0;
  };
  const tabIn = async () => {
    before.focus();
    await user.keyboard("{Tab}");
  };
  const shiftTabIn = async () => {
    after.focus();
    await user.keyboard("{Shift>}{Tab}{/Shift}");
  };
  return {
    user,
    before,
    after,
    chip,
    focused,
    tabStops,
    checked,
    reset,
    tabIn,
    shiftTabIn,
  };
}

type Tools = ReturnType<typeof tools>;

/**
 * Whether real input is required: under Vitest a play that needs it fails
 * without it, instead of passing silently.
 */
const needsRealInput = () => {
  if (realUser()) {
    return true;
  }
  // Vitest's browser mode marks the page with `__vitest_browser__`.
  const underVitest =
    (globalThis as { __vitest_browser__?: boolean }).__vitest_browser__ ===
      true ||
    Boolean((import.meta as { env?: Record<string, unknown> }).env?.VITEST);
  if (underVitest) {
    throw new Error("Real input (vitest/browser userEvent) is missing.");
  }
  // Storybook's own runner has no real input; Vitest always provides it.
  return false;
};

/** A fixture story whose play needs real keys and pointer. */
const fixture = (run: (t: Tools) => Promise<void>): Story => ({
  render: () => <Harness />,
  play: async ({ canvasElement }) => {
    if (!needsRealInput()) {
      return;
    }
    await run(tools(canvasElement));
  },
});

const allZeroBut = (keep: string) =>
  FOUR.map((c) => ({ ...c, count: c.value === keep ? 3 : 0 }));

/** Tab and Shift+Tab land on the selected chip, else the first available one, and never select. */
export const TabStop: Story = {
  tags: TEST_ONLY,
  name: "Tab Stop",
  ...fixture(async (t) => {
    for (const controlled of [true, false]) {
      // biome-ignore lint/performance/noAwaitInLoops: one case at a time, in order
      await t.reset({ controlled, value: "c" });
      await eventually(() => expect(t.tabStops()).toBe("c"));
      await t.tabIn();
      await eventually(() => expect(t.focused()).toBe("c"));
      t.after.focus();
      await t.user.keyboard("{Shift>}{Tab}{/Shift}");
      await eventually(() => expect(t.focused()).toBe("c"));
      await expect(harness.changes).toEqual([]);

      await t.reset({ controlled, value: null });
      await eventually(() => expect(t.tabStops()).toBe("a"));
      await t.tabIn();
      await eventually(() => expect(t.focused()).toBe("a"));
      await expect(t.checked()).toBe("");
      await expect(harness.changes).toEqual([]);

      await t.reset({
        controlled,
        value: null,
        chips: [{ value: "a", count: 0 }, ...FOUR.slice(1)],
      });
      await eventually(() => expect(t.tabStops()).toBe("b"));

      await t.reset({ controlled, value: "zzz" });
      await eventually(() => expect(t.tabStops()).toBe("a"));
      await expect(t.checked()).toBe("");

      await t.reset({
        controlled,
        value: "a",
        chips: [{ value: "a", count: 3, disabled: true }, ...FOUR.slice(1)],
      });
      await eventually(() => expect(t.tabStops()).toBe("b"));
      await expect(t.checked()).toBe("a");

      await t.reset({
        controlled,
        value: "b",
        chips: FOUR.map((c) => (c.value === "b" ? { ...c, count: 0 } : c)),
      });
      await eventually(() => expect(t.tabStops()).toBe("b"));
      await expect(t.chip("b")).not.toHaveAttribute("data-disabled");

      for (const patch of [
        { rootDisabled: true, value: "a" },
        { chips: FOUR.map((c) => ({ ...c, count: 0 })) },
      ]) {
        // biome-ignore lint/performance/noAwaitInLoops: one case at a time, in order
        await t.reset({ controlled, ...patch });
        await eventually(() => expect(t.tabStops()).toBe(""));
        await t.tabIn();
        await eventually(() => expect(t.focused()).toBe("after"));
      }
    }
  }),
};

/** Arrows move focus and the choice, skip unavailable chips and wrap; Enter, Home and End do nothing. */
export const ArrowKeys: Story = {
  tags: TEST_ONLY,
  name: "Arrow Keys",
  ...fixture(async (t) => {
    for (const controlled of [true, false]) {
      // biome-ignore lint/performance/noAwaitInLoops: one case at a time, in order
      await t.reset({
        controlled,
        value: "a",
        chips: FOUR.map((c) => (c.value === "b" ? { ...c, count: 0 } : c)),
      });
      await t.tabIn();
      await eventually(() => expect(t.focused()).toBe("a"));
      for (const [key, want] of [
        ["{ArrowRight}", "c"],
        ["{ArrowRight}", "d"],
        ["{ArrowRight}", "a"],
        ["{ArrowLeft}", "d"],
        ["{ArrowUp}", "c"],
        ["{ArrowDown}", "d"],
        ["{Shift>}{ArrowLeft}{/Shift}", "c"],
      ] as const) {
        // biome-ignore lint/performance/noAwaitInLoops: one key at a time
        await t.user.keyboard(key);
        await eventually(() => expect(t.focused()).toBe(want));
        await eventually(() => expect(t.checked()).toBe(want));
      }
      await expect(harness.changes).toEqual([
        "c",
        "d",
        "a",
        "d",
        "c",
        "d",
        "c",
      ]);
      harness.changes.length = 0;
      await t.user.keyboard("{Enter}{Home}{End}");
      await settle();
      await expect(t.focused()).toBe("c");
      await t.user.keyboard(" ");
      await t.user.click(t.chip("c"));
      await settle();
      await expect(harness.changes).toEqual([]);
      await t.user.click(t.chip("a"));
      await eventually(() => expect(t.checked()).toBe("a"));
      await expect(harness.changes).toEqual(["a"]);
    }
  }),
};

/** A cancelled change keeps the old choice; the focused chip keeps the stop until focus leaves. */
export const CancelledChange: Story = {
  tags: TEST_ONLY,
  name: "Cancelled Change",
  ...fixture(async (t) => {
    for (const controlled of [true, false]) {
      // biome-ignore lint/performance/noAwaitInLoops: one case at a time, in order
      await t.reset({ controlled, value: "a", cancel: true });
      await t.tabIn();
      await t.user.keyboard("{ArrowRight}");
      await eventually(() => expect(t.focused()).toBe("b"));
      await settle();
      await expect(t.checked()).toBe("a");
      await expect(harness.changes).toEqual(["b"]);
      await expect(t.chip("b").tabIndex).toBe(0);
      await t.user.keyboard("{Tab}");
      await eventually(() => expect(t.focused()).toBe("after"));
      await eventually(() => expect(t.tabStops()).toBe("a"));
      await t.user.keyboard("{Shift>}{Tab}{/Shift}");
      await eventually(() => expect(t.focused()).toBe("a"));
      await t.user.click(t.chip("c"));
      await settle();
      await expect(t.checked()).toBe("a");
    }
    // A controlled parent that ignores an uncancelled change keeps its value.
    await t.reset({ controlled: true, value: "a", ignore: true });
    await t.tabIn();
    await t.user.keyboard("{ArrowRight}");
    await eventually(() => expect(harness.changes).toEqual(["b"]));
    await settle();
    await expect(t.checked()).toBe("a");
    await expect(t.chip("a")).toHaveAttribute("data-selected");
    await expect(t.chip("b")).not.toHaveAttribute("data-selected");
    // Focus stayed on b, the only roving stop; Tab leaves and Shift+Tab
    // comes back to the selected a, with no further change.
    await expect(t.focused()).toBe("b");
    await expect(t.tabStops()).toBe("b");
    await t.user.keyboard("{Tab}");
    await eventually(() => expect(t.focused()).toBe("after"));
    await t.user.keyboard("{Shift>}{Tab}{/Shift}");
    await eventually(() => expect(t.focused()).toBe("a"));
    await expect(harness.changes).toEqual(["b"]);
    // A parent that cancels and then sets the value itself owns it.
    await t.reset({ controlled: true, value: "a", cancel: true });
    await t.tabIn();
    await t.user.keyboard("{ArrowRight}");
    await settle();
    harness.set?.({ value: "c" });
    await eventually(() => expect(t.checked()).toBe("c"));
  }),
};

/** An outside value change leaves focus where it is; the stop is recomputed when focus leaves. */
export const OutsideChange: Story = {
  tags: TEST_ONLY,
  name: "Outside Change",
  ...fixture(async (t) => {
    await t.reset({ controlled: true, value: "a" });
    await t.tabIn();
    await eventually(() => expect(t.focused()).toBe("a"));
    harness.set?.({ value: "c" });
    await eventually(() => expect(t.checked()).toBe("c"));
    await expect(t.focused()).toBe("a");
    await t.user.keyboard("{Tab}");
    await eventually(() => expect(t.tabStops()).toBe("c"));
    await t.user.keyboard("{Shift>}{Tab}{/Shift}");
    await eventually(() => expect(t.focused()).toBe("c"));
    harness.set?.({ value: null });
    await eventually(() => expect(t.checked()).toBe(""));
    await expect(t.focused()).toBe("c");
    await t.user.keyboard("{Tab}");
    await eventually(() => expect(t.tabStops()).toBe("a"));
    await expect(harness.changes).toEqual([]);
  }),
};

/**
 * Removing the focused chip moves focus to the first available chip and
 * selects nothing, even after an arrow key that moved nothing.
 */
export const FocusedChipRemoved: Story = {
  tags: TEST_ONLY,
  name: "Focused Chip Removed",
  ...fixture(async (t) => {
    for (const controlled of [true, false]) {
      for (const modifier of ["Control", "Alt", "Meta"]) {
        // biome-ignore lint/performance/noAwaitInLoops: one case at a time, in order
        await t.reset({ controlled, value: "b" });
        await t.tabIn();
        await eventually(() => expect(t.focused()).toBe("b"));
        await t.user.keyboard(`{${modifier}>}{ArrowRight}{/${modifier}}`);
        await settle();
        await expect(t.focused()).toBe("b");
        harness.set?.({ chips: FOUR.filter((c) => c.value !== "b") });
        await eventually(() => expect(t.focused()).toBe("a"));
        await settle();
        await expect(t.checked()).toBe("");
        await expect(harness.changes).toEqual([]);
      }
      // No value, an arrow with nowhere to go, then another chip becomes
      // available and the focused one is removed.
      await t.reset({ controlled, value: null, chips: allZeroBut("a") });
      await t.tabIn();
      await eventually(() => expect(t.focused()).toBe("a"));
      await t.user.keyboard("{ArrowRight}");
      await settle();
      await expect(t.focused()).toBe("a");
      harness.set?.({
        chips: FOUR.map((c) => ({ ...c, count: c.value === "c" ? 5 : 0 })),
      });
      await settle();
      harness.set?.({
        chips: FOUR.filter((c) => c.value !== "a").map((c) => ({
          ...c,
          count: c.value === "c" ? 5 : 0,
        })),
      });
      await eventually(() => expect(t.focused()).toBe("c"));
      await settle();
      await expect(t.checked()).toBe("");
      await expect(harness.changes).toEqual([]);
      // With nothing left to take it, focus goes to the document.
      await t.reset({
        controlled,
        value: null,
        chips: [
          { value: "a", count: 3 },
          { value: "b", count: 0 },
        ],
      });
      await t.tabIn();
      await eventually(() => expect(t.focused()).toBe("a"));
      harness.set?.({ chips: [{ value: "b", count: 0 }] });
      await eventually(() => expect(t.focused()).toBe("body"));
      await settle();
      await expect(harness.changes).toEqual([]);
    }
  }),
};

/**
 * A focused chip that becomes unavailable keeps focus; the next arrow moves
 * to the nearest available chip, and there is no wrap from it at the ends.
 */
export const FocusedChipDisabled: Story = {
  tags: TEST_ONLY,
  name: "Focused Chip Disabled",
  ...fixture(async (t) => {
    const order = ["a", "b", "c", "d"];
    for (const controlled of [true, false]) {
      for (const value of ["a", "b", "d"]) {
        for (const key of ["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp"]) {
          // biome-ignore lint/performance/noAwaitInLoops: one case at a time, in order
          await t.reset({ controlled, value: null });
          t.chip(value).focus();
          await eventually(() => expect(t.focused()).toBe(value));
          harness.set?.({
            chips: FOUR.map((c) =>
              c.value === value ? { ...c, count: 0 } : c
            ),
          });
          await eventually(() =>
            expect(t.chip(value)).toHaveAttribute("data-disabled")
          );
          await expect(t.focused()).toBe(value);
          await t.user.keyboard(`{${key}}`);
          const forward = key === "ArrowRight" || key === "ArrowDown";
          const i = order.indexOf(value);
          const want = (forward ? order[i + 1] : order[i - 1]) ?? value;
          await eventually(() =>
            expect(`${value} ${key} → ${t.focused()}`).toBe(
              `${value} ${key} → ${want}`
            )
          );
          await settle();
          await expect(harness.changes).toEqual(want === value ? [] : [want]);
        }
      }
      for (const patch of [
        {
          chips: FOUR.map((c) =>
            c.value === "b" ? { ...c, disabled: true } : c
          ),
        },
        { rootDisabled: true },
        { chips: FOUR.map((c) => ({ ...c, count: 0 })) },
      ]) {
        // No value, so the zero rule has no selected chip to exempt.
        // biome-ignore lint/performance/noAwaitInLoops: one case at a time, in order
        await t.reset({ controlled, value: null });
        t.chip("b").focus();
        await eventually(() => expect(t.focused()).toBe("b"));
        harness.set?.(patch);
        await eventually(() =>
          expect(t.chip("b")).toHaveAttribute("data-disabled")
        );
        await expect(t.focused()).toBe("b");
        await t.user.keyboard("{Tab}");
        await eventually(() => expect(t.focused()).toBe("after"));
        await expect(harness.changes).toEqual([]);
      }
      // Root disabled while focused: arrows go nowhere, nothing is reported.
      await t.reset({ controlled, value: "b" });
      await t.tabIn();
      harness.set?.({ rootDisabled: true });
      await eventually(() =>
        expect(t.chip("b")).toHaveAttribute("data-disabled")
      );
      await t.user.keyboard("{ArrowRight}{ArrowLeft}");
      await settle();
      await expect(t.focused()).toBe("b");
      await expect(harness.changes).toEqual([]);
      await t.user.keyboard("{Shift>}{Tab}{/Shift}");
      await eventually(() => expect(t.focused()).toBe("before"));
      await eventually(() => expect(t.tabStops()).toBe(""));
    }
  }),
};

/** An arrow that moved nothing does not select the chip that code focuses later. */
export const IgnoredArrow: Story = {
  tags: TEST_ONLY,
  name: "Ignored Arrow",
  ...fixture(async (t) => {
    for (const controlled of [true, false]) {
      for (const modifier of ["Control", "Alt", "Meta"]) {
        // biome-ignore lint/performance/noAwaitInLoops: one case at a time, in order
        await t.reset({ controlled, value: "a" });
        await t.tabIn();
        await eventually(() => expect(t.focused()).toBe("a"));
        await t.user.keyboard(`{${modifier}>}{ArrowRight}{/${modifier}}`);
        t.chip("c").focus();
        await settle();
        await expect(harness.changes).toEqual([]);
        await expect(t.checked()).toBe("a");
        await t.user.click(t.chip("d"));
        await eventually(() => expect(t.checked()).toBe("d"));
        await expect(harness.changes).toEqual(["d"]);
      }
      await t.reset({ controlled, value: null, chips: allZeroBut("a") });
      await t.tabIn();
      await t.user.keyboard("{ArrowRight}");
      harness.set?.({ chips: FOUR });
      await settle();
      t.chip("c").focus();
      await settle();
      await expect(harness.changes).toEqual([]);
      await expect(t.checked()).toBe("");
    }
  }),
};

const chipsIn = (order: string) =>
  [...order].map((v) => FOUR.find((c) => c.value === v) as ChipSpec);

/**
 * The Tab stop follows the row as it changes while focus is outside it:
 * reordered, inserted, removed and re-rendered chips, availability flips and
 * an outside value change.
 */
export const RowChanges: Story = {
  tags: TEST_ONLY,
  name: "Row Changes",
  ...fixture(async (t) => {
    /** An arrow after the change still moves focus and the choice together. */
    const arrow = async (key: string, want: string) => {
      await t.user.keyboard(`{${key}}`);
      await eventually(() =>
        expect(`${key} → ${t.focused()} ${t.checked()}`).toBe(
          `${key} → ${want} ${want}`
        )
      );
      await expect(harness.changes.at(-1)).toBe(want);
    };
    for (const controlled of [true, false]) {
      // A keyed reorder, with no value, an unmatched value and a disabled
      // selected chip.
      // biome-ignore lint/performance/noAwaitInLoops: one case at a time, in order
      await t.reset({ controlled, value: null });
      await eventually(() => expect(t.tabStops()).toBe("a"));
      harness.set?.({ chips: chipsIn("cabd") });
      await eventually(() => expect(t.tabStops()).toBe("c"));
      await t.tabIn();
      await eventually(() => expect(t.focused()).toBe("c"));
      t.after.focus();
      await t.user.keyboard("{Shift>}{Tab}{/Shift}");
      await eventually(() => expect(t.focused()).toBe("c"));
      await expect(harness.changes).toEqual([]);
      await arrow("ArrowRight", "a");
      await arrow("ArrowLeft", "c");
      await arrow("ArrowLeft", "d");

      await t.reset({ controlled, value: "zzz" });
      harness.set?.({ chips: chipsIn("dcba") });
      await eventually(() => expect(t.tabStops()).toBe("d"));
      t.after.focus();
      await t.user.keyboard("{Shift>}{Tab}{/Shift}");
      await eventually(() => expect(t.focused()).toBe("d"));
      await expect(harness.changes).toEqual([]);
      await arrow("ArrowRight", "c");

      const aOff = { value: "a", count: 3, disabled: true };
      await t.reset({
        controlled,
        value: "a",
        chips: [aOff, ...chipsIn("bcd")],
      });
      await eventually(() => expect(t.tabStops()).toBe("b"));
      harness.set?.({ chips: [aOff, ...chipsIn("cbd")] });
      await eventually(() => expect(t.tabStops()).toBe("c"));
      await expect(t.checked()).toBe("a");
      await t.tabIn();
      await eventually(() => expect(t.focused()).toBe("c"));
      await expect(harness.changes).toEqual([]);
      await arrow("ArrowLeft", "d");

      // Insertion in the middle, before the old target.
      const aZero = { value: "a", count: 0 };
      await t.reset({
        controlled,
        value: null,
        chips: [aZero, ...chipsIn("cd")],
      });
      await eventually(() => expect(t.tabStops()).toBe("c"));
      harness.set?.({ chips: [aZero, ...chipsIn("bcd")] });
      await eventually(() => expect(t.tabStops()).toBe("b"));
      await t.tabIn();
      await eventually(() => expect(t.focused()).toBe("b"));
      await arrow("ArrowRight", "c");
      await arrow("ArrowLeft", "b");
      await arrow("ArrowLeft", "d");

      // Removal of the target while focus is outside.
      await t.reset({ controlled, value: null });
      harness.set?.({ chips: chipsIn("bcd") });
      await eventually(() => expect(t.tabStops()).toBe("b"));
      await t.tabIn();
      await eventually(() => expect(t.focused()).toBe("b"));
      await arrow("ArrowLeft", "d");

      // Availability flips.
      await t.reset({ controlled, value: null });
      for (const [patch, want] of [
        [{ chips: [aZero, ...chipsIn("bcd")] }, "b"],
        [{ chips: FOUR }, "a"],
        [{ chips: [aOff, ...chipsIn("bcd")] }, "b"],
        [{ rootDisabled: true }, ""],
        [{ rootDisabled: false, chips: FOUR }, "a"],
      ] as const) {
        harness.set?.(patch as Partial<HarnessState>);
        // biome-ignore lint/performance/noAwaitInLoops: one change at a time
        await eventually(() => expect(t.tabStops()).toBe(want));
      }

      // A chip whose rendered element is replaced, then an unrelated update.
      for (const value of [null, "a"]) {
        // biome-ignore lint/performance/noAwaitInLoops: one case at a time, in order
        await t.reset({ controlled, value });
        harness.set?.({
          chips: [{ ...FOUR[0], tag: "div" }, ...chipsIn("bcd")],
        });
        await settle();
        harness.set?.({ label: "New topic" });
        await settle();
        await expect(t.chip("a").tagName).toBe("DIV");
        await eventually(() => expect(t.tabStops()).toBe("a"));
        await t.tabIn();
        await eventually(() => expect(t.focused()).toBe("a"));
        await expect(harness.changes).toEqual([]);
        await arrow("ArrowRight", "b");
        await arrow("ArrowLeft", "a");
        // Removing the focused replacement still recovers focus, and the
        // recovery selects nothing.
        harness.set?.({ chips: chipsIn("bcd") });
        await eventually(() => expect(t.focused()).toBe("b"));
        await settle();
        await expect(t.checked()).toBe("");
        await expect(harness.changes).toEqual(["b", "a"]);
        await arrow("ArrowLeft", "d");
      }

      // The page takes focus in the same task that removes the focused chip.
      await t.reset({ controlled, value: null });
      t.chip("c").focus();
      await eventually(() => expect(t.focused()).toBe("c"));
      flushSync(() => harness.set?.({ chips: chipsIn("abd") }));
      t.after.focus();
      await settle();
      await expect(t.focused()).toBe("after");
      await eventually(() => expect(t.tabStops()).toBe("a"));
      await expect(harness.changes).toEqual([]);
    }
    // An outside value change while focus is outside.
    await t.reset({ controlled: true, value: null });
    harness.set?.({ value: "c" });
    await eventually(() => expect(t.tabStops()).toBe("c"));
    harness.set?.({ value: null });
    await eventually(() => expect(t.tabStops()).toBe("a"));
  }),
};

/**
 * Only the focus move an arrow key itself makes can select: not a focus the
 * app makes in the same task, before or after it, and not the row's own
 * recovery after a removal.
 */
export const ArrowRace: Story = {
  tags: TEST_ONLY,
  name: "Arrow Race",
  ...fixture(async (t) => {
    for (const controlled of [true, false]) {
      // The arrow has nowhere to go; the app then makes b available and
      // focuses it before the task ends.
      // biome-ignore lint/performance/noAwaitInLoops: one case at a time, in order
      await t.reset({ controlled, value: null, chips: allZeroBut("a") });
      t.chip("a").focus();
      await eventually(() => expect(t.focused()).toBe("a"));
      harness.keyDown = (event) => {
        if (event.key === "ArrowRight") {
          queueMicrotask(() => {
            flushSync(() => harness.set?.({ chips: FOUR }));
            t.chip("b").focus();
          });
        }
      };
      await t.user.keyboard("{ArrowRight}");
      await eventually(() => expect(t.focused()).toBe("b"));
      await settle();
      await expect(harness.changes).toEqual([]);
      await expect(t.checked()).toBe("");

      // The arrow moves to b within the key event; the app's focus of d in
      // the next microtask wins, without another selection.
      await t.reset({ controlled, value: "a" });
      await t.tabIn();
      await eventually(() => expect(t.focused()).toBe("a"));
      harness.keyDown = (event) => {
        if (event.key === "ArrowRight") {
          queueMicrotask(() => t.chip("d").focus());
        }
      };
      await t.user.keyboard("{ArrowRight}");
      await eventually(() => expect(t.focused()).toBe("d"));
      await settle();
      await expect(harness.changes).toEqual(["b"]);
      await expect(t.checked()).toBe("b");

      // The arrow moves to b; the app focuses d just after that move.
      await t.reset({ controlled, value: "a" });
      await t.tabIn();
      await eventually(() => expect(t.focused()).toBe("a"));
      harness.keyDown = (event) => {
        if (event.key === "ArrowRight") {
          queueMicrotask(() => queueMicrotask(() => t.chip("d").focus()));
        }
      };
      await t.user.keyboard("{ArrowRight}");
      await eventually(() => expect(t.focused()).toBe("d"));
      await settle();
      await expect(harness.changes).toEqual(["b"]);
      await expect(t.checked()).toBe("b");

      // A modified arrow moves nothing; the app focuses c in the same task.
      await t.reset({ controlled, value: "a" });
      await t.tabIn();
      await eventually(() => expect(t.focused()).toBe("a"));
      harness.keyDown = (event) => {
        if (event.key === "ArrowRight") {
          queueMicrotask(() => t.chip("c").focus());
        }
      };
      await t.user.keyboard("{Control>}{ArrowRight}{/Control}");
      await eventually(() => expect(t.focused()).toBe("c"));
      await settle();
      await expect(harness.changes).toEqual([]);
      await expect(t.checked()).toBe("a");

      // The arrow has nowhere to go and the app removes the focused chip in
      // the same task: the row's recovery focus selects nothing.
      await t.reset({ controlled, value: null, chips: allZeroBut("a") });
      t.chip("a").focus();
      await eventually(() => expect(t.focused()).toBe("a"));
      harness.keyDown = (event) => {
        if (event.key === "ArrowRight") {
          queueMicrotask(() =>
            flushSync(() =>
              harness.set?.({ chips: FOUR.filter((c) => c.value !== "a") })
            )
          );
        }
      };
      await t.user.keyboard("{ArrowRight}");
      await eventually(() => expect(t.focused()).toBe("b"));
      await settle();
      await expect(harness.changes).toEqual([]);
      await expect(t.checked()).toBe("");
    }
  }),
};

/**
 * With `dir="rtl"` alone, arrows keep DOM order; inside a DirectionProvider
 * they follow the reading direction. The pill sits at the end, which is the
 * left.
 */
export const RightToLeft: Story = {
  tags: TEST_ONLY,
  name: "Right To Left",
  ...fixture(async (t) => {
    await t.reset({ value: "b", rtl: true });
    await t.tabIn();
    await t.user.keyboard("{ArrowRight}");
    await eventually(() => expect(t.focused()).toBe("c"));
    // The pill sits at the end: on the left in right-to-left.
    const chip = t.chip("a").getBoundingClientRect();
    const pill = (
      t
        .chip("a")
        .querySelector('[data-slot="filter-chip-count"]') as HTMLElement
    ).getBoundingClientRect();
    await expect(pill.left - chip.left).toBeLessThan(chip.right - pill.right);
    // Inside a DirectionProvider the arrows follow the reading direction.
    await t.reset({ value: "b", rtl: true, provider: true });
    await t.tabIn();
    await eventually(() => expect(t.focused()).toBe("b"));
    await t.user.keyboard("{ArrowRight}");
    await eventually(() => expect(t.focused()).toBe("a"));
    await eventually(() => expect(t.checked()).toBe("a"));
    await t.user.keyboard("{ArrowLeft}");
    await eventually(() => expect(t.focused()).toBe("b"));
    await eventually(() => expect(t.checked()).toBe("b"));
    await expect(harness.changes).toEqual(["a", "b"]);
    // It wraps from the first chip in reading order to the last.
    await t.user.keyboard("{ArrowRight}{ArrowRight}");
    await eventually(() => expect(t.focused()).toBe("d"));
    await expect(harness.changes).toEqual(["a", "b", "a", "d"]);
  }),
};

/**
 * What a chip shows while a real pointer press is held down on it: every
 * computed `scale`, whether its box moved, and whether `:active` ever
 * matched (so a press that never held cannot pass). Reads only; the press
 * is released when the click resolves.
 */
async function whileHeld(
  user: RealUser,
  el: HTMLElement,
  options: { force?: boolean } = {}
) {
  const scales = new Set<string>();
  const start = el.getBoundingClientRect();
  let moved = false;
  let active = false;
  let held = true;
  const press = user.click(el, { delay: 600, ...options }).finally(() => {
    held = false;
  });
  while (held) {
    scales.add(getComputedStyle(el).scale);
    const box = el.getBoundingClientRect();
    moved ||=
      box.left !== start.left ||
      box.top !== start.top ||
      box.width !== start.width ||
      box.height !== start.height;
    active ||= el.matches(":active");
    // biome-ignore lint/performance/noAwaitInLoops: sampling over time
    await new Promise((resolve) => setTimeout(resolve, 16));
  }
  await press;
  return { scales: [...scales], moved, active };
}

/**
 * A held press changes only colour: no chip, idle, selected or disabled,
 * scales or moves. A press on a disabled chip does not focus it either.
 */
export const DisabledPress: Story = {
  tags: TEST_ONLY,
  name: "Disabled Press",
  ...fixture(async (t) => {
    await t.reset({
      value: "a",
      chips: [
        { value: "a", count: 3 },
        { value: "b", count: 0 },
        { value: "c", count: 1 },
      ],
    });
    t.after.focus();
    const b = t.chip("b");
    const disabledPress = await whileHeld(t.user, b, { force: true });
    await settle();
    await expect(t.focused()).toBe("after");
    await expect(t.tabStops()).toBe("a");
    await expect(harness.changes).toEqual([]);
    const style = getComputedStyle(b);
    await expect(style.cursor).toBe("not-allowed");
    await expect(Number(style.opacity)).toBeCloseTo(0.5, 2);
    await expect(disabledPress).toMatchObject({
      scales: ["none"],
      moved: false,
    });
    // The selected chip, then an idle one: the press really held (`:active`
    // matched) and nothing scaled or moved.
    for (const value of ["a", "c"]) {
      // biome-ignore lint/performance/noAwaitInLoops: one press at a time
      await expect(await whileHeld(t.user, t.chip(value))).toEqual({
        scales: ["none"],
        moved: false,
        active: true,
      });
    }
    await t.user.hover(t.after);
  }),
};

// ---------------------------------------------------------------------------
// Looks, measured
// ---------------------------------------------------------------------------

/**
 * The colour an element's background paints, composited over every
 * ancestor's fill on a 1px canvas, as "r,g,b". Translucent fills compare by
 * what they show, not by their declared value.
 */
function painted(el: HTMLElement): string {
  const layers: string[] = [];
  for (let n: HTMLElement | null = el; n; n = n.parentElement) {
    layers.unshift(getComputedStyle(n).backgroundColor);
  }
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, 1, 1);
  for (const layer of layers) {
    ctx.fillStyle = layer;
    ctx.fillRect(0, 0, 1, 1);
  }
  return [...ctx.getImageData(0, 0, 1, 1).data.slice(0, 3)].join(",");
}

/** `color` composited over the opaque "r,g,b" `under`, as "r,g,b". */
function over(color: string, under: string, alpha = 1): string {
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  ctx.fillStyle = `rgb(${under})`;
  ctx.fillRect(0, 0, 1, 1);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 1, 1);
  return [...ctx.getImageData(0, 0, 1, 1).data.slice(0, 3)].join(",");
}

/** WCAG contrast ratio between two "r,g,b" colours. */
function contrast(a: string, b: string): number {
  const luminance = (rgb: string) => {
    const [r, g, b2] = rgb.split(",").map((v) => {
      const c = Number(v) / 255;
      return c <= 0.040_45 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b2;
  };
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * How an unselected chip's count pill reads against its chip: the pill's
 * fill composited over the chip's (`boundary`, a contrast ratio) and its
 * digits against that fill (`digits`). A disabled chip is drawn at half
 * opacity; `shown` is the digits' contrast after that fade.
 */
function pillReading(chipEl: HTMLElement) {
  const pillEl = chipEl.querySelector(
    '[data-slot="filter-chip-count"]'
  ) as HTMLElement;
  const fill = painted(pillEl);
  const chipFill = painted(chipEl);
  const text = over(getComputedStyle(pillEl).color, fill);
  const fade = Number(getComputedStyle(chipEl).opacity);
  const behind = painted(chipEl.parentElement as HTMLElement);
  return {
    fill,
    chipFill,
    boundary: contrast(fill, chipFill),
    digits: contrast(text, fill),
    shown: contrast(
      over(`rgb(${text})`, behind, fade),
      over(`rgb(${fill})`, behind, fade)
    ),
  };
}

/**
 * The faintest pill boundary allowed on an unselected chip, in any state,
 * theme or surface: the contrast the faint strength gives on a hovered light
 * chip (1.12 measured at 5%), rounded down.
 */
const PILL_BOUNDARY_FLOOR = 1.1;

/** Paints a token so a play can read its resolved colour. */
function Swatches() {
  return (
    <div aria-hidden className="hidden" data-testid="swatches">
      {[
        "bg-background",
        "bg-input-bg",
        "bg-accent",
        "bg-input/50",
        "bg-primary",
        "bg-muted",
        "border-input",
        "border-primary",
        "text-foreground",
        "text-accent-foreground",
        "text-primary-foreground",
        "font-mono",
      ].map((token) => (
        <span className={`border ${token}`} data-token={token} key={token} />
      ))}
      <span className="bg-primary">
        <span className="bg-primary-foreground/10" data-token="pill-selected" />
      </span>
      <span className="bg-foreground/8" data-token="pill-idle" />
      <Button
        data-token="outline-disabled"
        disabled
        size="sm"
        variant="outline"
      >
        Disabled
      </Button>
    </div>
  );
}

/**
 * A light and a dark panel drawn side by side must each paint their own
 * theme. The panel's `light` class resets nothing, so with the toolbar's dark
 * theme both panels render dark unless the story pins the light theme.
 */
async function expectBothThemes(
  canvasElement: HTMLElement,
  lightId: string,
  darkId: string
) {
  const background = (id: string) =>
    getComputedStyle(within(canvasElement).getByTestId(id)).backgroundColor;
  console.log(
    `panels: ${lightId} ${background(lightId)}, ${darkId} ${background(darkId)}`
  );
  await expect(background(lightId)).not.toBe(background(darkId));
}

function ThemedRow({ theme }: { theme: "light" | "dark" }) {
  return (
    <div
      className={`${theme} flex flex-col gap-3 bg-background p-4 text-foreground`}
      data-testid={theme}
    >
      <Swatches />
      {/* The outline button beside each row is the idle chip's reference. */}
      <div className="flex items-center gap-2">
        <FilterChips aria-label={`Topic, ${theme}`} defaultValue="all">
          {TOPICS.map((t) => (
            <FilterChip
              count={t.count}
              data-chip={t.value}
              key={t.value}
              value={t.value}
            >
              {t.label}
            </FilterChip>
          ))}
        </FilterChips>
        <Button data-outline="page" size="sm" variant="outline">
          Export
        </Button>
      </div>
      {/* On a tinted surface the idle chip keeps the page fill. */}
      <div
        className="flex w-fit items-center gap-2 rounded-lg bg-muted p-4"
        data-testid={`${theme}-tinted`}
      >
        <FilterChips
          aria-label={`Topic on a tinted surface, ${theme}`}
          defaultValue="all"
        >
          {TOPICS.map((t) => (
            <FilterChip
              count={t.count}
              data-tinted-chip={t.value}
              key={t.value}
              value={t.value}
            >
              {t.label}
            </FilterChip>
          ))}
        </FilterChips>
        <Button data-outline="tinted" size="sm" variant="outline">
          Export
        </Button>
      </div>
      <Card className="w-fit">
        <CardContent className="flex items-center gap-2">
          <FilterChips
            aria-label={`Topic in a card, ${theme}`}
            defaultValue="all"
          >
            {TOPICS.map((t) => (
              <FilterChip
                count={t.count}
                data-card-chip={t.value}
                key={t.value}
                value={t.value}
              >
                {t.label}
              </FilterChip>
            ))}
          </FilterChips>
          <Button data-outline="card" size="sm" variant="outline">
            Export
          </Button>
        </CardContent>
      </Card>
      {/* No selection, so a real Tab lands on an idle chip. */}
      <FilterChips aria-label={`Topic, nothing chosen, ${theme}`}>
        {TOPICS.slice(1, 3).map((t) => (
          <FilterChip
            count={t.count}
            data-focus-chip={t.value}
            key={t.value}
            value={t.value}
          >
            {t.label}
          </FilterChip>
        ))}
      </FilterChips>
    </div>
  );
}

/** Idle, selected and hovered colours resolve to their tokens in both themes. */
export const Looks: Story = {
  // The light panel's class resets nothing: pin the light theme so the
  // toolbar's dark theme cannot paint both panels dark. The Documentation
  // page shares one <html> between its stories, so there the story gets a
  // frame of its own for the pin to hold.
  // The suite has no toolbar: start from the dark theme so that the pin, not
  // the default, is what keeps the light panel light.
  globals: { theme: "dark" },
  parameters: {
    themes: { themeOverride: "light" },
    docs: { story: { inline: false, height: "640px" } },
  },
  render: () => (
    <div className="flex flex-col gap-4">
      <ThemedRow theme="light" />
      <ThemedRow theme="dark" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expectBothThemes(canvasElement, "light", "dark");
    if (!needsRealInput()) {
      return;
    }
    const user = realUser() as RealUser;
    // Start with the pointer off every chip: an earlier story may leave it
    // parked over this canvas.
    await user.hover(within(canvasElement).getByTestId("light"), {
      position: { x: 1, y: 1 },
    });
    for (const theme of ["light", "dark"] as const) {
      const scope = within(canvasElement).getByTestId(theme);
      const token = (name: string, prop: keyof CSSStyleDeclaration) =>
        getComputedStyle(
          scope.querySelector(`[data-token="${name}"]`) as HTMLElement
        )[prop];
      const chip = (value: string) =>
        scope.querySelector(`[data-chip="${value}"]`) as HTMLElement;
      const pill = (value: string) =>
        chip(value).querySelector(
          '[data-slot="filter-chip-count"]'
        ) as HTMLElement;
      const idle = chip("typography");
      const selected = chip("all");
      // The outline button's hairline shadow, read before anything is
      // focused or hovered: the idle chip must carry exactly this one.
      const outline = (where: string) =>
        getComputedStyle(
          scope.querySelector(`[data-outline="${where}"]`) as HTMLElement
        ).boxShadow;
      const hairline = outline("page");
      // biome-ignore lint/performance/noAwaitInLoops: one case at a time, in order
      await expect(hairline).not.toBe("none");
      await expect(outline("tinted")).toBe(hairline);
      await expect(outline("card")).toBe(hairline);
      await expect(token("outline-disabled", "boxShadow")).toBe(hairline);

      // Idle: border-input, page fill (input-bg in dark), foreground text.
      await expect(getComputedStyle(idle).borderTopColor).toBe(
        token("border-input", "borderTopColor")
      );
      await expect(getComputedStyle(idle).backgroundColor).toBe(
        token(
          theme === "light" ? "bg-background" : "bg-input-bg",
          "backgroundColor"
        )
      );
      await expect(getComputedStyle(idle).color).toBe(
        token("text-foreground", "color")
      );
      // Idle: the outline button's shadow, on the page, tinted and in a card.
      await expect(`${theme} idle ${getComputedStyle(idle).boxShadow}`).toBe(
        `${theme} idle ${hairline}`
      );
      const pillBefore = {
        background: getComputedStyle(pill("typography")).backgroundColor,
        color: getComputedStyle(pill("typography")).color,
      };
      await expect(getComputedStyle(pill("typography")).color).toBe(
        token("text-foreground", "color")
      );
      // The unselected pill's tint: the foreground at 8%.
      await expect(pillBefore.background).toBe(
        token("pill-idle", "backgroundColor")
      );
      // The label is medium weight; the digits are tabular and monospaced.
      await expect(getComputedStyle(idle).fontWeight).toBe("500");
      await expect(getComputedStyle(pill("typography")).fontFamily).toBe(
        token("font-mono", "fontFamily")
      );
      await expect(
        getComputedStyle(pill("typography")).fontVariantNumeric
      ).toContain("tabular-nums");

      // Selected: primary fill and border, primary-foreground text, and a
      // pill of primary-foreground at 10%.
      await expect(getComputedStyle(selected).backgroundColor).toBe(
        token("bg-primary", "backgroundColor")
      );
      await expect(getComputedStyle(selected).borderTopColor).toBe(
        token("border-primary", "borderTopColor")
      );
      await expect(getComputedStyle(selected).color).toBe(
        token("text-primary-foreground", "color")
      );
      await expect(getComputedStyle(pill("all")).backgroundColor).toBe(
        token("pill-selected", "backgroundColor")
      );
      await expect(getComputedStyle(pill("all")).color).toBe(
        token("text-primary-foreground", "color")
      );
      // Selected: no shadow, as the solid button has none.
      await expect(getComputedStyle(selected).boxShadow).toBe("none");

      // On a tinted (muted) surface the idle chip keeps the page fill.
      const tinted = scope.querySelector(
        '[data-tinted-chip="typography"]'
      ) as HTMLElement;
      await expect(getComputedStyle(tinted).backgroundColor).toBe(
        token(
          theme === "light" ? "bg-background" : "bg-input-bg",
          "backgroundColor"
        )
      );
      await expect(getComputedStyle(tinted).backgroundColor).not.toBe(
        getComputedStyle(within(canvasElement).getByTestId(`${theme}-tinted`))
          .backgroundColor
      );
      await expect(getComputedStyle(tinted).boxShadow).toBe(hairline);
      await expect(
        getComputedStyle(
          scope.querySelector('[data-tinted-chip="all"]') as HTMLElement
        ).boxShadow
      ).toBe("none");
      const inCard = scope.querySelector(
        '[data-card-chip="typography"]'
      ) as HTMLElement;
      await expect(getComputedStyle(inCard).boxShadow).toBe(hairline);
      await expect(
        getComputedStyle(
          scope.querySelector('[data-card-chip="all"]') as HTMLElement
        ).boxShadow
      ).toBe("none");

      // The unselected pill stays faintly visible on its chip in every
      // state and on every surface: never white, never the chip's own fill,
      // a boundary of at least the faint strength, and digits at 4.5:1.
      const surfaces = {
        page: idle,
        tinted: scope.querySelector(
          '[data-tinted-chip="typography"]'
        ) as HTMLElement,
        card: scope.querySelector(
          '[data-card-chip="typography"]'
        ) as HTMLElement,
      };
      const zeros = {
        page: chip("motion"),
        tinted: scope.querySelector(
          '[data-tinted-chip="motion"]'
        ) as HTMLElement,
        card: scope.querySelector('[data-card-chip="motion"]') as HTMLElement,
      };
      const checkPill = async (label: string, chipEl: HTMLElement) => {
        const r = pillReading(chipEl);
        console.log(
          `pill ${label}: fill ${r.fill} chip ${r.chipFill} boundary ${r.boundary.toFixed(3)} digits ${r.digits.toFixed(2)} shown ${r.shown.toFixed(2)}`
        );
        await expect(`${label} ${r.fill}`).not.toBe(`${label} 255,255,255`);
        await expect(`${label} ${r.fill}`).not.toBe(`${label} ${r.chipFill}`);
        await expect(
          `${label} boundary ${r.boundary >= PILL_BOUNDARY_FLOOR}`
        ).toBe(`${label} boundary true`);
        await expect(`${label} digits ${r.digits >= 4.5}`).toBe(
          `${label} digits true`
        );
      };
      for (const [where, el] of Object.entries(surfaces)) {
        // biome-ignore lint/performance/noAwaitInLoops: one surface at a time, under one pointer
        await checkPill(`${theme} ${where} idle`, el);
        await checkPill(
          `${theme} ${where} zero`,
          zeros[where as keyof typeof zeros]
        );
        await user.hover(el);
        await eventually(() =>
          expect(getComputedStyle(el).backgroundColor).toBe(
            token(
              theme === "light" ? "bg-accent" : "bg-input/50",
              "backgroundColor"
            )
          )
        );
        await settle();
        await checkPill(`${theme} ${where} hovered`, el);
        const z = zeros[where as keyof typeof zeros];
        await user.hover(z, { force: true });
        await settle();
        await checkPill(`${theme} ${where} zero hovered`, z);
      }

      // Hover: idle takes accent (input/50 in dark). Selected does not
      // change.
      await user.hover(idle);
      await eventually(() =>
        expect(getComputedStyle(idle).backgroundColor).toBe(
          token(
            theme === "light" ? "bg-accent" : "bg-input/50",
            "backgroundColor"
          )
        )
      );
      // A hovered idle chip keeps the hairline, as the outline button does.
      await expect(getComputedStyle(idle).boxShadow).toBe(hairline);
      await user.hover(selected);
      await settle();
      await expect(getComputedStyle(selected).backgroundColor).toBe(
        token("bg-primary", "backgroundColor")
      );
      await expect(getComputedStyle(selected).color).toBe(
        token("text-primary-foreground", "color")
      );
      // A disabled (empty) chip takes no hover fill.
      const empty = chip("motion");
      await user.hover(empty, { force: true });
      await settle();
      await expect(getComputedStyle(empty).backgroundColor).toBe(
        token(
          theme === "light" ? "bg-background" : "bg-input-bg",
          "backgroundColor"
        )
      );
      // A disabled idle chip keeps it too, as a disabled outline button does.
      await expect(getComputedStyle(empty).boxShadow).toBe(hairline);
      await user.unhover(empty);

      // The pill's colours did not change with the shadow.
      await eventually(() =>
        expect(getComputedStyle(pill("typography")).backgroundColor).toBe(
          pillBefore.background
        )
      );
      await expect(getComputedStyle(pill("typography")).color).toBe(
        pillBefore.color
      );

      // The focus outline is unchanged and drawn as well as the shadow: a
      // real Tab enters a row with nothing chosen on its first, idle chip.
      const focusChip = scope.querySelector(
        '[data-focus-chip="typography"]'
      ) as HTMLElement;
      (scope.querySelector('[data-outline="card"]') as HTMLElement).focus();
      await user.tab();
      await eventually(() => expect(document.activeElement).toBe(focusChip));
      await expect(focusChip.matches(":focus-visible")).toBe(true);
      const ring = getComputedStyle(focusChip);
      await expect(ring.outlineStyle).toBe("solid");
      await expect(ring.outlineWidth).toBe("2px");
      await expect(ring.outlineOffset).toBe("2px");
      await expect(ring.boxShadow).toBe(hairline);
      focusChip.blur();
    }
  },
};

/**
 * Compare the unselected pill's tint at three strengths.
 * The middle row is the component as built; the other two override the
 * pill's fill with a class on the row (no prop). Hover a chip in each row.
 */
const PILL_STRENGTHS = [
  {
    strength: "faint",
    label: "Faint, 5%",
    className:
      "[&_[data-slot=filter-chip]:not([data-selected])_[data-slot=filter-chip-count]]:bg-foreground/5",
  },
  { strength: "default", label: "Default, 8%", className: "" },
  {
    strength: "distinct",
    label: "Distinct, 12%",
    className:
      "[&_[data-slot=filter-chip]:not([data-selected])_[data-slot=filter-chip-count]]:bg-foreground/12",
  },
] as const;

function StrengthRows({ surface }: { surface: string }) {
  return (
    <div className="flex flex-col gap-3">
      {PILL_STRENGTHS.map((s) => (
        <div className="flex items-center gap-3" key={s.strength}>
          <span className="w-28 shrink-0 text-muted-foreground text-xs">
            {s.label}
          </span>
          <FilterChips
            aria-label={`Topic, ${s.strength} pill, ${surface}`}
            className={s.className}
            data-strength={s.strength}
            defaultValue="all"
          >
            {TOPICS.map((t) => (
              <FilterChip
                count={t.count}
                data-strength-chip={t.value}
                key={t.value}
                value={t.value}
              >
                {t.label}
              </FilterChip>
            ))}
          </FilterChips>
        </div>
      ))}
    </div>
  );
}

export const PillStrengths: Story = {
  tags: TEST_ONLY,
  name: "Pill Strengths",
  // The light panel's class resets nothing: pin the light theme so the
  // toolbar's dark theme cannot paint both panels dark.
  // The suite has no toolbar: start from the dark theme so that the pin, not
  // the default, is what keeps the light panel light.
  globals: { theme: "dark" },
  parameters: { themes: { themeOverride: "light" } },
  render: () => (
    <div className="flex flex-col gap-4">
      {(["light", "dark"] as const).map((theme) => (
        <div
          className={`${theme} flex flex-wrap gap-6 bg-background p-4 text-foreground`}
          data-testid={`strengths-${theme}`}
          key={theme}
        >
          <div data-surface="page">
            <StrengthRows surface={`page, ${theme}`} />
          </div>
          <Card className="w-fit" data-surface="card">
            <CardContent>
              <StrengthRows surface={`card, ${theme}`} />
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expectBothThemes(canvasElement, "strengths-light", "strengths-dark");
    if (!needsRealInput()) {
      return;
    }
    const user = realUser() as RealUser;
    const boundaries: Record<string, number> = {};
    for (const theme of ["light", "dark"] as const) {
      for (const surface of ["page", "card"]) {
        for (const s of PILL_STRENGTHS) {
          const el = within(canvasElement)
            .getByTestId(`strengths-${theme}`)
            .querySelector(
              `[data-surface="${surface}"] [data-strength="${s.strength}"] [data-strength-chip="typography"]`
            ) as HTMLElement;
          const label = `${theme} ${surface} ${s.strength}`;
          // Move off all chips before taking an idle reading.
          // biome-ignore lint/performance/noAwaitInLoops: one pointer state at a time
          await user.hover(canvasElement, { position: { x: 1, y: 1 } });
          await eventually(() => expect(el.matches(":hover")).toBe(false));
          await eventually(() => expect(el.getAnimations()).toHaveLength(0));
          const idle = pillReading(el);
          const idleBackground = getComputedStyle(el).backgroundColor;
          await user.hover(el);
          await eventually(() => expect(el.matches(":hover")).toBe(true));
          await eventually(() =>
            expect(getComputedStyle(el).backgroundColor).not.toBe(
              idleBackground
            )
          );
          await eventually(() => expect(el.getAnimations()).toHaveLength(0));
          const hovered = pillReading(el);
          boundaries[label] = hovered.boundary;
          console.log(
            `strength ${label}: idle boundary ${idle.boundary.toFixed(3)} digits ${idle.digits.toFixed(2)}; hovered boundary ${hovered.boundary.toFixed(3)} digits ${hovered.digits.toFixed(2)}`
          );
          await user.unhover(el);
        }
      }
    }
    // On a hovered light chip the three steps read in order, the faint one
    // at the floor the looks story holds every state to.
    const [faint, middle, distinct] = PILL_STRENGTHS.map(
      (s) => boundaries[`light page ${s.strength}`]
    );
    await expect(faint).toBeGreaterThanOrEqual(PILL_BOUNDARY_FLOOR);
    await expect(middle).toBeGreaterThan(faint);
    await expect(distinct).toBeGreaterThan(middle);
  },
};

/**
 * Compare the selected chip's pill at three strengths. The first row is the
 * component as built; the other two override the selected pill's fill with
 * a class on the row (no prop), the last at the previous 20%.
 */
const SELECTED_PILL_STRENGTHS = [
  { strength: "built", label: "Default, 10%", alpha: 0.1, className: "" },
  {
    strength: "middle",
    label: "Middle, 15%",
    alpha: 0.15,
    className:
      "[&_[data-slot=filter-chip][data-selected]_[data-slot=filter-chip-count]]:bg-primary-foreground/15",
  },
  {
    strength: "previous",
    label: "Previous, 20%",
    alpha: 0.2,
    className:
      "[&_[data-slot=filter-chip][data-selected]_[data-slot=filter-chip-count]]:bg-primary-foreground/20",
  },
] as const;

export const SelectedPillStrengths: Story = {
  tags: TEST_ONLY,
  name: "Selected Pill Strengths",
  // The light panel's class resets nothing: pin the light theme so the
  // toolbar's dark theme cannot paint both panels dark.
  // The suite has no toolbar: start from the dark theme so that the pin, not
  // the default, is what keeps the light panel light.
  globals: { theme: "dark" },
  parameters: { themes: { themeOverride: "light" } },
  render: () => (
    <div className="flex flex-col gap-4">
      {(["light", "dark"] as const).map((theme) => (
        <div
          className={`${theme} flex flex-col gap-3 bg-background p-4 text-foreground`}
          data-testid={`selected-strengths-${theme}`}
          key={theme}
        >
          {SELECTED_PILL_STRENGTHS.map((s) => (
            <div className="flex items-center gap-3" key={s.strength}>
              <span className="w-28 shrink-0 text-muted-foreground text-xs">
                {s.label}
              </span>
              <div className="flex flex-wrap items-center gap-4">
                {(["sm", "default", "lg"] as const).map((size) => (
                  <FilterChips
                    aria-label={`Topic, ${s.strength} selected pill, ${size}, ${theme}`}
                    className={s.className}
                    data-selected-strength={s.strength}
                    data-strength-size={size}
                    key={size}
                    size={size}
                    // Held on the same chip in every row, so a click in one
                    // row cannot make the rows compare different chips.
                    value="all"
                  >
                    {TOPICS.slice(0, 2).map((t) => (
                      <FilterChip count={t.count} key={t.value} value={t.value}>
                        {t.label}
                      </FilterChip>
                    ))}
                  </FilterChips>
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expectBothThemes(
      canvasElement,
      "selected-strengths-light",
      "selected-strengths-dark"
    );
    for (const theme of ["light", "dark"] as const) {
      const scope = within(canvasElement).getByTestId(
        `selected-strengths-${theme}`
      );
      for (const s of SELECTED_PILL_STRENGTHS) {
        for (const size of ["sm", "default", "lg"]) {
          const chipEl = scope.querySelector(
            `[data-selected-strength="${s.strength}"][data-strength-size="${size}"] [data-slot="filter-chip"][data-selected]`
          ) as HTMLElement;
          const r = pillReading(chipEl);
          console.log(
            `selected ${theme} ${s.strength} ${size}: chip ${r.chipFill} pill ${r.fill} boundary ${r.boundary.toFixed(3)} digits ${r.digits.toFixed(2)}`
          );
          // Each row paints its strength, the pill stays faintly visible
          // and its digits stay at 4.5:1 or more.
          const alpha = s.alpha;
          const label = `${theme} ${s.strength} ${size}`;
          // biome-ignore lint/performance/noAwaitInLoops: one reading at a time
          await expect(`${label} ${r.fill}`).toBe(
            `${label} ${over(getComputedStyle(chipEl).color, r.chipFill, alpha)}`
          );
          await expect(
            `${label} boundary ${r.boundary >= PILL_BOUNDARY_FLOOR}`
          ).toBe(`${label} boundary true`);
          await expect(`${label} digits ${r.digits >= 4.5}`).toBe(
            `${label} digits true`
          );
        }
      }
      // The same pill at each strength, composited from the resolved tokens.
      const chipEl = scope.querySelector(
        '[data-selected-strength="built"] [data-slot="filter-chip"][data-selected]'
      ) as HTMLElement;
      const chipFill = painted(chipEl);
      const ink = getComputedStyle(chipEl).color;
      const text = over(ink, chipFill);
      for (const alpha of [0.2, 0.15, 0.12, 0.1]) {
        const fill = over(ink, chipFill, alpha);
        console.log(
          `selected ${theme} composite ${Math.round(alpha * 100)}%: chip ${chipFill} pill ${fill} boundary ${contrast(fill, chipFill).toFixed(3)} digits ${contrast(text, fill).toFixed(2)} chip-digits ${contrast(text, chipFill).toFixed(2)}`
        );
      }
    }
  },
};

/** Chip, pill and text geometry at both densities, beside a 40px tabs list. */
export const Heights: Story = {
  tags: TEST_ONLY,
  render: () => (
    <div className="flex flex-col gap-6">
      {[
        ["default", ""],
        [
          "compact",
          "[--ks-control-md:calc(var(--spacing)*8)] [--ks-control-sm:calc(var(--spacing)*7)] [--ks-control-xs:calc(var(--spacing)*6)]",
        ],
      ].map(([density, vars]) => (
        <div
          className={`flex flex-col gap-3 ${vars}`}
          data-testid={density}
          key={density}
        >
          <Tabs defaultValue="a">
            <TabsList>
              <TabsTrigger value="a">Articles</TabsTrigger>
              <TabsTrigger value="b">Videos</TabsTrigger>
            </TabsList>
          </Tabs>
          {(["sm", "default", "lg"] as const).map((size) => (
            <FilterChips
              aria-label={`${density} ${size}`}
              data-row={size}
              defaultValue="a"
              key={size}
              size={size}
            >
              <FilterChip count={6} value="a">
                All
              </FilterChip>
              <FilterChip value="b">No count</FilterChip>
            </FilterChips>
          ))}
        </div>
      ))}
      {(["sm", "default", "lg"] as const).map((size) => (
        <FilterChips
          aria-label={`Digits, ${size}`}
          data-digits={size}
          defaultValue="a"
          formatCount={formatGrouped}
          key={size}
          size={size}
        >
          {[7, 42, 512, 1234].map((count, i) => (
            <FilterChip count={count} key={count} value={i ? `${count}` : "a"}>
              {`${String(count).length} digits`}
            </FilterChip>
          ))}
        </FilterChips>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const expected = {
      default: { sm: 24, default: 32, lg: 40 },
      compact: { sm: 24, default: 28, lg: 32 },
    } as const;
    for (const density of ["default", "compact"] as const) {
      const scope = within(canvasElement).getByTestId(density);
      // The tabs list keeps its 40px at both densities.
      const tabsList = scope.querySelector(
        '[data-slot="tabs-list"]'
      ) as HTMLElement;
      // biome-ignore lint/performance/noAwaitInLoops: one case at a time, in order
      await expect(tabsList.getBoundingClientRect().height).toBe(40);
      for (const size of ["sm", "default", "lg"] as const) {
        const row = scope.querySelector(`[data-row="${size}"]`) as HTMLElement;
        const [withCount, without] =
          row.querySelectorAll<HTMLElement>('[role="radio"]');
        const box = withCount.getBoundingClientRect();
        // biome-ignore lint/performance/noAwaitInLoops: one case at a time, in order
        await expect(box.height).toBe(expected[density][size]);
        const pill = withCount.querySelector(
          '[data-slot="filter-chip-count"]'
        ) as HTMLElement;
        const p = pill.getBoundingClientRect();
        await expect(p.height).toBe(size === "sm" ? 16 : 20);
        await expect(p.width).toBeGreaterThanOrEqual(p.height);
        // Pill centred vertically; end padding 6px with a count.
        await expect(
          Math.abs(p.top + p.height / 2 - (box.top + box.height / 2))
        ).toBeLessThanOrEqual(0.5);
        const style = getComputedStyle(withCount);
        await expect(style.paddingInlineEnd).toBe("6px");
        await expect(style.columnGap).toBe("6px");
        await expect(getComputedStyle(pill).fontVariantNumeric).toBe(
          "tabular-nums"
        );
        const start = { sm: "12px", default: "14px", lg: "16px" }[size];
        await expect(style.paddingInlineStart).toBe(start);
        await expect(getComputedStyle(without).paddingInlineEnd).toBe(start);
        await expect(style.fontSize).toBe(size === "sm" ? "12px" : "14px");
        await expect(style.fontWeight).toBe("500");
        await expect(style.borderRadius).not.toBe("0px");
      }
    }
    // Monospaced digits: one to four digits and a separated count, at every
    // size, sit centred in a pill at least as wide as it is high.
    for (const row of canvasElement.querySelectorAll<HTMLElement>(
      "[data-digits]"
    )) {
      for (const pill of row.querySelectorAll<HTMLElement>(
        '[data-slot="filter-chip-count"]'
      )) {
        const p = pill.getBoundingClientRect();
        const range = document.createRange();
        range.selectNodeContents(pill);
        const text = range.getBoundingClientRect();
        const where = `${row.dataset.digits} "${pill.textContent}"`;
        // biome-ignore lint/performance/noAwaitInLoops: one case at a time, in order
        await expect(`${where} ${p.width >= p.height}`).toBe(`${where} true`);
        await expect(
          Math.abs(text.left + text.width / 2 - (p.left + p.width / 2))
        ).toBeLessThanOrEqual(0.5);
        await expect(
          Math.abs(text.top + text.height / 2 - (p.top + p.height / 2))
        ).toBeLessThanOrEqual(1);
      }
    }
  },
};

const LONG = "An unusually long filter label that keeps going";

/**
 * Chips wrap with 8px between them on both axes, and every focus outline
 * stays visible inside a clipping container that has 4px of padding.
 */
export const Wrapping: Story = {
  render: () => (
    <div className="flex flex-col gap-6 p-4">
      <div className="w-60 overflow-hidden p-1" data-testid="clip">
        <FilterChips aria-label="Topic" defaultValue="a">
          {["All", "Typography", "Color", "Motion", "Layout", "Icons"].map(
            (label, i) => (
              <FilterChip
                count={i * 3}
                key={label}
                value={label === "All" ? "a" : label}
              >
                {label}
              </FilterChip>
            )
          )}
        </FilterChips>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    if (!needsRealInput()) {
      return;
    }
    const user = realUser() as RealUser;
    const box = within(canvasElement).getByTestId("clip");
    const clip = box.getBoundingClientRect();
    const row = box.querySelector('[data-slot="filter-chips"]') as HTMLElement;
    await expect(getComputedStyle(row).rowGap).toBe("8px");
    await expect(getComputedStyle(row).columnGap).toBe("8px");
    await expect(getComputedStyle(row).padding).toBe("0px");
    const chips = [...row.querySelectorAll<HTMLElement>('[role="radio"]')];
    const tops = new Set(chips.map((c) => c.getBoundingClientRect().top));
    await expect(tops.size).toBeGreaterThan(1);
    // Focus each available chip in turn with real keys and check that its
    // whole outline (offset 2 + width 2) is inside the clipping box.
    const available = chips.filter((c) => !c.hasAttribute("data-disabled"));
    (document.activeElement as HTMLElement | null)?.blur?.();
    available[0].focus();
    // A key press on the first chip (already selected, so nothing changes)
    // makes its outline show even if an earlier story last used the pointer.
    await user.keyboard(" ");
    for (const [i, chip] of available.entries()) {
      if (i > 0) {
        // biome-ignore lint/performance/noAwaitInLoops: one key at a time
        await user.keyboard("{ArrowRight}");
      }
      await eventually(() => expect(document.activeElement).toBe(chip));
      const style = getComputedStyle(chip);
      const reach =
        Number.parseFloat(style.outlineOffset) +
        Number.parseFloat(style.outlineWidth);
      await expect(reach).toBe(4);
      const r = chip.getBoundingClientRect();
      await expect(r.left - reach).toBeGreaterThanOrEqual(clip.left);
      await expect(r.top - reach).toBeGreaterThanOrEqual(clip.top);
      await expect(r.right + reach).toBeLessThanOrEqual(clip.right);
      await expect(r.bottom + reach).toBeLessThanOrEqual(clip.bottom);
    }
  },
};

/**
 * A label wider than its row overflows it: the row wraps between chips,
 * never inside one. Shorten the label or give the row more room.
 */
export const OversizedLabel: Story = {
  tags: TEST_ONLY,
  name: "Oversized Label",
  render: () => (
    <div className="w-48 border border-dashed p-1" data-testid="narrow">
      <FilterChips aria-label="Topic" defaultValue="a">
        <FilterChip count={6} value="a">
          All
        </FilterChip>
        <FilterChip count={2} value="b">
          {LONG}
        </FilterChip>
        <FilterChip count={Number.MAX_SAFE_INTEGER} value="c">
          Largest count
        </FilterChip>
      </FilterChips>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const box = within(canvasElement).getByTestId("narrow");
    const long = within(box).getByRole("radio", { name: `${LONG} 2` });
    // No wrapping inside a chip: one line, wider than the container.
    await expect(long.getBoundingClientRect().height).toBe(32);
    await expect(long.getBoundingClientRect().width).toBeGreaterThan(
      box.getBoundingClientRect().width
    );
  },
};

/** Icons in a label take the usual 16px size and do not shrink. */
export const WithIcons: Story = {
  name: "With Icons",
  render: () => (
    <FilterChips aria-label="Format" defaultValue="articles">
      <FilterChip count={6} value="articles">
        <NewspaperIcon aria-hidden />
        Articles
      </FilterChip>
      <FilterChip count={5} value="videos">
        <ClapperboardIcon aria-hidden />
        Videos
      </FilterChip>
    </FilterChips>
  ),
  play: async ({ canvasElement }) => {
    for (const svg of canvasElement.querySelectorAll("svg")) {
      const r = svg.getBoundingClientRect();
      // biome-ignore lint/performance/noAwaitInLoops: one case at a time, in order
      await expect([r.width, r.height]).toEqual([16, 16]);
      await expect(getComputedStyle(svg).pointerEvents).toBe("none");
    }
    await expect(
      within(canvasElement).getByRole("radio", named("Articles 6"))
    ).toBeDefined();
  },
};

/** A forwarded non-interactive element keeps the radio's props, ref and look; className overrides win. */
export const CustomRender: Story = {
  tags: TEST_ONLY,
  name: "Custom Render",
  render: () => (
    <FilterChips
      aria-label="Topic"
      className="gap-4"
      defaultValue="a"
      render={<section />}
    >
      <FilterChip
        className="border-dashed"
        count={4}
        data-chip="a"
        render={<div />}
        value="a"
      >
        Rendered
      </FilterChip>
      <FilterChip className="ps-6" count={1} data-chip="b" value="b">
        Wider start
      </FilterChip>
    </FilterChips>
  ),
  play: async ({ canvasElement }) => {
    if (!needsRealInput()) {
      return;
    }
    const user = realUser() as RealUser;
    const row = canvasElement.querySelector(
      '[data-slot="filter-chips"]'
    ) as HTMLElement;
    await expect(row.tagName).toBe("SECTION");
    await expect(getComputedStyle(row).columnGap).toBe("16px");
    const a = canvasElement.querySelector('[data-chip="a"]') as HTMLElement;
    const b = canvasElement.querySelector('[data-chip="b"]') as HTMLElement;
    await expect(a.tagName).toBe("DIV");
    await expect(a.getAttribute("role")).toBe("radio");
    await expect(getComputedStyle(a).borderTopStyle).toBe("dashed");
    await expect(getComputedStyle(a).height).toBe("32px");
    await expect(getComputedStyle(b).paddingInlineStart).toBe("24px");
    await user.click(b);
    await eventually(() => expect(b).toHaveAttribute("data-selected"));
    await user.keyboard("{ArrowLeft}");
    await eventually(() => expect(a).toHaveAttribute("data-selected"));
  },
};

// The previous timing, applied to the second row only through class
// overrides on its chips and pills (not a prop).
const PREVIOUS_TIMING =
  "duration-(--duration-fast) ease-(--ease-ks-out) [&>[data-slot=filter-chip-count]]:duration-(--duration-fast) [&>[data-slot=filter-chip-count]]:ease-(--ease-ks-out)";

/**
 * For comparing by eye: the same chips with the built timing (base duration,
 * in-out curve) and with the previous one (fast duration, out curve). Hover
 * across each row and click between chips.
 */
export const MotionCompared: Story = {
  tags: TEST_ONLY,
  name: "Motion Compared",
  render: () => (
    <div className="flex flex-col gap-6">
      {[
        ["Built: base duration (180ms), in-out curve", ""],
        ["Previous: fast duration (125ms), out curve", PREVIOUS_TIMING],
      ].map(([label, timing]) => (
        <div className="flex flex-col gap-2" key={label}>
          <p className="text-muted-foreground text-sm">{label}</p>
          <FilterChips aria-label={label} defaultValue="all">
            {TOPICS.map((t) => (
              <FilterChip
                className={timing}
                count={t.count}
                key={t.value}
                value={t.value}
              >
                {t.label}
              </FilterChip>
            ))}
          </FilterChips>
        </div>
      ))}
    </div>
  ),
};

/**
 * Chip and pill ease background, border and text colour together on the
 * base duration and the in-out curve; the reduced-motion rule zeroes the
 * duration token.
 */
export const Motion: Story = {
  tags: TEST_ONLY,
  render: () => (
    <div className="flex flex-col gap-4">
      <FilterChips aria-label="Topic" data-testid="normal" defaultValue="a">
        <FilterChip count={1} value="a">
          Normal
        </FilterChip>
      </FilterChips>
      {/* What the reduced-motion rule in base.css does: zero the tokens. */}
      <div className="[--duration-base:0.01ms]">
        <FilterChips aria-label="Topic" data-testid="reduced" defaultValue="a">
          <FilterChip count={1} value="a">
            Reduced
          </FilterChip>
        </FilterChips>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    if (outsideVitest()) {
      return;
    }
    // The page's own reduced-motion rule zeroes the token the chip reads.
    // Read from the loaded stylesheets rather than by emulating the media
    // query, which would leak into later stories.
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
          reducedTokens.push(rule.style.getPropertyValue("--duration-base"));
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

    const canvas = within(canvasElement);
    const inOut = getComputedStyle(document.documentElement)
      .getPropertyValue("--ease-ks-in-out")
      .trim();
    for (const [id, ms] of [
      ["normal", 180],
      ["reduced", 0.01],
    ] as const) {
      const chip = within(canvas.getByTestId(id)).getByRole("radio");
      const pill = chip.querySelector(
        '[data-slot="filter-chip-count"]'
      ) as HTMLElement;
      // The pill recolours in step with the chip: same duration and curve.
      // biome-ignore lint/performance/noAwaitInLoops: one case at a time, in order
      await expect(getComputedStyle(pill).transitionDuration).toBe(
        getComputedStyle(chip).transitionDuration
      );
      await expect(getComputedStyle(pill).transitionTimingFunction).toBe(
        getComputedStyle(chip).transitionTimingFunction
      );
      for (const el of [chip, pill]) {
        const style = getComputedStyle(el);
        // Colour, and the chip's shadow (selection removes it): no scale in
        // the list. The pill has no shadow to ease.
        // biome-ignore lint/performance/noAwaitInLoops: one case at a time, in order
        await expect(style.transitionProperty).toBe(
          el === chip
            ? "color, background-color, border-color, box-shadow"
            : "color, background-color, border-color"
        );
        for (const curve of style.transitionTimingFunction.split(
          /,(?![^(]*\))/
        )) {
          // biome-ignore lint/performance/noAwaitInLoops: one case at a time, in order
          await expect(curve.trim()).toBe(inOut);
        }
        const durations = style.transitionDuration
          .split(",")
          .map(
            (d) => Number.parseFloat(d) * (d.trim().endsWith("ms") ? 1 : 1000)
          );
        for (const d of durations) {
          // biome-ignore lint/performance/noAwaitInLoops: one case at a time, in order
          await expect(d).toBeCloseTo(ms, 2);
        }
      }
    }
  },
};

// ---------------------------------------------------------------------------
// One keyboard owner: prevention, modifiers, re-entrant focus, nesting
// ---------------------------------------------------------------------------

/** Ordinary prevention in any handler leaves the arrow working; opting out of Base UI's handling stops it. */
export const ConsumerPrevention: Story = {
  tags: TEST_ONLY,
  name: "Consumer Prevention",
  ...fixture(async (t) => {
    const prevent = (event: { preventDefault: () => void }) =>
      event.preventDefault();
    const placements: [
      string,
      Pick<typeof harness, "chipProps" | "rowProps">,
    ][] = [
      ["row capture", { rowProps: { onKeyDownCapture: prevent } }],
      ["chip", { chipProps: () => ({ onKeyDown: prevent }) }],
      [
        "render element",
        {
          chipProps: () => ({
            // biome-ignore lint/a11y/noStaticElementInteractions: the chip's own element; the radio role comes through the forwarded props
            render: <span onKeyDown={prevent} />,
          }),
        },
      ],
    ];
    for (const controlled of [true, false]) {
      // The row's own handler prevents the default.
      // biome-ignore lint/performance/noAwaitInLoops: one case at a time, in order
      await t.reset({ controlled, value: "a" });
      harness.keyDown = prevent;
      await t.tabIn();
      await t.user.keyboard("{ArrowRight}");
      await eventually(() => expect(t.focused()).toBe("b"));
      await eventually(() => expect(t.checked()).toBe("b"));
      await expect(harness.changes).toEqual(["b"]);
      for (const [label, hooks] of placements) {
        // biome-ignore lint/performance/noAwaitInLoops: one case at a time, in order
        await t.reset({ controlled, value: "a" }, hooks);
        await t.tabIn();
        await t.user.keyboard("{ArrowRight}");
        await eventually(() =>
          expect(`${label} ${t.focused()} ${t.checked()}`).toBe(`${label} b b`)
        );
        await expect(harness.changes).toEqual(["b"]);
      }
      // Opting out of Base UI's handling, on the row or on a chip.
      const optOut = (event: { preventBaseUIHandler?: () => void }) =>
        event.preventBaseUIHandler?.();
      await t.reset({ controlled, value: "a" });
      harness.keyDown = optOut as never;
      await t.tabIn();
      await t.user.keyboard("{ArrowRight}");
      await settle();
      await expect(t.focused()).toBe("a");
      await expect(harness.changes).toEqual([]);
      await t.reset(
        { controlled, value: "a" },
        { chipProps: () => ({ onKeyDown: optOut }) }
      );
      await t.tabIn();
      await t.user.keyboard("{ArrowRight}");
      await settle();
      await expect(t.focused()).toBe("a");
      await expect(harness.changes).toEqual([]);
    }
  }),
};

/**
 * A Ctrl, Alt or Meta arrow moves nothing. When the app prevents it and
 * focuses another chip one or two microtasks later, that focus selects
 * nothing, with an uncontrolled row and with a controlled parent that
 * refuses every change.
 */
export const ModifiedArrowFocus: Story = {
  tags: TEST_ONLY,
  name: "Modified Arrow Focus",
  ...fixture(async (t) => {
    const order = ["a", "b", "c", "d"];
    let n = 0;
    for (const mode of ["uncontrolled", "refusing"] as const) {
      for (const modifier of ["Control", "Alt", "Meta"]) {
        for (const depth of [1, 2]) {
          const origin = order[n % 4] as string;
          const destination = order[(n + 2) % 4] as string;
          n += 1;
          let focused = 0;
          // biome-ignore lint/performance/noAwaitInLoops: one case at a time, in order
          await t.reset(
            {
              controlled: mode === "refusing",
              ignore: mode === "refusing",
              value: null,
            },
            {
              chipProps: (v) =>
                v === destination
                  ? {
                      onFocus: () => {
                        focused += 1;
                      },
                    }
                  : {},
            }
          );
          harness.keyDown = (event) => {
            if (!event.key.startsWith("Arrow")) {
              return;
            }
            event.preventDefault();
            const go = () => t.chip(destination).focus();
            queueMicrotask(depth === 1 ? go : () => queueMicrotask(go));
          };
          t.chip(origin).focus();
          await eventually(() => expect(t.focused()).toBe(origin));
          await t.user.keyboard(`{${modifier}>}{ArrowRight}{/${modifier}}`);
          const label = `${mode} ${modifier} depth ${depth}: ${origin} → ${destination}`;
          await eventually(() =>
            expect(`${label} ${t.focused()}`).toBe(`${label} ${destination}`)
          );
          await settle();
          await expect(`${label} focus events ${focused > 0}`).toBe(
            `${label} focus events true`
          );
          await expect(`${label} ${JSON.stringify(harness.changes)}`).toBe(
            `${label} []`
          );
          await expect(t.checked()).toBe("");
        }
      }
    }
  }),
};

/** An arrow with no destination, then a chip made available and focused by the app, selects nothing. */
export const NoDestination: Story = {
  tags: TEST_ONLY,
  name: "No Destination",
  ...fixture(async (t) => {
    for (const mode of ["uncontrolled", "controlled", "refusing"] as const) {
      const state = {
        controlled: mode !== "uncontrolled",
        ignore: mode === "refusing",
        value: null,
      };
      // The app prevents the key, makes b available, then focuses it.
      // biome-ignore lint/performance/noAwaitInLoops: one case at a time, in order
      await t.reset({ ...state, chips: allZeroBut("a") });
      harness.keyDown = (event) => {
        if (!event.key.startsWith("Arrow")) {
          return;
        }
        event.preventDefault();
        queueMicrotask(() => {
          flushSync(() => harness.set?.({ chips: FOUR }));
          queueMicrotask(() => t.chip("b").focus());
        });
      };
      t.chip("a").focus();
      await eventually(() => expect(t.focused()).toBe("a"));
      await t.user.keyboard("{ArrowRight}");
      await eventually(() => expect(t.focused()).toBe("b"));
      await settle();
      await expect(harness.changes).toEqual([]);
      await expect(t.checked()).toBe("");
      // Nothing to move to, both ways; later a chip becomes available and
      // code focuses it.
      await t.reset({ ...state, chips: allZeroBut("a") });
      t.chip("a").focus();
      await eventually(() => expect(t.focused()).toBe("a"));
      await t.user.keyboard("{ArrowRight}{ArrowLeft}{ArrowUp}{ArrowDown}");
      await settle();
      await expect(t.focused()).toBe("a");
      harness.set?.({ chips: FOUR });
      await settle();
      t.chip("c").focus();
      await settle();
      await expect(harness.changes).toEqual([]);
      await expect(t.checked()).toBe("");
      // A row of one chip.
      await t.reset({ ...state, chips: [{ value: "a", count: 1 }] });
      await t.tabIn();
      await t.user.keyboard("{ArrowRight}{ArrowLeft}");
      await settle();
      await expect(t.focused()).toBe("a");
      await expect(harness.changes).toEqual([]);
    }
  }),
};

/**
 * Code that moves focus on from inside a focus, blur or change callback:
 * the chip that ends up focused holds the only roving stop, nothing else is
 * selected, and Tab out and back, and removal, still work.
 */
export const ReentrantFocus: Story = {
  tags: TEST_ONLY,
  name: "Reentrant Focus",
  ...fixture(async (t) => {
    const toD = () => t.chip("d").focus();
    const redirects: [
      string,
      Pick<typeof harness, "chipProps" | "rowProps">,
    ][] = [
      [
        "chip onFocus",
        { chipProps: (v) => (v === "c" ? { onFocus: toD } : {}) },
      ],
      [
        "render element onFocus",
        {
          chipProps: (v) =>
            // biome-ignore lint/a11y/noStaticElementInteractions: the chip's own element; the radio role comes through the forwarded props
            v === "c" ? { render: <span onFocus={toD} /> } : {},
        },
      ],
      [
        "row capture onFocus",
        {
          rowProps: {
            onFocusCapture: (event: { target: EventTarget }) => {
              if (event.target === t.chip("c")) {
                toD();
              }
            },
          },
        },
      ],
    ];
    for (const controlled of [true, false]) {
      for (const [label, hooks] of redirects) {
        // biome-ignore lint/performance/noAwaitInLoops: one case at a time, in order
        await t.reset({ controlled, value: null }, hooks);
        t.chip("b").focus();
        await eventually(() => expect(t.focused()).toBe("b"));
        await t.user.keyboard("{ArrowRight}");
        await eventually(() =>
          expect(`${label} ${t.focused()}`).toBe(`${label} d`)
        );
        await settle();
        await expect(`${label} ${t.tabStops()}`).toBe(`${label} d`);
        await expect(harness.changes).toEqual([]);
        await expect(t.checked()).toBe("");
        // Out and back in: the entry target, not the redirected chip.
        await t.user.keyboard("{Tab}");
        await eventually(() => expect(t.focused()).toBe("after"));
        await eventually(() => expect(t.tabStops()).toBe("a"));
        await t.user.keyboard("{Shift>}{Tab}{/Shift}");
        await eventually(() => expect(t.focused()).toBe("a"));
        // Remove the chip that has focus after a redirect.
        t.chip("b").focus();
        await t.user.keyboard("{ArrowRight}");
        await eventually(() => expect(t.focused()).toBe("d"));
        harness.set?.({ chips: chipsIn("abc") });
        await eventually(() =>
          expect(`${label} after removal ${t.focused()}`).toBe(
            `${label} after removal a`
          )
        );
        await settle();
        await expect(harness.changes).toEqual([]);
      }
      // The previous chip's blur callback moves focus on: whichever chip
      // ends up focused is the only stop, and only the arrow's own
      // destination can have been selected.
      await t.reset(
        { controlled, value: null },
        { chipProps: (v) => (v === "b" ? { onBlur: toD } : {}) }
      );
      t.chip("b").focus();
      await t.user.keyboard("{ArrowRight}");
      await settle();
      const landed = t.focused();
      await expect(["c", "d"]).toContain(landed);
      await expect(t.tabStops()).toBe(landed);
      await expect(harness.changes).toEqual(landed === "c" ? ["c"] : []);
      // A change callback that moves focus: the change stands, the chip
      // that took focus holds the stop.
      await t.reset({ controlled, value: null });
      harness.onChange = () => t.chip("a").focus();
      t.chip("b").focus();
      await t.user.keyboard("{ArrowRight}");
      await eventually(() => expect(t.focused()).toBe("a"));
      await settle();
      await expect(harness.changes).toEqual(["c"]);
      await expect(t.checked()).toBe("c");
      await expect(t.tabStops()).toBe("a");
      await t.user.keyboard("{Tab}");
      await eventually(() => expect(t.tabStops()).toBe("c"));
    }
  }),
};

/** A custom render that queues its own work after forwarding the row's handlers. */
function QueueingHost(props: Record<string, unknown>) {
  const [tag, setTag] = useState<"span" | "div">("span");
  const forwarded = props as {
    onKeyDown?: (event: unknown) => void;
    onFocus?: (event: unknown) => void;
  };
  return createElement(tag, {
    ...props,
    onKeyDown: (event: unknown) => {
      forwarded.onKeyDown?.(event);
      queueMicrotask(() => setTag((v) => (v === "span" ? "div" : "span")));
    },
    onFocus: (event: unknown) => {
      forwarded.onFocus?.(event);
      queueMicrotask(() => undefined);
    },
  });
}

interface TraceRecord {
  active: string;
  eventId: number | null;
  operationId: number | null;
  phase: "key" | "focus" | "change";
  value?: string;
}

/**
 * Records key, focus and change events with the key event and the operation
 * (one dispatch of one key event) they happen in. A key event keeps its id
 * in every row it reaches; a key dispatched inside another is a new
 * operation.
 */
function traceOperations() {
  const ids = new WeakMap<Event, number>();
  let nextEvent = 0;
  let nextOperation = 0;
  const open: { eventId: number; operationId: number }[] = [];
  const records: TraceRecord[] = [];
  const name = (el: EventTarget | null) =>
    (el as HTMLElement | null)?.dataset?.chip ?? "other";
  const current = () => open.at(-1);
  const onKeyCapture = (event: Event) => {
    if (!ids.has(event)) {
      nextEvent += 1;
      ids.set(event, nextEvent);
    }
    nextOperation += 1;
    const eventId = ids.get(event) as number;
    open.push({ eventId, operationId: nextOperation });
    records.push({
      eventId,
      operationId: nextOperation,
      phase: "key",
      active: name(document.activeElement),
    });
  };
  const onKeyBubble = () => {
    open.pop();
  };
  const onFocusIn = (event: Event) => {
    records.push({
      eventId: current()?.eventId ?? null,
      operationId: current()?.operationId ?? null,
      phase: "focus",
      active: name(event.target),
    });
  };
  document.addEventListener("keydown", onKeyCapture, true);
  document.addEventListener("keydown", onKeyBubble);
  document.addEventListener("focusin", onFocusIn, true);
  return {
    records,
    change: (value: string) =>
      records.push({
        eventId: current()?.eventId ?? null,
        operationId: current()?.operationId ?? null,
        phase: "change",
        active: name(document.activeElement),
        value,
      }),
    /** The records as "phase:value-or-active@operation". */
    summary: () =>
      records.map(
        (r) => `${r.phase}:${r.value ?? r.active}@${r.operationId ?? "-"}`
      ),
    stop: () => {
      document.removeEventListener("keydown", onKeyCapture, true);
      document.removeEventListener("keydown", onKeyBubble);
      document.removeEventListener("focusin", onFocusIn, true);
    },
  };
}

/** Held, repeated and nested arrow keys, and a render that queues work, keep one move per key. */
export const RepeatedKeys: Story = {
  tags: TEST_ONLY,
  name: "Repeated Keys",
  ...fixture(async (t) => {
    for (const controlled of [true, false]) {
      // biome-ignore lint/performance/noAwaitInLoops: one case at a time, in order
      await t.reset({ controlled, value: "a" });
      await t.tabIn();
      let trace = traceOperations();
      harness.onChange = trace.change;
      try {
        await t.user.keyboard("{ArrowRight>4/}");
        await eventually(() =>
          expect(`held ${t.focused()} ${t.checked()}`).toBe("held a a")
        );
      } finally {
        trace.stop();
      }
      await expect(harness.changes).toEqual(["b", "c", "d", "a"]);
      // Each repeat is its own event and operation, and its focus and change
      // happen inside it.
      await expect(trace.summary()).toEqual([
        "key:a@1",
        "focus:b@1",
        "change:b@1",
        "key:b@2",
        "focus:c@2",
        "change:c@2",
        "key:c@3",
        "focus:d@3",
        "change:d@3",
        "key:d@4",
        "focus:a@4",
        "change:a@4",
      ]);
      // A change callback that dispatches another arrow key synchronously.
      await t.reset({ controlled, value: "a" });
      await t.tabIn();
      trace = traceOperations();
      harness.onChange = (v) => {
        trace.change(v);
        if (v === "b") {
          document.activeElement?.dispatchEvent(
            new globalThis.KeyboardEvent("keydown", {
              key: "ArrowRight",
              bubbles: true,
              cancelable: true,
            })
          );
        }
      };
      try {
        await t.user.keyboard("{ArrowRight}");
        await eventually(() =>
          expect(`nested focus ${t.focused()}`).toBe("nested focus c")
        );
        await settle();
      } finally {
        trace.stop();
      }
      // The nested key is a new event and a new operation inside the first;
      // its focus and change belong to it, and nothing happens under the
      // first operation once the nested one starts.
      await expect(trace.summary()).toEqual([
        "key:a@1",
        "focus:b@1",
        "change:b@1",
        "key:b@2",
        "focus:c@2",
        "change:c@2",
      ]);
      await expect(trace.records.map((r) => r.eventId)).toEqual([
        1, 1, 1, 2, 2, 2,
      ]);
      await expect(harness.changes).toEqual(["b", "c"]);
      await expect(`nested stop ${t.tabStops()}`).toBe("nested stop c");
      // onValueChange runs before its change commits, so the outer change
      // (b) commits after the nested one (c): focus ends on c, the value on
      // b, and both changes were reported.
      await expect(`nested checked ${t.checked()}`).toBe("nested checked b");
      await expect(t.chip("b")).toHaveAttribute("data-selected");
      // Every chip renders through a host that queues work after the
      // handlers it forwards, and replaces its own element on each key.
      await t.reset(
        { controlled, value: "a" },
        { chipProps: () => ({ render: <QueueingHost /> }) }
      );
      await t.tabIn();
      await t.user.keyboard("{ArrowRight}");
      await eventually(() =>
        expect(`queueing first ${t.checked()}`).toBe("queueing first b")
      );
      await t.user.keyboard("{ArrowRight}");
      await eventually(() =>
        expect(`queueing second ${t.focused()} ${t.checked()}`).toBe(
          "queueing second c c"
        )
      );
      await settle();
      await expect(harness.changes).toEqual(["b", "c"]);
      await t.user.keyboard("{Tab}");
      await eventually(() => expect(t.focused()).toBe("after"));
      await eventually(() => expect(t.tabStops()).toBe("c"));
      await t.user.keyboard("{Shift>}{Tab}{/Shift}");
      await eventually(() => expect(t.focused()).toBe("c"));
    }
  }),
};

// ---------------------------------------------------------------------------
// Nested rows
// ---------------------------------------------------------------------------

const nested: {
  changes: string[];
  keys: string[];
  set?: (patch: Partial<NestedState>) => void;
} = { changes: [], keys: [] };

interface NestedState {
  inner: ChipSpec[];
  outerCancel: boolean;
}

/** One stable id per native key event, seen by every row it reaches. */
const keyIds = new WeakMap<Event, number>();
let nextKeyId = 0;

function NestedRowsFixture() {
  const [state, setState] = useState<NestedState>({
    inner: [{ value: "x", count: 1 }],
    outerCancel: false,
  });
  nested.set = (patch) => setState((prev) => ({ ...prev, ...patch }));
  const id = (event: { nativeEvent: Event }) => {
    if (!keyIds.has(event.nativeEvent)) {
      nextKeyId += 1;
      keyIds.set(event.nativeEvent, nextKeyId);
    }
    return keyIds.get(event.nativeEvent);
  };
  return (
    <div className="flex flex-col items-start gap-2 p-4">
      <button data-testid="before" type="button">
        before
      </button>
      <FilterChips
        aria-label="Outer"
        defaultValue="a"
        onKeyDown={(event) => nested.keys.push(`outer#${id(event)}`)}
        onValueChange={(v, details) => {
          nested.changes.push(`outer:${v}`);
          if (state.outerCancel) {
            details.cancel();
          }
        }}
      >
        {["a", "b"].map((v) => (
          <FilterChip data-chip={v} key={v} value={v}>
            {v.toUpperCase()}
          </FilterChip>
        ))}
        <div className="flex">
          <FilterChips
            aria-label="Inner"
            onKeyDown={(event) => nested.keys.push(`inner#${id(event)}`)}
            onValueChange={(v) => nested.changes.push(`inner:${v}`)}
          >
            {state.inner.map((c) => (
              <FilterChip
                count={c.count}
                data-chip={c.value}
                disabled={c.disabled}
                key={c.value}
                value={c.value}
              >
                {c.value.toUpperCase()}
              </FilterChip>
            ))}
          </FilterChips>
        </div>
      </FilterChips>
      <button data-testid="after" type="button">
        after
      </button>
    </div>
  );
}

/**
 * A row nested beside another row's chips: its arrows never move or select
 * in the outer row, even when they have nowhere to go; each row keeps its
 * own Tab stop.
 */
export const NestedRows: Story = {
  tags: TEST_ONLY,
  name: "Nested Rows",
  render: () => <NestedRowsFixture />,
  play: async ({ canvasElement }) => {
    if (!needsRealInput()) {
      return;
    }
    const user = realUser() as RealUser;
    const chip = (v: string) =>
      canvasElement.querySelector(`[data-chip="${v}"]`) as HTMLElement;
    const focused = () =>
      (document.activeElement as HTMLElement | null)?.dataset.chip ??
      (document.activeElement as HTMLElement | null)?.dataset.testid;
    const outerChecked = () =>
      ["a", "b"].filter((v) => chip(v).getAttribute("aria-checked") === "true");
    const press = async (keys: string) => {
      nested.changes.length = 0;
      nested.keys.length = 0;
      await user.keyboard(keys);
      await settle();
    };
    // One available inner chip: no destination, in any direction or with
    // a modifier; the event reaches both rows under one id and moves
    // nothing.
    chip("x").focus();
    const trace = traceOperations();
    for (const key of [
      "{ArrowRight}",
      "{ArrowLeft}",
      "{ArrowDown}",
      "{Control>}{ArrowRight}{/Control}",
    ]) {
      // biome-ignore lint/performance/noAwaitInLoops: one key at a time
      await press(key);
      await expect(`${key} ${focused()}`).toBe(`${key} x`);
      await expect(nested.changes).toEqual([]);
      const [inner, outer] = nested.keys;
      await expect(inner?.startsWith("inner#")).toBe(true);
      await expect(outer?.replace("outer", "")).toBe(
        inner?.replace("inner", "")
      );
    }
    trace.stop();
    // Five key events (Control is one), five operations, and no focus or
    // change in any of them.
    await expect(trace.summary()).toEqual([
      "key:x@1",
      "key:x@2",
      "key:x@3",
      "key:x@4",
      "key:x@5",
    ]);
    await expect(outerChecked()).toEqual(["a"]);
    // The inner row's other chip unavailable: still nothing moves.
    nested.set?.({
      inner: [
        { value: "x", count: 1 },
        { value: "y", count: 1, disabled: true },
      ],
    });
    await settle();
    await press("{ArrowRight}{ArrowUp}");
    await expect(focused()).toBe("x");
    await expect(nested.changes).toEqual([]);
    // Two available inner chips: the inner row moves and selects alone.
    nested.set?.({
      inner: [
        { value: "x", count: 1 },
        { value: "y", count: 1 },
      ],
    });
    await settle();
    await press("{ArrowRight}");
    await eventually(() => expect(focused()).toBe("y"));
    await expect(nested.changes).toEqual(["inner:y"]);
    await press("{ArrowRight}");
    await eventually(() => expect(focused()).toBe("x"));
    await expect(nested.changes).toEqual(["inner:x"]);
    // The outer row's arrows skip the inner chips.
    chip("a").focus();
    await press("{ArrowRight}");
    await eventually(() => expect(focused()).toBe("b"));
    await expect(nested.changes).toEqual(["outer:b"]);
    await press("{ArrowRight}");
    await eventually(() => expect(focused()).toBe("a"));
    await expect(nested.changes).toEqual(["outer:a"]);
    // Native Tab: each row is one stop, in order.
    (
      canvasElement.querySelector('[data-testid="before"]') as HTMLElement
    ).focus();
    await user.keyboard("{Tab}");
    await eventually(() => expect(focused()).toBe("a"));
    await user.keyboard("{Tab}");
    await eventually(() => expect(focused()).toBe("x"));
    await user.keyboard("{Tab}");
    await eventually(() => expect(focused()).toBe("after"));
    // An outer change is cancelled, then focus goes into the inner row and
    // back: the outer row's stop is its selected chip again.
    nested.set?.({ outerCancel: true });
    await settle();
    chip("a").focus();
    await press("{ArrowRight}");
    await eventually(() => expect(focused()).toBe("b"));
    await expect(nested.changes).toEqual(["outer:b"]);
    await expect(outerChecked()).toEqual(["a"]);
    await user.keyboard("{Tab}");
    await eventually(() => expect(focused()).toBe("x"));
    await expect(nested.changes).toEqual(["outer:b"]);
    await user.keyboard("{Shift>}{Tab}{/Shift}");
    await eventually(() => expect(focused()).toBe("a"));
    await expect(outerChecked()).toEqual(["a"]);
  },
};

// ---------------------------------------------------------------------------
// Changes the row does not render: a child reorders, a host replaces itself
// ---------------------------------------------------------------------------

const local: {
  setOrder?: (order: string[]) => void;
  swap?: () => void;
  set?: (patch: Partial<LocalState>) => void;
  changes: string[];
} = { changes: [] };

interface LocalState {
  controlled: boolean;
  /** The selected chip is explicitly disabled. */
  disabledSelected: boolean;
  generation: number;
  value: string | null;
}

const MemoChip = memo(FilterChip);

/** Reorders stable, memoised chips from its own state: the row does not render. */
function LocalOrder({ disabled }: { disabled: string | null }) {
  const [order, setOrder] = useState(["a", "b", "c"]);
  local.setOrder = (next) => flushSync(() => setOrder(next));
  const elements = useMemo(
    () =>
      Object.fromEntries(
        ["a", "b", "c"].map((v) => [
          v,
          <MemoChip
            count={1}
            data-chip={v}
            disabled={v === disabled}
            key={v}
            value={v}
          >
            {v.toUpperCase()}
          </MemoChip>,
        ])
      ) as Record<string, ReactElement>,
    [disabled]
  );
  return <>{order.map((v) => elements[v])}</>;
}

/** Replaces its own element from its own state: neither chip nor row renders. */
function LocalElement(props: Record<string, unknown>) {
  const [tag, setTag] = useState<"span" | "div">("span");
  local.swap = () =>
    flushSync(() => setTag((v) => (v === "span" ? "div" : "span")));
  return createElement(tag, props);
}

function LocalChanges({ host }: { host: boolean }) {
  const [state, setState] = useState<LocalState>({
    disabledSelected: false,
    value: null,
    controlled: true,
    generation: 0,
  });
  local.set = (patch) =>
    setState((prev) => ({
      ...prev,
      ...patch,
      generation: prev.generation + 1,
    }));
  const valueProps = state.controlled
    ? { value: state.value }
    : { defaultValue: state.value };
  return (
    <div className="flex flex-col items-start gap-2 p-4">
      <button data-testid="before" type="button">
        before
      </button>
      <FilterChips
        aria-label="Topic"
        key={state.generation}
        onValueChange={(v) => {
          local.changes.push(v);
          if (state.controlled) {
            setState((prev) => ({ ...prev, value: v }));
          }
        }}
        {...valueProps}
      >
        {host ? (
          <>
            <FilterChip
              count={1}
              data-chip="a"
              disabled={state.disabledSelected && state.value === "a"}
              render={<LocalElement />}
              value="a"
            >
              A
            </FilterChip>
            <FilterChip count={1} data-chip="b" value="b">
              B
            </FilterChip>
            <FilterChip count={1} data-chip="c" value="c">
              C
            </FilterChip>
          </>
        ) : (
          <LocalOrder disabled={state.disabledSelected ? state.value : null} />
        )}
      </FilterChips>
      <button data-testid="after" type="button">
        after
      </button>
    </div>
  );
}

const localTools = (canvasElement: HTMLElement) => {
  const user = realUser() as RealUser;
  const chip = (v: string) =>
    canvasElement.querySelector(`[data-chip="${v}"]`) as HTMLElement;
  const focused = () => {
    const el = document.activeElement as HTMLElement | null;
    return el?.dataset.chip ?? el?.dataset.testid ?? "body";
  };
  const before = canvasElement.querySelector(
    '[data-testid="before"]'
  ) as HTMLElement;
  const after = canvasElement.querySelector(
    '[data-testid="after"]'
  ) as HTMLElement;
  return { user, chip, focused, before, after };
};

/**
 * A component between the row and its chips reorders memoised chips; a Tab
 * pressed at once lands on the new entry target, and arrows follow the new
 * order.
 */
export const ChildReorder: Story = {
  tags: TEST_ONLY,
  name: "Child Reorder",
  render: () => <LocalChanges host={false} />,
  play: async ({ canvasElement }) => {
    if (!needsRealInput()) {
      return;
    }
    const { user, chip, focused, before, after } = localTools(canvasElement);
    const states: [string, Partial<LocalState>, string, string][] = [
      // label, row state, entry after c,a,b / after b,c,a
      ["no value", { value: null }, "c", "b"],
      ["unmatched value", { value: "zzz" }, "c", "b"],
      ["selected b", { value: "b" }, "b", "b"],
      ["disabled selected a", { value: "a", disabledSelected: true }, "c", "b"],
    ];
    for (const controlled of [true, false]) {
      for (const [label, patch, first, second] of states) {
        local.set?.({ controlled, disabledSelected: false, ...patch });
        // biome-ignore lint/performance/noAwaitInLoops: one case at a time, in order
        await settle();
        before.focus();
        local.setOrder?.(["c", "a", "b"]);
        await user.keyboard("{Tab}");
        await eventually(() =>
          expect(`${label} Tab ${focused()}`).toBe(`${label} Tab ${first}`)
        );
        after.focus();
        local.setOrder?.(["b", "c", "a"]);
        await user.keyboard("{Shift>}{Tab}{/Shift}");
        await eventually(() =>
          expect(`${label} Shift+Tab ${focused()}`).toBe(
            `${label} Shift+Tab ${second}`
          )
        );
        // Arrows follow the new order: b, c, a.
        local.changes.length = 0;
        const order = ["b", "c", "a"].filter(
          (v) => !(patch.disabledSelected && v === patch.value)
        );
        const next = order[(order.indexOf(second) + 1) % order.length];
        await user.keyboard("{ArrowRight}");
        await eventually(() =>
          expect(`${label} arrow ${focused()}`).toBe(`${label} arrow ${next}`)
        );
        await eventually(() => expect(local.changes).toEqual([next]));
        await expect(chip(next as string)).toHaveAttribute(
          "aria-checked",
          "true"
        );
        local.setOrder?.(["a", "b", "c"]);
      }
    }
  },
};

/**
 * A chip's render component replaces its own element: Tab and Shift+Tab at
 * once land on the new element, arrows through it select, and replacing
 * the focused element moves focus to the entry target without a change.
 */
export const HostReplacesItself: Story = {
  tags: TEST_ONLY,
  name: "Host Replaces Itself",
  render: () => <LocalChanges host />,
  play: async ({ canvasElement }) => {
    if (!needsRealInput()) {
      return;
    }
    const { user, chip, focused, before, after } = localTools(canvasElement);
    // Every entry state: the host swaps itself, then Tab and Shift+Tab at
    // once; an arrow afterwards selects through the current element.
    const states: [string, Partial<LocalState>, string, string, string][] = [
      // label, row state, entry, arrow keys, chip they select
      ["no value", { value: null }, "a", "{ArrowRight}{ArrowLeft}", "a"],
      [
        "unmatched value",
        { value: "zzz" },
        "a",
        "{ArrowRight}{ArrowLeft}",
        "a",
      ],
      ["selected b", { value: "b" }, "b", "{ArrowLeft}", "a"],
      [
        "disabled selected a",
        { value: "a", disabledSelected: true },
        "b",
        "{ArrowLeft}",
        "c",
      ],
    ];
    for (const controlled of [true, false]) {
      for (const [label, patch, entry, keys, selects] of states) {
        local.set?.({ controlled, disabledSelected: false, ...patch });
        // biome-ignore lint/performance/noAwaitInLoops: one case at a time, in order
        await settle();
        local.changes.length = 0;
        before.focus();
        local.swap?.();
        await user.keyboard("{Tab}");
        await eventually(() =>
          expect(`${label} Tab ${focused()}`).toBe(`${label} Tab ${entry}`)
        );
        after.focus();
        local.swap?.();
        await user.keyboard("{Shift>}{Tab}{/Shift}");
        await eventually(() =>
          expect(`${label} Shift+Tab ${focused()}`).toBe(
            `${label} Shift+Tab ${entry}`
          )
        );
        await expect(local.changes).toEqual([]);
        await user.keyboard(keys);
        await eventually(() =>
          expect(`${label} arrow ${focused()}`).toBe(
            `${label} arrow ${selects}`
          )
        );
        await eventually(() =>
          expect(chip(selects)).toHaveAttribute("aria-checked", "true")
        );
        await expect(local.changes.at(-1)).toBe(selects);
      }
      local.set?.({ controlled, value: null, disabledSelected: false });
      await settle();
      local.changes.length = 0;
      before.focus();
      local.swap?.();
      await user.keyboard("{Tab}");
      await eventually(() => expect(focused()).toBe("a"));
      await expect(chip("a").tagName).toBe("DIV");
      after.focus();
      local.swap?.();
      await user.keyboard("{Shift>}{Tab}{/Shift}");
      await eventually(() => expect(focused()).toBe("a"));
      await expect(chip("a").tagName).toBe("SPAN");
      await expect(local.changes).toEqual([]);
      // Arrows into and out of a replaced element select.
      await user.keyboard("{ArrowRight}");
      await eventually(() => expect(focused()).toBe("b"));
      local.swap?.();
      await user.keyboard("{ArrowLeft}");
      await eventually(() => expect(focused()).toBe("a"));
      await eventually(() =>
        expect(chip("a")).toHaveAttribute("aria-checked", "true")
      );
      await expect(local.changes).toEqual(["b", "a"]);
      // The focused, selected element is replaced: focus goes to the new
      // element of the selected chip, nothing is reported.
      local.changes.length = 0;
      local.swap?.();
      await eventually(() => expect(focused()).toBe("a"));
      await settle();
      await expect(local.changes).toEqual([]);
      // The focused, unselected element is replaced: focus goes to the
      // selected chip.
      local.set?.({ controlled, value: "b" });
      await settle();
      local.changes.length = 0;
      chip("a").focus();
      await eventually(() => expect(focused()).toBe("a"));
      local.swap?.();
      await eventually(() => expect(focused()).toBe("b"));
      await settle();
      await expect(local.changes).toEqual([]);
      await expect(chip("b")).toHaveAttribute("aria-checked", "true");
    }
  },
};

// ---------------------------------------------------------------------------
// Entry, removal and recovery, as the browser does them
// ---------------------------------------------------------------------------

/** Empty and all-unavailable rows have no stop; a chip added later gets one only if available. */
export const EmptyRows: Story = {
  tags: TEST_ONLY,
  name: "Empty Rows",
  ...fixture(async (t) => {
    for (const controlled of [true, false]) {
      for (const chips of [[], FOUR.map((c) => ({ ...c, count: 0 }))]) {
        // biome-ignore lint/performance/noAwaitInLoops: one case at a time, in order
        await t.reset({ controlled, value: null, chips });
        await t.tabIn();
        await eventually(() => expect(t.focused()).toBe("after"));
        await t.shiftTabIn();
        await eventually(() => expect(t.focused()).toBe("before"));
      }
      // An unavailable chip added to a row with no stop: still none.
      await t.reset({ controlled, value: null, chips: [] });
      harness.set?.({ chips: [{ value: "a", count: 0 }] });
      await settle();
      await t.tabIn();
      await eventually(() => expect(t.focused()).toBe("after"));
      await expect(t.chip("a").tabIndex).toBe(-1);
      // An available one: Tab lands on it.
      harness.set?.({
        chips: [
          { value: "a", count: 0 },
          { value: "b", count: 1 },
        ],
      });
      await settle();
      await t.tabIn();
      await eventually(() => expect(t.focused()).toBe("b"));
      await expect(harness.changes).toEqual([]);
    }
  }),
};

/**
 * What Chromium and React do when the focused chip is removed or moved:
 * removal drops focus to the document with a native blur the row never
 * hears, and the row recovers; a keyed move of the focused element keeps
 * its focus.
 */
export const RemovedAndMoved: Story = {
  tags: TEST_ONLY,
  name: "Removed And Moved",
  ...fixture(async (t) => {
    for (const controlled of [true, false]) {
      // biome-ignore lint/performance/noAwaitInLoops: one case at a time, in order
      await t.reset({ controlled, value: null });
      const b = t.chip("b");
      b.focus();
      await eventually(() => expect(t.focused()).toBe("b"));
      let blurs = 0;
      b.addEventListener("blur", () => {
        blurs += 1;
      });
      flushSync(() => harness.set?.({ chips: chipsIn("acd") }));
      await expect(document.activeElement).toBe(document.body);
      await expect(b.isConnected).toBe(false);
      await expect(blurs).toBe(1);
      await eventually(() => expect(t.focused()).toBe("a"));
      await settle();
      await expect(harness.changes).toEqual([]);
      // React moves `a` itself for a,b,c,d -> b,c,d,a.
      await t.reset({ controlled, value: null });
      const a = t.chip("a");
      a.focus();
      await eventually(() => expect(t.focused()).toBe("a"));
      let moved = 0;
      a.addEventListener("blur", () => {
        moved += 1;
      });
      flushSync(() => harness.set?.({ chips: chipsIn("bcda") }));
      await expect(t.chip("a")).toBe(a);
      await expect(document.activeElement).toBe(a);
      await expect(moved).toBe(1);
      await settle();
      await expect(t.focused()).toBe("a");
      await expect(harness.changes).toEqual([]);
      // Arrows still follow the new order from the moved chip.
      await t.user.keyboard("{ArrowRight}");
      await eventually(() => expect(t.focused()).toBe("b"));
      await expect(harness.changes).toEqual(["b"]);
    }
  }),
};

/**
 * Recovery only follows a new loss of focus: not a deliberate exit, not a
 * focus the page took, not a loss with nowhere to go; a hidden focused chip
 * hands focus to the entry target; unmounting cancels it.
 */
export const RecoveryRules: Story = {
  tags: TEST_ONLY,
  name: "Recovery Rules",
  ...fixture(async (t) => {
    for (const controlled of [true, false]) {
      // Focus leaves on purpose, then the chip that had it is removed.
      // biome-ignore lint/performance/noAwaitInLoops: one case at a time, in order
      await t.reset({ controlled, value: null });
      t.chip("a").focus();
      t.after.focus();
      t.after.blur();
      harness.set?.({ chips: chipsIn("bcd") });
      await settle();
      await expect(t.focused()).toBe("body");
      // The page takes focus in the same task as the removal, then lets it
      // go; a later change the row observes does not pull focus back.
      await t.reset({ controlled, value: null });
      t.chip("a").focus();
      flushSync(() => harness.set?.({ chips: chipsIn("bcd") }));
      t.after.focus();
      await settle();
      await expect(t.focused()).toBe("after");
      t.after.blur();
      harness.set?.({ label: "Topic again" });
      harness.set?.({ chips: chipsIn("bcda") });
      await settle();
      await expect(t.focused()).toBe("body");
      // A loss with nowhere to go is consumed: a chip that becomes
      // available later does not take focus.
      await t.reset({
        controlled,
        value: null,
        chips: [
          { value: "a", count: 3 },
          { value: "b", count: 0 },
        ],
      });
      t.chip("a").focus();
      harness.set?.({ chips: [{ value: "b", count: 0 }] });
      await eventually(() => expect(t.focused()).toBe("body"));
      harness.set?.({ chips: [{ value: "b", count: 2 }] });
      await settle();
      harness.set?.({ chips: [{ value: "b", count: 2 }, FOUR[2] as ChipSpec] });
      await settle();
      await expect(t.focused()).toBe("body");
      // The focused chip is hidden: focus goes to the entry target and
      // nothing is selected.
      await t.reset({ controlled, value: null });
      t.chip("b").focus();
      await eventually(() => expect(t.focused()).toBe("b"));
      harness.set?.({
        chips: FOUR.map((c) => (c.value === "b" ? { ...c, hide: true } : c)),
      });
      await eventually(() => expect(t.focused()).toBe("a"));
      await settle();
      await expect(harness.changes).toEqual([]);
      await expect(t.checked()).toBe("");
      // The focused chip is hidden and the page moves focus on in the same
      // task: the page keeps it.
      await t.reset({ controlled, value: null });
      t.chip("b").focus();
      await eventually(() => expect(t.focused()).toBe("b"));
      flushSync(() =>
        harness.set?.({
          chips: FOUR.map((c) => (c.value === "b" ? { ...c, hide: true } : c)),
        })
      );
      t.after.focus();
      await expect(t.focused()).toBe("after");
      await settle();
      await expect(t.focused()).toBe("after");
      await expect(harness.changes).toEqual([]);
      // Focus leaves a chip for the page itself, then that chip is removed:
      // nothing takes focus: during that blur the active element is the
      // page, so the record is not kept.
      await t.reset({ controlled, value: null });
      t.chip("b").focus();
      await eventually(() => expect(t.focused()).toBe("b"));
      t.chip("b").blur();
      await expect(t.focused()).toBe("body");
      harness.set?.({ chips: chipsIn("acd") });
      await settle();
      await expect(t.focused()).toBe("body");
      // The row unmounts in the task that removes its focused chip.
      await t.reset({ controlled, value: null });
      t.chip("a").focus();
      flushSync(() => harness.set?.({ chips: chipsIn("bcd") }));
      flushSync(() => harness.set?.({ mounted: false }));
      await settle();
      await expect(t.focused()).toBe("body");
      await expect(harness.changes).toEqual([]);
    }
  }),
};

// ---------------------------------------------------------------------------
// Hidden chips: inside the row, by an ancestor, by a stylesheet, by width
// ---------------------------------------------------------------------------

/** Runs `check` with a stylesheet rule in the document. */
async function withRule(rule: string, check: () => Promise<void>) {
  const style = document.createElement("style");
  style.textContent = rule;
  document.head.append(style);
  try {
    await check();
  } finally {
    style.remove();
  }
}

/**
 * A hidden chip is skipped by Tab and arrows but keeps its selection; the
 * Tab stop follows stylesheets, ancestors outside the row and the viewport
 * width at the moment Tab is pressed.
 */
export const HiddenChips: Story = {
  tags: TEST_ONLY,
  name: "Hidden Chips",
  ...fixture(async (t) => {
    const hiddenA: [string, Pick<typeof harness, "chipProps" | "rowProps">][] =
      [
        [
          "hidden attribute",
          { chipProps: (v) => (v === "a" ? { hidden: true } : {}) },
        ],
        [
          "inline style",
          {
            chipProps: (v) => (v === "a" ? { style: { display: "none" } } : {}),
          },
        ],
        [
          "visibility",
          {
            chipProps: (v) =>
              v === "a" ? { style: { visibility: "hidden" } } : {},
          },
        ],
        ["inert", { chipProps: (v) => (v === "a" ? { inert: true } : {}) }],
      ];
    for (const [label, hooks] of hiddenA) {
      // biome-ignore lint/performance/noAwaitInLoops: one case at a time, in order
      await t.reset({ value: null }, hooks);
      await t.tabIn();
      await eventually(() =>
        expect(`${label} ${t.focused()}`).toBe(`${label} b`)
      );
      await t.user.keyboard("{ArrowLeft}");
      await eventually(() =>
        expect(`${label} left ${t.focused()}`).toBe(`${label} left d`)
      );
      await t.user.keyboard("{ArrowRight}");
      await eventually(() => expect(t.focused()).toBe("b"));
      await expect(harness.changes).toEqual(["d", "b"]);
    }
    // A hidden selected chip stays selected; Tab goes to the first visible.
    await t.reset({ value: "a" }, hiddenA[1]?.[1]);
    await t.tabIn();
    await eventually(() => expect(t.focused()).toBe("b"));
    await expect(t.checked()).toBe("a");
    await expect(t.chip("a")).toHaveAttribute("data-selected");
    await expect(harness.changes).toEqual([]);
    // Stylesheet rules that no observer sees, both ways in.
    for (const rule of ["visibility: hidden", "display: none"]) {
      // biome-ignore lint/performance/noAwaitInLoops: one case at a time, in order
      await t.reset({ value: null });
      await withRule(`[data-chip="a"] { ${rule} }`, async () => {
        await t.tabIn();
        await eventually(() =>
          expect(`${rule} ${t.focused()}`).toBe(`${rule} b`)
        );
      });
      await t.shiftTabIn();
      await eventually(() => expect(t.focused()).toBe("a"));
    }
    // An ancestor outside the row hides one chip through a class.
    await t.reset({ value: null });
    const page = t.before.parentElement?.parentElement as HTMLElement;
    await withRule('.ks-hide-a [data-chip="a"] { display: none }', async () => {
      page.classList.add("ks-hide-a");
      try {
        await t.tabIn();
        await eventually(() => expect(t.focused()).toBe("b"));
        await t.user.keyboard("{ArrowLeft}");
        await eventually(() => expect(t.focused()).toBe("d"));
      } finally {
        page.classList.remove("ks-hide-a");
      }
    });
    // Without checkVisibility the row reads the chip's own display: a chip
    // hidden by its own style is skipped; one hidden only by an ancestor
    // is not detected (the stated limit of that fallback).
    const original = Object.getOwnPropertyDescriptor(
      Element.prototype,
      "checkVisibility"
    );
    try {
      Object.defineProperty(Element.prototype, "checkVisibility", {
        configurable: true,
        value: undefined,
      });
      await t.reset({ value: null }, hiddenA[1]?.[1]);
      await t.tabIn();
      await eventually(() => expect(t.focused()).toBe("b"));
    } finally {
      if (original) {
        Object.defineProperty(Element.prototype, "checkVisibility", original);
      }
    }
    // An element inside the row that holds only chip a is hidden: Tab and
    // arrows skip a, whose own display is unchanged.
    const wrapA = (wrap: CSSProperties) =>
      FOUR.map((c) => (c.value === "a" ? { ...c, wrap } : c));
    for (const wrap of [
      { display: "none" },
      { visibility: "hidden" },
    ] as const) {
      // biome-ignore lint/performance/noAwaitInLoops: one case at a time, in order
      await t.reset({ value: null, chips: wrapA(wrap) });
      await expect(getComputedStyle(t.chip("a")).display).not.toBe("none");
      await t.tabIn();
      await eventually(() =>
        expect(`${JSON.stringify(wrap)} ${t.focused()}`).toBe(
          `${JSON.stringify(wrap)} b`
        )
      );
      await t.user.keyboard("{ArrowLeft}");
      await eventually(() => expect(t.focused()).toBe("d"));
      await expect(harness.changes).toEqual(["d"]);
    }
    // Without checkVisibility the fallback reads the chip's own display, so
    // a chip hidden only by an ancestor's display is not detected: the row
    // keeps it as the stop, the browser cannot focus it, and Tab passes the
    // row; an arrow towards it moves nothing. Inherited visibility is still
    // read.
    const native = Object.getOwnPropertyDescriptor(
      Element.prototype,
      "checkVisibility"
    );
    try {
      Object.defineProperty(Element.prototype, "checkVisibility", {
        configurable: true,
        value: undefined,
      });
      await t.reset({ value: null, chips: wrapA({ display: "none" }) });
      await t.tabIn();
      await eventually(() =>
        expect(`fallback ${t.focused()}`).toBe("fallback after")
      );
      t.chip("b").focus();
      await t.user.keyboard("{ArrowLeft}");
      await settle();
      await expect(t.focused()).toBe("b");
      await expect(harness.changes).toEqual([]);
      await t.reset({ value: null, chips: wrapA({ visibility: "hidden" }) });
      await t.tabIn();
      await eventually(() => expect(t.focused()).toBe("b"));
    } finally {
      if (native) {
        Object.defineProperty(Element.prototype, "checkVisibility", native);
      }
    }
    // The focused chip is hidden by its ancestor: focus goes to the entry
    // target, nothing is selected.
    await t.reset({ value: null, chips: wrapA({}) });
    t.chip("a").focus();
    await eventually(() => expect(t.focused()).toBe("a"));
    harness.set?.({ chips: wrapA({ display: "none" }) });
    await eventually(() => expect(t.focused()).toBe("b"));
    await settle();
    await expect(harness.changes).toEqual([]);
    // A change committed by a later listener of the same Tab key is outside
    // the snapshot the row reads at its capture listener; only that snapshot
    // is promised. Measured here: the row's observer runs between the
    // listeners and the new stop is committed before the browser moves
    // focus, so Tab lands on b.
    await t.reset({ value: null });
    const hideOnTab = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Tab") {
        flushSync(() =>
          harness.set?.({
            chips: FOUR.map((c) =>
              c.value === "a" ? { ...c, hide: true } : c
            ),
          })
        );
      }
    };
    document.addEventListener("keydown", hideOnTab);
    try {
      await t.tabIn();
      await eventually(() =>
        expect(`same dispatch ${t.focused()}`).toBe("same dispatch b")
      );
    } finally {
      document.removeEventListener("keydown", hideOnTab);
    }
    // content-visibility: auto is not hiding: the chip stays a stop.
    await t.reset(
      { value: null },
      {
        chipProps: (v) =>
          v === "a" ? { style: { contentVisibility: "auto" } } : {},
      }
    );
    await t.tabIn();
    await eventually(() => expect(t.focused()).toBe("a"));
    // The viewport narrows past a media query that hides a chip.
    const frame = window.frameElement as HTMLIFrameElement | null;
    await expect(frame).not.toBeNull();
    if (!frame) {
      return;
    }
    const width = frame.style.width;
    await t.reset(
      { value: null },
      { chipProps: (v) => (v === "a" ? { className: "max-sm:hidden" } : {}) }
    );
    try {
      frame.style.width = "500px";
      await eventually(() =>
        expect(getComputedStyle(t.chip("a")).display).toBe("none")
      );
      await t.tabIn();
      await eventually(() => expect(t.focused()).toBe("b"));
    } finally {
      frame.style.width = width;
    }
    await eventually(() =>
      expect(getComputedStyle(t.chip("a")).display).not.toBe("none")
    );
    await t.tabIn();
    await eventually(() => expect(t.focused()).toBe("a"));
    await expect(harness.changes).toEqual([]);
  }),
};

// ---------------------------------------------------------------------------
// Hydration, measured in the browser
// ---------------------------------------------------------------------------

function ServerRow() {
  return (
    <FilterChips aria-label="Topic" defaultValue="c">
      {["a", "b", "c", "d"].map((v) => (
        <FilterChip count={1} data-chip={v} key={v} value={v}>
          {v.toUpperCase()}
        </FilterChip>
      ))}
    </FilterChips>
  );
}

/**
 * Server markup has no chip Tab stop. Hydration establishes the selected
 * stop, and arrows then select.
 */
export const Hydration: Story = {
  tags: TEST_ONLY,
  render: () => (
    <div className="flex flex-col items-start gap-2 p-4">
      <button data-testid="before" type="button">
        before
      </button>
      <div data-testid="host" />
      <button data-testid="after" type="button">
        after
      </button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    if (!needsRealInput()) {
      return;
    }
    const user = realUser() as RealUser;
    const host = canvasElement.querySelector(
      '[data-testid="host"]'
    ) as HTMLElement;
    const before = canvasElement.querySelector(
      '[data-testid="before"]'
    ) as HTMLElement;
    const chip = (v: string) =>
      host.querySelector(`[data-chip="${v}"]`) as HTMLElement;
    const focused = () =>
      (document.activeElement as HTMLElement | null)?.dataset.chip;
    const errors: string[] = [];
    const error = console.error;
    console.error = (...args: unknown[]) => {
      errors.push(String(args[0]));
      error(...args);
    };
    let root: ReturnType<typeof hydrateRoot> | undefined;
    try {
      host.innerHTML = renderToString(<ServerRow />);
      const serverStops = ["a", "b", "c", "d"].filter(
        (v) => chip(v).getAttribute("tabindex") === "0"
      );
      await expect(serverStops).toEqual([]);
      before.focus();
      await user.keyboard("{Tab}");
      await expect(document.activeElement).toBe(
        canvasElement.querySelector('[data-testid="after"]')
      );
      before.focus();
      root = hydrateRoot(host, <ServerRow />);
      await user.keyboard("{Tab}");
      await eventually(() => expect(focused()).toBe("c"));
      await user.keyboard("{ArrowRight}");
      await eventually(() => expect(focused()).toBe("d"));
      await eventually(() =>
        expect(chip("d")).toHaveAttribute("aria-checked", "true")
      );
      await expect(errors).toEqual([]);
    } finally {
      root?.unmount();
      console.error = error;
    }
  },
};

// ---------------------------------------------------------------------------
// Cost: 100 chips with nested content
// ---------------------------------------------------------------------------

const cost: { mount?: (on: boolean) => void; commits: number } = {
  commits: 0,
};

function HundredChips() {
  const [on, setOn] = useState(false);
  cost.mount = (next) => flushSync(() => setOn(next));
  return (
    <div className="flex flex-col items-start gap-2 p-4">
      {on ? (
        <Profiler
          id="row"
          onRender={() => {
            cost.commits += 1;
          }}
        >
          <FilterChips aria-label="Hundred">
            {Array.from({ length: 100 }, (_, i) => `v${i}`).map((v) => (
              <FilterChip count={1} data-chip={v} key={v} value={v}>
                <span>
                  <span>{v}</span>
                  <span>
                    <span data-inner={v}>·</span>
                  </span>
                </span>
              </FilterChip>
            ))}
          </FilterChips>
        </Profiler>
      ) : null}
    </div>
  );
}

/**
 * Measures the row's observers on 100 chips: registrations, callbacks and
 * React commits for arrows and for a style written inside a chip every
 * frame, and that nothing keeps running once the writes stop.
 */
export const Cost: Story = {
  tags: TEST_ONLY,
  render: () => <HundredChips />,
  play: async ({ canvasElement }) => {
    if (!needsRealInput()) {
      return;
    }
    const user = realUser() as RealUser;
    const counts = {
      mutationCalls: 0,
      mutationMs: 0,
      resizeCalls: 0,
      resizeMs: 0,
      observed: 0,
    };
    const RealMO = globalThis.MutationObserver;
    const RealRO = globalThis.ResizeObserver;
    globalThis.MutationObserver = class extends RealMO {
      constructor(callback: MutationCallback) {
        super((records, observer) => {
          const start = performance.now();
          callback(records, observer);
          counts.mutationCalls += 1;
          counts.mutationMs += performance.now() - start;
        });
      }
    };
    globalThis.ResizeObserver = class extends RealRO {
      constructor(callback: ResizeObserverCallback) {
        super((entries, observer) => {
          const start = performance.now();
          callback(entries, observer);
          counts.resizeCalls += 1;
          counts.resizeMs += performance.now() - start;
        });
      }
      override observe(target: Element, options?: ResizeObserverOptions) {
        counts.observed += 1;
        super.observe(target, options);
      }
    };
    const frames = (n: number) =>
      new Promise<void>((resolve) => {
        let left = n;
        const tick = () => {
          left -= 1;
          if (left <= 0) {
            resolve();
          } else {
            requestAnimationFrame(tick);
          }
        };
        requestAnimationFrame(tick);
      });
    const snapshot = () => ({ ...counts, commits: cost.commits });
    const chip = (v: string) =>
      canvasElement.querySelector(`[data-chip="${v}"]`) as HTMLElement;
    try {
      cost.commits = 0;
      const mountStart = performance.now();
      cost.mount?.(true);
      const mountMs = performance.now() - mountStart;
      await frames(3);
      const mounted = snapshot();
      // Ten arrows from the middle.
      chip("v50").focus();
      await frames(2);
      const beforeKeys = snapshot();
      const keyStart = performance.now();
      for (let i = 0; i < 10; i++) {
        // biome-ignore lint/performance/noAwaitInLoops: one key at a time
        await user.keyboard("{ArrowRight}");
      }
      const keysMs = performance.now() - keyStart;
      await frames(2);
      const afterKeys = snapshot();
      await expect(document.activeElement).toBe(chip("v60"));
      // A style written inside a chip on 60 frames.
      const inner = chip("v3").querySelector("[data-inner]") as HTMLElement;
      const beforeStyle = snapshot();
      for (let i = 0; i < 60; i++) {
        inner.style.opacity = String((i % 10) / 10);
        // biome-ignore lint/performance/noAwaitInLoops: one frame each
        await frames(1);
      }
      const afterStyle = snapshot();
      await frames(10);
      const idle = snapshot();
      const report = {
        mountMs: Number(mountMs.toFixed(1)),
        mounted,
        keys: {
          ms: Number(keysMs.toFixed(1)),
          mutationCalls: afterKeys.mutationCalls - beforeKeys.mutationCalls,
          commits: afterKeys.commits - beforeKeys.commits,
        },
        styleFrames: {
          mutationCalls: afterStyle.mutationCalls - beforeStyle.mutationCalls,
          mutationMs: Number(
            (afterStyle.mutationMs - beforeStyle.mutationMs).toFixed(2)
          ),
          commits: afterStyle.commits - beforeStyle.commits,
        },
        idle: {
          mutationCalls: idle.mutationCalls - afterStyle.mutationCalls,
          resizeCalls: idle.resizeCalls - afterStyle.resizeCalls,
          commits: idle.commits - afterStyle.commits,
        },
      };
      console.log(`filter-chips cost ${JSON.stringify(report)}`);
      // Every chip is observed once.
      await expect(mounted.observed).toBe(100);
      // At most one observer pass per written frame, and at most one React
      // commit in all for a style that changes no Tab stop (measured: one).
      await expect(report.styleFrames.mutationCalls).toBeLessThanOrEqual(60);
      await expect(report.styleFrames.commits).toBeLessThanOrEqual(1);
      // Nothing keeps running once the writes stop.
      await expect(report.idle).toEqual({
        mutationCalls: 0,
        resizeCalls: 0,
        commits: 0,
      });
    } finally {
      cost.mount?.(false);
      globalThis.MutationObserver = RealMO;
      globalThis.ResizeObserver = RealRO;
    }
  },
};

// ---------------------------------------------------------------------------
// The public types. Never rendered: the stories' type check (run in CI)
// fails if a line marked @ts-expect-error starts to compile.
// ---------------------------------------------------------------------------

const functionStyle = () => ({});
const typedChipClass = (state: FilterChipState) =>
  state.selected ? "on" : "off";
const typedRowClass = (state: FilterChipsState) => `size-${state.size}`;
const typedSize: FilterChipsSize = "sm";
const typedRowRef: RefObject<HTMLElement | null> = { current: null };
const typedChipRef: RefObject<HTMLDivElement | null> = { current: null };
const typedRowRender: FilterChipsRenderProp<FilterChipsState> = (props) => (
  <div {...props} />
);
const typedChipRender: FilterChipsRenderProp<FilterChipState> = (props) => (
  <div {...props} />
);
const wrongStateRender: FilterChipsRenderProp<FilterChipState> = (
  props,
  state
) => (
  // @ts-expect-error a chip's state has no `checked`
  <div {...props} data-checked={state.checked} />
);

export const typeContract = [
  // @ts-expect-error a form name is not part of the row's contract
  <FilterChips aria-label="Topic" key="name" name="topic" />,
  // @ts-expect-error nor is `required`
  <FilterChips aria-label="Topic" key="required" required />,
  // @ts-expect-error nor is `inputRef`
  <FilterChips aria-label="Topic" inputRef={null} key="inputRef" />,
  // @ts-expect-error a function style would receive the primitive's state
  <FilterChips aria-label="Topic" key="style" style={functionStyle} />,
  // @ts-expect-error a chip renders no native button
  <FilterChip key="nativeButton" nativeButton value="a" />,
  // @ts-expect-error nor takes an input ref
  <FilterChip inputRef={null} key="chip-inputRef" value="a" />,
  // @ts-expect-error the row owns every chip's tab stop
  <FilterChip key="tabIndex" tabIndex={0} value="a" />,
  // @ts-expect-error a function style would receive the primitive's state
  <FilterChip key="chip-style" style={functionStyle} value="a" />,
  // @ts-expect-error the row owns its one Tab stop
  <FilterChips aria-label="Topic" key="row-tabIndex" tabIndex={0} />,
  <FilterChips
    aria-label="Topic"
    key="row-ref"
    ref={typedRowRef}
    render={typedRowRender}
  >
    <FilterChip ref={typedChipRef} render={typedChipRender} value="a" />
  </FilterChips>,
  <FilterChip key="wrong-state" render={wrongStateRender} value="a" />,
  <FilterChips
    aria-label="Topic"
    className={typedRowClass}
    key="row"
    size={typedSize}
    style={{ opacity: 1 }}
  >
    <FilterChip className={typedChipClass} style={{ opacity: 1 }} value="a" />
  </FilterChips>,
];
