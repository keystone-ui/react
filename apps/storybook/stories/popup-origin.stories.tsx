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
 * The submenu opens to the right in all three cases, with start, end and start
 * alignment respectively. Its origin shares the row's right-edge x coordinate
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
function Stage({ render }: { render: (place: Place) => React.ReactNode }) {
  return (
    <div className="min-h-svh p-6">
      <div className="flex justify-center" data-place="below">
        {render("below")}
      </div>
      <div className="mt-6 flex justify-center" data-place="rtl" dir="rtl">
        <DirectionProvider direction="rtl">{render("rtl")}</DirectionProvider>
      </div>
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
    side: "top" | "bottom" | "right";
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

  if (side === "right") {
    near(origin.x, t.right, "origin on the trigger's right edge");
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
        side: place === "above" ? flipped : near,
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

export const DropdownMenuSubOrigin: Story = {
  play: () =>
    playOrigin({
      slot: "dropdown-menu-sub-content",
      cross: "aligned-edge",
      // Physical `side="right"`: it opens to the right in all three cases,
      // with start, end and start alignment respectively.
      side: "right",
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
    }),
  render: () => (
    <Stage
      render={(place) => (
        <DropdownMenu>
          <DropdownMenuTrigger
            data-testid={`trigger-${place}`}
            render={<Button variant="outline" />}
          >
            Submenu {place}
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger data-testid={`subtrigger-${place}`}>
                Invite users
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem>Email</DropdownMenuItem>
                <DropdownMenuItem>Message</DropdownMenuItem>
                <DropdownMenuItem>More…</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    />
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
