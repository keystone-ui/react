import { act, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useMediaQuery } from "./use-media-query";

// =============================================================================
// Test doubles
// =============================================================================
// `src/test/setup.ts` installs a matchMedia polyfill for embla-carousel, but its
// listeners are no-ops so it cannot drive `change` events. These tests install
// their own controllable list instead.

type ChangeListener = (event: MediaQueryListEvent) => void;

class FakeMediaQueryList {
  readonly listeners = new Set<ChangeListener>();
  readonly media: string;
  removeEventListenerCalls = 0;

  private currentMatches: boolean;

  constructor(media: string, matches: boolean) {
    this.media = media;
    this.currentMatches = matches;
  }

  get matches() {
    return this.currentMatches;
  }

  addEventListener(_type: "change", listener: ChangeListener) {
    this.listeners.add(listener);
  }

  removeEventListener(_type: "change", listener: ChangeListener) {
    this.listeners.delete(listener);
    this.removeEventListenerCalls += 1;
  }

  /** Flips the match state and notifies subscribers, as a real viewport change would. */
  emit(matches: boolean) {
    this.currentMatches = matches;
    for (const listener of this.listeners) {
      listener({ matches } as MediaQueryListEvent);
    }
  }
}

function installMatchMedia(initialMatches: Record<string, boolean> = {}) {
  const lists = new Map<string, FakeMediaQueryList>();

  const matchMedia = vi.fn((query: string) => {
    const existing = lists.get(query);
    if (existing) {
      return existing;
    }
    const created = new FakeMediaQueryList(
      query,
      initialMatches[query] ?? false
    );
    lists.set(query, created);
    return created;
  });

  vi.stubGlobal("matchMedia", matchMedia);

  return {
    matchMedia,
    listFor(query: string) {
      const list = lists.get(query);
      if (!list) {
        throw new Error(`matchMedia was never called with ${query}`);
      }
      return list;
    },
  };
}

/**
 * Records the value returned by *every* render pass, so a test can distinguish
 * "correct immediately" from "corrected on a second pass".
 */
function renderProbe(initialQuery: string) {
  const renders: boolean[] = [];

  function Probe({ query }: { query: string }) {
    renders.push(useMediaQuery(query));
    return null;
  }

  const view = render(<Probe query={initialQuery} />);

  return {
    renders,
    unmount: view.unmount,
    setQuery(query: string) {
      view.rerender(<Probe query={query} />);
    },
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

// =============================================================================
// useMediaQuery
// =============================================================================
describe("useMediaQuery", () => {
  const DESKTOP = "(min-width: 768px)";

  // The regression this hook exists to avoid: a `useState(false)` + `useEffect`
  // implementation renders `false` first and corrects itself after paint, so a
  // desktop viewport paints the mobile branch for a frame. Asserting on the
  // full render log rather than the final value is what catches that — the old
  // implementation left `[false, true]` here.
  it("reports a match on the first render, with no corrective pass", () => {
    installMatchMedia({ [DESKTOP]: true });

    const { renders } = renderProbe(DESKTOP);

    expect(renders[0]).toBe(true);
    expect(renders).toEqual([true]);
  });

  it("reports a non-match on the first render, with no corrective pass", () => {
    installMatchMedia({ [DESKTOP]: false });

    const { renders } = renderProbe(DESKTOP);

    expect(renders).toEqual([false]);
  });

  it("updates when the media query starts matching", () => {
    const { listFor } = installMatchMedia({ [DESKTOP]: false });

    const { renders } = renderProbe(DESKTOP);
    expect(renders.at(-1)).toBe(false);

    act(() => listFor(DESKTOP).emit(true));

    expect(renders.at(-1)).toBe(true);
  });

  it("updates when the media query stops matching", () => {
    const { listFor } = installMatchMedia({ [DESKTOP]: true });

    const { renders } = renderProbe(DESKTOP);
    expect(renders.at(-1)).toBe(true);

    act(() => listFor(DESKTOP).emit(false));

    expect(renders.at(-1)).toBe(false);
  });

  it("subscribes to the list it was given", () => {
    const { listFor } = installMatchMedia({ [DESKTOP]: false });

    renderProbe(DESKTOP);

    expect(listFor(DESKTOP).listeners.size).toBe(1);
  });

  it("unsubscribes on unmount", () => {
    const { listFor } = installMatchMedia({ [DESKTOP]: false });

    const { unmount } = renderProbe(DESKTOP);
    unmount();

    expect(listFor(DESKTOP).listeners.size).toBe(0);
    expect(listFor(DESKTOP).removeEventListenerCalls).toBe(1);
  });

  it("re-subscribes when the query changes", () => {
    const PRINT = "print";
    const { listFor } = installMatchMedia({ [DESKTOP]: false, [PRINT]: true });

    const probe = renderProbe(DESKTOP);
    expect(probe.renders.at(-1)).toBe(false);

    act(() => probe.setQuery(PRINT));

    expect(probe.renders.at(-1)).toBe(true);
    expect(listFor(DESKTOP).listeners.size).toBe(0);
    expect(listFor(PRINT).listeners.size).toBe(1);
  });

  it("keeps the same list across re-renders with an unchanged query", () => {
    const { matchMedia } = installMatchMedia({ [DESKTOP]: true });

    const probe = renderProbe(DESKTOP);
    act(() => probe.setQuery(DESKTOP));

    expect(matchMedia).toHaveBeenCalledTimes(1);
  });

  // Degrades instead of throwing where `matchMedia` is missing — older jsdom
  // setups and non-DOM renderers among them.
  it("returns false when matchMedia is unavailable", () => {
    vi.stubGlobal("matchMedia", undefined);

    const { renders } = renderProbe(DESKTOP);

    expect(renders).toEqual([false]);
  });
});
