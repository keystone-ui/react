import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CopyButton } from "./copy-button";

// `navigator.clipboard` is a getter-only property in jsdom, so it has to be
// redefined rather than assigned.
function mockClipboard(writeText: () => Promise<void>) {
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText },
    writable: true,
  });
}

describe("CopyButton", () => {
  beforeEach(() => {
    mockClipboard(() => Promise.resolve());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("writes the value to the clipboard", async () => {
    const user = userEvent.setup();
    // After setup, not before: userEvent installs its own clipboard stub.
    const writeText = vi.fn(() => Promise.resolve());
    mockClipboard(writeText);

    render(<CopyButton value="usr_3f9a2c81" />);
    await user.click(screen.getByRole("button"));

    expect(writeText).toHaveBeenCalledWith("usr_3f9a2c81");
  });

  it("confirms through the accessible name, not only the icon", async () => {
    const user = userEvent.setup();
    render(<CopyButton value="usr_3f9a2c81" />);

    const button = screen.getByRole("button", { name: "Copy" });
    await user.click(button);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Copied" })
      ).toBeInTheDocument();
    });
  });

  it("reverts after the reset delay", async () => {
    const user = userEvent.setup();
    render(<CopyButton resetDelay={10} value="usr_3f9a2c81" />);

    await user.click(screen.getByRole("button"));
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Copied" })
      ).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Copy" })).toBeInTheDocument();
    });
  });

  /**
   * The failure that made this a component rather than a copied snippet.
   * Clipboard access rejects whenever the document is unfocused or the context
   * is insecure. Showing a tick then would tell the user the value is on their
   * clipboard when it is not.
   */
  it("does not claim success when the write fails", async () => {
    const user = userEvent.setup();
    mockClipboard(() => Promise.reject(new Error("denied")));
    const onCopied = vi.fn();

    render(<CopyButton onCopied={onCopied} value="usr_3f9a2c81" />);
    await user.click(screen.getByRole("button"));

    expect(onCopied).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Copy" })).toBeInTheDocument();
  });

  /** Unmounting mid-timer must not set state on a dead component. */
  it("clears its reset timer on unmount", async () => {
    const clearSpy = vi.spyOn(globalThis, "clearTimeout");
    const user = userEvent.setup();

    const { unmount } = render(<CopyButton value="usr_3f9a2c81" />);
    await user.click(screen.getByRole("button"));
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Copied" })
      ).toBeInTheDocument();
    });
    unmount();

    expect(clearSpy).toHaveBeenCalled();
  });

  it("passes size and variant through to Button", () => {
    render(<CopyButton size="icon" value="usr_3f9a2c81" variant="outline" />);

    expect(screen.getByRole("button")).toHaveClass("size-10", "border");
  });
});
