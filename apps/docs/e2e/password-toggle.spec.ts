import { expect, test } from "@playwright/test";

import { gotoPreview } from "./preview";

/**
 * The two password toggle demos behave like signup-01's fields: a pointer
 * press on the eye sends typing to the field, a press while the field has
 * focus keeps its caret, and the keyboard leaves focus on the button.
 */
for (const demo of [
  "input-group-password-toggle",
  "input-with-password-toggle",
]) {
  test.describe(demo, () => {
    test.beforeEach(async ({ page }) => {
      await gotoPreview(page, demo);
    });

    test("a click on the eye from elsewhere sends typing to the field", async ({
      page,
    }) => {
      const field = page.getByRole("textbox", { name: "Password" });
      const eye = page.getByRole("button", { name: "Show password" });

      await eye.click();
      await expect(field).toHaveAttribute("type", "text");
      await expect(field).toBeFocused();
      await page.keyboard.type("sample");
      await expect(field).toHaveValue("sample");
    });

    test("a click while the field has focus keeps the caret", async ({
      page,
    }) => {
      const field = page.getByRole("textbox", { name: "Password" });
      await field.fill("hunter22");
      await field.evaluate((el: HTMLInputElement) =>
        el.setSelectionRange(3, 5)
      );
      await page.getByRole("button", { name: "Show password" }).click();
      await expect(field).toBeFocused();
      expect(
        await field.evaluate((el: HTMLInputElement) => [
          el.selectionStart,
          el.selectionEnd,
        ])
      ).toEqual([3, 5]);
    });

    test("the keyboard leaves focus on the button", async ({ page }) => {
      const eye = page.getByRole("button", { name: "Show password" });
      await eye.focus();
      await page.keyboard.press("Enter");
      await expect(
        page.getByRole("button", { name: "Hide password" })
      ).toBeFocused();
    });
  });
}
