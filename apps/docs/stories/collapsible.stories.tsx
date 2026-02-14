import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@keystone/ui/collapsible";
import { Button } from "@keystone/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@keystone/ui/card";
import { Field, FieldGroup, FieldLabel } from "@keystone/ui/field";
import { Input } from "@keystone/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@keystone/ui/tabs";
import {
  ChevronsUpDown,
  ChevronDownIcon,
  ChevronRightIcon,
  MaximizeIcon,
  MinimizeIcon,
  FileIcon,
  FolderIcon,
} from "lucide-react";

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
} from "@keystone/ui/collapsible";

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
      description: "Whether the collapsible panel is currently open (controlled)",
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
        open={isOpen}
        onOpenChange={setIsOpen}
        className="flex w-[350px] flex-col gap-2"
      >
        <div className="flex items-center justify-between gap-4 px-4">
          <h4 className="text-sm font-semibold">Order #4189</h4>
          <CollapsibleTrigger
            render={
              <Button variant="ghost" size="icon" className="size-8">
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
};

// ---------------------------------------------------------------------------
// Basic
// ---------------------------------------------------------------------------

export const Basic: Story = {
  render: () => (
    <Card className="mx-auto w-full max-w-sm">
      <CardContent>
        <Collapsible className="data-open:bg-muted rounded-md">
          <CollapsibleTrigger
            render={
              <Button variant="ghost" className="w-full">
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
            open={isOpen}
            onOpenChange={setIsOpen}
            className="flex items-start gap-2"
          >
            <FieldGroup className="grid w-full grid-cols-2 gap-2">
              <Field>
                <FieldLabel htmlFor="radius-tl" className="sr-only">
                  Top Left
                </FieldLabel>
                <Input id="radius-tl" placeholder="0" defaultValue={0} />
              </Field>
              <Field>
                <FieldLabel htmlFor="radius-tr" className="sr-only">
                  Top Right
                </FieldLabel>
                <Input id="radius-tr" placeholder="0" defaultValue={0} />
              </Field>
              <CollapsibleContent className="col-span-full grid grid-cols-subgrid gap-2">
                <Field>
                  <FieldLabel htmlFor="radius-bl" className="sr-only">
                    Bottom Left
                  </FieldLabel>
                  <Input id="radius-bl" placeholder="0" defaultValue={0} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="radius-br" className="sr-only">
                    Bottom Right
                  </FieldLabel>
                  <Input id="radius-br" placeholder="0" defaultValue={0} />
                </Field>
              </CollapsibleContent>
            </FieldGroup>
            <CollapsibleTrigger
              render={
                <Button variant="outline" size="icon">
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
        items: [
          { name: "utils.ts" },
          { name: "cn.ts" },
          { name: "api.ts" },
        ],
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
                  variant="ghost"
                  size="sm"
                  className="group w-full justify-start transition-none hover:bg-accent hover:text-accent-foreground"
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
          key={fileItem.name}
          variant="link"
          size="sm"
          className="text-foreground w-full justify-start gap-2"
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
