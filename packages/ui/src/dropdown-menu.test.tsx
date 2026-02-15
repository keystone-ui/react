import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "./dropdown-menu";

function renderMenu({ defaultOpen = false } = {}) {
  return render(
    <DropdownMenu defaultOpen={defaultOpen}>
      <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem>Edit</DropdownMenuItem>
          <DropdownMenuItem>Delete</DropdownMenuItem>
          <DropdownMenuItem disabled>Disabled</DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// =============================================================================
// DropdownMenu
// =============================================================================
describe("DropdownMenu", () => {
  it("renders the trigger button", () => {
    renderMenu();
    expect(screen.getByText("Open Menu")).toBeInTheDocument();
  });

  it("has data-slot on trigger", () => {
    renderMenu();
    expect(screen.getByText("Open Menu")).toHaveAttribute(
      "data-slot",
      "dropdown-menu-trigger"
    );
  });

  it("does not show menu items when closed", () => {
    renderMenu();
    expect(screen.queryByText("Edit")).not.toBeInTheDocument();
  });

  it("opens when trigger is clicked", async () => {
    const user = userEvent.setup();
    renderMenu();

    await user.click(screen.getByText("Open Menu"));

    await waitFor(() => {
      expect(screen.getByText("Edit")).toBeInTheDocument();
    });
  });

  it("shows all menu items when open", async () => {
    renderMenu({ defaultOpen: true });

    await waitFor(() => {
      expect(screen.getByText("Actions")).toBeInTheDocument();
      expect(screen.getByText("Edit")).toBeInTheDocument();
      expect(screen.getByText("Delete")).toBeInTheDocument();
      expect(screen.getByText("Disabled")).toBeInTheDocument();
    });
  });

  it("renders disabled items correctly", async () => {
    renderMenu({ defaultOpen: true });

    await waitFor(() => {
      const disabled = screen.getByText("Disabled");
      expect(disabled.closest("[data-disabled]")).toBeInTheDocument();
    });
  });

  it("has data-slot attributes on items", async () => {
    renderMenu({ defaultOpen: true });

    await waitFor(() => {
      expect(
        screen.getByText("Edit").closest("[data-slot='dropdown-menu-item']")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Actions").closest("[data-slot='dropdown-menu-label']")
      ).toBeInTheDocument();
    });
  });

  it("fires item onClick when clicked", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={onClick}>Action</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    await waitFor(() => {
      expect(screen.getByText("Action")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Action"));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
