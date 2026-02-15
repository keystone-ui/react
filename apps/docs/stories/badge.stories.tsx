import { Badge } from "@keystone/ui/badge";
import { Spinner } from "@keystone/ui/spinner";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  AlertCircleIcon,
  ArrowUpRightIcon,
  BadgeCheckIcon,
  BathIcon,
  BedIcon,
  BookmarkIcon,
  CalendarIcon,
  CheckIcon,
  InfoIcon,
  LandPlotIcon,
  UsersIcon,
  XIcon,
} from "lucide-react";

const meta = {
  title: "Components/Badge",
  component: Badge,
  parameters: {
    docs: {
      description: {
        component: `
A versatile badge component with semantic variants and polymorphic rendering via a \`render\` prop.

\`\`\`tsx
import { Badge } from "@keystone/ui/badge";

// Default badge
<Badge>New</Badge>

// Semantic variants
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Destructive</Badge>
<Badge variant="outline">Outline</Badge>
<Badge variant="ghost">Ghost</Badge>
<Badge variant="link">Link</Badge>

// Badge sizes
<Badge size="sm">Small</Badge>
<Badge>Default</Badge>

// Badge as a link (render prop)
<Badge render={<a href="/page" />}>
  Open Link
  <ArrowUpRightIcon data-icon="inline-end" />
</Badge>

// Custom colors via className
<Badge className="bg-blue-500/15 text-blue-700 border-transparent dark:text-blue-400">
  Blue
</Badge>

// With icons using data-icon
<Badge variant="secondary">
  <BadgeCheckIcon data-icon="inline-start" />
  Verified
</Badge>

// Removable badge
<Badge className="gap-0">
  Removable
  <button
    className="focus-visible:border-ring focus-visible:ring-ring/50 text-foreground/60 hover:text-foreground -my-px -ms-px -me-1.5 inline-flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-[inherit] p-0 transition-[color,box-shadow] outline-none focus-visible:ring-[3px]"
    onClick={() => handleRemove()}
  >
    <XIcon size={12} aria-hidden="true" />
  </button>
</Badge>
\`\`\`

## Features

- Semantic variants: default, secondary, destructive, outline, ghost, link
- Two sizes: sm, default
- Polymorphic rendering via \`render\` prop (e.g., render as a link)
- Custom colors via className overrides
- \`data-icon\` support for inline-start/inline-end icon padding
- Support for custom content including status indicators and spinners
- Removable with a close button
- Rounded design for modern UI
- Dark mode support
`,
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: [
        "default",
        "secondary",
        "destructive",
        "outline",
        "ghost",
        "link",
      ],
      defaultValue: "default",
      description: "The semantic variant of the badge",
    },
    size: {
      control: "select",
      options: ["sm", "default"],
      defaultValue: "default",
      description: "The size of the badge",
    },
    className: {
      control: "text",
      description: "Additional CSS classes to apply to the badge",
    },
    children: {
      control: "text",
      description: "The content of the badge",
      defaultValue: "Badge",
    },
  },
} as Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof Badge>;

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  args: {
    children: "Badge",
  },
};

// ---------------------------------------------------------------------------
// Variants
// ---------------------------------------------------------------------------

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge>Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="ghost">Ghost</Badge>
      <Badge variant="link">Link</Badge>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Sizes
// ---------------------------------------------------------------------------

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Badge size="sm">Small</Badge>
      <Badge size="default">Default</Badge>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// As Link
// ---------------------------------------------------------------------------

export const AsLink: Story = {
  name: "As Link",
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge render={<a href="#link" />}>
        Open Link
        <ArrowUpRightIcon data-icon="inline-end" />
      </Badge>
      <Badge render={<a href="#link" />} variant="secondary">
        Secondary Link
        <ArrowUpRightIcon data-icon="inline-end" />
      </Badge>
      <Badge render={<a href="#link" />} variant="outline">
        Outline Link
        <ArrowUpRightIcon data-icon="inline-end" />
      </Badge>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// With Icon
// ---------------------------------------------------------------------------

export const WithIcon: Story = {
  name: "With Icon",
  render: () => (
    <div className="space-y-4">
      <h3 className="mb-2 font-medium text-sm">data-icon padding</h3>
      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary">
          <BadgeCheckIcon data-icon="inline-start" />
          Verified
        </Badge>
        <Badge variant="outline">
          Bookmark
          <BookmarkIcon data-icon="inline-end" />
        </Badge>
      </div>

      <h3 className="mt-4 mb-2 font-medium text-sm">With Status Dots</h3>
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">
          <span
            aria-hidden="true"
            className="size-1.5 rounded-full bg-green-500"
          />
          Active
        </Badge>
        <Badge variant="outline">
          <span
            aria-hidden="true"
            className="size-1.5 rounded-full bg-yellow-500"
          />
          Pending
        </Badge>
        <Badge variant="outline">
          <span
            aria-hidden="true"
            className="size-1.5 rounded-full bg-red-500"
          />
          Failed
        </Badge>
        <Badge variant="outline">
          <span
            aria-hidden="true"
            className="size-1.5 rounded-full bg-blue-500"
          />
          Processing
        </Badge>
        <Badge variant="outline">
          <span
            aria-hidden="true"
            className="size-1.5 rounded-full bg-gray-400"
          />
          Inactive
        </Badge>
        <Badge variant="outline">
          <span
            aria-hidden="true"
            className="size-1.5 rounded-full bg-purple-500"
          />
          Custom
        </Badge>
      </div>

      <h3 className="mt-4 mb-2 font-medium text-sm">With Status Indicators</h3>
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">
          <span
            aria-hidden="true"
            className="size-1.5 rounded-full bg-green-500"
          />
          Online
        </Badge>
        <Badge variant="outline">
          <span
            aria-hidden="true"
            className="size-1.5 rounded-full bg-yellow-500"
          />
          Away
        </Badge>
        <Badge variant="outline">
          <span
            aria-hidden="true"
            className="size-1.5 rounded-full bg-red-500"
          />
          Offline
        </Badge>
        <Badge variant="outline">
          <span
            aria-hidden="true"
            className="size-1.5 rounded-full bg-blue-500"
          />
          Busy
        </Badge>
        <Badge variant="outline">
          <span
            aria-hidden="true"
            className="size-1.5 rounded-full bg-purple-500"
          />
          Do Not Disturb
        </Badge>
        <Badge variant="outline">
          <span
            aria-hidden="true"
            className="size-1.5 rounded-full bg-gray-500"
          />
          Invisible
        </Badge>
      </div>

      <h3 className="mt-4 mb-2 font-medium text-sm">With Icons</h3>
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">
          <CheckIcon aria-hidden="true" className="text-emerald-500" />
          Completed
        </Badge>
        <Badge variant="outline">
          <XIcon aria-hidden="true" className="text-red-500" />
          Rejected
        </Badge>
        <Badge variant="outline">
          <AlertCircleIcon aria-hidden="true" className="text-amber-500" />
          Warning
        </Badge>
        <Badge variant="outline">
          <InfoIcon aria-hidden="true" className="text-blue-500" />
          Information
        </Badge>
      </div>

      <h3 className="mt-4 mb-2 font-medium text-sm">
        Custom Colored Badges with Icons
      </h3>
      <div className="flex flex-wrap gap-2">
        <Badge className="border-transparent bg-green-500/15 text-green-700 dark:bg-green-500/10 dark:text-green-400">
          <CheckIcon aria-hidden="true" />
          Approved
        </Badge>
        <Badge className="border-transparent bg-red-500/15 text-red-700 dark:bg-red-500/10 dark:text-red-400">
          <XIcon aria-hidden="true" />
          Declined
        </Badge>
        <Badge className="border-transparent bg-amber-400/20 text-amber-700 dark:bg-amber-400/10 dark:text-amber-400">
          <AlertCircleIcon aria-hidden="true" />
          Caution
        </Badge>
        <Badge className="border-transparent bg-blue-500/15 text-blue-700 dark:text-blue-400">
          <InfoIcon aria-hidden="true" />
          Notice
        </Badge>
        <Badge className="border-transparent bg-purple-500/15 text-purple-700 dark:text-purple-400">
          <CheckIcon aria-hidden="true" />
          Verified
        </Badge>
        <Badge className="border-transparent bg-indigo-500/15 text-indigo-700 dark:text-indigo-400">
          <InfoIcon aria-hidden="true" />
          Details
        </Badge>
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// With Spinner
// ---------------------------------------------------------------------------

export const WithSpinner: Story = {
  name: "With Spinner",
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="destructive">
        <Spinner data-icon="inline-start" />
        Deleting
      </Badge>
      <Badge variant="secondary">
        Generating
        <Spinner data-icon="inline-end" />
      </Badge>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Custom Colors
// ---------------------------------------------------------------------------

export const CustomColors: Story = {
  name: "Custom Colors",
  render: () => (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <Badge className="border-transparent bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
          Blue
        </Badge>
        <Badge className="border-transparent bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">
          Green
        </Badge>
        <Badge className="border-transparent bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
          Sky
        </Badge>
        <Badge className="border-transparent bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
          Purple
        </Badge>
        <Badge className="border-transparent bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300">
          Red
        </Badge>
      </div>

      <h3 className="font-medium text-sm">Full Tailwind Color Palette</h3>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        <Badge variant="outline">Default</Badge>
        <Badge className="border-transparent bg-red-500/15 text-red-700 dark:bg-red-500/10 dark:text-red-400">
          Red
        </Badge>
        <Badge className="border-transparent bg-orange-500/15 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400">
          Orange
        </Badge>
        <Badge className="border-transparent bg-amber-400/20 text-amber-700 dark:bg-amber-400/10 dark:text-amber-400">
          Amber
        </Badge>
        <Badge className="border-transparent bg-yellow-400/20 text-yellow-700 dark:bg-yellow-400/10 dark:text-yellow-300">
          Yellow
        </Badge>
        <Badge className="border-transparent bg-lime-400/20 text-lime-700 dark:bg-lime-400/10 dark:text-lime-300">
          Lime
        </Badge>
        <Badge className="border-transparent bg-green-500/15 text-green-700 dark:bg-green-500/10 dark:text-green-400">
          Green
        </Badge>
        <Badge className="border-transparent bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
          Emerald
        </Badge>
        <Badge className="border-transparent bg-teal-500/15 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300">
          Teal
        </Badge>
        <Badge className="border-transparent bg-cyan-400/20 text-cyan-700 dark:bg-cyan-400/10 dark:text-cyan-300">
          Cyan
        </Badge>
        <Badge className="border-transparent bg-sky-500/15 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300">
          Sky
        </Badge>
        <Badge className="border-transparent bg-blue-500/15 text-blue-700 dark:text-blue-400">
          Blue
        </Badge>
        <Badge className="border-transparent bg-indigo-500/15 text-indigo-700 dark:text-indigo-400">
          Indigo
        </Badge>
        <Badge className="border-transparent bg-violet-500/15 text-violet-700 dark:text-violet-400">
          Violet
        </Badge>
        <Badge className="border-transparent bg-purple-500/15 text-purple-700 dark:text-purple-400">
          Purple
        </Badge>
        <Badge className="border-transparent bg-fuchsia-400/15 text-fuchsia-700 dark:bg-fuchsia-400/10 dark:text-fuchsia-400">
          Fuchsia
        </Badge>
        <Badge className="border-transparent bg-pink-400/15 text-pink-700 dark:bg-pink-400/10 dark:text-pink-400">
          Pink
        </Badge>
        <Badge className="border-transparent bg-rose-400/15 text-rose-700 dark:bg-rose-400/10 dark:text-rose-400">
          Rose
        </Badge>
        <Badge className="border-transparent bg-slate-600/10 text-slate-700 dark:bg-white/5 dark:text-slate-400">
          Slate
        </Badge>
        <Badge className="border-transparent bg-gray-600/10 text-gray-700 dark:bg-white/5 dark:text-gray-400">
          Gray
        </Badge>
        <Badge className="border-transparent bg-zinc-600/10 text-zinc-700 dark:bg-white/5 dark:text-zinc-400">
          Zinc
        </Badge>
        <Badge className="border-transparent bg-neutral-600/10 text-neutral-700 dark:bg-white/5 dark:text-neutral-400">
          Neutral
        </Badge>
        <Badge className="border-transparent bg-stone-600/10 text-stone-700 dark:bg-white/5 dark:text-stone-400">
          Stone
        </Badge>
      </div>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Removable Badges
// ---------------------------------------------------------------------------

export const RemovableBadges: Story = {
  name: "Removable",
  render: () => {
    const handleRemove = (_key: string, element: HTMLElement) => {
      const badge = element.closest(".badge-container");
      if (badge) {
        badge.classList.add("hidden");
      }
      const resetButton = document.getElementById("reset-badges-button");
      if (resetButton) {
        resetButton.classList.remove("hidden");
      }
    };

    const resetBadges = () => {
      document.querySelectorAll(".badge-container.hidden").forEach((badge) => {
        badge.classList.remove("hidden");
      });
      const resetButton = document.getElementById("reset-badges-button");
      if (resetButton) {
        resetButton.classList.add("hidden");
      }
    };

    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="badge-container">
              <Badge className="gap-0" variant="outline">
                Removable
                <button
                  className="-my-px -ms-px -me-1.5 inline-flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-[inherit] p-0 text-foreground/60 outline-none transition-[color,box-shadow] hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  onClick={(e) => handleRemove("default", e.currentTarget)}
                >
                  <XIcon aria-hidden="true" size={12} />
                </button>
              </Badge>
            </div>

            <div className="badge-container">
              <Badge className="gap-0 border-transparent bg-blue-500/15 text-blue-700 dark:text-blue-400">
                Info
                <button
                  className="-my-px -ms-px -me-1.5 inline-flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-[inherit] p-0 text-blue-700/60 outline-none transition-[color,box-shadow] hover:text-blue-700 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:text-blue-400/60 dark:hover:text-blue-400"
                  onClick={(e) => handleRemove("blue", e.currentTarget)}
                >
                  <XIcon aria-hidden="true" size={12} />
                </button>
              </Badge>
            </div>

            <div className="badge-container">
              <Badge className="gap-0 border-transparent bg-green-500/15 text-green-700 dark:bg-green-500/10 dark:text-green-400">
                Success
                <button
                  className="-my-px -ms-px -me-1.5 inline-flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-[inherit] p-0 text-green-700/60 outline-none transition-[color,box-shadow] hover:text-green-700 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:text-green-400/60 dark:hover:text-green-400"
                  onClick={(e) => handleRemove("green", e.currentTarget)}
                >
                  <XIcon aria-hidden="true" size={12} />
                </button>
              </Badge>
            </div>

            <div className="badge-container">
              <Badge className="gap-0 border-transparent bg-red-500/15 text-red-700 dark:bg-red-500/10 dark:text-red-400">
                Error
                <button
                  className="-my-px -ms-px -me-1.5 inline-flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-[inherit] p-0 text-red-700/60 outline-none transition-[color,box-shadow] hover:text-red-700 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:text-red-400/60 dark:hover:text-red-400"
                  onClick={(e) => handleRemove("red", e.currentTarget)}
                >
                  <XIcon aria-hidden="true" size={12} />
                </button>
              </Badge>
            </div>

            <div className="badge-container">
              <Badge className="gap-0 border-transparent bg-purple-500/15 text-purple-700 dark:text-purple-400">
                Tag
                <button
                  className="-my-px -ms-px -me-1.5 inline-flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-[inherit] p-0 text-purple-700/60 outline-none transition-[color,box-shadow] hover:text-purple-700 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:text-purple-400/60 dark:hover:text-purple-400"
                  onClick={(e) => handleRemove("purple", e.currentTarget)}
                >
                  <XIcon aria-hidden="true" size={12} />
                </button>
              </Badge>
            </div>

            <div className="badge-container">
              <Badge className="gap-0 border-transparent bg-amber-400/20 text-amber-700 dark:bg-amber-400/10 dark:text-amber-400">
                Warning
                <button
                  className="-my-px -ms-px -me-1.5 inline-flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-[inherit] p-0 text-amber-700/60 outline-none transition-[color,box-shadow] hover:text-amber-700 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:text-amber-400/60 dark:hover:text-amber-400"
                  onClick={(e) => handleRemove("amber", e.currentTarget)}
                >
                  <XIcon aria-hidden="true" size={12} />
                </button>
              </Badge>
            </div>

            <div className="badge-container">
              <Badge className="gap-0 border-transparent bg-indigo-500/15 text-indigo-700 dark:text-indigo-400">
                Indigo
                <button
                  className="-my-px -ms-px -me-1.5 inline-flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-[inherit] p-0 text-indigo-700/60 outline-none transition-[color,box-shadow] hover:text-indigo-700 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:text-indigo-400/60 dark:hover:text-indigo-400"
                  onClick={(e) => handleRemove("indigo", e.currentTarget)}
                >
                  <XIcon aria-hidden="true" size={12} />
                </button>
              </Badge>
            </div>

            <div className="badge-container">
              <Badge className="gap-0 border-transparent bg-pink-400/15 text-pink-700 dark:bg-pink-400/10 dark:text-pink-400">
                Pink
                <button
                  className="-my-px -ms-px -me-1.5 inline-flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-[inherit] p-0 text-pink-700/60 outline-none transition-[color,box-shadow] hover:text-pink-700 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:text-pink-400/60 dark:hover:text-pink-400"
                  onClick={(e) => handleRemove("pink", e.currentTarget)}
                >
                  <XIcon aria-hidden="true" size={12} />
                </button>
              </Badge>
            </div>
          </div>

          <button
            className="mt-2 hidden w-fit text-blue-600 text-sm hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            id="reset-badges-button"
            onClick={resetBadges}
          >
            Reset badges
          </button>
        </div>
      </div>
    );
  },
};

// ---------------------------------------------------------------------------
// Stats Badges
// ---------------------------------------------------------------------------

export const StatsBadges: Story = {
  name: "Stats",
  render: () => {
    return (
      <div className="space-y-8">
        {/* Property listing stats */}
        <div>
          <h3 className="mb-3 font-medium text-lg">Property Listing Stats</h3>
          <div className="rounded-lg border bg-card p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">
                <BedIcon />4
              </Badge>
              <Badge variant="outline">
                <BathIcon />2
              </Badge>
              <Badge variant="outline">
                <LandPlotIcon />
                350m²
              </Badge>
              <div className="ml-auto font-medium tabular-nums">$135,000</div>
            </div>
          </div>
        </div>

        {/* Numeric badges */}
        <div>
          <h3 className="mb-3 font-medium text-lg">Numeric Badges</h3>
          <div className="flex flex-wrap gap-3">
            <Badge>1</Badge>
            <Badge className="border-transparent bg-blue-500/15 text-blue-700 dark:text-blue-400">
              42
            </Badge>
            <Badge className="border-transparent bg-red-500/15 text-red-700 dark:bg-red-500/10 dark:text-red-400">
              99+
            </Badge>
            <Badge className="border-transparent bg-green-500/15 text-green-700 dark:bg-green-500/10 dark:text-green-400">
              $24.99
            </Badge>
            <Badge className="border-transparent bg-purple-500/15 text-purple-700 dark:text-purple-400">
              5.0
            </Badge>
            <Badge className="border-transparent bg-amber-400/20 text-amber-700 dark:bg-amber-400/10 dark:text-amber-400">
              3/5
            </Badge>
          </div>
        </div>

        {/* Stats with icons */}
        <div>
          <h3 className="mb-3 font-medium text-lg">Stats with Icons</h3>
          <div className="flex flex-wrap gap-3">
            <Badge className="border-transparent bg-blue-500/15 text-blue-700 dark:text-blue-400">
              <UsersIcon />
              128 users
            </Badge>
            <Badge className="border-transparent bg-green-500/15 text-green-700 dark:bg-green-500/10 dark:text-green-400">
              <CheckIcon />
              87% complete
            </Badge>
            <Badge className="border-transparent bg-amber-400/20 text-amber-700 dark:bg-amber-400/10 dark:text-amber-400">
              <CalendarIcon />3 days left
            </Badge>
            <Badge className="border-transparent bg-red-500/15 text-red-700 dark:bg-red-500/10 dark:text-red-400">
              <AlertCircleIcon />2 issues
            </Badge>
          </div>
        </div>

        {/* Card with stats footer */}
        <div>
          <h3 className="mb-3 font-medium text-lg">Card with Stats Footer</h3>
          <div className="overflow-hidden rounded-lg border bg-card">
            <div className="border-b p-4">
              <h4 className="font-medium">Luxury Apartment</h4>
              <p className="text-muted-foreground text-sm">
                123 Main Street, Anytown
              </p>
            </div>
            <div className="p-4">
              <p className="text-sm">
                Modern apartment with stunning views and premium amenities.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 bg-muted/50 px-4 py-3">
              <Badge variant="outline">
                <BedIcon />3
              </Badge>
              <Badge variant="outline">
                <BathIcon />2
              </Badge>
              <Badge variant="outline">
                <LandPlotIcon />
                120m²
              </Badge>
              <div className="ml-auto font-medium tabular-nums">$1,200/mo</div>
            </div>
          </div>
        </div>
      </div>
    );
  },
};
