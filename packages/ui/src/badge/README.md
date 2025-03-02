# Badge Component

A versatile badge component with support for different color variants, sizes, and interactive functionality.

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

## Usage

```tsx
import { Badge } from "@acme/ui";

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
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `string` | `"default"` | The color variant of the badge. |
| `size` | `"xs" \| "sm" \| "default"` | `"default"` | The size of the badge. |
| `asButton` | `boolean` | `false` | Whether to render the badge as a button. |
| `onClick` | `function` | `undefined` | Function to call when the badge is clicked. |
| `className` | `string` | `""` | Additional CSS classes to apply to the badge. |
| `children` | `ReactNode` | `undefined` | The content of the badge. |

## Examples

### Status Indicators

```tsx
// Active status
<Badge>
  <span className="size-1.5 rounded-full bg-green-500" aria-hidden="true"></span>
  Active
</Badge>

// Pending status
<Badge>
  <span className="size-1.5 rounded-full bg-yellow-500" aria-hidden="true"></span>
  Pending
</Badge>

// Failed status
<Badge>
  <span className="size-1.5 rounded-full bg-red-500" aria-hidden="true"></span>
  Failed
</Badge>
```

### Interactive Badges

```tsx
// Simple button badge
<Badge asButton onClick={() => console.log('Badge clicked')}>
  Click me
</Badge>

// Button badge with icon
<Badge asButton onClick={() => console.log('Info clicked')} variant="blue">
  <InfoIcon className="size-3" />
  Info
</Badge>

// Toggle badge
const [isActive, setIsActive] = useState(false);
<Badge 
  asButton 
  onClick={() => setIsActive(!isActive)}
  variant={isActive ? "green" : "default"}
>
  {isActive ? "Active" : "Inactive"}
</Badge>
```

### Removable Badges

```tsx
// Removable badge component
import { Badge } from "@acme/ui";
import { XIcon } from "lucide-react";
import { useState } from "react";

export function RemovableBadge({ label, variant }) {
  const [isVisible, setIsVisible] = useState(true);
  
  if (!isVisible) return null;
  
  // Determine the appropriate text color based on variant
  const getButtonClasses = () => {
    if (!variant || variant === "default") {
      return "text-foreground/60 hover:text-foreground";
    }
    
    // For colored variants, use their respective text colors
    const variantColors = {
      blue: "text-blue-700/60 hover:text-blue-700 dark:text-blue-400/60 dark:hover:text-blue-400",
      green: "text-green-700/60 hover:text-green-700 dark:text-green-400/60 dark:hover:text-green-400",
      red: "text-red-700/60 hover:text-red-700 dark:text-red-400/60 dark:hover:text-red-400",
      purple: "text-purple-700/60 hover:text-purple-700 dark:text-purple-400/60 dark:hover:text-purple-400",
      // Add more variants as needed
    };
    
    return variantColors[variant] || "text-foreground/60 hover:text-foreground";
  };
  
  return (
    <Badge variant={variant} className="gap-0">
      {label}
      <button
        className={`focus-visible:border-ring focus-visible:ring-ring/50 
                  ${getButtonClasses()}
                  -my-px -ms-px -me-1.5 inline-flex size-5 shrink-0 
                  cursor-pointer items-center justify-center 
                  rounded-[inherit] p-0 transition-[color,box-shadow] 
                  outline-none focus-visible:ring-[3px]`}
        onClick={() => setIsVisible(false)}
      >
        <XIcon size={12} aria-hidden="true" />
      </button>
    </Badge>
  );
}
``` 