// @vitest-environment jsdom

/**
 * The form-submit demo submits from `value` only where the browser cannot
 * set a file input's files. The component then drops `required`, so the demo
 * must check emptiness itself, and it must never append a second copy where
 * the input already carries the files.
 */

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import FileUploadFormSubmit from "@/demos/file-upload/form-submit";

const REQUIRED = "Choose at least one file.";
const WOULD_SEND = /Would send:/;

function pick(container: HTMLElement, files: File[]) {
  const picker = container.querySelector(
    "input[data-file-upload-picker]"
  ) as HTMLInputElement;
  Object.defineProperty(picker, "files", { configurable: true, value: files });
  fireEvent.change(picker);
}

function submit(container: HTMLElement) {
  fireEvent.submit(container.querySelector("form") as HTMLFormElement);
}

function sent() {
  return screen.queryByText(WOULD_SEND)?.textContent ?? null;
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("form-submit demo where the bridge is unsupported", () => {
  // jsdom has no DataTransfer constructor, so the bridge turns itself off.
  it("blocks an empty submit with a visible message", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const { container } = render(createElement(FileUploadFormSubmit));
    expect(
      container.querySelector('[data-form-bridge="unsupported"]')
    ).not.toBeNull();
    submit(container);
    expect(screen.getByText(REQUIRED)).toBeTruthy();
    expect(sent()).toBeNull();
  });

  it("submits a chosen file exactly once and clears the message", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const { container } = render(createElement(FileUploadFormSubmit));
    submit(container);
    pick(container, [new File(["x"], "a.txt", { type: "text/plain" })]);
    expect(screen.queryByText(REQUIRED)).toBeNull();
    submit(container);
    expect(sent()).toBe("Would send: a.txt");
  });
});

describe("form-submit demo where the bridge works", () => {
  it("never appends the files from value", () => {
    // A stand-in bridge: a constructible DataTransfer and a `files` setter
    // that keeps what it is given, so the component stays supported.
    class StubTransfer {
      readonly list: File[] = [];
      readonly items = { add: (file: File) => this.list.push(file) };
      get files() {
        return this.list;
      }
    }
    vi.stubGlobal("DataTransfer", StubTransfer);
    const kept = new WeakMap<HTMLInputElement, unknown>();
    const descriptor = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "files"
    ) as PropertyDescriptor;
    Object.defineProperty(HTMLInputElement.prototype, "files", {
      configurable: true,
      get(this: HTMLInputElement) {
        return kept.get(this) ?? descriptor.get?.call(this);
      },
      set(this: HTMLInputElement, value: unknown) {
        kept.set(this, value);
      },
    });
    try {
      const { container } = render(createElement(FileUploadFormSubmit));
      pick(container, [new File(["x"], "a.txt", { type: "text/plain" })]);
      expect(
        container.querySelector('[data-form-bridge="unsupported"]')
      ).toBeNull();
      submit(container);
      // jsdom's FormData reads the input's own file list, not the stand-in
      // setter, so a.txt could only appear here by the fallback's append.
      expect(sent()).not.toContain("a.txt");
    } finally {
      Object.defineProperty(HTMLInputElement.prototype, "files", descriptor);
    }
  });
});
