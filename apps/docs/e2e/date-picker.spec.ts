import { expect, type Page, test } from "@playwright/test";

import { gotoPreview } from "./preview";

/**
 * The Date Picker page composes Popover + Calendar; there is no component to
 * unit-test, so the composition itself is pinned here: it opens from the
 * keyboard and the mouse, Escape closes it and hands focus back to the
 * trigger, and a pick lands in the trigger's text.
 *
 * The clock is fixed before the page loads. The basic picker opens on the
 * current month, so without it the day under test would move every month.
 */

const NOW = new Date(2025, 5, 15, 12, 0, 0);

// The range trigger is named by its label and its value ("Stay Jan 20, …").
const INITIAL_RANGE = /Jan 20, 2025 – Feb 09, 2025$/;
// A selected day's name gains ", selected"; match the date alone.
const FEB_12 = /^Wednesday, February 12th, 2025/;
const FEB_15 = /^Saturday, February 15th, 2025/;
const DOB_TRIGGER = /^Date of birth/;
const TIME_TRIGGER = /^Date Select date/;
const QUICK_TRIGGER = /^Publish on/;
const FORM_TRIGGER = /^Start date/;
const JUN_16_2025 = /Monday, June 16th, 2025/;
const JUN_15_2025 = /Sunday, June 15th, 2025/;
const YEAR = /year/i;
const JUN_15_1975 = /^Sunday, June 15th, 1975/;
const INPUT_ERROR = /^Enter a date such as/;
const JUL_1 = /^Tuesday, July 1st, 2025/;
const JUN_1 = /^Sunday, June 1st, 2025/;

async function openPreview(page: Page, name: string) {
  await page.clock.setFixedTime(NOW);
  await gotoPreview(page, name);
}

test.describe("date picker: basic", () => {
  test("opens from the keyboard and Escape returns focus to the trigger", async ({
    page,
  }) => {
    await openPreview(page, "date-picker-default");
    const trigger = page.getByRole("button", { name: "Pick a date" });

    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await trigger.focus();
    await page.keyboard.press("Enter");
    const popup = page.getByRole("dialog", { name: "Choose a date" });
    await expect(popup).toBeVisible();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect(popup.locator('[data-slot="calendar"]')).toContainText(
      "June 2025"
    );
    // Focus moved into the popup, so the return below is a real hand-back.
    await expect(popup.and(page.locator(":focus-within"))).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(popup).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });

  test("a mouse pick closes the popup and shows the date", async ({ page }) => {
    await openPreview(page, "date-picker-default");
    const trigger = page.getByRole("button", { name: "Pick a date" });

    await trigger.click();
    const popup = page.getByRole("dialog", { name: "Choose a date" });
    await expect(popup).toBeVisible();
    await popup
      .getByRole("button", { name: "Friday, June 20th, 2025" })
      .click();

    await expect(popup).toHaveCount(0);
    const picked = page.getByRole("button", { name: "June 20th, 2025" });
    await expect(picked).toBeVisible();
    await expect(picked).toBeFocused();
  });
});

test.describe("date picker: range", () => {
  test("shows both ends, keeps the popup open while picking, and Escape returns focus", async ({
    page,
  }) => {
    await openPreview(page, "date-picker-range");
    const trigger = page.getByRole("button", { name: INITIAL_RANGE });
    await expect(trigger).toBeVisible();

    await trigger.focus();
    await page.keyboard.press("Enter");
    const popup = page.getByRole("dialog", { name: "Choose stay dates" });
    await expect(popup).toBeVisible();
    await expect(popup).toContainText("January 2025");
    await expect(popup).toContainText("February 2025");

    // A pick after a complete range starts a new one: the old arrival date
    // must not survive as the start.
    await popup.getByRole("button", { name: FEB_12 }).click();
    await expect(
      page.getByRole("button", { name: "Stay Feb 12, 2025", exact: true })
    ).toBeVisible();
    await popup.getByRole("button", { name: FEB_15 }).click();

    // A range needs two picks, so the popup stays open after each.
    await expect(popup).toBeVisible();
    const picked = page.getByRole("button", {
      name: "Stay Feb 12, 2025 – Feb 15, 2025",
      exact: true,
    });
    await expect(picked).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(popup).toHaveCount(0);
    await expect(picked).toBeFocused();
  });

  test("opens with the mouse", async ({ page }) => {
    await openPreview(page, "date-picker-range");
    await page.getByRole("button", { name: INITIAL_RANGE }).click();
    await expect(
      page.getByRole("dialog", { name: "Choose stay dates" })
    ).toBeVisible();
  });
});

test.describe("date picker: every popup is a named dialog", () => {
  const cases: [string, string | RegExp, string][] = [
    ["date-picker-default", "Pick a date", "Choose a date"],
    ["date-picker-range", INITIAL_RANGE, "Choose stay dates"],
    ["date-picker-date-of-birth", DOB_TRIGGER, "Choose date of birth"],
    ["date-picker-with-input", "Choose date", "Choose subscription date"],
    ["date-picker-with-time", TIME_TRIGGER, "Choose a date"],
    ["date-picker-quick-picks", QUICK_TRIGGER, "Choose publication date"],
    ["date-picker-form", FORM_TRIGGER, "Choose start date"],
  ];
  for (const [preview, trigger, dialog] of cases) {
    test(`${preview} opens "${dialog}"`, async ({ page }) => {
      await openPreview(page, preview);
      await page.getByRole("button", { name: trigger }).click();
      await expect(
        page.getByRole("dialog", { name: dialog, exact: true })
      ).toBeVisible();
    });
  }
});

test.describe("date picker: date of birth", () => {
  test("today is selectable and tomorrow is not", async ({ page }) => {
    await openPreview(page, "date-picker-date-of-birth");
    await page.getByRole("button", { name: DOB_TRIGGER }).click();
    const popup = page.getByRole("dialog", { name: "Choose date of birth" });
    await expect(popup).toBeVisible();

    await expect(
      popup.getByRole("button", { name: JUN_16_2025 })
    ).toBeDisabled();
    await popup.getByRole("button", { name: JUN_15_2025 }).click();
    await expect(popup).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "Date of birth Jun 15, 2025" })
    ).toBeVisible();
  });

  test("a year decades back is reachable from the year dropdown", async ({
    page,
  }) => {
    await openPreview(page, "date-picker-date-of-birth");
    await page.getByRole("button", { name: DOB_TRIGGER }).click();
    const popup = page.getByRole("dialog", { name: "Choose date of birth" });
    const year = popup.getByRole("combobox", { name: YEAR });
    await year.selectOption("1975");
    await expect(year).toHaveValue("1975");
    await expect(
      popup.getByRole("button", { name: JUN_15_1975 })
    ).toBeVisible();
  });
});

test.describe("date picker: with input", () => {
  const field = (page: Page) =>
    page.getByRole("textbox", { name: "Subscription date" });
  const popupOf = (page: Page) =>
    page.getByRole("dialog", { name: "Choose subscription date" });
  const selectedCells = (page: Page) =>
    popupOf(page).locator('[data-selected="true"]');

  test("clearing the field leaves no day selected", async ({ page }) => {
    await openPreview(page, "date-picker-with-input");
    await field(page).fill("");
    await field(page).blur();
    await page.getByRole("button", { name: "Choose date" }).click();
    await expect(popupOf(page)).toBeVisible();
    await expect(selectedCells(page)).toHaveCount(0);
  });

  test("an invalid draft leaves no day selected", async ({ page }) => {
    await openPreview(page, "date-picker-with-input");
    await field(page).fill("not a date");
    await field(page).blur();
    await expect(page.getByText(INPUT_ERROR)).toBeVisible();
    await page.getByRole("button", { name: "Choose date" }).click();
    await expect(popupOf(page)).toBeVisible();
    await expect(selectedCells(page)).toHaveCount(0);
  });

  test("a pick from the grid moves the month the grid reopens on", async ({
    page,
  }) => {
    await openPreview(page, "date-picker-with-input");
    await page.getByRole("button", { name: "Choose date" }).click();
    // July 1 shows as an outside day of the June grid.
    await popupOf(page).getByRole("button", { name: JUL_1 }).click();
    await expect(popupOf(page)).toHaveCount(0);
    await expect(field(page)).toHaveValue("July 1, 2025");

    await page.getByRole("button", { name: "Choose date" }).click();
    await expect(popupOf(page).locator('[data-slot="calendar"]')).toContainText(
      "July 2025"
    );
  });

  test("a typed date moves the grid to its month and selects it", async ({
    page,
  }) => {
    await openPreview(page, "date-picker-with-input");
    await field(page).fill("2025-08-04");
    await page.getByRole("button", { name: "Choose date" }).click();
    await expect(popupOf(page).locator('[data-slot="calendar"]')).toContainText(
      "August 2025"
    );
    await expect(selectedCells(page)).toHaveCount(1);
  });

  for (const [text, accepted, thenPick] of [
    ["J 1, 2025", false, true],
    ["Jun 1, 2025", true, false],
    ["2025-02-29", false, false],
  ] as const) {
    test(`"${text}" is ${accepted ? "accepted" : "flagged"} on blur and the grid agrees`, async ({
      page,
    }) => {
      await openPreview(page, "date-picker-with-input");
      // Clear the seeded June 1 first, so a selected June 1 below can only
      // come from the typed text.
      await field(page).fill("");
      await field(page).fill(text);
      await field(page).blur();
      const error = page.getByText(INPUT_ERROR);
      if (accepted) {
        await expect(error).toHaveCount(0);
        await expect(field(page)).toHaveAttribute("aria-invalid", "false");
      } else {
        await expect(error).toBeVisible();
        await expect(field(page)).toHaveAttribute("aria-invalid", "true");
      }

      await page.getByRole("button", { name: "Choose date" }).click();
      await expect(popupOf(page)).toBeVisible();
      if (accepted) {
        await expect(selectedCells(page)).toHaveCount(1);
        await expect(
          selectedCells(page).getByRole("button", { name: JUN_1 })
        ).toBeVisible();
      } else {
        await expect(selectedCells(page)).toHaveCount(0);
      }

      if (thenPick) {
        // The rest of the sequence: a grid pick replaces the flagged draft,
        // clears the error, and the grid reopens on the picked month.
        await popupOf(page).getByRole("button", { name: JUL_1 }).click();
        await expect(popupOf(page)).toHaveCount(0);
        await expect(field(page)).toHaveValue("July 1, 2025");
        await expect(error).toHaveCount(0);
        await expect(field(page)).toHaveAttribute("aria-invalid", "false");

        await page.getByRole("button", { name: "Choose date" }).click();
        await expect(
          popupOf(page).locator('[data-slot="calendar"]')
        ).toContainText("July 2025");
        await expect(
          selectedCells(page).getByRole("button", { name: JUL_1 })
        ).toBeVisible();
      }
    });
  }
});
