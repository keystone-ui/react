import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  getSwipeDirections,
  Toaster,
  type ToastPosition,
  toast,
} from "./toast";

// =============================================================================
// Toaster
// =============================================================================
describe("Toaster", () => {
  it("renders without crashing", () => {
    render(<Toaster />);
    // Toaster renders a viewport container
    const viewport = document.querySelector("[data-slot='toaster']");
    expect(viewport).toBeInTheDocument();
  });

  it("applies custom position class", () => {
    render(<Toaster position="top-right" />);
    const viewport = document.querySelector("[data-slot='toaster']");
    expect(viewport).toHaveAttribute("data-position", "top");
  });

  it("applies bottom position by default", () => {
    render(<Toaster />);
    const viewport = document.querySelector("[data-slot='toaster']");
    expect(viewport).toHaveAttribute("data-position", "bottom");
  });
});

// =============================================================================
// Toast imperative API
// =============================================================================
describe("toast", () => {
  it("displays a toast when called", async () => {
    render(<Toaster />);

    toast("Hello world");

    await waitFor(() => {
      expect(screen.getByText("Hello world")).toBeInTheDocument();
    });
  });

  it("displays a success toast", async () => {
    render(<Toaster />);

    toast.success("Operation succeeded");

    await waitFor(() => {
      expect(screen.getByText("Operation succeeded")).toBeInTheDocument();
    });
  });

  it("displays an error toast", async () => {
    render(<Toaster />);

    toast.error("Something went wrong");

    await waitFor(() => {
      expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    });
  });

  it("displays a warning toast", async () => {
    render(<Toaster />);

    toast.warning("Be careful");

    await waitFor(() => {
      expect(screen.getByText("Be careful")).toBeInTheDocument();
    });
  });

  it("displays an info toast", async () => {
    render(<Toaster />);

    toast.info("FYI");

    await waitFor(() => {
      expect(screen.getByText("FYI")).toBeInTheDocument();
    });
  });

  it("displays a toast with description", async () => {
    render(<Toaster />);

    toast({ title: "Title", description: "Description text" });

    await waitFor(() => {
      expect(screen.getByText("Title")).toBeInTheDocument();
      expect(screen.getByText("Description text")).toBeInTheDocument();
    });
  });

  it("displays a toast with action button", async () => {
    render(<Toaster />);

    toast("Undo?", {
      action: { label: "Undo", onClick: () => {} },
    });

    await waitFor(() => {
      expect(screen.getByText("Undo?")).toBeInTheDocument();
      expect(screen.getByText("Undo")).toBeInTheDocument();
    });
  });

  it("dismisses a toast by id", async () => {
    render(<Toaster />);

    const id = toast("Will be dismissed");

    await waitFor(() => {
      expect(screen.getByText("Will be dismissed")).toBeInTheDocument();
    });

    toast.dismiss(id);

    await waitFor(() => {
      expect(screen.queryByText("Will be dismissed")).not.toBeInTheDocument();
    });
  });
});

// =============================================================================
// Close button
// =============================================================================
describe("toast close button", () => {
  const getClose = () =>
    document.querySelector<HTMLElement>("[data-slot='toast-close']");

  it("renders inside the content row, not as a Toast.Root sibling", async () => {
    render(<Toaster />);

    toast("Closable");

    await waitFor(() => {
      expect(
        document.querySelector(
          "[data-slot='toast-content'] [data-slot='toast-close']"
        )
      ).toBeInTheDocument();
    });
  });

  it("stays in normal flow inside the row", async () => {
    render(<Toaster />);

    toast("Closable");

    await waitFor(() => {
      expect(getClose()).toBeInTheDocument();
    });

    // The button must stay in flow: `relative` only anchors its invisible
    // tap-target pseudo. An `absolute` winning the tailwind-merge `position`
    // group would lift it out of the row and add phantom height to the root,
    // which Base UI then measures into `--toast-height`.
    const classes = getClose()?.classList;
    expect(classes?.contains("relative")).toBe(true);
    expect(classes?.contains("absolute")).toBe(false);
  });

  it("centres row children so a title-only toast is not top-heavy", async () => {
    render(<Toaster />);

    toast("Title only");

    await waitFor(() => {
      expect(getClose()).toBeInTheDocument();
    });

    // Without `items-center` the text block stretches to the row height (set by
    // the close button) and the title hangs at its top edge.
    const content = document.querySelector("[data-slot='toast-content']");
    expect(content?.classList.contains("items-center")).toBe(true);
  });

  it("dismisses the toast when clicked", async () => {
    const user = userEvent.setup();
    render(<Toaster />);

    toast("Click to close");

    await waitFor(() => {
      expect(screen.getByText("Click to close")).toBeInTheDocument();
    });

    const close = getClose();
    expect(close).toBeInTheDocument();
    if (close) {
      await user.click(close);
    }

    await waitFor(() => {
      expect(screen.queryByText("Click to close")).not.toBeInTheDocument();
    });
  });

  it("omits the close button when dismissible is false", async () => {
    render(<Toaster />);

    toast("Sticky", { dismissible: false });

    await waitFor(() => {
      expect(screen.getByText("Sticky")).toBeInTheDocument();
    });

    expect(getClose()).not.toBeInTheDocument();
  });

  it("omits the close button when the Toaster disables it", async () => {
    render(<Toaster closeButton={false} />);

    toast("No close");

    await waitFor(() => {
      expect(screen.getByText("No close")).toBeInTheDocument();
    });

    expect(getClose()).not.toBeInTheDocument();
  });
});

// =============================================================================
// Content: message -> description, title is opt-in
// =============================================================================
describe("toast content", () => {
  const titleEl = () => document.querySelector("[data-slot='toast-title']");
  const descEl = () =>
    document.querySelector("[data-slot='toast-description']");

  it("puts a bare message in the description, with no title element", async () => {
    render(<Toaster />);

    toast("Event has been created.");

    await waitFor(() => {
      expect(screen.getByText("Event has been created.")).toBeInTheDocument();
    });

    // Base UI omits an empty label part entirely — matching shadcn, where the
    // default toast is a single muted line and no <h2> is rendered.
    expect(titleEl()).not.toBeInTheDocument();
    expect(descEl()).toHaveTextContent("Event has been created.");
  });

  it("renders both lines for the object form", async () => {
    render(<Toaster />);

    toast({
      title: "Event created",
      description: "Sunday, December 3 at 9:00 AM",
    });

    await waitFor(() => {
      expect(titleEl()).toBeInTheDocument();
    });

    expect(titleEl()).toHaveTextContent("Event created");
    expect(descEl()).toHaveTextContent("Sunday, December 3 at 9:00 AM");
  });

  it("still applies options passed alongside a message", async () => {
    render(<Toaster />);

    toast("No close here", { closeButton: false });

    await waitFor(() => {
      expect(screen.getByText("No close here")).toBeInTheDocument();
    });

    expect(descEl()).toBeInTheDocument();
    expect(
      document.querySelector("[data-slot='toast-close']")
    ).not.toBeInTheDocument();
  });

  it("names a description-only toast via aria-label", async () => {
    render(<Toaster />);

    toast("Saved to drafts");

    await waitFor(() => {
      expect(screen.getByText("Saved to drafts")).toBeInTheDocument();
    });

    // role=dialog with no title would otherwise have no accessible name.
    expect(document.querySelector("[data-slot='toast']")).toHaveAttribute(
      "aria-label",
      "Saved to drafts"
    );
  });

  it("treats a React element as a message, not as an options object", async () => {
    render(<Toaster />);

    toast(<span data-testid="node-message">Rendered node</span>);

    await waitFor(() => {
      expect(screen.getByTestId("node-message")).toBeInTheDocument();
    });

    expect(descEl()).toContainElement(screen.getByTestId("node-message"));
  });

  it("treats an array of nodes as a message", async () => {
    render(<Toaster />);

    toast(["Uploaded ", "3 files"]);

    await waitFor(() => {
      expect(descEl()).toBeInTheDocument();
    });

    expect(descEl()).toHaveTextContent("Uploaded 3 files");
    expect(titleEl()).not.toBeInTheDocument();
  });

  it("renders the message of a typed helper as a description", async () => {
    render(<Toaster />);

    toast.success("Event has been created.");

    await waitFor(() => {
      expect(screen.getByText("Event has been created.")).toBeInTheDocument();
    });

    expect(titleEl()).not.toBeInTheDocument();
    expect(
      document.querySelector("[data-slot='toast-icon']")
    ).toBeInTheDocument();
  });
});

// =============================================================================
// Position: swipe directions + viewport placement
// =============================================================================
describe("getSwipeDirections", () => {
  it.each([
    ["top-left", ["up", "left"]],
    ["top-center", ["up"]],
    ["top-right", ["up", "right"]],
    ["bottom-left", ["down", "left"]],
    ["bottom-center", ["down"]],
    ["bottom-right", ["down", "right"]],
  ] as const)("%s swipes %j", (position, expected) => {
    expect(getSwipeDirections(position)).toEqual(expected);
  });
});

/** Unprefixed margin/padding utilities (`m-4`, `pt-…`, `pl-[…]`). */
const SPACING_CLASS = /^(m|p)[trblxy]?-/;

describe("Toaster viewport placement", () => {
  const viewportClasses = () =>
    Array.from(
      document.querySelector("[data-slot='toaster']")?.classList ?? []
    );

  it.each(["top-center", "bottom-center"] as const)(
    "centres %s from sm up only",
    (position) => {
      render(<Toaster position={position} />);
      const classes = viewportClasses();
      // An unprefixed translate pushes phone toasts half off-screen, because
      // below `sm` the viewport already spans the screen.
      expect(classes).toContain("sm:-translate-x-1/2");
      expect(classes).toContain("sm:left-1/2");
      expect(classes).not.toContain("-translate-x-1/2");
      expect(classes).not.toContain("left-1/2");
    }
  );

  it.each([
    "top-left",
    "top-center",
    "top-right",
    "bottom-left",
    "bottom-center",
    "bottom-right",
  ] as ToastPosition[])(
    "%s uses safe-area offsets, not margin or padding",
    (position) => {
      render(<Toaster position={position} />);
      const classes = viewportClasses();
      // Toasts are absolute inside the viewport: padding never moved them, and
      // a margin knocked the centred positions off-centre.
      expect(classes.some((c) => SPACING_CLASS.test(c))).toBe(false);
      const edge = position.startsWith("top") ? "top" : "bottom";
      expect(classes).toContain(
        `${edge}-[max(1rem,env(safe-area-inset-${edge}))]`
      );
      expect(classes).toContain(
        "max-sm:left-[max(0.5rem,env(safe-area-inset-left))]"
      );
      expect(classes).toContain(
        "max-sm:right-[max(0.5rem,env(safe-area-inset-right))]"
      );
    }
  );
});

// =============================================================================
// Close callbacks: onDismiss vs onAutoClose
// =============================================================================
describe("toast close callbacks", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      toast.dismiss();
      vi.runOnlyPendingTimers();
    });
    vi.useRealTimers();
  });

  /** Render a Toaster and flush the add so the toast is mounted. */
  function show(input: Parameters<typeof toast>[0]) {
    render(<Toaster />);
    let id = "";
    act(() => {
      id = toast(input as Parameters<typeof toast>[0]);
    });
    return id;
  }

  const getEl = (slot: string) => {
    const el = document.querySelector<HTMLElement>(`[data-slot='${slot}']`);
    if (!el) {
      throw new Error(`no [data-slot='${slot}']`);
    }
    return el;
  };

  it("close button calls onDismiss only", () => {
    const onDismiss = vi.fn();
    const onAutoClose = vi.fn();
    show({ description: "Closable", onDismiss, onAutoClose });

    fireEvent.click(getEl("toast-close"));

    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(onAutoClose).not.toHaveBeenCalled();
  });

  it("toast.dismiss(id) calls onDismiss only, synchronously", () => {
    const onDismiss = vi.fn();
    const onAutoClose = vi.fn();
    const id = show({ description: "Dismiss me", onDismiss, onAutoClose });

    act(() => {
      toast.dismiss(id);
    });

    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(onAutoClose).not.toHaveBeenCalled();
  });

  it("toast.dismiss() with no id attributes every close to the user", () => {
    const onDismiss = vi.fn();
    const onAutoClose = vi.fn();
    render(<Toaster />);
    act(() => {
      toast({ description: "One", onDismiss, onAutoClose });
      toast({ description: "Two", onDismiss, onAutoClose });
    });

    act(() => {
      toast.dismiss();
    });

    expect(onDismiss).toHaveBeenCalledTimes(2);
    expect(onAutoClose).not.toHaveBeenCalled();
  });

  it("cancel button calls onDismiss only", () => {
    const onDismiss = vi.fn();
    const onAutoClose = vi.fn();
    const onCancel = vi.fn();
    show({
      description: "Cancelable",
      cancel: { label: "Cancel", onClick: onCancel },
      onDismiss,
      onAutoClose,
    });

    fireEvent.click(getEl("toast-cancel"));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(onAutoClose).not.toHaveBeenCalled();
  });

  it("action button runs its handler, then closes as a dismiss", () => {
    const calls: string[] = [];
    show({
      description: "Undoable",
      action: { label: "Undo", onClick: () => calls.push("action") },
      onDismiss: () => calls.push("dismiss"),
      onAutoClose: () => calls.push("auto"),
    });

    fireEvent.click(getEl("toast-action"));

    expect(calls).toEqual(["action", "dismiss"]);
  });

  it("timer expiry calls onAutoClose only", () => {
    const onDismiss = vi.fn();
    const onAutoClose = vi.fn();
    show({ description: "Expiring", duration: 1000, onDismiss, onAutoClose });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(onAutoClose).toHaveBeenCalledTimes(1);
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it("timer expiry falls back to onDismiss when onAutoClose is unset", () => {
    const onDismiss = vi.fn();
    show({ description: "Expiring", duration: 1000, onDismiss });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("closes cleanly with neither callback set", () => {
    const id = show({ description: "No callbacks", duration: 1000 });

    expect(() => {
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      act(() => {
        toast.dismiss(id);
      });
    }).not.toThrow();
  });

  it("a manual close does not leak attribution into a later auto-close", () => {
    const first = vi.fn();
    const onAutoClose = vi.fn();
    const onDismiss = vi.fn();
    const id = show({ description: "First", onDismiss: first });
    act(() => {
      toast.dismiss(id);
    });
    expect(first).toHaveBeenCalledTimes(1);

    act(() => {
      toast({ description: "Second", duration: 1000, onAutoClose, onDismiss });
    });
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(onAutoClose).toHaveBeenCalledTimes(1);
    expect(onDismiss).not.toHaveBeenCalled();
  });
});
