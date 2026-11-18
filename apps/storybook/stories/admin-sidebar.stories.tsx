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
      const el = document.querySelector<HTMLElement>(
        '[data-slot="sidebar"][data-mobile="true"]'
      );
      expect(el).not.toBeNull();
      return el as HTMLElement;
    });
    await expect(drawer).toHaveAttribute("data-swipe-direction", side);

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
