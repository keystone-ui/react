import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@keystoneui/react/breadcrumb";
import { Button } from "@keystoneui/react/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@keystoneui/react/dropdown-menu";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ChevronDown as ChevronDownIcon, Dot as DotIcon } from "lucide-react";
import { expect, within } from "storybook/test";

const meta = {
  title: "Components/Breadcrumb",
  component: Breadcrumb,
  parameters: {
    docs: {
      description: {
        component: `
A composable breadcrumb navigation component with support for custom separators, dropdowns, ellipsis, and polymorphic links via the \`render\` prop.

\`\`\`tsx
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@keystoneui/react/breadcrumb";

<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href="#">Home</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbLink href="#">Components</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>
\`\`\`

## Features

- Semantic \`<nav>\` with \`aria-label="breadcrumb"\`
- Polymorphic \`BreadcrumbLink\` via the \`render\` prop (e.g., render as a router Link)
- Custom separators via \`BreadcrumbSeparator\` children
- Collapsed state with \`BreadcrumbEllipsis\`
- Composable with \`DropdownMenu\` for overflow menus
- Current page indication with \`aria-current="page"\`
`,
      },
    },
  },
  subcomponents: {
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbPage,
    BreadcrumbSeparator,
    BreadcrumbEllipsis,
  },
} satisfies Meta<typeof Breadcrumb>;

export default meta;
type Story = StoryObj<typeof Breadcrumb>;

/**
 * A focused part's outline as the user sees it: the computed style, and any
 * ancestor that hides overflow and would clip it. The library's outline is
 * Button's: 2px solid at offset 2px (the browser's own ring is `auto` 1px).
 */
function readFocusOutline(el: HTMLElement) {
  const style = getComputedStyle(el);
  const reach =
    Number.parseFloat(style.outlineOffset) +
    Number.parseFloat(style.outlineWidth);
  const box = el.getBoundingClientRect();
  const clippedBy: string[] = [];
  for (let a = el.parentElement; a; a = a.parentElement) {
    const s = getComputedStyle(a);
    if (s.overflowX === "visible" && s.overflowY === "visible") {
      continue;
    }
    const b = a.getBoundingClientRect();
    const left = b.left + a.clientLeft;
    const top = b.top + a.clientTop;
    if (
      box.left - reach < left - 0.5 ||
      box.top - reach < top - 0.5 ||
      box.right + reach > left + a.clientWidth + 0.5 ||
      box.bottom + reach > top + a.clientHeight + 0.5
    ) {
      clippedBy.push(a.dataset.slot ?? a.tagName.toLowerCase());
    }
  }
  return {
    focusVisible: el.matches(":focus-visible"),
    style: style.outlineStyle,
    width: style.outlineWidth,
    offset: style.outlineOffset,
    clippedBy,
  };
}

/** Focus `el`, let its colour transition settle, read, and blur. */
async function focusAndRead(el: HTMLElement) {
  el.focus();
  await new Promise((r) => setTimeout(r, 300));
  const outline = readFocusOutline(el);
  el.blur();
  return outline;
}

const LIBRARY_OUTLINE = {
  focusVisible: true,
  style: "solid",
  width: "2px",
  offset: "2px",
  clippedBy: [],
};

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: () => (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="#">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="#">Components</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
  // BreadcrumbLink draws the library's keyboard focus outline, not the
  // browser's 1px `auto` ring.
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole("link", { name: /^home$/i });
    await expect(await focusAndRead(link)).toEqual(LIBRARY_OUTLINE);
  },
};

// ---------------------------------------------------------------------------
// Custom Separator
// ---------------------------------------------------------------------------

export const CustomSeparator: Story = {
  name: "Custom Separator",
  render: () => (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="#">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator>
          <DotIcon />
        </BreadcrumbSeparator>
        <BreadcrumbItem>
          <BreadcrumbLink href="#">Components</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator>
          <DotIcon />
        </BreadcrumbSeparator>
        <BreadcrumbItem>
          <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
};

// ---------------------------------------------------------------------------
// With Dropdown
// ---------------------------------------------------------------------------

export const WithDropdown: Story = {
  name: "With Dropdown",
  render: () => (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="#">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button className="flex items-center gap-1">
                  Components
                  <ChevronDownIcon className="size-3.5" />
                </button>
              }
            />
            <DropdownMenuContent align="start">
              <DropdownMenuGroup>
                <DropdownMenuItem>Documentation</DropdownMenuItem>
                <DropdownMenuItem>Themes</DropdownMenuItem>
                <DropdownMenuItem>GitHub</DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
};

// ---------------------------------------------------------------------------
// Collapsed
// ---------------------------------------------------------------------------

export const Collapsed: Story = {
  render: () => (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="#">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbEllipsis />
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="#">Components</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
};

// ---------------------------------------------------------------------------
// Collapsed with Dropdown
// ---------------------------------------------------------------------------

export const CollapsedWithDropdown: Story = {
  name: "Collapsed with Dropdown",
  render: () => (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="#">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button size="icon-sm" variant="ghost">
                  <BreadcrumbEllipsis />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              }
            />
            <DropdownMenuContent align="start" size="compact">
              <DropdownMenuGroup>
                <DropdownMenuItem>Documentation</DropdownMenuItem>
                <DropdownMenuItem>Themes</DropdownMenuItem>
                <DropdownMenuItem>GitHub</DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="#">Components</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
};

// ---------------------------------------------------------------------------
// Link Component (render prop)
// ---------------------------------------------------------------------------

export const LinkComponent: Story = {
  name: "Link Component",
  render: () => (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink render={<a href="#link-component" />}>
            Home
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink render={<a href="#link-component" />}>
            Components
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
};
