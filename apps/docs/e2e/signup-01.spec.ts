import { expect, type Locator, type Page, test } from "@playwright/test";

import { gotoPreview } from "./preview";

const WEAK_ROW = /Password strength\s*Weak/;

/** The show/hide button in the same input group as the field with `id`. */
function toggleFor(page: Page, id: string): Locator {
  return page
    .locator('[data-slot="input-group"]')
    .filter({ has: page.locator(`#${id}`) })
    .getByRole("button");
}

function selection(field: Locator) {
  return field.evaluate((el: HTMLInputElement) => [
    el.selectionStart,
    el.selectionEnd,
  ]);
}

test.describe("signup-01", () => {
  test.beforeEach(async ({ page }) => {
    await gotoPreview(page, "block-signup-01");
  });

  test("a click on the toggle shows the password, keeping focus and the caret", async ({
    page,
  }) => {
    const password = page.locator("#password");
    const toggle = toggleFor(page, "password");

    await password.fill("hunter22");
    await password.evaluate((el: HTMLInputElement) =>
      el.setSelectionRange(3, 5)
    );
    await expect(password).toHaveAttribute("type", "password");
    await expect(toggle).toHaveAccessibleName("Show password");
    await expect(toggle).not.toHaveAttribute("aria-pressed");

    await toggle.click();
    await expect(password).toHaveAttribute("type", "text");
    await expect(toggle).toHaveAccessibleName("Hide password");
    await expect(toggle).not.toHaveAttribute("aria-pressed");
    await expect(password).toBeFocused();
    expect(await selection(password)).toEqual([3, 5]);

    await toggle.click();
    await expect(password).toHaveAttribute("type", "password");
    await expect(toggle).toHaveAccessibleName("Show password");
    await expect(password).toBeFocused();
    expect(await selection(password)).toEqual([3, 5]);
  });

  test("the keyboard toggles too, and focus stays on the button", async ({
    page,
  }) => {
    const password = page.locator("#password");
    const toggle = toggleFor(page, "password");

    await toggle.focus();
    await page.keyboard.press("Enter");
    await expect(password).toHaveAttribute("type", "text");
    await expect(toggle).toBeFocused();
    await page.keyboard.press("Space");
    await expect(password).toHaveAttribute("type", "password");
    await expect(toggle).toBeFocused();
  });

  test("each field has its own toggle", async ({ page }) => {
    const confirm = page.locator("#confirm-password");
    await toggleFor(page, "confirm-password").click();
    await expect(confirm).toHaveAttribute("type", "text");
    await expect(page.locator("#password")).toHaveAttribute("type", "password");
    await expect(toggleFor(page, "password")).toHaveAccessibleName(
      "Show password"
    );
  });

  test("the strength bar follows the password and is hidden while it is empty", async ({
    page,
  }) => {
    const password = page.locator("#password");
    const bar = page.getByRole("progressbar", { name: "Password strength" });

    await expect(bar).toHaveCount(0);
    await expect(password).toHaveAttribute("aria-describedby", "password-hint");

    await password.fill("abc");
    await expect(bar).toHaveAttribute("aria-valuetext", "Weak");
    await expect(page.locator("#password-strength")).toHaveText(WEAK_ROW);
    await expect(password).toHaveAttribute(
      "aria-describedby",
      "password-hint password-strength"
    );

    await password.fill("abcdefg1");
    await expect(bar).toHaveAttribute("aria-valuetext", "Fair");
    await expect(page.locator("#password-strength")).toContainText("Fair");

    await password.fill("Abcdefg1!");
    await expect(bar).toHaveAttribute("aria-valuetext", "Good");
    await expect(bar).toHaveAttribute("aria-valuenow", "75");
    await expect(password).toHaveAccessibleDescription(
      "Must be at least 8 characters long. Password strength Good"
    );

    await password.fill("Abcdefg1!xyz");
    await expect(bar).toBeVisible();
    await expect(bar).toHaveAttribute("aria-valuetext", "Strong");
    await expect(bar).toHaveAttribute("aria-valuenow", "100");
    await expect(page.locator("#password-strength")).toContainText("Strong");
    // The populated bar asks for no announcement on each key: it is read
    // through the field's description instead.
    await expect(
      page.locator("form [aria-live], form [role=status]")
    ).toHaveCount(0);

    await password.fill("");
    await expect(bar).toHaveCount(0);
    await expect(page.locator("#password-strength")).toHaveCount(0);
    await expect(password).toHaveAttribute("aria-describedby", "password-hint");
  });

  test("a click on an eye sends the typing to that eye's field", async ({
    page,
  }) => {
    const email = page.locator("#email");
    const password = page.locator("#password");
    const confirm = page.locator("#confirm-password");

    await email.click();
    await toggleFor(page, "password").click();
    await expect(password).toBeFocused();
    await page.keyboard.type("sample");
    await expect(email).toHaveValue("");
    await expect(password).toHaveValue("sample");

    await toggleFor(page, "confirm-password").click();
    await expect(confirm).toBeFocused();
    await page.keyboard.type("again");
    await expect(password).toHaveValue("sample");
    await expect(confirm).toHaveValue("again");
  });
});

test.describe("signup-01 on a touch screen", () => {
  test.use({ hasTouch: true });

  test("a tap on an eye sends the typing to that eye's field", async ({
    page,
  }) => {
    await gotoPreview(page, "block-signup-01");
    const email = page.locator("#email");
    const password = page.locator("#password");

    await email.tap();
    await expect(email).toBeFocused();
    await toggleFor(page, "password").tap();
    await expect(password).toHaveAttribute("type", "text");
    await expect(password).toBeFocused();
    await page.keyboard.type("sample");
    await expect(email).toHaveValue("");
    await expect(password).toHaveValue("sample");
  });
});
