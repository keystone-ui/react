import { buttonVariants } from "@keystoneui/react/button";
import { FilterChip, FilterChips } from "@keystoneui/react/filter-chips";
import { Reel, type ReelProps } from "@keystoneui/react/reel";
import { cn } from "@keystoneui/react/utils";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  BookOpen,
  Clapperboard,
  Gamepad2,
  LayoutGrid,
  type LucideIcon,
  Music,
  Newspaper,
  Palette,
  Sparkles,
  Trophy,
} from "lucide-react";
import { type ReactNode, StrictMode, useState } from "react";
import { expect, waitFor, within } from "storybook/test";

const meta = {
  title: "Components/Reel",
  component: Reel,
  // The row is required; every story renders its own.
  args: { children: <ul /> },
  excludeStories: ["typeContract"],
  parameters: {
    docs: {
      description: {
        component: `
A native sideways scroller for one row of controls: the edges fade where there is more to scroll, and on a device with a mouse or trackpad an arrow appears at each end that has more.

\`\`\`tsx
import { Reel } from "@keystoneui/react/reel";

<nav aria-label="Categories">
  <Reel>
    <ul className="mx-auto flex w-max gap-1">{links}</ul>
  </Reel>
</nav>
\`\`\`

- Exactly one child: the row. The Reel adds no semantics; the label, the list and the current item are yours.
- Arrows are never Tab stops and are hidden from assistive technology; a press on one never takes focus.
- When the Reel gains room or a different item becomes current, Reel reveals the current item (\`aria-current\` or FilterChips' \`data-selected\`) if the Reel's last measured content width and the item's bounding-box width are both positive, without moving focus or scrolling the page. Giving the item width later does not trigger a reveal.

The behaviour tests are hidden from the sidebar and this page; they still run in Vitest.
`,
      },
    },
  },
} satisfies Meta<typeof Reel>;

export default meta;
type Story = StoryObj<typeof meta>;

// Behaviour tests: out of the sidebar and the docs page, still run by Vitest.
const TEST_ONLY: Story["tags"] = ["!dev", "!autodocs"];

interface Category {
  href: string;
  icon: LucideIcon;
  label: string;
  value: string;
}

const CATEGORIES: Category[] = [
  { href: "#all", icon: LayoutGrid, label: "All", value: "all" },
  { href: "#featured", icon: Sparkles, label: "Featured", value: "featured" },
  { href: "#games", icon: Gamepad2, label: "Games", value: "games" },
  { href: "#music", icon: Music, label: "Music", value: "music" },
  { href: "#film", icon: Clapperboard, label: "Film & TV", value: "film" },
  { href: "#books", icon: BookOpen, label: "Books", value: "books" },
  { href: "#sport", icon: Trophy, label: "Sport", value: "sport" },
  { href: "#art", icon: Palette, label: "Art & Design", value: "art" },
  { href: "#news", icon: Newspaper, label: "News", value: "news" },
];

function CategoryLinks({
  arrows,
  current = "#all",
  items = CATEGORIES,
  label = "Categories",
  testId,
}: {
  arrows?: ReelProps["arrows"];
  current?: string;
  items?: Category[];
  label?: string;
  testId?: string;
}) {
  return (
    <nav aria-label={label} data-testid={testId}>
      <Reel arrows={arrows}>
        <ul className="mx-auto flex w-max gap-1">
          {items.map((item) => {
            const isCurrent = item.href === current;
            return (
              <li key={item.href}>
                <a
                  aria-current={isCurrent ? "page" : undefined}
                  className={cn(
                    buttonVariants({
                      variant: isCurrent ? "secondary" : "ghost",
                    }),
                    "rounded-full",
                    !isCurrent && "text-muted-foreground hover:text-foreground"
                  )}
                  href={item.href}
                  onClick={(event) => event.preventDefault()}
                >
                  <item.icon aria-hidden="true" />
                  {item.label}
                </a>
              </li>
            );
          })}
        </ul>
      </Reel>
    </nav>
  );
}

function CategoryChips({
  initial = "all",
  label = "Filter by category",
  restyled = false,
  testId,
}: {
  initial?: string;
  label?: string;
  restyled?: boolean;
  testId?: string;
}) {
  const [value, setValue] = useState(initial);
  return (
    <div data-testid={testId}>
      <Reel>
        <FilterChips
          aria-label={label}
          className={cn("mx-auto w-max flex-nowrap", restyled && "gap-1")}
          onValueChange={setValue}
          size={restyled ? "lg" : "default"}
          value={value}
        >
          {CATEGORIES.map((item) => (
            <FilterChip
              className={
                restyled
                  ? ({ selected }) =>
                      selected
                        ? "border-transparent bg-secondary text-secondary-foreground"
                        : "border-transparent bg-transparent text-muted-foreground shadow-none hover:text-foreground dark:bg-transparent"
                  : undefined
              }
              key={item.value}
              value={item.value}
            >
              <item.icon aria-hidden="true" />
              {item.label}
            </FilterChip>
          ))}
        </FilterChips>
      </Reel>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stories that mirror the docs demos
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: () => (
    <div className="w-full max-w-lg">
      <CategoryLinks />
    </div>
  ),
};

export const WithFilterChips: Story = {
  render: () => (
    <div className="w-full max-w-lg">
      <CategoryChips />
    </div>
  ),
};

export const CustomChips: Story = {
  render: () => (
    <div className="w-full max-w-lg">
      <CategoryChips label="Filter by category" restyled />
    </div>
  ),
};

export const Rtl: Story = {
  name: "RTL",
  render: () => (
    <div className="w-full max-w-lg" dir="rtl">
      <CategoryLinks />
    </div>
  ),
};

/** A row on its own muted track, as tabs are: the plain arrows' use case. */
function TrackRow({
  arrows = "always",
  testId,
}: {
  arrows?: ReelProps["arrows"];
  testId?: string;
}) {
  return (
    <nav aria-label="Sections" data-testid={testId}>
      <Reel arrowVariant="plain" arrows={arrows}>
        <ul className="flex w-max gap-1 rounded-lg bg-muted p-1">
          {CATEGORIES.map((item, index) => (
            <li key={item.href}>
              <a
                aria-current={index === 0 ? "page" : undefined}
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  index === 0
                    ? "bg-background text-foreground shadow-sm hover:bg-background"
                    : "text-muted-foreground hover:text-foreground"
                )}
                href={item.href}
                onClick={(event) => event.preventDefault()}
              >
                <item.icon aria-hidden="true" />
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </Reel>
    </nav>
  );
}

export const PlainArrows: Story = {
  render: () => (
    <div className="w-full max-w-md">
      <TrackRow />
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Real-browser fixtures: one story per behaviour of the design
// ---------------------------------------------------------------------------

type RealUser = typeof import("vitest/browser").userEvent;

/** The custom browser commands registered in vitest.config.ts. */
interface RealCommands {
  emulateReducedMotion: (reduce: boolean) => Promise<void>;
  pointerDown: () => Promise<void>;
  pointerMoveAway: () => Promise<void>;
  pointerMoveTo: (selector: string) => Promise<void>;
  pointerUp: () => Promise<void>;
  screenshotBase64: (selector: string) => Promise<string>;
  wheelOver: (
    selector: string,
    deltaX: number,
    deltaY: number
  ) => Promise<void>;
}

/** Vitest's real (Playwright) input; absent when Storybook runs the play. */
const realUser = () =>
  (globalThis as { __realUserEvent?: RealUser }).__realUserEvent;
const realCommands = () =>
  (globalThis as { __realCommands?: RealCommands }).__realCommands;

/** A role query option, kept out of story-name scans. */
const named = (accessibleName: string) => ({ name: accessibleName });

const frame = () =>
  new Promise<void>((resolve) =>
    requestAnimationFrame(() => setTimeout(resolve, 0))
  );
const wait = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Polls a read-only check; never touches the DOM. */
const eventually = (check: () => unknown) =>
  waitFor(async () => check(), { timeout: 3000 });

function parts(root: HTMLElement, testId: string) {
  const host = within(root).getByTestId(testId);
  const viewport = host.querySelector(
    '[data-slot="reel-viewport"]'
  ) as HTMLElement;
  const arrow = (side: "start" | "end") =>
    host.querySelector(
      `[data-slot="reel-arrow"][data-side="${side}"]`
    ) as HTMLElement;
  return { arrow, host, viewport };
}

/** Painted and hittable: not `display: none`, not `visibility: hidden`. */
function shown(el: HTMLElement) {
  return el.checkVisibility({ visibilityProperty: true });
}

/** Rendered at all: no `display: none` on it or an ancestor. */
const rendered = (el: HTMLElement) => el.getClientRects().length > 0;

/** What a pointer lands on: the arrow's hit area if it has one, else itself. */
function hitArea(arrow: HTMLElement) {
  const parent = arrow.parentElement as HTMLElement;
  return parent.dataset.side ? parent : arrow;
}

function press(arrow: HTMLElement) {
  hitArea(arrow).click();
}

/** A real mouse click at the arrow's painted centre. */
async function clickPainted(testId: string, side: "start" | "end") {
  const commands = realCommands() as RealCommands;
  await commands.pointerMoveTo(
    `[data-testid="${testId}"] [data-slot="reel-arrow"][data-side="${side}"]`
  );
  await commands.pointerDown();
  await commands.pointerUp();
}

function fade(el: HTMLElement) {
  const style = getComputedStyle(el);
  return {
    start: Number.parseFloat(style.getPropertyValue("--ks-scroll-fade-start")),
    end: Number.parseFloat(style.getPropertyValue("--ks-scroll-fade-end")),
  };
}

const maxScroll = (viewport: HTMLElement) =>
  viewport.scrollWidth - viewport.clientWidth;

/** This Chromium has a mouse: the `pointer` gate opens. */
const finePointer = () =>
  window.matchMedia("(hover: hover) and (pointer: fine)").matches;

/** The `hover: hover` and `pointer: fine` gate the default arrows use. */
const isPointerGate = (rule: CSSRule) =>
  rule instanceof CSSMediaRule &&
  rule.conditionText.includes("hover: hover") &&
  rule.conditionText.includes("pointer: fine");

/** Whether a style rule (or nested declarations under one) applies to `el`. */
function appliesTo(el: HTMLElement, rule: CSSRule, inherited: boolean) {
  if (!(rule instanceof CSSStyleRule)) {
    return inherited;
  }
  try {
    return el.matches(rule.selectorText);
  } catch {
    return false;
  }
}

/**
 * Every `display` the loaded stylesheets give `el`, split by whether the
 * pointer gate encloses the rule: what a touch-primary device would get is
 * the `open` list alone.
 */
function ruleDisplays(el: HTMLElement) {
  const found = { gated: [] as string[], open: [] as string[] };
  const walk = (rules: CSSRuleList, gated: boolean, matches: boolean) => {
    for (const rule of rules) {
      const here = appliesTo(el, rule, matches);
      const display = (rule as CSSStyleRule).style?.display;
      if (here && display) {
        found[gated ? "gated" : "open"].push(display);
      }
      if ("cssRules" in rule) {
        walk(
          (rule as CSSGroupingRule).cssRules,
          gated || isPointerGate(rule),
          here
        );
      }
    }
  };
  for (const sheet of document.styleSheets) {
    walk(sheet.cssRules, false, false);
  }
  return found;
}

// 1. An arrow shows only at an end with more beyond it, and only where the
//    device has a mouse or trackpad.
export const ArrowVisibility: Story = {
  tags: TEST_ONLY,
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="w-[480px]">
        <CategoryLinks label="Start" testId="start" />
      </div>
      <div className="w-[480px]">
        <CategoryLinks label="Middle" testId="middle" />
      </div>
      <div className="w-[480px]">
        <CategoryLinks label="End" testId="end" />
      </div>
      <div className="w-[480px]">
        <CategoryLinks arrows="always" label="Always" testId="always" />
      </div>
      <div className="w-[480px]">
        <CategoryLinks arrows="none" label="None" testId="none" />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    // The gate is a media query in the stylesheet, not a script check. This
    // Chromium has a fine primary pointer, so read the rules that give the
    // arrow its display, split by whether that gate encloses them: outside
    // it (a touch-primary device) the default arrow is `display: none`, and
    // `arrows="always"` is displayed regardless.
    await expect(finePointer()).toBe(true);
    const defaultArrow = hitArea(parts(canvasElement, "start").arrow("end"));
    const alwaysArrow = hitArea(parts(canvasElement, "always").arrow("end"));
    await expect(ruleDisplays(defaultArrow)).toEqual({
      gated: ["inline-flex"],
      open: ["none"],
    });
    await expect(ruleDisplays(alwaysArrow).open).toContain("inline-flex");
    await expect(ruleDisplays(alwaysArrow).open).not.toContain("none");

    const start = parts(canvasElement, "start");
    const middle = parts(canvasElement, "middle");
    const end = parts(canvasElement, "end");
    middle.viewport.scrollLeft = maxScroll(middle.viewport) / 2;
    end.viewport.scrollLeft = maxScroll(end.viewport);

    await eventually(async () => {
      await expect(shown(start.arrow("start"))).toBe(false);
      await expect(shown(start.arrow("end"))).toBe(true);
      await expect(shown(middle.arrow("start"))).toBe(true);
      await expect(shown(middle.arrow("end"))).toBe(true);
      await expect(shown(end.arrow("start"))).toBe(true);
      await expect(shown(end.arrow("end"))).toBe(false);
    });

    // "always" shows like "pointer" here; "none" never renders a box.
    const always = parts(canvasElement, "always");
    await expect(shown(always.arrow("end"))).toBe(true);
    const none = parts(canvasElement, "none");
    await expect(rendered(none.arrow("start"))).toBe(false);
    await expect(rendered(none.arrow("end"))).toBe(false);

    // The arrows sit at the physical ends of the row.
    const box = start.host.getBoundingClientRect();
    const endBox = start.arrow("end").getBoundingClientRect();
    await expect(Math.round(box.right - endBox.right)).toBe(0);
  },
};

// 2. Arrows stay out of the keyboard and screen-reader paths, and a press on
//    one does not take focus.
export const ArrowsOutOfFocusPaths: Story = {
  tags: TEST_ONLY,
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="w-[480px]">
        <CategoryLinks label="Categories" testId="bar" />
      </div>
      <a data-testid="after" href="#after">
        After the bar
      </a>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const bar = parts(canvasElement, "bar");
    const nav = canvas.getByRole("navigation", named("Categories"));

    const both = [bar.arrow("start"), bar.arrow("end")];
    await expect(both.map((arrow) => arrow.tabIndex)).toEqual([-1, -1]);
    // Hidden from assistive technology: inside an aria-hidden subtree.
    await expect(
      both.map((arrow) => arrow.closest('[aria-hidden="true"]') !== null)
    ).toEqual([true, true]);
    await expect(within(nav).queryAllByRole("button")).toHaveLength(0);
    await expect(within(nav).getAllByRole("link")).toHaveLength(9);

    const user = realUser();
    if (!user) {
      return;
    }
    // Tab from the first link to past the bar: nine stops, all links.
    const links = within(nav).getAllByRole("link");
    links[0].focus();
    const stops: string[] = [];
    for (const _link of links) {
      stops.push((document.activeElement as HTMLElement).dataset.slot ?? "a");
      // biome-ignore lint/performance/noAwaitInLoops: one key at a time
      await user.keyboard("{Tab}");
    }
    await expect(stops.every((slot) => slot !== "reel-arrow")).toBe(true);
    await expect(document.activeElement).toBe(canvas.getByTestId("after"));

    // A real press on the end arrow scrolls and leaves focus where it was.
    links[1].focus();
    await eventually(() => expect(shown(bar.arrow("end"))).toBe(true));
    await clickPainted("bar", "end");
    await eventually(() => expect(bar.viewport.scrollLeft).toBeGreaterThan(0));
    await expect(document.activeElement).toBe(links[1]);
    (document.activeElement as HTMLElement).blur();
    await eventually(() => expect(shown(bar.arrow("start"))).toBe(true));
    await clickPainted("bar", "start");
    await expect(document.activeElement).toBe(document.body);
  },
};

// 3. One arrow press scrolls 80% of the visible width.
export const ArrowPage: Story = {
  tags: TEST_ONLY,
  render: () => (
    <div className="w-[480px]">
      <CategoryLinks testId="bar" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const bar = parts(canvasElement, "bar");
    const page = Math.round(bar.viewport.clientWidth * 0.8);
    press(bar.arrow("end"));
    await eventually(() =>
      expect(Math.round(bar.viewport.scrollLeft)).toBe(page)
    );
    press(bar.arrow("start"));
    await eventually(() => expect(Math.round(bar.viewport.scrollLeft)).toBe(0));
  },
};

// 4. The fade is a mask on the content, so it works on any surface: no
//    overlay element, and the faded edge shows the surface itself.
export const MaskFade: Story = {
  tags: TEST_ONLY,
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="w-[480px] bg-muted p-4" data-testid="surface">
        <CategoryLinks
          arrows="none"
          current="#none"
          label="On a muted surface"
          testId="bar"
        />
      </div>
      <div className="w-[480px]">
        <CategoryLinks label="With arrows" testId="arrowed" />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const bar = parts(canvasElement, "bar");
    const reel = bar.host.querySelector('[data-slot="reel"]') as HTMLElement;
    // Only the viewport and the two arrows' hit areas: nothing painted over
    // the row.
    await expect(
      [...reel.children].map((el) => {
        const node = el as HTMLElement;
        return node.dataset.slot ?? `${node.tagName}:${node.dataset.side}`;
      })
    ).toEqual(["reel-viewport", "SPAN:start", "SPAN:end"]);
    await expect(getComputedStyle(bar.viewport).maskImage).toContain(
      "linear-gradient"
    );
    await eventually(async () => {
      await expect(fade(bar.viewport).end).toBeCloseTo(1, 1);
    });
    // 1.5rem without arrows; 3rem where an arrow sits on the fade.
    const arrowed = parts(canvasElement, "arrowed");
    await eventually(async () => {
      await expect(getComputedStyle(bar.viewport).maskImage).toContain(
        "calc(100% - 24px)"
      );
      await expect(getComputedStyle(arrowed.viewport).maskImage).toContain(
        "calc(100% - 48px)"
      );
    });

    const commands = realCommands();
    if (!commands) {
      return;
    }
    // The last pixel column of the viewport, at the height of the row, is
    // the surface colour (the mask hides the link there), and the first is
    // too (no fade at the start, but the 4px padding).
    const base64 = await commands.screenshotBase64('[data-testid="surface"]');
    const pixels = await decode(base64);
    const surface = pixels.at(2, 2);
    const host = within(canvasElement)
      .getByTestId("surface")
      .getBoundingClientRect();
    const scale = pixels.width / host.width;
    const vp = bar.viewport.getBoundingClientRect();
    const y = Math.round((vp.top - host.top + vp.height / 2) * scale);
    const edge = pixels.at(Math.round((vp.right - host.left - 1) * scale), y);
    const difference = [0, 1, 2].map((i) => Math.abs(edge[i] - surface[i]));
    await expect(Math.max(...difference)).toBeLessThanOrEqual(3);
  },
};

async function decode(base64: string) {
  const blob = await (await fetch(`data:image/png;base64,${base64}`)).blob();
  const bitmap = await createImageBitmap(blob);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  ctx.drawImage(bitmap, 0, 0);
  return {
    width: bitmap.width,
    at: (x: number, y: number) => [...ctx.getImageData(x, y, 1, 1).data],
  };
}

// 5. Phone width: the row scrolls inside itself (here by a real horizontal
//    wheel; a phone swipes) and never moves the page; the fade is the cue.
export const PhoneWidth: Story = {
  tags: TEST_ONLY,
  render: () => (
    // The page itself can scroll sideways, so a scroll that chains out of
    // the row would move it.
    <div className="w-[2400px]">
      <div className="w-[375px]">
        <CategoryLinks arrows="none" label="Phone" testId="bar" />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const bar = parts(canvasElement, "bar");
    await expect(maxScroll(bar.viewport)).toBeGreaterThan(0);
    await eventually(() => expect(fade(bar.viewport).end).toBeCloseTo(1, 1));
    await expect([bar.arrow("start"), bar.arrow("end")].map(rendered)).toEqual([
      false,
      false,
    ]);

    const commands = realCommands();
    if (commands) {
      const page = document.scrollingElement as HTMLElement;
      await expect(page.scrollWidth).toBeGreaterThan(page.clientWidth);
      const pageX = window.scrollX;
      // Two wheel turns, each far more than the row can scroll: the first
      // fills the row, and neither may carry on into the page.
      const over = '[data-testid="bar"] [data-slot="reel-viewport"]';
      await commands.wheelOver(over, 2000, 0);
      await eventually(() =>
        expect(Math.round(bar.viewport.scrollLeft)).toBe(
          maxScroll(bar.viewport)
        )
      );
      await wait(300);
      await commands.wheelOver(over, 2000, 0);
      await wait(300);
      await expect(window.scrollX).toBe(pageX);
      await commands.pointerMoveAway();
    }

    const style = getComputedStyle(bar.viewport);
    await expect(style.overflowX).toBe("auto");
    await expect(style.overscrollBehaviorX).toBe("contain");
  },
};

// 6. Keyboard: every item Tab reaches ends clear of the fade (48px from both
//    edges unless it is at the very end of the row), with its focus outline
//    inside the viewport.
export const KeyboardReveal: Story = {
  tags: TEST_ONLY,
  render: () => (
    <div className="w-[480px]">
      <CategoryLinks label="Categories" testId="bar" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const user = realUser();
    if (!user) {
      return;
    }
    const bar = parts(canvasElement, "bar");
    const links = within(
      within(canvasElement).getByRole("navigation", named("Categories"))
    ).getAllByRole("link");
    const failures: string[] = [];
    const check = (direction: string) => {
      const link = document.activeElement as HTMLElement;
      const index = links.indexOf(link);
      const v = bar.viewport.getBoundingClientRect();
      const a = link.getBoundingClientRect();
      const fromStart = a.left - v.left;
      const fromEnd = v.right - a.right;
      const atStart = index === 0;
      const atEnd = index === links.length - 1;
      // The 2px outline sits 2px out: 4px, the viewport's padding.
      const outlineIn = fromStart >= 4 - 0.5 && fromEnd >= 4 - 0.5;
      const clear =
        (atStart || fromStart >= 48 - 0.5) && (atEnd || fromEnd >= 48 - 0.5);
      if (index < 0 || !(outlineIn && clear)) {
        failures.push(
          `${direction} ${link.textContent}: ${fromStart}/${fromEnd}`
        );
      }
    };
    // Forward to the last link, then back to the first.
    links[0].focus();
    for (let i = 0; i < links.length - 1; i++) {
      // biome-ignore lint/performance/noAwaitInLoops: one key at a time
      await user.keyboard("{Tab}");
      await frame();
      check("Tab");
    }
    for (let i = 0; i < links.length - 1; i++) {
      // biome-ignore lint/performance/noAwaitInLoops: one key at a time
      await user.keyboard("{Shift>}{Tab}{/Shift}");
      await frame();
      check("Shift+Tab");
    }
    await expect(document.activeElement).toBe(links[0]);
    await expect(failures).toEqual([]);
    // The focused link's outline is really 2px wide and 2px out.
    const style = getComputedStyle(links[0]);
    await expect(style.outlineWidth).toBe("2px");
    await expect(style.outlineOffset).toBe("2px");
  },
};

function CurrentItemFixture() {
  const [current, setCurrent] = useState("#featured");
  return (
    <div className="flex flex-col gap-4">
      <div className="w-[375px]">
        <CategoryLinks
          arrows="none"
          current="#sport"
          label="Phone"
          testId="links"
        />
      </div>
      <div className="w-[480px]">
        <CategoryChips initial="art" testId="chips" />
      </div>
      <div className="w-[480px]">
        <CategoryLinks current={current} label="Routed" testId="routed" />
      </div>
      {/* Stands in for a route change made elsewhere on the page. */}
      <button
        data-testid="route"
        onClick={() => setCurrent("#news")}
        type="button"
      >
        Go to the last category
      </button>
      {/* Far below the fold: revealing it must not scroll the page. */}
      <div className="mt-[200vh] w-[375px]">
        <CategoryLinks
          arrows="none"
          current="#sport"
          label="Below the fold"
          testId="below"
        />
      </div>
    </div>
  );
}

// 7. The current item is scrolled into view on load without moving focus or
//    the page, and again when it changes later.
export const CurrentItem: Story = {
  tags: TEST_ONLY,
  render: () => <CurrentItemFixture />,
  play: async ({ canvasElement }) => {
    const links = parts(canvasElement, "links");
    const current = links.host.querySelector(
      '[aria-current="page"]'
    ) as HTMLElement;
    const inside = (viewport: HTMLElement, item: HTMLElement) => {
      const v = viewport.getBoundingClientRect();
      const a = item.getBoundingClientRect();
      return a.left >= v.left && a.right <= v.right;
    };
    // Below the fold, before anything is focused (focus scrolls the page):
    // the row scrolled to its current link, the page did not move.
    const below = parts(canvasElement, "below");
    await expect(document.documentElement.scrollHeight).toBeGreaterThan(
      window.innerHeight
    );
    await expect(below.viewport.scrollLeft).toBeGreaterThan(0);
    await expect(window.scrollY).toBe(0);

    await expect(links.viewport.scrollLeft).toBeGreaterThan(0);
    await expect(inside(links.viewport, current)).toBe(true);
    await expect(document.activeElement).toBe(document.body);
    await expect(window.scrollY).toBe(0);

    // Changed from outside the row: the new current link scrolls into view
    // and focus stays on the control that changed it.
    const routed = parts(canvasElement, "routed");
    await expect(routed.viewport.scrollLeft).toBe(0);
    const route = within(canvasElement).getByTestId("route");
    route.focus();
    route.click();
    await eventually(async () => {
      const now = routed.host.querySelector(
        '[aria-current="page"]'
      ) as HTMLElement;
      await expect(now.textContent).toBe("News");
      await expect(inside(routed.viewport, now)).toBe(true);
    });
    await expect(document.activeElement).toBe(route);
    route.blur();

    const chips = parts(canvasElement, "chips");
    const selected = () =>
      chips.host.querySelector("[data-selected]") as HTMLElement;
    await expect(selected().textContent).toBe("Art & Design");
    await expect(inside(chips.viewport, selected())).toBe(true);

    const user = realUser();
    if (!user) {
      return;
    }
    selected().focus();
    await user.keyboard("{ArrowRight}");
    await eventually(async () => {
      await expect(selected().textContent).toBe("News");
      await expect(inside(chips.viewport, selected())).toBe(true);
    });
    await expect(document.activeElement).toBe(selected());
    // Back across the row: the first chip comes into view too.
    await user.keyboard("{ArrowRight}");
    await eventually(async () => {
      await expect(selected().textContent).toBe("All");
      await expect(inside(chips.viewport, selected())).toBe(true);
    });
    await expect(document.activeElement).toBe(selected());
  },
};

// 8. Reduced motion: an arrow press jumps instead of gliding.
function ReducedMotionFixture() {
  const [current, setCurrent] = useState("#all");
  return (
    <div className="flex flex-col gap-4">
      <div className="w-[480px]">
        <CategoryLinks testId="bar" />
      </div>
      <div className="w-[480px]">
        <CategoryLinks current={current} label="Routed" testId="routed" />
      </div>
      <button
        data-testid="to-news"
        onClick={() => setCurrent("#news")}
        type="button"
      >
        News
      </button>
      <button
        data-testid="to-featured"
        onClick={() => setCurrent("#featured")}
        type="button"
      >
        Featured
      </button>
    </div>
  );
}

export const ReducedMotion: Story = {
  tags: TEST_ONLY,
  render: () => <ReducedMotionFixture />,
  play: async ({ canvasElement }) => {
    const commands = realCommands();
    if (!commands) {
      return;
    }
    const bar = parts(canvasElement, "bar");
    const page = Math.round(bar.viewport.clientWidth * 0.8);

    // Smooth by default: one frame in, the row has barely moved.
    press(bar.arrow("end"));
    await frame();
    const smoothAtFrame = Math.round(bar.viewport.scrollLeft);
    await eventually(() =>
      expect(Math.round(bar.viewport.scrollLeft)).toBe(page)
    );
    bar.viewport.scrollLeft = 0;
    await frame();

    await commands.emulateReducedMotion(true);
    try {
      await expect(
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ).toBe(true);
      press(bar.arrow("end"));
      // Read synchronously: an instant scroll has already landed.
      const reducedNow = Math.round(bar.viewport.scrollLeft);
      await expect(reducedNow).toBe(page);
      await expect(smoothAtFrame).toBeLessThan(page);
    } finally {
      await commands.emulateReducedMotion(false);
    }

    // The current item changing from outside: smooth by default, so one
    // frame in the row is still on its way; under reduced motion it has
    // landed one frame in and does not move afterwards.
    const routed = parts(canvasElement, "routed");
    const canvas = within(canvasElement);
    canvas.getByTestId("to-news").click();
    await frame();
    await expect(routed.viewport.scrollLeft).toBeLessThan(
      maxScroll(routed.viewport) - 1
    );
    await eventually(() =>
      expect(
        Math.abs(routed.viewport.scrollLeft - maxScroll(routed.viewport))
      ).toBeLessThanOrEqual(1)
    );

    await commands.emulateReducedMotion(true);
    try {
      canvas.getByTestId("to-featured").click();
      await frame();
      const featured = currentLink(routed.host);
      await expect(featured.textContent).toBe("Featured");
      const v = routed.viewport.getBoundingClientRect();
      const a = featured.getBoundingClientRect();
      await expect(a.left >= v.left && a.right <= v.right).toBe(true);
      const landed = routed.viewport.scrollLeft;
      await wait(300);
      await expect(routed.viewport.scrollLeft).toBe(landed);
    } finally {
      await commands.emulateReducedMotion(false);
    }
  },
};

// 9. Right-to-left: arrows and fades mirror, and the end arrow pages towards
//    the end (a negative scrollLeft).
export const RightToLeft: Story = {
  tags: TEST_ONLY,
  render: () => (
    <div className="w-[480px]" dir="rtl">
      <CategoryLinks label="Categories" testId="bar" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const bar = parts(canvasElement, "bar");
    await eventually(async () => {
      await expect(shown(bar.arrow("end"))).toBe(true);
      await expect(shown(bar.arrow("start"))).toBe(false);
    });
    const box = bar.host.getBoundingClientRect();
    // The end arrow is on the LEFT.
    await expect(
      Math.round(bar.arrow("end").getBoundingClientRect().left - box.left)
    ).toBe(0);
    await expect(getComputedStyle(bar.viewport).maskImage).toContain("to left");
    await eventually(async () => {
      await expect(fade(bar.viewport).start).toBeCloseTo(0, 1);
      await expect(fade(bar.viewport).end).toBeCloseTo(1, 1);
    });

    press(bar.arrow("end"));
    // Within a pixel: right-to-left scroll offsets land on sub-pixels here.
    await eventually(() =>
      expect(
        Math.abs(bar.viewport.scrollLeft + bar.viewport.clientWidth * 0.8)
      ).toBeLessThanOrEqual(1)
    );
    await eventually(async () => {
      await expect(shown(bar.arrow("start"))).toBe(true);
      await expect(fade(bar.viewport).start).toBeCloseTo(1, 1);
    });
    // The start arrow is on the RIGHT, and its chevron points right.
    await expect(
      Math.round(box.right - bar.arrow("start").getBoundingClientRect().right)
    ).toBe(0);
    const svg = bar.arrow("start").querySelector("svg") as SVGElement;
    await expect(getComputedStyle(svg).scale).toBe("-1 1");
  },
};

// 10. When everything fits: no arrows, no fade, and a `mx-auto` row centred.
export const Fits: Story = {
  tags: TEST_ONLY,
  render: () => (
    <div className="w-[1040px]">
      <CategoryLinks items={CATEGORIES.slice(0, 5)} testId="bar" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const bar = parts(canvasElement, "bar");
    await expect(maxScroll(bar.viewport)).toBe(0);
    await eventually(async () => {
      await expect(fade(bar.viewport)).toEqual({ start: 0, end: 0 });
    });
    await expect(shown(bar.arrow("start"))).toBe(false);
    await expect(shown(bar.arrow("end"))).toBe(false);
    const list = bar.viewport.querySelector("ul") as HTMLElement;
    const v = bar.viewport.getBoundingClientRect();
    const l = list.getBoundingClientRect();
    await expect(Math.abs(l.left - v.left - (v.right - l.right))).toBeLessThan(
      1
    );
  },
};

// 11. On resize, arrows appear and disappear with the width.
export const Resize: Story = {
  tags: TEST_ONLY,
  render: () => (
    <div className="w-[1040px]" data-testid="box">
      <CategoryLinks items={CATEGORIES.slice(0, 5)} testId="bar" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const bar = parts(canvasElement, "bar");
    const box = within(canvasElement).getByTestId("box");
    await expect(shown(bar.arrow("end"))).toBe(false);
    box.style.width = "320px";
    await eventually(() => expect(shown(bar.arrow("end"))).toBe(true));
    await expect(shown(bar.arrow("start"))).toBe(false);
    box.style.width = "1040px";
    await eventually(() => expect(shown(bar.arrow("end"))).toBe(false));
  },
};

// An arrow sits on the faded end of the row, so its fill must be opaque in
// both themes, idle and hovered: a translucent fill shows the row through it.
export const OpaqueArrows: Story = {
  tags: TEST_ONLY,
  render: () => (
    <div className="flex flex-col gap-4">
      {(["light", "dark"] as const).map((theme) => (
        <div className={cn(theme, "bg-background p-4")} key={theme}>
          <div className="w-[480px]">
            <CategoryLinks label={theme} testId={theme} />
          </div>
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const alpha = (el: HTMLElement) => {
      // Resolve any colour syntax to rgba through a canvas.
      const ctx = document
        .createElement("canvas")
        .getContext("2d") as CanvasRenderingContext2D;
      ctx.fillStyle = getComputedStyle(el).backgroundColor;
      ctx.fillRect(0, 0, 1, 1);
      return ctx.getImageData(0, 0, 1, 1).data[3];
    };
    const ends = ["light", "dark"].map((theme) =>
      parts(canvasElement, theme).arrow("end")
    );
    await eventually(() => expect(ends.map(shown)).toEqual([true, true]));
    await expect(ends.map(alpha)).toEqual([255, 255]);
    const commands = realCommands();
    if (!commands) {
      return;
    }
    for (const theme of ["light", "dark"]) {
      const arrow = parts(canvasElement, theme).arrow("end");
      // biome-ignore lint/performance/noAwaitInLoops: one pointer, in order
      await commands.pointerMoveTo(
        `[data-testid="${theme}"] [data-slot="reel-arrow"][data-side="end"]`
      );
      await eventually(() =>
        expect(hitArea(arrow).matches(":hover")).toBe(true)
      );
      await wait(300);
      await expect(alpha(arrow)).toBe(255);
    }
    await commands.pointerMoveAway();
  },
};

// ---------------------------------------------------------------------------
// Rows that arrive late, change, or measure differently
// ---------------------------------------------------------------------------

/** The clearance the Reel promises: its fade depth, and at least 48px. */
function clearance(viewport: HTMLElement) {
  const size = getComputedStyle(viewport)
    .getPropertyValue("--ks-scroll-fade-size")
    .trim();
  const root = Number.parseFloat(
    getComputedStyle(document.documentElement).fontSize
  );
  const px = size.endsWith("rem")
    ? Number.parseFloat(size) * root
    : Number.parseFloat(size);
  return Math.max(48, px);
}

/** Left-to-right gaps between an item and the viewport's edges. */
function gaps(viewport: HTMLElement, item: HTMLElement) {
  const v = viewport.getBoundingClientRect();
  const a = item.getBoundingClientRect();
  return { fromStart: a.left - v.left, fromEnd: v.right - a.right };
}

function isClear(viewport: HTMLElement, item: HTMLElement) {
  const { fromStart, fromEnd } = gaps(viewport, item);
  const c = clearance(viewport);
  return fromStart >= c - 0.5 && fromEnd >= c - 0.5;
}

/** A links row whose element identity the fixture controls. */
function LinksRow({
  current,
  items,
  rowKey,
}: {
  current?: string;
  items: Category[];
  rowKey?: string;
}) {
  return (
    <ul className="mx-auto flex w-max gap-1" key={rowKey}>
      {items.map((item) => {
        const isCurrent = item.href === current;
        return (
          <li key={item.href}>
            <a
              aria-current={isCurrent ? "page" : undefined}
              className={cn(
                buttonVariants({ variant: isCurrent ? "secondary" : "ghost" }),
                "rounded-full"
              )}
              href={item.href}
              onClick={(event) => event.preventDefault()}
            >
              {item.label}
            </a>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * A page taller than the viewport with a button outside the Reel, so a play
 * can scroll the page and hold focus elsewhere before the Reel reveals.
 */
function ScrolledPage({ children }: { children: ReactNode }) {
  return (
    <div className="pt-[40vh] pb-[150vh]">
      <button data-testid="outside" type="button">
        Outside the Reel
      </button>
      <div className="mt-4">{children}</div>
    </div>
  );
}

/** Scrolls the page and focuses the outside button; returns what to keep. */
function holdPage(canvasElement: HTMLElement) {
  window.scrollTo(0, 120);
  const outside = within(canvasElement).getByTestId("outside");
  outside.focus({ preventScroll: true });
  return { outside, pageY: window.scrollY };
}

async function expectPageHeld(held: { outside: HTMLElement; pageY: number }) {
  await expect(held.pageY).toBeGreaterThan(0);
  await expect(document.activeElement).toBe(held.outside);
  await expect(window.scrollY).toBe(held.pageY);
}

const currentLink = (host: HTMLElement) =>
  host.querySelector('[aria-current="page"]') as HTMLElement;

// Mounted inside `display: none`, revealed once it is shown.
export const RevealWhenShown: Story = {
  tags: TEST_ONLY,
  render: () => (
    <ScrolledPage>
      <div data-testid="host" style={{ display: "none" }}>
        <div className="w-[375px]">
          <CategoryLinks current="#art" testId="bar" />
        </div>
      </div>
    </ScrolledPage>
  ),
  play: async ({ canvasElement }) => {
    await frame();
    const held = holdPage(canvasElement);
    within(canvasElement).getByTestId("host").style.display = "";
    const bar = parts(canvasElement, "bar");
    await eventually(() =>
      expect(isClear(bar.viewport, currentLink(bar.host))).toBe(true)
    );
    await expectPageHeld(held);
  },
};

function InsertedFixture() {
  const [items, setItems] = useState<Category[]>([]);
  return (
    <ScrolledPage>
      <div className="w-[375px]" data-testid="bar">
        <Reel>
          <LinksRow current="#art" items={items} />
        </Reel>
      </div>
      <button
        data-testid="fill"
        onClick={() => setItems(CATEGORIES)}
        type="button"
      >
        Fill
      </button>
    </ScrolledPage>
  );
}

// The row is filled after mount, its current link already marked.
export const RevealInserted: Story = {
  tags: TEST_ONLY,
  render: () => <InsertedFixture />,
  play: async ({ canvasElement }) => {
    await frame();
    const held = holdPage(canvasElement);
    within(canvasElement).getByTestId("fill").click();
    const bar = parts(canvasElement, "bar");
    await eventually(() =>
      expect(isClear(bar.viewport, currentLink(bar.host))).toBe(true)
    );
    await expectPageHeld(held);
  },
};

function ReplacedFixture() {
  const [row, setRow] = useState<"a" | "b">("a");
  return (
    <ScrolledPage>
      <div className="w-[375px]" data-testid="bar">
        <Reel>
          {row === "a" ? (
            <LinksRow items={CATEGORIES.slice(0, 2)} rowKey="a" />
          ) : (
            <LinksRow current="#art" items={CATEGORIES} rowKey="b" />
          )}
        </Reel>
      </div>
      <button data-testid="swap" onClick={() => setRow("b")} type="button">
        Swap
      </button>
    </ScrolledPage>
  );
}

// The row element is replaced by one holding the current link.
export const RevealReplacedRow: Story = {
  tags: TEST_ONLY,
  render: () => <ReplacedFixture />,
  play: async ({ canvasElement }) => {
    await frame();
    const held = holdPage(canvasElement);
    within(canvasElement).getByTestId("swap").click();
    const bar = parts(canvasElement, "bar");
    await eventually(() =>
      expect(isClear(bar.viewport, currentLink(bar.host))).toBe(true)
    );
    await expectPageHeld(held);
  },
};

function EmptyMarkerFixture() {
  const [mounted, setMounted] = useState(false);
  return (
    <ScrolledPage>
      <div className="w-[375px]" data-testid="bar">
        {mounted ? (
          <Reel>
            <ul className="mx-auto flex w-max gap-1">
              {CATEGORIES.map((item, index) => {
                const marker = ["", "false"][index] ?? undefined;
                return (
                  <li key={item.href}>
                    <a
                      aria-current={
                        item.href === "#art"
                          ? "page"
                          : (marker as "false" | undefined)
                      }
                      className={buttonVariants({ variant: "ghost" })}
                      href={item.href}
                    >
                      {item.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </Reel>
        ) : null}
      </div>
      <button
        data-testid="mount"
        onClick={() => setMounted(true)}
        type="button"
      >
        Mount
      </button>
    </ScrolledPage>
  );
}

// Earlier links marked aria-current="" and "false" do not win.
export const RevealIgnoresEmptyMarkers: Story = {
  tags: TEST_ONLY,
  render: () => <EmptyMarkerFixture />,
  play: async ({ canvasElement }) => {
    await frame();
    const held = holdPage(canvasElement);
    within(canvasElement).getByTestId("mount").click();
    await eventually(() =>
      expect(parts(canvasElement, "bar").viewport).toBeTruthy()
    );
    const bar = parts(canvasElement, "bar");
    // The fixture really has the two empty markers before the current link.
    await expect(
      [...bar.host.querySelectorAll("a")]
        .slice(0, 2)
        .map((a) => a.getAttribute("aria-current"))
    ).toEqual(["", "false"]);
    await eventually(() =>
      expect(isClear(bar.viewport, currentLink(bar.host))).toBe(true)
    );
    await expectPageHeld(held);
  },
};

function UnrelatedUpdateFixture() {
  const [extra, setExtra] = useState(false);
  const items = extra
    ? [...CATEGORIES, { ...CATEGORIES[0], href: "#more", label: "More" }]
    : CATEGORIES;
  return (
    <div className="w-[375px]" data-testid="bar">
      <Reel>
        <LinksRow current="#art" items={items} />
      </Reel>
      <button data-testid="add" onClick={() => setExtra(true)} type="button">
        Add
      </button>
    </div>
  );
}

// An update that does not change the current link leaves the
// user's scroll position alone.
export const NoDragBack: Story = {
  tags: TEST_ONLY,
  render: () => <UnrelatedUpdateFixture />,
  play: async ({ canvasElement }) => {
    const bar = parts(canvasElement, "bar");
    await eventually(() => expect(bar.viewport.scrollLeft).toBeGreaterThan(0));
    bar.viewport.scrollLeft = 0;
    await wait(200);
    within(canvasElement).getByTestId("add").click();
    await wait(400);
    await expect(bar.viewport.scrollLeft).toBe(0);
  },
};

function SwapThenGrowFixture() {
  const [row, setRow] = useState<"a" | "b">("a");
  const [count, setCount] = useState(2);
  return (
    <div className="flex flex-col gap-2">
      <div className="w-[480px]" data-testid="bar">
        <Reel>
          {row === "a" ? (
            <LinksRow items={CATEGORIES.slice(0, 2)} rowKey="a" />
          ) : (
            <LinksRow items={CATEGORIES.slice(2, 2 + count)} rowKey="b" />
          )}
        </Reel>
      </div>
      <button data-testid="swap" onClick={() => setRow("b")} type="button">
        Swap
      </button>
      <button data-testid="grow" onClick={() => setCount(7)} type="button">
        Grow
      </button>
      <button data-testid="shrink" onClick={() => setCount(2)} type="button">
        Shrink
      </button>
    </div>
  );
}

// The size observer follows a replaced row: appending and removing
// links on the new row shows and hides the end arrow, with no scroll.
export const ObservesReplacedRow: Story = {
  tags: TEST_ONLY,
  render: () => <SwapThenGrowFixture />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const bar = parts(canvasElement, "bar");
    canvas.getByTestId("swap").click();
    await wait(300);
    await expect(maxScroll(bar.viewport)).toBe(0);
    await expect(shown(bar.arrow("end"))).toBe(false);
    let scrolled = false;
    bar.viewport.addEventListener("scroll", () => {
      scrolled = true;
    });

    canvas.getByTestId("grow").click();
    await eventually(async () => {
      await expect(maxScroll(bar.viewport)).toBeGreaterThan(0);
      await expect(shown(bar.arrow("end"))).toBe(true);
    });
    await expect(shown(bar.arrow("start"))).toBe(false);

    canvas.getByTestId("shrink").click();
    await eventually(async () => {
      await expect(maxScroll(bar.viewport)).toBe(0);
      await expect(shown(bar.arrow("end"))).toBe(false);
    });
    await expect(scrolled).toBe(false);
  },
};

function MountLaterFixture({ width }: { width: string }) {
  const [mounted, setMounted] = useState(false);
  return (
    <div className="flex flex-col gap-2">
      <div className={width} data-testid="bar">
        {mounted ? (
          <Reel>
            <LinksRow current="#art" items={CATEGORIES} />
          </Reel>
        ) : null}
      </div>
      <button
        data-testid="mount"
        onClick={() => setMounted(true)}
        type="button"
      >
        Mount
      </button>
    </div>
  );
}

/** Runs a play body at a given root font size, restoring it afterwards. */
async function atRootFontSize(px: number, body: () => Promise<void>) {
  const root = document.documentElement;
  const before = root.style.fontSize;
  root.style.fontSize = `${px}px`;
  try {
    await body();
  } finally {
    root.style.fontSize = before;
  }
}

// At a 24px root the fade is 72px deep; the current link and every
// tabbed-to link clear it.
export const ClearanceAt24px: Story = {
  tags: TEST_ONLY,
  render: () => <MountLaterFixture width="w-[640px]" />,
  play: async ({ canvasElement }) => {
    await atRootFontSize(24, async () => {
      within(canvasElement).getByTestId("mount").click();
      await eventually(() =>
        expect(parts(canvasElement, "bar").viewport).toBeTruthy()
      );
      const bar = parts(canvasElement, "bar");
      await expect(clearance(bar.viewport)).toBe(72);
      await eventually(() =>
        expect(isClear(bar.viewport, currentLink(bar.host))).toBe(true)
      );

      const user = realUser();
      if (!user) {
        return;
      }
      const links = [...bar.host.querySelectorAll("a")];
      links[0].focus();
      const failures: string[] = [];
      for (let i = 1; i < links.length; i++) {
        // biome-ignore lint/performance/noAwaitInLoops: one key at a time
        await user.keyboard("{Tab}");
        await frame();
        const link = document.activeElement as HTMLElement;
        const { fromStart, fromEnd } = gaps(bar.viewport, link);
        const last = i === links.length - 1;
        if (fromStart < 72 - 0.5 || (!last && fromEnd < 72 - 0.5)) {
          failures.push(`${link.textContent}: ${fromStart}/${fromEnd}`);
        }
      }
      await expect(failures).toEqual([]);
    });
  },
};

// At a small root the 4px outline allowance is still four pixels on
// all four sides.
export const OutlineAllowanceSmallRoot: Story = {
  tags: TEST_ONLY,
  render: () => <MountLaterFixture width="w-[240px]" />,
  play: async ({ canvasElement }) => {
    await atRootFontSize(10, async () => {
      within(canvasElement).getByTestId("mount").click();
      await eventually(() =>
        expect(parts(canvasElement, "bar").viewport).toBeTruthy()
      );
      const bar = parts(canvasElement, "bar");
      bar.viewport.scrollLeft = 0;
      await frame();
      const links = [...bar.host.querySelectorAll("a")];
      const v = bar.viewport.getBoundingClientRect();
      const first = links[0].getBoundingClientRect();
      bar.viewport.scrollLeft = maxScroll(bar.viewport);
      await frame();
      const last = (links.at(-1) as HTMLElement).getBoundingClientRect();
      // Within half a pixel: scroll offsets land on whole pixels.
      const sides = {
        start: first.left - v.left,
        top: first.top - v.top,
        bottom: v.bottom - first.bottom,
        end: v.right - last.right,
      };
      await expect(
        Object.values(sides).every((gap) => Math.abs(gap - 4) <= 0.5)
      ).toBe(true);
    });
  },
};

function WideItemFixture() {
  const items = [
    ...CATEGORIES.slice(0, 3),
    {
      ...CATEGORIES[3],
      href: "#wide",
      label: "A category with a very long name indeed",
    },
    ...CATEGORIES.slice(4),
  ];
  return (
    <div className="w-[300px]" data-testid="bar">
      <Reel>
        <LinksRow current="#wide" items={items} />
      </Reel>
    </div>
  );
}

// An item wider than the clear band is aligned by its start edge.
export const WideItemAlignsStart: Story = {
  tags: TEST_ONLY,
  render: () => <WideItemFixture />,
  play: async ({ canvasElement }) => {
    const bar = parts(canvasElement, "bar");
    const wide = currentLink(bar.host);
    const c = clearance(bar.viewport);
    await expect(wide.getBoundingClientRect().width).toBeGreaterThan(
      bar.viewport.clientWidth - 2 * c
    );
    // Start-aligned, with the inset capped to the room the item leaves.
    const room = Math.max(
      0,
      bar.viewport.getBoundingClientRect().width -
        wide.getBoundingClientRect().width
    );
    // Within a pixel: scroll offsets land on whole pixels.
    await eventually(() =>
      expect(
        Math.abs(gaps(bar.viewport, wide).fromStart - Math.min(c, room))
      ).toBeLessThanOrEqual(1)
    );
  },
};

// A visible arrow cannot take focus by script either, and a click at
// its painted position still pages and keeps focus where it was.
export const ArrowsRefuseScriptedFocus: Story = {
  tags: TEST_ONLY,
  render: () => (
    <div className="w-[480px]">
      <CategoryLinks label="Categories" testId="bar" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const bar = parts(canvasElement, "bar");
    bar.viewport.scrollLeft = maxScroll(bar.viewport) / 2;
    await eventually(async () => {
      await expect(shown(bar.arrow("start"))).toBe(true);
      await expect(shown(bar.arrow("end"))).toBe(true);
    });
    const link = bar.host.querySelector("a") as HTMLElement;
    link.focus({ preventScroll: true });
    for (const side of ["start", "end"] as const) {
      bar.arrow(side).focus();
      // biome-ignore lint/performance/noAwaitInLoops: one arrow at a time
      await expect(document.activeElement).toBe(link);
    }
    if (!realCommands()) {
      return;
    }
    const before = bar.viewport.scrollLeft;
    await clickPainted("bar", "end");
    await eventually(() =>
      expect(bar.viewport.scrollLeft).toBeGreaterThan(before)
    );
    await expect(document.activeElement).toBe(link);
  },
};

/** Stubs the viewport's scroll geometry so a play can feed any offset. */
function stubGeometry(viewport: HTMLElement, range: number) {
  let offset = 0;
  const width = viewport.clientWidth;
  Object.defineProperty(viewport, "clientWidth", {
    configurable: true,
    get: () => width,
  });
  Object.defineProperty(viewport, "scrollWidth", {
    configurable: true,
    get: () => width + range,
  });
  Object.defineProperty(viewport, "scrollLeft", {
    configurable: true,
    get: () => offset,
    set: () => undefined,
  });
  return async (next: number) => {
    offset = next;
    viewport.dispatchEvent(new Event("scroll"));
    await frame();
  };
}

function OverscrollFixture() {
  return (
    <div className="flex flex-col gap-4">
      {(["ltr", "rtl", "zero-ltr", "zero-rtl"] as const).map((id) => (
        <div
          className="w-[480px]"
          dir={id.endsWith("rtl") ? "rtl" : "ltr"}
          key={id}
        >
          <CategoryLinks
            items={id.startsWith("zero") ? CATEGORIES.slice(0, 2) : CATEGORIES}
            label={id}
            testId={id}
          />
        </div>
      ))}
    </div>
  );
}

// An offset outside the scroll range (an elastic bounce) is clamped:
// it never advertises an edge that is not there.
export const OverscrollEdges: Story = {
  tags: TEST_ONLY,
  render: () => <OverscrollFixture />,
  play: async ({ canvasElement }) => {
    const cases: [string, number, number, [boolean, boolean]][] = [
      ["ltr", 400, 0, [false, true]],
      ["ltr", 400, 200, [true, true]],
      ["ltr", 400, 400, [true, false]],
      ["ltr", 400, -12, [false, true]],
      ["ltr", 400, 412, [true, false]],
      ["rtl", 400, 0, [false, true]],
      ["rtl", 400, -200, [true, true]],
      ["rtl", 400, -400, [true, false]],
      ["rtl", 400, 12, [false, true]],
      ["rtl", 400, -412, [true, false]],
      ["zero-ltr", 0, 12, [false, false]],
      ["zero-ltr", 0, -12, [false, false]],
      ["zero-rtl", 0, 12, [false, false]],
      ["zero-rtl", 0, -12, [false, false]],
    ];
    const feeds = new Map<string, (next: number) => Promise<void>>();
    const results: string[] = [];
    for (const [id, range, offset, expected] of cases) {
      const bar = parts(canvasElement, id);
      if (!feeds.has(id)) {
        feeds.set(id, stubGeometry(bar.viewport, range));
      }
      // biome-ignore lint/performance/noAwaitInLoops: one offset at a time
      await (feeds.get(id) as (next: number) => Promise<void>)(offset);
      await wait(250);
      const got: [boolean, boolean] = [
        shown(bar.arrow("start")),
        shown(bar.arrow("end")),
      ];
      if (got[0] !== expected[0] || got[1] !== expected[1]) {
        results.push(`${id} ${offset}: got ${got} expected ${expected}`);
      }
    }
    await expect(results).toEqual([]);
  },
};

// ---------------------------------------------------------------------------
// The current item marked again after an empty marker, the row's size
// subscriptions, and the arrow's touch press
// ---------------------------------------------------------------------------

function ReselectFixture() {
  const [current, setCurrent] = useState<string | undefined>("#art");
  return (
    <ScrolledPage>
      <div className="w-[320px]" data-testid="bar">
        <Reel>
          <LinksRow current={current} items={CATEGORIES} />
        </Reel>
      </div>
      <button
        data-testid="clear"
        onClick={() => setCurrent(undefined)}
        type="button"
      >
        Clear
      </button>
      <button
        data-testid="select"
        onClick={() => setCurrent("#art")}
        type="button"
      >
        Select
      </button>
    </ScrolledPage>
  );
}

// A → no selection → the same node A, each step its own
// observer delivery: A is revealed again. Then the row holding A is removed
// (a delivery with no match) and the same row put back (a new match): A is
// revealed again.
// `NoDragBack` stays the control for an unrelated update.
export const RevealReselectedAfterEmpty: Story = {
  name: "N2 N3 Reveal reselected after empty",
  tags: TEST_ONLY,
  render: () => <ReselectFixture />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const bar = parts(canvasElement, "bar");
    const a = currentLink(bar.host);
    await eventually(() =>
      expect(isClear(bar.viewport, a), "N1 first reveal").toBe(true)
    );
    const held = holdPage(canvasElement);

    canvas.getByTestId("clear").click();
    await frame();
    await frame();
    await expect(currentLink(bar.host)).toBeNull();
    bar.viewport.scrollLeft = 0;
    await frame();
    await expect(isClear(bar.viewport, a)).toBe(false);

    canvas.getByTestId("select").click();
    await frame();
    await expect(currentLink(bar.host)).toBe(a);
    await eventually(() =>
      expect(isClear(bar.viewport, a), "N3 same node reselected").toBe(true)
    );
    await expectPageHeld(held);

    // The row leaves and the very same row comes back.
    const row = bar.viewport.firstElementChild as HTMLElement;
    row.remove();
    await frame();
    await frame();
    await expect(bar.viewport.scrollLeft).toBe(0);
    bar.viewport.append(row);
    await eventually(() =>
      expect(isClear(bar.viewport, a), "N3 N2 row removed, put back").toBe(true)
    );
    await expectPageHeld(held);
  },
};

/** Moves the marker from whatever has it to `href`, outside React. */
function mark(host: HTMLElement, href: string) {
  currentLink(host)?.removeAttribute("aria-current");
  const next = host.querySelector(`a[href="${href}"]`) as HTMLElement;
  next.setAttribute("aria-current", "page");
  return next;
}

// ---------------------------------------------------------------------------
// When the current item is revealed: one story per rule
// ---------------------------------------------------------------------------

/** Vitest's real browser commands; a reveal story fails without them. */
function requireCommands() {
  const commands = realCommands();
  if (!commands) {
    throw new Error("The real browser commands are missing");
  }
  return commands;
}

/**
 * Records every scroll request made on a Reel viewport (`scroll`, `scrollBy`,
 * `scrollTo`) from now until restored, as its behaviour. Assigning
 * `scrollLeft` is not a request.
 */
function recordScrollRequests() {
  const proto = Element.prototype as unknown as Record<
    "scroll" | "scrollBy" | "scrollTo",
    (...args: unknown[]) => void
  >;
  const original = {
    scroll: proto.scroll,
    scrollBy: proto.scrollBy,
    scrollTo: proto.scrollTo,
  };
  const requests: {
    behavior: string;
    left: number | undefined;
    method: string;
    viewport: Element;
  }[] = [];
  for (const method of ["scroll", "scrollBy", "scrollTo"] as const) {
    proto[method] = function (this: Element, ...args: unknown[]) {
      if (
        this instanceof HTMLElement &&
        this.dataset.slot === "reel-viewport"
      ) {
        const options =
          typeof args[0] === "object" && args[0] !== null
            ? (args[0] as ScrollToOptions)
            : undefined;
        requests.push({
          behavior: options?.behavior ?? "auto",
          left: options?.left,
          method,
          viewport: this,
        });
      }
      return original[method].apply(this, args);
    };
  }
  return {
    /** The requests made on `viewport` so far, in order. */
    calls: (viewport: HTMLElement) =>
      requests.filter((r) => r.viewport === viewport),
    /** The behaviours of the requests made on `viewport`, in order. */
    of: (viewport: HTMLElement) =>
      requests.filter((r) => r.viewport === viewport).map((r) => r.behavior),
    restore() {
      Object.assign(proto, original);
    },
  };
}

/** Records which nodes each observer of one kind watches, until restored. */
function spyObserved(kind: typeof MutationObserver | typeof ResizeObserver) {
  const proto = kind.prototype as unknown as {
    disconnect: () => void;
    observe: (target: Node, options?: unknown) => void;
    unobserve?: (target: Node) => void;
  };
  const original = {
    disconnect: proto.disconnect,
    observe: proto.observe,
    unobserve: proto.unobserve,
  };
  const live = new Map<object, Set<Node>>();
  proto.observe = function (this: object, target: Node, options?: unknown) {
    const set = live.get(this) ?? new Set<Node>();
    set.add(target);
    live.set(this, set);
    return original.observe.call(this, target, options);
  };
  const { unobserve } = original;
  if (unobserve) {
    proto.unobserve = function (this: object, target: Node) {
      live.get(this)?.delete(target);
      return unobserve.call(this, target);
    };
  }
  proto.disconnect = function (this: object) {
    live.get(this)?.clear();
    return original.disconnect.call(this);
  };
  return {
    /** How many live observers of this kind watch `target`. */
    observing: (target: Node) =>
      [...live.values()].filter((set) => set.has(target)).length,
    restore() {
      proto.observe = original.observe;
      proto.disconnect = original.disconnect;
      if (unobserve) {
        proto.unobserve = unobserve;
      }
    },
  };
}

/** Waits until the viewport has not moved for five frames; fails after 300. */
async function settle(viewport: HTMLElement) {
  let last = Number.NaN;
  let still = 0;
  for (let i = 0; i < 300 && still < 5; i++) {
    // biome-ignore lint/performance/noAwaitInLoops: one frame at a time
    await frame();
    still = viewport.scrollLeft === last ? still + 1 : 0;
    last = viewport.scrollLeft;
  }
  if (still < 5) {
    throw new Error("Reel viewport did not settle within 300 frames");
  }
}

/** The viewport's content width, as the Reel measures its room. */
function contentWidth(viewport: HTMLElement) {
  const style = getComputedStyle(viewport);
  return (
    viewport.clientWidth -
    (Number.parseFloat(style.paddingLeft) || 0) -
    (Number.parseFloat(style.paddingRight) || 0)
  );
}

/**
 * A scrolled page whose Reels mount and unmount from the play, so a recorder
 * or a spy is installed before the Reel exists.
 */
function Mounted({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  return (
    <ScrolledPage>
      {mounted ? children : null}
      <button
        data-testid="mount"
        onClick={() => setMounted(true)}
        type="button"
      >
        Mount
      </button>
      <button
        data-testid="unmount"
        onClick={() => setMounted(false)}
        type="button"
      >
        Unmount
      </button>
    </ScrolledPage>
  );
}

/** Counts current-item searches (`querySelector` with the Reel's selector) per element, until restored. */
function countCurrentQueries() {
  const original = Element.prototype.querySelector;
  const counts = new Map<Element, number>();
  Element.prototype.querySelector = function (
    this: Element,
    selectors: string
  ) {
    if (selectors.includes("[aria-current]:not(")) {
      counts.set(this, (counts.get(this) ?? 0) + 1);
    }
    return original.call(this, selectors);
  } as typeof original;
  return {
    of: (el: Element) => counts.get(el) ?? 0,
    restore() {
      Element.prototype.querySelector = original;
    },
  };
}

/** Holds the page, installs the recorder, mounts; returns what to check. */
async function mountRecorded(canvasElement: HTMLElement, testId: string) {
  const commands = requireCommands();
  await commands.emulateReducedMotion(false);
  const held = holdPage(canvasElement);
  const recorder = recordScrollRequests();
  within(canvasElement).getByTestId("mount").click();
  await eventually(() =>
    expect(within(canvasElement).queryByTestId(testId)).toBeTruthy()
  );
  await frame();
  await frame();
  return { commands, held, recorder };
}

// With no room the Reel waits; when it comes to have room (at mount, or
// shown, or widened from nothing) it evaluates the current match once and
// jumps. A hidden Reel whose marker moved reveals the new item when shown,
// once; so does a Reel squeezed to its own padding when it is widened.
export const RevealOnRoom: Story = {
  name: "N1 Reveal on room",
  tags: TEST_ONLY,
  render: () => (
    <Mounted>
      <div data-testid="hidden-host" style={{ display: "none" }}>
        <div className="w-[375px]" data-testid="hidden">
          <Reel>
            <LinksRow current="#featured" items={CATEGORIES} />
          </Reel>
        </div>
      </div>
      <div className="w-0 overflow-hidden" data-testid="narrow">
        <Reel>
          <LinksRow current="#featured" items={CATEGORIES} />
        </Reel>
      </div>
    </Mounted>
  ),
  play: async ({ canvasElement }) => {
    // A no-room mount skips the current-item search. Marker deliveries still
    // search the row, and gaining room performs one search of its own.
    const queries = countCurrentQueries();
    const { held, recorder } = await mountRecorded(
      canvasElement,
      "hidden"
    ).catch((error: unknown) => {
      queries.restore();
      throw error;
    });
    try {
      const hiddenHost = within(canvasElement).getByTestId("hidden-host");
      const hidden = parts(canvasElement, "hidden");
      const narrow = parts(canvasElement, "narrow");
      await expect(queries.of(hidden.viewport), "searches at mount").toBe(0);

      // (i) Hidden: A becomes B, then the Reel is shown.
      await expect(recorder.of(hidden.viewport)).toEqual([]);
      const b = mark(hidden.host, "#art");
      await frame();
      await frame();
      await expect(recorder.of(hidden.viewport), "(i) hidden").toEqual([]);
      const searchedBeforeShow = queries.of(hidden.viewport);
      hiddenHost.style.display = "";
      await settle(hidden.viewport);
      await expect(
        queries.of(hidden.viewport) - searchedBeforeShow,
        "searches on gaining room"
      ).toBe(1);
      await expect(recorder.of(hidden.viewport), "(i) shown").toEqual([
        "instant",
      ]);
      await expect(isClear(hidden.viewport, b), "(i) B clear").toBe(true);

      // (ii) Squeezed to its own padding: some width, no room.
      await expect(narrow.viewport.clientWidth).toBeGreaterThan(0);
      await expect(contentWidth(narrow.viewport)).toBe(0);
      await expect(recorder.of(narrow.viewport), "(ii) mount").toEqual([]);
      const nb = mark(narrow.host, "#art");
      await expect(nb.getBoundingClientRect().width).toBeGreaterThan(0);
      await frame();
      await frame();
      await expect(recorder.of(narrow.viewport), "(ii) marked").toEqual([]);
      narrow.host.style.width = "375px";
      await settle(narrow.viewport);
      await expect(recorder.of(narrow.viewport), "(ii) widened").toEqual([
        "instant",
      ]);
      await expect(isClear(narrow.viewport, nb), "(ii) B clear").toBe(true);

      // (iii) Hidden again, a distant D marked, shown: one more jump.
      hiddenHost.style.display = "none";
      await frame();
      await frame();
      const d = mark(hidden.host, "#games");
      await frame();
      await frame();
      await expect(isClear(hidden.viewport, d)).toBe(false);
      hiddenHost.style.display = "";
      await settle(hidden.viewport);
      await expect(recorder.of(hidden.viewport), "(iii) shown").toEqual([
        "instant",
        "instant",
      ]);
      await expect(isClear(hidden.viewport, d), "(iii) D clear").toBe(true);

      // (iv) Hidden again; in one task shown and the marker moved to a
      // distant E: the marker delivery still sees no room, the size delivery
      // that follows reveals E, once, instantly.
      hiddenHost.style.display = "none";
      await frame();
      await frame();
      hiddenHost.style.display = "";
      const e = mark(hidden.host, "#sport");
      await settle(hidden.viewport);
      await expect(recorder.of(hidden.viewport), "(iv) shown").toEqual([
        "instant",
        "instant",
        "instant",
      ]);
      await expect(isClear(hidden.viewport, e), "(iv) E clear").toBe(true);
      await expectPageHeld(held);
    } finally {
      recorder.restore();
      queries.restore();
    }
  },
};

// The room story's setup rejects without the real browser commands, and the query
// counter it installed first is restored.
export const RevealOnRoomRestoresCounter: Story = {
  name: "N1 Reveal on room restores counter",
  tags: TEST_ONLY,
  render: RevealOnRoom.render,
  play: async (context) => {
    const original = Element.prototype.querySelector;
    const g = globalThis as { __realCommands?: RealCommands };
    const commands = g.__realCommands;
    g.__realCommands = undefined;
    try {
      await expect(RevealOnRoom.play?.(context)).rejects.toThrow(
        "The real browser commands are missing"
      );
    } finally {
      g.__realCommands = commands;
    }
    // Compared here: the instrumented `expect` wraps a function argument.
    await expect(
      Element.prototype.querySelector === original,
      "querySelector restored"
    ).toBe(true);
  },
};

/** Index 0 and 4 are chip-like buttons; the rest are links. */
const MIXED_MARKERS: Record<number, Record<string, string>> = {
  // Says it is not selected: React renders `data-selected={false}` so.
  0: { "data-selected": "false" },
  // Says it is not current, in capitals.
  1: { "aria-current": "FALSE" },
  // The distant selected chip: the first match.
  4: { "data-selected": "" },
  // A later current link.
  8: { "aria-current": "page" },
};

function MixedMarkersFixture() {
  const [filled, setFilled] = useState(false);
  const className = buttonVariants({ variant: "ghost" });
  return (
    <>
      <div className="w-[375px]" data-testid="bar">
        <Reel>
          <ul className="mx-auto flex w-max gap-1">
            {filled
              ? CATEGORIES.map((item, index) => (
                  <li key={item.href}>
                    {index === 0 || index === 4 ? (
                      <button
                        className={className}
                        type="button"
                        {...MIXED_MARKERS[index]}
                      >
                        {item.label}
                      </button>
                    ) : (
                      <a
                        className={className}
                        href={item.href}
                        onClick={(event) => event.preventDefault()}
                        {...MIXED_MARKERS[index]}
                      >
                        {item.label}
                      </a>
                    )}
                  </li>
                ))
              : null}
          </ul>
        </Reel>
      </div>
      <button data-testid="fill" onClick={() => setFilled(true)} type="button">
        Fill
      </button>
    </>
  );
}

// One delivery fills the row: the first item in document order that is
// current wins, so `data-selected="false"` and `aria-current="FALSE"` lose to
// the distant selected chip, and the later current link loses to it too.
export const RevealFirstMatch: Story = {
  name: "N2 Reveal first match",
  tags: TEST_ONLY,
  render: () => (
    <Mounted>
      <MixedMarkersFixture />
    </Mounted>
  ),
  play: async ({ canvasElement }) => {
    const { held, recorder } = await mountRecorded(canvasElement, "bar");
    try {
      const bar = parts(canvasElement, "bar");
      await expect(recorder.of(bar.viewport)).toEqual([]);
      within(canvasElement).getByTestId("fill").click();
      await eventually(() =>
        expect(bar.host.querySelectorAll("li")).toHaveLength(9)
      );
      await settle(bar.viewport);
      const chip = bar.host.querySelector('[data-selected=""]') as HTMLElement;
      await expect(
        [...bar.host.querySelectorAll("li > *")]
          .slice(0, 2)
          .map((el) => [
            el.getAttribute("data-selected"),
            el.getAttribute("aria-current"),
          ])
      ).toEqual([
        ["false", null],
        [null, "FALSE"],
      ]);
      await expect(recorder.of(bar.viewport)).toEqual(["instant"]);
      await expect(isClear(bar.viewport, chip), "the chip wins").toBe(true);
      await expectPageHeld(held);
    } finally {
      recorder.restore();
    }
  },
};

// A, then no match, then the same A, each in its own delivery: a new
// selection, revealed again (smoothly: the first reveal was spent at mount).
export const RevealSameAfterNone: Story = {
  name: "N3 Reveal same after none",
  tags: TEST_ONLY,
  render: () => (
    <Mounted>
      <div className="w-[375px]" data-testid="bar">
        <Reel>
          <LinksRow current="#art" items={CATEGORIES} />
        </Reel>
      </div>
    </Mounted>
  ),
  play: async ({ canvasElement }) => {
    const { held, recorder } = await mountRecorded(canvasElement, "bar");
    try {
      const bar = parts(canvasElement, "bar");
      const a = currentLink(bar.host);
      await settle(bar.viewport);
      await expect(recorder.of(bar.viewport)).toEqual(["instant"]);
      await expect(isClear(bar.viewport, a)).toBe(true);
      a.removeAttribute("aria-current");
      await frame();
      await frame();
      bar.viewport.scrollLeft = 0;
      await settle(bar.viewport);
      await expect(isClear(bar.viewport, a)).toBe(false);
      a.setAttribute("aria-current", "page");
      await settle(bar.viewport);
      await expect(recorder.of(bar.viewport)).toEqual(["instant", "smooth"]);
      await expect(isClear(bar.viewport, a), "A again").toBe(true);
      await expectPageHeld(held);
    } finally {
      recorder.restore();
    }
  },
};

// A current item already clear at mount spends the first reveal with no
// request; the next selection follows the motion preference.
export const FirstRevealSpentWhenClear: Story = {
  name: "N4 First reveal spent when clear",
  tags: TEST_ONLY,
  render: () => (
    <Mounted>
      {["normal", "reduced"].map((id) => (
        <div className="w-[375px]" data-testid={id} key={id}>
          <Reel>
            <LinksRow current="#featured" items={CATEGORIES} />
          </Reel>
        </div>
      ))}
    </Mounted>
  ),
  play: async ({ canvasElement }) => {
    const { commands, held, recorder } = await mountRecorded(
      canvasElement,
      "normal"
    );
    try {
      const normal = parts(canvasElement, "normal");
      const reduced = parts(canvasElement, "reduced");
      for (const bar of [normal, reduced]) {
        // biome-ignore lint/performance/noAwaitInLoops: one Reel at a time
        await expect(isClear(bar.viewport, currentLink(bar.host))).toBe(true);
        await expect(recorder.of(bar.viewport)).toEqual([]);
      }
      const b = mark(normal.host, "#art");
      await settle(normal.viewport);
      await expect(recorder.of(normal.viewport), "normal motion").toEqual([
        "smooth",
      ]);
      await expect(isClear(normal.viewport, b)).toBe(true);

      await commands.emulateReducedMotion(true);
      const rb = mark(reduced.host, "#art");
      await settle(reduced.viewport);
      await expect(recorder.of(reduced.viewport), "reduced motion").toEqual([
        "instant",
      ]);
      await expect(isClear(reduced.viewport, rb)).toBe(true);
      await expectPageHeld(held);
    } finally {
      await realCommands()?.emulateReducedMotion(false);
      recorder.restore();
    }
  },
};

// A match that cannot be measured is remembered and never evaluated
// again by a later delivery: shown, moved into a new row, or the Reel
// resized. The next different match is revealed, and it is the first reveal.
export const SameMatchNotRetried: Story = {
  name: "N5 Same match not retried",
  tags: TEST_ONLY,
  render: () => (
    <Mounted>
      <div className="w-[375px]" data-testid="bar">
        <Reel>
          <ul className="flex w-[1400px] gap-1">
            {CATEGORIES.map((item) => (
              <li hidden={item.href === "#art"} key={item.href}>
                <a
                  aria-current={item.href === "#art" ? "page" : undefined}
                  className={buttonVariants({ variant: "ghost" })}
                  href={item.href}
                  onClick={(event) => event.preventDefault()}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </Reel>
      </div>
    </Mounted>
  ),
  play: async ({ canvasElement }) => {
    const { held, recorder } = await mountRecorded(canvasElement, "bar");
    try {
      const bar = parts(canvasElement, "bar");
      const a = currentLink(bar.host);
      await expect(a.getBoundingClientRect().width).toBe(0);
      await expect(recorder.of(bar.viewport), "hidden at mount").toEqual([]);

      a.closest("li")?.removeAttribute("hidden");
      await settle(bar.viewport);
      await expect(a.getBoundingClientRect().width).toBeGreaterThan(0);
      await expect(isClear(bar.viewport, a)).toBe(false);
      await expect(recorder.of(bar.viewport), "shown").toEqual([]);

      // The same nodes moved into a new row, in one delivery.
      const oldRow = bar.viewport.firstElementChild as HTMLElement;
      const newRow = oldRow.cloneNode(false) as HTMLElement;
      newRow.append(...oldRow.childNodes);
      oldRow.replaceWith(newRow);
      await settle(bar.viewport);
      await expect(currentLink(bar.host)).toBe(a);
      await expect(recorder.of(bar.viewport), "moved").toEqual([]);

      for (const width of ["300px", "375px"]) {
        bar.host.style.width = width;
        // biome-ignore lint/performance/noAwaitInLoops: one size at a time
        await settle(bar.viewport);
      }
      await expect(recorder.of(bar.viewport), "resized").toEqual([]);

      const b = mark(bar.host, "#sport");
      await settle(bar.viewport);
      await expect(recorder.of(bar.viewport), "B").toEqual(["instant"]);
      await expect(isClear(bar.viewport, b)).toBe(true);
      await expectPageHeld(held);
    } finally {
      recorder.restore();
    }
  },
};

// No busy state: a selection made while the row is still moving (Reel's
// own glide, or an arrow's page) replaces that scroll and ends clear.
export const SelectionWhileMoving: Story = {
  name: "N6 Selection while moving",
  tags: TEST_ONLY,
  render: () => (
    <Mounted>
      {["glide", "arrow"].map((id) => (
        <div className="w-[375px]" data-testid={id} key={id}>
          <Reel>
            <LinksRow current="#all" items={CATEGORIES} />
          </Reel>
        </div>
      ))}
    </Mounted>
  ),
  play: async ({ canvasElement }) => {
    const { held, recorder } = await mountRecorded(canvasElement, "glide");
    try {
      const glide = parts(canvasElement, "glide");
      const arrow = parts(canvasElement, "arrow");
      for (const bar of [glide, arrow]) {
        // biome-ignore lint/performance/noAwaitInLoops: one Reel at a time
        await expect(recorder.of(bar.viewport)).toEqual([]);
        await expect(bar.viewport.scrollLeft).toBe(0);
      }
      const target = (bar: ReturnType<typeof parts>) =>
        bar.host.querySelector('a[href="#film"]') as HTMLElement;
      // The target is not clear now, and an arrow's page alone would leave
      // it under the start fade: its resting offset differs from both.
      const page = glide.viewport.clientWidth * 0.8;
      await expect(isClear(glide.viewport, target(glide))).toBe(false);
      await expect(
        gaps(glide.viewport, target(glide)).fromStart - page
      ).toBeLessThan(clearance(glide.viewport));

      // Two selections one delivery apart, before any frame.
      mark(glide.host, "#news");
      await Promise.resolve();
      mark(glide.host, "#film");
      await Promise.resolve();
      await settle(glide.viewport);
      await expect(recorder.of(glide.viewport), "glide").toEqual([
        "smooth",
        "smooth",
      ]);
      await expect(
        isClear(glide.viewport, target(glide)),
        "clear at rest after a superseded glide"
      ).toBe(true);

      // An arrow's page, then the selection before its first frame.
      press(arrow.arrow("end"));
      const pageRequest = recorder.calls(arrow.viewport);
      mark(arrow.host, "#film");
      await Promise.resolve();
      await expect(pageRequest).toMatchObject([
        {
          method: "scrollBy",
          left: arrow.viewport.clientWidth * 0.8,
          behavior: "smooth",
        },
      ]);
      await settle(arrow.viewport);
      await expect(recorder.of(arrow.viewport)).toEqual(["smooth", "smooth"]);
      await expect(
        isClear(arrow.viewport, target(arrow)),
        "clear at rest after an arrow page"
      ).toBe(true);
      await expectPageHeld(held);
    } finally {
      recorder.restore();
    }
  },
};

// A selection already clear leaves the scroll alone: no request at all.
export const ClearSelectionNoRequest: Story = {
  name: "N7 Clear selection no request",
  tags: TEST_ONLY,
  render: () => (
    <Mounted>
      <div className="w-[375px]" data-testid="bar">
        <Reel>
          <LinksRow current="#sport" items={CATEGORIES} />
        </Reel>
      </div>
    </Mounted>
  ),
  play: async ({ canvasElement }) => {
    const { held, recorder } = await mountRecorded(canvasElement, "bar");
    try {
      const bar = parts(canvasElement, "bar");
      await settle(bar.viewport);
      await expect(recorder.of(bar.viewport)).toEqual(["instant"]);
      const b = bar.host.querySelector('a[href="#books"]') as HTMLElement;
      await expect(isClear(bar.viewport, b)).toBe(true);
      mark(bar.host, "#books");
      await settle(bar.viewport);
      await wait(200);
      await expect(recorder.of(bar.viewport), "after B").toEqual(["instant"]);
      await expect(isClear(bar.viewport, b)).toBe(true);
      await expectPageHeld(held);
    } finally {
      recorder.restore();
    }
  },
};

// Under StrictMode's replay the viewport ends up watched by exactly one
// mutation observer and one size observer of the reveal, beside the edges'
// own; unmounted while hidden, by none.
export const ObserversReleased: Story = {
  name: "N8 Observers released",
  tags: TEST_ONLY,
  render: () => (
    <Mounted>
      <StrictMode>
        <div data-testid="bar" style={{ display: "none" }}>
          <div className="w-[375px]">
            <Reel>
              <LinksRow current="#art" items={CATEGORIES} />
            </Reel>
          </div>
        </div>
      </StrictMode>
    </Mounted>
  ),
  play: async ({ canvasElement }) => {
    const mutations = spyObserved(MutationObserver);
    const sizes = spyObserved(ResizeObserver);
    try {
      const { held, recorder } = await mountRecorded(canvasElement, "bar");
      try {
        const canvas = within(canvasElement);
        const viewport = parts(canvasElement, "bar").viewport;
        await expect({
          mutation: mutations.observing(viewport),
          size: sizes.observing(viewport),
        }).toEqual({ mutation: 2, size: 2 });
        canvas.getByTestId("unmount").click();
        await eventually(() => expect(canvas.queryByTestId("bar")).toBeNull());
        await frame();
        await expect({
          mutation: mutations.observing(viewport),
          size: sizes.observing(viewport),
        }).toEqual({ mutation: 0, size: 0 });
        await expect(recorder.of(viewport)).toEqual([]);
        await expectPageHeld(held);
      } finally {
        recorder.restore();
      }
    } finally {
      mutations.restore();
      sizes.restore();
    }
  },
};

/** The end arrow's state and the range, with any scroll event counted. */
function watchEdges(bar: ReturnType<typeof parts>) {
  let scrolls = 0;
  bar.viewport.addEventListener("scroll", () => {
    scrolls += 1;
  });
  return {
    expect: (overflows: boolean) =>
      eventually(async () => {
        await expect(maxScroll(bar.viewport) > 0).toBe(overflows);
        await expect(shown(bar.arrow("end"))).toBe(overflows);
      }),
    scrolls: () => scrolls,
  };
}

// The replacement row's width alone changes (no child added or removed): the
// size observer must have moved to the new row.
export const ObservesReplacedRowWidth: Story = {
  tags: TEST_ONLY,
  render: () => <SwapThenGrowFixture />,
  play: async ({ canvasElement }) => {
    const bar = parts(canvasElement, "bar");
    within(canvasElement).getByTestId("swap").click();
    await wait(300);
    const row = bar.viewport.firstElementChild as HTMLElement;
    const edges = watchEdges(bar);
    row.style.width = "200px";
    await edges.expect(false);
    row.style.width = "700px";
    await edges.expect(true);
    row.style.width = "200px";
    await edges.expect(false);
    await expect(edges.scrolls()).toBe(0);
  },
};

function FixedTextRowFixture() {
  return (
    <div className="w-[480px]" data-testid="bar">
      <Reel>
        {/* Fixed width, no wrapping, overflow visible: longer text widens
            the scroll range without resizing the row or the viewport. */}
        <ul className="flex w-[400px] flex-nowrap gap-1 overflow-visible whitespace-nowrap">
          {CATEGORIES.slice(0, 3).map((item) => (
            <li className="shrink-0" key={item.href}>
              <a className="px-2 leading-10" href={item.href}>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </Reel>
    </div>
  );
}

// Text-only edit: an existing text node's data changes, which emits a
// characterData record and nothing else; no observed box resizes.
export const ObservesRowText: Story = {
  tags: TEST_ONLY,
  render: () => <FixedTextRowFixture />,
  play: async ({ canvasElement }) => {
    const bar = parts(canvasElement, "bar");
    await wait(200);
    const row = bar.viewport.firstElementChild as HTMLElement;
    const rowWidth = row.getBoundingClientRect().width;
    const viewportWidth = bar.viewport.getBoundingClientRect().width;
    const text = (row.querySelector("a") as HTMLElement).firstChild as Text;
    const original = text.data;
    const edges = watchEdges(bar);
    await edges.expect(false);
    text.data = `${original}${"W".repeat(60)}`;
    await edges.expect(true);
    await expect(row.getBoundingClientRect().width).toBe(rowWidth);
    await expect(bar.viewport.getBoundingClientRect().width).toBe(
      viewportWidth
    );
    text.data = original;
    await edges.expect(false);
    await expect(edges.scrolls()).toBe(0);
  },
};

/** A colour as the browser resolves it, from a token on a probe element. */
function resolved(
  host: HTMLElement,
  property: "color" | "backgroundColor",
  token: string
) {
  const probe = document.createElement("span");
  probe.style[property] = `var(${token})`;
  host.append(probe);
  const value = getComputedStyle(probe)[property];
  probe.remove();
  return value;
}

// A touch press on the arrow's hit area (held, without hover) still gives the
// picture of the button its press: foreground text even under a muted parent,
// the accent fill and the 0.98 scale. The hit area itself takes the touch
// handling the Button used to carry, and its own transparent tap highlight
// wins over the one the root passes down.
export const ArrowTouchPress: Story = {
  tags: TEST_ONLY,
  render: () => (
    <div className="w-[480px]" data-testid="bar">
      <Reel
        arrows="always"
        className="text-muted-foreground [-webkit-tap-highlight-color:rgb(1,2,3)]"
      >
        <LinksRow items={CATEGORIES} />
      </Reel>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const commands = realCommands();
    if (!commands) {
      return;
    }
    const root = canvasElement.querySelector(
      '[data-testid="bar"] [data-slot="reel"]'
    ) as HTMLElement;
    const transparent = "rgba(0, 0, 0, 0)";
    await expect(
      getComputedStyle(root).getPropertyValue("-webkit-tap-highlight-color"),
      "the root's tap highlight"
    ).not.toBe(transparent);
    const bar = parts(canvasElement, "bar");
    const arrow = bar.arrow("end");
    const area = hitArea(arrow);
    await eventually(() => expect(shown(arrow)).toBe(true));
    await commands.pointerMoveTo(
      '[data-testid="bar"] [data-slot="reel-arrow"][data-side="end"]'
    );
    await commands.pointerDown();
    try {
      // Slide off while held: the press stays, the hover goes.
      await commands.pointerMoveAway();
      await eventually(async () => {
        await expect(area.matches(":active")).toBe(true);
        await expect(area.matches(":hover")).toBe(false);
      });
      await wait(300);
      const pressed = getComputedStyle(arrow);
      const hit = getComputedStyle(area);
      await expect({
        background: pressed.backgroundColor,
        color: pressed.color,
        scale: pressed.scale,
        tapHighlight: hit.getPropertyValue("-webkit-tap-highlight-color"),
        touchAction: hit.touchAction,
        userSelect: hit.userSelect,
      }).toEqual({
        background: resolved(bar.host, "backgroundColor", "--accent"),
        color: resolved(bar.host, "color", "--foreground"),
        scale: "0.98",
        tapHighlight: transparent,
        touchAction: "manipulation",
        userSelect: "none",
      });
    } finally {
      await commands.pointerUp();
    }
  },
};

// T-PAD. The clearance is a constant of the variant and the gate: the
// greater of 48px, the arrow's width, and any hidden strip plus the fade. It
// never reads the arrows' state, so a row that does not overflow (no arrow
// shown, no strip drawn) already has it, and the first reveal at mount clears
// the whole zone.
export const PlainScrollPadding: Story = {
  tags: TEST_ONLY,
  render: () => (
    <div className="flex flex-col gap-4">
      {/* Wide enough that nothing overflows: no arrow, no strip. */}
      <div className="w-[1400px]">
        <TrackRow testId="plain-fits" />
      </div>
      <div className="w-[320px]">
        <TrackRow testId="plain" />
      </div>
      <div className="w-[320px]" data-testid="default">
        <Reel arrows="always">
          <ul className="flex w-max gap-1">
            <li>
              <a href="#one">One</a>
            </li>
          </ul>
        </Reel>
      </div>
      <div
        className="w-[320px] [--ks-control-sm:4rem]"
        data-testid="default-4rem"
      >
        <Reel arrows="always">
          <ul className="flex w-max gap-1">
            <li>
              <a href="#one">One</a>
            </li>
          </ul>
        </Reel>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const padding = (testId: string) => {
      const style = getComputedStyle(parts(canvasElement, testId).viewport);
      return [style.scrollPaddingInlineStart, style.scrollPaddingInlineEnd];
    };
    // Before any scroll, and with no arrow shown.
    const fits = parts(canvasElement, "plain-fits");
    await expect(maxScroll(fits.viewport)).toBe(0);
    await expect(shown(hitArea(fits.arrow("end")))).toBe(false);
    await expect(padding("plain-fits")).toEqual(["52px", "52px"]);
    const plain = parts(canvasElement, "plain");
    await expect(plain.viewport.scrollLeft).toBe(0);
    await expect(padding("plain")).toEqual(["52px", "52px"]);
    await expect(padding("default")).toEqual(["48px", "48px"]);
    await expect(padding("default-4rem")).toEqual(["64px", "64px"]);
  },
};

// A row whose items mark the selected one with `aria-selected`, as tabs do:
// Reel reveals it at mount (instantly) and when the selection moves (a
// glide); an item with aria-selected="false" is not current.
function AriaSelectedFixture() {
  const [mounted, setMounted] = useState(false);
  const [selected, setSelected] = useState("art");
  return (
    <ScrolledPage>
      <button
        data-testid="mount"
        onClick={() => setMounted(true)}
        type="button"
      >
        Mount
      </button>
      <button
        data-testid="select-news"
        onClick={() => setSelected("news")}
        type="button"
      >
        News
      </button>
      {mounted ? (
        <div className="w-[320px]" data-testid="bar">
          <Reel>
            <div className="flex w-max gap-1" role="tablist">
              {CATEGORIES.map((item) => (
                <button
                  aria-selected={item.value === selected}
                  role="tab"
                  className={buttonVariants({ variant: "ghost" })}
                  data-value={item.value}
                  key={item.value}
                  type="button"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </Reel>
        </div>
      ) : null}
    </ScrolledPage>
  );
}

export const RevealAriaSelected: Story = {
  tags: TEST_ONLY,
  render: () => <AriaSelectedFixture />,
  play: async ({ canvasElement }) => {
    // Real input is required: without it the play fails before mounting.
    const commands = requireCommands();
    await commands.emulateReducedMotion(false);
    const held = holdPage(canvasElement);
    const recorder = recordScrollRequests();
    try {
      within(canvasElement).getByTestId("mount").click();
      await eventually(() =>
        expect(within(canvasElement).queryByTestId("bar")).not.toBeNull()
      );
      const bar = parts(canvasElement, "bar");
      const item = (value: string) =>
        bar.host.querySelector(`[data-value="${value}"]`) as HTMLElement;
      // The first item carries aria-selected="false": not current.
      await expect(item("all")).toHaveAttribute("aria-selected", "false");
      await eventually(() =>
        expect(isClear(bar.viewport, item("art"))).toBe(true)
      );
      await expect(recorder.of(bar.viewport)).toEqual(["instant"]);
      within(canvasElement).getByTestId("select-news").click();
      await eventually(() =>
        expect(
          isClear(bar.viewport, item("news")) ||
            bar.viewport.scrollLeft >= maxScroll(bar.viewport) - 0.5
        ).toBe(true)
      );
      await expect(recorder.of(bar.viewport)).toEqual(["instant", "smooth"]);
      await expectPageHeld(held);
    } finally {
      recorder.restore();
    }
  },
};

// ---------------------------------------------------------------------------
// Type contract (checked by tsc, never rendered)
// ---------------------------------------------------------------------------

export const typeContract = [
  <Reel key="one">
    <ul />
  </Reel>,
  <Reel arrows="always" key="always">
    <ul />
  </Reel>,
  // @ts-expect-error exactly one child: a bare string is not a row
  <Reel key="text">text</Reel>,
  // @ts-expect-error exactly one child, not two
  <Reel key="two">
    <ul />
    <ul />
  </Reel>,
  // @ts-expect-error a row is required
  <Reel key="empty" />,
  // @ts-expect-error no ref: the API is arrows, className and the row
  <Reel key="ref" ref={null}>
    <ul />
  </Reel>,
  // @ts-expect-error nor native div props
  <Reel id="row" key="id">
    <ul />
  </Reel>,
  // @ts-expect-error nor an inline style
  <Reel key="style" style={{}}>
    <ul />
  </Reel>,
  // @ts-expect-error arrows is one of "pointer", "always", "none"
  <Reel arrows="hover" key="hover">
    <ul />
  </Reel>,
  <Reel arrowVariant="plain" key="plain">
    <ul />
  </Reel>,
  // @ts-expect-error arrowVariant is "default" or "plain"
  <Reel arrowVariant="button" key="button">
    <ul />
  </Reel>,
];
