/**
 * The Stepper page's root props table must describe the component's real
 * API. It listed `activeStep` and `orientation`, which the component never
 * had; the controlled pair is `value` / `onValueChange`.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const MDX = join(import.meta.dirname, "../content/docs/components/stepper.mdx");
const ROOT_TABLE = /### Stepper\n\n\| Prop[\s\S]*?(?=\n### )/;

describe("Stepper docs", () => {
  const table = ROOT_TABLE.exec(readFileSync(MDX, "utf8"))?.[0] ?? "";

  it("documents the controlled value and its change handler", () => {
    expect(table).toContain("| `value` |");
    expect(table).toContain("| `onValueChange` |");
  });

  it("does not list props the component does not have", () => {
    expect(table).not.toContain("`activeStep`");
    expect(table).not.toContain("`orientation`");
  });
});
