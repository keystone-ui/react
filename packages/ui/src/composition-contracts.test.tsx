/**
 * Nestings Base UI rejects at runtime.
 *
 * The docs' Composition trees are the map agents compose from (shadcn added
 * the same trees in April 2026 for the same reason), and a wrong tree is
 * worse than none: Dropdown Menu's showed `DropdownMenuLabel` directly under
 * the content, which throws. These pin the contract the trees and the
 * "Invalid nesting" notes describe, so a Base UI upgrade that relaxes or
 * tightens it shows up here — and `composition-trees.test.ts` in apps/docs
 * checks every tree against the same rules.
 */

import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";

import { Combobox, ComboboxContent, ComboboxLabel } from "./combobox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
} from "./dropdown-menu";
import { Select, SelectContent, SelectGroup, SelectLabel } from "./select";

const MENU_GROUP_MISSING = /MenuGroupContext is missing/;
const SELECT_GROUP_MISSING = /SelectGroupContext is missing/;
const COMBOBOX_GROUP_MISSING = /ComboboxGroupContext is missing/;

function renderError(ui: ReactElement): string | null {
  // React logs the thrown error before rethrowing; keep the output clean.
  const spy = vi.spyOn(console, "error").mockImplementation(() => undefined);
  try {
    render(ui);
    return null;
  } catch (error) {
    return (error as Error).message;
  } finally {
    spy.mockRestore();
  }
}

describe("group labels need their group", () => {
  it("DropdownMenuLabel throws outside DropdownMenuGroup", () => {
    expect(
      renderError(
        <DropdownMenu open>
          <DropdownMenuContent>
            <DropdownMenuLabel>Account</DropdownMenuLabel>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    ).toMatch(MENU_GROUP_MISSING);
  });

  it("DropdownMenuLabel renders inside DropdownMenuGroup", () => {
    expect(
      renderError(
        <DropdownMenu open>
          <DropdownMenuContent>
            <DropdownMenuGroup>
              <DropdownMenuLabel>Account</DropdownMenuLabel>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    ).toBeNull();
  });

  it("SelectLabel throws outside SelectGroup", () => {
    expect(
      renderError(
        <Select open>
          <SelectContent>
            <SelectLabel>Fruits</SelectLabel>
          </SelectContent>
        </Select>
      )
    ).toMatch(SELECT_GROUP_MISSING);
  });

  it("SelectLabel renders inside SelectGroup", () => {
    expect(
      renderError(
        <Select open>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Fruits</SelectLabel>
            </SelectGroup>
          </SelectContent>
        </Select>
      )
    ).toBeNull();
  });

  it("ComboboxLabel throws outside ComboboxGroup", () => {
    expect(
      renderError(
        <Combobox open>
          <ComboboxContent>
            <ComboboxLabel>Fruits</ComboboxLabel>
          </ComboboxContent>
        </Combobox>
      )
    ).toMatch(COMBOBOX_GROUP_MISSING);
  });
});
