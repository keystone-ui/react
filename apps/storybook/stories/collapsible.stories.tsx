import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "keystoneui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "keystoneui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "keystoneui/collapsible";
import { Field, FieldGroup, FieldLabel } from "keystoneui/field";
import { Input } from "keystoneui/input";
import { Tabs, TabsList, TabsTrigger } from "keystoneui/tabs";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  ChevronsUpDown,
  FileIcon,
  FolderIcon,
  MaximizeIcon,
  MinimizeIcon,
} from "lucide-react";
import * as React from "react";
import { expect, userEvent, within } from "storybook/test";

const meta = {
  title: "Components/Collapsible",
  component: Collapsible,
  parameters: {
    docs: {
      description: {
        component: `
A collapsible panel controlled by a button.

\`\`\`tsx
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "keystoneui/collapsible";

<Collapsible>
  <CollapsibleTrigger>Toggle</CollapsibleTrigger>
  <CollapsibleContent>Content</CollapsibleContent>
</Collapsible>
\`\`\`

## Features

- Smooth height-based open/close transitions
- Controlled and uncontrolled modes
- Composable trigger via \`render\` prop
- Keyboard accessible via Base UI Collapsible primitive
- Nestable for tree structures
`,
      },
    },
  },
  argTypes: {
    open: {
      control: "boolean",
      description:
        "Whether the collapsible panel is currently open (controlled)",
    },
    defaultOpen: {
      control: "boolean",
      description: "Whether the panel is initially open (uncontrolled)",
    },
    disabled: {
      control: "boolean",
      description: "Whether the collapsible is disabled",
    },
  },
  subcomponents: { CollapsibleTrigger, CollapsibleContent },
} satisfies Meta<typeof Collapsible>;

export default meta;
type Story = StoryObj<typeof meta>;

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: () => {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
      <Collapsible
        className="flex w-[350px] flex-col gap-2"
        onOpenChange={setIsOpen}
        open={isOpen}
      >
        <div className="flex items-center justify-between gap-4 px-4">
          <h4 className="font-semibold text-sm">Order #4189</h4>
          <CollapsibleTrigger
            render={
              <Button className="size-8" size="icon" variant="ghost">
                <ChevronsUpDown />
                <span className="sr-only">Toggle details</span>
              </Button>
            }
          />
        </div>
        <div className="flex items-center justify-between rounded-md border px-4 py-2 text-sm">
          <span className="text-muted-foreground">Status</span>
          <span className="font-medium">Shipped</span>
        </div>
        <CollapsibleContent className="flex flex-col gap-2">
          <div className="rounded-md border px-4 py-2 text-sm">
            <p className="font-medium">Shipping address</p>
            <p className="text-muted-foreground">
              100 Market St, San Francisco
            </p>
          </div>
          <div className="rounded-md border px-4 py-2 text-sm">
            <p className="font-medium">Items</p>
            <p className="text-muted-foreground">2x Studio Headphones</p>
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: /toggle details/i });

    // Click to expand
    await userEvent.click(trigger);

    // Expect the collapsible content to be visible
    await expect(
      canvas.getByText("100 Market St, San Francisco")
    ).toBeVisible();
  },
};

// ---------------------------------------------------------------------------
// Basic
// ---------------------------------------------------------------------------

export const Basic: Story = {
  render: () => (
    <Card className="mx-auto w-full max-w-sm">
      <CardContent>
        <Collapsible className="rounded-md data-open:bg-muted">
          <CollapsibleTrigger
            render={
              <Button className="w-full" variant="ghost">
                Product details
                <ChevronDownIcon className="ml-auto group-data-panel-open/button:rotate-180" />
              </Button>
            }
          />
          <CollapsibleContent className="flex flex-col items-start gap-2 p-2.5 pt-0 text-sm">
            <div>
              This panel can be expanded or collapsed to reveal additional
              content.
            </div>
            <Button size="xs">Learn More</Button>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  ),
};

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

export const Settings: Story = {
  render: () => {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
      <Card className="mx-auto w-full max-w-xs" size="sm">
        <CardHeader>
          <CardTitle>Radius</CardTitle>
          <CardDescription>
            Set the corner radius of the element.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Collapsible
            className="flex items-start gap-2"
            onOpenChange={setIsOpen}
            open={isOpen}
          >
            <FieldGroup className="grid w-full grid-cols-2 gap-2">
              <Field>
                <FieldLabel className="sr-only" htmlFor="radius-tl">
                  Top Left
                </FieldLabel>
                <Input defaultValue={0} id="radius-tl" placeholder="0" />
              </Field>
              <Field>
                <FieldLabel className="sr-only" htmlFor="radius-tr">
                  Top Right
                </FieldLabel>
                <Input defaultValue={0} id="radius-tr" placeholder="0" />
              </Field>
              <CollapsibleContent className="col-span-full grid grid-cols-subgrid gap-2">
                <Field>
                  <FieldLabel className="sr-only" htmlFor="radius-bl">
                    Bottom Left
                  </FieldLabel>
                  <Input defaultValue={0} id="radius-bl" placeholder="0" />
                </Field>
                <Field>
                  <FieldLabel className="sr-only" htmlFor="radius-br">
                    Bottom Right
                  </FieldLabel>
                  <Input defaultValue={0} id="radius-br" placeholder="0" />
                </Field>
              </CollapsibleContent>
            </FieldGroup>
            <CollapsibleTrigger
              render={
                <Button size="icon" variant="outline">
                  {isOpen ? <MinimizeIcon /> : <MaximizeIcon />}
                </Button>
              }
            />
          </Collapsible>
        </CardContent>
      </Card>
    );
  },
};

// ---------------------------------------------------------------------------
// FileTree
// ---------------------------------------------------------------------------

type FileTreeItem = { name: string } | { name: string; items: FileTreeItem[] };

export const FileTree: Story = {
  name: "File Tree",
  render: () => {
    const fileTree: FileTreeItem[] = [
      {
        name: "components",
        items: [
          {
            name: "ui",
            items: [
              { name: "button.tsx" },
              { name: "card.tsx" },
              { name: "dialog.tsx" },
              { name: "input.tsx" },
              { name: "select.tsx" },
              { name: "table.tsx" },
            ],
          },
          { name: "login-form.tsx" },
          { name: "register-form.tsx" },
        ],
      },
      {
        name: "lib",
        items: [{ name: "utils.ts" }, { name: "cn.ts" }, { name: "api.ts" }],
      },
      {
        name: "hooks",
        items: [
          { name: "use-media-query.ts" },
          { name: "use-debounce.ts" },
          { name: "use-local-storage.ts" },
        ],
      },
      {
        name: "types",
        items: [{ name: "index.d.ts" }, { name: "api.d.ts" }],
      },
      {
        name: "public",
        items: [
          { name: "favicon.ico" },
          { name: "logo.svg" },
          { name: "images" },
        ],
      },
      { name: "app.tsx" },
      { name: "layout.tsx" },
      { name: "globals.css" },
      { name: "package.json" },
      { name: "tsconfig.json" },
      { name: "README.md" },
      { name: ".gitignore" },
    ];

    const renderItem = (fileItem: FileTreeItem) => {
      if ("items" in fileItem) {
        return (
          <Collapsible key={fileItem.name}>
            <CollapsibleTrigger
              render={
                <Button
                  className="group w-full justify-start transition-none hover:bg-accent hover:text-accent-foreground"
                  size="sm"
                  variant="ghost"
                >
                  <ChevronRightIcon className="transition-transform group-data-panel-open:rotate-90" />
                  <FolderIcon />
                  {fileItem.name}
                </Button>
              }
            />
            <CollapsibleContent className="mt-1 ml-5">
              <div className="flex flex-col gap-1">
                {fileItem.items.map((child) => renderItem(child))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        );
      }
      return (
        <Button
          className="w-full justify-start gap-2 text-foreground"
          key={fileItem.name}
          size="sm"
          variant="link"
        >
          <FileIcon />
          <span>{fileItem.name}</span>
        </Button>
      );
    };

    return (
      <Card className="mx-auto w-full max-w-[16rem] gap-2" size="sm">
        <CardHeader>
          <Tabs defaultValue="explorer">
            <TabsList className="w-full">
              <TabsTrigger value="explorer">Explorer</TabsTrigger>
              <TabsTrigger value="outline">Outline</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-1">
            {fileTree.map((item) => renderItem(item))}
          </div>
        </CardContent>
      </Card>
    );
  },
};
