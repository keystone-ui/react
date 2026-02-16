import type { Meta, StoryObj } from "@storybook/react-vite";
import { Avatar, AvatarFallback, AvatarImage } from "keystoneui/avatar";
import { TagRemove } from "keystoneui/tag";
import { TagGroup, TagGroupItem } from "keystoneui/tag-group";
import {
  CircleXIcon,
  GamepadIcon,
  GlobeIcon,
  NewspaperIcon,
  ShoppingCartIcon,
  XIcon,
} from "lucide-react";
import { useState } from "react";

const meta = {
  title: "Components/TagGroup",
  component: TagGroup,
  parameters: {
    docs: {
      description: {
        component: `
A group of badge-shaped tag buttons with shared selection state.

\`\`\`tsx
import { TagGroup, TagGroupItem } from "keystoneui/tag-group";

// Multi-select
<TagGroup multiple defaultValue={["fitness", "parking"]}>
  <TagGroupItem value="laundry">Laundry</TagGroupItem>
  <TagGroupItem value="fitness">Fitness center</TagGroupItem>
  <TagGroupItem value="parking">Parking</TagGroupItem>
</TagGroup>

// Single select
<TagGroup defaultValue={["react"]}>
  <TagGroupItem value="react">React</TagGroupItem>
  <TagGroupItem value="vue">Vue</TagGroupItem>
  <TagGroupItem value="angular">Angular</TagGroupItem>
</TagGroup>

// With removal
<TagGroup onRemove={(value) => handleRemove(value)}>
  <TagGroupItem value="news">News</TagGroupItem>
  <TagGroupItem value="travel">Travel</TagGroupItem>
</TagGroup>
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
  argTypes: {
    disabled: {
      control: "boolean",
      description: "Whether the entire tag group is disabled",
    },
  },
  subcomponents: { TagGroupItem },
} satisfies Meta<typeof TagGroup>;

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
        <p className="font-semibold text-sm">Amenities</p>
        <TagGroup multiple onValueChange={setSelected} value={selected}>
          <TagGroupItem value="laundry">Laundry</TagGroupItem>
          <TagGroupItem value="fitness">Fitness center</TagGroupItem>
          <TagGroupItem value="parking">Parking</TagGroupItem>
          <TagGroupItem value="pool">Swimming pool</TagGroupItem>
          <TagGroupItem value="breakfast">Breakfast</TagGroupItem>
        </TagGroup>
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
        <p className="font-semibold text-sm">Framework</p>
        <TagGroup onValueChange={setSelected} value={selected}>
          <TagGroupItem value="react">React</TagGroupItem>
          <TagGroupItem value="vue">Vue</TagGroupItem>
          <TagGroupItem value="angular">Angular</TagGroupItem>
          <TagGroupItem value="svelte">Svelte</TagGroupItem>
        </TagGroup>
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
      <p className="font-semibold text-sm">With Icons</p>
      <TagGroup defaultValue={["shopping"]}>
        <TagGroupItem value="news">
          <NewspaperIcon />
          News
        </TagGroupItem>
        <TagGroupItem value="travel">
          <GlobeIcon />
          Travel
        </TagGroupItem>
        <TagGroupItem value="gaming">
          <GamepadIcon />
          Gaming
        </TagGroupItem>
        <TagGroupItem value="shopping">
          <ShoppingCartIcon />
          Shopping
        </TagGroupItem>
      </TagGroup>
      <p className="text-muted-foreground text-sm">Tags with icons</p>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// With Avatars
// ---------------------------------------------------------------------------

const AVATAR_URLS = {
  fred: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=faces",
  michael:
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=64&h=64&fit=crop&crop=faces",
  jane: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&fit=crop&crop=faces",
  alice:
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=faces",
  bob: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=faces",
  charlie:
    "https://images.unsplash.com/photo-1599566150163-29194dcabd9c?w=64&h=64&fit=crop&crop=faces",
};

function SmallAvatar({ src, fallback }: { src: string; fallback: string }) {
  return (
    <Avatar size="xs">
      <AvatarImage alt={fallback} src={src} />
      <AvatarFallback>{fallback[0]}</AvatarFallback>
    </Avatar>
  );
}

export const WithAvatars: Story = {
  name: "With Avatars",
  render: () => (
    <div className="flex flex-col gap-3">
      <p className="font-semibold text-sm">With Avatars</p>
      <TagGroup defaultValue={["jane"]}>
        <TagGroupItem value="fred">
          <SmallAvatar fallback="Fred" src={AVATAR_URLS.fred} />
          Fred
        </TagGroupItem>
        <TagGroupItem value="michael">
          <SmallAvatar fallback="Michael" src={AVATAR_URLS.michael} />
          Michael
        </TagGroupItem>
        <TagGroupItem value="jane">
          <SmallAvatar fallback="Jane" src={AVATAR_URLS.jane} />
          Jane
        </TagGroupItem>
      </TagGroup>
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
    const [items, setItems] = useState([
      "news",
      "travel",
      "gaming",
      "shopping",
    ]);
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
        <p className="font-semibold text-sm">Default Remove Button</p>
        <TagGroup defaultValue={["gaming"]} onRemove={handleRemove}>
          {items.map((item) => (
            <TagGroupItem key={item} value={item}>
              {labels[item]}
            </TagGroupItem>
          ))}
        </TagGroup>
        <p className="text-muted-foreground text-sm">
          Click the X to remove tags
        </p>
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
        <p className="font-semibold text-sm">Custom Remove Button</p>
        <TagGroup className="gap-2">
          {items.map((item) => (
            <TagGroupItem
              className="bg-foreground/10 text-foreground"
              key={item}
              value={item}
            >
              {item.charAt(0).toUpperCase() + item.slice(1)}
              <TagRemove onClick={() => handleRemove(item)}>
                <CircleXIcon aria-hidden="true" size={12} />
              </TagRemove>
            </TagGroupItem>
          ))}
        </TagGroup>
        <p className="text-muted-foreground text-sm">
          Custom remove button with icon
        </p>
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
          <p className="font-semibold text-sm">Team Members</p>
          <TagGroup
            multiple
            onRemove={handleRemove}
            onValueChange={setSelected}
            value={selected}
          >
            {members.map((member) => (
              <TagGroupItem key={member.id} value={member.id}>
                <SmallAvatar fallback={member.name} src={member.avatar} />
                {member.name}
              </TagGroupItem>
            ))}
          </TagGroup>
          <p className="text-muted-foreground text-sm">
            Select team members for your project
          </p>
        </div>

        {selected.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="font-medium text-muted-foreground text-sm">
              Selected:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {selected.map((id) => {
                const member = members.find((m) => m.id === id);
                if (!member) {
                  return null;
                }
                return (
                  <span
                    className="inline-flex h-6 items-center gap-1 rounded-full bg-secondary px-2.5 font-medium text-secondary-foreground text-xs"
                    key={id}
                  >
                    <SmallAvatar fallback={member.name} src={member.avatar} />
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
        <p className="font-semibold text-sm">Categories (controlled)</p>
        <TagGroup multiple onValueChange={setValue} value={value}>
          <TagGroupItem value="news">News</TagGroupItem>
          <TagGroupItem value="travel">Travel</TagGroupItem>
          <TagGroupItem value="gaming">Gaming</TagGroupItem>
          <TagGroupItem value="shopping">Shopping</TagGroupItem>
        </TagGroup>
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
        <p className="font-semibold text-sm">Disabled Group</p>
        <TagGroup defaultValue={["travel"]} disabled>
          <TagGroupItem value="news">News</TagGroupItem>
          <TagGroupItem value="travel">Travel</TagGroupItem>
          <TagGroupItem value="gaming">Gaming</TagGroupItem>
        </TagGroup>
        <p className="text-muted-foreground text-sm">
          Entire group is disabled
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <p className="font-semibold text-sm">Individual Disabled Items</p>
        <TagGroup defaultValue={["gaming"]}>
          <TagGroupItem value="news">News</TagGroupItem>
          <TagGroupItem disabled value="travel">
            Travel
          </TagGroupItem>
          <TagGroupItem value="gaming">Gaming</TagGroupItem>
          <TagGroupItem disabled value="shopping">
            Shopping
          </TagGroupItem>
        </TagGroup>
        <p className="text-muted-foreground text-sm">Some items are disabled</p>
      </div>
    </div>
  ),
};
