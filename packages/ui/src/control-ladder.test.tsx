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
import { Textarea } from "./textarea";
import { toggleVariants } from "./toggle";
import { cn, POPUP_ITEM_HEIGHT } from "./utils";

/** The ladder. Everything below is measured against these. */
const XS = "h-6";
const SM = "h-8";
const MD = "h-10";
const LG = "h-12";

const ALL_TIERS = [XS, SM, MD, LG];

/**
 * The radius ladder, which is flatter than the height ladder on purpose.
 *
 * Every control is `rounded-md`; only the 24px rung steps down. Radius does not
 * scale with height because controls of different tiers still sit in the same
 * row and want the same corner — what breaks at 24px is the geometry, not the
 * consistency: a 10px radius on a 24px box leaves 4px of straight edge and the
 * corner arcs nearly meet.
 *
 * `rounded-lg` is deliberately absent. It belongs to surfaces (Modal, Popover,
 * Toast, Alert, Item, Accordion box, popup containers) and to containers whose
 * children are inset by padding (TabsList, SelectionBar), neither of which is a
 * control. That is why there is no source-scan rule here in the style of
 * `BARE_H9`: `select.tsx` holds a control at `rounded-md` and a popup surface at
 * `rounded-lg` in the same file, so no file-level rule can express it.
 */
const R_XS = "rounded-sm";
const R_CONTROL = "rounded-md";

const ALL_RADII = [R_XS, R_CONTROL, "rounded-lg", "rounded-xl"];

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

/**
 * The `rounded-*` a CVA family actually resolves to.
 *
 * Unlike height, radius is declared on the cva *base* and overridden by a size
 * entry, so the raw `buttonVariants({ size: "xs" })` string contains both
 * `rounded-md` and `rounded-sm`. Only `cn()` — which is what the component
 * itself applies — collapses that to the one that wins. Asserting the raw
 * string would fail on correct code, which is how this helper got written.
 *
 * Bare tokens only: a variant-modified token like `data-[size=sm]:rounded-md`
 * says nothing about what the element resolves to at rest, and counting it
 * would let a component pass by declaring every tier at once — the
 * vacuous-assertion trap this file's header warns about.
 */
function radiusTokens(className: string): string[] {
  return cn(className)
    .split(WHITESPACE)
    .filter((token) => ALL_RADII.includes(token));
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

  it.each([
    ["xs", R_XS],
    ["sm", R_CONTROL],
    ["default", R_CONTROL],
    ["lg", R_CONTROL],
    ["icon-xs", R_XS],
    ["icon-sm", R_CONTROL],
    ["icon", R_CONTROL],
    ["icon-lg", R_CONTROL],
  ] as const)("Button %s is %s", (size, expected) => {
    expect(radiusTokens(buttonVariants({ size }))).toEqual([expected]);
  });

  it.each([
    ["sm", R_CONTROL],
    ["default", R_CONTROL],
    ["lg", R_CONTROL],
  ] as const)("Toggle %s is %s", (size, expected) => {
    expect(radiusTokens(toggleVariants({ size }))).toEqual([expected]);
  });

  it("gives Toggle and Button the same radius at every shared tier", () => {
    for (const size of ["sm", "default", "lg"] as const) {
      expect(radiusTokens(toggleVariants({ size }))).toEqual(
        radiusTokens(buttonVariants({ size }))
      );
    }
  });
});

// =============================================================================
// The radius neighbour set
// =============================================================================
/**
 * Every control that can share a row resolves to the same corner.
 *
 * This is the assertion that was missing when Button and Toggle sat at
 * `rounded-lg` while the whole input family was already `rounded-md`: each side
 * was internally consistent, so a per-component test saw nothing wrong. The bug
 * only exists in the comparison.
 *
 * Declarations only — jsdom loads no CSS, so this proves the classes agree, not
 * that the pixels do. `apps/docs/e2e/control-ladder.spec.ts` measures the
 * rendered corner.
 */
describe("radius: the neighbour set", () => {
  it("Button and Toggle declare the control radius", () => {
    expect(radiusTokens(buttonVariants({ size: "default" }))).toEqual([
      R_CONTROL,
    ]);
    expect(radiusTokens(toggleVariants({ size: "default" }))).toEqual([
      R_CONTROL,
    ]);
  });

  it("Input declares the control radius", () => {
    render(<Input aria-label="Amount" />);
    expect(screen.getByRole("textbox")).toHaveClass(R_CONTROL);
  });

  it("Textarea declares the control radius", () => {
    render(<Textarea aria-label="Notes" />);
    expect(screen.getByRole("textbox")).toHaveClass(R_CONTROL);
  });

  it("InputGroup declares the control radius", () => {
    const { container } = render(<InputGroup />);
    expect(container.querySelector('[data-slot="input-group"]')).toHaveClass(
      R_CONTROL
    );
  });

  it("SelectTrigger declares the control radius", () => {
    render(
      <Select>
        <SelectTrigger aria-label="Rows">
          <SelectValue />
        </SelectTrigger>
      </Select>
    );
    expect(screen.getByRole("combobox")).toHaveClass(R_CONTROL);
  });

  it("NativeSelect declares the control radius", () => {
    const { container } = render(<NativeSelect aria-label="Rows" />);
    expect(container.querySelector("select")).toHaveClass(R_CONTROL);
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
