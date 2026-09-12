import { expect, type Page, test } from "@playwright/test";

/**
 * The radius scale must stay proportional at every base.
 *
 * `--radius-sm` … `--radius-4xl` hold `calc()` expressions, so reading them
 * with `getPropertyValue` hands back the expression (`calc(0.875rem * .6)`),
 * not a length. Only applying one to a real element and reading the used value
 * proves what a consumer gets, which is why this is a browser test rather than
 * a `tests/` one -- the parser in `tests/css-tokens.ts` cannot evaluate
 * `calc()`.
 *
 * The scale used pixel offsets (`--radius - 4px` … `+ 16px`) until it was
 * rescaled to ratios. At the 0.625rem default the two agree exactly, so the
 * `default` case below doubles as the proof that the rescale changed nothing
 * for anyone who had not themed radius. `none` is the bug that motivated it:
 * under offsets `--radius: 0` left `--radius-4xl` at 16px and drove
 * `--radius-sm` to -4px, so /theme-builder's "sharp" preset never produced a
 * square corner.
 *
 * One probe element per tier, deliberately. Reassigning `border-radius` on a
 * single element and re-reading it returns the *first* tier's resolution for
 * every subsequent one -- Chromium memoises the resolved `var()` per element,
 * and the bug is silent: the assertion sees a plausible pixel value.
 */

const TIERS = ["sm", "md", "lg", "xl", "2xl", "3xl", "4xl"] as const;

/** The `--radius` presets /theme-builder ships, and the px each tier must give. */
const PRESETS: { name: string; value: string; expected: number[] }[] = [
  { name: "none", value: "0", expected: [0, 0, 0, 0, 0, 0, 0] },
  {
    name: "small (0.45rem)",
    value: "0.45rem",
    expected: [4.32, 5.76, 7.2, 10.08, 12.96, 15.84, 18.72],
  },
  {
    name: "default (0.625rem)",
    value: "0.625rem",
    expected: [6, 8, 10, 14, 18, 22, 26],
  },
  {
    name: "large (0.875rem)",
    value: "0.875rem",
    expected: [8.4, 11.2, 14, 19.6, 25.2, 30.8, 36.4],
  },
];

async function resolveScale(page: Page, radius: string): Promise<number[]> {
  return await page.evaluate(
    ({ radius: base, tiers }) => {
      document.documentElement.style.setProperty("--radius", base);

      const probes = tiers.map((tier) => {
        const el = document.createElement("div");
        el.style.cssText = `position:absolute;visibility:hidden;border-radius:var(--radius-${tier})`;
        document.body.append(el);
        return el;
      });

      const measured = probes.map((el) =>
        Number.parseFloat(getComputedStyle(el).borderTopLeftRadius)
      );

      for (const el of probes) {
        el.remove();
      }
      document.documentElement.style.removeProperty("--radius");
      return measured;
    },
    { radius, tiers: [...TIERS] }
  );
}

test.describe("radius scale", () => {
  for (const { name, value, expected } of PRESETS) {
    test(`resolves proportionally at ${name}`, async ({ page }) => {
      await page.goto("/docs/components/card");

      const measured = await resolveScale(page, value);

      for (const [index, tier] of TIERS.entries()) {
        expect(
          measured[index],
          `--radius-${tier} at --radius: ${value}`
        ).toBeCloseTo(expected[index], 1);
      }
    });
  }

  test("collapses every tier to zero at --radius: 0", async ({ page }) => {
    await page.goto("/docs/components/card");

    // Not merely "small": a residual or negative radius here is the old bug.
    expect(await resolveScale(page, "0")).toEqual([0, 0, 0, 0, 0, 0, 0]);
  });
});
