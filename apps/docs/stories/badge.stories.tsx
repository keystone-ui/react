import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge } from "@keystone/ui/badge";
import { CheckIcon, XIcon, AlertCircleIcon, InfoIcon, DownloadIcon, BedIcon, BathIcon, LandPlotIcon, UsersIcon, CalendarIcon } from "lucide-react";

const meta = {
  title: "Components/Badge",
  component: Badge,
  parameters: {
    docs: {
      description: {
        component: `
A versatile badge component with support for different color variants and sizes.

\`\`\`tsx
import { Badge } from "@keystone/ui/badge";

// Default badge
<Badge>New</Badge>

// Badge color variants
<Badge variant="red">Red</Badge>
<Badge variant="blue">Blue</Badge>
<Badge variant="green">Green</Badge>
<Badge variant="purple">Purple</Badge>
<Badge variant="zinc">Zinc</Badge>

// Badge sizes
<Badge size="xs">Extra Small</Badge>
<Badge size="sm">Small</Badge>
<Badge>Default</Badge>

// Status badge with custom indicator
<Badge>
  <span className="size-1.5 rounded-full bg-green-500" aria-hidden="true"></span>
  Online
</Badge>

// Badge as a button
<Badge asButton onClick={() => console.log('Badge clicked')}>
  Clickable Badge
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

- Multiple color variants: red, orange, amber, yellow, lime, green, emerald, teal, cyan, sky, blue, indigo, violet, purple, fuchsia, pink, rose, slate, gray, zinc, neutral, stone
- Three sizes: xs, sm, default
- Support for custom content including status indicators
- Can be rendered as a button with onClick handler
- Can be made removable with a close button
- Rounded design for modern UI
- Dark mode support with optimized colors
- Consistent sizing with 1px border (visible by default)
- Built-in gap spacing between elements
`,
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: [
        "default", "red", "orange", "amber", "yellow", "lime", "green", "emerald", 
        "teal", "cyan", "sky", "blue", "indigo", "violet", "purple", 
        "fuchsia", "pink", "rose", "slate", "gray", "zinc", "neutral", "stone"
      ],
      defaultValue: "default",
      description: "The color variant of the badge",
    },
    size: {
      control: "select",
      options: ["xs", "sm", "default"],
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

// Base badge variants
export const Default: Story = {
  args: {
    children: "Badge",
  },
};

// Badge sizes
export const ExtraSmall: Story = {
  args: {
    children: "Extra Small",
    size: "xs",
  },
};

export const Small: Story = {
  args: {
    children: "Small",
    size: "sm",
  },
};

export const DefaultSize: Story = {
  args: {
    children: "Default",
    size: "default",
  },
};

// Color variants
export const ColorVariants: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        <Badge>Default</Badge>
        <Badge variant="red">Red</Badge>
        <Badge variant="orange">Orange</Badge>
        <Badge variant="amber">Amber</Badge>
        <Badge variant="yellow">Yellow</Badge>
        <Badge variant="lime">Lime</Badge>
        <Badge variant="green">Green</Badge>
        <Badge variant="emerald">Emerald</Badge>
        <Badge variant="teal">Teal</Badge>
        <Badge variant="cyan">Cyan</Badge>
        <Badge variant="sky">Sky</Badge>
        <Badge variant="blue">Blue</Badge>
        <Badge variant="indigo">Indigo</Badge>
        <Badge variant="violet">Violet</Badge>
        <Badge variant="purple">Purple</Badge>
        <Badge variant="fuchsia">Fuchsia</Badge>
        <Badge variant="pink">Pink</Badge>
        <Badge variant="rose">Rose</Badge>
        <Badge variant="slate">Slate</Badge>
        <Badge variant="gray">Gray</Badge>
        <Badge variant="zinc">Zinc</Badge>
        <Badge variant="neutral">Neutral</Badge>
        <Badge variant="stone">Stone</Badge>
      </div>
    </div>
  ),
};

// Icon badges
export const IconBadges: Story = {
  render: () => (
    <div className="space-y-4">
      <h3 className="text-sm font-medium mb-2">With Status Dots</h3>
      <div className="flex flex-wrap gap-2">
        <Badge>
          <span className="size-1.5 rounded-full bg-green-500" aria-hidden="true"></span>
          Active
        </Badge>
        <Badge>
          <span className="size-1.5 rounded-full bg-yellow-500" aria-hidden="true"></span>
          Pending
        </Badge>
        <Badge>
          <span className="size-1.5 rounded-full bg-red-500" aria-hidden="true"></span>
          Failed
        </Badge>
        <Badge>
          <span className="size-1.5 rounded-full bg-blue-500" aria-hidden="true"></span>
          Processing
        </Badge>
        <Badge>
          <span className="size-1.5 rounded-full bg-gray-400" aria-hidden="true"></span>
          Inactive
        </Badge>
        <Badge>
          <span className="size-1.5 rounded-full bg-purple-500" aria-hidden="true"></span>
          Custom
        </Badge>
      </div>
      
      <h3 className="text-sm font-medium mt-4 mb-2">With Status Indicators</h3>
      <div className="flex flex-wrap gap-2">
        <Badge>
          <span className="size-1.5 rounded-full bg-green-500" aria-hidden="true"></span>
          Online
        </Badge>
        <Badge>
          <span className="size-1.5 rounded-full bg-yellow-500" aria-hidden="true"></span>
          Away
        </Badge>
        <Badge>
          <span className="size-1.5 rounded-full bg-red-500" aria-hidden="true"></span>
          Offline
        </Badge>
        <Badge>
          <span className="size-1.5 rounded-full bg-blue-500" aria-hidden="true"></span>
          Busy
        </Badge>
        <Badge>
          <span className="size-1.5 rounded-full bg-purple-500" aria-hidden="true"></span>
          Do Not Disturb
        </Badge>
        <Badge>
          <span className="size-1.5 rounded-full bg-gray-500" aria-hidden="true"></span>
          Invisible
        </Badge>
      </div>
      
      <h3 className="text-sm font-medium mt-4 mb-2">With Icons</h3>
      <div className="flex flex-wrap gap-2">
        <Badge>
          <CheckIcon className="text-emerald-500" aria-hidden="true" />
          Completed
        </Badge>
        <Badge>
          <XIcon className="text-red-500" aria-hidden="true" />
          Rejected
        </Badge>
        <Badge>
          <AlertCircleIcon className="text-amber-500" aria-hidden="true" />
          Warning
        </Badge>
        <Badge>
          <InfoIcon className="text-blue-500" aria-hidden="true" />
          Information
        </Badge>
      </div>
      
      <h3 className="text-sm font-medium mt-4 mb-2">Custom Colored Badges with Icons</h3>
      <div className="flex flex-wrap gap-2">
        <Badge variant="green">
          <CheckIcon aria-hidden="true" />
          Approved
        </Badge>
        <Badge variant="red">
          <XIcon aria-hidden="true" />
          Declined
        </Badge>
        <Badge variant="amber">
          <AlertCircleIcon aria-hidden="true" />
          Caution
        </Badge>
        <Badge variant="blue">
          <InfoIcon aria-hidden="true" />
          Notice
        </Badge>
        <Badge variant="purple">
          <CheckIcon aria-hidden="true" />
          Verified
        </Badge>
        <Badge variant="indigo">
          <InfoIcon aria-hidden="true" />
          Details
        </Badge>
      </div>
    </div>
  ),
};

// Link badges
export const LinkBadges: Story = {
  name: "Button Badges",
  render: () => (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-medium">Badge Buttons</h3>
        <div className="flex flex-wrap items-center gap-4">
          <Badge asButton onClick={() => console.log("Default badge clicked")}>
            Click me
          </Badge>
          <Badge asButton onClick={() => console.log("Blue badge clicked")} variant="blue">
            Click me
          </Badge>
          <Badge asButton onClick={() => console.log("Green badge clicked")} variant="green">
            Click me
          </Badge>
          <Badge asButton onClick={() => console.log("Red badge clicked")} variant="red">
            Click me
          </Badge>
          <Badge asButton onClick={() => console.log("Small badge clicked")} size="sm">
            Click me
          </Badge>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-medium">Interactive Badges with Icons</h3>
        <div className="flex flex-wrap items-center gap-4">
          <Badge asButton onClick={() => console.log("Info badge clicked")}>
            <InfoIcon className="size-3" />
            Info
          </Badge>
          <Badge asButton onClick={() => console.log("Download badge clicked")} variant="blue">
            <DownloadIcon className="size-3" />
            Download
          </Badge>
          <Badge asButton onClick={() => console.log("Success badge clicked")} variant="green">
            <CheckIcon className="size-3" />
            Success
          </Badge>
        </div>
      </div>
    </div>
  ),
};

// Removable badges
export const RemovableBadges: Story = {
  render: () => {
    // Using a simple object to track visibility instead of React.useState
    // This avoids the need for React import in Storybook
    const visibilityState = {
      default: true,
      blue: true,
      green: true,
      red: true,
      purple: true,
      amber: true,
      indigo: true,
      pink: true
    };
    
    // Create a simple state management system
    let visibleBadges = { ...visibilityState };
    
    // Function to handle badge removal
    const handleRemove = (key: string, element: HTMLElement) => {
      // Find the parent badge element and hide it
      const badge = element.closest('.badge-container');
      if (badge) {
        badge.classList.add('hidden');
      }
      
      // Show the reset button if any badge is hidden
      const resetButton = document.getElementById('reset-badges-button');
      if (resetButton) {
        resetButton.classList.remove('hidden');
      }
    };
    
    // Function to reset all badges
    const resetBadges = () => {
      // Show all badges
      document.querySelectorAll('.badge-container.hidden').forEach(badge => {
        badge.classList.remove('hidden');
      });
      
      // Hide the reset button
      const resetButton = document.getElementById('reset-badges-button');
      if (resetButton) {
        resetButton.classList.add('hidden');
      }
    };

    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-medium">Removable Badges</h3>
          <div className="flex flex-wrap items-center gap-4">
            <div className="badge-container">
              <Badge className="gap-0">
                Removable
                <button
                  className="focus-visible:border-ring focus-visible:ring-ring/50 text-foreground/60 hover:text-foreground -my-px -ms-px -me-1.5 inline-flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-[inherit] p-0 transition-[color,box-shadow] outline-none focus-visible:ring-[3px]"
                  onClick={(e) => handleRemove('default', e.currentTarget)}
                >
                  <XIcon size={12} aria-hidden="true" />
                </button>
              </Badge>
            </div>
            
            <div className="badge-container">
              <Badge variant="blue" className="gap-0">
                Info
                <button
                  className="focus-visible:border-ring focus-visible:ring-ring/50 text-blue-700/60 hover:text-blue-700 dark:text-blue-400/60 dark:hover:text-blue-400 -my-px -ms-px -me-1.5 inline-flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-[inherit] p-0 transition-[color,box-shadow] outline-none focus-visible:ring-[3px]"
                  onClick={(e) => handleRemove('blue', e.currentTarget)}
                >
                  <XIcon size={12} aria-hidden="true" />
                </button>
              </Badge>
            </div>
            
            <div className="badge-container">
              <Badge variant="green" className="gap-0">
                Success
                <button
                  className="focus-visible:border-ring focus-visible:ring-ring/50 text-green-700/60 hover:text-green-700 dark:text-green-400/60 dark:hover:text-green-400 -my-px -ms-px -me-1.5 inline-flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-[inherit] p-0 transition-[color,box-shadow] outline-none focus-visible:ring-[3px]"
                  onClick={(e) => handleRemove('green', e.currentTarget)}
                >
                  <XIcon size={12} aria-hidden="true" />
                </button>
              </Badge>
            </div>
            
            <div className="badge-container">
              <Badge variant="red" className="gap-0">
                Error
                <button
                  className="focus-visible:border-ring focus-visible:ring-ring/50 text-red-700/60 hover:text-red-700 dark:text-red-400/60 dark:hover:text-red-400 -my-px -ms-px -me-1.5 inline-flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-[inherit] p-0 transition-[color,box-shadow] outline-none focus-visible:ring-[3px]"
                  onClick={(e) => handleRemove('red', e.currentTarget)}
                >
                  <XIcon size={12} aria-hidden="true" />
                </button>
              </Badge>
            </div>
            
            <div className="badge-container">
              <Badge variant="purple" className="gap-0">
                Tag
                <button
                  className="focus-visible:border-ring focus-visible:ring-ring/50 text-purple-700/60 hover:text-purple-700 dark:text-purple-400/60 dark:hover:text-purple-400 -my-px -ms-px -me-1.5 inline-flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-[inherit] p-0 transition-[color,box-shadow] outline-none focus-visible:ring-[3px]"
                  onClick={(e) => handleRemove('purple', e.currentTarget)}
                >
                  <XIcon size={12} aria-hidden="true" />
                </button>
              </Badge>
            </div>
            
            <div className="badge-container">
              <Badge variant="amber" className="gap-0">
                Warning
                <button
                  className="focus-visible:border-ring focus-visible:ring-ring/50 text-amber-700/60 hover:text-amber-700 dark:text-amber-400/60 dark:hover:text-amber-400 -my-px -ms-px -me-1.5 inline-flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-[inherit] p-0 transition-[color,box-shadow] outline-none focus-visible:ring-[3px]"
                  onClick={(e) => handleRemove('amber', e.currentTarget)}
                >
                  <XIcon size={12} aria-hidden="true" />
                </button>
              </Badge>
            </div>
            
            <div className="badge-container">
              <Badge variant="indigo" className="gap-0">
                Indigo
                <button
                  className="focus-visible:border-ring focus-visible:ring-ring/50 text-indigo-700/60 hover:text-indigo-700 dark:text-indigo-400/60 dark:hover:text-indigo-400 -my-px -ms-px -me-1.5 inline-flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-[inherit] p-0 transition-[color,box-shadow] outline-none focus-visible:ring-[3px]"
                  onClick={(e) => handleRemove('indigo', e.currentTarget)}
                >
                  <XIcon size={12} aria-hidden="true" />
                </button>
              </Badge>
            </div>
            
            <div className="badge-container">
              <Badge variant="pink" className="gap-0">
                Pink
                <button
                  className="focus-visible:border-ring focus-visible:ring-ring/50 text-pink-700/60 hover:text-pink-700 dark:text-pink-400/60 dark:hover:text-pink-400 -my-px -ms-px -me-1.5 inline-flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-[inherit] p-0 transition-[color,box-shadow] outline-none focus-visible:ring-[3px]"
                  onClick={(e) => handleRemove('pink', e.currentTarget)}
                >
                  <XIcon size={12} aria-hidden="true" />
                </button>
              </Badge>
            </div>
          </div>
          
          <button
            id="reset-badges-button"
            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mt-2 w-fit hidden"
            onClick={resetBadges}
          >
            Reset badges
          </button>
        </div>
      </div>
    );
  },
};

// Stats badges example
export const StatsBadges: Story = {
  render: () => {
    return (
      <div className="space-y-8">
        {/* Property listing stats */}
        <div>
          <h3 className="text-lg font-medium mb-3">Property Listing Stats</h3>
          <div className="p-4 border rounded-lg bg-card">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="default" size="sm">
                <BedIcon />
                4
              </Badge>
              <Badge variant="default" size="sm">
                <BathIcon />
                2
              </Badge>
              <Badge variant="default" size="sm">
                <LandPlotIcon />
                350m²
              </Badge>
              <div className="ml-auto font-medium tabular-nums">$135,000</div>
            </div>
          </div>
        </div>
        
        {/* Numeric badges */}
        <div>
          <h3 className="text-lg font-medium mb-3">Numeric Badges</h3>
          <div className="flex flex-wrap gap-3">
            <Badge>1</Badge>
            <Badge variant="blue">42</Badge>
            <Badge variant="red">99+</Badge>
            <Badge variant="green">$24.99</Badge>
            <Badge variant="purple">5.0</Badge>
            <Badge variant="amber">3/5</Badge>
          </div>
        </div>
        
        {/* Stats with icons */}
        <div>
          <h3 className="text-lg font-medium mb-3">Stats with Icons</h3>
          <div className="flex flex-wrap gap-3">
            <Badge variant="blue">
              <UsersIcon />
              128 users
            </Badge>
            <Badge variant="green">
              <CheckIcon />
              87% complete
            </Badge>
            <Badge variant="amber">
              <CalendarIcon />
              3 days left
            </Badge>
            <Badge variant="red">
              <AlertCircleIcon />
              2 issues
            </Badge>
          </div>
        </div>
        
        {/* Card with stats footer */}
        <div>
          <h3 className="text-lg font-medium mb-3">Card with Stats Footer</h3>
          <div className="border rounded-lg overflow-hidden bg-card">
            <div className="p-4 border-b">
              <h4 className="font-medium">Luxury Apartment</h4>
              <p className="text-sm text-muted-foreground">123 Main Street, Anytown</p>
            </div>
            <div className="p-4">
              <p className="text-sm">Modern apartment with stunning views and premium amenities.</p>
            </div>
            <div className="px-4 py-3 bg-muted/50 flex items-center gap-2 flex-wrap">
              <Badge variant="default" size="sm">
                <BedIcon />
                3
              </Badge>
              <Badge variant="default" size="sm">
                <BathIcon />
                2
              </Badge>
              <Badge variant="default" size="sm">
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