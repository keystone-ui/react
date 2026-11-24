import { DirectionProvider } from "@base-ui/react/direction-provider";
import { Button } from "@keystoneui/react/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@keystoneui/react/combobox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@keystoneui/react/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from "@keystoneui/react/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@keystoneui/react/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@keystoneui/react/tooltip";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type * as React from "react";
import { expect, userEvent, waitFor } from "storybook/test";

/**
 * These stories measure the computed transform origin after Popover, Dropdown
 * menu, its submenu, Select, Combobox and Tooltip finish opening. The
 * fixtures use Base UI's `--transform-origin` for their opening scale.
 * Select uses its default anchored placement.
 *
 * Popover, the root Dropdown menu, Select, Combobox and Tooltip open below the
 * upper trigger, above the bottom trigger and below the RTL trigger. Their
 * origins meet the facing trigger edge at its centre or inline-start corner.
 * The submenu opens on the row's inline end: to the right for the upper and
 * bottom triggers, to the left for the RTL one, with start, end and start
 * alignment respectively. Its origin shares the row's facing edge x coordinate
 * and sits 3px above the row's top or below its bottom. The coordinate checks
 * allow 1px.
 */
const meta = {
  title: "Testing/Popup Origin",
  parameters: { layout: "fullscreen" },
  // Browser tests: out of the sidebar and the docs page, still run by Vitest
  // (they keep Storybook's default `test` tag).
  tags: ["!dev", "!autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

type Place = "below" | "above" | "rtl";

/**
 * Three triggers: an upper one, one pinned to the bottom of the viewport (no
 * room below, so a vertical popup flips above and the submenu aligns to its
 * end), and an RTL one, where an inline-start corner is the trigger's right.
 */
function Stage({
  extra,
  render,
}: {
  /** More fixtures, rendered under the RTL trigger. */
  extra?: React.ReactNode;
  render: (place: Place) => React.ReactNode;
}) {
  return (
    <div className="min-h-svh p-6">
      <div className="flex justify-center" data-place="below">
        {render("below")}
      </div>
      <div className="mt-6 flex justify-center" data-place="rtl" dir="rtl">
        <DirectionProvider direction="rtl">{render("rtl")}</DirectionProvider>
      </div>
      {extra}
      <div
        className="fixed inset-x-0 bottom-4 flex justify-center"
        data-place="above"
      >
        {render("above")}
      </div>
    </div>
  );
}

const FRUITS: Record<string, string> = {
  apple: "Apple",
  banana: "Banana",
  blueberry: "Blueberry",
  grapes: "Grapes",
  pineapple: "Pineapple",
};

const FRAMEWORKS = ["Next.js", "SvelteKit", "Nuxt.js", "Remix", "Astro"];

/** A Base UI side or alignment can be off by a sub-pixel trigger edge. */
const TOLERANCE = 1;

/**
 * Where along the trigger's facing edge the origin must sit: the trigger's
 * centre, its inline-start corner (left in LTR, right in RTL), or, for the
 * submenu, the popup's aligned corner, which its `alignOffset` of -3 puts
 * 3px above the row's top (start) or below its bottom (end).
 */
type Cross = "center" | "start" | "aligned-edge";

const byTestId = (id: string) => {
  const el = document.querySelector<HTMLElement>(`[data-testid="${id}"]`);
  if (!el) {
    throw new Error(`no element with data-testid="${id}"`);
  }
  return el;
};

const openPopup = (slot: string) =>
  document.querySelector<HTMLElement>(`[data-slot="${slot}"][data-open]`);

/** Waits for the open popup to finish its enter transition, then returns it. */
async function settledPopup(slot: string) {
  let popup: HTMLElement | null = null;
  await waitFor(
    () => {
      popup = openPopup(slot);
      expect(popup).not.toBeNull();
      expect(popup?.hasAttribute("data-starting-style")).toBe(false);
    },
    { timeout: 5000 }
  );
  const el = popup as unknown as HTMLElement;
  // The rects below are read after the scale and slide end, so they are the
  // popup's resting box, which is what `transform-origin` is resolved against.
  await Promise.all(el.getAnimations().map((a) => a.finished));
  // An open popup hidden at rest keeps its open state and its rectangle.
  await expect(el).toBeVisible();
  return el;
}

async function closeAll(slot: string) {
  await userEvent.keyboard("{Escape}");
  if (openPopup(slot)) {
    await userEvent.keyboard("{Escape}");
  }
  await waitFor(() => expect(openPopup(slot)).toBeNull(), { timeout: 5000 });
}

/**
 * The popup's computed `transform-origin`, as a viewport point, must lie on
 * the trigger's edge facing the popup and at the trigger's alignment point.
 */
function expectOriginOnTrigger(
  popup: HTMLElement,
  trigger: HTMLElement,
  expected: {
    cross: Cross;
    direction: "ltr" | "rtl";
    place: Place;
    side: "top" | "bottom" | "left" | "right";
  }
) {
  const { direction, place } = expected;
  const side = popup.getAttribute("data-side");
  expect(side, "rendered side").toBe(expected.side);

  const [ox, oy] = getComputedStyle(popup)
    .transformOrigin.split(" ")
    .map(Number.parseFloat);
  const box = popup.getBoundingClientRect();
  // A collapsed box (say `scale(0)`) keeps its origin where the checks look.
  expect(box.width, "popup width").toBeGreaterThan(0);
  expect(box.height, "popup height").toBeGreaterThan(0);
  const t = trigger.getBoundingClientRect();
  const origin = { x: box.left + ox, y: box.top + oy };
  const near = (actual: number, target: number, what: string) =>
    expect(
      Math.abs(actual - target),
      `${what}: origin ${actual.toFixed(2)} vs ${target.toFixed(2)}`
    ).toBeLessThanOrEqual(TOLERANCE);

  if (side === "right" || side === "left") {
    near(origin.x, t[side], `origin on the trigger's ${side} edge`);
    const align = place === "above" ? "end" : "start";
    expect(popup.getAttribute("data-align"), "submenu alignment").toBe(align);
    const end = align === "end";
    near(origin.y, end ? box.bottom : box.top, "submenu corner");
    near(origin.y, end ? t.bottom + 3 : t.top - 3, "submenu row offset");
    return;
  }

  near(
    origin.y,
    side === "bottom" ? t.bottom : t.top,
    `origin on the trigger's ${side === "bottom" ? "bottom" : "top"} edge`
  );
  if (expected.cross === "center") {
    near(origin.x, (t.left + t.right) / 2, "origin at the trigger's centre");
  } else {
    const rtl = direction === "rtl";
    near(
      origin.x,
      rtl ? t.right : t.left,
      `origin at the trigger's ${rtl ? "right" : "left"} (inline-start) corner`
    );
  }
}

interface OriginCase {
  cross: Cross;
  open: (place: Place) => Promise<HTMLElement>;
  /** A popup that stays open after this one closes (the submenu's parent). */
  parentSlot?: string;
  /** The side the popup opens on from the RTL trigger, when it differs. */
  rtlSide?: "left";
  /** The side the popup opens on when there is room (the "below" trigger). */
  side?: "bottom" | "right";
  slot: string;
}

/**
 * Opens the popup from each trigger in turn and checks its origin: upper,
 * bottom and RTL. The direction is set on the document before every open, and
 * the popup's computed direction is asserted: the popup is portaled to
 * `<body>`, so a `dir` on a wrapper never reaches it, and Base UI places it
 * and mirrors its origin from the popup's own direction.
 */
const rtlSideFor = (place: Place, c: OriginCase) =>
  place === "rtl" ? c.rtlSide : undefined;

async function playOrigin(c: OriginCase) {
  const near = c.side ?? "bottom";
  const flipped = near === "bottom" ? "top" : "right";
  const html = document.documentElement;
  const previousDir = html.getAttribute("dir");
  try {
    for (const place of ["below", "above", "rtl"] as const) {
      const direction = place === "rtl" ? "rtl" : "ltr";
      html.setAttribute("dir", direction);
      // biome-ignore lint/performance/noAwaitInLoops: one popup open at a time
      const trigger = await c.open(place);
      const popup = await settledPopup(c.slot);
      expect(getComputedStyle(popup).direction, "popup direction").toBe(
        direction
      );
      expect(getComputedStyle(trigger).direction, "trigger direction").toBe(
        direction
      );
      expectOriginOnTrigger(popup, trigger, {
        cross: c.cross,
        direction,
        place,
        side: place === "above" ? flipped : (rtlSideFor(place, c) ?? near),
      });
      await closeAll(c.slot);
      if (c.parentSlot) {
        const parent = c.parentSlot;
        // Base UI's `closeParentOnEsc` is false: the parent stays open.
        if (openPopup(parent)) {
          await userEvent.keyboard("{Escape}");
        }
        await waitFor(() => expect(openPopup(parent)).toBeNull(), {
          timeout: 5000,
        });
      }
    }
  } finally {
    if (previousDir === null) {
      html.removeAttribute("dir");
    } else {
      html.setAttribute("dir", previousDir);
    }
  }
}

const clickTrigger = async (place: Place) => {
  const trigger = byTestId(`trigger-${place}`);
  await userEvent.click(trigger);
  return trigger;
};

export const PopoverOrigin: Story = {
  play: () =>
    playOrigin({
      slot: "popover-content",
      cross: "center",
      open: clickTrigger,
    }),
  render: () => (
    <Stage
      render={(place) => (
        <Popover>
          <PopoverTrigger
            data-testid={`trigger-${place}`}
            render={<Button variant="outline" />}
          >
            Popover {place}
          </PopoverTrigger>
          <PopoverContent>
            <PopoverTitle>Dimensions</PopoverTitle>
            <PopoverDescription>
              Set the dimensions for the layer.
            </PopoverDescription>
          </PopoverContent>
        </Popover>
      )}
    />
  ),
};

export const DropdownMenuOrigin: Story = {
  play: () =>
    playOrigin({
      slot: "dropdown-menu-content",
      cross: "start",
      open: clickTrigger,
    }),
  render: () => (
    <Stage
      render={(place) => (
        <DropdownMenu>
          <DropdownMenuTrigger
            data-testid={`trigger-${place}`}
            render={<Button variant="outline" />}
          >
            Menu {place}
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Billing</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    />
  ),
};

/**
 * A dropdown whose submenu is pinned to an explicit side, or left default.
 * With `element`, the row's label is an element of its own, so no flex-1
 * text span fills the row and the chevron's own margin places it.
 */
function SubFixture({
  element,
  id,
  side,
}: {
  element?: boolean;
  id: string;
  side?: "left" | "right";
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        data-testid={`trigger-${id}`}
        render={<Button variant="outline" />}
      >
        Submenu {id}
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger data-testid={`subtrigger-${id}`}>
            {element ? <span>Invite users</span> : "Invite users"}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent side={side}>
            <DropdownMenuItem>Email</DropdownMenuItem>
            <DropdownMenuItem>Message</DropdownMenuItem>
            <DropdownMenuItem>More…</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface Slide {
  duration: number;
  easing: string;
  from: string;
  side: string | null;
  to: string;
}

/**
 * Records every `translate` transition the submenu starts, from the
 * `transitionrun` event itself: a poll can miss a 120ms transition on a busy
 * machine, an event cannot.
 */
function watchSlides() {
  const runs: Slide[] = [];
  const onRun = (event: TransitionEvent) => {
    const el = event.target as HTMLElement;
    if (
      event.propertyName !== "translate" ||
      el.getAttribute("data-slot") !== "dropdown-menu-sub-content"
    ) {
      return;
    }
    const run = el
      .getAnimations()
      .find(
        (a): a is CSSTransition =>
          a instanceof CSSTransition && a.transitionProperty === "translate"
      );
    const effect = run?.effect as KeyframeEffect | null | undefined;
    if (!effect) {
      return;
    }
    const frames = effect.getKeyframes();
    runs.push({
      side: el.getAttribute("data-side"),
      from: String(frames[0]?.translate),
      to: String(frames.at(-1)?.translate),
      duration: Number(effect.getComputedTiming().duration),
      easing: String(effect.getTiming().easing),
    });
  };
  document.addEventListener("transitionrun", onRun, true);
  return {
    runs,
    stop: () => document.removeEventListener("transitionrun", onRun, true),
  };
}

/** The x offset of a computed `translate` value, `NaN` for `none`. */
const slideX = (value: string) => Number.parseFloat(value);

async function withDir(direction: "ltr" | "rtl", body: () => Promise<void>) {
  const html = document.documentElement;
  const previous = html.getAttribute("dir");
  html.setAttribute("dir", direction);
  try {
    await body();
  } finally {
    if (previous === null) {
      html.removeAttribute("dir");
    } else {
      html.setAttribute("dir", previous);
    }
  }
}

/** Opens fixture `id`'s submenu by pointer and returns it at rest. */
async function openSub(id: string) {
  await userEvent.click(byTestId(`trigger-${id}`));
  await settledPopup("dropdown-menu-content");
  const trigger = await waitFor(() => byTestId(`subtrigger-${id}`));
  await userEvent.click(trigger);
  return { trigger, popup: await settledPopup("dropdown-menu-sub-content") };
}

/**
 * Closes the submenu with the arrow key for the reading direction (ArrowLeft
 * in LTR, ArrowRight in RTL, whatever side the submenu is on), then the menu.
 * Not by Escape or a submenu item press: neither runs an exit transition here.
 * Base UI marks an Escape close (and, it seems, a close with no reason, which
 * is how a submenu closes with its menu) as a dismissal, sets `data-instant`,
 * and base.css skips the transition.
 */
async function closeSubByArrow(direction: "ltr" | "rtl") {
  const sub = openPopup("dropdown-menu-sub-content");
  const item = sub?.querySelector<HTMLElement>('[role="menuitem"]');
  if (!item) {
    throw new Error("no item in the open submenu");
  }
  item.focus();
  await waitFor(() => expect(document.activeElement).toBe(item));
  await userEvent.keyboard(
    direction === "ltr" ? "{ArrowLeft}" : "{ArrowRight}"
  );
  await waitFor(
    () => expect(openPopup("dropdown-menu-sub-content")).toBeNull(),
    { timeout: 5000 }
  );
  await userEvent.keyboard("{Escape}");
  await waitFor(() => expect(openPopup("dropdown-menu-content")).toBeNull(), {
    timeout: 5000,
  });
}

/**
 * Opens and closes fixture `id`'s submenu and checks its side, its rectangle
 * against the row and its open and close slide: 4px from the row toward the
 * popup's side, the full base duration in and two thirds of it out.
 */
async function checkSub(id: string, side: "left" | "right") {
  const watch = watchSlides();
  try {
    const { trigger, popup } = await openSub(id);
    expect(popup.getAttribute("data-side"), `${id}: side`).toBe(side);
    const box = popup.getBoundingClientRect();
    const t = trigger.getBoundingClientRect();
    const right = side === "right";
    expect(
      Math.abs((right ? box.left : box.right) - (right ? t.right : t.left)),
      `${id}: popup flush with the row's ${side} edge`
    ).toBeLessThanOrEqual(TOLERANCE);
    await closeSubByArrow(
      document.documentElement.getAttribute("dir") === "rtl" ? "rtl" : "ltr"
    );
    const base = Number.parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue(
        "--duration-base"
      )
    );
    const [open, close] = watch.runs;
    // The popup slides in from the row: from x -4px on the right, +4px on
    // the left, and back out the same way.
    const toward = right ? -4 : 4;
    expect(open, `${id}: open slide ran`).toBeDefined();
    expect(slideX(open.from), `${id}: open slide from`).toBe(toward);
    expect(open.duration, `${id}: open duration`).toBe(base);
    expect(close, `${id}: close slide ran`).toBeDefined();
    expect(slideX(close.to), `${id}: close slide to`).toBe(toward);
    expect(close.duration, `${id}: close duration`).toBeCloseTo((base * 2) / 3);
  } finally {
    watch.stop();
  }
}

export const DropdownMenuSubOrigin: Story = {
  play: async () => {
    await playOrigin({
      slot: "dropdown-menu-sub-content",
      cross: "aligned-edge",
      // With no `side`, it opens on the row's inline end: right for the
      // upper and bottom triggers (start and end alignment), left for RTL.
      side: "right",
      rtlSide: "left",
      parentSlot: "dropdown-menu-content",
      open: async (place) => {
        await clickTrigger(place);
        const parent = await settledPopup("dropdown-menu-content");
        expect(parent.getAttribute("data-side"), "parent menu side").toBe(
          place === "above" ? "top" : "bottom"
        );
        const sub = await waitFor(() => byTestId(`subtrigger-${place}`));
        await userEvent.click(sub);
        return sub;
      },
    });

    // The slide runs for the default side in both directions.
    await withDir("ltr", () => checkSub("below", "right"));
    await withDir("rtl", () => checkSub("rtl", "left"));

    // An explicit physical side is kept in either direction.
    await withDir("rtl", () => checkSub("rtl-right", "right"));
    await withDir("ltr", () => checkSub("ltr-left", "left"));

    // Keyboard under RTL: ArrowLeft opens the submenu, ArrowRight closes it.
    await withDir("rtl", async () => {
      await userEvent.click(byTestId("trigger-rtl"));
      await settledPopup("dropdown-menu-content");
      const row = await waitFor(() => byTestId("subtrigger-rtl"));
      row.focus();
      await waitFor(() => expect(document.activeElement).toBe(row));
      await userEvent.keyboard("{ArrowLeft}");
      const sub = await settledPopup("dropdown-menu-sub-content");
      expect(sub.getAttribute("data-side"), "keyboard-opened side").toBe(
        "left"
      );
      await waitFor(() =>
        expect(sub.contains(document.activeElement)).toBe(true)
      );
      await userEvent.keyboard("{ArrowRight}");
      await waitFor(
        () => expect(openPopup("dropdown-menu-sub-content")).toBeNull(),
        { timeout: 5000 }
      );
      await waitFor(() => expect(document.activeElement).toBe(row));
      await userEvent.keyboard("{Escape}");
      await waitFor(
        () => expect(openPopup("dropdown-menu-content")).toBeNull(),
        { timeout: 5000 }
      );
    });
  },
  render: () => (
    <Stage
      extra={
        <div className="mt-6 flex justify-center gap-6">
          <div dir="rtl">
            <DirectionProvider direction="rtl">
              <SubFixture id="rtl-right" side="right" />
            </DirectionProvider>
          </div>
          <SubFixture id="ltr-left" side="left" />
        </div>
      }
      render={(place) => <SubFixture id={place} />}
    />
  ),
};

/**
 * Which way the rendered chevron points on screen: the x of its apex (the
 * middle of the stroke) against the x midpoint of its two ends, all read
 * through the path's screen matrix, so a swapped icon and a mirroring
 * transform both count.
 */
function chevronPoints(svg: SVGSVGElement): "left" | "right" {
  const path = svg.querySelector<SVGGeometryElement>("path, polyline");
  const matrix = path?.getScreenCTM();
  if (!(path && matrix)) {
    throw new Error("the sub-trigger chevron has no drawn stroke");
  }
  const length = path.getTotalLength();
  const at = (distance: number) =>
    new DOMPoint(
      path.getPointAtLength(distance).x,
      path.getPointAtLength(distance).y
    ).matrixTransform(matrix);
  const apex = at(length / 2);
  const ends = (at(0).x + at(length).x) / 2;
  return apex.x < ends ? "left" : "right";
}

/**
 * Opens fixture `id`'s submenu and checks that the row's chevron points to
 * the side the submenu really opened on, by its `data-side` and its edge
 * against the row's, and that the chevron sits at the row's inline end, its
 * padding away from the row's edge in the row's own direction.
 */
async function checkChevron(id: string, expected: "left" | "right") {
  const { trigger, popup } = await openSub(id);
  const row = trigger.getBoundingClientRect();
  const sub = popup.getBoundingClientRect();
  expect(popup.getAttribute("data-side"), `${id}: submenu side`).toBe(expected);
  // The fixture's side offset is 0, so the submenu's facing edge meets the
  // row's outer edge on that side; a submenu above or below the row fails.
  expect(
    Math.abs(expected === "left" ? sub.right - row.left : sub.left - row.right),
    `${id}: submenu flush with the row's ${expected} edge`
  ).toBeLessThanOrEqual(TOLERANCE);
  const svg = trigger.querySelector<SVGSVGElement>(":scope > svg");
  if (!svg) {
    throw new Error(`${id}: no chevron in the row`);
  }
  expect(chevronPoints(svg), `${id}: chevron points`).toBe(expected);
  const style = getComputedStyle(trigger);
  const icon = svg.getBoundingClientRect();
  const end =
    style.direction === "rtl"
      ? icon.left - row.left - Number.parseFloat(style.paddingLeft)
      : row.right - icon.right - Number.parseFloat(style.paddingRight);
  expect(
    Math.abs(end),
    `${id}: chevron at the row's inline end (${style.direction})`
  ).toBeLessThanOrEqual(TOLERANCE);
  // Base UI's arrow keys follow the provider, not the row's CSS direction.
  await closeSubByArrow(expected === "left" ? "rtl" : "ltr");
}

export const DropdownMenuSubChevron: Story = {
  play: async () => {
    // The documented set-up: `dir="rtl"` on the page and the provider.
    await withDir("rtl", () => checkChevron("chevron-rtl", "left"));
    // The same with an element label: the chevron's own margin places it.
    await withDir("rtl", () => checkChevron("chevron-rtl-element", "left"));
    // The provider alone on an LTR page: the submenu still opens on the left.
    await withDir("ltr", () => checkChevron("chevron-rtl", "left"));
    // No provider: unchanged.
    await withDir("ltr", () => checkChevron("chevron-ltr", "right"));
  },
  render: () => (
    <div className="flex min-h-svh justify-center gap-6 p-6">
      <DirectionProvider direction="rtl">
        <SubFixture id="chevron-rtl" />
      </DirectionProvider>
      <DirectionProvider direction="rtl">
        <SubFixture element id="chevron-rtl-element" />
      </DirectionProvider>
      <SubFixture id="chevron-ltr" />
    </div>
  ),
};

export const SelectOrigin: Story = {
  play: () =>
    playOrigin({ slot: "select-content", cross: "center", open: clickTrigger }),
  render: () => (
    <Stage
      render={(place) => (
        <Select items={FRUITS}>
          <SelectTrigger className="w-48" data-testid={`trigger-${place}`}>
            <SelectValue placeholder={`Select ${place}`} />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(FRUITS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    />
  ),
};

export const ComboboxOrigin: Story = {
  play: () =>
    playOrigin({
      slot: "combobox-content",
      cross: "start",
      // The popup is anchored to the input itself (not its input group).
      open: async (place) => {
        const input = await clickTrigger(place);
        await userEvent.keyboard("{ArrowDown}");
        return input;
      },
    }),
  render: () => (
    <Stage
      render={(place) => (
        <Combobox items={FRAMEWORKS}>
          <ComboboxInput
            data-testid={`trigger-${place}`}
            placeholder={`Framework ${place}`}
          />
          <ComboboxContent>
            <ComboboxEmpty>No items found.</ComboboxEmpty>
            <ComboboxList>
              {(item: string) => (
                <ComboboxItem key={item} value={item}>
                  {item}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      )}
    />
  ),
};

export const TooltipOrigin: Story = {
  play: () =>
    playOrigin({
      slot: "tooltip-content",
      cross: "center",
      open: async (place) => {
        const trigger = byTestId(`trigger-${place}`);
        await userEvent.hover(trigger);
        return trigger;
      },
    }),
  render: () => (
    <Stage
      render={(place) => (
        <Tooltip>
          <TooltipTrigger
            data-testid={`trigger-${place}`}
            render={<Button variant="outline" />}
          >
            Tooltip {place}
          </TooltipTrigger>
          {/* Opens below like the others; the bottom trigger flips it above. */}
          <TooltipContent side="bottom">Add to library</TooltipContent>
        </Tooltip>
      )}
    />
  ),
};
