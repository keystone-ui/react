import { readFileSync } from "node:fs";
import { join } from "node:path";
import { format } from "node:util";
import { createContext, runInContext } from "node:vm";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type * as React from "react";
import { createRef } from "react";
import ts from "typescript";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { Button, buttonVariants } from "./button";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationFirst,
  PaginationItem,
  PaginationLast,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./pagination";
import { cn } from "./utils";

// React reports an unknown DOM prop only once per prop name, the first time
// any test in this file renders it, and Base UI logs each message once. So
// every console error is recorded from `beforeAll` (before the first test)
// on, a test that expects one takes it off the record (`takeConsoleErrors`),
// and after the last test the record must be empty.
const consoleErrors: string[] = [];
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    consoleErrors.push(format(...args));
    originalConsoleError(...args);
  };
});
afterAll(() => {
  console.error = originalConsoleError;
  expect(consoleErrors).toEqual([]);
});

/** Takes the console errors logged since `from` off the record. */
const takeConsoleErrors = (from: number) => consoleErrors.splice(from);

/** The development error for an HTML label on a control without `href`. */
const HTML_LABEL_ERROR =
  "Pagination: a page control without `href` does not take `dangerouslySetInnerHTML`. Pass the label as children, or give the control an `href`.";

// =============================================================================
// Pagination
// =============================================================================
describe("Pagination", () => {
  it("renders a nav element", () => {
    render(<Pagination />);
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });

  it("has data-slot attribute", () => {
    render(<Pagination />);
    expect(screen.getByRole("navigation")).toHaveAttribute(
      "data-slot",
      "pagination"
    );
  });

  it("has aria-label for accessibility", () => {
    render(<Pagination />);
    expect(screen.getByRole("navigation")).toHaveAttribute(
      "aria-label",
      "pagination"
    );
  });

  it("applies custom className", () => {
    render(<Pagination className="custom-class" />);
    expect(screen.getByRole("navigation")).toHaveClass("custom-class");
  });
});

// =============================================================================
// PaginationContent
// =============================================================================
describe("PaginationContent", () => {
  it("renders a ul element", () => {
    render(
      <Pagination>
        <PaginationContent data-testid="content" />
      </Pagination>
    );
    expect(screen.getByTestId("content").tagName).toBe("UL");
  });

  it("has data-slot attribute", () => {
    render(
      <Pagination>
        <PaginationContent data-testid="content" />
      </Pagination>
    );
    expect(screen.getByTestId("content")).toHaveAttribute(
      "data-slot",
      "pagination-content"
    );
  });

  it("applies custom className", () => {
    render(
      <Pagination>
        <PaginationContent className="custom-class" data-testid="content" />
      </Pagination>
    );
    expect(screen.getByTestId("content")).toHaveClass("custom-class");
  });
});

// =============================================================================
// PaginationItem
// =============================================================================
describe("PaginationItem", () => {
  it("renders a li element", () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem data-testid="item" />
        </PaginationContent>
      </Pagination>
    );
    expect(screen.getByTestId("item").tagName).toBe("LI");
  });

  it("has data-slot attribute", () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem data-testid="item" />
        </PaginationContent>
      </Pagination>
    );
    expect(screen.getByTestId("item")).toHaveAttribute(
      "data-slot",
      "pagination-item"
    );
  });
});

// =============================================================================
// PaginationLink
// =============================================================================
describe("PaginationLink", () => {
  it("renders with children content", () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink>1</PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("has data-slot attribute on the button without a URL", () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink>1</PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
    const link = screen.getByText("1").closest("[data-slot='pagination-link']");
    expect(link).toBeInTheDocument();
  });

  it("sets aria-current when isActive is true", () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink isActive>1</PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
    const link = screen.getByText("1").closest("[data-slot='pagination-link']");
    expect(link).toHaveAttribute("aria-current", "page");
  });

  it("does not set aria-current when isActive is false", () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink>1</PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
    const link = screen.getByText("1").closest("[data-slot='pagination-link']");
    expect(link).not.toHaveAttribute("aria-current");
  });

  it("applies custom className", () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink className="custom-class" href="#">
              1
            </PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
    const link = screen.getByRole("link", { name: "1" });
    expect(link).toHaveClass("custom-class");
  });
});

// =============================================================================
// PaginationPrevious
// =============================================================================
describe("PaginationPrevious", () => {
  it("renders with default text", () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
    expect(screen.getByText("Previous")).toBeInTheDocument();
  });

  it("renders with custom text", () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious text="Back" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
    expect(screen.getByText("Back")).toBeInTheDocument();
  });

  it("has aria-label for accessibility", () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
    const link = screen
      .getByText("Previous")
      .closest("[aria-label='Go to previous page']");
    expect(link).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious className="custom-class" href="#" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
    const link = screen.getByRole("link", { name: "Go to previous page" });
    expect(link).toHaveClass("custom-class");
  });
});

// =============================================================================
// PaginationNext
// =============================================================================
describe("PaginationNext", () => {
  it("renders with default text", () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationNext />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
    expect(screen.getByText("Next")).toBeInTheDocument();
  });

  it("renders with custom text", () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationNext text="Forward" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
    expect(screen.getByText("Forward")).toBeInTheDocument();
  });

  it("has aria-label for accessibility", () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationNext />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
    const link = screen
      .getByText("Next")
      .closest("[aria-label='Go to next page']");
    expect(link).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationNext className="custom-class" href="#" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
    const link = screen.getByRole("link", { name: "Go to next page" });
    expect(link).toHaveClass("custom-class");
  });
});

// =============================================================================
// PaginationFirst
// =============================================================================
describe("PaginationFirst", () => {
  it("renders a link when given href", () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationFirst href="#" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
    expect(
      screen.getByRole("link", { name: "Go to first page" })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Go to first page" })
    ).toBeNull();
  });

  it("has aria-label for accessibility", () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationFirst />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
    const button = screen.getByRole("button", { name: "Go to first page" });
    expect(button.tagName).toBe("BUTTON");
  });
});

// =============================================================================
// PaginationLast
// =============================================================================
describe("PaginationLast", () => {
  it("renders a link when given href", () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLast href="#" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
    expect(
      screen.getByRole("link", { name: "Go to last page" })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Go to last page" })
    ).toBeNull();
  });

  it("has aria-label for accessibility", () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLast />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
    const button = screen.getByRole("button", { name: "Go to last page" });
    expect(button.tagName).toBe("BUTTON");
  });
});

// =============================================================================
// Link or button: `href` decides the element and its role
// =============================================================================
const noop = () => undefined;

const renderInList = (ui: React.ReactNode) =>
  render(
    <Pagination>
      <PaginationContent>
        <PaginationItem>{ui}</PaginationItem>
      </PaginationContent>
    </Pagination>
  );

describe("PaginationLink with href", () => {
  it("is a link, not a button, with no tabindex", () => {
    renderInList(<PaginationLink href="?page=2">2</PaginationLink>);
    const link = screen.getByRole("link", { name: "2" });
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("href", "?page=2");
    expect(link).not.toHaveAttribute("role");
    expect(link).not.toHaveAttribute("tabindex");
    expect(screen.queryByRole("button", { name: "2" })).toBeNull();
  });

  it("keeps aria-current and data-active when active", () => {
    renderInList(
      <PaginationLink href="?page=3" isActive>
        3
      </PaginationLink>
    );
    const link = screen.getByRole("link", { name: "3" });
    expect(link).toHaveAttribute("aria-current", "page");
    expect(link).toHaveAttribute("data-active", "true");
  });

  it("has data-slot pagination-link", () => {
    renderInList(<PaginationLink href="?page=2">2</PaginationLink>);
    expect(screen.getByRole("link", { name: "2" })).toHaveAttribute(
      "data-slot",
      "pagination-link"
    );
  });

  it("makes PaginationPrevious and PaginationNext links", () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="?page=1" />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="?page=3" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
    expect(
      screen.getByRole("link", { name: "Go to previous page" })
    ).toHaveAttribute("href", "?page=1");
    expect(
      screen.getByRole("link", { name: "Go to next page" })
    ).toHaveAttribute("href", "?page=3");
    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });
});

describe("PaginationLink without href", () => {
  it("is a native button of type button", () => {
    renderInList(<PaginationPrevious onClick={noop} />);
    const button = screen.getByRole("button", { name: "Go to previous page" });
    expect(button.tagName).toBe("BUTTON");
    expect(button).toHaveAttribute("type", "button");
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("has data-slot pagination-link and keeps aria-current when active", () => {
    renderInList(
      <PaginationLink isActive onClick={noop}>
        4
      </PaginationLink>
    );
    const button = screen.getByRole("button", { name: "4" });
    expect(button.tagName).toBe("BUTTON");
    expect(button).toHaveAttribute("data-slot", "pagination-link");
    expect(button).toHaveAttribute("aria-current", "page");
    expect(button).toHaveAttribute("data-active", "true");
  });

  it("runs onClick on Enter and on Space", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    renderInList(<PaginationPrevious onClick={onClick} />);
    const button = screen.getByRole("button", { name: "Go to previous page" });
    expect(button.tagName).toBe("BUTTON");
    button.focus();
    await user.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledTimes(1);
    await user.keyboard(" ");
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it("does not submit an enclosing form", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <PaginationNext onClick={noop} />
      </form>
    );
    await user.click(screen.getByRole("button", { name: "Go to next page" }));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("runs a control through Base UI, with its ref", async () => {
    const user = userEvent.setup();
    const seen: unknown[] = [];
    const ref = createRef<HTMLButtonElement>();
    const onClick = (event: unknown) => {
      seen.push(
        typeof (event as { preventBaseUIHandler?: unknown })
          .preventBaseUIHandler
      );
    };
    renderInList(
      <PaginationLink onClick={onClick} ref={ref}>
        4
      </PaginationLink>
    );
    const button = screen.getByRole("button", { name: "4" });
    await user.click(button);
    expect(seen).toEqual(["function"]);
    expect(ref.current).toBe(button);
  });

  it("keeps a disabled control disabled for Button and Base UI", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    // `disabled` is not in the pagination props type; consumers pass it
    // untyped, and it reached Button before.
    const disabled = { disabled: true };
    renderInList(
      <PaginationLink {...disabled} onClick={onClick}>
        4
      </PaginationLink>
    );
    const control = screen.getByRole("button", { name: "4" });
    expect(control.tagName).toBe("BUTTON");
    expect(control).toHaveAttribute("disabled");
    expect(control).toHaveAttribute("data-disabled");
    await user.click(control);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("runs onClick once per click when enabled, never when disabled", async () => {
    const user = userEvent.setup();
    const enabled = vi.fn();
    const disabled = vi.fn();
    // Base UI props, not in the pagination props type.
    const focusable = { disabled: true, focusableWhenDisabled: true };
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem data-testid="enabled">
            <PaginationLink onClick={enabled}>7</PaginationLink>
          </PaginationItem>
          <PaginationItem data-testid="disabled">
            <PaginationLink {...focusable} onClick={disabled}>
              7
            </PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
    const control = (id: string) =>
      screen.getByTestId(id).firstElementChild as HTMLElement;
    await user.click(control("enabled"));
    expect(enabled).toHaveBeenCalledTimes(1);
    await user.click(control("enabled"));
    expect(enabled).toHaveBeenCalledTimes(2);
    await user.click(control("disabled"));
    expect(disabled).toHaveBeenCalledTimes(0);
  });

  it("keeps a disabled, focusable control focusable and in the tab order", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    // Base UI props, not in the pagination props type; consumers pass them
    // untyped, and they reached Button before.
    const focusable = { disabled: true, focusableWhenDisabled: true };
    render(
      <>
        <button type="button">Before</button>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationLink {...focusable} onClick={onClick}>
                4
              </PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </>
    );
    const control = screen.getByRole("button", { name: "4" });
    expect(control).toHaveAttribute("aria-disabled", "true");
    expect(control).toHaveAttribute("data-disabled");
    expect(control).not.toHaveAttribute("disabled");
    screen.getByRole("button", { name: "Before" }).focus();
    await user.tab();
    expect(document.activeElement).toBe(control);
    await user.click(control);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("puts no Base UI prop on the DOM element", () => {
    const cases = [
      {},
      { disabled: true },
      { disabled: true, focusableWhenDisabled: true },
      { nativeButton: true },
      { disabled: true, focusableWhenDisabled: true, nativeButton: true },
    ];
    for (const extra of cases) {
      const label = JSON.stringify(extra);
      const view = renderInList(
        <PaginationLink {...extra} onClick={noop}>
          6
        </PaginationLink>
      );
      // React sets an unknown lowercase prop with a string value as an
      // attribute without a warning, so the element is read as well; the
      // warnings are checked after the last test.
      const control = view.container.querySelector(
        "[data-slot='pagination-link']"
      );
      expect(control, label).not.toBeNull();
      const names = control?.getAttributeNames() ?? [];
      expect(names, label).not.toContain("nativebutton");
      expect(names, label).not.toContain("focusablewhendisabled");
      view.unmount();
    }
  });
});

// =============================================================================
// An HTML label without a URL is not taken
// =============================================================================

// Called with props the types do not list (`disabled`, `render`,
// `nativeButton`), as from JavaScript or a spread typed loosely.
const UntypedLink = PaginationLink as unknown as (
  props: Record<string, unknown>
) => React.JSX.Element;
// Two render sites, so Base UI's once-per-message log (keyed by the owner
// stack) logs for each.
function TwinSite(props: Record<string, unknown>) {
  return <UntypedLink {...props} />;
}
function HtmlSite(props: Record<string, unknown>) {
  return <UntypedLink {...props} />;
}

/** Base UI's error for a `<button>` rendered with `nativeButton: false`. */
const NON_BUTTON_EXPECTED =
  /^Base UI: A component that acts as a button expected a non-<button> because the `nativeButton` prop is false\./;

/** A console message without the component stack React or Base UI add. */
const withoutStack = (message: string) => message.split("\n    at ")[0];

const PAGINATION_PROPS_IN_DOM = [
  "dangerouslysetinnerhtml",
  "focusablewhendisabled",
  "nativebutton",
  "render",
];

/**
 * Renders `props` at `Site` after a "Before" button and records the control:
 * element and attributes, `disabled`, Tab from "Before", focus, the
 * handler's call count after a click, Enter and Space, the ref, and the
 * console errors (taken off the record, stacks removed).
 */
async function observe(
  Site: (props: Record<string, unknown>) => React.JSX.Element,
  props: Record<string, unknown>
) {
  const user = userEvent.setup();
  const onClick = vi.fn();
  const ref = createRef<HTMLElement>();
  const from = consoleErrors.length;
  const view = render(
    <>
      <button type="button">Before</button>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <Site {...props} onClick={onClick} ref={ref} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </>
  );
  const control = view.container.querySelector("li")
    ?.firstElementChild as HTMLElement;
  const attributes = Object.fromEntries(
    control
      .getAttributeNames()
      .sort()
      .map((name) => [name, control.getAttribute(name)])
  );
  const outerHTML = control.outerHTML;
  const disabled =
    control instanceof HTMLButtonElement ? control.disabled : null;
  within(view.container).getByRole("button", { name: "Before" }).focus();
  await user.tab();
  const reachedByTab = document.activeElement === control;
  control.focus();
  const focusable = document.activeElement === control;
  const calls: number[] = [];
  await user.click(control);
  calls.push(onClick.mock.calls.length);
  control.focus();
  await user.keyboard("{Enter}");
  calls.push(onClick.mock.calls.length);
  await user.keyboard(" ");
  calls.push(onClick.mock.calls.length);
  const refIsControl = ref.current === control;
  view.unmount();
  return {
    control: {
      attributes,
      calls,
      disabled,
      focusable,
      outerHTML,
      reachedByTab,
      refIsControl,
      tag: control.tagName,
    },
    errors: takeConsoleErrors(from).map(withoutStack),
  };
}

describe("PaginationLink without href and an HTML label", () => {
  const html = { __html: "<b>8</b>" };
  const span = { nativeButton: false, render: <span />, disabled: true };
  const cases: Record<string, Record<string, unknown>> = {
    alone: {},
    children: { children: "8" },
    "render: undefined": { render: undefined },
    "render element": {
      render: <button data-consumer="element" type="button" />,
    },
    "render function": {
      render: (props: React.ComponentProps<"button">) => (
        <button {...props} data-consumer="function" type="button" />
      ),
    },
    "nativeButton: false": { nativeButton: false },
    disabled: { disabled: true },
    focusableWhenDisabled: { focusableWhenDisabled: true },
    "disabled, focusableWhenDisabled": {
      disabled: true,
      focusableWhenDisabled: true,
    },
    "span render, nativeButton: false, disabled": span,
    "span render, nativeButton: false, disabled, children": {
      ...span,
      children: "17",
    },
  };

  for (const [name, props] of Object.entries(cases)) {
    it(`is the control without it: ${name}`, async () => {
      const twin = await observe(TwinSite, props);
      const withHtml = await observe(HtmlSite, {
        ...props,
        dangerouslySetInnerHTML: html,
      });
      expect(withHtml.control).toEqual(twin.control);
      expect(withHtml.errors).toEqual([HTML_LABEL_ERROR, ...twin.errors]);
      // The twin's own errors, so a diagnostic both log is seen too: only a
      // `<button>` with `nativeButton: false` gets Base UI's error.
      if (name === "nativeButton: false") {
        expect(twin.errors).toHaveLength(1);
        expect(twin.errors[0]).toMatch(NON_BUTTON_EXPECTED);
      } else {
        expect(twin.errors).toEqual([]);
      }

      // The control itself, so a change made to both is seen too.
      const names = Object.keys(withHtml.control.attributes);
      for (const prop of PAGINATION_PROPS_IN_DOM) {
        expect(names, prop).not.toContain(prop);
      }
      expect(withHtml.control.refIsControl).toBe(true);
      // A caller's `render`, element or function, is the element rendered.
      const consumer = {
        "render element": "element",
        "render function": "function",
      }[name];
      expect(withHtml.control.attributes["data-consumer"]).toBe(consumer);
      const disabled = props.disabled === true;
      const focusable = !disabled || props.focusableWhenDisabled === true;
      expect(withHtml.control.reachedByTab).toBe(focusable);
      if (focusable) {
        expect(withHtml.control.focusable).toBe(true);
        expect(withHtml.control.attributes.tabindex).toBe("0");
      }
      expect(withHtml.control.calls).toEqual(disabled ? [0, 0, 0] : [1, 2, 3]);
    });
  }

  it("renders the r5 fixture as a disabled span, as with a children label", async () => {
    const view = await observe(HtmlSite, {
      ...span,
      children: "17",
      dangerouslySetInnerHTML: { __html: "<b>17</b>" },
    });
    expect(view.control.tag).toBe("SPAN");
    expect(view.control.attributes["aria-disabled"]).toBe("true");
    expect(view.control.attributes.tabindex).toBe("-1");
    expect(view.control.reachedByTab).toBe(false);
    expect(view.control.calls).toEqual([0, 0, 0]);
    expect(view.control.outerHTML).toContain(">17</span>");
    expect(view.errors).toEqual([HTML_LABEL_ERROR]);
  });

  it("logs the error once per render", () => {
    const from = consoleErrors.length;
    const label = { children: "8", dangerouslySetInnerHTML: html };
    const { rerender } = renderInList(<UntypedLink {...label} />);
    rerender(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <UntypedLink {...label} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
    expect(takeConsoleErrors(from)).toEqual([
      HTML_LABEL_ERROR,
      HTML_LABEL_ERROR,
    ]);
  });

  it("logs nothing for `null` or `undefined`", () => {
    const nullLabel = { dangerouslySetInnerHTML: null };
    const undefinedLabel = { dangerouslySetInnerHTML: undefined };
    const from = consoleErrors.length;
    renderInList(
      <>
        <UntypedLink {...nullLabel}>8</UntypedLink>
        <UntypedLink {...undefinedLabel}>9</UntypedLink>
      </>
    );
    expect(takeConsoleErrors(from)).toEqual([]);
    expect(screen.getByRole("button", { name: "8" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "9" })).toBeInTheDocument();
  });
});

describe("PaginationLink with href and an HTML label", () => {
  it("renders the HTML label in the link and logs nothing", () => {
    const from = consoleErrors.length;
    renderInList(
      <PaginationLink
        // biome-ignore lint/security/noDangerouslySetInnerHtml: the case under test, with a constant string
        dangerouslySetInnerHTML={{ __html: "<b>4</b>" }}
        href="?page=4"
      />
    );
    const link = screen.getByRole("link", { name: "4" });
    expect(link.innerHTML).toBe("<b>4</b>");
    expect(takeConsoleErrors(from)).toEqual([]);
  });
});

describe("PaginationLink without href gives Button the caller's props", () => {
  // Called, not rendered: the element it returns is what Button receives.
  const call = (props: Record<string, unknown>) =>
    (
      PaginationLink as unknown as (
        props: Record<string, unknown>
      ) => React.ReactElement<Record<string, unknown>>
    )(props);

  it("adds no `render` key and removes none", () => {
    const omitted = call({ children: "4" });
    const explicit = call({ children: "4", render: undefined });
    expect(omitted.type).toBe(Button);
    expect(explicit.type).toBe(Button);
    expect(Object.hasOwn(omitted.props, "render")).toBe(false);
    expect(Object.hasOwn(explicit.props, "render")).toBe(true);
    expect(explicit.props.render).toBeUndefined();
  });

  it("gives an HTML-label caller's props to Button without the label", () => {
    const from = consoleErrors.length;
    const element = <button data-consumer="yes" type="button" />;
    const omitted = call({ dangerouslySetInnerHTML: { __html: "<b>4</b>" } });
    const explicit = call({
      dangerouslySetInnerHTML: { __html: "<b>4</b>" },
      render: undefined,
    });
    const given = call({
      dangerouslySetInnerHTML: { __html: "<b>4</b>" },
      render: element,
    });
    expect(takeConsoleErrors(from)).toEqual([
      HTML_LABEL_ERROR,
      HTML_LABEL_ERROR,
      HTML_LABEL_ERROR,
    ]);
    for (const out of [omitted, explicit, given]) {
      expect(out.type).toBe(Button);
      expect(Object.hasOwn(out.props, "dangerouslySetInnerHTML")).toBe(false);
      expect(Object.hasOwn(out.props, "children")).toBe(false);
    }
    expect(Object.hasOwn(omitted.props, "render")).toBe(false);
    expect(Object.hasOwn(explicit.props, "render")).toBe(true);
    expect(given.props.render).toBe(element);
  });

  it("gives Button a caller's function `render` as it is, with an HTML label", () => {
    const from = consoleErrors.length;
    const renderFunction = (props: React.ComponentProps<"button">) => (
      <button {...props} data-consumer="function" type="button" />
    );
    const out = call({
      dangerouslySetInnerHTML: { __html: "<b>4</b>" },
      render: renderFunction,
    });
    expect(takeConsoleErrors(from)).toEqual([HTML_LABEL_ERROR]);
    expect(out.type).toBe(Button);
    expect(out.props.render).toBe(renderFunction);
  });
});

/**
 * `pagination.tsx` evaluated where there is no global `process`: transpiled
 * to CommonJS by TypeScript (esbuild does not run under jsdom), with or
 * without the literal `process.env.NODE_ENV` replaced as a bundler would,
 * and run by `node:vm` in a context with no `process` and a `console` that
 * records. Its imports are this
 * file's own modules, so React and Button are the ones the test renders
 * with. Without a replacement, reading `process` there throws a
 * `ReferenceError`.
 */
async function isolatedPagination(nodeEnv?: "development" | "production") {
  const { outputText: transpiled } = ts.transpileModule(
    readFileSync(join(import.meta.dirname, "pagination.tsx"), "utf-8"),
    {
      compilerOptions: {
        jsx: ts.JsxEmit.ReactJSX,
        module: ts.ModuleKind.CommonJS,
        removeComments: true,
        target: ts.ScriptTarget.ES2022,
      },
    }
  );
  // What a bundler's `process.env.NODE_ENV` replacement does to the literal.
  const code = nodeEnv
    ? transpiled.replaceAll("process.env.NODE_ENV", JSON.stringify(nodeEnv))
    : transpiled;
  const deps: Record<string, unknown> = {
    "./button": await import("./button"),
    "./utils": await import("./utils"),
    "class-variance-authority": await import("class-variance-authority"),
    "lucide-react": await import("lucide-react"),
    "react/jsx-runtime": await import("react/jsx-runtime"),
  };
  const errors: string[] = [];
  const context = createContext({
    console: { error: (...args: unknown[]) => errors.push(format(...args)) },
  });
  const module = { exports: {} as Record<string, unknown> };
  const evaluate = runInContext(
    `(function (require, module, exports) {${code}\n})`,
    context
  ) as (
    require: (id: string) => unknown,
    module: { exports: Record<string, unknown> },
    exports: Record<string, unknown>
  ) => void;
  evaluate(
    (id) => {
      if (!(id in deps)) {
        throw new Error(`unexpected import ${id}`);
      }
      return deps[id];
    },
    module,
    module.exports
  );
  return {
    code,
    errors,
    hasProcess: runInContext("typeof process", context) as string,
    PaginationLink: module.exports.PaginationLink as (
      props: Record<string, unknown>
    ) => React.JSX.Element,
  };
}

describe("PaginationLink without href where there is no global `process`", () => {
  const html = { __html: "<b>8</b>" };

  for (const props of [{}, { children: "8" }]) {
    it(`renders an HTML label control as its twin, without throwing or logging: ${JSON.stringify(props)}`, async () => {
      const isolated = await isolatedPagination();
      expect(isolated.hasProcess).toBe("undefined");
      expect(isolated.code).toContain("process.env.NODE_ENV");
      const twin = await observe(isolated.PaginationLink, props);
      const twinLogged = isolated.errors.splice(0);
      const withHtml = await observe(isolated.PaginationLink, {
        ...props,
        dangerouslySetInnerHTML: html,
      });
      const withHtmlLogged = isolated.errors.splice(0);
      expect(twinLogged).toEqual([]);
      expect(withHtmlLogged).toEqual([]);
      expect(twin.errors).toEqual([]);
      expect(withHtml.errors).toEqual([]);
      expect(withHtml.control).toEqual(twin.control);
      expect(withHtml.control.tag).toBe("BUTTON");
      expect(withHtml.control.outerHTML).not.toContain("<b>8</b>");
    });
  }

  for (const [nodeEnv, expected] of [
    ["development", [HTML_LABEL_ERROR]],
    ["production", []],
  ] as const) {
    it(`with the literal replaced by "${nodeEnv}", logs ${expected.length} error(s)`, async () => {
      const isolated = await isolatedPagination(nodeEnv);
      expect(isolated.code).not.toContain("process.env.NODE_ENV");
      const twin = await observe(isolated.PaginationLink, { children: "8" });
      const twinLogged = isolated.errors.splice(0);
      const withHtml = await observe(isolated.PaginationLink, {
        children: "8",
        dangerouslySetInnerHTML: html,
      });
      const withHtmlLogged = isolated.errors.splice(0);
      expect(twinLogged).toEqual([]);
      expect(withHtmlLogged).toEqual(expected);
      expect(twin.errors).toEqual([]);
      expect(withHtml.errors).toEqual([]);
      expect(withHtml.control).toEqual(twin.control);
    });
  }
});

describe("PaginationLink without href keeps untyped Button props", () => {
  // Button props, not in the pagination props type; consumers pass them
  // untyped, and they reached Button before.
  it("keeps a children label when `render` is given an element", () => {
    const asButton = { render: <button data-consumer="yes" type="button" /> };
    renderInList(
      <PaginationLink {...asButton} onClick={noop}>
        4
      </PaginationLink>
    );
    const control = document.querySelector("[data-slot='pagination-link']");
    expect(control).toHaveAttribute("data-consumer", "yes");
    expect(control?.textContent).toBe("4");
  });

  it("gives a caller's `render` to Button with a children label, `undefined` included", () => {
    const spreads = {
      undefined: { className: "page", render: undefined },
      element: {
        className: "page",
        render: <button data-consumer="yes" type="button" />,
      },
    };
    for (const [name, options] of Object.entries(spreads)) {
      const view = renderInList(
        <PaginationLink {...options} onClick={noop}>
          4
        </PaginationLink>
      );
      const button = screen.getByRole("button", { name: "4" });
      expect(button.tagName, name).toBe("BUTTON");
      expect(button.innerHTML, name).toBe("4");
      expect(button, name).toHaveClass("page");
      expect(button, name).toHaveAttribute("tabindex", "0");
      if (name === "element") {
        expect(button, name).toHaveAttribute("data-consumer", "yes");
      } else {
        expect(button, name).not.toHaveAttribute("data-consumer");
      }
      view.unmount();
    }
  });

  it("keeps a children label with `nativeButton={false}` and a non-button `render`", () => {
    const asSpan = { nativeButton: false, render: <span /> };
    renderInList(
      <PaginationLink {...asSpan} onClick={noop}>
        4
      </PaginationLink>
    );
    expect(screen.getByRole("button", { name: "4" }).tagName).toBe("SPAN");
  });

  it("keeps Button's spinner and hidden label when `isLoading`", () => {
    const loading = { isLoading: true };
    renderInList(
      <PaginationLink {...loading} onClick={noop}>
        4
      </PaginationLink>
    );
    const control = document.querySelector("[data-slot='pagination-link']");
    expect(control).toHaveAttribute("aria-disabled", "true");
    expect(control).not.toHaveAttribute("aria-busy");
    expect(control?.querySelector(".animate-spin")).not.toBeNull();
    expect(control?.querySelector(".opacity-0")?.textContent).toBe("4");
  });
});

describe("PaginationLink without href keeps consumer classes and size", () => {
  it("PaginationLink", () => {
    renderInList(
      <PaginationLink className="custom-class" onClick={noop} size="lg">
        4
      </PaginationLink>
    );
    const button = screen.getByRole("button", { name: "4" });
    expect(button).toHaveClass("custom-class", "h-(--ks-control-lg,3rem)");
    expect(button).not.toHaveClass("h-(--ks-control-sm,2rem)");
  });

  it("PaginationPrevious", () => {
    renderInList(
      <PaginationPrevious className="custom-class" onClick={noop} size="lg" />
    );
    const button = screen.getByRole("button", { name: "Go to previous page" });
    expect(button).toHaveClass("custom-class", "h-(--ks-control-lg,3rem)");
    expect(button).not.toHaveClass("h-(--ks-control-sm,2rem)");
  });

  it("PaginationNext", () => {
    renderInList(
      <PaginationNext className="custom-class" onClick={noop} size="lg" />
    );
    const button = screen.getByRole("button", { name: "Go to next page" });
    expect(button).toHaveClass("custom-class", "h-(--ks-control-lg,3rem)");
    expect(button).not.toHaveClass("h-(--ks-control-sm,2rem)");
  });
});

describe("PaginationLink ref", () => {
  it("points at the anchor with href and at the button without", () => {
    // The ref follows `href`: an anchor with it, a button without it. The
    // types are pinned in `pagination-types.test.tsx`.
    const anchorRef = createRef<HTMLAnchorElement>();
    const buttonRef = createRef<HTMLButtonElement>();
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink href="?page=2" ref={anchorRef}>
              2
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext onClick={noop} ref={buttonRef} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
    expect(anchorRef.current?.tagName).toBe("A");
    expect(buttonRef.current?.tagName).toBe("BUTTON");
  });
});

// =============================================================================
// The link's own classes stay equal to Button's
// =============================================================================
const SIZES = [
  undefined,
  "xs",
  "sm",
  "default",
  "lg",
  "icon",
  "icon-xs",
  "icon-sm",
  "icon-lg",
] as const;

describe("PaginationLink classes stay equal to buttonVariants", () => {
  // `pagination.tsx` keeps its own copy of Button's ghost and outline classes
  // so a page link renders from a Server Component; this fails as soon as a
  // Button class in those variants changes without Pagination following.
  for (const size of SIZES) {
    for (const isActive of [false, true]) {
      it(`size ${size ?? "(none)"}, ${isActive ? "active" : "inactive"}`, () => {
        renderInList(
          <PaginationLink href="#" isActive={isActive} size={size}>
            7
          </PaginationLink>
        );
        const expected = cn(
          buttonVariants({
            variant: isActive ? "outline" : "ghost",
            size: size ?? "sm",
          }),
          "tabular-nums",
          size === undefined && "min-w-(--ks-control-sm,2rem) px-2"
        );
        expect(screen.getByRole("link", { name: "7" }).className).toBe(
          expected
        );
      });
    }
  }
});

// =============================================================================
// PaginationEllipsis
// =============================================================================
describe("PaginationEllipsis", () => {
  it("renders with data-slot attribute", () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationEllipsis data-testid="ellipsis" />
        </PaginationContent>
      </Pagination>
    );
    expect(screen.getByTestId("ellipsis")).toHaveAttribute(
      "data-slot",
      "pagination-ellipsis"
    );
  });

  it("has aria-hidden attribute", () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationEllipsis data-testid="ellipsis" />
        </PaginationContent>
      </Pagination>
    );
    expect(screen.getByTestId("ellipsis")).toHaveAttribute("aria-hidden");
  });

  it("has screen reader text", () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationEllipsis />
        </PaginationContent>
      </Pagination>
    );
    expect(screen.getByText("More pages")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationEllipsis className="custom-class" data-testid="ellipsis" />
        </PaginationContent>
      </Pagination>
    );
    expect(screen.getByTestId("ellipsis")).toHaveClass("custom-class");
  });
});

// =============================================================================
// Full Pagination composition
// =============================================================================
describe("Pagination composition", () => {
  it("renders a complete pagination with all parts", () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink isActive>1</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink>2</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );

    expect(screen.getByRole("navigation")).toBeInTheDocument();
    expect(screen.getByText("Previous")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("More pages")).toBeInTheDocument();
    expect(screen.getByText("Next")).toBeInTheDocument();
  });
});
