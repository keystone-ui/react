import { act, render } from "@testing-library/react";
import * as React from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { RollingNumber, type RollingNumberProps } from "./rolling-number";

// DOM, keys, attributes and ARIA only. jsdom loads no CSS, so the roll
// itself, copy, layout and reduced motion are measured in a real browser:
// apps/storybook/stories/rolling-number.stories.tsx.

const ROOT = '[data-slot="rolling-number"]';
const DIGIT = '[data-slot="rolling-number-digit"]';

const root = (c: ParentNode = document) => c.querySelector(ROOT) as HTMLElement;
const digits = (c: ParentNode = document) =>
  [...c.querySelectorAll(DIGIT)] as HTMLElement[];
const srText = (c: ParentNode = document) =>
  (root(c).querySelector(".sr-only") as HTMLElement).textContent;
const visualRun = (c: ParentNode = document) =>
  root(c).querySelector('[aria-hidden="true"]') as HTMLElement;
const directions = (c: ParentNode = document) =>
  digits(c).map((d) => d.getAttribute("data-direction"));
const byPlace = (place: number, c: ParentNode = document) =>
  root(c).querySelector(`${DIGIT}[data-place="${place}"]`) as HTMLElement;
const STARTING = /(^|\s|:)starting:/;
const WHITESPACE = /\s+/;
const BIDI_MARK = /[\u061c\u200e\u200f]/;
const startingClasses = (c: ParentNode = document) =>
  [...root(c).querySelectorAll("*")].filter((el) =>
    STARTING.test(el.getAttribute("class") ?? "")
  );

/** Text a screen reader gets: every text node outside an aria-hidden subtree. */
function accessibleTexts(el: HTMLElement): string[] {
  const out: string[] = [];
  const walk = (node: Node) => {
    if (
      node instanceof HTMLElement &&
      node.getAttribute("aria-hidden") === "true"
    ) {
      return;
    }
    if (node.nodeType === Node.TEXT_NODE && node.textContent) {
      out.push(node.textContent);
    }
    for (const child of node.childNodes) {
      walk(child);
    }
  };
  walk(el);
  return out;
}

function Harness(props: RollingNumberProps) {
  return <RollingNumber {...props} />;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("text equals Intl", () => {
  const cases: [string, number, string, Intl.NumberFormatOptions][] = [
    ["de-DE EUR", 1234.5, "de-DE", { style: "currency", currency: "EUR" }],
    ["en-IN grouping", 12_345_678.9, "en-IN", {}],
    [
      "de-DE accounting negative",
      -1234.5,
      "de-DE",
      { style: "currency", currency: "EUR", currencySign: "accounting" },
    ],
    ["-0", -0, "en-US", {}],
    ["NaN", Number.NaN, "en-US", {}],
    ["Infinity", Number.POSITIVE_INFINITY, "en-US", {}],
    ["compact", 1234, "en-US", { notation: "compact" }],
    ["ar-EG percent", -0.25, "ar-EG", { style: "percent" }],
  ];
  it.each(cases)("%s", (_name, value, locale, format) => {
    const expected = new Intl.NumberFormat(locale, format).format(value);
    render(<RollingNumber format={format} locale={locale} value={value} />);
    expect(srText()).toBe(expected);
    expect(visualRun().textContent).toBe(expected);
  });

  it("keeps the bidi marks of ar-EG verbatim and in order", () => {
    const format = { style: "percent" } as const;
    const expected = new Intl.NumberFormat("ar-EG", format).format(-0.25);
    expect(expected).toMatch(BIDI_MARK);
    render(<RollingNumber format={format} locale="ar-EG" value={-0.25} />);
    expect(Array.from(visualRun().textContent ?? "")).toEqual(
      Array.from(expected)
    );
  });

  it("prints -0 as Intl does, and signDisplay negative is the remedy", () => {
    const { rerender } = render(<RollingNumber value={-0} />);
    expect(srText()).toBe("-0");
    rerender(<RollingNumber format={{ signDisplay: "negative" }} value={-0} />);
    expect(srText()).toBe("0");
  });
});

describe("keys", () => {
  it("keeps integer columns' identity when a fraction digit is added", () => {
    const { rerender } = render(<Harness value={1234.5} />);
    const ints = digits().filter((d) => d.dataset.type === "integer");
    expect(ints).toHaveLength(4);
    expect(digits().filter((d) => d.dataset.type === "fraction")).toHaveLength(
      1
    );
    rerender(<Harness value={1234.25} />);
    const after = digits().filter((d) => d.dataset.type === "integer");
    expect(after).toHaveLength(4);
    for (const [i, el] of after.entries()) {
      expect(el).toBe(ints[i]);
    }
    expect(digits().filter((d) => d.dataset.type === "fraction")).toHaveLength(
      2
    );
  });

  it("keeps the three columns' identity from 999 to 1,000", () => {
    const { rerender } = render(<Harness value={999} />);
    const before = [2, 1, 0].map((p) => byPlace(p));
    rerender(<Harness value={1000} />);
    expect([2, 1, 0].map((p) => byPlace(p))).toEqual(before);
    for (const [i, el] of [2, 1, 0].map((p) => byPlace(p)).entries()) {
      expect(el).toBe(before[i]);
    }
    expect(byPlace(3).textContent).toBe("1");
  });

  it("numbers places leftward from the decimal point across groups", () => {
    render(<Harness format={{ minimumFractionDigits: 2 }} value={1234.5} />);
    expect(digits().map((d) => d.dataset.place)).toEqual([
      "3",
      "2",
      "1",
      "0",
      "-1",
      "-2",
    ]);
  });
});

describe("only changed columns roll", () => {
  it("sets data-direction on the changed columns alone", () => {
    const { rerender } = render(<Harness value={1234} />);
    rerender(<Harness value={1235} />);
    expect(directions()).toEqual([null, null, null, "up"]);
    rerender(<Harness value={1245} />);
    expect(directions()).toEqual([null, null, "up", null]);
  });

  it("keeps the roll through a re-render with the same value, in StrictMode", () => {
    const view = (value: number, n: number) => (
      <React.StrictMode>
        <div data-n={n}>
          <RollingNumber value={value} />
        </div>
      </React.StrictMode>
    );
    const { rerender } = render(view(5, 0));
    rerender(view(6, 1));
    rerender(view(6, 2));
    const col = byPlace(0);
    expect(col.dataset.direction).toBe("up");
    expect(col.querySelector("[data-prev]")?.getAttribute("data-prev")).toBe(
      "5"
    );
  });
});

describe("trend", () => {
  const roll = (
    from: number,
    to: number,
    props: Partial<RollingNumberProps>
  ) => {
    const { rerender, unmount } = render(<Harness {...props} value={from} />);
    rerender(<Harness {...props} value={to} />);
    const result = directions().filter(Boolean);
    unmount();
    return result;
  };
  it("compares numeric values in auto", () => {
    expect(roll(5, 6, {})).toEqual(["up"]);
    expect(roll(6, 5, {})).toEqual(["down"]);
    expect(roll(-5, -6, {})).toEqual(["down"]);
    expect(roll(1.0, 1.001, { format: { maximumFractionDigits: 2 } })).toEqual(
      []
    );
  });
  it("forces the direction when given", () => {
    expect(roll(5, 6, { trend: "down" })).toEqual(["down"]);
    expect(roll(6, 5, { trend: "up" })).toEqual(["up"]);
  });
});

describe("when nothing rolls", () => {
  it("first render has no direction and no starting: class", () => {
    render(<Harness value={1234} />);
    expect(directions().filter(Boolean)).toEqual([]);
    expect(startingClasses()).toEqual([]);
  });

  it("a roll applies the starting: class to the changed face only", () => {
    const { rerender } = render(<Harness value={1234} />);
    rerender(<Harness value={1235} />);
    expect(startingClasses()).toHaveLength(1);
    expect(byPlace(0).contains(startingClasses()[0])).toBe(true);
  });

  it("drops the start position two frames into a roll, keeping data-prev", async () => {
    const { rerender } = render(<Harness value={1234} />);
    rerender(<Harness value={1235} />);
    expect(startingClasses()).toHaveLength(1);
    await act(
      () =>
        new Promise<void>((resolve) =>
          requestAnimationFrame(() =>
            requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
          )
        )
    );
    expect(startingClasses()).toEqual([]);
    expect(byPlace(0).dataset.direction).toBe("up");
    expect(
      byPlace(0).querySelector("[data-prev]")?.getAttribute("data-prev")
    ).toBe("4");
  });

  it("a format change snaps", () => {
    const { rerender } = render(
      <Harness format={{ minimumFractionDigits: 1 }} value={1.5} />
    );
    rerender(<Harness format={{ minimumFractionDigits: 2 }} value={2.5} />);
    expect(directions().filter(Boolean)).toEqual([]);
    expect(startingClasses()).toEqual([]);
  });

  it("a locale change snaps", () => {
    const { rerender } = render(<Harness locale="en-US" value={1234} />);
    rerender(<Harness locale="de-DE" value={1235} />);
    expect(directions().filter(Boolean)).toEqual([]);
    expect(startingClasses()).toEqual([]);
  });

  it("compact notation has no columns and never rolls", () => {
    const format = { notation: "compact" } as const;
    const { rerender } = render(<Harness format={format} value={1234} />);
    expect(digits()).toEqual([]);
    rerender(<Harness format={format} value={2345} />);
    expect(digits()).toEqual([]);
    expect(startingClasses()).toEqual([]);
  });

  it("NaN and Infinity snap, both ways", () => {
    const { rerender } = render(<Harness value={5} />);
    rerender(<Harness value={Number.NaN} />);
    expect(digits()).toEqual([]);
    rerender(<Harness value={6} />);
    expect(directions().filter(Boolean)).toEqual([]);
    rerender(<Harness value={Number.POSITIVE_INFINITY} />);
    expect(srText()).toBe("∞");
    expect(startingClasses()).toEqual([]);
  });

  it("a column that just appeared does not roll", () => {
    const { rerender } = render(<Harness value={999} />);
    rerender(<Harness value={1000} />);
    expect(byPlace(3).dataset.direction).toBeUndefined();
    expect(byPlace(3).querySelector("[data-prev]")).toBeNull();
    expect(byPlace(0).dataset.direction).toBe("up");
  });

  it("an inline format with the same contents is not a format change", () => {
    const { rerender } = render(
      <Harness format={{ style: "currency", currency: "EUR" }} value={5} />
    );
    const before = digits();
    rerender(
      <Harness format={{ style: "currency", currency: "EUR" }} value={5} />
    );
    expect(digits()).toEqual(before);
    for (const [i, el] of digits().entries()) {
      expect(el).toBe(before[i]);
    }
    rerender(
      <Harness format={{ currency: "EUR", style: "currency" }} value={6} />
    );
    expect(directions().filter(Boolean)).toEqual(["up"]);
  });

  it("a Locale object equal by value is not a locale change", () => {
    const { rerender } = render(
      <Harness locale={new Intl.Locale("de-DE")} value={5} />
    );
    rerender(<Harness locale={new Intl.Locale("de-DE")} value={6} />);
    expect(directions().filter(Boolean)).toEqual(["up"]);
  });

  it("animated={false} renders no digit columns", () => {
    const { rerender } = render(<Harness animated={false} value={1234} />);
    expect(digits()).toEqual([]);
    expect(root().textContent).toBe("1,234");
    rerender(<Harness animated={false} value={1235} />);
    expect(digits()).toEqual([]);
    expect(root().textContent).toBe("1,235");
  });
});

describe("interrupt", () => {
  it("remounts the face from the previously committed glyph", () => {
    const { rerender } = render(<Harness value={5} />);
    rerender(<Harness value={6} />);
    const first = byPlace(0).firstElementChild;
    rerender(<Harness value={7} />);
    const face = byPlace(0).firstElementChild as HTMLElement;
    expect(face).not.toBe(first);
    expect(face.dataset.prev).toBe("6");
    expect(face.textContent).toBe("7");
  });
});

describe("numbering systems", () => {
  it("rolls Arabic-Indic digits", () => {
    const { rerender } = render(
      <Harness locale="ar-EG-u-nu-arab" value={1234} />
    );
    expect(digits().map((d) => d.textContent)).toEqual(["١", "٢", "٣", "٤"]);
    rerender(<Harness locale="ar-EG-u-nu-arab" value={1235} />);
    expect(directions()).toEqual([null, null, null, "up"]);
    expect(byPlace(0).textContent).toBe("٥");
  });

  it("splits supplementary-plane digits by code point", () => {
    const locale = "en-US-u-nu-adlm";
    const { rerender } = render(<Harness locale={locale} value={1234} />);
    expect(digits()).toHaveLength(4);
    expect(digits().map((d) => Array.from(d.textContent ?? "").length)).toEqual(
      [1, 1, 1, 1]
    );
    rerender(<Harness locale={locale} value={1235} />);
    expect(directions()).toEqual([null, null, null, "up"]);
    expect(srText()).toBe(new Intl.NumberFormat(locale).format(1235));
  });
});

describe("ARIA", () => {
  it("hides the visual run and exposes format(value) once", () => {
    const format = { style: "currency", currency: "EUR" } as const;
    render(<RollingNumber format={format} locale="de-DE" value={1234.5} />);
    expect(visualRun().getAttribute("aria-hidden")).toBe("true");
    expect(accessibleTexts(root())).toEqual([
      new Intl.NumberFormat("de-DE", format).format(1234.5),
    ]);
  });

  it("is not a live region by default", () => {
    render(<RollingNumber value={1} />);
    expect(root().querySelector("[aria-live]")).toBeNull();
    expect(root().hasAttribute("aria-live")).toBe(false);
  });

  it("a passed aria-live lands on the root", () => {
    render(<RollingNumber aria-atomic="true" aria-live="polite" value={1} />);
    expect(root().getAttribute("aria-live")).toBe("polite");
    expect(root().getAttribute("aria-atomic")).toBe("true");
    expect(root().querySelector(".sr-only")?.hasAttribute("aria-live")).toBe(
      false
    );
  });

  it("passes className, id, style, data-* and ref to the root", () => {
    const ref = React.createRef<HTMLSpanElement>();
    render(
      <RollingNumber
        className="text-2xl"
        data-testid="n"
        id="n"
        ref={ref}
        style={{ color: "red" }}
        value={1}
      />
    );
    expect(ref.current).toBe(root());
    expect(root().className).toContain("text-2xl");
    expect(root().className).toContain("tabular-nums");
    expect(root().id).toBe("n");
    expect(root().style.color).toBe("red");
    expect(root().dataset.testid).toBe("n");
  });

  it("keeps the sr-only text out of a selection", () => {
    render(<RollingNumber value={1} />);
    expect(root().querySelector(".sr-only")?.className).toContain(
      "select-none"
    );
  });
});

describe("parts", () => {
  it("marks every part with its type and slot", () => {
    const format = { style: "currency", currency: "EUR" } as const;
    render(<RollingNumber format={format} value={-1234.5} />);
    const parts = [
      ...visualRun().querySelectorAll(
        '[data-slot="rolling-number-digit"], [data-slot="rolling-number-symbol"]'
      ),
    ].map(
      (el) => `${el.getAttribute("data-slot")}:${el.getAttribute("data-type")}`
    );
    expect(parts).toEqual([
      "rolling-number-symbol:minusSign",
      "rolling-number-symbol:currency",
      "rolling-number-digit:integer",
      "rolling-number-symbol:group",
      "rolling-number-digit:integer",
      "rolling-number-digit:integer",
      "rolling-number-digit:integer",
      "rolling-number-symbol:decimal",
      "rolling-number-digit:fraction",
      "rolling-number-digit:fraction",
    ]);
  });

  it("isolates the numeric core left to right", () => {
    const format = { style: "currency", currency: "EUR" } as const;
    render(<RollingNumber format={format} value={-1234.5} />);
    const core = visualRun().querySelector('[dir="ltr"]') as HTMLElement;
    expect(core.textContent).toBe("1,234.50");
    expect(core.className).toContain("[unicode-bidi:isolate-override]");
  });

  it("propagates Intl's own errors", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() =>
      render(<RollingNumber format={{ style: "currency" }} value={1} />)
    ).toThrow(TypeError);
  });
});

describe("server render", () => {
  it("hydrates de-DE without a warning and without a roll", async () => {
    const errorSpy = vi.spyOn(console, "error");
    const recoverable = vi.fn();
    const ui = (
      <RollingNumber
        format={{ style: "currency", currency: "EUR" }}
        locale="de-DE"
        value={1234.5}
      />
    );
    const html = renderToString(ui);
    const host = document.createElement("div");
    host.innerHTML = html;
    document.body.append(host);
    let hydrated: ReturnType<typeof hydrateRoot> | undefined;
    try {
      await act(async () => {
        hydrated = hydrateRoot(host, ui, { onRecoverableError: recoverable });
      });
      expect(recoverable).not.toHaveBeenCalled();
      expect(errorSpy).not.toHaveBeenCalled();
      expect(directions(host).filter(Boolean)).toEqual([]);
      expect(startingClasses(host)).toEqual([]);
      expect(srText(host)).toBe(
        new Intl.NumberFormat("de-DE", {
          style: "currency",
          currency: "EUR",
        }).format(1234.5)
      );
    } finally {
      act(() => hydrated?.unmount());
      host.remove();
    }
  });
});

describe("default locale", () => {
  it("constructs the formatter with en-US when no locale is passed", () => {
    const spy = vi.spyOn(Intl, "NumberFormat");
    render(
      <RollingNumber format={{ maximumFractionDigits: 1 }} value={1.25} />
    );
    expect(spy).toHaveBeenCalled();
    for (const call of spy.mock.calls) {
      expect(call[0]).toBe("en-US");
    }
  });
});

// ---------------------------------------------------------------------------
// Formatter inputs and frame deadlines
// ---------------------------------------------------------------------------

/** Animation frames delivered by hand, one `step()` per frame. */
function controlFrames() {
  let queue = new Map<number, FrameRequestCallback>();
  let next = 0;
  vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
    next++;
    queue.set(next, cb);
    return next;
  });
  vi.spyOn(window, "cancelAnimationFrame").mockImplementation((handle) => {
    queue.delete(handle);
  });
  return {
    step: () =>
      act(() => {
        const due = queue;
        queue = new Map();
        for (const cb of due.values()) {
          cb(performance.now());
        }
      }),
  };
}

const faceAt = (place: number) =>
  byPlace(place).firstElementChild as HTMLElement;
const entering = (place: number) =>
  STARTING.test(faceAt(place).getAttribute("class") ?? "");

/** Calls of Intl.NumberFormat that build the main formatter, not the digit lookup. */
function mainCalls(spy: { mock: { calls: unknown[][] } }) {
  return spy.mock.calls.filter((call) => !isLookupCall(call)).length;
}
function lookupCalls(spy: { mock: { calls: unknown[][] } }) {
  return spy.mock.calls.filter(isLookupCall).length;
}
function isLookupCall(call: unknown[]) {
  const options = call[1] as Record<string, unknown> | undefined;
  return (
    options !== undefined &&
    Object.keys(options).sort().join() === "numberingSystem,useGrouping" &&
    options.useGrouping === false
  );
}

/** The error a single native construction throws for these inputs. */
function nativeError(
  locale: Intl.LocalesArgument,
  format: Intl.NumberFormatOptions
): Error {
  try {
    const probe = new Intl.NumberFormat(locale, format);
    probe.format(0);
  } catch (error) {
    return error as Error;
  }
  throw new Error("native construction did not throw");
}

/** The error rendering these props throws. */
function renderError(props: RollingNumberProps): unknown {
  try {
    render(<Harness {...props} />);
  } catch (error) {
    return error;
  }
  return null;
}

describe("formatter inputs: every call builds a formatter, which prints; Intl's resolved options decide roll or snap", () => {
  const usd = (v: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(v);
  const eur = (v: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EUR",
    }).format(v);

  it("constructions per call: mount 2, same props 1, new value 2, equal inline object 2, new options 2", () => {
    controlFrames();
    const spy = vi.spyOn(Intl, "NumberFormat");
    const counts: [number, number][] = [];
    const step = (
      ui: React.ReactElement,
      rerender: (next: React.ReactElement) => void
    ) => {
      spy.mockClear();
      rerender(ui);
      counts.push([mainCalls(spy), lookupCalls(spy)]);
    };
    const eurFormat = { style: "currency", currency: "EUR" } as const;
    spy.mockClear();
    const { rerender } = render(<Harness format={eurFormat} value={5} />);
    counts.push([mainCalls(spy), lookupCalls(spy)]);
    step(<Harness format={eurFormat} value={5} />, rerender);
    step(<Harness format={eurFormat} value={6} />, rerender);
    step(
      <Harness format={{ currency: "EUR", style: "currency" }} value={7} />,
      rerender
    );
    step(
      <Harness format={{ style: "currency", currency: "USD" }} value={8} />,
      rerender
    );
    expect(counts).toEqual([
      [2, 1],
      [1, 0],
      [2, 0],
      [2, 0],
      [2, 0],
    ]);
  });

  it("constructions per call in StrictMode: 3, 2, 3, 3, 3", () => {
    controlFrames();
    const spy = vi.spyOn(Intl, "NumberFormat");
    const strict = (format: Intl.NumberFormatOptions, value: number) => (
      <React.StrictMode>
        <Harness format={format} value={value} />
      </React.StrictMode>
    );
    const eurFormat = { style: "currency", currency: "EUR" } as const;
    const mains: number[] = [];
    spy.mockClear();
    const { rerender } = render(strict(eurFormat, 5));
    mains.push(mainCalls(spy));
    for (const [format, value] of [
      [eurFormat, 5],
      [eurFormat, 6],
      [{ currency: "EUR", style: "currency" }, 7],
      [{ style: "currency", currency: "USD" }, 8],
    ] as [Intl.NumberFormatOptions, number][]) {
      spy.mockClear();
      rerender(strict(format, value));
      mains.push(mainCalls(spy));
    }
    expect(mains).toEqual([3, 2, 3, 3, 3]);
  });

  it("the same object edited in place prints its new contents and snaps", () => {
    const format: { style: "currency"; currency: string } = {
      style: "currency",
      currency: "USD",
    };
    const { rerender } = render(<Harness format={format} value={5} />);
    expect(srText()).toBe(usd(5));
    format.currency = "EUR";
    rerender(<Harness format={format} value={6} />);
    expect(srText()).toBe(eur(6));
    expect(visualRun().textContent).toBe(eur(6));
    expect(directions().filter(Boolean)).toEqual([]);
  });

  it("returning to an earlier object (A, B, A) reads A again", () => {
    const a: { style: "currency"; currency: string } = {
      style: "currency",
      currency: "EUR",
    };
    const b = { style: "currency", currency: "EUR" } as const;
    const { rerender } = render(<Harness format={a} value={5} />);
    rerender(<Harness format={b} value={6} />);
    expect(directions().filter(Boolean)).toEqual(["up"]);
    a.currency = "USD";
    rerender(<Harness format={a} value={7} />);
    expect(srText()).toBe(usd(7));
    expect(directions().filter(Boolean)).toEqual([]);
  });

  it("returning to an earlier locale list (A, B, A) with an undefined entry throws Intl's TypeError", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const first = ["en-US"] as (string | undefined)[];
    const second = ["en-US"];
    const { rerender } = render(
      <Harness locale={first as string[]} value={5} />
    );
    rerender(<Harness locale={second} value={6} />);
    first.push(undefined);
    const expected = nativeError(first as string[], {});
    let thrown: unknown = null;
    try {
      rerender(<Harness locale={first as string[]} value={7} />);
    } catch (error) {
      thrown = error;
    }
    expect(thrown).toBeInstanceOf(TypeError);
    expect((thrown as Error).message).toBe(expected.message);
  });

  it("equal inline objects in different key orders keep the formatting and roll", () => {
    const { rerender } = render(
      <Harness
        format={{
          style: "currency",
          currency: "EUR",
          minimumFractionDigits: 0,
        }}
        value={5}
      />
    );
    rerender(
      <Harness
        format={{
          minimumFractionDigits: 0,
          currency: "EUR",
          style: "currency",
        }}
        value={6}
      />
    );
    expect(srText()).toBe("€6");
    expect(directions().filter(Boolean)).toEqual(["up"]);
  });

  it("an Intl.Locale whose toString lies prints the locale it holds, and the change snaps", () => {
    const { rerender } = render(<Harness locale="en-US" value={1234.5} />);
    expect(srText()).toBe("1,234.5");
    const de = new Intl.Locale("de-DE");
    de.toString = () => "en-US";
    rerender(<Harness locale={de} value={1234.6} />);
    expect(srText()).toBe("1.234,6");
    expect(directions().filter(Boolean)).toEqual([]);
  });

  it("a render React never commits leaves the kept formatting alone", async () => {
    const previous = (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean })
      .IS_REACT_ACT_ENVIRONMENT;
    (
      globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
    ).IS_REACT_ACT_ENVIRONMENT = false;
    const { createRoot } = await import("react-dom/client");
    const { flushSync } = await import("react-dom");
    const never = new Promise(() => undefined);
    let reachedSuspension: () => void = () => undefined;
    const suspended = new Promise<void>((resolve) => {
      reachedSuspension = resolve;
    });
    function Sibling({ suspend }: { suspend: boolean }) {
      if (suspend) {
        reachedSuspension();
        React.use(never);
      }
      return null;
    }
    let set: React.Dispatch<
      React.SetStateAction<{ locale: string; suspend: boolean; value: number }>
    > = () => undefined;
    function App() {
      const [s, setS] = React.useState({
        locale: "en-US",
        suspend: false,
        value: 5,
      });
      set = setS;
      return (
        <React.Suspense fallback={null}>
          <RollingNumber
            data-locale={s.locale}
            locale={s.locale}
            value={s.value}
          />
          <Sibling suspend={s.suspend} />
        </React.Suspense>
      );
    }
    const host = document.createElement("div");
    document.body.append(host);
    const root = createRoot(host);
    try {
      flushSync(() => root.render(<App />));
      const spy = vi.spyOn(Intl, "NumberFormat");
      React.startTransition(() =>
        set({ locale: "de-DE", suspend: true, value: 5 })
      );
      // The German render has run, up to the suspended sibling, and has
      // not been committed.
      await suspended;
      expect(
        spy.mock.calls.filter(
          (call) => call[0] === "de-DE" && !isLookupCall(call)
        ).length
      ).toBeGreaterThan(0);
      expect((host.querySelector(ROOT) as HTMLElement).dataset.locale).toBe(
        "en-US"
      );
      expect(srText(host)).toBe("5");
      flushSync(() =>
        set((s) => ({ ...s, locale: "en-US", suspend: false, value: 6 }))
      );
      expect(srText(host)).toBe("6");
      expect(directions(host).filter(Boolean)).toEqual(["up"]);
    } finally {
      root.unmount();
      host.remove();
      (
        globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
      ).IS_REACT_ACT_ENVIRONMENT = previous;
    }
  });

  it("mounting with default props does not throw, plain or in StrictMode", () => {
    expect(() => render(<RollingNumber value={1} />)).not.toThrow();
    expect(() =>
      render(
        <React.StrictMode>
          <RollingNumber value={2} />
        </React.StrictMode>
      )
    ).not.toThrow();
  });

  it("a numbering-system change builds one digit lookup and the next change rolls; a currency change builds none", () => {
    controlFrames();
    const spy = vi.spyOn(Intl, "NumberFormat");
    const { rerender } = render(
      <Harness format={{ style: "currency", currency: "USD" }} value={5} />
    );
    spy.mockClear();
    rerender(
      <Harness format={{ style: "currency", currency: "EUR" }} value={6} />
    );
    expect(lookupCalls(spy)).toBe(0);
    spy.mockClear();
    rerender(<Harness locale="ar-EG-u-nu-arab" value={6} />);
    expect(lookupCalls(spy)).toBe(1);
    expect(directions().filter(Boolean)).toEqual([]);
    spy.mockClear();
    rerender(<Harness locale="ar-EG-u-nu-arab" value={7} />);
    expect(lookupCalls(spy)).toBe(0);
    expect(directions().filter(Boolean)).toEqual(["up"]);
    expect(byPlace(0).textContent).toBe("٧");
  });

  it("errors are Intl's own: a throwing getter, NaN digits, an undefined locale entry", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const cases: [Intl.LocalesArgument, Intl.NumberFormatOptions][] = [
      [
        "en-US",
        {
          style: "currency",
          get compactDisplay(): "short" {
            throw new Error("late getter");
          },
        } as Intl.NumberFormatOptions,
      ],
      [
        "en-US",
        Object.defineProperty({}, "currency", {
          get() {
            throw new Error("currency getter");
          },
          enumerable: false,
        }) as Intl.NumberFormatOptions,
      ],
      ["en-US", { maximumFractionDigits: Number.NaN }],
      [["en-US", undefined] as unknown as string[], {}],
    ];
    for (const [locale, format] of cases) {
      const expected = nativeError(locale, format);
      const thrown = renderError({ format, locale, value: 1 });
      expect(thrown).toBeInstanceOf(expected.constructor as typeof Error);
      expect((thrown as Error).message).toBe(expected.message);
    }
  });

  it("the component reads its options only through Intl, and passes the objects it was given", () => {
    controlFrames();
    const log: string[] = [];
    const target = {};
    Object.defineProperty(target, "style", {
      value: "currency",
      enumerable: false,
    });
    Object.defineProperty(target, "currency", {
      get: () => "EUR",
      enumerable: false,
    });
    const options = new Proxy(target, {
      get(object, key, receiver) {
        log.push(String(key));
        return Reflect.get(object, key, receiver);
      },
    }) as Intl.NumberFormatOptions;
    const locales = ["en-US"];
    const probe = new Intl.NumberFormat(locales, options);
    probe.format(0);
    const native = [...log];
    expect(native).toContain("currency");
    for (const strict of [false, true]) {
      const spy = vi.spyOn(Intl, "NumberFormat");
      log.length = 0;
      const ui = <Harness format={options} locale={locales} value={5} />;
      const { unmount } = render(
        strict ? <React.StrictMode>{ui}</React.StrictMode> : ui
      );
      const constructions = spy.mock.calls.filter(
        (call) => call[0] === locales && call[1] === options
      ).length;
      expect(constructions).toBe(strict ? 3 : 2);
      expect(log).toEqual(
        Array.from({ length: constructions }, () => native).flat()
      );
      unmount();
      spy.mockRestore();
    }
  });

  it("unrelated properties are not read, a throwing one included", () => {
    const withMeta = Object.defineProperty({}, "meta", {
      get() {
        throw new Error("meta read");
      },
      enumerable: false,
    }) as Intl.NumberFormatOptions;
    const { rerender } = render(<Harness format={{}} value={5} />);
    rerender(<Harness format={withMeta} value={6} />);
    expect(srText()).toBe("6");
    expect(directions().filter(Boolean)).toEqual(["up"]);
  });

  it("the resolved options the suite uses are all primitive values", () => {
    // The check itself: a function or an object is not primitive.
    for (const notPrimitive of [() => 0, {}]) {
      // biome-ignore lint/style/useConsistentBuiltinInstantiation: Object() is the primitive test
      expect(Object(notPrimitive)).toBe(notPrimitive);
    }
    const strip = (roundingPriority: "morePrecision" | "lessPrecision") =>
      ({ roundingPriority, trailingZeroDisplay: "stripIfInteger" }) as const;
    const formats: [Intl.LocalesArgument, Intl.NumberFormatOptions][] = [
      ["en-US", {}],
      ["de-DE", {}],
      ["en-IN", {}],
      ["de-DE", { style: "currency", currency: "EUR" }],
      [
        "de-DE",
        { style: "currency", currency: "EUR", currencySign: "accounting" },
      ],
      ["en-US", { style: "currency", currency: "USD" }],
      ["en-US", { style: "currency", currency: "EUR" }],
      [
        "en-US",
        { style: "currency", currency: "EUR", minimumFractionDigits: 0 },
      ],
      ["en-US", { notation: "compact" }],
      ["en-US", { signDisplay: "negative" }],
      ["en-US", { minimumFractionDigits: 1 }],
      ["en-US", { minimumFractionDigits: 2 }],
      ["en-US", { maximumFractionDigits: 0 }],
      ["en-US", { maximumFractionDigits: 2 }],
      ["ar-EG", { style: "percent" }],
      ["ar-EG", { style: "percent", signDisplay: "always" }],
      ["ar-EG-u-nu-arab", {}],
      ["en-US-u-nu-adlm", {}],
      [new Intl.Locale("de-DE"), {}],
      ["en-US", strip("morePrecision")],
      ["en-US", strip("lessPrecision")],
    ];
    for (const [locale, format] of formats) {
      const resolved = new Intl.NumberFormat(locale, format).resolvedOptions();
      for (const value of Object.values(resolved)) {
        // biome-ignore lint/style/useConsistentBuiltinInstantiation: Object() is the primitive test
        expect(Object(value)).not.toBe(value);
      }
    }
  });

  it("options Intl reports alike but prints differently print as Intl does", () => {
    const strip = (roundingPriority: "morePrecision" | "lessPrecision") =>
      ({ roundingPriority, trailingZeroDisplay: "stripIfInteger" }) as const;
    const native = (p: "morePrecision" | "lessPrecision") =>
      new Intl.NumberFormat("en-US", strip(p)).format(0.000_123);
    // The case only means something where the two print differently.
    expect(native("morePrecision")).not.toBe(native("lessPrecision"));
    const { rerender } = render(
      <Harness format={strip("morePrecision")} value={0.000_123} />
    );
    expect(srText()).toBe(
      new Intl.NumberFormat("en-US", strip("morePrecision")).format(0.000_123)
    );
    rerender(<Harness format={strip("lessPrecision")} value={0.000_123} />);
    expect(srText()).toBe(
      new Intl.NumberFormat("en-US", strip("lessPrecision")).format(0.000_123)
    );
    expect(visualRun().textContent).toBe(srText());
  });
});

describe("equal-text updates and per-face start deadlines", () => {
  it("a new value with the same text clears data-direction and keeps the face", () => {
    const format = { maximumFractionDigits: 0 };
    const { rerender } = render(<Harness format={format} value={1} />);
    rerender(<Harness format={format} value={2} />);
    expect(byPlace(0).dataset.direction).toBe("up");
    rerender(<Harness format={format} value={2} />);
    expect(byPlace(0).dataset.direction).toBe("up");
    rerender(<Harness format={format} value={2.001} />);
    expect(byPlace(0).dataset.direction).toBeUndefined();
    expect(faceAt(0).dataset.prev).toBe("1");
  });

  it("the start class lasts two delivered frames, through a commit per frame", () => {
    const frames = controlFrames();
    const format = { maximumFractionDigits: 0 };
    const { rerender } = render(<Harness format={format} value={1} />);
    rerender(<Harness format={format} value={2} />);
    expect(entering(0)).toBe(true);
    const seen: boolean[] = [];
    for (let i = 1; i <= 20; i++) {
      frames.step();
      seen.push(entering(0));
      rerender(<Harness format={format} value={2 + i / 1000} />);
    }
    expect(seen.slice(0, 3)).toEqual([true, false, false]);
    expect(seen.every((v, i) => (i === 0 ? v : !v))).toBe(true);
    expect(faceAt(0).dataset.prev).toBe("1");
  });

  it("a change in another column neither postpones nor extends a deadline", () => {
    const frames = controlFrames();
    const { rerender } = render(<Harness value={1234} />);
    rerender(<Harness value={1235} />);
    frames.step();
    expect(entering(0)).toBe(true);
    rerender(<Harness value={1245} />);
    expect(entering(1)).toBe(true);
    frames.step();
    expect(entering(0)).toBe(false);
    expect(entering(1)).toBe(true);
    frames.step();
    expect(entering(1)).toBe(false);
    expect(faceAt(0).dataset.prev).toBe("4");
  });

  it("an old face's settlement never clears a newer face in its place", () => {
    const frames = controlFrames();
    const { rerender } = render(<Harness value={5} />);
    rerender(<Harness value={6} />);
    frames.step();
    rerender(<Harness value={7} />);
    expect(entering(0)).toBe(true);
    frames.step();
    expect(faceAt(0).textContent).toBe("7");
    expect(entering(0)).toBe(true);
    frames.step();
    expect(entering(0)).toBe(false);
  });

  it("the start position is motion-safe in both directions", () => {
    controlFrames();
    const tokens = () =>
      (faceAt(0).getAttribute("class") ?? "").split(WHITESPACE);
    const { rerender } = render(<Harness value={5} />);
    rerender(<Harness value={6} />);
    expect(tokens()).toContain("motion-safe:starting:translate-y-full");
    rerender(<Harness value={5} />);
    expect(tokens()).toContain("motion-safe:starting:-translate-y-full");
  });

  it("pending frames are cancelled on unmount", () => {
    controlFrames();
    const { rerender, unmount } = render(<Harness value={5} />);
    rerender(<Harness value={6} />);
    unmount();
    expect(window.cancelAnimationFrame).toHaveBeenCalled();
  });
});
