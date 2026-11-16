// @vitest-environment node

/**
 * `mergeClassName` is the helper every Base UI wrapper hands its `className`
 * through. Its contract: a string or `undefined` merges straight away, exactly
 * like `cn(base, className)`; a function stays a function, is called lazily
 * with the state Base UI passes, and its result is merged over `base`. In both
 * branches the consumer's class wins a conflict with the part's own.
 */

import { describe, expect, it, vi } from "vitest";

import { mergeClassName } from "./utils";

describe("mergeClassName", () => {
  it("merges a string over the base and returns a string", () => {
    const out = mergeClassName("p-4 text-sm", "font-bold");
    expect(typeof out).toBe("string");
    expect(out).toBe("p-4 text-sm font-bold");
  });

  it("returns exactly the base for undefined", () => {
    expect(mergeClassName("p-4 text-sm", undefined)).toBe("p-4 text-sm");
  });

  it("lets a consumer string win a conflicting base class", () => {
    expect(mergeClassName("p-4 text-sm", "p-2")).toBe("text-sm p-2");
  });

  it("returns a function for a function, and calls it lazily with the exact state", () => {
    const state = { open: true };
    const fn = vi.fn((s: { open: boolean }) => (s.open ? "font-bold" : ""));
    const out = mergeClassName("p-4", fn);

    expect(typeof out).toBe("function");
    expect(fn).not.toHaveBeenCalled();

    const resolved = (out as (s: { open: boolean }) => string)(state);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn.mock.calls[0]?.[0]).toBe(state);
    expect(resolved).toBe("p-4 font-bold");
  });

  it("lets a consumer function's class win a conflicting base class", () => {
    const out = mergeClassName("p-4 text-sm", () => "p-2");
    expect((out as (s: unknown) => string)({})).toBe("text-sm p-2");
  });

  it("gives exactly the base when the function returns undefined", () => {
    const out = mergeClassName<object>("p-4 text-sm", () => undefined);
    expect((out as (s: object) => string)({})).toBe("p-4 text-sm");
  });

  it("gives exactly the base when the function returns an empty string", () => {
    const out = mergeClassName("p-4 text-sm", () => "");
    expect((out as (s: unknown) => string)({})).toBe("p-4 text-sm");
  });

  it("returns a function only for a function input", () => {
    expect(typeof mergeClassName("", "x")).toBe("string");
    expect(typeof mergeClassName("", undefined)).toBe("string");
    expect(typeof mergeClassName("", () => "x")).toBe("function");
  });
});
