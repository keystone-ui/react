import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Rendering cost. Every element the JSX runtime creates is counted, so a
// symbol or digit part that re-renders creates its `<span>` again and is
// seen; a part React skips creates nothing.
const created = vi.hoisted(() => ({ spans: [] as string[] }));

function countSpans<T extends (...args: never[]) => unknown>(original: T): T {
  return ((
    type: unknown,
    props: Record<string, unknown> | null,
    ...rest: never[]
  ) => {
    if (type === "span" && props) {
      const slot = props["data-slot"];
      if (slot === "rolling-number-symbol") {
        created.spans.push(`symbol:${String(props["data-type"])}`);
      } else if (slot === "rolling-number-digit") {
        created.spans.push(`digit:${String(props["data-place"])}`);
      }
    }
    return (original as (...a: unknown[]) => unknown)(type, props, ...rest);
  }) as T;
}

vi.mock("react/jsx-dev-runtime", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react/jsx-dev-runtime")>();
  return { ...actual, jsxDEV: countSpans(actual.jsxDEV) };
});
vi.mock("react/jsx-runtime", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react/jsx-runtime")>();
  return {
    ...actual,
    jsx: countSpans(actual.jsx),
    jsxs: countSpans(actual.jsxs),
  };
});

import { RollingNumber } from "./rolling-number";

const settle = () =>
  act(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
        )
      )
  );

beforeEach(() => {
  created.spans = [];
});
afterEach(() => {
  vi.restoreAllMocks();
});

describe("rendering cost", () => {
  it("unaffected parts do not re-render across equal inline options and another column's change", async () => {
    const { rerender } = render(
      <RollingNumber
        format={{ style: "currency", currency: "EUR" }}
        value={1234.5}
      />
    );
    await settle();
    expect(created.spans.length).toBeGreaterThan(0);
    created.spans = [];
    rerender(
      <RollingNumber
        format={{ currency: "EUR", style: "currency" }}
        value={1234.5}
      />
    );
    expect(created.spans).toEqual([]);
    rerender(
      <RollingNumber
        format={{ currency: "EUR", style: "currency" }}
        value={1235.5}
      />
    );
    await settle();
    // Only the ones column changed; its settlement may render it again.
    expect(created.spans.filter((s) => s !== "digit:0")).toEqual([]);
    expect(created.spans.filter((s) => s === "digit:0").length).toBeGreaterThan(
      0
    );
    // After the roll settles, equal inline options re-render no part, the
    // column that rolled included.
    created.spans = [];
    rerender(
      <RollingNumber
        format={{ style: "currency", currency: "EUR" }}
        value={1235.5}
      />
    );
    expect(created.spans).toEqual([]);
  });
});
