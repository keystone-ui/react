import type { Meta, StoryObj } from "@storybook/react-vite";
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
} from "@keystone/ui/pagination";
import { Button } from "@keystone/ui/button";
import { Field, FieldLabel } from "@keystone/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@keystone/ui/select";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from "lucide-react";

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
} from "@keystone/ui/pagination";

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
- Renders as \`<a>\` tags by default for link-based navigation
`,
      },
    },
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

export const DataTable: Story = {
  name: "Data Table",
  render: () => (
    <div className="flex items-center justify-end space-x-4 md:space-x-6 lg:space-x-8">
      <div className="flex items-center space-x-2">
        <FieldLabel htmlFor="select-rows-per-page">Rows per page</FieldLabel>
        <Select defaultValue="25">
          <SelectTrigger className="w-20" id="select-rows-per-page">
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="start">
            <SelectGroup>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center justify-center text-sm font-medium">
        Page 1 of 3
      </div>
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="icon-sm" aria-label="Go to first page">
          <ChevronsLeftIcon />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          aria-label="Go to previous page"
        >
          <ChevronLeftIcon />
        </Button>
        <Button variant="outline" size="icon-sm" aria-label="Go to next page">
          <ChevronRightIcon />
        </Button>
        <Button variant="outline" size="icon-sm" aria-label="Go to last page">
          <ChevronsRightIcon />
        </Button>
      </div>
    </div>
  ),
};
