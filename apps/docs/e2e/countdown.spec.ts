import { expect, type Page, test } from "@playwright/test";

/**
 * Hydration geometry. The fixture renders Countdowns with a literal target
 * and a fixed clock. The server HTML (JavaScript off) shows the placeholder;
 * the hydrated page shows the digits. Every value and colon must keep its
 * box, the page must log no hydration error, and no digit may roll on the
 * first client commit.
 */

// A roll would be a CSS transition: let one run if the code started it.
test.use({ reducedMotion: "no-preference" });

const PARTS =
  '[data-slot="countdown-value"], [data-slot="countdown-separator"], [data-slot="countdown-label"]';

/**
 * The face the digits are drawn in, loaded before any box is read, or a
 * failure naming every face of that family and its status.
 *
 * Only the first family of the body's list is loaded. The one after it is
 * `next/font`'s metric fallback, `src: local(Arial)`, which cannot load where
 * Arial is not installed (the Ubuntu CI runner); `document.fonts.load` on the
 * whole list rejects with a NetworkError when any face in it fails, which
 * says nothing about the face the digits use.
 */
async function fontsLoaded(page: Page) {
  const font = await page.evaluate(async () => {
    const family = getComputedStyle(document.body)
      .fontFamily.split(",")[0]
      .trim();
    const unquoted = family.replaceAll('"', "");
    let faces: FontFace[] = [];
    let error = "";
    try {
      faces = await document.fonts.load(`400 48px ${family}`, "0123456789:-");
    } catch (reason) {
      error = String(reason);
    }
    await document.fonts.ready;
    return {
      family,
      loaded:
        error === "" &&
        faces.length > 0 &&
        faces.every((face) => face.status === "loaded"),
      detail: [
        error || `${faces.length} face(s) matched the digits`,
        ...[...document.fonts]
          .filter((face) => face.family.replaceAll('"', "") === unquoted)
          .map(
            (face) =>
              `${face.family} ${face.unicodeRange.slice(0, 24)} → ${face.status}`
          ),
      ].join("\n"),
    };
  });
  expect(
    font.loaded,
    `the digits' face ${font.family} did not load:\n${font.detail}`
  ).toBe(true);
}

function boxes(page: Page) {
  return page.locator(PARTS).evaluateAll((els) =>
    els.map((el) => {
      const r = el.getBoundingClientRect();
      return {
        slot: el.getAttribute("data-slot"),
        x: r.x,
        y: r.y,
        w: r.width,
        h: r.height,
      };
    })
  );
}

/** Painted value text: outside `.sr-only` and `.invisible` subtrees. */
function values(page: Page, testId: string) {
  return page
    .getByTestId(testId)
    .locator('[data-slot="countdown-value"]')
    .evaluateAll((els) =>
      els.map((el) => {
        let out = "";
        const walk = (node: Node) => {
          if (
            node instanceof HTMLElement &&
            (node.classList.contains("sr-only") ||
              node.classList.contains("invisible"))
          ) {
            return;
          }
          if (node.nodeType === Node.TEXT_NODE) {
            out += node.textContent;
          }
          for (const child of node.childNodes) {
            walk(child);
          }
        };
        walk(el);
        return out;
      })
    );
}

test("the placeholder and the hydrated digits keep every box, with no entrance roll", async ({
  browser,
}) => {
  const off = await browser.newContext({ javaScriptEnabled: false });
  const serverPage = await off.newPage();
  await serverPage.goto("/e2e/countdown");
  await fontsLoaded(serverPage);
  // The server HTML keeps every Countdown inside its paragraph: a block-level
  // element there would make the parser close the paragraph first.
  const inParagraph = await Promise.all(
    ["compact", "labelled", "large", "nofloor", "animated"].map((id) =>
      serverPage
        .locator(`p[data-testid="${id}"] > [data-slot="countdown"]`)
        .count()
    )
  );
  expect(inParagraph).toEqual([1, 1, 1, 1, 1]);
  const server = await boxes(serverPage);
  expect(await values(serverPage, "compact")).toEqual(["--", "--", "--"]);
  expect(
    await serverPage.locator('[data-slot="countdown"][data-pending]').count()
  ).toBe(5);
  // The no-floor countdown holds its width with the reserved digits alone;
  // asserted last, so a missing reservation shows as geometry first.
  const reserved = await serverPage
    .getByTestId("nofloor")
    .locator('[data-slot="countdown-value"] .invisible')
    .allTextContents();
  const marker = (p: Page) =>
    p
      .getByTestId("nofloor")
      .locator("[data-marker]")
      .evaluate((el) => el.getBoundingClientRect().x);
  const serverMarker = await marker(serverPage);
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
  await page.goto("/e2e/countdown");
  await page
    .locator('html[data-fixture-hydrated="countdown"]')
    .waitFor({ state: "attached" });
  await fontsLoaded(page);
  await expect(
    page.locator('[data-slot="countdown"][data-pending]')
  ).toHaveCount(0);
  expect(Math.abs((await marker(page)) - serverMarker)).toBeLessThanOrEqual(
    0.5
  );
  // Two frames: a roll started on the first client commit would be running.
  await page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve))
      )
  );
  expect(await values(page, "compact")).toEqual(["01", "36", "53"]);
  expect(await values(page, "labelled")).toEqual(["01", "36", "53"]);
  expect(await page.locator("[data-direction]").count()).toBe(0);
  expect(
    await page.evaluate(
      () =>
        document
          .getAnimations()
          .filter((a) =>
            (a.effect as KeyframeEffect | null)?.target?.closest?.(
              '[data-slot="countdown"]'
            )
          ).length
    )
  ).toBe(0);
  const client = await boxes(page);
  expect(client.map((b) => b.slot)).toEqual(server.map((b) => b.slot));
  const moved = client.flatMap((b, i) => {
    const s = server[i];
    const d = Math.max(
      Math.abs(b.x - s.x),
      Math.abs(b.y - s.y),
      Math.abs(b.w - s.w),
      Math.abs(b.h - s.h)
    );
    return d > 0.5 ? [`${i} ${b.slot}: ${d.toFixed(2)}px`] : [];
  });
  expect(moved).toEqual([]);
  expect(reserved).toEqual(["00", "00", "00"]);
  expect(errors).toEqual([]);
  await on.close();
});

/**
 * A native copy: select, press the platform's copy shortcut, read
 * `text/plain` back. Each form is compared with a native copy of the same
 * visible text in plain elements, and with the selection's own text.
 */
test("copying either form gives its visible text once, as plain elements do", async ({
  browser,
}) => {
  const context = await browser.newContext();
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  const page = await context.newPage();
  await page.goto("/e2e/countdown");
  await page
    .locator('html[data-fixture-hydrated="countdown"]')
    .waitFor({ state: "attached" });
  await expect(
    page.locator('[data-slot="countdown"][data-pending]')
  ).toHaveCount(0);

  const select = (selector: string) =>
    page.evaluate((sel) => {
      const range = document.createRange();
      range.selectNodeContents(document.querySelector(sel) as Element);
      const selection = getSelection() as Selection;
      selection.removeAllRanges();
      selection.addRange(range);
      return selection.toString();
    }, selector);
  const nativeCopy = async (selector: string) => {
    await page.evaluate(() => navigator.clipboard.writeText(""));
    await select(selector);
    await page.keyboard.press("ControlOrMeta+C");
    return page.evaluate(() => navigator.clipboard.readText());
  };
  /** Plain elements: one block per line. */
  const plain = (lines: string[]) =>
    page.evaluate((text) => {
      document.getElementById("plain-copy")?.remove();
      const host = document.createElement("div");
      host.id = "plain-copy";
      for (const line of text) {
        const div = document.createElement("div");
        div.textContent = line;
        host.append(div);
      }
      document.body.append(host);
    }, lines);

  // Compact, in its sentence.
  const compactSelection = await select('[data-testid="compact"]');
  const compactCopy = await nativeCopy('[data-testid="compact"]');
  await plain(["Ends in 01:36:53 today"]);
  const compactPlain = await nativeCopy("#plain-copy");
  expect(compactCopy).toBe(compactPlain);
  expect(compactCopy).toBe(compactSelection);
  expect(compactCopy).toBe("Ends in 01:36:53 today");

  // Labelled (animated): each label, colon and value on its own line.
  const labelled = '[data-testid="labelled"] [data-slot="countdown"]';
  const labelledSelection = await select(labelled);
  const labelledCopy = await nativeCopy(labelled);
  const lines = ["Hours", "01", ":", "Minutes", "36", ":", "Seconds", "53"];
  await plain(lines);
  const labelledPlain = await nativeCopy("#plain-copy");
  expect(labelledCopy).toBe(labelledPlain);
  expect(labelledCopy).toBe(labelledSelection);
  expect(labelledCopy.split("\n").filter(Boolean)).toEqual(lines);
  await context.close();
});
