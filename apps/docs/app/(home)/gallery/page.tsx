import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Component Gallery",
  description: "Browse all 50+ Keystone UI components.",
};

const categories = [
  {
    title: "Form Controls",
    components: [
      {
        name: "Button",
        slug: "button",
        description: "Versatile button with 6 variants and 8 sizes",
      },
      {
        name: "Input",
        slug: "input",
        description: "Text input with focus and validation states",
      },
      {
        name: "Textarea",
        slug: "textarea",
        description: "Multi-line text input field",
      },
      {
        name: "Select",
        slug: "select",
        description: "Dropdown select with search and groups",
      },
      {
        name: "Combobox",
        slug: "combobox",
        description: "Searchable dropdown with autocomplete",
      },
      {
        name: "Checkbox",
        slug: "checkbox",
        description: "Toggleable boolean input",
      },
      {
        name: "Radio Group",
        slug: "radio-group",
        description: "Single selection from a group",
      },
      {
        name: "Switch",
        slug: "switch",
        description: "Toggle switch for on/off states",
      },
      {
        name: "Slider",
        slug: "slider",
        description: "Range slider input control",
      },
      {
        name: "Date Input",
        slug: "date-input",
        description: "Date picker input field",
      },
      {
        name: "Input OTP",
        slug: "input-otp",
        description: "One-time password digit input",
      },
      {
        name: "Native Select",
        slug: "native-select",
        description: "Browser-native select dropdown",
      },
      {
        name: "Input Group",
        slug: "input-group",
        description: "Input with attached buttons or icons",
      },
      {
        name: "Field",
        slug: "field",
        description: "Form field with label, description, error",
      },
      {
        name: "Form",
        slug: "form",
        description: "Form with validation integration",
      },
      {
        name: "Label",
        slug: "label",
        description: "Accessible form label",
      },
    ],
  },
  {
    title: "Layout",
    components: [
      {
        name: "Card",
        slug: "card",
        description: "Content container with sections",
      },
      {
        name: "Separator",
        slug: "separator",
        description: "Visual divider between content",
      },
      {
        name: "Resizable",
        slug: "resizable",
        description: "Resizable panel layout",
      },
      {
        name: "Aspect Ratio",
        slug: "aspect-ratio",
        description: "Maintain width-to-height ratio",
      },
      {
        name: "Description List",
        slug: "description-list",
        description: "Term-description metadata pairs",
      },
      {
        name: "Empty",
        slug: "empty",
        description: "Empty state placeholder",
      },
    ],
  },
  {
    title: "Navigation",
    components: [
      {
        name: "Tabs",
        slug: "tabs",
        description: "Tabbed content navigation",
      },
      {
        name: "Breadcrumb",
        slug: "breadcrumb",
        description: "Navigation trail",
      },
      {
        name: "Pagination",
        slug: "pagination",
        description: "Page navigation controls",
      },
      {
        name: "Stepper",
        slug: "stepper",
        description: "Multi-step progress indicator",
      },
    ],
  },
  {
    title: "Feedback",
    components: [
      {
        name: "Alert",
        slug: "alert",
        description: "Informational alert messages",
      },
      {
        name: "Badge",
        slug: "badge",
        description: "Status indicators and counts",
      },
      {
        name: "Progress",
        slug: "progress",
        description: "Linear progress bar",
      },
      {
        name: "Circular Progress",
        slug: "circular-progress",
        description: "Circular progress indicator",
      },
      {
        name: "Spinner",
        slug: "spinner",
        description: "Loading animation",
      },
      {
        name: "Skeleton",
        slug: "skeleton",
        description: "Content loading placeholder",
      },
      {
        name: "Toast",
        slug: "toast",
        description: "Temporary notifications",
      },
    ],
  },
  {
    title: "Overlays",
    components: [
      {
        name: "Modal",
        slug: "modal",
        description: "Dialog overlay for focused interactions",
      },
      {
        name: "Alert Dialog",
        slug: "alert-dialog",
        description: "Confirmation for destructive actions",
      },
      {
        name: "Drawer",
        slug: "drawer",
        description: "Slide-out panel from screen edges",
      },
      {
        name: "Popover",
        slug: "popover",
        description: "Floating content anchored to a trigger",
      },
      {
        name: "Dropdown Menu",
        slug: "dropdown-menu",
        description: "Contextual menu with items",
      },
      {
        name: "Tooltip",
        slug: "tooltip",
        description: "Hover descriptive text",
      },
    ],
  },
  {
    title: "Data Display",
    components: [
      {
        name: "Accordion",
        slug: "accordion",
        description: "Expandable content sections",
      },
      {
        name: "Collapsible",
        slug: "collapsible",
        description: "Single expandable section",
      },
      {
        name: "Table",
        slug: "table",
        description: "Data table with rows and columns",
      },
      {
        name: "Avatar",
        slug: "avatar",
        description: "User avatar with fallback",
      },
      {
        name: "Tag",
        slug: "tag",
        description: "Removable label element",
      },
      {
        name: "Tag Group",
        slug: "tag-group",
        description: "Group of tags",
      },
      {
        name: "Carousel",
        slug: "carousel",
        description: "Scrollable content carousel",
      },
      {
        name: "Calendar",
        slug: "calendar",
        description: "Date calendar picker",
      },
    ],
  },
  {
    title: "Actions",
    components: [
      {
        name: "Button Group",
        slug: "button-group",
        description: "Group of related buttons",
      },
      {
        name: "Toggle",
        slug: "toggle",
        description: "Two-state toggle button",
      },
      {
        name: "Toggle Group",
        slug: "toggle-group",
        description: "Group of toggle buttons",
      },
    ],
  },
  {
    title: "Utilities",
    components: [
      {
        name: "Kbd",
        slug: "kbd",
        description: "Keyboard shortcut display",
      },
      {
        name: "Item",
        slug: "item",
        description: "Generic list item primitive",
      },
    ],
  },
];

export default function GalleryPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-16">
      <h1 className="mb-2 font-bold text-4xl tracking-tight">
        Component Gallery
      </h1>
      <p className="mb-12 text-lg text-muted-foreground">
        Browse all 50+ Keystone UI components organized by category.
      </p>

      <div className="space-y-16">
        {categories.map((category) => (
          <section key={category.title}>
            <h2 className="mb-6 font-semibold text-xl">{category.title}</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {category.components.map((component) => (
                <Link
                  className="group flex flex-col rounded-lg border border-border/50 bg-card p-4 transition-all hover:border-border hover:bg-accent/30"
                  href={`/docs/components/${component.slug}`}
                  key={component.slug}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">
                      {component.name}
                    </span>
                    <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </div>
                  <p className="mt-1 text-muted-foreground text-xs">
                    {component.description}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
