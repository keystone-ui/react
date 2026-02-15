import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Toaster, toast } from "./toast";

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

    toast("Title", { description: "Description text" });

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
