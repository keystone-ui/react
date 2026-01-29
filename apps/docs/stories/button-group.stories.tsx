import type { Meta, StoryObj } from "@storybook/react-vite";
import { 
  Button,
  ButtonGroup, 
  ButtonGroupText,
  ButtonGroupSeparator,
  Input,
} from "@acme/ui";
import { Form, Label } from "@acme/ui/form";
import {
  Search as SearchIcon,
  Copy as CopyIcon,
  Clipboard as ClipboardIcon,
  Bold as BoldIcon,
  Italic as ItalicIcon,
  Underline as UnderlineIcon,
  Strikethrough as StrikethroughIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  AlignLeft as AlignLeftIcon,
  AlignCenter as AlignCenterIcon,
  AlignRight as AlignRightIcon,
  Plus as PlusIcon,
  Minus as MinusIcon,
} from "lucide-react";

const meta = {
  title: "Components/ButtonGroup",
  component: ButtonGroup,
  parameters: {
    docs: {
      description: {
        component: `
# ButtonGroup

A component for grouping buttons and inputs together with shared borders.

Use \`ButtonGroup\` when you want multiple elements to appear as a single unit with connected borders.

## Components

- \`ButtonGroup\` - Container that removes borders between children
- \`ButtonGroupText\` - Text segment with muted background
- \`ButtonGroupSeparator\` - Optional vertical/horizontal divider

## Basic Usage

\`\`\`tsx
import { Button, ButtonGroup } from "@acme/ui";

<ButtonGroup>
  <Button variant="outline">Left</Button>
  <Button variant="outline">Center</Button>
  <Button variant="outline">Right</Button>
</ButtonGroup>
\`\`\`

## With Input

\`\`\`tsx
import { Button, ButtonGroup, Input } from "@acme/ui";
import { Search } from "lucide-react";

<ButtonGroup>
  <Input placeholder="Search..." />
  <Button variant="outline">
    <Search />
  </Button>
</ButtonGroup>
\`\`\`
`,
      },
    },
  },
} satisfies Meta<typeof ButtonGroup>;

export default meta;
type Story = StoryObj<typeof ButtonGroup>;

// Basic Button Group
export const Basic: Story = {
  name: "Basic",
  render: () => (
    <ButtonGroup>
      <Button variant="outline">Left</Button>
      <Button variant="outline">Center</Button>
      <Button variant="outline">Right</Button>
    </ButtonGroup>
  ),
};

// Input with Search Button
export const InputWithSearchButton: Story = {
  name: "Input with Search Button",
  render: () => (
    <ButtonGroup className="max-w-sm">
      <Input placeholder="Search..." />
      <Button variant="outline">
        <SearchIcon className="size-4" />
      </Button>
    </ButtonGroup>
  ),
};

// Input with Label and Text Button
export const InputWithLabelAndButton: Story = {
  name: "Input with Label and Button",
  render: () => (
    <Form className="max-w-sm">
      <Label htmlFor="search-input">Search</Label>
      <ButtonGroup>
        <Input id="search-input" placeholder="Type to search..." />
        <Button variant="outline">Search</Button>
      </ButtonGroup>
    </Form>
  ),
};

// With Separator
export const WithSeparator: Story = {
  name: "With Separator",
  render: () => (
    <ButtonGroup>
      <Button variant="outline">
        <CopyIcon className="size-4" />
        Copy
      </Button>
      <ButtonGroupSeparator />
      <Button variant="outline">
        <ClipboardIcon className="size-4" />
        Paste
      </Button>
    </ButtonGroup>
  ),
};

// Icon Buttons (Toolbar Style)
export const IconButtons: Story = {
  name: "Icon Buttons (Toolbar)",
  render: () => (
    <ButtonGroup>
      <Button variant="outline" size="icon">
        <BoldIcon className="size-4" />
      </Button>
      <Button variant="outline" size="icon">
        <ItalicIcon className="size-4" />
      </Button>
      <Button variant="outline" size="icon">
        <UnderlineIcon className="size-4" />
      </Button>
      <Button variant="outline" size="icon">
        <StrikethroughIcon className="size-4" />
      </Button>
    </ButtonGroup>
  ),
};

// Alignment Buttons
export const AlignmentButtons: Story = {
  name: "Alignment Buttons",
  render: () => (
    <ButtonGroup>
      <Button variant="outline" size="icon">
        <AlignLeftIcon className="size-4" />
      </Button>
      <Button variant="outline" size="icon">
        <AlignCenterIcon className="size-4" />
      </Button>
      <Button variant="outline" size="icon">
        <AlignRightIcon className="size-4" />
      </Button>
    </ButtonGroup>
  ),
};

// Pagination Style
export const Pagination: Story = {
  name: "Pagination",
  render: () => (
    <ButtonGroup>
      <Button variant="outline" size="icon">
        <ChevronLeftIcon className="size-4" />
      </Button>
      <Button variant="outline">1</Button>
      <Button variant="outline">2</Button>
      <Button variant="outline">3</Button>
      <Button variant="outline" size="icon">
        <ChevronRightIcon className="size-4" />
      </Button>
    </ButtonGroup>
  ),
};

// Segmented Control
export const SegmentedControl: Story = {
  name: "Segmented Control",
  render: () => (
    <ButtonGroup>
      <Button variant="default">Day</Button>
      <Button variant="outline">Week</Button>
      <Button variant="outline">Month</Button>
      <Button variant="outline">Year</Button>
    </ButtonGroup>
  ),
};

// With Text Segment (URL Prefix)
export const WithTextSegment: Story = {
  name: "With Text Segment",
  render: () => (
    <ButtonGroup className="max-w-sm">
      <ButtonGroupText>https://</ButtonGroupText>
      <Input placeholder="example.com" />
    </ButtonGroup>
  ),
};

// Email Domain
export const EmailDomain: Story = {
  name: "Email Domain",
  render: () => (
    <ButtonGroup className="max-w-sm">
      <Input placeholder="username" />
      <ButtonGroupText>@company.com</ButtonGroupText>
    </ButtonGroup>
  ),
};

// Vertical Orientation
export const Vertical: Story = {
  name: "Vertical",
  render: () => (
    <ButtonGroup orientation="vertical">
      <Button variant="outline">Top</Button>
      <Button variant="outline">Middle</Button>
      <Button variant="outline">Bottom</Button>
    </ButtonGroup>
  ),
};

// Increment/Decrement
export const IncrementDecrement: Story = {
  name: "Increment/Decrement",
  render: () => (
    <ButtonGroup>
      <Button variant="outline" size="icon">
        <MinusIcon className="size-4" />
      </Button>
      <Input className="w-16 text-center" defaultValue="1" />
      <Button variant="outline" size="icon">
        <PlusIcon className="size-4" />
      </Button>
    </ButtonGroup>
  ),
};

// Input with Multiple Buttons
export const InputWithMultipleButtons: Story = {
  name: "Input with Multiple Buttons",
  render: () => (
    <ButtonGroup className="max-w-md">
      <Input placeholder="Enter value..." />
      <Button variant="outline">
        <CopyIcon className="size-4" />
      </Button>
      <ButtonGroupSeparator />
      <Button variant="outline">Clear</Button>
    </ButtonGroup>
  ),
};

// All Examples Grid
export const AllExamples: Story = {
  name: "All Examples",
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <h3 className="text-sm font-medium mb-2">Basic Button Group</h3>
        <ButtonGroup>
          <Button variant="outline">Left</Button>
          <Button variant="outline">Center</Button>
          <Button variant="outline">Right</Button>
        </ButtonGroup>
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-2">Input with Search</h3>
        <ButtonGroup>
          <Input placeholder="Search..." className="max-w-[200px]" />
          <Button variant="outline">
            <SearchIcon className="size-4" />
          </Button>
        </ButtonGroup>
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-2">With Separator</h3>
        <ButtonGroup>
          <Button variant="outline">
            <CopyIcon className="size-4" />
            Copy
          </Button>
          <ButtonGroupSeparator />
          <Button variant="outline">
            <ClipboardIcon className="size-4" />
            Paste
          </Button>
        </ButtonGroup>
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-2">Icon Toolbar</h3>
        <ButtonGroup>
          <Button variant="outline" size="icon">
            <BoldIcon className="size-4" />
          </Button>
          <Button variant="outline" size="icon">
            <ItalicIcon className="size-4" />
          </Button>
          <Button variant="outline" size="icon">
            <UnderlineIcon className="size-4" />
          </Button>
          <Button variant="outline" size="icon">
            <StrikethroughIcon className="size-4" />
          </Button>
        </ButtonGroup>
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-2">Pagination</h3>
        <ButtonGroup>
          <Button variant="outline" size="icon">
            <ChevronLeftIcon className="size-4" />
          </Button>
          <Button variant="outline">1</Button>
          <Button variant="outline">2</Button>
          <Button variant="outline">3</Button>
          <Button variant="outline" size="icon">
            <ChevronRightIcon className="size-4" />
          </Button>
        </ButtonGroup>
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-2">Segmented Control</h3>
        <ButtonGroup>
          <Button variant="default">Day</Button>
          <Button variant="outline">Week</Button>
          <Button variant="outline">Month</Button>
        </ButtonGroup>
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-2">URL Prefix</h3>
        <ButtonGroup>
          <ButtonGroupText>https://</ButtonGroupText>
          <Input placeholder="example.com" className="max-w-[200px]" />
        </ButtonGroup>
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-2">Vertical</h3>
        <ButtonGroup orientation="vertical">
          <Button variant="outline">Top</Button>
          <Button variant="outline">Middle</Button>
          <Button variant="outline">Bottom</Button>
        </ButtonGroup>
      </div>
    </div>
  ),
};
