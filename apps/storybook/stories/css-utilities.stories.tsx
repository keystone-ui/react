import { Button } from "@keystoneui/react/button";
import { Input } from "@keystoneui/react/input";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor, within } from "storybook/test";

/**
 * The CSS-only utilities in `@keystoneui/react/base.css`. They have no
 * component, so this file is where a browser checks them.
 */
const meta = {
  title: "Utilities/CSS Utilities",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const ROWS = Array.from({ length: 30 }, (_, i) => `Message ${i + 1}`);

export const ScrollFade: Story = {
  render: () => (
    <div className="flex gap-6">
      <ul
        className="ks-scroll-fade h-48 w-56 overflow-y-auto rounded-lg border p-2"
        data-testid="scrolls"
      >
        {ROWS.map((row) => (
          <li className="py-1 text-sm" key={row}>
            {row}
          </li>
        ))}
      </ul>
      <ul
        className="ks-scroll-fade h-48 w-56 overflow-y-auto rounded-lg border p-2"
        data-testid="fits"
      >
        <li className="py-1 text-sm">Fits without scrolling</li>
      </ul>
      <div
        className="ks-scroll-fade-x flex w-56 gap-2 overflow-x-auto rounded-lg border p-2"
        data-testid="scrolls-x"
      >
        {ROWS.slice(0, 12).map((row) => (
          <span
            className="shrink-0 rounded-md bg-muted px-2 py-1 text-xs"
            key={row}
          >
            {row}
          </span>
        ))}
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const scrolls = canvas.getByTestId("scrolls");
    const fade = (el: HTMLElement, prop: string) =>
      Number.parseFloat(getComputedStyle(el).getPropertyValue(prop));

    await expect(getComputedStyle(scrolls).maskImage).toContain("gradient");

    // The keyframes ramp each fade over the outer 10% of the scroll range, so
    // one pixel of offset moves a fade by 10 / range: 10 / 666 ≈ 0.015 here,
    // the value CI once saw. `toBeCloseTo(x, 1)` allows |diff| < 0.05, about
    // three pixels; a broken animation leaves the properties at 0 or 1.
    // Both reads share one `waitFor`: the end fade stays 1 for the first 90%
    // of the range, so only the start fade proves the list is at the top.

    // At the top: no start fade, an end fade because there is more below.
    await waitFor(async () => {
      await expect(fade(scrolls, "--ks-scroll-fade-start")).toBeCloseTo(0, 1);
      await expect(fade(scrolls, "--ks-scroll-fade-end")).toBeCloseTo(1, 1);
    });

    // At the bottom: the start fade appears and the end fade clears.
    scrolls.scrollTop = scrolls.scrollHeight;
    await waitFor(async () => {
      await expect(fade(scrolls, "--ks-scroll-fade-start")).toBeCloseTo(1, 1);
      await expect(fade(scrolls, "--ks-scroll-fade-end")).toBeCloseTo(0, 1);
    });

    // A container with nothing to scroll has an inactive timeline, so the
    // animation applies nothing and both properties keep their exact initial
    // value of 0.
    const fits = canvas.getByTestId("fits");
    await waitFor(async () => {
      await expect(fade(fits, "--ks-scroll-fade-start")).toBe(0);
      await expect(fade(fits, "--ks-scroll-fade-end")).toBe(0);
    });
  },
};

/** The custom browser commands registered in vitest.config.ts. */
interface RealCommands {
  screenshotBase64: (selector: string) => Promise<string>;
}

/** Vitest's Playwright commands; absent when Storybook runs the play. */
const realCommands = () =>
  (globalThis as { __realCommands?: RealCommands }).__realCommands;

/**
 * Mean luminance (0 black … 255 white) of the painted pixels at the far
 * left, far right, top and bottom of an element, read from a real
 * screenshot. A masked-out edge shows the white page behind it; an unmasked
 * edge shows the black content.
 */
async function edgeLuminance(testId: string) {
  const commands = realCommands();
  if (!commands) {
    return null;
  }
  const base64 = await commands.screenshotBase64(`[data-testid="${testId}"]`);
  const blob = await (await fetch(`data:image/png;base64,${base64}`)).blob();
  const bitmap = await createImageBitmap(blob);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  ctx.drawImage(bitmap, 0, 0);
  const at = (x: number, y: number) => {
    const [r, g, b] = ctx.getImageData(x, y, 1, 1).data;
    return Math.round((r + g + b) / 3);
  };
  const midX = Math.floor(bitmap.width / 2);
  const midY = Math.floor(bitmap.height / 2);
  return {
    left: at(1, midY),
    right: at(bitmap.width - 2, midY),
    top: at(midX, 1),
    bottom: at(midX, bitmap.height - 2),
  };
}

const FADED = 200;
const SOLID = 60;

/**
 * The fade must sit on the edge with more content beyond it, in either
 * writing direction. In right-to-left the inline start is the RIGHT edge:
 * at the start, more content lies to the LEFT, so only the left edge fades.
 * Pixels from a real screenshot, so a gradient pointing the wrong way fails
 * whatever the computed properties say.
 */
export const ScrollFadeDirections: Story = {
  tags: ["!dev", "!autodocs"],
  render: () => (
    <div className="flex flex-col gap-4 bg-white p-4">
      <div
        className="ks-scroll-fade-x h-8 w-56 overflow-x-auto [scrollbar-width:none]"
        data-testid="ltr-x"
      >
        <div className="h-full w-[800px] bg-black" />
      </div>
      <div
        className="ks-scroll-fade-x h-8 w-56 overflow-x-auto [scrollbar-width:none]"
        data-testid="rtl-x"
        dir="rtl"
      >
        <div className="h-full w-[800px] bg-black" />
      </div>
      <div
        className="ks-scroll-fade h-32 w-8 overflow-y-auto [scrollbar-width:none]"
        data-testid="y"
      >
        <div className="h-[600px] w-full bg-black" />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const fade = (el: HTMLElement, prop: string) =>
      Number.parseFloat(getComputedStyle(el).getPropertyValue(prop));
    const rtl = canvas.getByTestId("rtl-x");

    // The timeline itself is direction-aware: at the start, no start fade.
    await waitFor(async () => {
      await expect(fade(rtl, "--ks-scroll-fade-start")).toBeCloseTo(0, 1);
      await expect(fade(rtl, "--ks-scroll-fade-end")).toBeCloseTo(1, 1);
    });

    if (!realCommands()) {
      return;
    }

    // At the start of each scroller.
    const ltrStart = await edgeLuminance("ltr-x");
    await expect(ltrStart?.left).toBeLessThan(SOLID);
    await expect(ltrStart?.right).toBeGreaterThan(FADED);

    const rtlStart = await edgeLuminance("rtl-x");
    await expect(rtlStart?.right).toBeLessThan(SOLID);
    await expect(rtlStart?.left).toBeGreaterThan(FADED);

    const yStart = await edgeLuminance("y");
    await expect(yStart?.top).toBeLessThan(SOLID);
    await expect(yStart?.bottom).toBeGreaterThan(FADED);

    // At the end: right-to-left scrolls to a negative scrollLeft.
    rtl.scrollLeft = -(rtl.scrollWidth - rtl.clientWidth);
    await waitFor(async () => {
      await expect(fade(rtl, "--ks-scroll-fade-start")).toBeCloseTo(1, 1);
      await expect(fade(rtl, "--ks-scroll-fade-end")).toBeCloseTo(0, 1);
    });
    const rtlEnd = await edgeLuminance("rtl-x");
    await expect(rtlEnd?.right).toBeGreaterThan(FADED);
    await expect(rtlEnd?.left).toBeLessThan(SOLID);
  },
};

export const Shimmer: Story = {
  render: () => (
    <p className="ks-shimmer font-medium text-sm" data-testid="ks-shimmer">
      Thinking…
    </p>
  ),
  play: async ({ canvasElement }) => {
    const text = within(canvasElement).getByTestId("ks-shimmer");
    const style = getComputedStyle(text);
    await expect(style.backgroundClip).toBe("text");
    await expect(style.animationName).toBe("ks-shimmer-sweep");
    await expect(style.animationIterationCount).toBe("infinite");
  },
};

/**
 * The control ladder reads `--ks-control-*`. The compact values here are the
 * `density/compact` registry item's: one container override moves every
 * control together, and the default ladder is untouched outside it.
 */
const COMPACT =
  "[--ks-control-xs:calc(var(--spacing)*6)] [--ks-control-sm:calc(var(--spacing)*7)] [--ks-control-md:calc(var(--spacing)*8)] [--ks-control-lg:calc(var(--spacing)*10)]";

export const Density: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2" data-testid="default">
        <Input placeholder="Search" />
        <Button>Save</Button>
        <Button size="sm">Small</Button>
      </div>
      <div
        className={`flex items-center gap-2 ${COMPACT}`}
        data-testid="compact"
      >
        <Input placeholder="Search" />
        <Button>Save</Button>
        <Button size="sm">Small</Button>
        <Button size="xs">Tiny</Button>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const heights = (testId: string) =>
      [...canvas.getByTestId(testId).children].map(
        (el) => (el as HTMLElement).getBoundingClientRect().height
      );

    await expect(heights("default")).toEqual([40, 40, 32]);
    // Input and default Button stay level with each other at every density.
    await expect(heights("compact")).toEqual([32, 32, 28, 24]);
  },
};
