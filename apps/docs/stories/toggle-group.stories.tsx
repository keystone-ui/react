import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "@keystone/ui/toggle-group";
import { ToggleRemove } from "@keystone/ui/toggle";
import { Avatar, AvatarImage, AvatarFallback } from "@keystone/ui/avatar";
import {
  NewspaperIcon,
  GlobeIcon,
  GamepadIcon,
  ShoppingCartIcon,
  XIcon,
  CircleXIcon,
} from "lucide-react";

const meta = {
  title: "Components/ToggleGroup",
  component: ToggleGroup,
  parameters: {
    docs: {
      description: {
        component: `
A group of badge-shaped toggle buttons with shared selection state.

\`\`\`tsx
import { ToggleGroup, ToggleGroupItem } from "@keystone/ui/toggle-group";

// Multi-select
<ToggleGroup multiple defaultValue={["fitness", "parking"]}>
  <ToggleGroupItem value="laundry">Laundry</ToggleGroupItem>
  <ToggleGroupItem value="fitness">Fitness center</ToggleGroupItem>
  <ToggleGroupItem value="parking">Parking</ToggleGroupItem>
</ToggleGroup>

// Single select
<ToggleGroup defaultValue={["react"]}>
  <ToggleGroupItem value="react">React</ToggleGroupItem>
  <ToggleGroupItem value="vue">Vue</ToggleGroupItem>
  <ToggleGroupItem value="angular">Angular</ToggleGroupItem>
</ToggleGroup>

// With removal
<ToggleGroup onRemove={(value) => handleRemove(value)}>
  <ToggleGroupItem value="news">News</ToggleGroupItem>
  <ToggleGroupItem value="travel">Travel</ToggleGroupItem>
</ToggleGroup>
\`\`\`

## Features

- Badge-shaped pill styling (rounded-full, 24px height)
- Single or multiple selection modes
- Controlled and uncontrolled value management
- Keyboard navigation via Base UI ToggleGroup primitive
- Optional remove button via \`onRemove\` callback
- Icon and avatar support
- Group-level disabled state
`,
      },
    },
  },
} satisfies Meta<typeof ToggleGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

// ---------------------------------------------------------------------------
// Amenities (Multi-Select)
// ---------------------------------------------------------------------------

export const Amenities: Story = {
  render: () => {
    const [selected, setSelected] = useState<string[]>(["fitness", "parking"]);

    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold">Amenities</p>
        <ToggleGroup
          multiple
          value={selected}
          onValueChange={setSelected}
        >
          <ToggleGroupItem value="laundry">Laundry</ToggleGroupItem>
          <ToggleGroupItem value="fitness">Fitness center</ToggleGroupItem>
          <ToggleGroupItem value="parking">Parking</ToggleGroupItem>
          <ToggleGroupItem value="pool">Swimming pool</ToggleGroupItem>
          <ToggleGroupItem value="breakfast">Breakfast</ToggleGroupItem>
        </ToggleGroup>
        <p className="text-muted-foreground text-sm">
          Selected: {selected.length > 0 ? selected.join(", ") : "none"}
        </p>
      </div>
    );
  },
};

// ---------------------------------------------------------------------------
// Single Selection
// ---------------------------------------------------------------------------

export const SingleSelection: Story = {
  name: "Single Selection",
  render: () => {
    const [selected, setSelected] = useState<string[]>(["react"]);

    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold">Framework</p>
        <ToggleGroup
          value={selected}
          onValueChange={setSelected}
        >
          <ToggleGroupItem value="react">React</ToggleGroupItem>
          <ToggleGroupItem value="vue">Vue</ToggleGroupItem>
          <ToggleGroupItem value="angular">Angular</ToggleGroupItem>
          <ToggleGroupItem value="svelte">Svelte</ToggleGroupItem>
        </ToggleGroup>
        <p className="text-muted-foreground text-sm">
          Selected: {selected.length > 0 ? selected.join(", ") : "none"}
        </p>
      </div>
    );
  },
};

// ---------------------------------------------------------------------------
// With Icons
// ---------------------------------------------------------------------------

export const WithIcons: Story = {
  name: "With Icons",
  render: () => (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-semibold">With Icons</p>
      <ToggleGroup defaultValue={["shopping"]}>
        <ToggleGroupItem value="news">
          <NewspaperIcon />
          News
        </ToggleGroupItem>
        <ToggleGroupItem value="travel">
          <GlobeIcon />
          Travel
        </ToggleGroupItem>
        <ToggleGroupItem value="gaming">
          <GamepadIcon />
          Gaming
        </ToggleGroupItem>
        <ToggleGroupItem value="shopping">
          <ShoppingCartIcon />
          Shopping
        </ToggleGroupItem>
      </ToggleGroup>
      <p className="text-muted-foreground text-sm">Tags with icons</p>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// With Avatars
// ---------------------------------------------------------------------------

const AVATAR_URLS = {
  fred: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=faces",
  michael: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=64&h=64&fit=crop&crop=faces",
  jane: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&fit=crop&crop=faces",
  alice: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=faces",
  bob: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=faces",
  charlie: "https://images.unsplash.com/photo-1599566150163-29194dcabd9c?w=64&h=64&fit=crop&crop=faces",
};

function SmallAvatar({ src, fallback }: { src: string; fallback: string }) {
  return (
    <Avatar size="sm" className="size-4">
      <AvatarImage src={src} alt={fallback} />
      <AvatarFallback className="text-[8px]">{fallback[0]}</AvatarFallback>
    </Avatar>
  );
}

export const WithAvatars: Story = {
  name: "With Avatars",
  render: () => (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-semibold">With Avatars</p>
      <ToggleGroup defaultValue={["jane"]}>
        <ToggleGroupItem value="fred">
          <SmallAvatar src={AVATAR_URLS.fred} fallback="Fred" />
          Fred
        </ToggleGroupItem>
        <ToggleGroupItem value="michael">
          <SmallAvatar src={AVATAR_URLS.michael} fallback="Michael" />
          Michael
        </ToggleGroupItem>
        <ToggleGroupItem value="jane">
          <SmallAvatar src={AVATAR_URLS.jane} fallback="Jane" />
          Jane
        </ToggleGroupItem>
      </ToggleGroup>
      <p className="text-muted-foreground text-sm">Tags with avatars</p>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Default Remove Button
// ---------------------------------------------------------------------------

export const DefaultRemoveButton: Story = {
  name: "Default Remove Button",
  render: () => {
    const [items, setItems] = useState(["news", "travel", "gaming", "shopping"]);
    const labels: Record<string, string> = {
      news: "News",
      travel: "Travel",
      gaming: "Gaming",
      shopping: "Shopping",
    };

    const handleRemove = (value: string) => {
      setItems((prev) => prev.filter((item) => item !== value));
    };

    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold">Default Remove Button</p>
        <ToggleGroup
          defaultValue={["gaming"]}
          onRemove={handleRemove}
        >
          {items.map((item) => (
            <ToggleGroupItem key={item} value={item}>
              {labels[item]}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <p className="text-muted-foreground text-sm">Click the X to remove tags</p>
      </div>
    );
  },
};

// ---------------------------------------------------------------------------
// Custom Remove Button
// ---------------------------------------------------------------------------

export const CustomRemoveButton: Story = {
  name: "Custom Remove Button",
  render: () => {
    const [items, setItems] = useState(["react", "vue", "angular", "svelte"]);

    const handleRemove = (value: string) => {
      setItems((prev) => prev.filter((item) => item !== value));
    };

    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold">Custom Remove Button</p>
        <ToggleGroup className="gap-2">
          {items.map((item) => (
            <ToggleGroupItem
              key={item}
              value={item}
              className="bg-foreground/10 text-foreground"
            >
              {item.charAt(0).toUpperCase() + item.slice(1)}
              <ToggleRemove onClick={() => handleRemove(item)}>
                <CircleXIcon size={12} aria-hidden="true" />
              </ToggleRemove>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <p className="text-muted-foreground text-sm">Custom remove button with icon</p>
      </div>
    );
  },
};

// ---------------------------------------------------------------------------
// With List Data
// ---------------------------------------------------------------------------

interface TeamMember {
  id: string;
  name: string;
  avatar: string;
}

const TEAM_MEMBERS: TeamMember[] = [
  { id: "fred", name: "Fred", avatar: AVATAR_URLS.fred },
  { id: "michael", name: "Michael", avatar: AVATAR_URLS.michael },
  { id: "jane", name: "Jane", avatar: AVATAR_URLS.jane },
  { id: "alice", name: "Alice", avatar: AVATAR_URLS.alice },
  { id: "bob", name: "Bob", avatar: AVATAR_URLS.bob },
  { id: "charlie", name: "Charlie", avatar: AVATAR_URLS.charlie },
];

export const WithListData: Story = {
  name: "With List Data",
  render: () => {
    const [members, setMembers] = useState(TEAM_MEMBERS);
    const [selected, setSelected] = useState<string[]>(["charlie"]);

    const handleRemove = (value: string) => {
      setMembers((prev) => prev.filter((m) => m.id !== value));
      setSelected((prev) => prev.filter((id) => id !== value));
    };

    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold">Team Members</p>
          <ToggleGroup
            multiple
            value={selected}
            onValueChange={setSelected}
            onRemove={handleRemove}
          >
            {members.map((member) => (
              <ToggleGroupItem key={member.id} value={member.id}>
                <SmallAvatar src={member.avatar} fallback={member.name} />
                {member.name}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <p className="text-muted-foreground text-sm">Select team members for your project</p>
        </div>

        {selected.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-muted-foreground text-sm font-medium">Selected:</p>
            <div className="flex flex-wrap gap-1.5">
              {selected.map((id) => {
                const member = members.find((m) => m.id === id);
                if (!member) return null;
                return (
                  <span
                    key={id}
                    className="bg-secondary text-secondary-foreground inline-flex h-6 items-center gap-1 rounded-full px-2.5 text-xs font-medium"
                  >
                    <SmallAvatar src={member.avatar} fallback={member.name} />
                    {member.name}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  },
};

// ---------------------------------------------------------------------------
// Controlled
// ---------------------------------------------------------------------------

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState<string[]>(["news", "travel"]);

    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold">Categories (controlled)</p>
        <ToggleGroup
          multiple
          value={value}
          onValueChange={setValue}
        >
          <ToggleGroupItem value="news">News</ToggleGroupItem>
          <ToggleGroupItem value="travel">Travel</ToggleGroupItem>
          <ToggleGroupItem value="gaming">Gaming</ToggleGroupItem>
          <ToggleGroupItem value="shopping">Shopping</ToggleGroupItem>
        </ToggleGroup>
        <p className="text-muted-foreground text-sm">
          Selected: {value.length > 0 ? value.join(", ") : "none"}
        </p>
      </div>
    );
  },
};

// ---------------------------------------------------------------------------
// Disabled
// ---------------------------------------------------------------------------

export const Disabled: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold">Disabled Group</p>
        <ToggleGroup disabled defaultValue={["travel"]}>
          <ToggleGroupItem value="news">News</ToggleGroupItem>
          <ToggleGroupItem value="travel">Travel</ToggleGroupItem>
          <ToggleGroupItem value="gaming">Gaming</ToggleGroupItem>
        </ToggleGroup>
        <p className="text-muted-foreground text-sm">Entire group is disabled</p>
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold">Individual Disabled Items</p>
        <ToggleGroup defaultValue={["gaming"]}>
          <ToggleGroupItem value="news">News</ToggleGroupItem>
          <ToggleGroupItem value="travel" disabled>Travel</ToggleGroupItem>
          <ToggleGroupItem value="gaming">Gaming</ToggleGroupItem>
          <ToggleGroupItem value="shopping" disabled>Shopping</ToggleGroupItem>
        </ToggleGroup>
        <p className="text-muted-foreground text-sm">Some items are disabled</p>
      </div>
    </div>
  ),
};

