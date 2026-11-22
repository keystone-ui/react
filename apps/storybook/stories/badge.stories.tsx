import { Badge } from "@keystoneui/react/badge";
import { Spinner } from "@keystoneui/react/spinner";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  CircleAlert as AlertCircleIcon,
  ArrowUpRight as ArrowUpRightIcon,
  BadgeCheck as BadgeCheckIcon,
  Bath as BathIcon,
  Bed as BedIcon,
  Bookmark as BookmarkIcon,
  Calendar as CalendarIcon,
  Check as CheckIcon,
  CircleCheck as CircleCheckIcon,
  CircleX as CircleXIcon,
  Info as InfoIcon,
  LandPlot as LandPlotIcon,
  TriangleAlert as TriangleAlertIcon,
  Users as UsersIcon,
  X as XIcon,
} from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { expect, waitFor, within } from "storybook/test";

const meta = {
  title: "Components/Badge",
  component: Badge,
  parameters: {
    docs: {
      description: {
        component: `
A versatile badge component with semantic variants and polymorphic rendering via a \`render\` prop.

\`\`\`tsx
import { Badge } from "@keystoneui/react/badge";

// Default badge
<Badge>New</Badge>

// Semantic variants
<Badge variant="secondary">Secondary</Badge>
<Badge variant="error" appearance="soft">Error</Badge>
<Badge variant="outline">Outline</Badge>
<Badge variant="ghost">Ghost</Badge>
<Badge variant="link">Link</Badge>

// Status tones: solid by default, or soft
<Badge variant="success">Paid</Badge>
<Badge variant="error" appearance="soft">Failed</Badge>

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

- Semantic variants: default, secondary, success, warning, info, error, outline, ghost, link (destructive is a deprecated alias of error)
- Status tones (success, warning, info, error) in a solid or a soft appearance
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
        "success",
        "warning",
        "info",
        "error",
        "destructive",
        "outline",
        "ghost",
        "link",
      ],
      defaultValue: "default",
      description: "The semantic variant of the badge",
    },
    appearance: {
      control: "select",
      options: ["solid", "soft"],
      defaultValue: "solid",
      description:
        "Solid or soft fill. Applies to `success`, `warning`, `info`, `error` and the deprecated `destructive` alias.",
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
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof Badge>;

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  args: {
    children: "Badge",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByText("Badge");
    await expect(badge).toBeVisible();
    await expect(badge).toHaveAttribute("data-slot", "badge");
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
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="info">Info</Badge>
      <Badge appearance="soft" variant="error">
        Error
      </Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="ghost">Ghost</Badge>
      <Badge variant="link">Link</Badge>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Status tones: solid and soft
// ---------------------------------------------------------------------------

/** The style prop and its two values. */
const STYLE_PROP = "appearance";
const SOLID = "solid";
const SOFT = "soft";
const APPEARANCES = [SOLID, SOFT] as const;
type Appearance = (typeof APPEARANCES)[number];
/** The red tone answers to two names that draw the same Badge. */
const RED_NAMES = ["error", "destructive"] as const;
const RED = RED_NAMES[0];

type StatusTone = "success" | "warning" | "info" | typeof RED;
type BadgeSize = "default" | "sm";
type Theme = "light" | "dark";
const STATUS_TONES: StatusTone[] = ["success", "warning", "info", RED];

/** Tailwind v4 palette steps used by the status tones (oklch L C H). */
const STEP = {
  "green-50": "0.982 0.018 155.826",
  "green-400": "0.792 0.209 151.711",
  "green-500": "0.723 0.219 149.579",
  "green-700": "0.527 0.154 150.069",
  "green-800": "0.448 0.119 151.328",
  "green-950": "0.266 0.065 152.934",
  "amber-400": "0.828 0.189 84.429",
  "amber-700": "0.555 0.163 48.998",
  "amber-950": "0.279 0.077 45.635",
  "blue-50": "0.97 0.014 254.604",
  "blue-400": "0.707 0.165 254.624",
  "blue-600": "0.546 0.245 262.881",
  "blue-700": "0.488 0.243 264.376",
  "blue-950": "0.282 0.091 267.935",
  "red-50": "0.971 0.013 17.38",
  "red-400": "0.704 0.191 22.216",
  "red-700": "0.505 0.213 27.518",
  "red-950": "0.258 0.092 26.042",
} as const;
type Step = keyof typeof STEP;

/** The expected colours: the fill step (soft takes it at 15%, its border at 30%) and the text step. */
const EXPECTED: Record<
  Theme,
  Record<StatusTone, { fill: Step; solidText: Step; softText: Step }>
> = {
  light: {
    success: {
      fill: "green-700",
      solidText: "green-50",
      softText: "green-800",
    },
    warning: {
      fill: "amber-400",
      solidText: "amber-950",
      softText: "amber-700",
    },
    info: { fill: "blue-600", solidText: "blue-50", softText: "blue-700" },
    [RED]: { fill: "red-700", solidText: "red-50", softText: "red-700" },
  },
  dark: {
    success: {
      fill: "green-500",
      solidText: "green-950",
      softText: "green-400",
    },
    warning: {
      fill: "amber-400",
      solidText: "amber-950",
      softText: "amber-400",
    },
    info: { fill: "blue-400", solidText: "blue-950", softText: "blue-400" },
    [RED]: { fill: "red-400", solidText: "red-950", softText: "red-400" },
  },
};

/** The window that styles an element: the preview's, or a frame's. */
const viewOf = (element: Element) =>
  element.ownerDocument.defaultView ?? window;

/** Serialises a CSS colour the way this browser computes it, for comparison. */
function computedColor(container: HTMLElement, css: string) {
  const probe = container.ownerDocument.createElement("span");
  probe.style.color = css;
  container.append(probe);
  const value = viewOf(probe).getComputedStyle(probe).color;
  probe.remove();
  return value;
}

const oklch = (step: Step) => `oklch(${STEP[step]})`;
const mixed = (step: Step, percent: number) =>
  `color-mix(in oklab, ${oklch(step)} ${percent}%, transparent)`;

/** Asserts a mounted status Badge paints the expected colours of its theme. */
async function expectPaletteColors(
  badge: HTMLElement,
  tone: StatusTone,
  appearance: Appearance,
  theme: Theme
) {
  const expected = EXPECTED[theme][tone];
  const style = viewOf(badge).getComputedStyle(badge);
  const scope = badge.parentElement ?? badge;
  if (appearance === SOLID) {
    await expect(style.backgroundColor).toBe(
      computedColor(scope, oklch(expected.fill))
    );
    await expect(style.color).toBe(
      computedColor(scope, oklch(expected.solidText))
    );
  } else {
    await expect(style.backgroundColor).toBe(
      computedColor(scope, mixed(expected.fill, 15))
    );
    await expect(style.borderTopColor).toBe(
      computedColor(scope, mixed(expected.fill, 30))
    );
    await expect(style.color).toBe(
      computedColor(scope, oklch(expected.softText))
    );
  }
}

const TONE_ICON = {
  success: CircleCheckIcon,
  warning: TriangleAlertIcon,
  info: InfoIcon,
  [RED]: CircleXIcon,
} satisfies Record<StatusTone, unknown>;

const label = (tone: string) => tone[0].toUpperCase() + tone.slice(1);

/** One tone in both appearances, with and without an icon. */
function toneStory(tone: StatusTone) {
  const Icon = TONE_ICON[tone];
  return {
    render: () => (
      <div className="flex flex-wrap items-center gap-2">
        {APPEARANCES.map((appearance) => [
          <Badge
            data-testid={`${tone}-${appearance}`}
            key={appearance}
            variant={tone}
            {...{ [STYLE_PROP]: appearance }}
          >
            {label(tone)}
          </Badge>,
          <Badge
            data-testid={`${tone}-${appearance}-icon`}
            key={`${appearance}-icon`}
            variant={tone}
            {...{ [STYLE_PROP]: appearance }}
          >
            <Icon aria-hidden="true" data-icon="inline-start" />
            {label(tone)}
          </Badge>,
        ])}
      </div>
    ),
    play: async ({ canvasElement }) => {
      const theme: Theme = document.documentElement.classList.contains("dark")
        ? "dark"
        : "light";
      for (const appearance of APPEARANCES) {
        for (const suffix of ["", "-icon"]) {
          const badge = canvasElement.querySelector<HTMLElement>(
            `[data-testid="${tone}-${appearance}${suffix}"]`
          );
          // biome-ignore lint/performance/noAwaitInLoops: assertions in order
          await expect(badge).toHaveAttribute("data-variant", tone);
          await expect(badge).toHaveAttribute(`data-${STYLE_PROP}`, appearance);
          if (badge) {
            await expectPaletteColors(badge, tone, appearance, theme);
          }
        }
      }
      // The icon is sized by the Badge and takes the text colour.
      const icon = canvasElement.querySelector<SVGElement>(
        `[data-testid="${tone}-${SOFT}-icon"] svg`
      );
      await expect(icon?.getBoundingClientRect().width).toBe(12);
    },
  } satisfies Story;
}

export const Success: Story = toneStory("success");

export const Warning: Story = toneStory("warning");

export const Info: Story = toneStory("info");

export const ErrorTone: Story = { ...toneStory(RED), name: label(RED) };

const PALETTE_SIZES: BadgeSize[] = ["default", "sm"];
const SURFACES = ["background", "card"] as const;
type Surface = (typeof SURFACES)[number];
const PANEL_THEMES: Theme[] = ["light", "dark"];
/** Badge heights: `h-5` and `h-4`. */
const BADGE_HEIGHT_REM: Record<BadgeSize, number> = { default: 1.25, sm: 1 };
/** The root font size of the document an element belongs to. */
const rootFontSize = (element: Element) =>
  Number.parseFloat(
    viewOf(element).getComputedStyle(element.ownerDocument.documentElement)
      .fontSize
  );

/** The theme the toolbar selects; an empty selection is Light. */
const selectedTheme = (globals: { theme?: unknown }): Theme =>
  globals.theme === "dark" ? "dark" : "light";

/**
 * Puts the toolbar's theme on the preview root: exactly one of `light` and
 * `dark`, and nothing else touched. Nothing is restored afterwards, so the
 * next story starts from the theme the toolbar selects.
 */
function syncPreviewRoot(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("light", theme === "light");
  root.classList.toggle("dark", theme === "dark");
}

const PALETTE_FRAME_TITLE = "Status palette in the light and the dark theme";
const PALETTE_FRAME_DOC =
  '<!doctype html><html class="light"><head><meta charset="utf-8"></head><body></body></html>';

/**
 * A same-origin frame with the preview's compiled CSS and a light root, so the
 * toolbar's theme cannot reach the palette: the light panel is light because
 * its document is, and the dark panel is dark because of its `.dark` class.
 */
function PaletteFrame({ children }: { children: ReactNode }) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [body, setBody] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) {
      return;
    }
    let cancelled = false;
    let observer: ResizeObserver | undefined;
    const populate = async () => {
      const doc = frame.contentDocument;
      if (doc?.URL !== "about:srcdoc" || doc.readyState !== "complete") {
        return;
      }
      frame.removeEventListener("load", populate);
      // Stylesheets: <style> under Vite and Vitest, <link> in a static build.
      const loads: Promise<boolean>[] = [];
      for (const sheet of document.head.querySelectorAll<
        HTMLStyleElement | HTMLLinkElement
      >('style, link[rel="stylesheet"]')) {
        const copy = doc.importNode(sheet, true);
        if (sheet instanceof HTMLLinkElement) {
          copy.setAttribute("href", sheet.href);
          loads.push(
            new Promise<boolean>((resolve) => {
              copy.addEventListener("load", () => resolve(true), {
                once: true,
              });
              copy.addEventListener("error", () => resolve(false), {
                once: true,
              });
            })
          );
        }
        doc.head.append(copy);
      }
      const loaded = await Promise.all(loads);
      if (cancelled || loaded.includes(false)) {
        return;
      }
      observer = new ResizeObserver(() => {
        frame.style.height = `${doc.documentElement.scrollHeight}px`;
      });
      observer.observe(doc.body);
      setBody(doc.body);
    };
    frame.addEventListener("load", populate);
    populate();
    return () => {
      cancelled = true;
      frame.removeEventListener("load", populate);
      observer?.disconnect();
    };
  }, []);

  return (
    <iframe
      className="block w-full border-0"
      data-ready={body ? "true" : undefined}
      ref={frameRef}
      srcDoc={PALETTE_FRAME_DOC}
      title={PALETTE_FRAME_TITLE}
    >
      {body ? createPortal(children, body) : null}
    </iframe>
  );
}

/**
 * Every status tone in both appearances, in the light and the dark theme, on
 * the page background and on a card, at both sizes. Each Badge must paint the
 * expected palette colours of the panel it sits in, sit on the surface it
 * names and have the height of its size.
 *
 * The grid renders in a frame whose root is always light, so the toolbar's
 * theme cannot paint the light panel dark; the dark panel takes the theme
 * from its `.dark` class, as the `dark` variant allows. Outside the frame the
 * preview root follows the toolbar like every other story.
 */
export const StatusPalette: Story = {
  name: "Status Palette",
  parameters: {
    // Inline on the Documentation page, so the stories beside it share the
    // preview root that follows the toolbar.
    docs: { story: { inline: true, autoplay: true } },
    // axe is not loaded inside the frame, so it cannot check the Badges
    // there; left to try, it waits about half a second on the frame after
    // every render, and leaving the story inside that wait makes Storybook
    // reload the preview, which starts the next story from a bare root.
    a11y: { options: { iframes: false } },
  },
  // Before the palette mounts, and again on every toolbar change (Storybook
  // runs beforeEach on each render), the preview root takes the selected
  // theme. No cleanup: the next story keeps the theme the toolbar selects.
  beforeEach: ({ globals }) => {
    syncPreviewRoot(selectedTheme(globals));
  },
  render: () => (
    <PaletteFrame>
      <div className="flex flex-col gap-4">
        {PANEL_THEMES.map((theme) => (
          <div
            className={theme === "dark" ? "dark" : undefined}
            data-theme-panel={theme}
            key={theme}
          >
            {SURFACES.map((surface) => (
              <div
                className={
                  surface === "card"
                    ? "flex flex-col gap-2 bg-card p-3 text-card-foreground"
                    : "flex flex-col gap-2 bg-background p-3 text-foreground"
                }
                data-surface={surface}
                key={surface}
              >
                {PALETTE_SIZES.map((size) => (
                  <div className="flex flex-wrap items-center gap-2" key={size}>
                    {APPEARANCES.flatMap((appearance) =>
                      [...STATUS_TONES, RED_NAMES[1]].map((name) => (
                        <Badge
                          data-palette={`${theme}-${surface}-${size}-${appearance}-${name}`}
                          key={`${appearance}-${name}`}
                          size={size}
                          variant={name}
                          {...{ [STYLE_PROP]: appearance }}
                        >
                          {label(name)}
                        </Badge>
                      ))
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </PaletteFrame>
  ),
  play: async ({ canvasElement, globals }) => {
    // The preview root carries the toolbar's theme, and only that one.
    const theme = selectedTheme(globals);
    const root = document.documentElement.classList;
    await expect({
      light: root.contains("light"),
      dark: root.contains("dark"),
    }).toEqual({ light: theme === "light", dark: theme === "dark" });

    const frame = canvasElement.querySelector<HTMLIFrameElement>(
      `iframe[title="${PALETTE_FRAME_TITLE}"]`
    );
    await expect(frame).not.toBeNull();
    // Mounted and styled. Read-only: nothing here writes to the DOM.
    const { doc, badges } = await waitFor(() => {
      const current = frame?.contentDocument;
      if (!(current && frame?.isConnected) || frame.dataset.ready !== "true") {
        throw new Error("Waiting for the Status Palette iframe");
      }
      const nodes = Array.from(
        current.querySelectorAll<HTMLElement>("[data-palette]")
      );
      if (nodes.length !== 80) {
        throw new Error(
          `Expected 80 Status Palette Badges, found ${nodes.length}`
        );
      }
      return { doc: current, badges: nodes };
    });
    // The frame is light whatever the toolbar says.
    await expect(doc.documentElement.classList.contains("light")).toBe(true);
    await expect(doc.documentElement.classList.contains("dark")).toBe(false);

    for (const badge of badges) {
      const [named, surface, size, appearance, name] = (
        badge.dataset.palette ?? ""
      ).split("-") as [Theme, Surface, BadgeSize, Appearance, string];
      // Held to the palette its panel declares; only the dark panel's Badges
      // have a `.dark` ancestor.
      const panel = badge.closest<HTMLElement>("[data-theme-panel]");
      const declared = panel?.dataset.themePanel as Theme;
      // biome-ignore lint/performance/noAwaitInLoops: assertions in order
      await expect(declared).toBe(named);
      await expect(badge.closest(".dark") !== null).toBe(declared === "dark");
      const tone = (RED_NAMES as readonly string[]).includes(name)
        ? RED
        : (name as StatusTone);
      await expectPaletteColors(badge, tone, appearance, declared);
      // The Badge sits on the surface it names, at the height of its size.
      const wrapper = badge.closest<HTMLElement>("[data-surface]");
      await expect(wrapper?.dataset.surface).toBe(surface);
      if (wrapper) {
        await expect(
          viewOf(wrapper).getComputedStyle(wrapper).backgroundColor
        ).toBe(computedColor(wrapper, `var(--${surface})`));
      }
      await expect(badge.getBoundingClientRect().height).toBe(
        rootFontSize(badge) * BADGE_HEIGHT_REM[size]
      );
    }
    await expect(
      frame?.isConnected &&
        frame.contentDocument === doc &&
        badges.every((badge) => doc.body.contains(badge))
    ).toBe(true);
  },
};

/** The custom browser commands registered in vitest.config.ts. */
interface RealCommands {
  pointerMoveAway: () => Promise<void>;
  pointerMoveTo: (selector: string) => Promise<void>;
  screenshotBase64: (selector: string) => Promise<string>;
}

/** Vitest's real (Playwright) pointer; absent when Storybook runs the play. */
const realCommands = () =>
  (globalThis as { __realCommands?: RealCommands }).__realCommands;

/** Decodes a base64 PNG into its RGBA pixels. */
async function decodePng(base64: string) {
  const image = new Image();
  image.src = `data:image/png;base64,${base64}`;
  await image.decode();
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("decodePng: no 2d context");
  }
  context.drawImage(image, 0, 0);
  return context.getImageData(0, 0, canvas.width, canvas.height);
}

/**
 * The widest row of pixels that hovering changed, as a share of the row.
 * The fill does not change on hover, so a changed row is the underline;
 * one clipped away by the Badge's `overflow-hidden` changes nothing.
 */
function widestChangedRow(rest: ImageData, hovered: ImageData) {
  let widest = 0;
  for (let y = 0; y < rest.height; y++) {
    let changed = 0;
    for (let x = 0; x < rest.width; x++) {
      const i = (y * rest.width + x) * 4;
      const delta =
        Math.abs(rest.data[i] - hovered.data[i]) +
        Math.abs(rest.data[i + 1] - hovered.data[i + 1]) +
        Math.abs(rest.data[i + 2] - hovered.data[i + 2]);
      if (delta > 48) {
        changed++;
      }
    }
    widest = Math.max(widest, changed / rest.width);
  }
  return widest;
}

/** Lets any running transition finish, so computed colours are settled. */
async function settle(element: HTMLElement) {
  // Reading a computed value applies the pending hover style, which is what
  // starts a transition; then wait for each one to end.
  const applied = getComputedStyle(element).backgroundColor;
  await expect(applied).not.toBe("");
  await Promise.all(element.getAnimations().map((a) => a.finished));
}

/**
 * Hovers a linked Badge with the real pointer: the fill stays the same, and
 * an underline is painted inside the Badge's clipped box.
 */
async function expectLinkHover(canvasElement: HTMLElement, testId: string) {
  const selector = `[data-testid="${testId}"]`;
  const badge = canvasElement.querySelector<HTMLElement>(selector);
  await expect(badge?.tagName).toBe("A");
  const commands = realCommands();
  if (!(badge && commands)) {
    return;
  }
  // The pixels depend on the glyphs: measure in the Storybook-hosted Geist,
  // never a fallback system font.
  await expect(getComputedStyle(badge).fontFamily).toMatch(/^"Geist Variable"/);
  await document.fonts.load(
    `500 ${getComputedStyle(badge).fontSize} "Geist Variable"`
  );
  await document.fonts.ready;
  await expect(
    document.fonts.check(
      `500 ${getComputedStyle(badge).fontSize} "Geist Variable"`
    )
  ).toBe(true);

  await commands.pointerMoveAway();
  await settle(badge);
  const rest = getComputedStyle(badge);
  const restFill = rest.backgroundColor;
  await expect(rest.textDecorationLine).toBe("none");
  const restPixels = await decodePng(await commands.screenshotBase64(selector));

  await commands.pointerMoveTo(selector);
  await expect(badge.matches(":hover")).toBe(true);
  await settle(badge);
  const hovered = getComputedStyle(badge);
  await expect(hovered.backgroundColor).toBe(restFill);
  await expect(hovered.textDecorationLine).toBe("underline");
  const hoveredPixels = await decodePng(
    await commands.screenshotBase64(selector)
  );
  await commands.pointerMoveAway();

  // The text spans the Badge minus its padding and border, so a painted
  // underline changes well over a third of one row of the Badge's box.
  await expect(widestChangedRow(restPixels, hoveredPixels)).toBeGreaterThan(
    0.35
  );
}

const LINK_SIZES = ["sm", "default"] as const;

/**
 * A linked status Badge keeps its fill on hover and underlines instead; the
 * last row is the link variant, whose underline must also be painted at sm.
 * The Vitest browser test moves the pointer over each link.
 */
export const StatusAsLink: Story = {
  name: "Status As Link",
  render: () => (
    <div className="flex flex-col gap-2">
      {APPEARANCES.flatMap((appearance) =>
        LINK_SIZES.map((size) => (
          <div
            className="flex flex-wrap items-center gap-2"
            key={`${appearance}-${size}`}
          >
            {STATUS_TONES.map((tone) => (
              <Badge
                data-testid={`status-link-${tone}-${appearance}-${size}`}
                key={tone}
                render={<a href={`#${tone}`} />}
                size={size}
                variant={tone}
                {...{ [STYLE_PROP]: appearance }}
              >
                {label(tone)} link
              </Badge>
            ))}
          </div>
        ))
      )}
      <div className="flex flex-wrap items-center gap-2">
        {LINK_SIZES.map((size) => (
          <Badge
            data-testid={`link-variant-${size}`}
            key={size}
            render={<a href="#link" />}
            size={size}
            variant="link"
          >
            Link variant
          </Badge>
        ))}
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    for (const appearance of APPEARANCES) {
      for (const size of LINK_SIZES) {
        for (const tone of STATUS_TONES) {
          // biome-ignore lint/performance/noAwaitInLoops: one real pointer, one link at a time
          await expectLinkHover(
            canvasElement,
            `status-link-${tone}-${appearance}-${size}`
          );
        }
      }
    }
    for (const size of LINK_SIZES) {
      // biome-ignore lint/performance/noAwaitInLoops: one real pointer, one link at a time
      await expectLinkHover(canvasElement, `link-variant-${size}`);
    }
  },
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
      <Badge appearance="soft" variant="error">
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
