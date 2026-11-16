import { Avatar, AvatarFallback, AvatarImage } from "@keystoneui/react/avatar";
import { TagRemove } from "@keystoneui/react/tag";
import { TagGroup, TagGroupItem } from "@keystoneui/react/tag-group";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  CircleX as CircleXIcon,
  Gamepad as GamepadIcon,
  Globe as GlobeIcon,
  Newspaper as NewspaperIcon,
  ShoppingCart as ShoppingCartIcon,
  X as XIcon,
} from "lucide-react";
import { useState } from "react";
import { expect, within } from "storybook/test";

const meta = {
  title: "Components/TagGroup",
  component: TagGroup,
  parameters: {
    docs: {
      description: {
        component: `
A group of badge-shaped tag buttons with shared selection state.

\`\`\`tsx
import { TagGroup, TagGroupItem } from "@keystoneui/react/tag-group";

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
  avatar: string;
  id: string;
  name: string;
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

// ---------------------------------------------------------------------------
// Worst case
// ---------------------------------------------------------------------------

/** `inner` lies inside `outer`, with half a pixel for subpixel rounding. */
function expectInside(inner: DOMRect, outer: DOMRect) {
  expect(inner.left).toBeGreaterThanOrEqual(outer.left - 0.5);
  expect(inner.right).toBeLessThanOrEqual(outer.right + 0.5);
}

/**
 * A label far wider than its 90px box. Like `Tag`, a removable item must
 * ellipsize the label and keep its remove button inside the pill, rather than
 * clipping the text and pushing the button out of view.
 */
export const WorstCase: Story = {
  name: "Worst case",
  render: () => (
    <div className="w-[90px]" data-testid="frame">
      <TagGroup onRemove={() => undefined}>
        <TagGroupItem value="long">
          Professional photography studio
        </TagGroupItem>
        <TagGroupItem value="news">News</TagGroupItem>
      </TagGroup>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const items = canvasElement.querySelectorAll<HTMLElement>(
      '[data-slot="tag-group-item"]'
    );
    await expect(items).toHaveLength(2);
    const item = items[0] as HTMLElement;
    const itemRect = item.getBoundingClientRect();

    // Measured on the label, not the item: TagRemove's hit-area
    // pseudo-element reaches past the pill and inflates the item's scrollWidth.
    const label = item.querySelector<HTMLElement>(
      ':scope > [data-slot="tag-toggle"] > span'
    );
    await expect(label).not.toBeNull();
    const labelEl = label as HTMLElement;
    await expect(labelEl.scrollWidth).toBeGreaterThan(labelEl.clientWidth);
    await expect(getComputedStyle(labelEl).textOverflow).toBe("ellipsis");
    expectInside(labelEl.getBoundingClientRect(), itemRect);

    const remove = within(item).getByRole("button", { name: /^Remove$/ });
    const removeRect = remove.getBoundingClientRect();
    expectInside(removeRect, itemRect);
    await expect(labelEl.getBoundingClientRect().right).toBeLessThanOrEqual(
      removeRect.left + 0.5
    );
  },
};

// ---------------------------------------------------------------------------
// Whitespace between parts
// ---------------------------------------------------------------------------

/** A non-breaking space: content, unlike an ordinary JSX space. */
const NBSP = "\u00a0";

const rect = (root: HTMLElement, testId: string) =>
  within(root).getByTestId(testId).getBoundingClientRect();

/** Pills `a` and `b` have the same width, with half a pixel for rounding. */
function expectSameWidth(root: HTMLElement, a: string, b: string) {
  expect(Math.abs(rect(root, a).width - rect(root, b).width)).toBeLessThan(0.5);
}

/**
 * JSX puts a `{" "}` between an icon and a label. That space is collapsible
 * whitespace: as a bare string it is an anonymous flex item that layout
 * ignores, so the pill must look the same with or without it. A non-breaking
 * space is content and stays part of the label.
 */
export const WhitespaceBetweenParts: Story = {
  name: "Whitespace between parts",
  render: () => (
    <div className="flex flex-col items-start gap-2">
      <TagGroup>
        <TagGroupItem data-testid="spaced" value="spaced">
          <NewspaperIcon /> <strong>News</strong>
        </TagGroupItem>
        <TagGroupItem data-testid="tight" value="tight">
          <NewspaperIcon />
          <strong>News</strong>
        </TagGroupItem>
        <TagGroupItem data-testid="nbsp" value="nbsp">
          <NewspaperIcon />
          {NBSP}
          <strong>News</strong>
        </TagGroupItem>
      </TagGroup>
      <TagGroup>
        <TagGroupItem data-testid="leading" value="leading">
          {" "}
          <strong>News</strong>
        </TagGroupItem>
        <TagGroupItem data-testid="trailing" value="trailing">
          <strong>News</strong>{" "}
        </TagGroupItem>
        <TagGroupItem data-testid="bare" value="bare">
          <strong>News</strong>
        </TagGroupItem>
      </TagGroup>
      <TagGroup onRemove={() => undefined}>
        <TagGroupItem data-testid="blank-removable" value="blank">
          {" "}
        </TagGroupItem>
        <TagGroupItem data-testid="empty-removable" value="empty" />
      </TagGroup>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const spaced = within(canvasElement).getByTestId("spaced");
    const gap = Number.parseFloat(getComputedStyle(spaced).columnGap);
    await expect(gap).toBe(4);

    // `<Icon />{" "}<strong>` is spaced exactly like `<Icon /><strong>`.
    expectSameWidth(canvasElement, "spaced", "tight");
    const icon = spaced.querySelector("svg") as SVGElement;
    const label = spaced.querySelector("strong") as HTMLElement;
    await expect(
      label.getBoundingClientRect().left - icon.getBoundingClientRect().right
    ).toBeCloseTo(gap, 1);

    // A leading or trailing ordinary space adds nothing either.
    expectSameWidth(canvasElement, "leading", "bare");
    expectSameWidth(canvasElement, "trailing", "bare");

    // A whitespace-only removable item is as wide as an empty one.
    expectSameWidth(canvasElement, "blank-removable", "empty-removable");

    // A non-breaking space is content: it keeps its own label span and
    // takes room, so the pill is wider than the tight one by more than a gap.
    const nbsp = within(canvasElement).getByTestId("nbsp");
    const nbspSpan = Array.from(
      nbsp.querySelectorAll<HTMLElement>(":scope > span")
    ).find((s) => s.textContent === NBSP);
    await expect(nbspSpan).toBeDefined();
    await expect(
      (nbspSpan as HTMLElement).getBoundingClientRect().width
    ).toBeGreaterThan(0);
    await expect(rect(canvasElement, "nbsp").width).toBeGreaterThan(
      rect(canvasElement, "tight").width + gap
    );
  },
};

// ---------------------------------------------------------------------------
// Removable items: layout and keyboard
// ---------------------------------------------------------------------------

/**
 * A group that stretches its items (column, grid) stretches the whole pill,
 * and each item's X stays inside it, 4px from its end.
 */
export const RemovableStretched: Story = {
  name: "Removable Stretched",
  render: () => (
    <div className="flex w-80 flex-col gap-4">
      <TagGroup
        className="flex-col"
        data-testid="column"
        onRemove={() => undefined}
      >
        <TagGroupItem value="news">News</TagGroupItem>
        <TagGroupItem value="travel">Travel</TagGroupItem>
      </TagGroup>
      <TagGroup
        className="grid grid-cols-2"
        data-testid="grid"
        onRemove={() => undefined}
      >
        <TagGroupItem value="news">News</TagGroupItem>
        <TagGroupItem value="travel">Travel</TagGroupItem>
        <TagGroupItem value="gaming">Gaming</TagGroupItem>
      </TagGroup>
    </div>
  ),
  play: ({ canvasElement }) => {
    for (const id of ["column", "grid"]) {
      const group = within(canvasElement).getByTestId(id);
      const columns = id === "grid" ? 2 : 1;
      const gap = Number.parseFloat(getComputedStyle(group).columnGap) || 0;
      const cell = (group.clientWidth - gap * (columns - 1)) / columns;
      for (const chip of group.querySelectorAll<HTMLElement>(
        '[data-slot="tag-group-item"]'
      )) {
        const c = chip.getBoundingClientRect();
        const x = (
          chip.querySelector('[data-slot="tag-remove"]') as HTMLElement
        ).getBoundingClientRect();
        expect(Math.abs(c.width - cell)).toBeLessThan(0.5);
        expect(Math.abs(c.right - x.right - 4)).toBeLessThan(0.5);
      }
    }
  },
};

type RealUser = typeof import("vitest/browser").userEvent;

/** Vitest's real (Playwright) input; absent when Storybook runs the play. */
const realUser = () =>
  (globalThis as { __realUserEvent?: RealUser }).__realUserEvent;

const GREEK = ["Alpha", "Beta", "Gamma", "Delta"];

/**
 * Real keys from an item's X act from that item, as when the X sat inside
 * it: arrows move to the neighbours of its own toggle (skipping the disabled
 * Gamma), Shift+Tab goes to its own toggle, Tab goes on to the next X.
 */
export const RemovableKeyboard: Story = {
  name: "Removable Keyboard",
  render: () => (
    <div className="flex flex-col items-start gap-2">
      <button data-testid="before" type="button">
        before
      </button>
      <TagGroup onRemove={() => undefined}>
        {GREEK.map((label) => (
          <TagGroupItem disabled={label === "Gamma"} key={label} value={label}>
            {label}
          </TagGroupItem>
        ))}
      </TagGroup>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const user = realUser();
    if (!user) {
      // Storybook's own runner and Chromatic run plays without Vitest, and
      // their browsers may be automated: skip the real-input checks there.
      // Under Vitest `vitest.setup.ts` always provides it.
      return;
    }
    const focused = () => {
      const active = document.activeElement as HTMLElement;
      const item = active.closest('[data-slot="tag-group-item"]');
      const part = active.dataset.slot === "tag-remove" ? "x" : "toggle";
      return `${part}:${item?.textContent ?? active.textContent}`;
    };
    const before = within(canvasElement).getByTestId("before");

    before.focus();
    const forward: string[] = [];
    for (const _ of [1, 2, 3, 4]) {
      // biome-ignore lint/performance/noAwaitInLoops: one key at a time
      await user.keyboard("{Tab}");
      forward.push(focused());
    }
    await expect(forward).toEqual([
      "toggle:Alpha",
      "x:Alpha",
      "x:Beta",
      "x:Delta",
    ]);

    // From Delta's X: Shift+Tab to Delta's toggle (as when nested), not to
    // Beta's X.
    await user.keyboard("{Shift>}{Tab}{/Shift}");
    await expect(focused()).toBe("toggle:Delta");

    // With Alpha the group's current item, arrows on Beta's X move from
    // Beta (skipping the disabled Gamma), not from Alpha.
    const part = (label: string, slot: string) =>
      Array.from(
        canvasElement.querySelectorAll<HTMLElement>(
          '[data-slot="tag-group-item"]'
        )
      )
        .find((item) => item.textContent === label)
        ?.querySelector(`[data-slot="${slot}"]`) as HTMLElement;
    part("Alpha", "tag-toggle").focus();
    part("Beta", "tag-remove").focus();
    await user.keyboard("{ArrowRight}");
    await expect(focused()).toBe("toggle:Delta");
    part("Alpha", "tag-toggle").focus();
    part("Delta", "tag-remove").focus();
    await user.keyboard("{ArrowLeft}");
    await expect(focused()).toBe("toggle:Beta");
  },
};
