/**
 * The control height ladder, asserted in one place.
 *
 * `xs` 24 · `sm` 32 · `default` 40 · `lg` 48. Every interactive control that
 * can sit beside another in a toolbar resolves its tiers to these numbers, so
 * "leave both at their defaults" is never a bug. Toggle drifted off this ladder
 * for 2.5 months at 36/32/40 -- shadcn's ladder, inherited when the component
 * was reworked and never revisited -- which is what this file exists to catch.
 *
 * Popup items are deliberately NOT on the ladder: a menu row is not a control,
 * and it has its own density switch (`size="compact"`). Pinned below so nobody
 * "fixes" it into alignment.
 *
 * These are *declaration* assertions. This project runs jsdom with no CSS
 * (`src/test/setup.ts` imports none), so `getComputedStyle` returns nothing
 * meaningful and no test here can prove two families render the same pixels.
 * That assertion lives in `apps/docs/e2e/control-ladder.spec.ts`, against a
 * real browser.
 *
 * Three adapters, because the families do not declare size the same way:
 *
 *  - CVA families expose a `*Variants` function -- call it, read the string.
 *  - `cn()`-conditional families swap the class, so render and check presence
 *    AND absence of the other tiers.
 *  - Attribute-variant families carry EVERY tier's class at all times
 *    (`data-[size=default]:h-10 data-[size=sm]:h-8`), so a bare `toHaveClass`
 *    is either impossible or vacuously true. Assert the prefixed token plus
 *    the active `data-size`.
 */

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { buttonVariants } from "./button";
import { Input } from "./input";
import { InputGroup } from "./input-group";
import { NativeSelect } from "./native-select";
import { Select, SelectTrigger, SelectValue } from "./select";
import { Table, TableHead, TableHeader, TableRow } from "./table";
import { toggleVariants } from "./toggle";
import { POPUP_ITEM_HEIGHT } from "./utils";

/** The ladder. Everything below is measured against these. */
const XS = "h-6";
const SM = "h-8";
const MD = "h-10";
const LG = "h-12";

const ALL_TIERS = [XS, SM, MD, LG];

const SOURCE_FILE = /\.tsx?$/;
const WHITESPACE = /\s+/;

/** The popup tier. Sanctioned only in `POPUP_ITEM_HEIGHT`. */
const BARE_H9 = /(?:^|[\s"'`])h-9(?:$|[\s"'`])/;

/** Every `h-*` token in a class string, so we can assert what is NOT there. */
function heightTokens(className: string): string[] {
  return className
    .split(WHITESPACE)
    .filter((token) => ALL_TIERS.includes(token));
}

// =============================================================================
// CVA families — call the variants function
// =============================================================================
describe("ladder: CVA families", () => {
  it.each([
    ["xs", XS],
    ["sm", SM],
    ["default", MD],
    ["lg", LG],
  ] as const)("Button %s is %s", (size, expected) => {
    expect(heightTokens(buttonVariants({ size }))).toEqual([expected]);
  });

  it.each([
    ["sm", SM],
    ["default", MD],
    ["lg", LG],
  ] as const)("Toggle %s is %s", (size, expected) => {
    expect(heightTokens(toggleVariants({ size }))).toEqual([expected]);
  });

  it("gives Toggle and Button the same height at every shared tier", () => {
    for (const size of ["sm", "default", "lg"] as const) {
      expect(heightTokens(toggleVariants({ size }))).toEqual(
        heightTokens(buttonVariants({ size }))
      );
    }
  });
});

// =============================================================================
// cn() conditional families — render, assert presence and absence
// =============================================================================
describe("ladder: conditional families", () => {
  it.each([
    ["default", MD, SM],
    ["sm", SM, MD],
  ] as const)("Input %s is %s", (size, expected, notExpected) => {
    render(<Input aria-label="Amount" size={size} />);
    const input = screen.getByRole("textbox");

    expect(input).toHaveClass(expected);
    expect(input).not.toHaveClass(notExpected);
  });

  it.each([
    ["default", MD, SM],
    ["sm", SM, MD],
  ] as const)("InputGroup %s is %s", (size, expected, notExpected) => {
    const { container } = render(<InputGroup size={size} />);
    const group = container.querySelector('[data-slot="input-group"]');

    expect(group).toHaveClass(expected);
    expect(group).not.toHaveClass(notExpected);
  });
});

// =============================================================================
// Attribute-variant families — every tier's class is always present
// =============================================================================
describe("ladder: attribute-variant families", () => {
  it.each([
    ["default", MD],
    ["sm", SM],
  ] as const)("SelectTrigger %s declares %s", (size, expected) => {
    render(
      <Select>
        <SelectTrigger aria-label="Rows" size={size}>
          <SelectValue />
        </SelectTrigger>
      </Select>
    );
    const trigger = screen.getByRole("combobox");

    expect(trigger).toHaveAttribute("data-size", size);
    expect(trigger).toHaveClass(`data-[size=${size}]:${expected}`);
  });

  it("NativeSelect declares the ladder", () => {
    const { container } = render(<NativeSelect aria-label="Rows" />);
    const select = container.querySelector("select");

    // `default` is the bare literal; only `sm` is attribute-scoped. A bare
    // `toHaveClass("h-10")` would therefore pass at BOTH sizes — the exact
    // silently-green assertion this file exists to prevent.
    expect(select).toHaveClass(MD);
    expect(select).toHaveClass(`data-[size=sm]:${SM}`);
  });

  it("TableHead declares the ladder", () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
          </TableRow>
        </TableHeader>
      </Table>
    );
    const head = screen.getByRole("columnheader");

    expect(head).toHaveClass(MD);
    expect(head).toHaveClass(`group-data-[size=sm]/table:${SM}`);
  });
});

// =============================================================================
// The popup tier is deliberately off the ladder
// =============================================================================
describe("popup item height", () => {
  it("is 36px, and 32px when compact", () => {
    // Not a control tier. A menu row is not something you put beside a button,
    // and popups have their own density switch. If you are here because you
    // want this to be h-10, read the comment at the top of this file.
    expect(POPUP_ITEM_HEIGHT).toBe("h-9 [[data-size=compact]_&]:h-8");
  });

  it("sits off the control ladder", () => {
    expect(ALL_TIERS).not.toContain("h-9");
  });

  /**
   * The general case, and the one that would actually have caught Toggle.
   *
   * Enumerating components by hand only guards the ones someone remembered to
   * list. This instead asserts that *nothing* in the library declares a bare
   * 36px height, so a component cannot quietly drift onto the popup tier the
   * way Toggle did. `POPUP_ITEM_HEIGHT` is the single sanctioned exception;
   * `BreadcrumbEllipsis` uses `size-9`, which is an icon box, not a control
   * tier.
   */
  it("is the only thing in the library declaring a 36px height", () => {
    const srcDir = join(import.meta.dirname, ".");
    const offenders: string[] = [];

    for (const file of readdirSync(srcDir)) {
      if (!SOURCE_FILE.test(file) || file.includes(".test.")) {
        continue;
      }
      const source = readFileSync(join(srcDir, file), "utf-8");
      for (const line of source.split("\n")) {
        if (BARE_H9.test(line) && !line.includes("POPUP_ITEM_HEIGHT")) {
          offenders.push(`${file}: ${line.trim().slice(0, 70)}`);
        }
      }
    }

    expect(offenders).toEqual([]);
  });
});
