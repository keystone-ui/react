import { expect, type Page, test } from "@playwright/test";

import { demos } from "../demos";

/**
 * Controls sharing a row must share a height *and* a corner radius.
 *
 * `packages/ui/src/control-ladder.test.tsx` asserts what each component
 * what it *declares*. It cannot catch the other half of the problem: an author picking
 * `size="sm"` for one control and leaving its neighbour at `default`. That is a
 * composition mistake, it is invisible to every unit test, and it is what
 * shipped in `admin-01` — a 40px search field beside 32px filter buttons.
 *
 * Only a rendered page can see it, so this sweeps the block previews.
 *
 * ## Why radius is measured here and not in jsdom
 *
 * The radius arm exists because the height arm did not catch its own sibling
 * bug: `Button` and `Toggle` sat at `rounded-lg` (10px) while `Input`,
 * `InputGroup`, `SelectTrigger`, `NativeSelect` and `Textarea` were all
 * `rounded-md` (8px), so every toolbar in the library paired an 8px field with
 * 10px buttons. Both halves were individually "correct" — which is exactly why
 * a class-string assertion cannot see it. The mismatch only exists *between*
 * two components, and only a real browser resolves `var(--radius)` to a length.
 *
 * `borderTopLeftRadius` is enough for a single corner because every control the
 * sweep collects is standalone: `ButtonGroup` and `InputGroup` descendants are
 * excluded (their end caps are meant to differ), and `toggle-group-item` is not
 * in the selector.
 *
 * ## Why it groups by visual row rather than by parent
 *
 * The obvious implementation — "flex container whose direct children are all
 * controls" — breaks on the exact markup it needs to guard. `tickets-01`'s
 * toolbar wraps its mobile trigger in `<div className="shrink-0 sm:hidden">`
 * and its desktop cluster in `<div className="hidden sm:flex">`, so the outer
 * row's children are a control and two layout divs. A parent-based sweep skips
 * that row entirely, and the search field's height is never compared to
 * anything at any width. `admin-01` has the same shape.
 *
 * So: collect controls, group them by the vertical band they occupy, compare.
 * That is robust to wrappers, to `flex-wrap`, and to the `sm:hidden` fork.
 */

const BLOCK_NAMES = Object.keys(demos)
  .filter((name) => name.startsWith("block-"))
  .sort();

const WIDTHS = [375, 768, 1280];

/**
 * A trigger rendered through `render={<Button />}` does NOT emit
 * `data-slot="button"` — it emits its own slot. Both live mismatches were on
 * `dropdown-menu-trigger`, so a `[data-slot=button]` selector would have found
 * neither. Match on `data-slot` rather than tag names: Base UI renders a 1px
 * `position: fixed` hidden form-proxy input beside `select-trigger`, which a
 * tag-based selector would pick up as a control.
 *
 * `toggle-group` is here because the group carries the height; `toggle-group-item`
 * is deliberately absent, or every group interior becomes a trivially-equal row.
 */
const CONTROL_SELECTOR = [
  "button",
  "dropdown-menu-trigger",
  "select-trigger",
  "drawer-trigger",
  "popover-trigger",
  "combobox-trigger",
  "sidebar-trigger",
  "input",
  "input-group",
  "toggle",
  "toggle-group",
]
  .map((slot) => `[data-slot="${slot}"]`)
  .join(", ");

/**
 * Composites whose parts are designed to differ.
 *
 * `InputGroup` addons are `h-auto`, and an `auto`-sized `InputGroupButton`
 * renders one tier smaller on purpose (32px inside a 40px group). `ButtonGroup`
 * is `items-stretch`. Table cells hold their own affordance scale — `tickets-01`
 * puts a 28px inline-edit trigger beside a 32px status button in every row,
 * which is a separate design question from toolbar alignment.
 */
const EXCLUDED_ANCESTORS =
  '[data-slot="input-group"], [data-slot="button-group"], td, th';

/** 1px for subpixel rounding. Real mismatches here are 4px and 8px. */
const TOLERANCE = 1;

const SIDEBAR_TRIGGER = /Toggle Sidebar/i;

interface Row {
  heights: number[];
  labels: string[];
  radii: number[];
  slots: string[];
}

/** Every visual row holding more than one control. */
async function collectRows(page: Page): Promise<Row[]> {
  return await page.evaluate(
    ({ selector, excluded }) => {
      const controls = [...document.querySelectorAll(selector)]
        // `closest` matches the element itself, so this must start from the
        // parent -- otherwise every InputGroup excludes itself and the sweep
        // stops seeing the exact control that was 8px off in admin-01.
        .filter((el) => !el.parentElement?.closest(excluded))
        .map((el) => ({
          el,
          rect: el.getBoundingClientRect(),
          label: (el.textContent || "")
            .trim()
            .replace(/\s+/g, " ")
            .slice(0, 16),
          // Read here rather than in a second pass: `getComputedStyle` is the
          // only way to resolve `var(--radius)` to a length, and doing it while
          // the element is already in hand keeps one walk over the DOM.
          radius: Number.parseFloat(
            getComputedStyle(el).borderTopLeftRadius || "0"
          ),
          slot: el.getAttribute("data-slot") ?? "",
        }))
        .filter(({ rect }) => rect.height > 4 && rect.width > 4)
        .sort((a, b) => a.rect.top - b.rect.top);

      // Group into visual rows: two controls share a row when their vertical
      // ranges overlap by more than half the shorter one. Height alone is not
      // enough -- a 40px and a 32px control in an `items-center` row share a
      // centre but not a top.
      const rows: (typeof controls)[] = [];
      for (const control of controls) {
        const row = rows.find((candidate) =>
          candidate.some(({ rect }) => {
            const overlap =
              Math.min(rect.bottom, control.rect.bottom) -
              Math.max(rect.top, control.rect.top);
            return overlap > Math.min(rect.height, control.rect.height) / 2;
          })
        );
        if (row) {
          row.push(control);
        } else {
          rows.push([control]);
        }
      }

      return rows
        .filter((row) => row.length > 1)
        .map((row) => ({
          heights: row.map(({ rect }) => Math.round(rect.height * 10) / 10),
          labels: row.map(({ slot, label }) => `${slot}(${label})`),
          radii: row.map(({ radius }) => Math.round(radius * 10) / 10),
          slots: row.map(({ slot }) => slot),
        }));
    },
    { selector: CONTROL_SELECTOR, excluded: EXCLUDED_ANCESTORS }
  );
}

/**
 * Rows whose controls disagree on one dimension, reported with every member so
 * the failure names the row rather than just the delta.
 */
function mismatched(rows: Row[], dimension: "heights" | "radii"): string[] {
  return rows
    .filter((row) => {
      const values = row[dimension];
      return Math.max(...values) - Math.min(...values) > TOLERANCE;
    })
    .map(
      (row) => `${row.labels.join(" | ")} -> ${row[dimension].join("px, ")}px`
    );
}

/**
 * `admin-01` opens on Overview; its toolbars live behind nav items. Below `md`
 * the sidebar collapses into a drawer, so the nav item has to be revealed
 * before it can be clicked.
 *
 * Payments is swept as well as Users because it is a second toolbar with its
 * own control mix -- and a guard that only reaches the toolbar the bug was
 * found in stops guarding the moment someone writes the next one.
 *
 * Both get a search term typed into them before the sweep, because controls
 * that render only once a filter is applied are invisible to a sweep of the
 * resting page. `Clear all` is one of them, and it sits in the same row as the
 * 40px controls.
 */
async function openBlock(page: Page, name: string, section = "users") {
  await page.goto(`/preview/${name}`);
  if (name !== "block-admin-01") {
    return;
  }
  const label = section === "payments" ? "Payments" : "Users";
  const nav = page.getByRole("button", { name: label });
  if (!(await nav.isVisible())) {
    await page.getByRole("button", { name: SIDEBAR_TRIGGER }).click();
  }
  await nav.click();
  const search = page.getByLabel(
    section === "payments" ? "Search payments by email" : "Search users"
  );
  await expect(search).toBeVisible();

  // Type into it, which is what makes the conditional controls render. `Clear
  // all` only exists once something is applied, so a sweep of the resting
  // toolbar never sees it — and it is a button in the same row as the 40px
  // ones, exactly where a mismatch would hide.
  //
  // Settle on the input's own value rather than on `Clear all`: that button is
  // inside the `sm+` cluster on the payments toolbar, so waiting for it would
  // hang at 375px on the very width this sweep exists to cover.
  await search.fill("a");
  await expect(search).toHaveValue("a");
}

/**
 * Every block preview, plus `admin-01`'s Payments section: a second toolbar,
 * reachable only through its own nav item, that the per-block sweep would
 * otherwise never render.
 */
const TARGETS: readonly { id: string; name: string; section?: string }[] = [
  ...BLOCK_NAMES.map((name) => ({ id: name, name })),
  {
    id: "block-admin-01 payments",
    name: "block-admin-01",
    section: "payments",
  },
];

test.describe("controls sharing a row share a height", () => {
  for (const target of TARGETS) {
    for (const width of WIDTHS) {
      test(`${target.id} at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 1000 });
        await openBlock(page, target.name, target.section);

        expect(mismatched(await collectRows(page), "heights")).toEqual([]);
      });
    }
  }
});

test.describe("controls sharing a row share a radius", () => {
  for (const target of TARGETS) {
    for (const width of WIDTHS) {
      test(`${target.id} at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 1000 });
        await openBlock(page, target.name, target.section);

        expect(mismatched(await collectRows(page), "radii")).toEqual([]);
      });
    }
  }
});

/**
 * Without this, the suite goes green the day the selector stops matching, and
 * an assertion that passes because it measured nothing is worse than none.
 */
test.describe("the sweep is actually measuring something", () => {
  test("finds multi-control rows on the blocks that had the bugs", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 1000 });

    for (const name of ["block-admin-01", "block-tickets-01"]) {
      // biome-ignore lint/performance/noAwaitInLoops: one page, navigated in turn
      await openBlock(page, name);
      const rows = await collectRows(page);

      expect(rows.length, `${name} has rows worth comparing`).toBeGreaterThan(
        0
      );
    }
  });

  /**
   * Pins the absolute tier, not just agreement. A drift that moved every
   * control together would satisfy the sweep above and still be wrong.
   */
  test("renders the default tier at 40px", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 1000 });
    await openBlock(page, "block-tickets-01");

    const rows = await collectRows(page);
    const toolbar = rows.find((row) => row.slots.includes("input-group"));

    expect(toolbar, "found the toolbar row").toBeDefined();
    expect(toolbar?.heights.length).toBeGreaterThan(2);
    expect([...new Set(toolbar?.heights)]).toEqual([40]);
  });

  /**
   * The radius counterpart. Agreement alone would be satisfied by every control
   * drifting to 10px together, which is the state this arm was written to end.
   * 8px is `--radius-md` at the default `--radius: 0.625rem`.
   */
  test("renders the control tier at 8px", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 1000 });
    await openBlock(page, "block-tickets-01");

    const rows = await collectRows(page);
    const toolbar = rows.find((row) => row.slots.includes("input-group"));

    expect(toolbar, "found the toolbar row").toBeDefined();
    expect([...new Set(toolbar?.radii)]).toEqual([8]);
  });
});

/**
 * A joined ToggleGroup's container and its end items must round identically.
 *
 * They are separate declarations — `toggle-group.tsx` rounds the container, and
 * the first/last item round themselves — so nothing forces them to agree. At
 * `size="sm"` they did not: the container clamped to 8px while the items stayed
 * at 10px, and the item corners overhung the group by 2px.
 *
 * This is the case the row sweep above structurally cannot reach:
 * `toggle-group-item` is deliberately outside `CONTROL_SELECTOR`, and the
 * relationship is nesting, not adjacency.
 */
test.describe("a joined ToggleGroup rounds its items like itself", () => {
  for (const size of ["sm", "default", "lg"] as const) {
    test(`size=${size}`, async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 1000 });
      await page.goto("/preview/toggle-group-sizes");

      const group = page
        .locator('[data-slot="toggle-group"]')
        .nth({ sm: 0, default: 1, lg: 2 }[size]);
      await expect(group).toBeVisible();

      const measured = await group.evaluate((el) => {
        const first = el.firstElementChild as HTMLElement;
        const last = el.lastElementChild as HTMLElement;
        const px = (value: string) =>
          Math.round(Number.parseFloat(value) * 10) / 10;
        return {
          groupLeft: px(getComputedStyle(el).borderTopLeftRadius),
          groupRight: px(getComputedStyle(el).borderTopRightRadius),
          firstLeft: px(getComputedStyle(first).borderTopLeftRadius),
          lastRight: px(getComputedStyle(last).borderTopRightRadius),
        };
      });

      expect(measured.firstLeft).toBe(measured.groupLeft);
      expect(measured.lastRight).toBe(measured.groupRight);
    });
  }
});
