// @vitest-environment jsdom

/**
 * The edit-form demo sets `required` once every saved file is deleted, so it
 * must show the required message itself: the component adds nothing visible
 * without `FileUploadError`.
 */

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { createElement } from "react";
import { afterEach, expect, it, vi } from "vitest";

import FileUploadEditForm from "@/demos/file-upload/edit-form";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it("shows the required message once every saved file is deleted", () => {
  // A constructible DataTransfer keeps the form bridge, and `required`, on.
  vi.stubGlobal(
    "DataTransfer",
    class {
      readonly files = [];
      readonly items = { add: () => undefined };
    }
  );
  const { container } = render(createElement(FileUploadEditForm));
  fireEvent.click(screen.getByRole("button", { name: "Delete contract.pdf" }));
  fireEvent.click(screen.getByRole("button", { name: "Delete invoice.pdf" }));
  const form = container.querySelector("form") as HTMLFormElement;
  let valid = true;
  act(() => {
    valid = form.checkValidity();
  });
  expect(valid).toBe(false);
  expect(screen.getByText("Choose at least one file.")).toBeTruthy();
});
