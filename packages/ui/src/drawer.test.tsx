import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./drawer";

function renderDrawer({ defaultOpen = false } = {}) {
  return render(
    <Drawer defaultOpen={defaultOpen}>
      <DrawerTrigger>Open Drawer</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Drawer Title</DrawerTitle>
          <DrawerDescription>Drawer Description</DrawerDescription>
        </DrawerHeader>
        <p>Drawer body content</p>
        <DrawerFooter>
          <DrawerClose>Cancel</DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

// =============================================================================
// Drawer
// =============================================================================
describe("Drawer", () => {
  it("renders the trigger button", () => {
    renderDrawer();
    expect(screen.getByText("Open Drawer")).toBeInTheDocument();
  });

  it("has data-slot on trigger", () => {
    renderDrawer();
    expect(screen.getByText("Open Drawer")).toHaveAttribute(
      "data-slot",
      "drawer-trigger"
    );
  });

  it("does not show content when closed", () => {
    renderDrawer();
    expect(screen.queryByText("Drawer Title")).not.toBeInTheDocument();
  });

  it("opens when trigger is clicked", async () => {
    const user = userEvent.setup();
    renderDrawer();

    await user.click(screen.getByText("Open Drawer"));

    await waitFor(() => {
      expect(screen.getByText("Drawer Title")).toBeInTheDocument();
    });
  });

  it("shows all content parts when open", async () => {
    renderDrawer({ defaultOpen: true });

    await waitFor(() => {
      expect(screen.getByText("Drawer Title")).toBeInTheDocument();
      expect(screen.getByText("Drawer Description")).toBeInTheDocument();
      expect(screen.getByText("Drawer body content")).toBeInTheDocument();
    });
  });

  it("has data-slot attributes on content parts", async () => {
    renderDrawer({ defaultOpen: true });

    await waitFor(() => {
      expect(
        screen.getByText("Drawer Title").closest("[data-slot='drawer-title']")
      ).toBeInTheDocument();
      expect(
        screen
          .getByText("Drawer Description")
          .closest("[data-slot='drawer-description']")
      ).toBeInTheDocument();
    });
  });

  it("closes when DrawerClose is clicked", async () => {
    const user = userEvent.setup();
    renderDrawer({ defaultOpen: true });

    await waitFor(() => {
      expect(screen.getByText("Drawer Title")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Cancel"));

    await waitFor(() => {
      expect(screen.queryByText("Drawer Title")).not.toBeInTheDocument();
    });
  });
});

// =============================================================================
// DrawerHeader
// =============================================================================
describe("DrawerHeader", () => {
  it("applies custom className", async () => {
    render(
      <Drawer defaultOpen>
        <DrawerContent>
          <DrawerHeader className="custom-header">
            <DrawerTitle>Title</DrawerTitle>
          </DrawerHeader>
        </DrawerContent>
      </Drawer>
    );

    await waitFor(() => {
      const header = screen
        .getByText("Title")
        .closest("[data-slot='drawer-header']");
      expect(header).toHaveClass("custom-header");
    });
  });
});

// =============================================================================
// DrawerFooter
// =============================================================================
describe("DrawerFooter", () => {
  it("renders children", async () => {
    render(
      <Drawer defaultOpen>
        <DrawerContent>
          <DrawerTitle>Title</DrawerTitle>
          <DrawerFooter>
            <button type="button">Save</button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
    });
  });

  it("applies custom className", async () => {
    render(
      <Drawer defaultOpen>
        <DrawerContent>
          <DrawerTitle>Title</DrawerTitle>
          <DrawerFooter className="custom-footer">
            <button type="button">Save</button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );

    await waitFor(() => {
      const footer = screen
        .getByRole("button", { name: "Save" })
        .closest("[data-slot='drawer-footer']");
      expect(footer).toHaveClass("custom-footer");
    });
  });
});
