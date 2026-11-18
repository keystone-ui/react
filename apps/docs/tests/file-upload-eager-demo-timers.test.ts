// @vitest-environment jsdom

/**
 * The eager-upload demo drives its fake requests with timers. A retry must
 * start exactly one new request, even under Strict Mode (React may run a
 * state updater twice), and unmounting must stop every pending request.
 */

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { createElement, StrictMode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import FileUploadEagerUpload from "@/demos/file-upload/eager-upload";

const TICK = 400;

function pick(container: HTMLElement, files: File[]) {
  const picker = container.querySelector(
    "input[data-file-upload-picker]"
  ) as HTMLInputElement;
  Object.defineProperty(picker, "files", { configurable: true, value: files });
  fireEvent.change(picker);
}

function rowStatus(container: HTMLElement) {
  return container
    .querySelector('[data-slot="file-upload-item"]')
    ?.getAttribute("data-status");
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("eager-upload demo timers", () => {
  it("starts one request per retry and succeeds on the second try", () => {
    const { container } = render(
      createElement(StrictMode, null, createElement(FileUploadEagerUpload))
    );
    pick(container, [new File(["x"], "fail.pdf")]);
    act(() => {
      vi.advanceTimersByTime(TICK * 4 + 200);
    });
    expect(rowStatus(container)).toBe("error");

    fireEvent.click(screen.getByRole("button", { name: "Retry fail.pdf" }));
    expect(rowStatus(container)).toBe("uploading");
    // Past any short-lived timer, but before the first tick: one request's
    // tick is pending, nothing more.
    act(() => {
      vi.advanceTimersByTime(150);
    });
    expect(vi.getTimerCount()).toBe(1);

    act(() => {
      vi.advanceTimersByTime(TICK * 4 + 200);
    });
    expect(rowStatus(container)).toBe("success");
  });

  it("leaves no timer running after unmount", () => {
    const { container, unmount } = render(createElement(FileUploadEagerUpload));
    pick(container, [new File(["x"], "a.pdf")]);
    act(() => {
      vi.advanceTimersByTime(TICK);
    });
    expect(vi.getTimerCount()).toBeGreaterThan(0);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
