import { expect, type Page } from "@playwright/test";

/**
 * Open a demo's preview page and wait until the demo has hydrated.
 *
 * Demos load through `next/dynamic`, so their markup is in the HTML but
 * their chunk arrives after `load`. A click in that window is not reliably
 * replayed once React attaches, and the gap grows with parallel workers. The
 * generated loader sets `data-demo-hydrated` on `<html>` from an effect
 * inside the demo's own chunk, which is the first moment a click is safe.
 */
export async function gotoPreview(
  page: Page,
  name: string,
  search = ""
): Promise<void> {
  await page.goto(`/preview/${name}${search}`);
  await page
    .locator(`html[data-demo-hydrated="${name}"]`)
    .waitFor({ state: "attached" });
}

/**
 * Wait for a table's stand-in request to answer.
 *
 * admin-01's tables answer each change after a short simulated latency, with
 * skeleton rows in between and `aria-busy` on the table. Reading rows before
 * this would read the skeleton. Pass `table` when the page holds more than one.
 */
export async function settled(
  page: Page,
  table = page.locator('[data-slot="table"]').first()
): Promise<void> {
  await expect(table).toHaveAttribute("aria-busy", "false");
}
