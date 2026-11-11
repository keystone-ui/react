import { expect, type Locator, type Page, test } from "@playwright/test";

import { gotoPreview } from "./preview";

/**
 * admin-01's sidebar fades its hover and active colours instead of snapping.
 *
 * The menu button used to transition only `width,height,padding`, so its
 * background and text colour changed in one frame while every keystone Button
 * beside it fades them. The badge's colour follows the button's hover through
 * `peer-hover/menu-button:`, and the rail's hover line lives on `::after`,
 * which does not inherit the element's transition, so both need their own.
 *
 * Only a browser resolves the Tailwind classes to `transition-*` values, so
 * this reads computed style. It reads it after `data-instant` has cleared:
 * while that is set the menu button is `transition-none` on purpose.
 */

interface Motion {
  duration: string;
  property: string;
}

function motion(el: Locator, pseudo?: string): Promise<Motion> {
  return el.evaluate((node, p) => {
    const style = getComputedStyle(node, p);
    return {
      duration: style.transitionDuration,
      property: style.transitionProperty,
    };
  }, pseudo ?? null);
}

/** The duration paired with `name` in a computed `transition-*` list. */
function durationOf(m: Motion, name: string): number {
  const properties = m.property.split(",").map((p) => p.trim());
  const durations = m.duration.split(",").map((d) => Number.parseFloat(d));
  const index = properties.indexOf(name);
  expect(index, `${name} in "${m.property}"`).toBeGreaterThanOrEqual(0);
  // CSS repeats the duration list to the length of the property list.
  return durations[index % durations.length] ?? Number.NaN;
}

async function open(page: Page) {
  await gotoPreview(page, "block-admin-01");
  await expect(
    page.locator('[data-slot="sidebar-wrapper"]:not([data-instant])')
  ).toHaveCount(1);
  return {
    badge: page.locator('[data-slot="sidebar-menu-badge"]').first(),
    button: page
      .locator(
        '[data-slot="sidebar-content"] [data-slot="sidebar-menu-button"]'
      )
      .first(),
    rail: page.locator('[data-slot="sidebar-rail"]'),
  };
}

test.describe("admin-01 sidebar motion", () => {
  test("transitions the colours its hover and active states change", async ({
    page,
  }) => {
    const { badge, button, rail } = await open(page);

    const buttonMotion = await motion(button);
    for (const name of [
      "width",
      "height",
      "padding",
      "background-color",
      "color",
      "box-shadow",
    ]) {
      durationOf(buttonMotion, name);
    }
    durationOf(await motion(badge), "color");
    durationOf(await motion(rail, "::after"), "background-color");
  });

  test.describe("with motion allowed", () => {
    test.use({ reducedMotion: "no-preference" });

    test("times the fade with --duration-fast", async ({ page }) => {
      const { badge, button, rail } = await open(page);
      expect(durationOf(await motion(button), "background-color")).toBe(0.125);
      expect(durationOf(await motion(badge), "color")).toBe(0.125);
      expect(
        durationOf(await motion(rail, "::after"), "background-color")
      ).toBe(0.125);
    });
  });
});
