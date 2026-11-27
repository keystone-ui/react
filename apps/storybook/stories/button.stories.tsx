import { Button, type ButtonProps } from "@keystoneui/react/button";
import { ButtonGroup } from "@keystoneui/react/button-group";
import { cn } from "@keystoneui/react/utils";
import {
  RiFacebookFill,
  RiGithubFill,
  RiGoogleFill,
  RiTwitterXFill,
} from "@remixicon/react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  ArrowLeft,
  ArrowRight,
  Bold,
  ChevronDown,
  Italic,
  LoaderCircle as Loader2,
  Mail,
  Plus,
  Star as StarIcon,
  ThumbsUp as ThumbsUpIcon,
} from "lucide-react";
import { useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";

// Use a cast to silence TypeScript for the meta configuration
const meta = {
  title: "Components/Button",
  component: Button,
  parameters: {
    docs: {
      description: {
        component: `
A versatile button component with support for different variants, sizes, and states.

\`\`\`tsx
import { Button } from "@keystoneui/react/button";

// Default button
<Button>Click me</Button>

// Button variants
<Button variant="secondary">Secondary</Button>
<Button variant="destructive">Delete</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="outline">Outline</Button>

// Button sizes
<Button size="xs">Extra Small</Button>
<Button size="sm">Small</Button>
<Button>Default</Button>
<Button size="lg">Large</Button>
<Button size="icon"><Icon /></Button>

// Link button
<Button href="/dashboard">Go to Dashboard</Button>

// Button groups
<div className="inline-flex gap-2">
  <Button>Button 1</Button>
  <Button>Button 2</Button>
</div>

// Attached button group
<div className="inline-flex -space-x-px rounded-md shadow-xs">
  <Button className="rounded-none shadow-none first:rounded-s-md last:rounded-e-md">Button 1</Button>
  <Button className="rounded-none shadow-none first:rounded-s-md last:rounded-e-md">Button 2</Button>
</div>
\`\`\`

## Features

- Multiple variants: default, secondary, destructive, ghost, outline
- Five sizes: xs, sm, default, lg, icon
- Loading state with spinner
- Disabled state
- Anchor links with correct semantics
- Full width option
- Icon support
`,
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "secondary", "destructive", "ghost", "outline"],
      defaultValue: "default",
      description: "The visual style of the button",
    },
    size: {
      control: "select",
      options: [
        "xs",
        "sm",
        "default",
        "lg",
        "icon",
        "icon-xs",
        "icon-sm",
        "icon-lg",
      ],
      defaultValue: "default",
      description: "The size of the button",
    },
    disabled: {
      control: "boolean",
      defaultValue: false,
      description: "Whether the button is disabled",
    },
    isLoading: {
      control: "boolean",
      defaultValue: false,
      description: "Whether the button shows a loading spinner",
    },
    className: {
      control: "text",
      description: "Additional CSS classes to apply to the button",
    },
    children: {
      control: "text",
      description: "The content of the button",
      defaultValue: "Button",
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof Button>;

// Base button variants
export const Default: Story = {
  args: {
    children: "Button",
    variant: "default",
    onClick: fn(),
  } as any,
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: /button/i });

    // Simulate click
    await userEvent.click(button);

    // Assert onClick was called
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};

export const Secondary: Story = {
  args: {
    children: "Secondary",
    variant: "secondary",
  } as any,
};

export const Destructive: Story = {
  args: {
    children: "Destructive",
    variant: "destructive",
  } as any,
};

export const Ghost: Story = {
  args: {
    children: "Ghost",
    variant: "ghost",
  } as any,
};

export const Outline: Story = {
  args: {
    children: "Outline",
    variant: "outline",
  } as any,
};

// An outline Button paints the foreground colour at rest, whatever text colour
// its parent sets; a consumer's colour class and the disabled colour still win.
const outlineThemes = ["light", "dark"] as const;

// Every way an outline Button is disabled: the `disabled` prop, a disabled
// fieldset (`:disabled`, no `data-disabled`), `disabled` on the native button
// passed to `render` (the same), a focusable disabled button and a disabled
// link (`data-disabled`, not `:disabled`).
const outlineDisabledRows = [
  "prop",
  "fieldset",
  "render",
  "focusable",
  "link",
] as const;
type OutlineDisabledRow = (typeof outlineDisabledRows)[number];

function OutlineDisabled({
  row,
  theme,
  expanded,
}: {
  row: OutlineDisabledRow;
  theme: string;
  expanded?: boolean;
}) {
  const id = `${theme}-off-${row}${expanded ? "-x" : ""}`;
  const shared = {
    "aria-expanded": expanded || undefined,
    "data-testid": id,
    variant: "outline" as const,
  };
  switch (row) {
    case "fieldset":
      return (
        <fieldset className="m-0 min-w-0 border-0 p-0" disabled>
          <Button {...shared}>Off</Button>
        </fieldset>
      );
    case "render":
      return (
        <Button {...shared} render={<button disabled type="button" />}>
          Off
        </Button>
      );
    case "link":
      return (
        <Button
          {...shared}
          disabled
          nativeButton={false}
          render={<a href="#help" />}
        >
          Help
        </Button>
      );
    default:
      return (
        <Button
          {...shared}
          disabled
          focusableWhenDisabled={row === "focusable"}
        >
          Off
        </Button>
      );
  }
}

/** The custom browser commands registered in vitest.config.ts. */
interface OutlineCommands {
  pointerDown: () => Promise<void>;
  pointerMoveAway: () => Promise<void>;
  pointerMoveTo: (selector: string) => Promise<void>;
  pointerUp: () => Promise<void>;
}

const outlineFrame = () =>
  new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

/** Waits for a state the pointer gives, one frame at a time. */
async function outlineUntil(test: () => boolean) {
  for (let i = 0; i < 60 && !test(); i++) {
    // biome-ignore lint/performance/noAwaitInLoops: one frame at a time
    await outlineFrame();
  }
  return test();
}

/** Waits until the element's colour and fill have stopped moving. */
async function outlineSettled(el: Element) {
  let last = "";
  let stable = 0;
  for (let i = 0; i < 120 && stable < 4; i++) {
    // biome-ignore lint/performance/noAwaitInLoops: one frame at a time
    await outlineFrame();
    const style = getComputedStyle(el);
    const now = `${style.color}|${style.backgroundColor}`;
    stable = now === last ? stable + 1 : 0;
    last = now;
  }
}

export const OutlineForeground: Story = {
  // The light panel's class resets nothing: pin the light theme so the
  // toolbar's dark theme cannot paint both panels dark. The suite has no
  // toolbar: start from the dark theme so that the pin, not the default, is
  // what keeps the light panel light.
  globals: { theme: "dark" },
  parameters: {
    themes: { themeOverride: "light" },
    docs: { story: { inline: false, height: "720px" } },
  },
  render: () => (
    <div className="flex flex-col items-start gap-4">
      {outlineThemes.map((theme) => (
        <div
          className={cn(
            "flex flex-col items-start gap-2 rounded-md bg-background p-3 text-foreground",
            theme === "dark" && "dark"
          )}
          key={theme}
        >
          <span className="text-foreground" data-testid={`${theme}-fg`}>
            foreground
          </span>
          <span className="text-foreground/50" data-testid={`${theme}-fg-50`}>
            foreground at half
          </span>
          <span className="text-destructive" data-testid={`${theme}-red`}>
            destructive
          </span>
          <Button data-testid={`${theme}-outside`} variant="outline">
            Outside
          </Button>
          <div
            className="flex flex-wrap gap-2 text-muted-foreground"
            data-testid={`${theme}-muted`}
          >
            <Button data-testid={`${theme}-inside`} variant="outline">
              Inside
            </Button>
            <Button
              className="text-destructive"
              data-testid={`${theme}-inside-red`}
              variant="outline"
            >
              Inside red
            </Button>
            <Button
              data-testid={`${theme}-render-red`}
              nativeButton={false}
              render={<a className="text-destructive" href="#details" />}
              variant="outline"
            >
              Details
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 text-muted-foreground">
            {outlineDisabledRows.map((row) => (
              <OutlineDisabled key={row} row={row} theme={theme} />
            ))}
          </div>
          <div className="flex flex-wrap gap-2 text-muted-foreground">
            {outlineDisabledRows.map((row) => (
              <OutlineDisabled expanded key={row} row={row} theme={theme} />
            ))}
          </div>
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // The theme pin switches the page's theme after the first paint: let
    // the colour transitions it starts finish before reading colours.
    await Promise.all(document.getAnimations().map((a) => a.finished));
    const style = (id: string) => getComputedStyle(canvas.getByTestId(id));
    const color = (id: string) => style(id).color;
    for (const theme of outlineThemes) {
      const fg = color(`${theme}-fg`);
      // The fixture is only meaningful if the parent's colour differs.
      // biome-ignore lint/performance/noAwaitInLoops: one theme at a time
      await expect(color(`${theme}-muted`)).not.toBe(fg);
      await expect(color(`${theme}-outside`)).toBe(fg);
      await expect(color(`${theme}-inside`)).toBe(fg);
      // A colour class on the Button wins over the variant's colour.
      await expect(color(`${theme}-inside-red`)).toBe(color(`${theme}-red`));
      // The same class on the element passed to `render` can lose: here the
      // variant's colour wins, so the class belongs on the Button.
      await expect(color(`${theme}-render-red`)).toBe(fg);
    }
    // Dark resolves its own foreground, not the light one.
    await expect(
      color("dark-inside"),
      "the light panel must stay light"
    ).not.toBe(color("light-inside"));

    // Every disabled row, at rest and expanded: half-strength text. Rows
    // that are `:disabled` without `data-disabled` keep the fill of the prop
    // row when expanded.
    for (const theme of outlineThemes) {
      const half = color(`${theme}-fg-50`);
      for (const row of outlineDisabledRows) {
        // biome-ignore lint/performance/noAwaitInLoops: one control at a time
        await expect(color(`${theme}-off-${row}`), `${theme} ${row}`).toBe(
          half
        );
      }
      for (const row of outlineDisabledRows) {
        // biome-ignore lint/performance/noAwaitInLoops: one control at a time
        await expect(
          color(`${theme}-off-${row}-x`),
          `${theme} ${row} expanded`
        ).toBe(half);
        await expect(
          style(`${theme}-off-${row}-x`).backgroundColor,
          `${theme} ${row} expanded fill`
        ).toBe(style(`${theme}-off-prop-x`).backgroundColor);
      }
    }

    // Hovered and held: a real pointer, each colour read once its
    // transition has settled.
    const commands = (globalThis as { __realCommands?: OutlineCommands })
      .__realCommands;
    if (!commands) {
      // Vitest always provides the commands; Storybook's own runner has none.
      const underVitest =
        (globalThis as { __vitest_browser__?: boolean }).__vitest_browser__ ===
          true ||
        Boolean((import.meta as { env?: Record<string, unknown> }).env?.VITEST);
      if (underVitest) {
        throw new Error("Real pointer commands are missing.");
      }
      return;
    }
    for (const theme of outlineThemes) {
      const half = color(`${theme}-fg-50`);
      for (const row of outlineDisabledRows) {
        const id = `${theme}-off-${row}`;
        const el = canvas.getByTestId(id);
        // biome-ignore lint/performance/noAwaitInLoops: one control at a time
        await commands.pointerMoveTo(`[data-testid="${id}"]`);
        await expect(
          await outlineUntil(() => el.matches(":hover")),
          `${id} :hover`
        ).toBe(true);
        await outlineSettled(el);
        await expect(color(id), `${id} hovered`).toBe(half);
        await commands.pointerDown();
        try {
          await expect(
            await outlineUntil(() => el.matches(":active")),
            `${id} :active`
          ).toBe(true);
          await outlineSettled(el);
          await expect(color(id), `${id} pressed`).toBe(half);
        } finally {
          await commands.pointerUp();
          await commands.pointerMoveAway();
        }
      }
    }
  },
};

// Link variant with back icon
export const Link: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button variant="link">
        <ArrowLeft /> Go back
      </Button>
    </div>
  ),
};

// Button sizes
export const Small: Story = {
  args: {
    children: "Small Button",
    size: "sm",
  } as any,
};

export const Medium: Story = {
  args: {
    children: "Default Button",
    size: "default",
  } as any,
};

export const Large: Story = {
  args: {
    children: "Large Button",
    size: "lg",
  } as any,
};

// Icon button example
export const IconButton: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button aria-label="Next" className="aspect-square">
        <ArrowRight size={16} />
      </Button>

      <Button aria-label="Mail" className="aspect-square" variant="secondary">
        <Mail size={16} />
      </Button>

      <Button aria-label="Bold" className="aspect-square" variant="outline">
        <Bold size={16} />
      </Button>

      <Button aria-label="Italic" className="aspect-square" variant="ghost">
        <Italic size={16} />
      </Button>

      <Button
        aria-label="Add"
        className="aspect-square rounded-full"
        variant="outline"
      >
        <Plus aria-hidden="true" size={16} />
      </Button>
    </div>
  ),
};

// With icons
export const WithIcon: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button>
        Next <ArrowRight />
      </Button>

      <Button variant="secondary">
        <Mail /> Email
      </Button>

      <Button variant="outline">
        <ArrowLeft /> Previous
      </Button>

      <Button variant="ghost">
        Settings <ChevronDown />
      </Button>
    </div>
  ),
};

// Button states
export const Disabled: Story = {
  args: {
    children: "Disabled Button",
    disabled: true,
    onClick: fn(),
  } as any,
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: /disabled button/i });

    // Simulate click on disabled button
    await userEvent.click(button);

    // Assert button is disabled and onClick was not called
    await expect(button).toBeDisabled();
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const FullWidth: Story = {
  args: {
    children: "Full Width Button",
    className: "w-full",
  } as any,
};

// Link button
export const AsLink: Story = {
  args: {
    children: "Link Button",
    href: "https://example.com",
    target: "_blank",
  } as any,
};

// Interactive loading state example
export const Loading: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleClick = () => {
      setIsLoading(true);
      // Simulate an async operation
      setTimeout(() => {
        setIsLoading(false);
      }, 1500); // Reset after 1.5 seconds
    };

    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-4">
          {/* Text only button */}
          <Button
            disabled={isLoading}
            isLoading={isLoading}
            onClick={handleClick}
          >
            Text only
          </Button>

          {/* Button with icon on the left */}
          <Button
            disabled={isLoading}
            isLoading={isLoading}
            onClick={handleClick}
            variant="secondary"
          >
            <Mail />
            Icon left
          </Button>

          {/* Button with icon on the right */}
          <Button
            disabled={isLoading}
            isLoading={isLoading}
            onClick={handleClick}
            variant="outline"
          >
            Icon right
            <ArrowRight />
          </Button>
        </div>
      </div>
    );
  },
};

// Regression fixture: a loading button keeps its name, is busy, and does not
// move. Each loading button sits beside an idle twin of the same content.
const loadingCases = [
  { id: "default", size: "default", icon: false },
  { id: "default-icon", size: "default", icon: true },
  { id: "sm", size: "sm", icon: false },
  { id: "sm-icon", size: "sm", icon: true },
] as const;

// Kept out of quoted name literals, which the stories-vs-demos lint reads as
// story names.
const loadingNames = ["Save disabled", "Open docs", "Add item"] as const;

export const LoadingNames: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-4">
      {loadingCases.map(({ id, size, icon }) => (
        <div className="flex gap-4" key={id}>
          {[false, true].map((loading) => (
            <Button
              data-testid={`${id}-${loading ? "loading" : "idle"}`}
              isLoading={loading}
              key={String(loading)}
              size={size}
            >
              {icon && <Mail />}
              {`Save ${id}`}
            </Button>
          ))}
        </div>
      ))}
      <Button disabled isLoading>
        Save disabled
      </Button>
      <Button isLoading nativeButton={false} render={<a href="#docs" />}>
        Open docs
      </Button>
      <Button aria-label="Add item" isLoading size="icon">
        <Plus />
      </Button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const box = (el: Element) => {
      const r = el.getBoundingClientRect();
      return {
        width: r.width,
        height: r.height,
        cx: r.x + r.width / 2,
        cy: r.y + r.height / 2,
      };
    };
    for (const { id } of loadingCases) {
      const idle = canvas.getByTestId(`${id}-idle`);
      const loading = canvas.getByTestId(`${id}-loading`);
      // A rotating svg keeps its bounding-box centre, so the centre is
      // compared, not the width and height.
      const spinner = loading.querySelector("svg.animate-spin") as Element;
      const b = box(loading);
      const o = box(spinner);
      // biome-ignore lint/performance/noAwaitInLoops: one case at a time
      await expect(b.width).toBe(box(idle).width);
      await expect(b.height).toBe(box(idle).height);
      await expect(o.cx).toBeCloseTo(b.cx, 1);
      await expect(o.cy).toBeCloseTo(b.cy, 1);
    }
    // The label still names the button but is not painted: the product of
    // its own and its ancestors' opacity, up to the button, is 0.
    const paintedOpacity = (el: Element, stop: Element) => {
      let opacity = 1;
      for (let node: Element | null = el; node; node = node.parentElement) {
        opacity *= Number(getComputedStyle(node).opacity);
        if (node === stop) {
          break;
        }
      }
      return opacity;
    };
    for (const { id } of loadingCases) {
      const idle = canvas.getByTestId(`${id}-idle`);
      const loading = canvas.getByTestId(`${id}-loading`);
      // biome-ignore lint/performance/noAwaitInLoops: one case at a time
      await expect(
        paintedOpacity(within(loading).getByText(`Save ${id}`), loading)
      ).toBe(0);
      await expect(
        paintedOpacity(within(idle).getByText(`Save ${id}`), idle)
      ).toBe(1);
    }

    for (const { id } of loadingCases) {
      // The idle twin shares the name; the loading one must have it too.
      const loading = canvas.getByTestId(`${id}-loading`);
      // biome-ignore lint/performance/noAwaitInLoops: one case at a time
      await expect(
        canvas.getAllByRole("button", { name: `Save ${id}` })
      ).toContain(loading);
      // Not aria-busy (JAWS can hide a busy element's contents); unavailable
      // through aria-disabled, so it stays in the tab order.
      await expect(loading).not.toHaveAttribute("aria-busy");
      await expect(loading).toHaveAttribute("aria-disabled", "true");
      await expect(loading).not.toHaveAttribute("disabled");
    }
    // Explicitly disabled wins: natively disabled, out of the tab order.
    await expect(
      canvas.getByRole("button", { name: loadingNames[0] })
    ).toBeDisabled();
    for (const name of loadingNames.slice(1)) {
      // biome-ignore lint/performance/noAwaitInLoops: one case at a time
      await expect(canvas.getByRole("button", { name })).toHaveAttribute(
        "aria-disabled",
        "true"
      );
    }
  },
};

const submitLabel = "Submit order";

function LoadOnPress() {
  const [loading, setLoading] = useState(false);
  return (
    <Button isLoading={loading} onClick={() => setLoading(true)}>
      {submitLabel}
    </Button>
  );
}

// A real browser drops focus from a button that becomes natively disabled;
// jsdom does not, so this lives here rather than in the unit tests.
export const LoadingKeepsFocus: Story = {
  render: () => <LoadOnPress />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: submitLabel });
    button.focus();
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(button).toHaveAttribute("data-loading"));
    await expect(button).toHaveFocus();
  },
};

// ButtonGroup example
export const ButtonGroups: Story = {
  name: "Button Group",
  render: () => (
    <ButtonGroup>
      <Button variant="outline">Day</Button>
      <Button variant="outline">Week</Button>
      <Button variant="outline">Month</Button>
      <Button variant="outline">Year</Button>
    </ButtonGroup>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "To create a button group, use the `ButtonGroup` component. See the [ButtonGroup documentation](?path=/docs/components-buttongroup--docs) for more examples.",
      },
    },
  },
};

// Social buttons example
export const SocialButtons: Story = {
  render: () => (
    <div className="space-y-8">
      {/* Vertical social buttons with text */}
      <div>
        <h3 className="mb-2 font-medium text-sm">Vertical with Text</h3>
        <div className="flex max-w-xs flex-col gap-2">
          <Button size="sm" variant="outline">
            <RiGoogleFill
              aria-hidden="true"
              className="me-1 text-[#DB4437] dark:text-white/60"
              size={16}
            />
            Login with Google
          </Button>
          <Button size="sm" variant="outline">
            <RiTwitterXFill
              aria-hidden="true"
              className="me-1 text-[#14171a] dark:text-white/60"
              size={16}
            />
            Login with X
          </Button>
          <Button size="sm" variant="outline">
            <RiFacebookFill
              aria-hidden="true"
              className="me-1 text-[#1877f2] dark:text-white/60"
              size={16}
            />
            Login with Facebook
          </Button>
          <Button size="sm" variant="outline">
            <RiGithubFill
              aria-hidden="true"
              className="me-1 text-[#333333] dark:text-white/60"
              size={16}
            />
            Login with GitHub
          </Button>
        </div>
      </div>

      {/* Horizontal social buttons with icons only */}
      <div>
        <h3 className="mb-2 font-medium text-sm">Horizontal Icons Only</h3>
        <div className="flex gap-2">
          <Button
            aria-label="Login with Google"
            className="aspect-square"
            size="sm"
            variant="outline"
          >
            <RiGoogleFill
              aria-hidden="true"
              className="text-[#DB4437] dark:text-white/60"
              size={16}
            />
          </Button>
          <Button
            aria-label="Login with X"
            className="aspect-square"
            size="sm"
            variant="outline"
          >
            <RiTwitterXFill
              aria-hidden="true"
              className="text-[#14171a] dark:text-white/60"
              size={16}
            />
          </Button>
          <Button
            aria-label="Login with Facebook"
            className="aspect-square"
            size="sm"
            variant="outline"
          >
            <RiFacebookFill
              aria-hidden="true"
              className="text-[#1877f2] dark:text-white/60"
              size={16}
            />
          </Button>
          <Button
            aria-label="Login with GitHub"
            className="aspect-square"
            size="sm"
            variant="outline"
          >
            <RiGithubFill
              aria-hidden="true"
              className="text-[#333333] dark:text-white/60"
              size={16}
            />
          </Button>
        </div>
      </div>

      {/* Social interaction buttons */}
      <div>
        <h3 className="mb-2 font-medium text-sm">Social Interaction Buttons</h3>
        <div className="flex flex-wrap gap-4">
          {/* Like button with counter */}
          <Button className="py-0 pe-0" variant="outline">
            <ThumbsUpIcon
              aria-hidden="true"
              className="me-1 opacity-60"
              size={16}
            />
            Like
            <span className="relative ms-1 inline-flex h-full items-center justify-center rounded-full px-3 font-medium text-muted-foreground text-xs before:absolute before:inset-0 before:left-0 before:w-px before:bg-input">
              86
            </span>
          </Button>

          {/* Star button with counter */}
          <Button>
            <StarIcon
              aria-hidden="true"
              className="-ms-1 opacity-60"
              size={16}
            />
            <span className="flex items-baseline gap-2">
              Star
              <span className="text-primary-foreground/60 text-xs">729</span>
            </span>
          </Button>
        </div>
      </div>
    </div>
  ),
};

// Custom loading button example with Lucide icon
export const CustomLoading: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const toggleLoading = () => {
      setIsLoading(!isLoading);
    };

    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Button onClick={toggleLoading} size="sm" variant="outline">
            {isLoading ? "Stop Loading" : "Start Loading"}
          </Button>
          <p className="text-muted-foreground text-sm">
            ← Click to toggle loading state on all buttons
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          {/* Custom loading indicator */}
          <Button className="flex items-center gap-2" disabled={isLoading}>
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            Manual loader
          </Button>

          {/* Icon on left with loading */}
          <Button
            className="flex items-center gap-2"
            isLoading={isLoading}
            variant="secondary"
          >
            <Mail className="h-4 w-4" />
            With left icon
          </Button>

          {/* Icon on right with loading */}
          <Button
            className="flex items-center gap-2"
            isLoading={isLoading}
            variant="outline"
          >
            With right icon
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>

          {/* Multiple icons with loading */}
          <Button
            className="flex items-center gap-2"
            isLoading={isLoading}
            variant="destructive"
          >
            <Mail className="h-4 w-4" />
            Multiple icons
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  },
};

// Rounded buttons example
export const RoundedButtons: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button className="rounded-full" size="sm">
        Default
      </Button>

      <Button className="rounded-full" size="sm" variant="secondary">
        Secondary
      </Button>

      <Button className="rounded-full" size="sm" variant="destructive">
        Destructive
      </Button>

      <Button className="rounded-full" size="sm" variant="outline">
        Outline
      </Button>

      <Button className="rounded-full" size="sm" variant="ghost">
        Ghost
      </Button>

      <Button className="rounded-full" size="sm" variant="link">
        Link
      </Button>

      <Button
        aria-label="Icon"
        className="aspect-square rounded-full"
        size="sm"
      >
        <Plus aria-hidden="true" size={16} />
      </Button>
    </div>
  ),
};
