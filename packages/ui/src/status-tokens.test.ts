// @vitest-environment node

/**
 * Status colour comes from tokens, never from Tailwind's palette.
 *
 * Alert, Toast and SelectionBar each hard-coded their own green, yellow, red
 * and blue — with `dark:` overrides — so the warning Alert was yellow while
 * every other warning was the `--warning` amber, and none of them followed a
 * theme. AGENTS.md has always said "never `text-emerald-600`"; nothing
 * enforced it, so it drifted three times.
 *
 * Neutrals (`zinc`, `white`, `black` …) are not status colour and stay
 * allowed. Badge's colour variants are the documented exception.
 */

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { alertVariants } from "./alert";

const SRC_DIR = import.meta.dirname;
const SOURCE_FILE = /\.tsx?$/;

const CHROMATIC =
  "red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose";
const RAW_PALETTE = new RegExp(
  `\\b(?:bg|text|border|ring|fill|stroke|outline|from|to|via|shadow|decoration|accent|caret|divide)-(?:${CHROMATIC})-\\d{2,3}\\b`
);

const OKLCH_STATUS_MIX =
  /color-mix\(in_oklch,var\(--(?:success|warning|destructive|info)\)/;

/** Files allowed to use palette colours, each with its reason. */
const ALLOWED = new Set([
  // Badge's colour variants are an explicit, documented palette.
  "badge.tsx",
]);

describe("status colour", () => {
  it("never uses a raw chromatic palette class in component source", () => {
    const offenders: string[] = [];
    for (const file of readdirSync(SRC_DIR)) {
      if (
        !SOURCE_FILE.test(file) ||
        file.includes(".test.") ||
        file.includes(".stories.") ||
        ALLOWED.has(file)
      ) {
        continue;
      }
      const lines = readFileSync(join(SRC_DIR, file), "utf-8").split("\n");
      lines.forEach((line, i) => {
        const match = RAW_PALETTE.exec(line);
        if (match) {
          offenders.push(`${file}:${i + 1} ${match[0]}`);
        }
      });
    }
    expect(offenders).toEqual([]);
  });

  it("catches the classes it exists to catch", () => {
    // Guards the regex itself: a typo here would pass the scan vacuously.
    for (const cls of [
      "bg-green-500/15",
      "text-yellow-700",
      "dark:text-emerald-300",
      "hover:bg-rose-500/10",
    ]) {
      expect(RAW_PALETTE.test(cls), cls).toBe(true);
    }
    for (const cls of ["bg-zinc-950", "text-success", "bg-warning/10"]) {
      expect(RAW_PALETTE.test(cls), cls).toBe(false);
    }
  });

  it("mixes status tokens in oklab, never oklch", () => {
    // An oklch mix toward white (`oklch(1 0 0)`, hue 0) interpolates the hue
    // too, and turned SelectionBar's green Export button yellow.
    const offenders = readdirSync(SRC_DIR)
      .filter((f) => SOURCE_FILE.test(f) && !f.includes(".test."))
      .filter((f) =>
        OKLCH_STATUS_MIX.test(readFileSync(join(SRC_DIR, f), "utf-8"))
      );
    expect(offenders).toEqual([]);
  });

  it.each([
    ["success", "success"],
    ["warning", "warning"],
    ["error", "destructive"],
    ["info", "info"],
  ] as const)("Alert %s draws from the --%s token", (variant, token) => {
    const classes = alertVariants({ variant }).split(" ");
    expect(classes).toContain(`bg-${token}/10`);
    expect(classes).toContain(`*:[svg]:text-${token}`);
    // Text stays neutral: the status tokens are tuned as fills, and
    // text-warning on a 10% tint is under 2:1.
    expect(classes).toContain("text-card-foreground");
    expect(classes.some((c) => c.startsWith("dark:"))).toBe(false);
  });
});
