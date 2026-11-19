/**
 * Without `act`: React's own scheduler decides when passive effects run, as
 * in a browser task queue, so a wake can land between a commit's layout and
 * passive effects.
 */

import * as React from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import { Countdown } from "./countdown";

const T0 = Date.UTC(2026, 10, 19, 12, 0, 0);
const shown = (c: HTMLElement) =>
  c.querySelector('[data-slot="countdown"] > [aria-hidden="true"]')
    ?.textContent;

const env = globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean };
let previous: boolean | undefined;
beforeEach(() => {
  previous = env.IS_REACT_ACT_ENVIRONMENT;
  env.IS_REACT_ACT_ENVIRONMENT = false;
});
afterEach(() => {
  env.IS_REACT_ACT_ENVIRONMENT = previous;
});

it("a pageshow between the layout and passive effects of the commit that replaces A with B reaches neither A nor B's callback", async () => {
  let t = T0;
  let reads = 0;
  const now = () => {
    reads += 1;
    return t;
  };
  const onA = vi.fn();
  const onB = vi.fn();
  const log: string[] = [];
  let committed: () => void = () => undefined;
  /** Resolves when the next commit's passive effects have run. */
  const nextPassive = () =>
    new Promise<void>((resolve) => {
      committed = resolve;
    });
  function Wake({ target }: { target: number }) {
    // biome-ignore lint/correctness/useExhaustiveDependencies: fires once per target, by design
    React.useLayoutEffect(() => {
      log.push("layout");
      queueMicrotask(() => {
        const before = reads;
        window.dispatchEvent(new Event("pageshow"));
        log.push(`pageshow microtask: ${reads - before} clock read`);
      });
    }, [target]);
    // biome-ignore lint/correctness/useExhaustiveDependencies: fires once per target, by design
    React.useEffect(() => {
      log.push("passive");
      committed();
    }, [target]);
    return null;
  }
  const ui = (target: number, onComplete: () => void) => (
    <>
      <Countdown now={now} onComplete={onComplete} target={target} />
      <Wake target={target} />
    </>
  );
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  try {
    let passive = nextPassive();
    root.render(ui(T0 + 1000, onA));
    await passive;
    // A's deadline is reached with no wake; B replaces it in one commit.
    t = T0 + 1000;
    log.length = 0;
    passive = nextPassive();
    root.render(ui(T0 + 10_000, onB));
    await passive;
    expect(log).toEqual([
      "layout",
      "pageshow microtask: 1 clock read",
      "passive",
    ]);
    expect(onA).not.toHaveBeenCalled();
    expect(onB).not.toHaveBeenCalled();
    expect(shown(container)).toBe("00:00:09");
  } finally {
    root.unmount();
    container.remove();
  }
});
