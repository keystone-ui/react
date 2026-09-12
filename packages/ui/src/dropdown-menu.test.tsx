import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Button } from "./button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
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

// =============================================================================
// Close-on-click
// =============================================================================
// Base UI defaults `closeOnClick` to false for BOTH checkbox and radio items.
// Keystone re-defaults radio items to true and leaves checkbox items alone, so
// these tests pin the asymmetry -- a menu left open after a single-select pick
// keeps an inert backdrop over the page and swallows the next click.
/**
 * `render` merges the trigger's props over the rendered element's, and that
 * includes `data-slot`. The composition rules tell consumers that "every
 * exported component part has a `data-slot` attribute; use it for consumer
 * overrides" — true of a component used directly, and false of one used as a
 * trigger, which is the library's own recommended idiom over `asChild`.
 *
 * Pinned as a fact so the documented caveat cannot quietly stop being true.
 */
describe("a component rendered as a trigger", () => {
  it("carries the trigger's slot, not its own", () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button />}>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    const trigger = screen.getByRole("button", { name: "Open" });

    expect(trigger).toHaveAttribute("data-slot", "dropdown-menu-trigger");
    // So `[data-slot="button"] { … }` does not reach it.
    expect(trigger).not.toHaveAttribute("data-slot", "button");
  });
});

describe("DropdownMenu close-on-click", () => {
  function renderRadioMenu(props?: { closeOnClick?: boolean }) {
    return render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuRadioGroup value="all">
            <DropdownMenuRadioItem value="all" {...props}>
              All roles
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="admin" {...props}>
              Admin
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  it("closes the menu when a radio item is picked", async () => {
    const user = userEvent.setup();
    renderRadioMenu();

    await waitFor(() => {
      expect(screen.getByText("Admin")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Admin"));

    await waitFor(() => {
      expect(screen.queryByText("Admin")).not.toBeInTheDocument();
    });
  });

  it("keeps the menu open when a radio item opts out", async () => {
    const user = userEvent.setup();
    renderRadioMenu({ closeOnClick: false });

    await waitFor(() => {
      expect(screen.getByText("Admin")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Admin"));

    expect(screen.getByText("Admin")).toBeInTheDocument();
  });

  it("still reports the picked value", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuRadioGroup onValueChange={onValueChange} value="all">
            <DropdownMenuRadioItem value="admin">Admin</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    await waitFor(() => {
      expect(screen.getByText("Admin")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Admin"));
    expect(onValueChange).toHaveBeenCalledWith("admin", expect.anything());
  });

  it("keeps checkbox items open, so a group can be toggled in one visit", async () => {
    const user = userEvent.setup();

    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuCheckboxItem checked={false}>
            Status
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem checked={false}>
            Assignee
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    await waitFor(() => {
      expect(screen.getByText("Status")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Status"));

    expect(screen.getByText("Assignee")).toBeInTheDocument();
  });
});
