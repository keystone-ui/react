import type { Meta, StoryObj } from "@storybook/react-vite";
import { Avatar, AvatarFallback, AvatarImage } from "keystoneui/avatar";
import { Badge } from "keystoneui/badge";
import { Button } from "keystoneui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemGroup,
  ItemHeader,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "keystoneui/item";
import {
  BadgeCheckIcon,
  CalendarIcon,
  CheckCircle2Icon,
  ChevronRightIcon,
  ClockIcon,
  ExternalLinkIcon,
  FileTextIcon,
  GitBranchIcon,
  InboxIcon,
  MessageSquareIcon,
  MoreHorizontalIcon,
  PackageIcon,
  PlusIcon,
  ShieldAlertIcon,
  TagIcon,
} from "lucide-react";
import * as React from "react";

const meta = {
  title: "Components/Item",
  component: Item,
  parameters: {
    docs: {
      description: {
        component: `
A generic list row / content block component with flexible layout supporting media, actions, header/footer, and grouping.

\`\`\`tsx
import {
  Item, ItemMedia, ItemContent, ItemTitle,
  ItemDescription, ItemActions, ItemHeader,
  ItemFooter, ItemGroup, ItemSeparator,
} from "keystoneui/item";

<Item variant="outline">
  <ItemMedia variant="icon">
    <InboxIcon />
  </ItemMedia>
  <ItemContent>
    <ItemTitle>Notification</ItemTitle>
    <ItemDescription>You have a new message.</ItemDescription>
  </ItemContent>
  <ItemActions>
    <Button variant="outline" size="sm">View</Button>
  </ItemActions>
</Item>
\`\`\`

## Item vs Alert

| | Alert | Item |
|---|---|---|
| **Semantics** | \`role="alert"\` | Generic div |
| **Structure** | Grid (icon + text) | Flex (media + content + actions) |
| **Sub-components** | 3 | 10 |
| **Icon/media** | Raw \`<svg>\` child | ItemMedia with icon/image variants |
| **Actions** | AlertAction (top-right) | ItemActions slot |
| **Grouping** | None | ItemGroup + ItemSeparator |
| **Polymorphic** | No | Yes (\`render\` prop) |
| **Purpose** | Status feedback | Content display |

Alert is closer to a notification/callout (something the system tells you). Item is closer to a list row (something you browse or interact with). They are not interchangeable.

## Item vs Field

Use **Field** if you need to display a form input such as a checkbox, input, radio, or select.

Use **Item** if you only need to display content such as a title, description, and actions.

## Features

- 3 variants: default, outline, muted
- 3 sizes: default, sm, xs
- Polymorphic via \`render\` prop (e.g. render as \`<a>\`)
- ItemMedia supports icon, image, and avatar layouts
- ItemGroup with \`role="list"\` for accessible grouping
- ItemHeader / ItemFooter for full-width rows
`,
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "outline", "muted"],
      defaultValue: "default",
      description: "The visual style of the item",
    },
    size: {
      control: "select",
      options: ["default", "sm", "xs"],
      defaultValue: "default",
      description: "The size of the item",
    },
    className: {
      control: "text",
      description: "Additional CSS classes",
    },
  },
  subcomponents: {
    ItemMedia,
    ItemContent,
    ItemActions,
    ItemGroup,
    ItemSeparator,
    ItemTitle,
    ItemDescription,
    ItemHeader,
    ItemFooter,
  },
} satisfies Meta<typeof Item>;

export default meta;
type Story = StoryObj<typeof Item>;

// ── Core ────────────────────────────────────────────────────────────────

export const Demo: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "A basic item with title, description, and action alongside a polymorphic link item with media.",
      },
    },
  },
  render: () => (
    <div className="flex w-full max-w-md flex-col gap-6">
      <Item variant="outline">
        <ItemContent>
          <ItemTitle>Basic Item</ItemTitle>
          <ItemDescription>
            A simple item with title and description.
          </ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button size="sm" variant="outline">
            Action
          </Button>
        </ItemActions>
      </Item>
      <Item
        render={
          <a href="#">
            <ItemMedia>
              <BadgeCheckIcon className="size-5" />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>Your profile has been verified.</ItemTitle>
            </ItemContent>
            <ItemActions>
              <ChevronRightIcon className="size-4" />
            </ItemActions>
          </a>
        }
        size="sm"
        variant="outline"
      />
    </div>
  ),
};

// ── Variants ────────────────────────────────────────────────────────────

export const Variant: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Use the `variant` prop to change the visual style. Available variants: default, outline, muted.",
      },
    },
  },
  render: () => (
    <div className="flex w-full max-w-md flex-col gap-6">
      <Item>
        <ItemMedia variant="icon">
          <InboxIcon />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Default Variant</ItemTitle>
          <ItemDescription>
            Transparent background with no border.
          </ItemDescription>
        </ItemContent>
      </Item>
      <Item variant="outline">
        <ItemMedia variant="icon">
          <InboxIcon />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Outline Variant</ItemTitle>
          <ItemDescription>
            Outlined style with a visible border.
          </ItemDescription>
        </ItemContent>
      </Item>
      <Item variant="muted">
        <ItemMedia variant="icon">
          <InboxIcon />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Muted Variant</ItemTitle>
          <ItemDescription>
            Muted background for secondary content.
          </ItemDescription>
        </ItemContent>
      </Item>
    </div>
  ),
};

// ── Sizes ───────────────────────────────────────────────────────────────

export const Size: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Use the `size` prop to change the size. Available sizes: default, sm, xs.",
      },
    },
  },
  render: () => (
    <div className="flex w-full max-w-md flex-col gap-6">
      <Item variant="outline">
        <ItemMedia variant="icon">
          <InboxIcon />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Default Size</ItemTitle>
          <ItemDescription>
            The standard size for most use cases.
          </ItemDescription>
        </ItemContent>
      </Item>
      <Item size="sm" variant="outline">
        <ItemMedia variant="icon">
          <InboxIcon />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Small Size</ItemTitle>
          <ItemDescription>A compact size for dense layouts.</ItemDescription>
        </ItemContent>
      </Item>
      <Item size="xs" variant="outline">
        <ItemMedia variant="icon">
          <InboxIcon />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Extra Small Size</ItemTitle>
          <ItemDescription>The most compact size available.</ItemDescription>
        </ItemContent>
      </Item>
    </div>
  ),
};

// ── Icon ────────────────────────────────────────────────────────────────

export const Icon: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Use `ItemMedia` with `variant="icon"` to display an icon alongside the content.',
      },
    },
  },
  render: () => (
    <div className="flex w-full max-w-lg flex-col gap-6">
      <Item variant="outline">
        <ItemMedia variant="icon">
          <ShieldAlertIcon />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Security Alert</ItemTitle>
          <ItemDescription>
            New login detected from unknown device.
          </ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button size="sm" variant="outline">
            Review
          </Button>
        </ItemActions>
      </Item>
    </div>
  ),
};

// ── Avatar ──────────────────────────────────────────────────────────────

export const WithAvatar: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Use `ItemMedia` to display an avatar. Works with the Avatar component for consistent sizing.",
      },
    },
  },
  render: () => (
    <div className="flex w-full max-w-lg flex-col gap-6">
      <Item variant="outline">
        <ItemMedia>
          <Avatar className="size-10">
            <AvatarImage src="https://i.pravatar.cc/150?u=alice" />
            <AvatarFallback>AL</AvatarFallback>
          </Avatar>
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Alice</ItemTitle>
          <ItemDescription>Last seen 5 months ago</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button
            aria-label="Invite"
            className="rounded-full"
            size="icon-sm"
            variant="outline"
          >
            <PlusIcon />
          </Button>
        </ItemActions>
      </Item>
      <Item variant="outline">
        <ItemMedia>
          <div className="flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-background *:data-[slot=avatar]:grayscale">
            <Avatar className="hidden sm:flex">
              <AvatarImage
                alt="@alice"
                src="https://i.pravatar.cc/150?u=alice"
              />
              <AvatarFallback>AL</AvatarFallback>
            </Avatar>
            <Avatar className="hidden sm:flex">
              <AvatarImage alt="@bob" src="https://i.pravatar.cc/150?u=bob" />
              <AvatarFallback>BO</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarImage
                alt="@carol"
                src="https://i.pravatar.cc/150?u=carol"
              />
              <AvatarFallback>CA</AvatarFallback>
            </Avatar>
          </div>
        </ItemMedia>
        <ItemContent>
          <ItemTitle>No Team Members</ItemTitle>
          <ItemDescription>
            Invite your team to collaborate on this project.
          </ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button size="sm" variant="outline">
            Invite
          </Button>
        </ItemActions>
      </Item>
    </div>
  ),
};

// ── Image ───────────────────────────────────────────────────────────────

const music = [
  {
    title: "Midnight City Lights",
    artist: "Neon Dreams",
    album: "Electric Nights",
    duration: "3:45",
  },
  {
    title: "Coffee Shop Conversations",
    artist: "The Morning Brew",
    album: "Urban Stories",
    duration: "4:05",
  },
  {
    title: "Digital Rain",
    artist: "Cyber Symphony",
    album: "Binary Beats",
    duration: "3:30",
  },
];

export const Image: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Use `ItemMedia` with `variant="image"` to display an image thumbnail. Works well with ItemGroup for list layouts.',
      },
    },
  },
  render: () => (
    <div className="flex w-full max-w-md flex-col gap-6">
      <ItemGroup>
        {music.map((song, index) => (
          <React.Fragment key={song.title}>
            {index > 0 && <ItemSeparator />}
            <Item
              render={
                <a href="#">
                  <ItemMedia variant="image">
                    <img
                      alt={song.title}
                      className="object-cover grayscale"
                      height={32}
                      src={`https://picsum.photos/seed/${encodeURIComponent(song.title)}/64/64`}
                      width={32}
                    />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle className="line-clamp-1">
                      {song.title} -{" "}
                      <span className="text-muted-foreground">
                        {song.album}
                      </span>
                    </ItemTitle>
                    <ItemDescription>{song.artist}</ItemDescription>
                  </ItemContent>
                  <ItemContent className="flex-none text-center">
                    <ItemDescription>{song.duration}</ItemDescription>
                  </ItemContent>
                </a>
              }
              role="listitem"
            />
          </React.Fragment>
        ))}
      </ItemGroup>
    </div>
  ),
};

// ── Group ───────────────────────────────────────────────────────────────

const people = [
  {
    username: "alice",
    avatar: "https://i.pravatar.cc/150?u=alice",
    email: "alice@google.com",
  },
  {
    username: "bob",
    avatar: "https://i.pravatar.cc/150?u=bob",
    email: "bob@google.com",
  },
  {
    username: "carol",
    avatar: "https://i.pravatar.cc/150?u=carol",
    email: "carol@google.com",
  },
];

export const Group: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Use `ItemGroup` to group related items together. Adds `role="list"` for accessibility and manages gap spacing.',
      },
    },
  },
  render: () => (
    <ItemGroup className="max-w-sm">
      {people.map((person, index) => (
        <React.Fragment key={person.username}>
          {index > 0 && <ItemSeparator />}
          <Item>
            <ItemMedia>
              <Avatar>
                <AvatarImage className="grayscale" src={person.avatar} />
                <AvatarFallback>{person.username.charAt(0)}</AvatarFallback>
              </Avatar>
            </ItemMedia>
            <ItemContent className="gap-1">
              <ItemTitle>{person.username}</ItemTitle>
              <ItemDescription>{person.email}</ItemDescription>
            </ItemContent>
            <ItemActions>
              <Button className="rounded-full" size="icon" variant="ghost">
                <PlusIcon />
              </Button>
            </ItemActions>
          </Item>
        </React.Fragment>
      ))}
    </ItemGroup>
  ),
};

// ── Header ──────────────────────────────────────────────────────────────

const models = [
  {
    name: "v0-1.5-sm",
    description: "Everyday tasks and UI generation.",
    image:
      "https://images.unsplash.com/photo-1650804068570-7fb2e3dbf888?q=80&w=640&auto=format&fit=crop",
  },
  {
    name: "v0-1.5-lg",
    description: "Advanced thinking or reasoning.",
    image:
      "https://images.unsplash.com/photo-1610280777472-54133d004c8c?q=80&w=640&auto=format&fit=crop",
  },
  {
    name: "v0-2.0-mini",
    description: "Open Source model for everyone.",
    image:
      "https://images.unsplash.com/photo-1602146057681-08560aee8cde?q=80&w=640&auto=format&fit=crop",
  },
];

export const Header: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Use `ItemHeader` to add a full-width header above the item content. Works well for card-style layouts.",
      },
    },
  },
  render: () => (
    <div className="flex w-full max-w-xl flex-col gap-6">
      <ItemGroup className="grid grid-cols-3 gap-4 border-0">
        {models.map((model) => (
          <Item key={model.name} variant="outline">
            <ItemHeader>
              <img
                alt={model.name}
                className="aspect-square w-full rounded-sm object-cover"
                height={128}
                src={model.image}
                width={128}
              />
            </ItemHeader>
            <ItemContent>
              <ItemTitle>{model.name}</ItemTitle>
              <ItemDescription>{model.description}</ItemDescription>
            </ItemContent>
          </Item>
        ))}
      </ItemGroup>
    </div>
  ),
};

// ── Link ────────────────────────────────────────────────────────────────

export const Link: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Use the `render` prop to render the item as a link. Hover and focus states are applied to the anchor element.",
      },
    },
  },
  render: () => (
    <div className="flex w-full max-w-md flex-col gap-4">
      <Item
        render={
          <a href="#">
            <ItemContent>
              <ItemTitle>Visit our documentation</ItemTitle>
              <ItemDescription>
                Learn how to get started with our components.
              </ItemDescription>
            </ItemContent>
            <ItemActions>
              <ChevronRightIcon className="size-4" />
            </ItemActions>
          </a>
        }
      />
      <Item
        render={
          <a href="#" rel="noopener noreferrer" target="_blank">
            <ItemContent>
              <ItemTitle>External resource</ItemTitle>
              <ItemDescription>
                Opens in a new tab with security attributes.
              </ItemDescription>
            </ItemContent>
            <ItemActions>
              <ExternalLinkIcon className="size-4" />
            </ItemActions>
          </a>
        }
        variant="outline"
      />
    </div>
  ),
};

// ── Separator ───────────────────────────────────────────────────────────

export const WithSeparator: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Use `ItemSeparator` between items to visually divide groups of content.",
      },
    },
  },
  render: () => (
    <div className="flex w-full max-w-md flex-col">
      <Item>
        <ItemMedia variant="icon">
          <InboxIcon />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>First Item</ItemTitle>
          <ItemDescription>Description for the first item.</ItemDescription>
        </ItemContent>
      </Item>
      <ItemSeparator />
      <Item>
        <ItemMedia variant="icon">
          <InboxIcon />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Second Item</ItemTitle>
          <ItemDescription>Description for the second item.</ItemDescription>
        </ItemContent>
      </Item>
      <ItemSeparator />
      <Item>
        <ItemMedia variant="icon">
          <InboxIcon />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Third Item</ItemTitle>
          <ItemDescription>Description for the third item.</ItemDescription>
        </ItemContent>
      </Item>
    </div>
  ),
};

// ── Footer ──────────────────────────────────────────────────────────────

export const Footer: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Use `ItemFooter` inside `ItemContent` to add metadata below the title and description. Footer text is automatically styled as small muted text with compact icon sizing.",
      },
    },
  },
  render: () => (
    <div className="flex w-full max-w-lg flex-col gap-6">
      <Item variant="outline">
        <ItemMedia variant="icon">
          <PackageIcon />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>v2.4.0 Released</ItemTitle>
          <ItemDescription>
            New features include dark mode support, improved accessibility, and
            performance optimizations.
          </ItemDescription>
          <ItemFooter>
            <CalendarIcon />
            <span>Released on Feb 8, 2026</span>
            <span className="text-border">|</span>
            <TagIcon />
            <span>stable</span>
          </ItemFooter>
        </ItemContent>
        <ItemActions>
          <Button size="sm" variant="outline">
            View
          </Button>
        </ItemActions>
      </Item>
    </div>
  ),
};

// ── Header + Footer ─────────────────────────────────────────────────────

export const HeaderFooter: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Combine `ItemHeader` and `ItemFooter` inside `ItemContent` for rich metadata above and below the main text.",
      },
    },
  },
  render: () => (
    <div className="flex w-full max-w-lg flex-col gap-6">
      <Item variant="outline">
        <ItemContent>
          <ItemHeader>
            <GitBranchIcon className="size-3.5" />
            <span>main</span>
            <Badge className="ml-auto px-1.5 py-0 text-[10px]">Merged</Badge>
          </ItemHeader>
          <ItemTitle>feat: add dark mode toggle to navigation bar</ItemTitle>
          <ItemDescription>
            Implements a theme switcher using next-themes with system preference
            detection and smooth transitions.
          </ItemDescription>
          <ItemFooter>
            <Avatar className="size-4">
              <AvatarImage
                alt="alice"
                src="https://i.pravatar.cc/150?u=alice"
              />
              <AvatarFallback>AL</AvatarFallback>
            </Avatar>
            <span>alice</span>
            <span className="text-border">|</span>
            <MessageSquareIcon />
            <span>12 comments</span>
            <span className="text-border">|</span>
            <CheckCircle2Icon className="text-green-600" />
            <span>3 approvals</span>
          </ItemFooter>
        </ItemContent>
      </Item>
    </div>
  ),
};

// ── Rich Footer with Actions ────────────────────────────────────────────

export const RichFooter: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "A footer can contain interactive elements like buttons by splitting content into left/right groups with `justify-between`.",
      },
    },
  },
  render: () => (
    <div className="flex w-full max-w-lg flex-col gap-6">
      <Item variant="outline">
        <ItemMedia>
          <Avatar className="size-10">
            <AvatarImage
              alt="Deploy"
              src="https://api.dicebear.com/9.x/icons/svg?seed=rocket&icon=rocket"
            />
            <AvatarFallback>D</AvatarFallback>
          </Avatar>
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Production Deployment</ItemTitle>
          <ItemDescription>
            Successfully deployed to acme.com with 0 errors and 0 warnings.
            Build completed in 42s.
          </ItemDescription>
          <ItemFooter className="justify-between">
            <div className="flex items-center gap-1.5">
              <CheckCircle2Icon className="text-green-600" />
              <span>Ready</span>
              <span className="text-border">|</span>
              <ClockIcon />
              <span>42s</span>
            </div>
            <div className="flex items-center gap-1">
              <Button className="h-6 text-xs" size="sm" variant="ghost">
                Logs
              </Button>
              <Button className="h-6 text-xs" size="sm" variant="ghost">
                Visit
                <ExternalLinkIcon className="ml-1 size-3" />
              </Button>
            </div>
          </ItemFooter>
        </ItemContent>
      </Item>
    </div>
  ),
};

// ── Grouped Items with Footers ──────────────────────────────────────────

const commits = [
  {
    name: "alice",
    avatar: "https://i.pravatar.cc/150?u=alice",
    message: "Refactored the button component for better accessibility.",
    time: "2 hours ago",
    files: "4 files changed",
  },
  {
    name: "bob",
    avatar: "https://i.pravatar.cc/150?u=bob",
    message: "Updated documentation for the new API endpoints.",
    time: "5 hours ago",
    files: "2 files changed",
  },
  {
    name: "carol",
    avatar: "https://i.pravatar.cc/150?u=carol",
    message: "Deployed the latest build to production.",
    time: "1 day ago",
    status: "Production",
  },
];

export const GroupedFooters: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Grouped items with footers and separators for activity feeds and commit logs.",
      },
    },
  },
  render: () => (
    <ItemGroup className="max-w-lg">
      {commits.map((commit, index) => (
        <React.Fragment key={commit.name}>
          {index > 0 && <ItemSeparator />}
          <Item>
            <ItemMedia>
              <Avatar>
                <AvatarImage className="grayscale" src={commit.avatar} />
                <AvatarFallback>
                  {commit.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </ItemMedia>
            <ItemContent>
              <ItemTitle>{commit.name}</ItemTitle>
              <ItemDescription>{commit.message}</ItemDescription>
              <ItemFooter>
                <ClockIcon />
                <span>{commit.time}</span>
                <span className="text-border">|</span>
                {commit.status ? (
                  <>
                    <CheckCircle2Icon className="text-green-600" />
                    <span>{commit.status}</span>
                  </>
                ) : (
                  <>
                    <FileTextIcon />
                    <span>{commit.files}</span>
                  </>
                )}
              </ItemFooter>
            </ItemContent>
            <ItemActions>
              <Button className="size-8" size="icon" variant="ghost">
                <MoreHorizontalIcon />
                <span className="sr-only">More options</span>
              </Button>
            </ItemActions>
          </Item>
        </React.Fragment>
      ))}
    </ItemGroup>
  ),
};
