import { readFileSync } from "node:fs";
import { join } from "node:path";

import { expect, type Locator, type Page, test } from "@playwright/test";

import { gotoPreview } from "./preview";

/**
 * A phone's bottom navigation: a named landmark holding a list of links, one
 * of them the current page, fixed to the bottom of the viewport below `md`
 * and gone from `md` up (where a sidebar takes over). What only a browser can
 * decide is measured here: the computed `display` at each width, the size and
 * hit area of every touch target (also with 200% text), and that the page's
 * own scroll area ends at the bar's top, so neither the last row nor a
 * keyboard-focused row can end up under the bar.
 */
const NAME = "block-bottom-nav-01";
const PHONE = { width: 390, height: 844 };
const SHORT_PHONE = { width: 390, height: 524 };
const SMALL_PHONE = { width: 320, height: 680 };
const LANDSCAPE_PHONE = { width: 667, height: 320 };
const TABLET = { width: 768, height: 1024 };
const DESKTOP = { width: 1280, height: 800 };
const INBOX = /Inbox/;
const MIN_TARGET = 44;
const BAR_HEIGHT = 64;
// Sub-pixel layout: a box may end a fraction of a pixel past a computed edge.
const EPSILON = 0.5;
const READER = "/e2e/bottom-nav-round-trip";
const READER_HEADER = 72;
const DOCS = readFileSync(
  join(import.meta.dirname, "../content/docs/blocks/bottom-nav-01.mdx"),
  "utf8"
);
const CSS_FENCES = [...DOCS.matchAll(/```css\n([\s\S]*?)```/g)].map(
  (match) => match[1] ?? ""
);
// The rule the docs tell an app with a strict style policy to put in its own
// stylesheet: the docs page's first css block, the bar's own rule.
const DOCUMENTED_CSS = CSS_FENCES[0] ?? "";
// The page-owned start offset the docs give a headerless form of padded
// native inputs, for the app's own stylesheet.
const HEADERLESS_FORM_CSS =
  CSS_FENCES.find((css) => css.includes("data-headerless-form")) ?? "";
const STRICT_CSS_URL = "/__bottom-nav-global.css";

function bar(page: Page) {
  return page.getByRole("navigation", { name: "Main" });
}

function rows(page: Page) {
  return page.locator('[data-slot="bottom-nav-content"] a');
}

async function bottomOf(locator: Locator): Promise<number> {
  const box = await locator.boundingBox();
  expect(box).not.toBeNull();
  return (box?.y ?? 0) + (box?.height ?? 0);
}

async function topOf(locator: Locator): Promise<number> {
  const box = await locator.boundingBox();
  expect(box).not.toBeNull();
  return box?.y ?? 0;
}

/** Wait until a test-only fixture route has hydrated. */
async function fixtureHydrated(page: Page, name: string) {
  await page
    .locator(`html[data-fixture-hydrated="${name}"]`)
    .waitFor({ state: "attached" });
}

/** Whether the element's middle point hit-tests to the element itself. */
function hitsItself(locator: Locator): Promise<boolean> {
  return locator.evaluate((el) => {
    const box = el.getBoundingClientRect();
    const hit = document.elementFromPoint(
      box.left + box.width / 2,
      box.top + box.height / 2
    );
    return hit === el || el.contains(hit);
  });
}

/**
 * A form-like page: each row's link becomes a native input, as in a list of
 * editable fields. Inputs are scrolled into view differently from links, and
 * are where a bar over the end of the view bites.
 */
async function rowsToNativeInputs(page: Page): Promise<Locator> {
  await page.evaluate(() => {
    for (const row of document.querySelectorAll(
      '[data-slot="bottom-nav-content"] li'
    )) {
      const label = row.firstElementChild as HTMLElement;
      const input = document.createElement("input");
      input.className = label.className;
      input.value = label.textContent ?? "";
      input.setAttribute("aria-label", input.value);
      label.replaceWith(input);
    }
    window.scrollTo(0, 0);
  });
  return page.locator('[data-slot="bottom-nav-content"] input');
}

/**
 * Focus the first input, then Tab through the rest: each focused input must
 * end up wholly between the top of the view and the bar's top. Some engines
 * reveal a focused control after the key press returns (WebKit does), so
 * each one is polled until the whole control is in view.
 */
async function tabStaysAboveBar(
  page: Page,
  inputs: Locator,
  navTop: number,
  { andBack = false } = {}
) {
  const count = await inputs.count();
  const inView = async (index: number) => {
    const input = inputs.nth(index);
    await expect(input).toBeFocused();
    await expect
      .poll(async () => {
        const box = await input.boundingBox();
        const top = box?.y ?? -1;
        const bottom = top + (box?.height ?? 0);
        return top >= -EPSILON && bottom <= navTop + EPSILON;
      })
      .toBe(true);
  };
  await inputs.first().focus();
  await inView(0);
  for (let index = 1; index < count; index++) {
    // biome-ignore lint/performance/noAwaitInLoops: Tab order is sequential
    await page.keyboard.press("Tab");
    await inView(index);
  }
  for (let index = count - 2; andBack && index >= 0; index--) {
    // biome-ignore lint/performance/noAwaitInLoops: Tab order is sequential
    await page.keyboard.press("Shift+Tab");
    await inView(index);
  }
  return count;
}

/** Emulate a phone's home-indicator area: env(safe-area-inset-bottom). */
async function setBottomInset(page: Page, bottom: number) {
  const session = await page.context().newCDPSession(page);
  await session.send("Emulation.setSafeAreaInsetsOverride", {
    insets: { bottom },
  });
}

test.describe("bottom-nav-01", () => {
  test("is a navigation landmark of labelled links", async ({ page }) => {
    await page.setViewportSize(PHONE);
    await gotoPreview(page, NAME);
    await expect(bar(page)).toMatchAriaSnapshot(`
      - navigation "Main":
        - list:
          - listitem:
            - link "Home":
              - /url: /home
          - listitem:
            - link "Search":
              - /url: /search
          - listitem:
            - link "Inbox (3 unread)":
              - /url: /inbox
          - listitem:
            - link "Saved":
              - /url: /saved
          - listitem:
            - link "Profile":
              - /url: /profile
    `);
    await expect(bar(page).getByRole("button")).toHaveCount(0);
  });

  test("marks exactly one link as the current page", async ({ page }) => {
    await page.setViewportSize(PHONE);
    await gotoPreview(page, NAME);
    const current = bar(page).locator('[aria-current="page"]');
    await expect(current).toHaveCount(1);
    await expect(current).toHaveAccessibleName("Home");

    // The preview marks a clicked link current instead of navigating.
    await bar(page).getByRole("link", { name: "Saved" }).click();
    await expect(current).toHaveCount(1);
    await expect(current).toHaveAccessibleName("Saved");
  });

  test("is shown on a phone and hidden on a desktop", async ({ page }) => {
    await page.setViewportSize(PHONE);
    await gotoPreview(page, NAME);
    const nav = bar(page);
    await expect(nav).toBeVisible();
    expect(
      await nav.evaluate((el) => {
        const style = getComputedStyle(el);
        return { display: style.display, position: style.position };
      })
    ).toEqual({ display: "block", position: "fixed" });
    // Flush with the bottom of the viewport.
    expect(Math.round(await bottomOf(nav))).toBe(PHONE.height);

    // Layered by the --z-sticky token, not by a literal.
    const layers = await nav.evaluate((el) => ({
      token: getComputedStyle(document.documentElement)
        .getPropertyValue("--z-sticky")
        .trim(),
      zIndex: getComputedStyle(el).zIndex,
    }));
    expect(layers.token).not.toBe("");
    expect(layers.zIndex).toBe(layers.token);

    // A role locator stops matching once the bar is display: none.
    const element = page.locator('[data-slot="bottom-nav"]');
    const display = () =>
      element.evaluate((el) => getComputedStyle(el).display);
    await page.setViewportSize(TABLET);
    expect(await display()).toBe("none");
    await expect(nav).toBeHidden();
    await page.setViewportSize(DESKTOP);
    expect(await display()).toBe("none");
    await expect(nav).toBeHidden();
  });

  for (const scheme of ["light", "dark"] as const) {
    test(`a keyboard-focused link shows a visible outline inside the bar (${scheme})`, async ({
      page,
    }) => {
      await page.emulateMedia({ colorScheme: scheme });
      await page.setViewportSize(PHONE);
      await gotoPreview(page, NAME);
      expect(
        await page.evaluate(() =>
          document.documentElement.classList.contains("dark")
        )
      ).toBe(scheme === "dark");
      const home = bar(page).getByRole("link", { name: "Home" });
      await home.focus();
      await page.keyboard.press("Tab");
      await page.keyboard.press("Shift+Tab");
      await expect(home).toBeFocused();
      // outline-color transitions (even at the reduced-motion duration), so a
      // read in the first frame sees the value it is leaving. Wait until two
      // reads a couple of frames apart agree.
      await expect
        .poll(() =>
          home.evaluate(async (el) => {
            const before = getComputedStyle(el).outlineColor;
            await new Promise((resolve) =>
              requestAnimationFrame(() => requestAnimationFrame(resolve))
            );
            return before === getComputedStyle(el).outlineColor;
          })
        )
        .toBe(true);
      const outline = await home.evaluate((el) => {
        const style = getComputedStyle(el);
        return {
          background: getComputedStyle(el.closest("nav") as Element)
            .backgroundColor,
          color: style.outlineColor,
          offset: Number.parseFloat(style.outlineOffset),
          style: style.outlineStyle,
          width: style.outlineWidth,
        };
      });
      expect(outline.style).toBe("solid");
      expect(outline.width).toBe("2px");
      // Drawn inward, so the bar's edge and the screen's edge cannot clip it.
      expect(outline.offset).toBeLessThan(0);
      // A transparent or background-coloured outline passes every check above.
      // Each colour read back as [r, g, b, a] (0-255) through a canvas.
      const [color, background] = await page.evaluate(
        (colors) => {
          const canvas = document.createElement("canvas");
          canvas.width = 1;
          canvas.height = 1;
          const context = canvas.getContext("2d") as CanvasRenderingContext2D;
          return colors.map((value) => {
            context.clearRect(0, 0, 1, 1);
            context.fillStyle = value;
            context.fillRect(0, 0, 1, 1);
            return [...context.getImageData(0, 0, 1, 1).data];
          });
        },
        [outline.color, outline.background]
      );
      // Composite the outline over the bar, so a nearly transparent outline
      // measures as the background it lets through.
      const alpha = (color[3] ?? 0) / 255;
      const seen = [0, 1, 2].map(
        (i) => alpha * (color[i] ?? 0) + (1 - alpha) * (background[i] ?? 0)
      );
      const distance = Math.hypot(
        (seen[0] ?? 0) - (background[0] ?? 0),
        (seen[1] ?? 0) - (background[1] ?? 0),
        (seen[2] ?? 0) - (background[2] ?? 0)
      );
      expect(distance).toBeGreaterThan(40);
    });
  }

  test("every target is at least 44 by 44 px", async ({ page }) => {
    await page.setViewportSize(PHONE);
    await gotoPreview(page, NAME);
    const links = bar(page).getByRole("link");
    await expect(links).toHaveCount(5);
    const boxes = await Promise.all(
      (await links.all()).map((link) => link.boundingBox())
    );
    for (const box of boxes) {
      expect(box?.width ?? 0).toBeGreaterThanOrEqual(MIN_TARGET);
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(MIN_TARGET);
    }
  });

  for (const dir of ["ltr", "rtl"] as const) {
    test(`at 320 px with 200% text each target is its own (${dir})`, async ({
      page,
    }) => {
      await page.setViewportSize(SMALL_PHONE);
      await gotoPreview(page, NAME);
      await page.evaluate((d) => {
        document.documentElement.dir = d;
        document.documentElement.style.fontSize = "200%";
      }, dir);
      const links = await bar(page).getByRole("link").all();
      expect(links).toHaveLength(5);
      // The bar re-lays out over a few frames after the root font changes;
      // measuring in the first one sees the old geometry. Wait until the
      // badge and the links stop moving.
      await expect
        .poll(() =>
          page.evaluate(async () => {
            const shape = () =>
              [
                ...document.querySelectorAll(
                  '[data-slot="bottom-nav"] a, [data-slot="bottom-nav"] [data-slot="badge"]'
                ),
              ]
                .map((el) => {
                  const r = el.getBoundingClientRect();
                  return `${r.left},${r.right},${r.top},${r.bottom}`;
                })
                .join("|");
            const before = shape();
            await new Promise((resolve) =>
              requestAnimationFrame(() => requestAnimationFrame(resolve))
            );
            return before === shape();
          })
        )
        .toBe(true);
      // Hit-tested at two heights: the middle of the link, and the middle of
      // the count badge, which sits higher and could hang into a neighbour.
      const badge = await bar(page)
        .locator('[data-slot="badge"]')
        .boundingBox();
      expect(badge).not.toBeNull();
      const badgeY = (badge?.y ?? 0) + (badge?.height ?? 0) / 2;
      const measured = await Promise.all(
        links.map((link) =>
          link.evaluate((el, y) => {
            const box = el.getBoundingClientRect();
            const middle = box.top + box.height / 2;
            const hit = (x: number) =>
              [middle, y].every(
                (atY) => document.elementFromPoint(x, atY)?.closest("a") === el
              );
            return {
              end: hit(box.right - 3),
              height: box.height,
              left: box.left,
              right: box.right,
              start: hit(box.left + 3),
              width: box.width,
            };
          }, badgeY)
        )
      );
      for (const box of measured) {
        expect(box.left).toBeGreaterThanOrEqual(0);
        expect(box.right).toBeLessThanOrEqual(SMALL_PHONE.width);
        expect(box.width).toBeGreaterThanOrEqual(MIN_TARGET);
        expect(box.height).toBeGreaterThanOrEqual(MIN_TARGET);
        expect(box.start).toBe(true);
        expect(box.end).toBe(true);
      }
    });
  }

  for (const inset of [0, 34]) {
    test(`the page reserves exactly the bar's height (inset ${inset})`, async ({
      page,
    }) => {
      await setBottomInset(page, inset);
      await page.setViewportSize(PHONE);
      await gotoPreview(page, NAME);
      const nav = bar(page);
      // The border and the safe area are inside the bar's height.
      const navTop = await topOf(nav);
      expect(PHONE.height - navTop).toBeCloseTo(BAR_HEIGHT + inset, 0);
      // The document scrolls, not an inner area: Back restores its position.
      const main = page.locator("main");
      expect(await main.evaluate((el) => getComputedStyle(el).overflowY)).toBe(
        "visible"
      );
      expect(
        await page.evaluate(
          () => document.documentElement.scrollHeight > window.innerHeight
        )
      ).toBe(true);
      // The page reserves exactly the bar's height at its end.
      const reserved = await main.evaluate((el) =>
        Number.parseFloat(getComputedStyle(el).paddingBottom)
      );
      expect(reserved).toBeCloseTo(BAR_HEIGHT + inset, 0);
      await page.evaluate(() =>
        window.scrollTo(0, document.documentElement.scrollHeight)
      );
      // Scrolled to the end, the content stops exactly at the bar's top...
      expect(Math.abs((await bottomOf(main)) - reserved - navTop)).toBeLessThan(
        EPSILON
      );
      // ...so the last row sits above it.
      expect(await bottomOf(rows(page).last())).toBeLessThanOrEqual(
        navTop + EPSILON
      );
    });
  }

  for (const size of [PHONE, LANDSCAPE_PHONE]) {
    test(`a focused native input stays inside the visible area (${size.width}x${size.height})`, async ({
      page,
    }) => {
      await page.setViewportSize(size);
      await gotoPreview(page, NAME);
      const inputs = await rowsToNativeInputs(page);
      const navTop = await topOf(bar(page));
      expect(
        await tabStaysAboveBar(page, inputs, navTop, { andBack: true })
      ).toBe(16);
    });
  }

  for (const size of [PHONE, LANDSCAPE_PHONE]) {
    test(`a headerless form with the documented start offset keeps reverse Tab inside both edges (${size.width}x${size.height})`, async ({
      page,
    }) => {
      await page.setViewportSize(size);
      await gotoPreview(page, NAME);
      // The app's own stylesheet carries the documented rule, and the form's
      // <main> carries the marker.
      expect(HEADERLESS_FORM_CSS).toContain("data-headerless-form");
      await page.addStyleTag({ content: HEADERLESS_FORM_CSS });
      const inputs = await rowsToNativeInputs(page);
      await page
        .locator("main")
        .evaluate((el) => el.setAttribute("data-headerless-form", ""));
      const rootStart = () =>
        page.evaluate(
          () => getComputedStyle(document.documentElement).scrollPaddingTop
        );
      // Off until focus is inside the marked form...
      expect(await rootStart()).toBe("auto");
      const navTop = await topOf(bar(page));
      expect(
        await tabStaysAboveBar(page, inputs, navTop, { andBack: true })
      ).toBe(16);
      // ...1rem while a marked input has focus...
      await expect(inputs.first()).toBeFocused();
      expect(await rootStart()).toBe("16px");
      // ...and off again once focus leaves it.
      await inputs.first().blur();
      expect(await rootStart()).toBe("auto");
    });
  }

  test("Back restores the reading position", async ({ page }) => {
    await page.setViewportSize(SHORT_PHONE);
    await gotoPreview(page, NAME);
    // Read down to the eighth message, wherever the page scrolls it.
    const row = rows(page).nth(7);
    await row.evaluate((el) => el.scrollIntoView({ block: "start" }));
    const before = await topOf(row);
    // Leave with a full document load, so Back rebuilds the page.
    await page.evaluate(() =>
      location.assign("/preview/block-category-nav-01")
    );
    await page
      .locator('html[data-demo-hydrated="block-category-nav-01"]')
      .waitFor({ state: "attached" });
    await page.goBack();
    await page
      .locator(`html[data-demo-hydrated="${NAME}"]`)
      .waitFor({ state: "attached" });
    await expect
      .poll(async () => Math.abs((await topOf(rows(page).nth(7))) - before))
      .toBeLessThan(2);
  });

  test("with a strict style policy, the documented stylesheet keeps Tab clear of the bar", async ({
    page,
  }) => {
    // An app whose policy refuses inline styles: the bar's own <style> is
    // refused, and the app serves the documented rule from its own origin.
    await page.route(`**/preview/${NAME}`, async (route) => {
      const response = await route.fetch();
      await route.fulfill({
        response,
        headers: {
          ...response.headers(),
          "content-security-policy": "frame-ancestors 'self'; style-src 'self'",
        },
      });
    });
    await page.route(`**${STRICT_CSS_URL}`, (route) =>
      route.fulfill({ body: DOCUMENTED_CSS, contentType: "text/css" })
    );
    await page.addInitScript(() => {
      const refused: string[] = [];
      Object.assign(window, { refusedStyles: refused });
      document.addEventListener("securitypolicyviolation", (event) => {
        refused.push(event.effectiveDirective);
      });
    });
    await page.setViewportSize(PHONE);
    await gotoPreview(page, NAME);
    // The policy really bites: the bar's inline style was refused...
    expect(
      await page.evaluate(
        () => (window as unknown as { refusedStyles: string[] }).refusedStyles
      )
    ).toContain("style-src-elem");
    const rootPadding = () =>
      page.evaluate(
        () => getComputedStyle(document.documentElement).scrollPaddingBottom
      );
    expect(await rootPadding()).toBe("auto");
    // ...and the same-origin stylesheet supplies the rule instead.
    await page.addStyleTag({ url: STRICT_CSS_URL });
    expect(await rootPadding()).toBe(`${BAR_HEIGHT + 16}px`);

    const inputs = await rowsToNativeInputs(page);
    const navTop = await topOf(bar(page));
    expect(await tabStaysAboveBar(page, inputs, navTop)).toBe(16);
  });

  test("a page's own header offset holds with the bar, and after a client round trip", async ({
    page,
  }) => {
    await page.setViewportSize(PHONE);
    await page.goto(READER);
    await fixtureHydrated(page, "bottom-nav-reader");
    // Follow an ordinary fragment link: the heading lands below the page's
    // 72px sticky header, which does not cover it.
    const follow = async (link: string, target: string) => {
      const heading = page.locator(target);
      await page.getByRole("link", { name: link }).click();
      await expect
        .poll(() => topOf(heading))
        .toBeGreaterThanOrEqual(READER_HEADER - EPSILON);
      expect(await topOf(heading)).toBeLessThan(READER_HEADER + 2);
      expect(await hitsItself(heading)).toBe(true);
    };
    await follow("Go to the chapter", "#chapter");

    // Client navigation to the bar and back: the same document throughout.
    await page.evaluate(() => {
      window.scrollTo(0, 0);
      Object.assign(window, { sameDocument: true });
    });
    await page.getByRole("link", { name: "Open the bar" }).click();
    await fixtureHydrated(page, "bottom-nav-bar");
    await expect(bar(page)).toBeVisible();
    // On the bar's own page too: the bar only adds room at the bottom.
    await follow("Go to the section", "#section");
    await page.getByRole("link", { name: "Back to the reader" }).click();
    await fixtureHydrated(page, "bottom-nav-reader");
    expect(
      await page.evaluate(() => ({
        // A route kept alive but hidden (cacheComponents) may still hold
        // the bar; none of it may be showing.
        barsShowing: [
          ...document.querySelectorAll('[data-slot="bottom-nav"]'),
        ].filter((el) => el.checkVisibility()).length,
        sameDocument: "sameDocument" in window,
        // React keeps a hoisted style in <head> after its last user unmounts.
        styles: document.head.querySelectorAll(
          'style[data-href="keystone-bottom-nav-scroll-padding"]'
        ).length,
      }))
    ).toEqual({ barsShowing: 0, sameDocument: true, styles: 1 });
    await follow("Go to the chapter", "#chapter");
  });

  for (const size of [PHONE, SHORT_PHONE]) {
    test(`a keyboard-focused row is never under the bar (${size.width}x${size.height})`, async ({
      page,
    }) => {
      await page.setViewportSize(size);
      await gotoPreview(page, NAME);
      const navTop = await topOf(bar(page));
      const all = rows(page);
      const count = await all.count();
      expect(count).toBeGreaterThan(10);
      await all.first().focus();
      for (let index = 1; index < count; index++) {
        // biome-ignore lint/performance/noAwaitInLoops: Tab order is sequential
        await page.keyboard.press("Tab");
        const row = all.nth(index);
        await expect(row).toBeFocused();
        expect(await bottomOf(row)).toBeLessThanOrEqual(navTop + EPSILON);
      }
      // A script scrolling the last row to the end of the view.
      const last = all.last();
      await last.evaluate((el) => el.scrollIntoView({ block: "end" }));
      expect(await bottomOf(last)).toBeLessThanOrEqual(navTop + EPSILON);
    });
  }

  test("the order mirrors right-to-left", async ({ page }) => {
    await page.setViewportSize(PHONE);
    await gotoPreview(page, NAME);
    const xs = async () => {
      const home = await bar(page)
        .getByRole("link", { name: "Home" })
        .boundingBox();
      const profile = await bar(page)
        .getByRole("link", { name: "Profile" })
        .boundingBox();
      return { home: home?.x ?? 0, profile: profile?.x ?? 0 };
    };
    // The count badge sits on the inline-end side of its icon.
    const badgeSide = async () => {
      const inbox = bar(page).getByRole("link", { name: INBOX });
      const icon = await inbox.locator("svg").boundingBox();
      const badge = await inbox.locator('[data-slot="badge"]').boundingBox();
      const center = (box: typeof icon) =>
        (box?.x ?? 0) + (box?.width ?? 0) / 2;
      return center(badge) - center(icon);
    };
    const ltr = await xs();
    expect(ltr.home).toBeLessThan(ltr.profile);
    expect(await badgeSide()).toBeGreaterThan(0);

    await page.evaluate(() => {
      document.documentElement.dir = "rtl";
    });
    const rtl = await xs();
    expect(rtl.home).toBeGreaterThan(rtl.profile);
    expect(await badgeSide()).toBeLessThan(0);
  });
});
