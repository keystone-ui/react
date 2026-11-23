import { expect, type Page, test } from "@playwright/test";

import { gotoPreview } from "./preview";

/**
 * B9: hydration geometry. The fixture renders RollingNumbers with literal
 * values and fixed locales. The server HTML (JavaScript off) and the
 * hydrated page must lay out every digit and symbol in the same boxes, log
 * no hydration error, and start no roll on the first client commit.
 */

// A roll would be a CSS transition: let one run if the code started it.
test.use({ reducedMotion: "no-preference" });

const PARTS =
  '[data-slot="rolling-number-digit"], [data-slot="rolling-number-symbol"]';

function boxes(page: Page) {
  return page.locator(PARTS).evaluateAll((els) =>
    els.map((el) => {
      const r = el.getBoundingClientRect();
      return { text: el.textContent, x: r.x, y: r.y, w: r.width, h: r.height };
    })
  );
}

test("server HTML and the hydrated page match, with no entrance roll", async ({
  browser,
}) => {
  const off = await browser.newContext({ javaScriptEnabled: false });
  const serverPage = await off.newPage();
  await serverPage.goto("/e2e/rolling-number");
  const server = await boxes(serverPage);
  await off.close();
  expect(server.length).toBeGreaterThan(10);

  const on = await browser.newContext();
  const page = await on.newPage();
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") {
      errors.push(message.text());
    }
  });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/e2e/rolling-number");
  await page
    .locator('html[data-fixture-hydrated="rolling-number"]')
    .waitFor({ state: "attached" });
  // Two frames: a roll started on the first client commit would be running.
  await page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve))
      )
  );
  expect(await page.locator("[data-direction]").count()).toBe(0);
  expect(
    await page.evaluate(
      () =>
        document
          .getAnimations()
          .filter((a) =>
            (a.effect as KeyframeEffect | null)?.target?.closest?.(
              '[data-slot="rolling-number"]'
            )
          ).length
    )
  ).toBe(0);
  const client = await boxes(page);
  expect(client.map((b) => b.text)).toEqual(server.map((b) => b.text));
  for (const [i, b] of client.entries()) {
    const s = server[i];
    expect(Math.abs(b.x - s.x)).toBeLessThanOrEqual(0.5);
    expect(Math.abs(b.y - s.y)).toBeLessThanOrEqual(0.5);
    expect(Math.abs(b.w - s.w)).toBeLessThanOrEqual(0.5);
    expect(Math.abs(b.h - s.h)).toBeLessThanOrEqual(0.5);
  }
  expect(await page.getByTestId("eur").locator(".sr-only").textContent()).toBe(
    new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(1234.5)
  );
  expect(errors).toEqual([]);
  await on.close();
});

/**
 * A native copy: select a paragraph, press the platform's copy shortcut and
 * read `text/plain` back. Copying "Balance " + the number + " EUR" must give
 * the same text as copying a plain element holding the same Intl string, at
 * rest and with a digit held halfway through its roll. (Chromium's copy
 * turns U+00A0 into a space for any text, so the comparison is with a plain
 * copy, not with Intl's code points.)
 */
test("copying the number gives the same text as copying the plain formatted number", async ({
  browser,
}) => {
  const context = await browser.newContext();
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  const page = await context.newPage();
  await page.goto("/e2e/rolling-number");
  await page
    .locator('html[data-fixture-hydrated="rolling-number"]')
    .waitFor({ state: "attached" });

  const selectAndCopy = async (selector: string) => {
    await page.evaluate(() => navigator.clipboard.writeText(""));
    await page.evaluate((sel) => {
      const el = document.querySelector(sel) as HTMLElement;
      const range = document.createRange();
      range.selectNodeContents(el);
      const selection = getSelection() as Selection;
      selection.removeAllRanges();
      selection.addRange(range);
    }, selector);
    await page.keyboard.press("ControlOrMeta+C");
    return Array.from(
      await page.evaluate(() => navigator.clipboard.readText())
    );
  };
  const copyPlain = async (value: number) => {
    await page.evaluate((v) => {
      document.getElementById("plain-copy")?.remove();
      const p = document.createElement("p");
      p.id = "plain-copy";
      p.textContent = `Balance ${new Intl.NumberFormat("de-DE", {
        style: "currency",
        currency: "EUR",
      }).format(v)} EUR`;
      document.body.append(p);
    }, value);
    return selectAndCopy("#plain-copy");
  };
  const copyNumber = () => selectAndCopy('[data-testid="copy"]');

  // At rest.
  const plainRest = await copyPlain(1239);
  expect(plainRest.join("")).toContain("1.239,00");
  expect(await copyNumber()).toEqual(plainRest);

  // Held: 1239 → 1240, the ones face's translate transition paused at half
  // its active duration.
  await page.getByTestId("copy-next").click();
  const held = await page.evaluate(
    () =>
      new Promise<{ offset: number; row: number } | null>((resolve) =>
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            const column = document.querySelector(
              '[data-testid="copy"] [data-slot="rolling-number-digit"][data-place="0"]'
            ) as HTMLElement;
            const face = column.firstElementChild as HTMLElement;
            const transition = face
              .getAnimations()
              .find(
                (a) =>
                  a instanceof CSSTransition &&
                  a.transitionProperty === "translate"
              );
            if (!transition) {
              resolve(null);
              return;
            }
            transition.pause();
            const half =
              Number(transition.effect?.getComputedTiming().activeDuration) / 2;
            transition.currentTime = half;
            resolve({
              offset: Math.abs(
                face.getBoundingClientRect().top -
                  column.getBoundingClientRect().top
              ),
              row: column.getBoundingClientRect().height,
            });
          })
        )
      )
  );
  expect(held).not.toBeNull();
  const plainHeld = await copyPlain(1240);
  expect(plainHeld.join("")).toContain("1.240,00");
  // The digit is still mid-roll immediately before the component copy.
  const offsetNow = await page.evaluate(() => {
    const column = document.querySelector(
      '[data-testid="copy"] [data-slot="rolling-number-digit"][data-place="0"]'
    ) as HTMLElement;
    const face = column.firstElementChild as HTMLElement;
    return Math.abs(
      face.getBoundingClientRect().top - column.getBoundingClientRect().top
    );
  });
  expect(offsetNow).toBeGreaterThan(0);
  expect(offsetNow).toBeLessThan(held?.row ?? 0);
  expect(await copyNumber()).toEqual(plainHeld);
  await context.close();
});

/**
 * Same length, same width. Where text is hinted (common on Linux), each glyph
 * is rounded to whole pixels and tabular digits differ by a pixel; without
 * `text-rendering: geometricPrecision` on the root, 1,284 → 1,285 in the
 * default demo went from 98 to 97px. On macOS text is not hinted, so this
 * passes there either way: it can only fail on a hinted platform.
 */
test("a roll at the same length keeps the number's width", async ({ page }) => {
  await gotoPreview(page, "rolling-number-default");
  await page.evaluate(() => document.fonts.ready);
  const root = page.locator('[data-slot="rolling-number"]').first();
  const width = () => root.evaluate((el) => el.getBoundingClientRect().width);
  await expect(root.locator(".sr-only")).toHaveText("1,284");
  const before = await width();
  await page.getByRole("button", { name: "+1", exact: true }).click();
  await expect(root.locator(".sr-only")).toHaveText("1,285");
  // The outgoing glyph is out of flow, so the width is final from the first
  // frame of the new value; read it two frames in, once.
  await page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve))
      )
  );
  expect(await width()).toBeCloseTo(before, 2);
});
