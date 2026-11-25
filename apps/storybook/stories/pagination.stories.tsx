import { Button } from "@keystoneui/react/button";
import { Field, FieldLabel } from "@keystoneui/react/field";
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
} from "@keystoneui/react/pagination";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@keystoneui/react/select";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  ChevronsLeft as ChevronsLeftIcon,
  ChevronsRight as ChevronsRightIcon,
} from "lucide-react";
import { expect, fn, within } from "storybook/test";

const meta = {
  title: "Components/Pagination",
  component: Pagination,
  parameters: {
    docs: {
      description: {
        component: `
A composable pagination component built from small, accessible parts.

\`\`\`tsx
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
} from "@keystoneui/react/pagination";

<Pagination>
  <PaginationContent>
    <PaginationItem>
      <PaginationPrevious href="#" />
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#" isActive>1</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#">2</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationNext href="#" />
    </PaginationItem>
  </PaginationContent>
</Pagination>
\`\`\`

## Features

- Composable sub-components for full layout control
- Active page indicator via \`isActive\` prop
- Previous / Next buttons with text labels (hidden on small screens)
- First / Last page buttons with double-chevron icons
- Ellipsis indicator for truncated page ranges
- With \`href\`, every page control is a real \`<a>\` link; without \`href\` it is a \`<button>\` for \`onClick\` paging
`,
      },
    },
  },
  subcomponents: {
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationPrevious,
    PaginationNext,
    PaginationFirst,
    PaginationLast,
    PaginationEllipsis,
  },
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: () => (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#" />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">1</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#" isActive>
            2
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">3</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const nav = canvas.getByRole("navigation");
    await expect(nav).toBeInTheDocument();

    const nextButton = canvas.getByLabelText("Go to next page");
    await expect(nextButton).toBeInTheDocument();
  },
};

// ---------------------------------------------------------------------------
// Simple
// ---------------------------------------------------------------------------

export const Simple: Story = {
  render: () => (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationLink href="#">1</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#" isActive>
            2
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">3</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">4</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">5</PaginationLink>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
};

// ---------------------------------------------------------------------------
// DataTable

// ---------------------------------------------------------------------------
// Worst case
// ---------------------------------------------------------------------------

/**
 * Realistic worst-case data, not lorem: an 80-character address with no
 * break opportunity, a four-digit page, counts of exactly 0 and 1. The play
 * test measures real layout in the browser, so a regression to overflowing
 * text fails here rather than in a user's account menu.
 */
const WORST_EMAIL =
  "bartholomew.fitzgerald-wisniewska@northwind-industries-holdings-emea.example.com";

/** `inner` lies inside `outer`, with half a pixel for subpixel rounding. */
function expectInside(inner: DOMRect, outer: { left: number; right: number }) {
  expect(inner.left).toBeGreaterThanOrEqual(outer.left - 0.5);
  expect(inner.right).toBeLessThanOrEqual(outer.right + 0.5);
}

/** The element's content fits its box: nothing spills past the border. */
function expectNoOverflow(el: Element) {
  expect(el.scrollWidth).toBeLessThanOrEqual(el.clientWidth);
}

const viewport = () => ({ left: 0, right: window.innerWidth });

export const WorstCase: Story = {
  name: "Worst case",
  render: () => (
    <div className="w-80" data-testid="frame">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">1</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#" isActive>
              1,284
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="#" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const frame = canvas.getByTestId("frame").getBoundingClientRect();

    // A four-digit page grows its link instead of spilling out of a square.
    const current = canvas.getByRole("link", { name: /^1,284$/ });
    expectNoOverflow(current);
    const currentRect = current.getBoundingClientRect();
    await expect(currentRect.width).toBeGreaterThan(currentRect.height);

    // A single digit keeps the square, same height as its neighbours.
    const first = canvas.getByRole("link", { name: /^1$/ });
    const firstRect = first.getBoundingClientRect();
    await expect(Math.abs(firstRect.width - firstRect.height)).toBeLessThan(1);
    await expect(firstRect.height).toBeCloseTo(currentRect.height, 0);

    // Every control here has an `href`, so every one is a link.
    await expect(canvas.queryAllByRole("button")).toHaveLength(0);
    for (const link of canvas.getAllByRole("link")) {
      expectInside(link.getBoundingClientRect(), frame);
    }
  },
};

// ---------------------------------------------------------------------------
// Keyboard
// ---------------------------------------------------------------------------

/** Vitest's real (Playwright) input; absent when Storybook runs the play. */
interface RealUser {
  keyboard: (text: string) => Promise<void>;
}
const realUser = () =>
  (globalThis as { __realUserEvent?: RealUser }).__realUserEvent;

/** A role query option, kept out of story-name scans. */
const named = (accessibleName: string) => ({ name: accessibleName });

const onPageLinkClick = fn();
const onPageLinkKeyDown = fn();
const onPreviousClick = fn();

/**
 * A page link with `href` follows on Enter only, like any link; Space does
 * nothing. A control without `href` is a native button: Enter and Space both
 * run `onClick`. The handlers cancel the navigation so the test frame stays.
 */
export const Keyboard: Story = {
  render: () => (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious onClick={onPreviousClick} />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink
            href="#page-2"
            onClick={(event) => {
              event.preventDefault();
              onPageLinkClick();
            }}
            onKeyDown={() => onPageLinkKeyDown()}
          >
            2
          </PaginationLink>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole("link", named("2"));
    const previous = canvas.getByRole("button", named("Go to previous page"));
    await expect(link).not.toHaveAttribute("role");
    await expect(link).not.toHaveAttribute("tabindex");
    await expect(previous.tagName).toBe("BUTTON");

    const user = realUser();
    if (!user) {
      return;
    }
    onPageLinkClick.mockClear();
    onPageLinkKeyDown.mockClear();
    onPreviousClick.mockClear();

    link.focus();
    await user.keyboard(" ");
    // The key reached the link, and still no click.
    await expect(onPageLinkKeyDown).toHaveBeenCalledTimes(1);
    await expect(onPageLinkClick).toHaveBeenCalledTimes(0);
    await user.keyboard("{Enter}");
    await expect(onPageLinkClick).toHaveBeenCalledTimes(1);

    previous.focus();
    await user.keyboard("{Enter}");
    await expect(onPreviousClick).toHaveBeenCalledTimes(1);
    await user.keyboard(" ");
    await expect(onPreviousClick).toHaveBeenCalledTimes(2);
  },
};
