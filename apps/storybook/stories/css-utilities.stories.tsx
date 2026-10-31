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

    // At the top: no start fade, an end fade because there is more below.
    await waitFor(() => expect(fade(scrolls, "--ks-scroll-fade-end")).toBe(1));
    await expect(fade(scrolls, "--ks-scroll-fade-start")).toBe(0);

    // At the bottom: the start fade appears and the end fade clears.
    scrolls.scrollTop = scrolls.scrollHeight;
    await waitFor(() => expect(fade(scrolls, "--ks-scroll-fade-end")).toBe(0));
    await expect(fade(scrolls, "--ks-scroll-fade-start")).toBe(1);

    // A container with nothing to scroll has an inactive timeline: no fade.
    const fits = canvas.getByTestId("fits");
    await expect(fade(fits, "--ks-scroll-fade-start")).toBe(0);
    await expect(fade(fits, "--ks-scroll-fade-end")).toBe(0);
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
