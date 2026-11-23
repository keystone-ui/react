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
import {
  defaultStrings,
  type StringsOverrides,
  StringsProvider,
  useStrings,
} from "./strings";

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

  // Inside mode has no scrolling wrapper, so without its own cap a long
  // modal runs off the bottom of a phone screen with nothing to scroll.
  it("caps and scrolls the popup at the visible viewport when scrollBehavior is inside", async () => {
    render(
      <Modal defaultOpen>
        <ModalContent scrollBehavior="inside">
          <ModalTitle>Inside</ModalTitle>
        </ModalContent>
      </Modal>
    );

    const popup = await screen.findByText("Inside");
    const content = popup.closest("[data-slot='modal-content']");
    expect(content).toHaveClass(
      "max-h-[calc(100dvh-2rem)]",
      "overflow-y-auto",
      "overscroll-contain"
    );
    expect(
      document.querySelector("[data-slot='modal-scroll-wrapper']")
    ).toBeNull();
  });

  it("leaves the popup uncapped when scrollBehavior is outside", async () => {
    renderModal({ defaultOpen: true });

    const popup = await screen.findByText("Modal Title");
    const content = popup.closest("[data-slot='modal-content']");
    expect(content).not.toHaveClass("max-h-[calc(100dvh-2rem)]");
    expect(
      document.querySelector("[data-slot='modal-scroll-wrapper']")
    ).not.toBeNull();
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

// =============================================================================
// ModalContent overlayClassName
// =============================================================================
describe("ModalContent overlayClassName", () => {
  // The overlay's classes on main, for both scrollBehaviors: omitting the
  // prop must leave them byte-identical.
  const DEFAULT_OVERLAY = "fixed inset-0 z-[var(--z-modal,50)] bg-black/50";

  function renderWithOverlay(
    scrollBehavior: "inside" | "outside",
    overlayClassName?: string
  ) {
    render(
      <Modal defaultOpen>
        <ModalContent
          {...(overlayClassName === undefined ? {} : { overlayClassName })}
          scrollBehavior={scrollBehavior}
        >
          <ModalTitle>Title</ModalTitle>
        </ModalContent>
      </Modal>
    );
  }

  async function findOverlay() {
    await screen.findByText("Title");
    const overlay = document.querySelector<HTMLElement>(
      "[data-slot='modal-overlay']"
    );
    expect(overlay).not.toBeNull();
    return overlay as HTMLElement;
  }

  for (const scrollBehavior of ["outside", "inside"] as const) {
    describe(`scrollBehavior="${scrollBehavior}"`, () => {
      it("leaves the overlay classes unchanged when omitted", async () => {
        renderWithOverlay(scrollBehavior);
        const overlay = await findOverlay();
        expect(overlay.getAttribute("class")).toBe(DEFAULT_OVERLAY);
      });

      it("adds the class to the portalled overlay", async () => {
        renderWithOverlay(scrollBehavior, "backdrop-blur-sm");
        const overlay = await findOverlay();
        expect(overlay).toHaveClass("backdrop-blur-sm", "fixed", "inset-0");
        expect(overlay).toHaveAttribute("data-slot", "modal-overlay");
      });

      it("lets a conflicting utility win over the default tint", async () => {
        renderWithOverlay(scrollBehavior, "bg-black/20");
        const overlay = await findOverlay();
        expect(overlay).toHaveClass("bg-black/20");
        expect(overlay).not.toHaveClass("bg-black/50");
      });

      it("carries hidden to the overlay", async () => {
        renderWithOverlay(scrollBehavior, "hidden");
        const overlay = await findOverlay();
        expect(overlay).toHaveClass("hidden");
      });
    });
  }
});

// =============================================================================
// Modal strings (`modal.close`, `modal.footerClose`)
// =============================================================================
describe("Modal strings", () => {
  const CLOSE = "SENTINEL corner close";
  const FOOTER = "SENTINEL footer close";

  /** The corner X (ModalContent) and the footer button (ModalFooter). */
  function ModalWithBothCloses({
    showCloseButton = true,
    showFooterClose = true,
  }: {
    showCloseButton?: boolean;
    showFooterClose?: boolean;
  }) {
    return (
      <Modal defaultOpen>
        <ModalContent showCloseButton={showCloseButton}>
          <ModalTitle>Title</ModalTitle>
          <ModalFooter showCloseButton={showFooterClose}>
            <button type="button">Save</button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  }

  function cornerClose() {
    return document.querySelector<HTMLElement>(
      '[data-slot="modal-content"] > [data-slot="modal-close"]'
    );
  }

  function footerClose() {
    return document.querySelector<HTMLElement>(
      '[data-slot="modal-footer"] > button:first-child'
    );
  }

  it("names both close buttons in English with no provider", async () => {
    render(<ModalWithBothCloses />);

    await waitFor(() => expect(cornerClose()).not.toBeNull());
    expect(cornerClose()).toHaveAccessibleName("Close");
    expect(cornerClose()?.querySelector(".sr-only")).toHaveTextContent("Close");
    expect(footerClose()).toHaveTextContent("Close");
    expect(footerClose()).toHaveAccessibleName("Close");
  });

  it("puts each provider string where it lands", async () => {
    render(
      <StringsProvider
        strings={{ modal: { close: CLOSE, footerClose: FOOTER } }}
      >
        <ModalWithBothCloses />
      </StringsProvider>
    );

    await waitFor(() => expect(cornerClose()).not.toBeNull());
    expect(cornerClose()).toHaveAccessibleName(CLOSE);
    expect(footerClose()).toHaveTextContent(FOOTER);
    expect(footerClose()).toHaveAccessibleName(FOOTER);
    expect(screen.queryByText("Close")).not.toBeInTheDocument();
  });

  it("renders no corner close under a provider when showCloseButton is false", async () => {
    render(
      <StringsProvider
        strings={{ modal: { close: CLOSE, footerClose: FOOTER } }}
      >
        <ModalWithBothCloses showCloseButton={false} />
      </StringsProvider>
    );

    await waitFor(() => expect(footerClose()).not.toBeNull());
    expect(cornerClose()).toBeNull();
    expect(screen.queryByText(CLOSE)).not.toBeInTheDocument();
  });

  it("renders no footer close under a provider unless the footer asks for one", async () => {
    render(
      <StringsProvider
        strings={{ modal: { close: CLOSE, footerClose: FOOTER } }}
      >
        <ModalWithBothCloses showFooterClose={false} />
      </StringsProvider>
    );

    await waitFor(() => expect(cornerClose()).not.toBeNull());
    expect(screen.queryByText(FOOTER)).not.toBeInTheDocument();
    expect(footerClose()).toHaveTextContent("Save");
  });

  it("lets your own ModalClose win over the provider when the built-in one is off", async () => {
    render(
      <StringsProvider
        strings={{ modal: { close: CLOSE, footerClose: FOOTER } }}
      >
        <Modal defaultOpen>
          <ModalContent showCloseButton={false}>
            <ModalTitle>Title</ModalTitle>
            <ModalFooter>
              <ModalClose>Dismiss</ModalClose>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </StringsProvider>
    );

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Dismiss" })
      ).toBeInTheDocument()
    );
    expect(screen.queryByText(CLOSE)).not.toBeInTheDocument();
    expect(screen.queryByText(FOOTER)).not.toBeInTheDocument();
  });

  it("follows a changed parent under a stable inner override", async () => {
    const inner = { modal: { footerClose: FOOTER } };
    function Tree({ outer }: { outer: string }) {
      return (
        <StringsProvider strings={{ modal: { close: outer } }}>
          <StringsProvider strings={inner}>
            <ModalWithBothCloses />
          </StringsProvider>
        </StringsProvider>
      );
    }
    const { rerender } = render(<Tree outer="Fermer" />);
    await waitFor(() => expect(cornerClose()).not.toBeNull());
    expect(cornerClose()).toHaveAccessibleName("Fermer");

    rerender(<Tree outer="Schließen" />);

    expect(cornerClose()).toHaveAccessibleName("Schließen");
    expect(footerClose()).toHaveTextContent(FOOTER);
  });

  it("keeps English for an omitted, an undefined and an explicitly undefined string", async () => {
    render(
      <StringsProvider>
        <StringsProvider strings={undefined}>
          <StringsProvider strings={{ modal: undefined }}>
            <StringsProvider
              strings={{ modal: { close: undefined, footerClose: undefined } }}
            >
              <ModalWithBothCloses />
            </StringsProvider>
          </StringsProvider>
        </StringsProvider>
      </StringsProvider>
    );

    await waitFor(() => expect(cornerClose()).not.toBeNull());
    expect(cornerClose()).toHaveAccessibleName("Close");
    expect(footerClose()).toHaveTextContent("Close");
  });

  it("keeps both close buttons named when a translation file says null", async () => {
    const inner = JSON.parse(
      '{"modal":{"close":null,"footerClose":null}}'
    ) as StringsOverrides;
    render(
      <StringsProvider
        strings={{ modal: { close: CLOSE, footerClose: FOOTER } }}
      >
        <StringsProvider strings={inner}>
          <ModalWithBothCloses />
        </StringsProvider>
      </StringsProvider>
    );

    expect(
      await screen.findByRole("button", { name: CLOSE })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: FOOTER })).toBeInTheDocument();
  });

  it("inherits the parent's string through an explicitly undefined one", async () => {
    render(
      <StringsProvider strings={{ modal: { close: CLOSE } }}>
        <StringsProvider strings={{ modal: { close: undefined } }}>
          <ModalWithBothCloses />
        </StringsProvider>
      </StringsProvider>
    );

    await waitFor(() => expect(cornerClose()).not.toBeNull());
    expect(cornerClose()).toHaveAccessibleName(CLOSE);
  });

  it("keeps an empty string", async () => {
    render(
      <StringsProvider strings={{ modal: { close: "", footerClose: "" } }}>
        <ModalWithBothCloses />
      </StringsProvider>
    );

    await waitFor(() => expect(cornerClose()).not.toBeNull());
    expect(cornerClose()?.querySelector(".sr-only")?.textContent).toBe("");
    expect(footerClose()?.textContent).toBe("");
  });

  it("never freezes or changes the consumer's object or the English", async () => {
    const mine = { modal: { close: CLOSE } };
    let seen: unknown;
    function Reader() {
      seen = useStrings("modal");
      return null;
    }
    render(
      <StringsProvider strings={mine}>
        <Reader />
        <ModalWithBothCloses />
      </StringsProvider>
    );

    await waitFor(() => expect(cornerClose()).not.toBeNull());
    expect(Object.isFrozen(seen)).toBe(true);
    expect(() => {
      (seen as { close: string }).close = "mutated";
    }).toThrow(TypeError);
    expect(Object.isFrozen(mine)).toBe(false);
    expect(Object.isFrozen(mine.modal)).toBe(false);
    expect(mine).toEqual({ modal: { close: CLOSE } });
    expect(defaultStrings.modal).toEqual({
      close: "Close",
      footerClose: "Close",
    });
    expect(() => {
      (defaultStrings.modal as { close: string }).close = "mutated";
    }).toThrow(TypeError);
  });
});
