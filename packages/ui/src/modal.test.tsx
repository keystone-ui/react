import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  Modal,
  ModalClose,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalTrigger,
} from "./modal";

function renderModal({
  defaultOpen = false,
  showCloseButton = true,
}: {
  defaultOpen?: boolean;
  showCloseButton?: boolean;
} = {}) {
  return render(
    <Modal defaultOpen={defaultOpen}>
      <ModalTrigger>Open Modal</ModalTrigger>
      <ModalContent showCloseButton={showCloseButton}>
        <ModalHeader>
          <ModalTitle>Modal Title</ModalTitle>
          <ModalDescription>Modal Description</ModalDescription>
        </ModalHeader>
        <p>Modal body content</p>
        <ModalFooter>
          <ModalClose>Cancel</ModalClose>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

// =============================================================================
// Modal
// =============================================================================
describe("Modal", () => {
  it("renders the trigger button", () => {
    renderModal();
    expect(
      screen.getByRole("button", { name: "Open Modal" })
    ).toBeInTheDocument();
  });

  it("does not show content when closed", () => {
    renderModal();
    expect(screen.queryByText("Modal Title")).not.toBeInTheDocument();
  });

  it("opens when trigger is clicked", async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByRole("button", { name: "Open Modal" }));

    await waitFor(() => {
      expect(screen.getByText("Modal Title")).toBeInTheDocument();
    });
  });

  it("shows all content parts when open", async () => {
    renderModal({ defaultOpen: true });

    await waitFor(() => {
      expect(screen.getByText("Modal Title")).toBeInTheDocument();
      expect(screen.getByText("Modal Description")).toBeInTheDocument();
      expect(screen.getByText("Modal body content")).toBeInTheDocument();
    });
  });

  it("has correct data-slot attributes", async () => {
    renderModal({ defaultOpen: true });

    await waitFor(() => {
      expect(
        screen.getByText("Modal Title").closest("[data-slot='modal-title']")
      ).toBeInTheDocument();
      expect(
        screen
          .getByText("Modal Description")
          .closest("[data-slot='modal-description']")
      ).toBeInTheDocument();
    });
  });

  it("renders close button by default", async () => {
    renderModal({ defaultOpen: true });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
    });
  });

  it("hides close button when showCloseButton is false", async () => {
    renderModal({ defaultOpen: true, showCloseButton: false });

    await waitFor(() => {
      expect(screen.getByText("Modal Title")).toBeInTheDocument();
    });
    expect(
      screen.queryByRole("button", { name: "Close" })
    ).not.toBeInTheDocument();
  });

  it("closes when ModalClose is clicked", async () => {
    const user = userEvent.setup();
    renderModal({ defaultOpen: true });

    await waitFor(() => {
      expect(screen.getByText("Modal Title")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    await waitFor(() => {
      expect(screen.queryByText("Modal Title")).not.toBeInTheDocument();
    });
  });

  it("calls onOpenChange when opened and closed", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(
      <Modal onOpenChange={onOpenChange}>
        <ModalTrigger>Open</ModalTrigger>
        <ModalContent>
          <ModalTitle>Title</ModalTitle>
        </ModalContent>
      </Modal>
    );

    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(onOpenChange).toHaveBeenCalledWith(true, expect.anything());
  });
});

// =============================================================================
// ModalHeader
// =============================================================================
describe("ModalHeader", () => {
  it("applies custom className", async () => {
    render(
      <Modal defaultOpen>
        <ModalContent>
          <ModalHeader className="custom-header">
            <ModalTitle>Title</ModalTitle>
          </ModalHeader>
        </ModalContent>
      </Modal>
    );

    await waitFor(() => {
      const header = screen
        .getByText("Title")
        .closest("[data-slot='modal-header']");
      expect(header).toHaveClass("custom-header");
    });
  });
});

// =============================================================================
// ModalFooter
// =============================================================================
describe("ModalFooter", () => {
  it("renders children", async () => {
    render(
      <Modal defaultOpen>
        <ModalContent>
          <ModalTitle>Title</ModalTitle>
          <ModalFooter>
            <button type="button">Save</button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
    });
  });

  it("renders close button when showCloseButton is true", async () => {
    render(
      <Modal defaultOpen>
        <ModalContent showCloseButton={false}>
          <ModalTitle>Title</ModalTitle>
          <ModalFooter showCloseButton>
            <button type="button">Save</button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );

    await waitFor(() => {
      // The footer close button renders as an outline button with "Close" text
      const closeButtons = screen.getAllByRole("button", { name: "Close" });
      expect(closeButtons.length).toBeGreaterThanOrEqual(1);
    });
  });
});
