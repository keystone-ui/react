import { expect, test } from "@playwright/test";

import { gotoPreview } from "./preview";

test.describe("settings", () => {
  test.beforeEach(async ({ page }) => {
    await gotoPreview(page, "block-settings-01");
  });

  test("enables Save only for a real change, and validates on submit", async ({
    page,
  }) => {
    const save = page.getByRole("button", { name: "Save changes" });
    const name = page.getByLabel("Name");
    await expect(save).toBeDisabled();

    await name.fill("Ada Lovelace ");
    await expect(save).toBeDisabled();

    await name.fill("");
    await save.click();
    await expect(page.getByText("Enter your name.")).toBeVisible();

    await name.fill("Ada King");
    await save.click();
    await expect(page.getByText("Enter your name.")).toBeHidden();
    await expect(save).toBeDisabled();
    await expect(page.getByText("Ada King").first()).toBeVisible();
  });

  test("signs out other sessions but never this one", async ({ page }) => {
    await page.getByRole("button", { name: "Sign out other sessions" }).click();
    await expect(page.getByText("This device")).toBeVisible();
    await expect(page.getByText("Safari on iPhone")).toBeHidden();
    await expect(
      page.getByRole("button", { name: "Sign out other sessions" })
    ).toBeDisabled();
  });

  test("asks for the email typed back before deleting", async ({ page }) => {
    await page.getByRole("button", { name: "Delete account" }).click();
    const dialog = page.getByRole("alertdialog");
    const confirm = dialog.getByRole("button", { name: "Delete account" });

    await expect(confirm).toBeDisabled();
    await dialog
      .getByLabel("Type your email to confirm")
      .fill("ADA@keystoneui.io");
    await expect(confirm).toBeEnabled();
    await confirm.click();
    await expect(
      page.getByText("Account scheduled for deletion")
    ).toBeVisible();
  });
});
