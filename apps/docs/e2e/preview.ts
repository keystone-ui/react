import type { Page } from "@playwright/test";

/**
 * Open a demo's preview page and wait until the demo has hydrated.
 *
 * Demos load through `next/dynamic`, so their markup is in the HTML but
 * their chunk arrives after `load`. A click in that window is not reliably
 * replayed once React attaches, and the gap grows with parallel workers. The
 * generated loader sets `data-demo-hydrated` on `<html>` from an effect
 * inside the demo's own chunk, which is the first moment a click is safe.
 */
export async function gotoPreview(page: Page, name: string): Promise<void> {
  await page.goto(`/preview/${name}`);
  await page
    .locator(`html[data-demo-hydrated="${name}"]`)
    .waitFor({ state: "attached" });
}
