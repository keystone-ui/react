// @vitest-environment node

/**
 * Popup layering and label overflow, read straight from source.
 *
 * Every Base UI popup is a Positioner wrapping a Popup. The positioners all
 * carried `isolate z-50` while the popups carried `z-(--z-popover,60)` and
 * friends — but a z-index on the Popup only orders it *inside* the
 * positioner's own stacking context, so the documented scale (popups 60,
 * tooltip 70) was dead CSS and every popup really sat at 50, level with an
 * open Modal. The z-index has to live on the positioned element.
 *
 * Select's ItemText carried `shrink-0`, so a long option label refused to
 * shrink and spilled out of its row instead of ellipsizing.
 */

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const SRC_DIR = import.meta.dirname;
const TSX = /\.tsx$/;
const BARE_Z50 = /\bz-50\b/;
const ISOLATE = /\bisolate\b/;
const Z_TOKEN = /\bz-\(--z-(?:dropdown|popover|tooltip),\d+\)/;
const ANY_Z = /\bz-(?:\[var\(--z-|\(--z-|\d)/;
const ITEM_TEXT = /<SelectPrimitive\.ItemText className="([^"]*)"/;
const SHRINK_0 = /\bshrink-0\b/;
const MIN_W_0 = /\bmin-w-0\b/;

const SOURCES = readdirSync(SRC_DIR)
  .filter((file) => TSX.test(file) && !file.includes(".test."))
  .map((file) => ({
    file,
    source: readFileSync(join(SRC_DIR, file), "utf-8"),
  }));

/** Each `<X.Positioner …>` opening tag, with its props. */
const POSITIONER = /<\w+\.Positioner\b([^>]*)>/g;
/** Each `<X.Popup …>` opening tag, with its props. */
const POPUP = /<\w+\.Popup\b([^>]*)>/g;
const POSITIONER_PRESENT = /<\w+\.Positioner\b/;

const positioners = SOURCES.flatMap(({ file, source }) =>
  [...source.matchAll(POSITIONER)].map((m) => ({ file, props: m[1] }))
);
// Only popups that sit in a Positioner: a Modal or Drawer popup is itself the
// positioned element and rightly carries its own z-index.
const popups = SOURCES.filter(({ source }) =>
  POSITIONER_PRESENT.test(source)
).flatMap(({ file, source }) =>
  [...source.matchAll(POPUP)].map((m) => ({ file, props: m[1] }))
);

describe("popup layering", () => {
  it("finds the positioners it guards", () => {
    // select, tooltip, popover, combobox, and dropdown-menu's content + sub
    expect(positioners.length).toBeGreaterThanOrEqual(6);
  });

  it("puts a z-index token on every Positioner, never a bare z-50", () => {
    const offenders = positioners
      .filter(
        ({ props }) =>
          BARE_Z50.test(props) || ISOLATE.test(props) || !Z_TOKEN.test(props)
      )
      .map(({ file, props }) => `${file}: ${props.trim()}`);
    expect(offenders).toEqual([]);
  });

  it("does not repeat the z-index on the Popup, where it would be scoped", () => {
    const offenders = popups
      .filter(({ props }) => ANY_Z.test(props))
      .map(({ file }) => file);
    expect(offenders).toEqual([]);
  });
});

describe("select label overflow", () => {
  const select = SOURCES.find(({ file }) => file === "select.tsx")?.source;

  it("lets ItemText shrink so a long label ellipsizes", () => {
    const itemText = select?.match(ITEM_TEXT)?.[1];
    expect(itemText).toBeDefined();
    expect(itemText).not.toMatch(SHRINK_0);
    expect(itemText).toMatch(MIN_W_0);
  });
});
