/**
 * Density items swap the control-height ladder (`--ks-control-*`) and nothing
 * else. base.css defines the default ladder; a density item is the one
 * file a consumer installs to move every Button, Input, Select, Toggle and
 * TableHead together.
 */

import { registryItemSchema } from "shadcn/schema";
import { describe, expect, it } from "vitest";

import {
  builtItemPath,
  type RegistryItem,
  readJson,
  readRegistry,
} from "./registry-paths";

const SPACING_STEPS = /^calc\(var\(--spacing\) \* (\d+(?:\.\d+)?)\)$/;
const RUNGS = [
  "ks-control-xs",
  "ks-control-sm",
  "ks-control-md",
  "ks-control-lg",
];
/** Tailwind's default --spacing, and the WCAG 2.5.8 minimum target size. */
const SPACING_PX = 4;
const MIN_TARGET_PX = 24;

const densityItems = readRegistry().items.filter((i) =>
  i.name.startsWith("density/")
);

describe("density items", () => {
  it("ships compact", () => {
    expect(densityItems.map((i) => i.name)).toContain("density/compact");
  });

  it.each(densityItems.map((i) => i.name))(
    "%s parses against the shadcn schema",
    (name) => {
      const item = readJson<unknown>(builtItemPath(name));
      expect(registryItemSchema.safeParse(item).success).toBe(true);
    }
  );

  it.each(densityItems.map((i) => i.name))(
    "%s sets the four rungs, in ascending order, never under 24px",
    (name) => {
      const item = readJson<RegistryItem>(builtItemPath(name));
      const vars = item.cssVars?.light ?? {};
      expect(Object.keys(vars).sort()).toEqual([...RUNGS].sort());
      const px = RUNGS.map((rung) => {
        const match = SPACING_STEPS.exec(vars[rung] ?? "");
        expect(
          match,
          `${rung} must be calc(var(--spacing) * n)`
        ).not.toBeNull();
        return Number(match?.[1]) * SPACING_PX;
      });
      expect([...px].sort((a, b) => a - b)).toEqual(px);
      expect(Math.min(...px)).toBeGreaterThanOrEqual(MIN_TARGET_PX);
    }
  );

  it.each(densityItems.map((i) => i.name))(
    "%s leaves colours and dark mode alone",
    (name) => {
      const item = readJson<RegistryItem>(builtItemPath(name));
      expect(Object.keys(item.cssVars ?? {})).toEqual(["light"]);
    }
  );
});
