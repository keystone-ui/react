/// <reference types="vitest" />
/// <reference types="@testing-library/jest-dom" />

import * as matchers from "@testing-library/jest-dom/matchers";
import { cleanup } from "@testing-library/react";
import { afterEach, expect } from "vitest";

expect.extend(matchers);

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Polyfill ResizeObserver for jsdom (used by react-use-measure)
if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof globalThis.ResizeObserver;
}

// Polyfill IntersectionObserver for jsdom (embla-carousel tracks which slides
// are in view with one).
if (typeof globalThis.IntersectionObserver === "undefined") {
  globalThis.IntersectionObserver = class IntersectionObserver {
    readonly root = null;
    readonly rootMargin = "";
    readonly thresholds: readonly number[] = [];
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  } as unknown as typeof globalThis.IntersectionObserver;
}

// Polyfill matchMedia for jsdom (embla-carousel resolves its `breakpoints`
// option through media queries on mount and throws without it).
if (typeof globalThis.matchMedia === "undefined") {
  globalThis.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener() {
      // no-op: nothing re-evaluates media queries in jsdom
    },
    removeEventListener() {
      // no-op
    },
    addListener() {
      // no-op: deprecated MediaQueryList API, kept for callers that use it
    },
    removeListener() {
      // no-op
    },
    dispatchEvent: () => false,
  })) as unknown as typeof globalThis.matchMedia;
}

// jsdom doesn't perform real image loads, so the `image.onload` callback used
// by @base-ui/react 1.4's Avatar.Image (via useImageLoadingStatus) never
// fires and the <img> element is never mounted. Stub Image so setting `src`
// resolves the load asynchronously, matching the contract base-ui expects.
class MockImage {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  referrerPolicy = "";
  crossOrigin: string | null = null;
  complete = true;
  naturalWidth = 1;
  naturalHeight = 1;
  private _src = "";
  get src() {
    return this._src;
  }
  set src(value: string) {
    this._src = value;
    // Fire onload synchronously so callers using
    // `image.complete && image.naturalWidth > 0` to short-circuit also work.
    this.onload?.();
  }
}
globalThis.Image = MockImage as unknown as typeof Image;
