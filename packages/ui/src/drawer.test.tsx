import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import {
  Drawer,
  DrawerBody,
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

  // The inner content region is the drawer's default scroller, so a plain
  // header/body/footer composition scrolls instead of clipping. It must stay
  // Y-only: `overflow-y: auto` alone promotes the default `overflow-x: visible`
  // to `auto` (CSS Overflow L3), which paints a phantom gutter on macOS "Show
  // scrollbars: Always" AND makes Base UI's findScrollableTouchTarget() report a
  // bogus cross-axis scroll container, swallowing swipe-to-dismiss on diagonal
  // touch drags. Pin the X axis so neither can recur.
  it("makes the inner content region a Y-only scroller", async () => {
    renderDrawer({ defaultOpen: true });

    await waitFor(() => {
      const inner = document.querySelector(
        "[data-slot='drawer-inner-content']"
      );
      expect(inner).toHaveClass(
        "min-h-0",
        "flex-1",
        "overflow-y-auto",
        "overflow-x-hidden",
        "overscroll-contain"
      );
      expect(inner).not.toHaveClass("overflow-hidden");
    });
  });

  it("keeps the header and footer out of the scroll region", async () => {
    renderDrawer({ defaultOpen: true });

    await waitFor(() => {
      expect(document.querySelector("[data-slot='drawer-header']")).toHaveClass(
        "shrink-0"
      );
      expect(document.querySelector("[data-slot='drawer-footer']")).toHaveClass(
        "shrink-0"
      );
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
// DrawerBody
// =============================================================================
describe("DrawerBody", () => {
  function renderBody(className?: string) {
    return render(
      <Drawer defaultOpen>
        <DrawerContent>
          <DrawerTitle>Title</DrawerTitle>
          <DrawerBody className={className}>Body content</DrawerBody>
        </DrawerContent>
      </Drawer>
    );
  }

  it("has data-slot", async () => {
    renderBody();

    await waitFor(() => {
      expect(screen.getByText("Body content")).toHaveAttribute(
        "data-slot",
        "drawer-body"
      );
    });
  });

  it("applies custom className", async () => {
    renderBody("custom-body");

    await waitFor(() => {
      expect(screen.getByText("Body content")).toHaveClass("custom-body");
    });
  });

  // Same CSS Overflow L3 / Base UI cross-axis reasoning as the
  // "makes the inner content region a Y-only scroller" test above.
  it("pins both overflow axes and contains overscroll", async () => {
    renderBody();

    await waitFor(() => {
      expect(screen.getByText("Body content")).toHaveClass(
        "min-h-0",
        "flex-1",
        "overflow-y-auto",
        "overflow-x-hidden",
        "overscroll-contain"
      );
    });
  });

  // Horizontal only — DrawerHeader and DrawerFooter are `p-4`, so vertical
  // padding here would double the gap against them.
  it("ships horizontal padding only", async () => {
    renderBody();

    const body = await waitFor(() => screen.getByText("Body content"));
    expect(body).toHaveClass("px-4");
    expect(body).not.toHaveClass("p-4");
    expect(body).not.toHaveClass("py-4");
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

// =============================================================================
// DrawerContent overlayClassName
// =============================================================================
describe("DrawerContent overlayClassName", () => {
  // The overlay's classes on main: omitting the prop must leave them
  // byte-identical.
  const DEFAULT_OVERLAY = "fixed inset-0 z-(--z-drawer,40) bg-black/50";

  function renderWithOverlay(overlayClassName?: string) {
    render(
      <Drawer defaultOpen>
        <DrawerContent
          {...(overlayClassName === undefined ? {} : { overlayClassName })}
        >
          <DrawerTitle>Title</DrawerTitle>
        </DrawerContent>
      </Drawer>
    );
  }

  async function findOverlay() {
    await screen.findByText("Title");
    const overlay = document.querySelector<HTMLElement>(
      "[data-slot='drawer-overlay']"
    );
    expect(overlay).not.toBeNull();
    return overlay as HTMLElement;
  }

  it("leaves the overlay classes unchanged when omitted", async () => {
    renderWithOverlay();
    const overlay = await findOverlay();
    expect(overlay.getAttribute("class")).toBe(DEFAULT_OVERLAY);
  });

  it("adds the class to the portalled overlay", async () => {
    renderWithOverlay("backdrop-blur-sm");
    const overlay = await findOverlay();
    expect(overlay).toHaveClass("backdrop-blur-sm", "fixed", "inset-0");
    expect(overlay).toHaveAttribute("data-slot", "drawer-overlay");
  });

  it("lets a conflicting utility win over the default tint", async () => {
    renderWithOverlay("bg-black/20");
    const overlay = await findOverlay();
    expect(overlay).toHaveClass("bg-black/20");
    expect(overlay).not.toHaveClass("bg-black/50");
  });

  it("carries hidden to the overlay", async () => {
    renderWithOverlay("hidden");
    const overlay = await findOverlay();
    expect(overlay).toHaveClass("hidden");
  });
});
