import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./alert-dialog";
import { Button } from "./button";

// =============================================================================
// Helper: Basic AlertDialog
// =============================================================================
const BasicAlertDialog = ({
  open,
  onOpenChange,
  size,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  size?: "default" | "sm";
}) => (
  <AlertDialog open={open} onOpenChange={onOpenChange}>
    <AlertDialogTrigger render={<Button variant="outline" />}>
      Open
    </AlertDialogTrigger>
    <AlertDialogContent size={size}>
      <AlertDialogHeader>
        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
        <AlertDialogDescription>
          This action cannot be undone.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction>Continue</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

// =============================================================================
// AlertDialog
// =============================================================================
describe("AlertDialog", () => {
  test("renders trigger button", () => {
    render(<BasicAlertDialog />);
    expect(screen.getByRole("button", { name: "Open" })).toBeInTheDocument();
  });

  test("opens when trigger is clicked", async () => {
    const user = userEvent.setup();
    render(<BasicAlertDialog />);

    await user.click(screen.getByRole("button", { name: "Open" }));

    await waitFor(() => {
      expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    });
  });

  test("has alertdialog ARIA role", async () => {
    const user = userEvent.setup();
    render(<BasicAlertDialog />);

    await user.click(screen.getByRole("button", { name: "Open" }));

    await waitFor(() => {
      const dialog = screen.getByRole("alertdialog");
      expect(dialog).toBeInTheDocument();
    });
  });

  test("displays title and description", async () => {
    const user = userEvent.setup();
    render(<BasicAlertDialog />);

    await user.click(screen.getByRole("button", { name: "Open" }));

    await waitFor(() => {
      expect(screen.getByText("Are you sure?")).toBeInTheDocument();
      expect(
        screen.getByText("This action cannot be undone.")
      ).toBeInTheDocument();
    });
  });

  test("displays action and cancel buttons", async () => {
    const user = userEvent.setup();
    render(<BasicAlertDialog />);

    await user.click(screen.getByRole("button", { name: "Open" }));

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Cancel" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Continue" })
      ).toBeInTheDocument();
    });
  });

  test("closes when cancel is clicked", async () => {
    const user = userEvent.setup();
    render(<BasicAlertDialog />);

    await user.click(screen.getByRole("button", { name: "Open" }));

    await waitFor(() => {
      expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    await waitFor(() => {
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    });
  });

  test("calls onOpenChange when cancel is clicked", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<BasicAlertDialog open onOpenChange={onOpenChange} />);

    await waitFor(() => {
      expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onOpenChange).toHaveBeenCalledWith(false, expect.anything());
  });

  test("supports controlled open state", async () => {
    const { rerender } = render(<BasicAlertDialog open={false} />);
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();

    rerender(<BasicAlertDialog open={true} />);

    await waitFor(() => {
      expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    });
  });
});

// =============================================================================
// AlertDialogContent
// =============================================================================
describe("AlertDialogContent", () => {
  test("has data-slot attribute", async () => {
    const user = userEvent.setup();
    render(<BasicAlertDialog />);

    await user.click(screen.getByRole("button", { name: "Open" }));

    await waitFor(() => {
      expect(screen.getByRole("alertdialog")).toHaveAttribute(
        "data-slot",
        "alert-dialog-content"
      );
    });
  });

  test("applies default size", async () => {
    const user = userEvent.setup();
    render(<BasicAlertDialog />);

    await user.click(screen.getByRole("button", { name: "Open" }));

    await waitFor(() => {
      expect(screen.getByRole("alertdialog")).toHaveAttribute(
        "data-size",
        "default"
      );
    });
  });

  test("applies sm size", async () => {
    const user = userEvent.setup();
    render(<BasicAlertDialog size="sm" />);

    await user.click(screen.getByRole("button", { name: "Open" }));

    await waitFor(() => {
      expect(screen.getByRole("alertdialog")).toHaveAttribute(
        "data-size",
        "sm"
      );
    });
  });
});

// =============================================================================
// AlertDialogHeader
// =============================================================================
describe("AlertDialogHeader", () => {
  test("has data-slot attribute", async () => {
    const user = userEvent.setup();
    render(<BasicAlertDialog />);

    await user.click(screen.getByRole("button", { name: "Open" }));

    await waitFor(() => {
      const header = screen
        .getByRole("alertdialog")
        .querySelector('[data-slot="alert-dialog-header"]');
      expect(header).toBeInTheDocument();
    });
  });
});

// =============================================================================
// AlertDialogFooter
// =============================================================================
describe("AlertDialogFooter", () => {
  test("has data-slot attribute", async () => {
    const user = userEvent.setup();
    render(<BasicAlertDialog />);

    await user.click(screen.getByRole("button", { name: "Open" }));

    await waitFor(() => {
      const footer = screen
        .getByRole("alertdialog")
        .querySelector('[data-slot="alert-dialog-footer"]');
      expect(footer).toBeInTheDocument();
    });
  });
});

// =============================================================================
// AlertDialogMedia
// =============================================================================
describe("AlertDialogMedia", () => {
  test("renders media element", async () => {
    const user = userEvent.setup();
    render(
      <AlertDialog>
        <AlertDialogTrigger render={<Button variant="outline" />}>
          Open
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia data-testid="media">
              <svg data-testid="icon" />
            </AlertDialogMedia>
            <AlertDialogTitle>Title</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );

    await user.click(screen.getByRole("button", { name: "Open" }));

    await waitFor(() => {
      const media = screen.getByTestId("media");
      expect(media).toBeInTheDocument();
      expect(media).toHaveAttribute("data-slot", "alert-dialog-media");
      expect(screen.getByTestId("icon")).toBeInTheDocument();
    });
  });

  test("applies custom className", async () => {
    const user = userEvent.setup();
    render(
      <AlertDialog>
        <AlertDialogTrigger render={<Button variant="outline" />}>
          Open
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia data-testid="media" className="custom-media">
              <svg />
            </AlertDialogMedia>
            <AlertDialogTitle>Title</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );

    await user.click(screen.getByRole("button", { name: "Open" }));

    await waitFor(() => {
      expect(screen.getByTestId("media")).toHaveClass("custom-media");
    });
  });
});

// =============================================================================
// AlertDialogTitle
// =============================================================================
describe("AlertDialogTitle", () => {
  test("has data-slot attribute", async () => {
    const user = userEvent.setup();
    render(<BasicAlertDialog />);

    await user.click(screen.getByRole("button", { name: "Open" }));

    await waitFor(() => {
      const title = screen
        .getByRole("alertdialog")
        .querySelector('[data-slot="alert-dialog-title"]');
      expect(title).toBeInTheDocument();
      expect(title).toHaveTextContent("Are you sure?");
    });
  });
});

// =============================================================================
// AlertDialogDescription
// =============================================================================
describe("AlertDialogDescription", () => {
  test("has data-slot attribute", async () => {
    const user = userEvent.setup();
    render(<BasicAlertDialog />);

    await user.click(screen.getByRole("button", { name: "Open" }));

    await waitFor(() => {
      const description = screen
        .getByRole("alertdialog")
        .querySelector('[data-slot="alert-dialog-description"]');
      expect(description).toBeInTheDocument();
      expect(description).toHaveTextContent("This action cannot be undone.");
    });
  });
});

// =============================================================================
// AlertDialogAction
// =============================================================================
describe("AlertDialogAction", () => {
  test("has data-slot attribute", async () => {
    const user = userEvent.setup();
    render(<BasicAlertDialog />);

    await user.click(screen.getByRole("button", { name: "Open" }));

    await waitFor(() => {
      const action = screen.getByRole("button", { name: "Continue" });
      expect(action).toHaveAttribute("data-slot", "alert-dialog-action");
    });
  });

  test("calls onClick handler", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(
      <AlertDialog>
        <AlertDialogTrigger render={<Button variant="outline" />}>
          Open
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Title</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClick}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );

    await user.click(screen.getByRole("button", { name: "Open" }));

    await waitFor(() => {
      expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Confirm" }));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test("supports variant prop", async () => {
    const user = userEvent.setup();
    render(
      <AlertDialog>
        <AlertDialogTrigger render={<Button variant="outline" />}>
          Open
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" data-testid="action">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );

    await user.click(screen.getByRole("button", { name: "Open" }));

    await waitFor(() => {
      const action = screen.getByTestId("action");
      expect(action).toHaveAttribute("data-slot", "alert-dialog-action");
      expect(action).toBeInTheDocument();
    });
  });
});

// =============================================================================
// AlertDialogCancel
// =============================================================================
describe("AlertDialogCancel", () => {
  test("has data-slot attribute", async () => {
    const user = userEvent.setup();
    render(<BasicAlertDialog />);

    await user.click(screen.getByRole("button", { name: "Open" }));

    await waitFor(() => {
      const cancel = screen.getByRole("button", { name: "Cancel" });
      expect(cancel).toHaveAttribute("data-slot", "alert-dialog-cancel");
    });
  });

  test("closes dialog when clicked", async () => {
    const user = userEvent.setup();
    render(<BasicAlertDialog />);

    await user.click(screen.getByRole("button", { name: "Open" }));

    await waitFor(() => {
      expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    await waitFor(() => {
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    });
  });
});
