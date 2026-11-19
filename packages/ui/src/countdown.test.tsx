import vm from "node:vm";
import { act, render, screen } from "@testing-library/react";
import * as React from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  Countdown,
  type CountdownSnapshot,
  type CountdownUnit,
  type UseCountdownOptions,
  useCountdown,
} from "./countdown";

// Time, DOM and ARIA only. jsdom loads no CSS, so layout, copying and motion
// are measured in a real browser: apps/storybook/stories/countdown.stories.tsx.

const T0 = Date.UTC(2026, 10, 19, 12, 0, 0);
const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const hms = (h: number, m: number, s: number) =>
  h * HOUR + m * MINUTE + s * SECOND;

const ROOT = '[data-slot="countdown"]';
const root = (c: ParentNode = document) => c.querySelector(ROOT) as HTMLElement;
const visualRun = (c: ParentNode = document) =>
  root(c).querySelector(':scope > [aria-hidden="true"]') as HTMLElement;
const spoken = (c: ParentNode = document) =>
  (root(c).querySelector(":scope > .sr-only") as HTMLElement).textContent;

/** What is painted: text outside `.sr-only` and `.invisible` subtrees. */
function visibleText(el: Element): string {
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
}

const shown = (c: ParentNode = document) => visibleText(visualRun(c));
const groups = (c: ParentNode = document) =>
  [...root(c).querySelectorAll('[data-slot="countdown-group"]')].map((g) =>
    g.getAttribute("data-unit")
  );
const values = (c: ParentNode = document) =>
  [...root(c).querySelectorAll('[data-slot="countdown-value"]')].map((v) =>
    visibleText(v)
  );
const labels = (c: ParentNode = document) =>
  [...root(c).querySelectorAll('[data-slot="countdown-label"]')].map(
    (l) => l.textContent
  );

/**
 * Moves the clock alone, then delivers the one pending wake. The fake clock
 * keeps that wake's delay relative to the moved time, so it fires a second
 * after `ms` here; returns the time it fired at.
 */
function wakeAt(ms: number) {
  vi.setSystemTime(ms);
  act(() => {
    vi.runOnlyPendingTimers();
  });
  return Date.now();
}

function advance(ms: number) {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(T0);
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// Time rules
// ---------------------------------------------------------------------------

describe("rounding", () => {
  it("rounds the time left up to the smallest unit shown", () => {
    const { rerender } = render(<Countdown target={T0 + 59_400} />);
    expect(shown()).toBe("00:01:00");
    rerender(<Countdown target={T0 + 1} />);
    expect(shown()).toBe("00:00:01");
  });
});

describe("zero", () => {
  it("reads zero, marks complete and calls onComplete in the same act at exactly target", () => {
    const onComplete = vi.fn();
    render(<Countdown onComplete={onComplete} target={T0 + 2 * SECOND} />);
    advance(SECOND);
    expect(shown()).toBe("00:00:01");
    expect(onComplete).not.toHaveBeenCalled();
    advance(SECOND);
    expect(Date.now()).toBe(T0 + 2 * SECOND);
    expect(shown()).toBe("00:00:00");
    expect(root()).toHaveAttribute("data-complete");
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});

describe("late tick", () => {
  it("resamples the clock: a wake five seconds late shows five fewer", () => {
    render(<Countdown target={T0 + MINUTE} />);
    expect(shown()).toBe("00:01:00");
    // A counter decremented per wake would read 00:00:59.
    expect(wakeAt(T0 + 5 * SECOND)).toBe(T0 + 6 * SECOND);
    expect(shown()).toBe("00:00:54");
  });

  it("a wake past target completes once", () => {
    const onComplete = vi.fn();
    render(<Countdown onComplete={onComplete} target={T0 + MINUTE} />);
    wakeAt(T0 + 2 * MINUTE);
    expect(shown()).toBe("00:00:00");
    expect(root()).toHaveAttribute("data-complete");
    advance(10 * SECOND);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});

describe("wake time", () => {
  it("wakes on the boundary of the smallest unit: 5.3 s left changes after 300 ms", () => {
    render(<Countdown target={T0 + 5300} />);
    expect(shown()).toBe("00:00:06");
    advance(299);
    expect(shown()).toBe("00:00:06");
    advance(1);
    expect(shown()).toBe("00:00:05");
    advance(999);
    expect(shown()).toBe("00:00:05");
    advance(1);
    expect(shown()).toBe("00:00:04");
  });

  it("with hours and minutes, the next change is at the minute boundary", () => {
    render(<Countdown target={T0 + 90_500} units={["hours", "minutes"]} />);
    expect(shown()).toBe("00:02");
    advance(30_499);
    expect(shown()).toBe("00:02");
    advance(1);
    expect(shown()).toBe("00:01");
  });
});

describe("folding", () => {
  it("folds unlisted days into hours: 49 h shows 49:00:00", () => {
    render(<Countdown target={T0 + 49 * HOUR} />);
    expect(shown()).toBe("49:00:00");
  });

  it("with days listed, the labelled groups read 02 01 00 00", () => {
    render(
      <Countdown
        target={T0 + 49 * HOUR}
        units={["days", "hours", "minutes", "seconds"]}
        variant="labelled"
      />
    );
    expect(groups()).toEqual(["days", "hours", "minutes", "seconds"]);
    expect(values()).toEqual(["02", "01", "00", "00"]);
  });

  it("the compact form with days reads 2d 04:12:33", () => {
    render(
      <Countdown
        target={T0 + 2 * DAY + hms(4, 12, 33)}
        units={["days", "hours", "minutes", "seconds"]}
      />
    );
    expect(shown()).toBe("2d 04:12:33");
    const separators = [
      ...root().querySelectorAll('[data-slot="countdown-separator"]'),
    ].map((s) => s.textContent);
    expect(separators).toEqual([" ", ":", ":"]);
  });

  it("the compact form shows zero days as 0d, and German days with Intl's narrow unit", () => {
    const { rerender } = render(
      <Countdown
        target={T0 + hms(4, 12, 33)}
        units={["days", "hours", "minutes", "seconds"]}
      />
    );
    expect(shown()).toBe("0d 04:12:33");
    rerender(
      <Countdown
        locale="de-DE"
        target={T0 + 2 * DAY + hms(4, 12, 33)}
        units={["days", "hours", "minutes", "seconds"]}
      />
    );
    const days = new Intl.NumberFormat("de-DE", {
      style: "unit",
      unit: "day",
      unitDisplay: "narrow",
      useGrouping: false,
    }).format(2);
    expect(shown()).toBe(`${days} 04:12:33`);
  });

  it("prints hours past 99 whole and without grouping", () => {
    const { rerender } = render(<Countdown target={T0 + 100 * HOUR} />);
    expect(shown()).toBe("100:00:00");
    rerender(<Countdown target={T0 + 45 * DAY} />);
    expect(shown()).toBe("1080:00:00");
  });
});

describe("units", () => {
  it("renders largest first and ignores duplicates", () => {
    render(
      <Countdown
        target={T0 + hms(1, 2, 3)}
        units={["seconds", "hours", "hours"]}
      />
    );
    expect(groups()).toEqual(["hours", "seconds"]);
    expect(shown()).toBe("01:123");
  });

  it("an empty array, or one with no recognised unit, means the default", () => {
    const { rerender } = render(
      <Countdown target={T0 + 5 * MINUTE} units={[]} />
    );
    expect(groups()).toEqual(["hours", "minutes", "seconds"]);
    rerender(
      <Countdown
        target={T0 + 5 * MINUTE}
        units={["weeks" as unknown as CountdownUnit]}
      />
    );
    expect(groups()).toEqual(["hours", "minutes", "seconds"]);
  });

  it("shows a leading zero group", () => {
    render(<Countdown target={T0 + 5 * MINUTE} />);
    expect(shown()).toBe("00:05:00");
    expect(groups()).toEqual(["hours", "minutes", "seconds"]);
  });
});

// ---------------------------------------------------------------------------
// Completion
// ---------------------------------------------------------------------------

describe("once per run", () => {
  it("a past target fires once inside StrictMode, and resume events after it add nothing", () => {
    const onComplete = vi.fn();
    render(
      <React.StrictMode>
        <Countdown onComplete={onComplete} target={T0 - SECOND} />
      </React.StrictMode>
    );
    expect(onComplete).toHaveBeenCalledTimes(1);
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
      window.dispatchEvent(new Event("pageshow"));
    });
    advance(10 * SECOND);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("a later target is a new run and fires once more", () => {
    const onComplete = vi.fn();
    const { rerender } = render(
      <Countdown onComplete={onComplete} target={T0 + SECOND} />
    );
    advance(SECOND);
    expect(onComplete).toHaveBeenCalledTimes(1);
    rerender(<Countdown onComplete={onComplete} target={T0 + 3 * SECOND} />);
    expect(root()).not.toHaveAttribute("data-complete");
    advance(2 * SECOND);
    expect(onComplete).toHaveBeenCalledTimes(2);
  });

  it("A to B and back to A starts a new run of A; the superseded B stays silent", () => {
    const onComplete = vi.fn();
    const a = T0 + 3 * SECOND;
    const b = T0 + 10 * SECOND;
    const { rerender } = render(
      <Countdown onComplete={onComplete} target={a} />
    );
    advance(3 * SECOND);
    expect(onComplete).toHaveBeenCalledTimes(1);
    rerender(<Countdown onComplete={onComplete} target={b} />);
    rerender(<Countdown onComplete={onComplete} target={a} />);
    expect(onComplete).toHaveBeenCalledTimes(2);
    advance(20 * SECOND);
    expect(onComplete).toHaveBeenCalledTimes(2);
  });

  it("a superseded run never fires", () => {
    const onComplete = vi.fn();
    const { rerender } = render(
      <Countdown onComplete={onComplete} target={T0 + 2 * SECOND} />
    );
    rerender(<Countdown onComplete={onComplete} target={T0 + 10 * SECOND} />);
    advance(5 * SECOND);
    expect(onComplete).not.toHaveBeenCalled();
    advance(5 * SECOND);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});

describe("inline props", () => {
  it("new onComplete, an equal Date and a new now restart nothing, and the latest callback is called", () => {
    const target = T0 + 5 * SECOND;
    const first = vi.fn();
    const { rerender } = render(
      <Countdown
        now={() => Date.now()}
        onComplete={first}
        target={new Date(target)}
      />
    );
    const setSpy = vi.spyOn(globalThis, "setTimeout");
    const clearSpy = vi.spyOn(globalThis, "clearTimeout");
    let latest = first;
    for (let i = 0; i < 10; i++) {
      latest = vi.fn();
      rerender(
        <Countdown
          now={() => Date.now()}
          onComplete={latest}
          target={new Date(target)}
        />
      );
    }
    expect(setSpy).not.toHaveBeenCalled();
    expect(clearSpy).not.toHaveBeenCalled();
    setSpy.mockRestore();
    clearSpy.mockRestore();
    advance(5 * SECOND);
    expect(first).not.toHaveBeenCalled();
    expect(latest).toHaveBeenCalledTimes(1);
  });

  it("a new inline units array with the same units restarts nothing", () => {
    const { rerender } = render(
      <Countdown target={T0 + MINUTE} units={["minutes", "seconds"]} />
    );
    const setSpy = vi.spyOn(globalThis, "setTimeout");
    const clearSpy = vi.spyOn(globalThis, "clearTimeout");
    for (let i = 0; i < 10; i++) {
      rerender(
        <Countdown target={T0 + MINUTE} units={["seconds", "minutes"]} />
      );
    }
    expect(setSpy).not.toHaveBeenCalled();
    expect(clearSpy).not.toHaveBeenCalled();
    expect(shown()).toBe("01:00");
  });
});

// ---------------------------------------------------------------------------
// Pending
// ---------------------------------------------------------------------------

describe("pending target", () => {
  it("null shows -- in every cell, starts no timer, never completes; a future target then runs", () => {
    const onComplete = vi.fn();
    const { rerender } = render(
      <Countdown onComplete={onComplete} target={null} />
    );
    expect(values()).toEqual(["--", "--", "--"]);
    expect(root()).toHaveAttribute("data-pending");
    expect(root()).not.toHaveAttribute("data-complete");
    expect(vi.getTimerCount()).toBe(0);
    advance(HOUR);
    expect(onComplete).not.toHaveBeenCalled();
    rerender(
      <Countdown onComplete={onComplete} target={Date.now() + 3 * SECOND} />
    );
    expect(root()).not.toHaveAttribute("data-pending");
    expect(shown()).toBe("00:00:03");
  });

  it("undefined is pending too", () => {
    render(<Countdown target={undefined} />);
    expect(root()).toHaveAttribute("data-pending");
    expect(vi.getTimerCount()).toBe(0);
  });

  it("an invalid Date and NaN behave like null, and warn in development", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const onComplete = vi.fn();
    const { rerender } = render(
      <Countdown onComplete={onComplete} target={new Date(Number.NaN)} />
    );
    expect(values()).toEqual(["--", "--", "--"]);
    expect(root()).toHaveAttribute("data-pending");
    expect(vi.getTimerCount()).toBe(0);
    rerender(<Countdown onComplete={onComplete} target={Number.NaN} />);
    expect(values()).toEqual(["--", "--", "--"]);
    rerender(
      <Countdown onComplete={onComplete} target={Number.POSITIVE_INFINITY} />
    );
    expect(values()).toEqual(["--", "--", "--"]);
    expect(vi.getTimerCount()).toBe(0);
    advance(HOUR);
    expect(onComplete).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalled();
    expect(String(warn.mock.calls[0]?.[0])).toContain("Countdown");
  });

  it("reserves each pending cell's width with an invisible 00", () => {
    render(<Countdown target={null} />);
    for (const cell of root().querySelectorAll(
      '[data-slot="countdown-value"]'
    )) {
      const reserve = cell.querySelector(".invisible") as HTMLElement;
      expect(reserve.textContent).toBe("00");
      // Hidden from assistive technology with the rest of the visual run.
      expect(reserve.closest('[aria-hidden="true"]')).toBe(visualRun());
    }
  });
});

describe("non-finite clock", () => {
  it("goes pending and retries after 1000 ms; a valid clock then runs", () => {
    let broken = true;
    const now = () => (broken ? Number.NaN : Date.now());
    render(<Countdown now={now} target={T0 + MINUTE} />);
    expect(root()).toHaveAttribute("data-pending");
    expect(values()).toEqual(["--", "--", "--"]);
    expect(vi.getTimerCount()).toBe(1);
    broken = false;
    advance(999);
    expect(root()).toHaveAttribute("data-pending");
    advance(1);
    expect(root()).not.toHaveAttribute("data-pending");
    expect(shown()).toBe("00:00:59");
  });
});

describe("resume", () => {
  it("visibilitychange to visible resamples with no timer run", () => {
    render(<Countdown target={T0 + MINUTE} />);
    vi.setSystemTime(T0 + 20 * SECOND);
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(document.visibilityState).toBe("visible");
    expect(shown()).toBe("00:00:40");
  });

  it("pageshow resamples with no timer run", () => {
    render(<Countdown target={T0 + MINUTE} />);
    vi.setSystemTime(T0 + 30 * SECOND);
    act(() => {
      window.dispatchEvent(new Event("pageshow"));
    });
    expect(shown()).toBe("00:00:30");
  });
});

describe("clock changes", () => {
  it("stays complete when the clock moves back after zero, through resume events and a units change", () => {
    const onComplete = vi.fn();
    const { rerender } = render(
      <Countdown onComplete={onComplete} target={T0 + SECOND} />
    );
    advance(SECOND);
    expect(onComplete).toHaveBeenCalledTimes(1);
    vi.setSystemTime(T0 - HOUR);
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
      window.dispatchEvent(new Event("pageshow"));
      vi.runOnlyPendingTimers();
    });
    rerender(
      <Countdown
        onComplete={onComplete}
        target={T0 + SECOND}
        units={["minutes", "seconds"]}
      />
    );
    advance(MINUTE);
    expect(shown()).toBe("00:00");
    expect(root()).toHaveAttribute("data-complete");
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("a backward change before zero lengthens it", () => {
    render(<Countdown target={T0 + 10 * SECOND} />);
    expect(shown()).toBe("00:00:10");
    expect(wakeAt(T0 - MINUTE)).toBe(T0 - 59 * SECOND);
    expect(shown()).toBe("00:01:09");
    expect(root()).not.toHaveAttribute("data-complete");
  });
});

// ---------------------------------------------------------------------------
// Server rendering and the store
// ---------------------------------------------------------------------------

describe("server render", () => {
  it("renders the placeholder without reading the clock, and hydrates without a mismatch", async () => {
    const now = vi.fn(() => Date.now());
    const ui = (
      <Countdown now={now} target={T0 + hms(1, 36, 53)} variant="labelled" />
    );
    const html = renderToString(ui);
    expect(html).toContain("--");
    expect(html).toContain("data-pending");
    expect(now).toHaveBeenCalledTimes(0);

    vi.setSystemTime(T0 + 10 * SECOND);
    const errorSpy = vi.spyOn(console, "error");
    const recoverable = vi.fn();
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
      expect(root(host)).not.toHaveAttribute("data-pending");
      expect(values(host)).toEqual(["01", "36", "43"]);
    } finally {
      act(() => hydrated?.unmount());
      host.remove();
    }
  });

  it("a Countdown first mounted on the client shows its value on its first render", () => {
    const seen: CountdownSnapshot[] = [];
    function Probe(props: UseCountdownOptions) {
      seen.push(useCountdown(props));
      return null;
    }
    render(<Probe target={T0 + 5 * SECOND} />);
    expect(seen[0]?.isPending).toBe(false);
    expect(seen[0]?.seconds).toBe(5);
  });
});

describe("snapshot cache", () => {
  it("rerendering the parent reads no clock and returns the same snapshot", () => {
    const now = vi.fn(() => Date.now());
    const seen: CountdownSnapshot[] = [];
    function Probe({ tick }: { tick: number }) {
      seen.push(
        useCountdown({
          now,
          target: T0 + MINUTE,
          units: ["minutes", "seconds"],
        })
      );
      return <span>{tick}</span>;
    }
    const { rerender } = render(<Probe tick={0} />);
    const calls = now.mock.calls.length;
    const snapshot = seen.at(-1);
    for (let i = 1; i <= 10; i++) {
      rerender(<Probe tick={i} />);
    }
    expect(now.mock.calls.length).toBe(calls);
    for (const s of seen.slice(-10)) {
      expect(s).toBe(snapshot);
    }
  });

  it("a wake with the same value keeps the snapshot object", () => {
    const seen: CountdownSnapshot[] = [];
    function Probe() {
      seen.push(useCountdown({ target: T0 + 5 * SECOND }));
      return null;
    }
    render(<Probe />);
    const before = seen.at(-1);
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(seen.at(-1)).toBe(before);
  });
});

describe("useCountdown", () => {
  it("returns the folded parts and totalSeconds rounded to the smallest listed unit", () => {
    const seen: CountdownSnapshot[] = [];
    function Probe(props: UseCountdownOptions) {
      seen.push(useCountdown(props));
      return null;
    }
    render(
      <Probe
        target={T0 + 49 * HOUR + 30 * SECOND}
        units={["hours", "minutes"]}
      />
    );
    expect(seen.at(-1)).toEqual({
      isPending: false,
      isComplete: false,
      days: 0,
      hours: 49,
      minutes: 1,
      seconds: 0,
      totalSeconds: 49 * 3600 + 60,
    });
  });

  it("is pending with null parts for a nullish target", () => {
    const seen: CountdownSnapshot[] = [];
    function Probe(props: UseCountdownOptions) {
      seen.push(useCountdown(props));
      return null;
    }
    render(<Probe target={null} />);
    expect(seen.at(-1)).toEqual({
      isPending: true,
      isComplete: false,
      days: null,
      hours: null,
      minutes: null,
      seconds: null,
      totalSeconds: null,
    });
  });

  it("is complete with zeros at target", () => {
    const seen: CountdownSnapshot[] = [];
    function Probe(props: UseCountdownOptions) {
      seen.push(useCountdown(props));
      return null;
    }
    render(<Probe target={T0} />);
    expect(seen.at(-1)).toMatchObject({
      isComplete: true,
      totalSeconds: 0,
      seconds: 0,
    });
  });
});

describe("teardown", () => {
  it("unmount clears the timer and both listeners", () => {
    const docRemove = vi.spyOn(document, "removeEventListener");
    const winRemove = vi.spyOn(window, "removeEventListener");
    const { unmount } = render(<Countdown target={T0 + MINUTE} />);
    expect(vi.getTimerCount()).toBe(1);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
    expect(docRemove.mock.calls.map((c) => c[0])).toContain("visibilitychange");
    expect(winRemove.mock.calls.map((c) => c[0])).toContain("pageshow");
  });

  it("a new mount is a new run: an already-past target fires again", () => {
    const onComplete = vi.fn();
    const { unmount } = render(
      <Countdown onComplete={onComplete} target={T0 - SECOND} />
    );
    expect(onComplete).toHaveBeenCalledTimes(1);
    unmount();
    render(<Countdown onComplete={onComplete} target={T0 - SECOND} />);
    expect(onComplete).toHaveBeenCalledTimes(2);
  });
});

// ---------------------------------------------------------------------------
// ARIA, spoken text, labels, locale, animated
// ---------------------------------------------------------------------------

describe("ARIA", () => {
  it("is a timer named Time remaining, not focusable, with the visual run hidden", () => {
    render(<Countdown target={T0 + MINUTE} />);
    const timer = screen.getByRole("timer", { name: "Time remaining" });
    expect(timer).toBe(root());
    expect(timer).not.toHaveAttribute("tabindex");
    expect(timer).not.toHaveAttribute("aria-live");
    expect(visualRun()).toHaveAttribute("aria-hidden", "true");
    expect(visualRun()).toHaveAttribute("dir", "ltr");
  });

  it("with aria-labelledby, sets no aria-label", () => {
    render(
      <>
        <span id="cd-name">Offer ends</span>
        <Countdown aria-labelledby="cd-name" target={T0 + MINUTE} />
      </>
    );
    expect(root()).not.toHaveAttribute("aria-label");
    expect(screen.getByRole("timer", { name: "Offer ends" })).toBe(root());
  });

  it("a passed aria-label replaces the default", () => {
    render(<Countdown aria-label="Betting closes in" target={T0 + MINUTE} />);
    expect(screen.getByRole("timer", { name: "Betting closes in" })).toBe(
      root()
    );
  });

  it("hides the child RollingNumbers when animated", () => {
    render(<Countdown animated target={T0 + MINUTE} />);
    const rolling = root().querySelectorAll('[data-slot="rolling-number"]');
    expect(rolling.length).toBe(3);
    for (const r of rolling) {
      expect(visualRun().contains(r)).toBe(true);
    }
  });

  it("labels take the page direction with dir=auto", () => {
    render(<Countdown target={T0 + MINUTE} variant="labelled" />);
    for (const l of root().querySelectorAll('[data-slot="countdown-label"]')) {
      expect(l).toHaveAttribute("dir", "auto");
    }
  });
});

describe("spoken text", () => {
  it("leaves seconds out while a larger unit is non-zero", () => {
    render(<Countdown target={T0 + hms(1, 36, 53)} />);
    expect(spoken()).toBe("1 hour, 36 minutes");
  });

  it("reads seconds in the last minute, and 0 seconds at zero", () => {
    const { rerender } = render(<Countdown target={T0 + 42 * SECOND} />);
    expect(spoken()).toBe("42 seconds");
    rerender(<Countdown target={T0} />);
    expect(spoken()).toBe("0 seconds");
  });

  it("reads the smallest listed unit at zero", () => {
    render(<Countdown target={T0} units={["hours", "minutes"]} />);
    expect(spoken()).toBe("0 minutes");
  });

  it("follows locale, never labels", () => {
    const { rerender } = render(
      <Countdown locale="de-DE" target={T0 + hms(1, 36, 53)} />
    );
    expect(spoken()).toBe("1 Stunde, 36 Minuten");
    rerender(
      <Countdown
        labels={{ hours: "HRS" }}
        target={T0 + hms(1, 36, 53)}
        variant="labelled"
      />
    );
    expect(spoken()).toBe("1 hour, 36 minutes");
  });

  it("is empty while pending", () => {
    render(<Countdown target={null} />);
    expect(spoken()).toBe("");
  });

  it("is not selectable", () => {
    render(<Countdown target={T0 + MINUTE} />);
    expect(root().querySelector(":scope > .sr-only")).toHaveClass(
      "select-none"
    );
  });
});

describe("labels", () => {
  it("defaults to English and a partial record changes only its units", () => {
    const { rerender } = render(
      <Countdown
        target={T0 + MINUTE}
        units={["days", "hours", "minutes", "seconds"]}
        variant="labelled"
      />
    );
    expect(labels()).toEqual(["Days", "Hours", "Minutes", "Seconds"]);
    rerender(
      <Countdown
        labels={{ hours: "Std." }}
        target={T0 + MINUTE}
        units={["days", "hours", "minutes", "seconds"]}
        variant="labelled"
      />
    );
    expect(labels()).toEqual(["Days", "Std.", "Minutes", "Seconds"]);
  });

  it("the compact form renders no labels", () => {
    render(<Countdown target={T0 + MINUTE} />);
    expect(labels()).toEqual([]);
  });
});

describe("locale", () => {
  const arab = (s: string) =>
    s.replace(/\d/g, (d) => String.fromCodePoint(0x06_60 + Number(d)));

  it("ar-EG prints Arabic-Indic digits, static and animated", () => {
    const { rerender } = render(
      <Countdown
        locale="ar-EG"
        target={T0 + hms(1, 36, 53)}
        variant="labelled"
      />
    );
    expect(values()).toEqual(["01", "36", "53"].map(arab));
    rerender(
      <Countdown
        animated
        locale="ar-EG"
        target={T0 + hms(1, 36, 53)}
        variant="labelled"
      />
    );
    expect(values()).toEqual(["01", "36", "53"].map(arab));
  });

  it("constructs every number formatter with en-US when no locale is passed", () => {
    const spy = vi.spyOn(Intl, "NumberFormat");
    render(<Countdown animated target={T0 + hms(1, 36, 53)} />);
    render(<Countdown target={T0 + hms(1, 36, 53)} />);
    expect(spy).toHaveBeenCalled();
    for (const call of spy.mock.calls) {
      expect(call[0]).toBe("en-US");
    }
  });
});

describe("animated", () => {
  it("renders a RollingNumber in each value, and none when false", () => {
    const { rerender } = render(<Countdown animated target={T0 + MINUTE} />);
    for (const cell of root().querySelectorAll(
      '[data-slot="countdown-value"]'
    )) {
      expect(cell.querySelector('[data-slot="rolling-number"]')).not.toBeNull();
    }
    rerender(<Countdown animated={false} target={T0 + MINUTE} />);
    expect(root().querySelector('[data-slot="rolling-number"]')).toBeNull();
  });

  it("rolls down even when a value rises", () => {
    render(<Countdown animated target={T0 + 10 * SECOND} />);
    expect(wakeAt(T0 - MINUTE)).toBe(T0 - 59 * SECOND);
    expect(shown()).toBe("00:01:09");
    const rolled = [...root().querySelectorAll("[data-direction]")].map((d) =>
      d.getAttribute("data-direction")
    );
    expect(rolled.length).toBeGreaterThan(0);
    expect(new Set(rolled)).toEqual(new Set(["down"]));
  });

  it("the compact days cell is a RollingNumber with Intl's narrow day unit", () => {
    render(
      <Countdown
        animated
        target={T0 + 2 * DAY + hms(4, 12, 33)}
        units={["days", "hours", "minutes", "seconds"]}
      />
    );
    expect(shown()).toBe("2d 04:12:33");
    const days = root().querySelector(
      '[data-unit="days"] [data-slot="rolling-number"]'
    );
    expect(days?.querySelector('[data-type="unit"]')?.textContent).toBe("d");
  });

  it("shows -- while pending, not a RollingNumber", () => {
    render(<Countdown animated target={null} />);
    expect(values()).toEqual(["--", "--", "--"]);
    expect(root().querySelector('[data-slot="rolling-number"]')).toBeNull();
  });
});

describe("root", () => {
  it("carries variant, size, className and other props", () => {
    const ref = React.createRef<HTMLSpanElement>();
    render(
      <Countdown
        className="custom"
        data-testid="cd"
        id="cd"
        ref={ref}
        size="lg"
        target={T0 + MINUTE}
        variant="labelled"
      />
    );
    expect(root()).toHaveAttribute("data-variant", "labelled");
    expect(root()).toHaveAttribute("data-size", "lg");
    expect(root()).toHaveClass("custom");
    expect(root()).toHaveAttribute("id", "cd");
    expect(ref.current).toBe(root());
  });

  it("renders only spans, so it can sit inside a paragraph", () => {
    for (const variant of ["compact", "labelled"] as const) {
      const { unmount } = render(
        <Countdown
          animated
          target={T0 + MINUTE}
          units={["days", "hours", "minutes", "seconds"]}
          variant={variant}
        />
      );
      const tags = new Set(
        [root(), ...root().querySelectorAll("*")].map((el) => el.tagName)
      );
      expect([...tags]).toEqual(["SPAN"]);
      unmount();
    }
  });

  it("defaults to compact and default size", () => {
    render(<Countdown target={T0 + MINUTE} />);
    expect(root()).toHaveAttribute("data-variant", "compact");
    expect(root()).toHaveAttribute("data-size", "default");
  });
});

// ---------------------------------------------------------------------------
// Runs: start, end and the clock
// ---------------------------------------------------------------------------

/** Dispatches `pageshow` from its own layout effect, after its child's. */
function WakeOnCommit(props: React.ComponentProps<typeof Countdown>) {
  // biome-ignore lint/correctness/useExhaustiveDependencies: fires on each new target, by design
  React.useLayoutEffect(() => {
    window.dispatchEvent(new Event("pageshow"));
  }, [props.target]);
  return <Countdown {...props} />;
}

describe("a run ends at commit", () => {
  it("a wake in the commit that replaces A with B neither completes A nor calls B early", () => {
    const onA = vi.fn();
    const onB = vi.fn();
    const { rerender } = render(
      <WakeOnCommit onComplete={onA} target={T0 + SECOND} />
    );
    // A's deadline passes with no timer run; B commits in the same moment.
    vi.setSystemTime(T0 + SECOND);
    rerender(<WakeOnCommit onComplete={onB} target={T0 + 10 * SECOND} />);
    expect(onA).not.toHaveBeenCalled();
    expect(onB).not.toHaveBeenCalled();
    expect(shown()).toBe("00:00:09");
    advance(9 * SECOND - 1);
    expect(onB).not.toHaveBeenCalled();
    advance(1);
    expect(onA).not.toHaveBeenCalled();
    expect(onB).toHaveBeenCalledTimes(1);
  });

  for (const [name, unknown] of [
    ["null", null],
    ["an invalid Date", new Date(Number.NaN)],
  ] as const) {
    it(`A then ${name} then A is a fresh run, in StrictMode`, () => {
      vi.spyOn(console, "warn").mockImplementation(() => undefined);
      const onComplete = vi.fn();
      const ui = (target: Date | number | null) => (
        <React.StrictMode>
          <Countdown onComplete={onComplete} target={target} />
        </React.StrictMode>
      );
      const { rerender } = render(ui(T0));
      expect(onComplete).toHaveBeenCalledTimes(1);
      rerender(ui(unknown));
      expect(root()).toHaveAttribute("data-pending");
      expect(vi.getTimerCount()).toBe(0);
      rerender(ui(T0));
      expect(root()).toHaveAttribute("data-complete");
      expect(onComplete).toHaveBeenCalledTimes(2);
    });

    it(`A then ${name} then A runs again after the clock moved back during the gap`, () => {
      vi.spyOn(console, "warn").mockImplementation(() => undefined);
      const onComplete = vi.fn();
      const ui = (target: Date | number | null) => (
        <React.StrictMode>
          <Countdown onComplete={onComplete} target={target} />
        </React.StrictMode>
      );
      const { rerender } = render(ui(T0 + SECOND));
      advance(SECOND);
      expect(onComplete).toHaveBeenCalledTimes(1);
      rerender(ui(unknown));
      vi.setSystemTime(T0 - HOUR);
      rerender(ui(T0 + SECOND));
      expect(root()).not.toHaveAttribute("data-complete");
      expect(shown()).toBe("01:00:01");
      expect(onComplete).toHaveBeenCalledTimes(1);
      advance(HOUR + SECOND);
      expect(onComplete).toHaveBeenCalledTimes(2);
    });
  }
});

describe("a speculative render", () => {
  it("leaves the committed snapshot and its clock reads alone", async () => {
    let t = 0;
    const now = vi.fn(() => t);
    const onComplete = vi.fn();
    const never = new Promise<never>(() => undefined);
    const seen: CountdownSnapshot[] = [];
    function Probe({ suspend, target }: { suspend?: boolean; target: number }) {
      seen.push(useCountdown({ now, onComplete, target }));
      if (suspend) {
        React.use(never);
      }
      return null;
    }
    const ui = (target: number, suspend?: boolean) => (
      <React.Suspense fallback={null}>
        <Probe suspend={suspend} target={target} />
      </React.Suspense>
    );
    const { rerender } = render(ui(10_000));
    const committed = seen.at(-1);
    expect(committed?.seconds).toBe(10);
    await act(async () => {
      React.startTransition(() => {
        rerender(ui(20_000, true));
      });
    });
    const reads = now.mock.calls.length;
    t = 11_000;
    rerender(ui(10_000));
    expect(seen.at(-1)).toBe(committed);
    expect(now.mock.calls.length).toBe(reads);
    expect(onComplete).not.toHaveBeenCalled();
    // The next real wake delivers zero and the completion together.
    advance(10_000);
    expect(seen.at(-1)).toMatchObject({ isComplete: true, seconds: 0 });
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});

describe("a non-finite clock", () => {
  it("gets only its 1000 ms retry: resume events change nothing, on mount and after running", () => {
    let broken = true;
    const now = vi.fn(() => (broken ? Number.NaN : Date.now()));
    const resume = () =>
      act(() => {
        document.dispatchEvent(new Event("visibilitychange"));
        window.dispatchEvent(new Event("pageshow"));
      });

    render(<Countdown now={now} target={T0 + MINUTE} />);
    expect(root()).toHaveAttribute("data-pending");
    broken = false;
    advance(999);
    let reads = now.mock.calls.length;
    resume();
    expect(now.mock.calls.length).toBe(reads);
    expect(root()).toHaveAttribute("data-pending");
    advance(1);
    expect(root()).not.toHaveAttribute("data-pending");

    // Running, then the clock fails at a wake.
    broken = true;
    advance(SECOND);
    expect(root()).toHaveAttribute("data-pending");
    broken = false;
    advance(999);
    reads = now.mock.calls.length;
    resume();
    expect(now.mock.calls.length).toBe(reads);
    expect(root()).toHaveAttribute("data-pending");
    advance(1);
    expect(root()).not.toHaveAttribute("data-pending");

    // Recovered: each resume event works again, with one clock read each.
    vi.setSystemTime(T0 + 13 * SECOND);
    reads = now.mock.calls.length;
    act(() => {
      window.dispatchEvent(new Event("pageshow"));
    });
    expect(shown()).toBe("00:00:47");
    expect(now.mock.calls.length).toBe(reads + 1);
    vi.setSystemTime(T0 + 23 * SECOND);
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(shown()).toBe("00:00:37");
    expect(now.mock.calls.length).toBe(reads + 2);
  });

  it("a completed run reads no clock again, a units change included", () => {
    const now = vi.fn(() => Date.now());
    const { rerender } = render(<Countdown now={now} target={T0} />);
    expect(root()).toHaveAttribute("data-complete");
    const reads = now.mock.calls.length;
    rerender(
      <Countdown now={now} target={T0} units={["minutes", "seconds"]} />
    );
    expect(shown()).toBe("00:00");
    expect(now.mock.calls.length).toBe(reads);
  });
});

describe("snapshots are immutable", () => {
  it("pending and live snapshots are frozen, and a write changes nothing for another instance", () => {
    const seen: Record<string, CountdownSnapshot> = {};
    function Probe({ id, target }: { id: string; target: number | null }) {
      seen[id] = useCountdown({ target });
      return null;
    }
    render(
      <>
        <Probe id="pending-a" target={null} />
        <Probe id="pending-b" target={null} />
        <Probe id="live-a" target={T0 + MINUTE} />
        <Probe id="live-b" target={T0 + MINUTE} />
      </>
    );
    for (const snapshot of Object.values(seen)) {
      expect(Object.isFrozen(snapshot)).toBe(true);
    }
    expect(Reflect.set(seen["pending-a"] as object, "seconds", 5)).toBe(false);
    expect(Reflect.set(seen["live-a"] as object, "seconds", 5)).toBe(false);
    expect(seen["pending-b"]?.seconds).toBeNull();
    expect(seen["live-b"]?.seconds).toBe(0);
    expect(seen["live-b"]?.minutes).toBe(1);
  });
});

describe("target values", () => {
  it("a Date from another realm is a valid target, and its epoch number is the same target", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const foreign = vm.runInNewContext("new Date(ms)", {
      ms: T0 + MINUTE,
    }) as Date;
    expect(foreign instanceof Date).toBe(false);
    const { rerender } = render(<Countdown target={foreign} />);
    expect(root()).not.toHaveAttribute("data-pending");
    expect(shown()).toBe("00:01:00");
    const setSpy = vi.spyOn(globalThis, "setTimeout");
    const clearSpy = vi.spyOn(globalThis, "clearTimeout");
    rerender(<Countdown target={T0 + MINUTE} />);
    rerender(<Countdown target={foreign} />);
    expect(setSpy).not.toHaveBeenCalled();
    expect(clearSpy).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
  });

  it("0 and -0 are the same target", () => {
    vi.setSystemTime(-5 * SECOND);
    const { rerender } = render(<Countdown target={0} />);
    expect(shown()).toBe("00:00:05");
    const setSpy = vi.spyOn(globalThis, "setTimeout");
    const clearSpy = vi.spyOn(globalThis, "clearTimeout");
    rerender(<Countdown target={-0} />);
    expect(setSpy).not.toHaveBeenCalled();
    expect(clearSpy).not.toHaveBeenCalled();
  });

  it("a number beyond the range of a Date is unknown and warns; the range's end is valid", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const { rerender } = render(<Countdown target={2 ** 65} />);
    expect(root()).toHaveAttribute("data-pending");
    expect(vi.getTimerCount()).toBe(0);
    expect(warn).toHaveBeenCalledTimes(1);
    rerender(<Countdown target={-(8.64e15 + 1)} />);
    expect(root()).toHaveAttribute("data-pending");
    rerender(<Countdown target={8.64e15} />);
    expect(root()).not.toHaveAttribute("data-pending");
  });
});

describe("accessible name", () => {
  it("defaults only when aria-labelledby is absent, an empty one included", () => {
    const { rerender } = render(<Countdown target={T0 + MINUTE} />);
    expect(root()).toHaveAttribute("aria-label", "Time remaining");
    rerender(
      // biome-ignore lint/a11y/useValidAriaValues: an empty id list is the case under test
      <Countdown aria-labelledby="" target={T0 + MINUTE} />
    );
    expect(root()).not.toHaveAttribute("aria-label");
    rerender(
      <>
        <span id="cd-name2">Closes in</span>
        <Countdown aria-labelledby="cd-name2" target={T0 + MINUTE} />
      </>
    );
    expect(root()).not.toHaveAttribute("aria-label");
    rerender(<Countdown aria-label="Kick-off in" target={T0 + MINUTE} />);
    expect(root()).toHaveAttribute("aria-label", "Kick-off in");
  });
});

// ---------------------------------------------------------------------------
// Scheduling, listeners and identity, measured directly
// ---------------------------------------------------------------------------

describe("scheduling", () => {
  const delays = (spy: ReturnType<typeof vi.spyOn>) =>
    spy.mock.calls.map((c) => c[1]);

  it("schedules the next wake at the boundary, 300 ms and 30,500 ms, with no clock read in between", () => {
    const now = vi.fn(() => Date.now());
    const setSpy = vi.spyOn(globalThis, "setTimeout");
    const { unmount } = render(<Countdown now={now} target={T0 + 5300} />);
    expect(delays(setSpy)).toEqual([300]);
    const reads = now.mock.calls.length;
    advance(299);
    expect(now.mock.calls.length).toBe(reads);
    unmount();
    setSpy.mockClear();
    render(
      <Countdown
        now={now}
        target={Date.now() + 90_500}
        units={["hours", "minutes"]}
      />
    );
    expect(delays(setSpy)).toEqual([30_500]);
    const before = now.mock.calls.length;
    advance(30_499);
    expect(now.mock.calls.length).toBe(before);
    advance(1);
    expect(now.mock.calls.length).toBe(before + 1);
    expect(shown()).toBe("00:01");
  });

  it("a new now function is first read at the next scheduled wake", () => {
    const { rerender } = render(<Countdown target={T0 + MINUTE} />);
    rerender(
      <Countdown now={() => Date.now() + 10 * SECOND} target={T0 + MINUTE} />
    );
    expect(shown()).toBe("00:01:00");
    advance(SECOND);
    expect(shown()).toBe("00:00:49");
  });

  it("a hidden visibilitychange reads no clock", () => {
    const now = vi.fn(() => Date.now());
    render(<Countdown now={now} target={T0 + MINUTE} />);
    const state = vi
      .spyOn(document, "visibilityState", "get")
      .mockReturnValue("hidden");
    vi.setSystemTime(T0 + 20 * SECOND);
    const reads = now.mock.calls.length;
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(now.mock.calls.length).toBe(reads);
    expect(shown()).toBe("00:01:00");
    state.mockRestore();
  });

  it("removes exactly the listeners it added, and after unmount nothing reads the clock or calls back", () => {
    const docAdd = vi.spyOn(document, "addEventListener");
    const docRemove = vi.spyOn(document, "removeEventListener");
    const winAdd = vi.spyOn(window, "addEventListener");
    const winRemove = vi.spyOn(window, "removeEventListener");
    const now = vi.fn(() => Date.now());
    const onComplete = vi.fn();
    const { unmount } = render(
      <Countdown now={now} onComplete={onComplete} target={T0 + SECOND} />
    );
    const handler = (
      spy: ReturnType<typeof vi.spyOn>,
      type: string
    ): unknown[] =>
      spy.mock.calls.filter((c) => c[0] === type).map((c) => c[1]);
    unmount();
    expect(handler(docAdd, "visibilitychange").length).toBeGreaterThan(0);
    expect(handler(docRemove, "visibilitychange")).toEqual(
      handler(docAdd, "visibilitychange")
    );
    expect(handler(winRemove, "pageshow")).toEqual(handler(winAdd, "pageshow"));
    const reads = now.mock.calls.length;
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
      window.dispatchEvent(new Event("pageshow"));
    });
    advance(HOUR);
    expect(now.mock.calls.length).toBe(reads);
    expect(onComplete).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("an equal wake keeps the snapshot object across a later bare parent render", () => {
    const seen: CountdownSnapshot[] = [];
    function Probe({ tick }: { tick: number }) {
      seen.push(useCountdown({ target: T0 + 5 * SECOND }));
      return <span>{tick}</span>;
    }
    const { rerender } = render(<Probe tick={0} />);
    const before = seen.at(-1);
    act(() => {
      window.dispatchEvent(new Event("pageshow"));
    });
    rerender(<Probe tick={1} />);
    expect(seen.at(-1)).toBe(before);
  });

  it("each value cell keeps its 2ch floor", () => {
    render(<Countdown target={T0 + MINUTE} variant="labelled" />);
    for (const cell of root().querySelectorAll(
      '[data-slot="countdown-value"]'
    )) {
      expect(cell).toHaveClass("min-w-[2ch]");
    }
  });
});

// ---------------------------------------------------------------------------
// Completion is called after the commit
// ---------------------------------------------------------------------------

describe("completion is called after the commit", () => {
  it("a target already past at mount calls back after the parent's layout effect, with a later sibling's ref attached", () => {
    const log: string[] = [];
    function Offer() {
      const ref = React.useRef<HTMLButtonElement>(null);
      React.useLayoutEffect(() => {
        log.push("parent layout effect");
      }, []);
      return (
        <>
          <Countdown
            onComplete={() =>
              log.push(`onComplete: ref ${ref.current ? "attached" : "null"}`)
            }
            target={T0 - SECOND}
          />
          <button ref={ref} type="button">
            Refresh
          </button>
        </>
      );
    }
    render(<Offer />);
    expect(log).toEqual(["parent layout effect", "onComplete: ref attached"]);
  });

  it("a change to a past target calls back after the parent's layout effect, with a new later element's ref attached", () => {
    const log: string[] = [];
    function Offer({ target, more }: { target: number; more: boolean }) {
      const ref = React.useRef<HTMLButtonElement>(null);
      // biome-ignore lint/correctness/useExhaustiveDependencies: fires once per target, by design
      React.useLayoutEffect(() => {
        log.push("parent layout effect");
      }, [target]);
      return (
        <>
          <Countdown
            onComplete={() =>
              log.push(`onComplete: ref ${ref.current ? "attached" : "null"}`)
            }
            target={target}
          />
          {more ? (
            <button ref={ref} type="button">
              Refresh
            </button>
          ) : null}
        </>
      );
    }
    const { rerender } = render(<Offer more={false} target={T0 + MINUTE} />);
    log.length = 0;
    rerender(<Offer more target={T0 - SECOND} />);
    expect(log).toEqual(["parent layout effect", "onComplete: ref attached"]);
  });

  it("under StrictMode a clock that becomes finite in the parent's layout effect recovers at once and calls back once", () => {
    let ready = false;
    const log: string[] = [];
    function Parent() {
      React.useLayoutEffect(() => {
        ready = true;
        log.push("parent layout effect");
      }, []);
      return (
        <Countdown
          now={() => (ready ? Date.now() : Number.NaN)}
          onComplete={() => log.push("onComplete")}
          target={T0}
        />
      );
    }
    render(
      <React.StrictMode>
        <Parent />
      </React.StrictMode>
    );
    expect(root()).toHaveAttribute("data-complete");
    // StrictMode runs the parent's layout effect twice; the call comes after
    // both, from the effect that runs after the commit.
    expect(log).toEqual([
      "parent layout effect",
      "parent layout effect",
      "onComplete",
    ]);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("an unmount scheduled in the commit that mounts a past target still calls back once, with the Countdown in the document", () => {
    const seen: boolean[] = [];
    function Parent() {
      const [show, setShow] = React.useState(true);
      React.useLayoutEffect(() => {
        setShow(false);
      }, []);
      return show ? (
        <Countdown
          onComplete={() => seen.push(root() !== null)}
          target={T0 - SECOND}
        />
      ) : null;
    }
    render(<Parent />);
    expect(seen).toEqual([true]);
    advance(HOUR);
    expect(seen).toEqual([true]);
  });
});

// ---------------------------------------------------------------------------
// Suspense: hidden by a fallback, shown again
// ---------------------------------------------------------------------------

function gate() {
  let release: () => void = () => undefined;
  const promise = new Promise<void>((resolve) => {
    release = resolve;
  });
  return { promise, release };
}

function Suspends({ on }: { on: Promise<void> | null }) {
  if (on) {
    React.use(on);
  }
  return null;
}

function LaterSibling({ log }: { log: string[] }) {
  React.useLayoutEffect(() => {
    log.push("later sibling layout setup");
  });
  return null;
}

describe("hidden by a Suspense fallback", () => {
  for (const host of ["plain", "memo"] as const) {
    it(`${host} host: no timer and no call while hidden; shown again, the current value and one call after the commit's layout effects`, async () => {
      const log: string[] = [];
      const g = gate();
      const onComplete = vi.fn(() => log.push("onComplete"));
      const Plain = () => (
        <Countdown onComplete={onComplete} target={T0 + 2 * SECOND} />
      );
      const Memo = React.memo(Plain);
      const Host = host === "plain" ? Plain : Memo;
      const ui = (on: Promise<void> | null) => (
        <React.Suspense fallback={<i>loading</i>}>
          <Host />
          <LaterSibling log={log} />
          <Suspends on={on} />
        </React.Suspense>
      );
      const { rerender } = render(ui(null));
      await act(async () => {
        rerender(ui(g.promise));
      });
      expect(vi.getTimerCount()).toBe(0);
      advance(10 * SECOND);
      expect(onComplete).not.toHaveBeenCalled();
      log.length = 0;
      await act(async () => {
        g.release();
        await g.promise;
      });
      expect(shown()).toBe("00:00:00");
      expect(root()).toHaveAttribute("data-complete");
      expect(onComplete).toHaveBeenCalledTimes(1);
      expect(log).toEqual(["later sibling layout setup", "onComplete"]);
    });
  }

  for (const [name, targets] of [
    ["a target changed to a past instant", [T0 + SECOND]],
    [
      "several re-renders, the last to a past instant",
      [T0 + 30 * SECOND, T0 + 20 * SECOND, T0 + SECOND],
    ],
  ] as const) {
    it(`memo host, while hidden ${name}: one call at the reveal, after its layout effects`, async () => {
      const log: string[] = [];
      const g = gate();
      const onComplete = vi.fn(() => log.push("onComplete"));
      const Host = React.memo(({ target }: { target: number }) => (
        <Countdown onComplete={onComplete} target={target} />
      ));
      const ui = (on: Promise<void> | null, target: number) => (
        <React.Suspense fallback={<i>loading</i>}>
          <Host target={target} />
          <LaterSibling log={log} />
          <Suspends on={on} />
        </React.Suspense>
      );
      const { rerender } = render(ui(null, T0 + MINUTE));
      await act(async () => {
        rerender(ui(g.promise, T0 + MINUTE));
      });
      advance(5 * SECOND);
      for (const target of targets) {
        // biome-ignore lint/performance/noAwaitInLoops: one hidden render at a time
        await act(async () => {
          rerender(ui(g.promise, target));
        });
      }
      expect(onComplete).not.toHaveBeenCalled();
      log.length = 0;
      await act(async () => {
        g.release();
        await g.promise;
      });
      expect(shown()).toBe("00:00:00");
      expect(onComplete).toHaveBeenCalledTimes(1);
      expect(log.indexOf("onComplete")).toBeGreaterThan(
        log.indexOf("later sibling layout setup")
      );
      advance(MINUTE);
      expect(onComplete).toHaveBeenCalledTimes(1);
    });
  }

  for (const variant of [
    "the same target",
    "a future target set during the second hide",
  ] as const) {
    it(`memo host, the reveal hidden again before its call: ${variant}`, async () => {
      const g1 = gate();
      const g2 = gate();
      const onComplete = vi.fn();
      const armed = { now: false };
      let suspendAgain: (on: Promise<void> | null) => void = () => undefined;
      let setTarget: (target: number) => void = () => undefined;
      const Host = React.memo(({ target }: { target: number }) => (
        <Countdown onComplete={onComplete} target={target} />
      ));
      function Trigger() {
        React.useLayoutEffect(() => {
          if (armed.now) {
            armed.now = false;
            suspendAgain(g2.promise);
          }
        });
        return null;
      }
      function App() {
        const [on, setOn] = React.useState<Promise<void> | null>(null);
        const [target, setTargetState] = React.useState(T0 + 2 * SECOND);
        suspendAgain = setOn;
        setTarget = setTargetState;
        return (
          <React.Suspense fallback={<i>loading</i>}>
            <Host target={target} />
            <Trigger />
            <Suspends on={on} />
          </React.Suspense>
        );
      }
      const { container } = render(<App />);
      await act(async () => {
        suspendAgain(g1.promise);
      });
      advance(10 * SECOND);
      armed.now = true;
      await act(async () => {
        g1.release();
        await g1.promise;
      });
      // The reveal's layout effect hid it again before its passive effects.
      expect(container.textContent).toContain("loading");
      expect(onComplete).not.toHaveBeenCalled();
      if (variant !== "the same target") {
        await act(async () => {
          setTarget(T0 + MINUTE);
        });
      }
      await act(async () => {
        g2.release();
        await g2.promise;
      });
      if (variant === "the same target") {
        expect(shown()).toBe("00:00:00");
        expect(onComplete).toHaveBeenCalledTimes(1);
      } else {
        expect(shown()).toBe("00:00:50");
        expect(onComplete).not.toHaveBeenCalled();
      }
      advance(SECOND);
      expect(onComplete).toHaveBeenCalledTimes(
        variant === "the same target" ? 1 : 0
      );
    });
  }

  it("a memoised hook consumer that suspends once complete: no call while hidden again, one at the next reveal", async () => {
    const g1 = gate();
    const g2 = gate();
    const onComplete = vi.fn();
    let suspend: (on: Promise<void> | null) => void = () => undefined;
    const Consumer = React.memo(() => {
      const snapshot = useCountdown({ onComplete, target: T0 + 2 * SECOND });
      if (snapshot.isComplete) {
        React.use(g2.promise);
      }
      return <b>{String(snapshot.totalSeconds)}</b>;
    });
    function App() {
      const [on, setOn] = React.useState<Promise<void> | null>(null);
      suspend = setOn;
      return (
        <React.Suspense fallback={<i>loading</i>}>
          <Consumer />
          <Suspends on={on} />
        </React.Suspense>
      );
    }
    const { container } = render(<App />);
    await act(async () => {
      suspend(g1.promise);
    });
    advance(10 * SECOND);
    await act(async () => {
      g1.release();
      await g1.promise;
    });
    expect(container.textContent).toContain("loading");
    expect(onComplete).not.toHaveBeenCalled();
    await act(async () => {
      g2.release();
      await g2.promise;
    });
    expect(container.querySelector("b")?.textContent).toBe("0");
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("removed while hidden: no call", async () => {
    const g = gate();
    const onComplete = vi.fn();
    const ui = (on: Promise<void> | null, show: boolean) => (
      <React.Suspense fallback={<i>loading</i>}>
        {show ? (
          <Countdown onComplete={onComplete} target={T0 + 2 * SECOND} />
        ) : null}
        <Suspends on={on} />
      </React.Suspense>
    );
    const { rerender } = render(ui(null, true));
    await act(async () => {
      rerender(ui(g.promise, true));
    });
    await act(async () => {
      rerender(ui(g.promise, false));
    });
    advance(10 * SECOND);
    await act(async () => {
      g.release();
      await g.promise;
    });
    advance(MINUTE);
    expect(onComplete).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Snapshot identity across targets and units
// ---------------------------------------------------------------------------

describe("equal snapshots keep their identity", () => {
  function Probe(props: UseCountdownOptions & { seen: CountdownSnapshot[] }) {
    const { seen, ...options } = props;
    seen.push(useCountdown(options));
    return null;
  }

  for (const units of [["seconds"], ["minutes", "seconds"]] as const) {
    it(`a new target with the same displayed value returns the same object (${units.join(", ")})`, () => {
      const seen: CountdownSnapshot[] = [];
      const now = () => 0;
      const { rerender } = render(
        <Probe now={now} seen={seen} target={5100} units={units} />
      );
      const previous = seen.at(-1);
      rerender(<Probe now={now} seen={seen} target={5200} units={units} />);
      expect(seen.at(-1)).toBe(previous);
    });
  }

  it("a units change on a completed run returns the same zero, reads no clock and calls back once in all", () => {
    const seen: CountdownSnapshot[] = [];
    const now = vi.fn(() => Date.now());
    const onComplete = vi.fn();
    const { rerender } = render(
      <Probe
        now={now}
        onComplete={onComplete}
        seen={seen}
        target={T0}
        units={["minutes", "seconds"]}
      />
    );
    const previous = seen.at(-1);
    const reads = now.mock.calls.length;
    rerender(
      <Probe
        now={now}
        onComplete={onComplete}
        seen={seen}
        target={T0}
        units={["hours", "minutes", "seconds"]}
      />
    );
    expect(seen.at(-1)).toBe(previous);
    expect(now.mock.calls.length).toBe(reads);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("the render that changes the target already carries the new target's sample", () => {
    const seen: CountdownSnapshot[] = [];
    const { rerender } = render(
      <Probe seen={seen} target={T0 + 10 * SECOND} />
    );
    seen.length = 0;
    rerender(<Probe seen={seen} target={T0 + 20 * SECOND} />);
    expect(seen.length).toBeGreaterThan(0);
    expect(seen[0]?.isPending).toBe(false);
    expect(seen[0]?.seconds).toBe(20);
    expect(seen.map((s) => s.seconds)).not.toContain(10);
  });

  it("a render React does not commit leaves the committed value to be reused", async () => {
    const seen: CountdownSnapshot[] = [];
    const now = () => 0;
    const never = new Promise<never>(() => undefined);
    function Maybe(props: { suspend: boolean; target: number }) {
      seen.push(useCountdown({ now, target: props.target }));
      if (props.suspend) {
        React.use(never);
      }
      return null;
    }
    const ui = (target: number, suspend = false) => (
      <React.Suspense fallback={null}>
        <Maybe suspend={suspend} target={target} />
      </React.Suspense>
    );
    const { rerender } = render(ui(10_000));
    const committed = seen.at(-1);
    await act(async () => {
      React.startTransition(() => {
        rerender(ui(20_000, true));
      });
    });
    rerender(ui(9500));
    expect(seen.at(-1)?.seconds).toBe(10);
    expect(seen.at(-1)).toBe(committed);
  });
});

describe("target values that are neither a number nor a Date", () => {
  it("an ISO string renders pending with the development warning, and does not throw", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    render(<Countdown target={"2026-11-19T13:00:00Z" as unknown as Date} />);
    expect(root()).toHaveAttribute("data-pending");
    expect(vi.getTimerCount()).toBe(0);
    expect(warn).toHaveBeenCalledTimes(1);
  });
});

// ---------------------------------------------------------------------------
// Debts: who is owed, and when a debt is cancelled
// ---------------------------------------------------------------------------

/**
 * A memo host whose first reveal is hidden again by a later sibling's layout
 * effect before the commit's passive effects run.
 */
async function revealHiddenAgain(options: {
  between: (set: {
    onComplete: (cb: (() => void) | undefined) => void;
    target: (target: number | null) => void;
  }) => void;
  onComplete?: () => void;
}) {
  const g1 = gate();
  const g2 = gate();
  const armed = { now: false };
  let suspendAgain: (on: Promise<void> | null) => void = () => undefined;
  let setTarget: (target: number | null) => void = () => undefined;
  let setCallback: (cb: (() => void) | undefined) => void = () => undefined;
  const Host = React.memo(
    ({
      onComplete,
      target,
    }: {
      onComplete?: () => void;
      target: number | null;
    }) => <Countdown onComplete={onComplete} target={target} />
  );
  function Trigger() {
    React.useLayoutEffect(() => {
      if (armed.now) {
        armed.now = false;
        suspendAgain(g2.promise);
      }
    });
    return null;
  }
  function App() {
    const [on, setOn] = React.useState<Promise<void> | null>(null);
    const [target, setTargetState] = React.useState<number | null>(
      T0 + 2 * SECOND
    );
    const [callback, setCallbackState] = React.useState<{
      cb: (() => void) | undefined;
    }>({ cb: options.onComplete });
    suspendAgain = setOn;
    setTarget = setTargetState;
    setCallback = (cb) => setCallbackState({ cb });
    return (
      <React.Suspense fallback={<i>loading</i>}>
        <Host onComplete={callback.cb} target={target} />
        <Trigger />
        <Suspends on={on} />
      </React.Suspense>
    );
  }
  const { container } = render(<App />);
  await act(async () => {
    suspendAgain(g1.promise);
  });
  advance(10 * SECOND);
  armed.now = true;
  await act(async () => {
    g1.release();
    await g1.promise;
  });
  expect(container.textContent).toContain("loading");
  await act(async () => {
    options.between({ onComplete: setCallback, target: setTarget });
  });
  await act(async () => {
    g2.release();
    await g2.promise;
  });
}

describe("debts", () => {
  it("a callback first supplied after its run completed is not called", async () => {
    const late = vi.fn();
    await revealHiddenAgain({
      between: (set) => set.onComplete(late),
    });
    expect(shown()).toBe("00:00:00");
    expect(late).not.toHaveBeenCalled();
    advance(MINUTE);
    act(() => {
      window.dispatchEvent(new Event("pageshow"));
    });
    expect(late).not.toHaveBeenCalled();
  });

  it("a callback present when its run completed is called once, the latest one", async () => {
    const first = vi.fn();
    const latest = vi.fn();
    await revealHiddenAgain({
      between: (set) => set.onComplete(latest),
      onComplete: first,
    });
    expect(first).not.toHaveBeenCalled();
    expect(latest).toHaveBeenCalledTimes(1);
  });

  it("an unknown target during the second hide cancels the debt", async () => {
    const onComplete = vi.fn();
    await revealHiddenAgain({
      between: (set) => set.target(null),
      onComplete,
    });
    expect(root()).toHaveAttribute("data-pending");
    advance(MINUTE);
    expect(onComplete).not.toHaveBeenCalled();
  });

  it("another past target showing the same zero returns the same object and completes once more", () => {
    const seen: CountdownSnapshot[] = [];
    const onComplete = vi.fn();
    function Probe({ target }: { target: number }) {
      seen.push(useCountdown({ onComplete, target }));
      return null;
    }
    const { rerender } = render(<Probe target={T0 - SECOND} />);
    const previous = seen.at(-1);
    expect(onComplete).toHaveBeenCalledTimes(1);
    rerender(<Probe target={T0 - 2 * SECOND} />);
    expect(seen.at(-1)).toBe(previous);
    expect(onComplete).toHaveBeenCalledTimes(2);
  });

  it("a pageshow from an earlier sibling's passive effect: nothing for a replaced run; a past target is called back once by the effect after the commit", () => {
    const log: string[] = [];
    const onA = vi.fn(() => log.push("onComplete A"));
    const onB = vi.fn(() => log.push("onComplete B"));
    function Earlier({ target }: { target: number }) {
      // biome-ignore lint/correctness/useExhaustiveDependencies: fires once per target, by design
      React.useEffect(() => {
        log.push("earlier sibling passive: pageshow");
        window.dispatchEvent(new Event("pageshow"));
      }, [target]);
      return null;
    }
    const ui = (target: number, onComplete: () => void) => (
      <>
        <Earlier target={target} />
        <Countdown onComplete={onComplete} target={target} />
      </>
    );
    const { rerender } = render(ui(T0 + SECOND, onA));
    vi.setSystemTime(T0 + SECOND);
    rerender(ui(T0 + 10 * SECOND, onB));
    expect(onA).not.toHaveBeenCalled();
    expect(onB).not.toHaveBeenCalled();
    expect(shown()).toBe("00:00:09");
    log.length = 0;
    rerender(ui(T0 - 1, onB));
    expect(log).toEqual(["earlier sibling passive: pageshow", "onComplete B"]);
    expect(onA).not.toHaveBeenCalled();
  });
});
