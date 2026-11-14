import { Tag, TagRemove } from "@keystoneui/react/tag";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Bell as BellIcon,
  Bold as BoldIcon,
  Bookmark as BookmarkIcon,
  Heart as HeartIcon,
  Italic as ItalicIcon,
  Star as StarIcon,
} from "lucide-react";
import { expect, within } from "storybook/test";

const meta = {
  title: "Components/Tag",
  component: Tag,
  parameters: {
    docs: {
      description: {
        component: `
A badge-shaped tag button with pressed/unpressed state.

\`\`\`tsx
import { Tag, TagRemove } from "@keystoneui/react/tag";

// Basic tag
<Tag value="bold">Bold</Tag>

// With default pressed state
<Tag defaultPressed value="bookmark">Bookmark</Tag>

// With icon
<Tag value="star">
  <StarIcon />
  Star
</Tag>

// With remove button
<Tag value="react">
  React
  <TagRemove onClick={() => handleRemove()} />
</Tag>
\`\`\`

## Features

- Badge-shaped pill styling (rounded-full, 24px height)
- Pressed/unpressed state via \`aria-pressed\`
- Keyboard accessible via Base UI Toggle primitive
- Optional remove button via \`TagRemove\` sub-component
- Icon support with automatic sizing
`,
      },
    },
  },
  argTypes: {
    defaultPressed: {
      control: "boolean",
      description: "Initial pressed state (uncontrolled)",
    },
    disabled: {
      control: "boolean",
      description: "Whether the tag is disabled",
    },
  },
  subcomponents: { TagRemove },
} satisfies Meta<typeof Tag>;

export default meta;
type Story = StoryObj<typeof meta>;

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Tag value="bold">Bold</Tag>
      <Tag value="italic">Italic</Tag>
      <Tag defaultPressed value="underline">
        Underline
      </Tag>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// States
// ---------------------------------------------------------------------------

export const States: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Tag value="unpressed">Unpressed</Tag>
      <Tag defaultPressed value="pressed">
        Pressed
      </Tag>
      <Tag disabled value="disabled">
        Disabled
      </Tag>
      <Tag defaultPressed disabled value="pressed-disabled">
        Pressed & Disabled
      </Tag>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// With Icon
// ---------------------------------------------------------------------------

export const WithIcon: Story = {
  name: "With Icon",
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Tag value="star">
        <StarIcon />
        Star
      </Tag>
      <Tag value="bookmark">
        <BookmarkIcon />
        Bookmark
      </Tag>
      <Tag defaultPressed value="heart">
        <HeartIcon />
        Favorite
      </Tag>
      <Tag value="bell">
        <BellIcon />
        Notify
      </Tag>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// With Remove
// ---------------------------------------------------------------------------

export const WithRemove: Story = {
  name: "With Remove",
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Tag value="bold">
        <BoldIcon />
        Bold
        <TagRemove onClick={() => alert("Remove Bold")} />
      </Tag>
      <Tag value="italic">
        <ItalicIcon />
        Italic
        <TagRemove onClick={() => alert("Remove Italic")} />
      </Tag>
      <Tag defaultPressed value="star">
        <StarIcon />
        Star
        <TagRemove onClick={() => alert("Remove Star")} />
      </Tag>
    </div>
  ),
  // TagRemove's keyboard focus outline matches the Tag it sits in (and
  // Button). A bare `outline-none` beside `focus-visible:outline-2` set
  // `--tw-outline-style: none`, which `outline-2` reads, so the outline
  // computed to `none` while the class list looked right.
  play: async ({ canvasElement }) => {
    const tag = canvasElement.querySelector('[data-slot="tag"]') as HTMLElement;
    const remove = tag.querySelector('[data-slot="tag-remove"]') as HTMLElement;

    tag.focus();
    await expect(tag.matches(":focus-visible")).toBe(true);
    // Tag transitions outline-color; read the settled value.
    await new Promise((r) => setTimeout(r, 300));
    const reference = getComputedStyle(tag);
    const expected = {
      style: reference.outlineStyle,
      width: reference.outlineWidth,
      offset: reference.outlineOffset,
      color: reference.outlineColor,
    };
    await expect(expected.style).toBe("solid");

    remove.focus();
    await expect(remove.matches(":focus-visible")).toBe(true);
    const actual = getComputedStyle(remove);
    await expect({
      style: actual.outlineStyle,
      width: actual.outlineWidth,
      offset: actual.outlineOffset,
      color: actual.outlineColor,
    }).toEqual(expected);
    remove.blur();
  },
};

// ---------------------------------------------------------------------------
// Disabled
// ---------------------------------------------------------------------------

export const Disabled: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Tag disabled value="disabled">
        Disabled
      </Tag>
      <Tag defaultPressed disabled value="pressed-disabled">
        Pressed & Disabled
      </Tag>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Worst case
// ---------------------------------------------------------------------------

/**
 * Realistic worst-case data, not lorem: an 80-character address with no
 * break opportunity, a four-digit page, counts of exactly 0 and 1. The play
 * test measures real layout in the browser, so a regression to overflowing
 * text fails here rather than in a user's account menu.
 */
const WORST_EMAIL =
  "bartholomew.fitzgerald-wisniewska@northwind-industries-holdings-emea.example.com";

/** `inner` lies inside `outer`, with half a pixel for subpixel rounding. */
function expectInside(inner: DOMRect, outer: { left: number; right: number }) {
  expect(inner.left).toBeGreaterThanOrEqual(outer.left - 0.5);
  expect(inner.right).toBeLessThanOrEqual(outer.right + 0.5);
}

/** The element's content fits its box: nothing spills past the border. */
function expectNoOverflow(el: Element) {
  expect(el.scrollWidth).toBeLessThanOrEqual(el.clientWidth);
}

const viewport = () => ({ left: 0, right: window.innerWidth });

export const WorstCase: Story = {
  name: "Worst case",
  render: () => (
    <div className="flex w-80 flex-wrap gap-2" data-testid="frame">
      <Tag value="email">
        {WORST_EMAIL}
        <TagRemove />
      </Tag>
      <Tag value="zero">{0} unread</Tag>
      <Tag value="one">{1} member</Tag>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const frame = canvas.getByTestId("frame").getBoundingClientRect();
    const tags = canvasElement.querySelectorAll('[data-slot="tag"]');
    await expect(tags).toHaveLength(3);

    for (const tag of tags) {
      expectInside(tag.getBoundingClientRect(), frame);
    }
    // TagRemove's hit area is a pseudo-element that deliberately reaches past
    // the pill, which inflates scrollWidth, so only plain tags are measured.
    expectNoOverflow(tags[1] as Element);
    expectNoOverflow(tags[2] as Element);

    // The long label ellipsizes inside the pill, and the remove button stays
    // inside it rather than being pushed out and clipped away.
    const email = tags[0] as HTMLElement;
    const emailRect = email.getBoundingClientRect();
    const emailLabel = email.querySelector(":scope > span") as HTMLElement;
    await expect(emailLabel.scrollWidth).toBeGreaterThan(
      emailLabel.clientWidth
    );
    expectInside(emailLabel.getBoundingClientRect(), emailRect);
    const remove = within(email).getByRole("button", { name: /^Remove$/ });
    const removeRect = remove.getBoundingClientRect();
    expectInside(removeRect, emailRect);
    await expect(emailLabel.getBoundingClientRect().right).toBeLessThanOrEqual(
      removeRect.left + 0.5
    );

    // `{1} member` is two text nodes in JSX; they share one label span.
    const label = (tags[2] as HTMLElement).querySelectorAll(":scope > span");
    await expect(label).toHaveLength(1);
    await expect(label[0]).toHaveTextContent("1 member");
  },
};

// ---------------------------------------------------------------------------
// Whitespace between parts
// ---------------------------------------------------------------------------

/**
 * JSX puts a `{" "}` between an icon and a label. That space is collapsible
 * whitespace and must not become a flex item of its own: the pill looks the
 * same with or without it, with one 4px gap between icon and label.
 */
export const WhitespaceBetweenParts: Story = {
  name: "Whitespace between parts",
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Tag data-testid="spaced" value="spaced">
        <BellIcon /> <strong>Alerts</strong>
      </Tag>
      <Tag data-testid="tight" value="tight">
        <BellIcon />
        <strong>Alerts</strong>
      </Tag>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const spaced = canvas.getByTestId("spaced");
    const tight = canvas.getByTestId("tight");
    const gap = Number.parseFloat(getComputedStyle(spaced).columnGap);
    await expect(gap).toBe(4);

    await expect(
      Math.abs(
        spaced.getBoundingClientRect().width -
          tight.getBoundingClientRect().width
      )
    ).toBeLessThan(0.5);
    const icon = spaced.querySelector("svg") as SVGElement;
    const label = spaced.querySelector("strong") as HTMLElement;
    await expect(
      label.getBoundingClientRect().left - icon.getBoundingClientRect().right
    ).toBeCloseTo(gap, 1);
  },
};
