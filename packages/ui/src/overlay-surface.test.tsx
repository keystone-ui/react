/**
 * Every floating surface paints with the popover surface, never the page.
 *
 * `--background` is the page. A surface that floats above it — a menu, a
 * popover, a modal, a drawer — paints with `--popover`, which every shipped
 * theme sets one step above the page in dark mode. Modal, AlertDialog and
 * Drawer used `bg-background` until this test existed: in dark mode a modal
 * was the page's own colour over a page dimmed to nearly the same black, and
 * its edge all but disappeared. Light mode hid the bug, because there both
 * tokens are white.
 *
 * Declaration assertions, as in `control-ladder.test.tsx`: jsdom runs without
 * CSS, so this checks the classes each surface carries, not the pixels.
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
} from "./alert-dialog";
import { Drawer, DrawerContent, DrawerTitle } from "./drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
} from "./dropdown-menu";
import { Modal, ModalContent, ModalTitle } from "./modal";
import { Popover, PopoverContent } from "./popover";

const SURFACES = [
  {
    name: "Modal",
    node: (
      <Modal open>
        <ModalContent>
          <ModalTitle>Title</ModalTitle>
        </ModalContent>
      </Modal>
    ),
    ring: true,
    slot: "modal-content",
  },
  {
    name: "AlertDialog",
    node: (
      <AlertDialog open>
        <AlertDialogContent>
          <AlertDialogTitle>Title</AlertDialogTitle>
        </AlertDialogContent>
      </AlertDialog>
    ),
    ring: true,
    slot: "alert-dialog-content",
  },
  {
    // An edge sheet draws its own inner-edge border, so it takes the surface
    // without the all-round ring — a ring would double that edge.
    name: "Drawer",
    node: (
      <Drawer open>
        <DrawerContent>
          <DrawerTitle>Title</DrawerTitle>
        </DrawerContent>
      </Drawer>
    ),
    ring: false,
    slot: "drawer-content",
  },
  {
    name: "Popover",
    node: (
      <Popover open>
        <PopoverContent>Body</PopoverContent>
      </Popover>
    ),
    ring: true,
    slot: "popover-content",
  },
  {
    name: "DropdownMenu",
    node: (
      <DropdownMenu open>
        <DropdownMenuContent>
          <DropdownMenuItem>Item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
    ring: true,
    slot: "dropdown-menu-content",
  },
] as const;

describe("floating surfaces", () => {
  for (const surface of SURFACES) {
    it(`${surface.name} paints with the popover surface`, async () => {
      render(surface.node);
      const element = await screen.findByText(
        (_, node) => node?.getAttribute("data-slot") === surface.slot
      );

      expect(element).toHaveClass("bg-popover", "text-popover-foreground");
      expect(element).not.toHaveClass("bg-background");
      if (surface.ring) {
        expect(element).toHaveClass("ring-1", "ring-popup-ring");
      }
    });
  }
});
