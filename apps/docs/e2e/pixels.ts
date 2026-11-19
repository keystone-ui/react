import type { Locator, Page } from "@playwright/test";

/** RGBA at one point of a screenshot, in CSS pixels from the shot's origin. */
export interface Pixels {
  /** Rounds to the device pixel under (x, y). */
  at: (x: number, y: number) => [number, number, number, number];
  /** CSS width and height of the shot. */
  height: number;
  width: number;
}

/**
 * Screenshot `target` and decode it in the page, so a test reads what was
 * painted (a mask, a stacking order) rather than the styles behind it.
 */
export async function shoot(page: Page, target: Locator): Promise<Pixels> {
  const box = await target.boundingBox();
  if (!box) {
    throw new Error("nothing to shoot: the target has no box");
  }
  // Animations stay on: the edge fades are scroll-driven animations, and
  // Playwright's "disabled" cancels them, which would read the fade's
  // starting state instead of the one on screen.
  const png = await target.screenshot({ animations: "allow" });
  const decoded = await page.evaluate(async (base64) => {
    const blob = await (await fetch(`data:image/png;base64,${base64}`)).blob();
    const bitmap = await createImageBitmap(blob);
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    const ctx = canvas.getContext("2d") as OffscreenCanvasRenderingContext2D;
    ctx.drawImage(bitmap, 0, 0);
    const data = ctx.getImageData(0, 0, bitmap.width, bitmap.height).data;
    return {
      data: Array.from(data),
      height: bitmap.height,
      width: bitmap.width,
    };
  }, png.toString("base64"));
  const scale = decoded.width / box.width;
  return {
    height: box.height,
    width: box.width,
    at: (x, y) => {
      const px = Math.min(
        decoded.width - 1,
        Math.max(0, Math.floor(x * scale))
      );
      const py = Math.min(
        decoded.height - 1,
        Math.max(0, Math.floor(y * scale))
      );
      const i = (py * decoded.width + px) * 4;
      return decoded.data.slice(i, i + 4) as [number, number, number, number];
    },
  };
}

/** Largest channel difference between two colours. */
export const distance = (a: number[], b: number[]) =>
  Math.max(...[0, 1, 2].map((i) => Math.abs(a[i] - b[i])));
