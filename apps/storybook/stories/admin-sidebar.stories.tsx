import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor } from "storybook/test";

import {
  Sidebar,
  SidebarContent,
  SidebarProvider,
  SidebarTrigger,
} from "../../docs/demos/blocks/admin-01/sidebar";

/**
 * admin-01's Sidebar is not a keystone component (it lives with the block and
 * is installed as the `sidebar` registry item), but its phone drawer is built
 * on keystone's Drawer and has to override the Drawer's own width. These
 * stories host that measurement.
 */
const meta = {
  title: "Blocks/AdminSidebar",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** Vitest's tester page; absent when Storybook runs the play. */
interface RealPage {
  viewport: (width: number, height: number) => Promise<void>;
}
const realPage = () => (globalThis as { __realPage?: RealPage }).__realPage;

/** Vitest browser mode's default tester size, restored after each play. */
const DEFAULT_VIEWPORT = { width: 414, height: 896 } as const;

/** Phone widths, plus 700 (between `sm` and the 768px desktop breakpoint). */
const WIDTHS = [360, 384, 390, 700] as const;

/** `SIDEBAR_WIDTH_MOBILE`, 18rem at the 16px root size. */
const PHONE_DRAWER_WIDTH = "288px";

function PhoneSidebar({ side }: { side: "left" | "right" }) {
  return (
    <SidebarProvider>
      <Sidebar side={side}>
        <SidebarContent>
          <p className="p-4">Navigation</p>
        </SidebarContent>
      </Sidebar>
      <main className="p-4">
        <SidebarTrigger />
      </main>
    </SidebarProvider>
  );
}

/** The phone drawer's popup. */
const PHONE_DRAWER = '[data-sidebar="sidebar"][data-mobile="true"]';

/** The popup's own transition of `transform`, once Base UI has started it. */
function transformTransition(el: HTMLElement): CSSTransition | undefined {
  return el
    .getAnimations()
    .find(
      (a): a is CSSTransition =>
        a instanceof CSSTransition && a.transitionProperty === "transform"
    );
}

/** The popup's left edge in the viewport, to a tenth of a pixel. */
const leftEdge = (el: HTMLElement) =>
  Math.round(el.getBoundingClientRect().x * 10) / 10;

/** The horizontal translation of the popup's computed `transform`, in px. */
const transformX = (el: HTMLElement) =>
  Math.round(new DOMMatrixReadOnly(getComputedStyle(el).transform).m41 * 10) /
  10;

/**
 * Samples across the transition's active interval: every 5%. Fine enough that
 * a continuous slide compressed into its last 40% (`linear(0, 0 60%, 1)`)
 * still moves through 8 samples.
 */
const SLIDE_SAMPLES = 20;

/**
 * The largest share of the travel one sample step may cover. The drawer's own
 * easing moves about 20% in its steepest 5% and the late slide above 12.5%;
 * `steps(2)` jumps 50% and `steps(3)` 33%.
 */
const MAX_STEP_FRACTION = 0.3;

/** At least this many distinct positions: `steps(2)` gives three. */
const MIN_POSITIONS = 5;

/**
 * Checks that the phone drawer slides open rather than jumping. The computed
 * `transition-property` must name `transform` itself (never `all`), and the
 * popup's own `transform` transition must exist with a positive duration (a 0s
 * transform beside a 0.5s height is a jump). Seeking that transition across
 * its active interval (after any delay), the horizontal translation of the
 * computed transform must start at the off-screen offset, end at 0, never move
 * backwards, and cover the travel in small steps. Reading the transform matrix,
 * not the box, ties the slide to that transition: another animation (an
 * independent `translate`) cannot stand in for it. Seeking instead of racing
 * frames makes a slide that starts late read the same as one that starts at
 * once. Finishing it must leave the drawer at its open edge.
 */
async function expectSlideOpen(drawer: HTMLElement, side: "left" | "right") {
  // Reads only: the transition starts once Base UI drops data-starting-style.
  const transition = await waitFor(() => {
    const t = transformTransition(drawer);
    expect(t).toBeDefined();
    return t as CSSTransition;
  });
  await expect(
    getComputedStyle(drawer).transitionProperty.split(/,\s*/)
  ).toContain("transform");
  const { delay = 0, duration } = transition.effect?.getTiming() ?? {};
  const length = typeof duration === "number" ? duration : 0;
  await expect(length).toBeGreaterThan(0);

  const width = drawer.getBoundingClientRect().width;
  const offScreen = side === "left" ? -width : width;
  const open = side === "left" ? 0 : window.innerWidth - width;

  transition.pause();
  const xs: number[] = [];
  for (let i = 0; i <= SLIDE_SAMPLES; i++) {
    transition.currentTime = delay + (length * i) / SLIDE_SAMPLES;
    xs.push(transformX(drawer));
  }
  transition.finish();

  await expect(xs[0]).toBeCloseTo(offScreen, 0);
  await expect(xs.at(-1)).toBeCloseTo(0, 0);
  const steps = xs.slice(1).map((x, i) => (x - xs[i]) * Math.sign(-offScreen));
  // Never backwards (a tenth of a pixel of rounding allowed).
  await expect(Math.min(...steps)).toBeGreaterThanOrEqual(-0.1);
  await expect(Math.max(...steps)).toBeLessThanOrEqual(
    MAX_STEP_FRACTION * width
  );
  await expect(new Set(xs).size).toBeGreaterThanOrEqual(MIN_POSITIONS);
  await waitFor(() => expect(leftEdge(drawer)).toBeCloseTo(open, 0));
}

/** Whether any style rule's selector names a class using `cssVar`. */
function hasRuleFor(cssVar: string): boolean {
  const name = `(${cssVar})`;
  const visit = (rules: CSSRuleList): boolean =>
    Array.from(rules).some((rule) => {
      // Selectors escape the parentheses and dashes of an arbitrary value.
      if (
        rule instanceof CSSStyleRule &&
        rule.selectorText.replace(/\\/g, "").includes(name)
      ) {
        return true;
      }
      return "cssRules" in rule && visit((rule as CSSGroupingRule).cssRules);
    });
  return Array.from(document.styleSheets).some((sheet) => {
    try {
      return visit(sheet.cssRules);
    } catch {
      return false;
    }
  });
}

/**
 * Opens the phone drawer and reads its computed width at each viewport width.
 * The drawer is 18rem wide (`SIDEBAR_WIDTH_MOBILE`) at every phone width,
 * not the Drawer's own 75% of the viewport capped at 24rem from `sm` up.
 */
async function measurePhoneDrawer(
  canvasElement: HTMLElement,
  side: "left" | "right"
) {
  const page = realPage();
  if (!page) {
    return;
  }
  try {
    await page.viewport(WIDTHS[0], DEFAULT_VIEWPORT.height);
    // The phone branch has replaced the desktop sidebar (it renders nothing
    // in place until opened), so the trigger opens the drawer.
    await waitFor(() =>
      expect(canvasElement.querySelector('[data-slot="sidebar"]')).toBeNull()
    );
    const trigger = await waitFor(() => {
      const el = canvasElement.querySelector<HTMLButtonElement>(
        '[data-slot="sidebar-trigger"]'
      );
      expect(el).not.toBeNull();
      return el as HTMLButtonElement;
    });
    trigger.click();
    const drawer = await waitFor(() => {
      const el = document.querySelector<HTMLElement>(PHONE_DRAWER);
      expect(el).not.toBeNull();
      return el as HTMLElement;
    });
    await expect(drawer).toHaveAttribute("data-swipe-direction", side);

    // The Drawer's own motion reaches the popup: `base.css` keys it on
    // `[data-slot="drawer-content"]`, which a block's own `data-slot` on
    // DrawerContent would replace. And it really slides in.
    await expectSlideOpen(drawer, side);

    // Canary: the sidebar's own classes reached this stylesheet (it lives
    // outside the scanned sources), so a width below is not just a class that
    // was never generated.
    await expect(hasRuleFor("--sidebar-width")).toBe(true);

    const measured: Record<number, string> = {};
    for (const width of WIDTHS) {
      // biome-ignore lint/performance/noAwaitInLoops: one viewport at a time
      await page.viewport(width, DEFAULT_VIEWPORT.height);
      await waitFor(() => expect(window.innerWidth).toBe(width));
      // Still the phone drawer at every width measured.
      expect(drawer.isConnected).toBe(true);
      measured[width] = getComputedStyle(drawer).width;
    }

    await expect(measured).toEqual(
      Object.fromEntries(WIDTHS.map((w) => [w, PHONE_DRAWER_WIDTH]))
    );
  } finally {
    await page.viewport(DEFAULT_VIEWPORT.width, DEFAULT_VIEWPORT.height);
  }
}

export const PhoneDrawerWidthLeft: Story = {
  render: () => <PhoneSidebar side="left" />,
  play: ({ canvasElement }) => measurePhoneDrawer(canvasElement, "left"),
};

export const PhoneDrawerWidthRight: Story = {
  render: () => <PhoneSidebar side="right" />,
  play: ({ canvasElement }) => measurePhoneDrawer(canvasElement, "right"),
};
