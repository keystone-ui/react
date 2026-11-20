import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { Badge, badgeVariants } from "./badge";

/** The style prop and its two values. */
const STYLE_PROP = "appearance";
const SOLID = "solid";
const SOFT = "soft";
const APPEARANCES = [SOLID, SOFT] as const;
/** The red tone answers to two names that draw the same Badge. */
const RED_NAMES = ["error", "destructive"] as const;
const STATUS_NAMES = ["success", "warning", "info", ...RED_NAMES] as const;

/** A fill with an alpha step, such as `bg-green-700/15`. */
const TINTED_FILL = /(^|\s)(dark:)?bg-[a-z]+-\d+\//;

/** A class that paints a palette step, with or without a `dark:` prefix. */
const PALETTE_CLASS = /(^|:)(bg|text|border)-(green|amber|blue|red)-\d/;

/**
 * The red tone keeps the focus-ring colour the old `destructive` Badge gave a
 * consumer who adds a ring width (`focus-visible:ring-2`).
 */
const RED_RING = [
  "focus-visible:ring-destructive/20",
  "dark:focus-visible:ring-destructive/40",
];

/** A border colour other than the base transparent one. */
const OWN_BORDER = /^(dark:)?border-(?!transparent$)[a-z]/;

const WHITESPACE = /\s+/;

const classList = (className: string) =>
  className.split(WHITESPACE).filter(Boolean);

/** Every attribute of an element, by name. */
const attributesOf = (element: Element) =>
  Object.fromEntries(
    Array.from(element.attributes, ({ name, value }) => [name, value])
  );

type Hue = "green" | "amber" | "blue" | "red";
const TONE_OF: Record<(typeof STATUS_NAMES)[number], Hue> = {
  success: "green",
  warning: "amber",
  info: "blue",
  [RED_NAMES[0]]: "red",
  [RED_NAMES[1]]: "red",
} as Record<(typeof STATUS_NAMES)[number], Hue>;

/** The expected palette: solid fill and text; soft 15% fill, 30% border, text. */
const PALETTE: Record<Hue, Record<(typeof APPEARANCES)[number], string[]>> = {
  green: {
    [SOLID]: [
      "bg-green-700",
      "text-green-50",
      "dark:bg-green-500",
      "dark:text-green-950",
    ],
    [SOFT]: [
      "bg-green-700/15",
      "border-green-700/30",
      "text-green-800",
      "dark:bg-green-500/15",
      "dark:border-green-500/30",
      "dark:text-green-400",
    ],
  },
  amber: {
    [SOLID]: ["bg-amber-400", "text-amber-950"],
    [SOFT]: [
      "bg-amber-400/15",
      "border-amber-400/30",
      "text-amber-700",
      "dark:text-amber-400",
    ],
  },
  blue: {
    [SOLID]: [
      "bg-blue-600",
      "text-blue-50",
      "dark:bg-blue-400",
      "dark:text-blue-950",
    ],
    [SOFT]: [
      "bg-blue-600/15",
      "border-blue-600/30",
      "text-blue-700",
      "dark:bg-blue-400/15",
      "dark:border-blue-400/30",
      "dark:text-blue-400",
    ],
  },
  red: {
    [SOLID]: [
      "bg-red-700",
      "text-red-50",
      "dark:bg-red-400",
      "dark:text-red-950",
    ],
    [SOFT]: [
      "bg-red-700/15",
      "border-red-700/30",
      "text-red-700",
      "dark:bg-red-400/15",
      "dark:border-red-400/30",
      "dark:text-red-400",
    ],
  },
};

describe("Badge", () => {
  test("renders correctly with default props", () => {
    render(<Badge>New</Badge>);
    const badge = screen.getByText("New");
    expect(badge).toBeInTheDocument();
    expect(badge.tagName).toBe("SPAN");
  });

  test('has data-slot="badge"', () => {
    render(<Badge>Slotted</Badge>);
    const badge = screen.getByText("Slotted");
    expect(badge).toHaveAttribute("data-slot", "badge");
  });

  // ---------------------------------------------------------------------------
  // Variants
  // ---------------------------------------------------------------------------

  test("applies default variant classes", () => {
    render(<Badge>Default</Badge>);
    const badge = screen.getByText("Default");
    expect(badge).toHaveClass("bg-primary");
    expect(badge).toHaveClass("text-primary-foreground");
  });

  test("applies secondary variant classes", () => {
    render(<Badge variant="secondary">Secondary</Badge>);
    const badge = screen.getByText("Secondary");
    expect(badge).toHaveClass("bg-secondary");
    expect(badge).toHaveClass("text-secondary-foreground");
  });

  test("applies outline variant classes", () => {
    render(<Badge variant="outline">Outline</Badge>);
    const badge = screen.getByText("Outline");
    expect(badge).toHaveClass("border-border");
    expect(badge).toHaveClass("text-foreground");
  });

  test("applies ghost variant classes", () => {
    render(<Badge variant="ghost">Ghost</Badge>);
    const badge = screen.getByText("Ghost");
    expect(badge).toBeInTheDocument();
  });

  test("applies link variant classes", () => {
    render(<Badge variant="link">Link</Badge>);
    const badge = screen.getByText("Link");
    expect(badge).toHaveClass("text-primary");
  });

  // ---------------------------------------------------------------------------
  // Status tones × appearances
  // ---------------------------------------------------------------------------

  describe("status tones", () => {
    const BADGE = "status badge";
    const classesOf = (props: Record<string, unknown>) => {
      const { unmount } = render(<Badge {...props}>{BADGE}</Badge>);
      const badge = screen.getByText(BADGE);
      const result = {
        className: badge.className,
        variant: badge.getAttribute("data-variant"),
        appearance: badge.getAttribute(`data-${STYLE_PROP}`),
        attributes: attributesOf(badge),
      };
      unmount();
      return result;
    };

    const cases = STATUS_NAMES.flatMap((name) =>
      APPEARANCES.map((appearance) => [name, appearance] as const)
    );

    test.each(cases)(
      "%s in %s draws the expected palette",
      (name, appearance) => {
        render(
          <Badge variant={name} {...{ [STYLE_PROP]: appearance }}>
            {BADGE}
          </Badge>
        );
        const badge = screen.getByText(BADGE);
        expect(badge).toHaveAttribute("data-variant", name);
        expect(badge).toHaveAttribute(`data-${STYLE_PROP}`, appearance);
        for (const cls of PALETTE[TONE_OF[name]][appearance]) {
          expect(badge).toHaveClass(cls);
        }
        // A linked status Badge keeps its fill on hover and is underlined. The
        // offset is 2px, not the link variant's 4px: Badge clips overflow, and at
        // size="sm" a 4px offset puts the underline outside the 16px box.
        expect(badge).toHaveClass("[a]:hover:underline");
        expect(badge).toHaveClass("underline-offset-2");
        expect(badge.className).not.toContain("hover:bg-");
        if (appearance === SOFT) {
          // The soft border replaces the base transparent one.
          expect(badge).not.toHaveClass("border-transparent");
        } else {
          expect(badge.className).not.toMatch(TINTED_FILL);
          // Solid keeps the base transparent border and adds none of its own.
          expect(badge).toHaveClass("border-transparent");
          expect(
            classList(badge.className).filter((c) => OWN_BORDER.test(c))
          ).toEqual([]);
        }
        // Exactly the expected palette steps, and no other dark-mode class.
        const classes = classList(badge.className);
        const expected = PALETTE[TONE_OF[name]][appearance];
        expect(classes.filter((c) => PALETTE_CLASS.test(c)).sort()).toEqual(
          [...expected].sort()
        );
        const ring = TONE_OF[name] === "red" ? RED_RING : [];
        expect(classes.filter((c) => c.startsWith("dark:")).sort()).toEqual(
          [...expected, ...ring].filter((c) => c.startsWith("dark:")).sort()
        );
      }
    );

    test.each(cases)(
      "badgeVariants() for %s in %s returns merged classes",
      (name, appearance) => {
        const classes = classList(
          badgeVariants({ variant: name, [STYLE_PROP]: appearance })
        );
        const border = PALETTE[TONE_OF[name]][appearance].filter((c) =>
          c.startsWith("border-")
        );
        for (const cls of border) {
          expect(classes).toContain(cls);
        }
        if (appearance === SOFT) {
          // Used directly on an element, the helper must not leave the base
          // transparent border beside the soft one: the stylesheet would pick
          // whichever comes later, not the one the Badge means.
          expect(classes).not.toContain("border-transparent");
        }
      }
    );

    test.each(
      RED_NAMES.flatMap((name) => APPEARANCES.map((a) => [name, a] as const))
    )(
      "%s in %s keeps the old focus-ring colour under a custom ring width",
      (name, appearance) => {
        render(
          <Badge
            className="focus-visible:ring-2"
            render={<a href="#details" />}
            variant={name}
            {...{ [STYLE_PROP]: appearance }}
          >
            {BADGE}
          </Badge>
        );
        const badge = screen.getByText(BADGE);
        expect(badge).toHaveClass("focus-visible:ring-2");
        for (const cls of RED_RING) {
          expect(badge).toHaveClass(cls);
        }
      }
    );

    test.each(STATUS_NAMES)(
      "%s is solid when no appearance is given",
      (name) => {
        const implicit = classesOf({ variant: name });
        const explicit = classesOf({ variant: name, [STYLE_PROP]: SOLID });
        expect(implicit).toEqual(explicit);
        expect(implicit.appearance).toBe(SOLID);
      }
    );

    test.each(APPEARANCES)(
      "both names of the red tone draw the same Badge in %s",
      (appearance) => {
        const [first, second] = RED_NAMES.map((name) =>
          classesOf({ variant: name, [STYLE_PROP]: appearance })
        );
        expect(first.className).toBe(second.className);
        expect(first.appearance).toBe(second.appearance);
        // data-variant reports the name that was passed, so selectors on
        // either name keep matching.
        expect(first.variant).toBe(RED_NAMES[0]);
        expect(second.variant).toBe(RED_NAMES[1]);
      }
    );

    test.each(["default", "secondary", "outline", "ghost", "link"] as const)(
      "%s ignores the appearance prop",
      (variant) => {
        const plain = classesOf({ variant });
        const solid = classesOf({ variant, [STYLE_PROP]: SOLID });
        const soft = classesOf({ variant, [STYLE_PROP]: SOFT });
        // The whole attribute map, so neither a data attribute nor the prop
        // itself reaches the element.
        expect(solid.attributes).toEqual(plain.attributes);
        expect(soft.attributes).toEqual(plain.attributes);
        expect(plain.attributes).not.toHaveProperty(STYLE_PROP);
        expect(plain.attributes).not.toHaveProperty(`data-${STYLE_PROP}`);
      }
    );
  });

  // ---------------------------------------------------------------------------
  // Sizes
  // ---------------------------------------------------------------------------

  test("applies default size", () => {
    render(<Badge size="default">Default Size</Badge>);
    const badge = screen.getByText("Default Size");
    expect(badge).toHaveClass("text-xs");
    expect(badge).toHaveClass("h-5");
  });

  test("applies sm size", () => {
    render(<Badge size="sm">Small</Badge>);
    const badge = screen.getByText("Small");
    expect(badge).toHaveClass("text-[10px]");
    expect(badge).toHaveClass("h-4");
  });

  // ---------------------------------------------------------------------------
  // Custom className
  // ---------------------------------------------------------------------------

  test("applies custom className", () => {
    render(<Badge className="test-class">Custom Class</Badge>);
    const badge = screen.getByText("Custom Class");
    expect(badge).toHaveClass("test-class");
  });

  // ---------------------------------------------------------------------------
  // Render prop
  // ---------------------------------------------------------------------------

  test("renders as an anchor when render prop is an <a>", () => {
    render(<Badge render={<a href="/link" />}>Link Badge</Badge>);
    const link = screen.getByText("Link Badge");
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("href", "/link");
    expect(link).toHaveAttribute("data-slot", "badge");
  });

  test("renders as a button when render prop is a <button>", () => {
    render(<Badge render={<button type="button" />}>Button Badge</Badge>);
    const button = screen.getByRole("button", { name: "Button Badge" });
    expect(button).toBeInTheDocument();
    expect(button.tagName).toBe("BUTTON");
    expect(button).toHaveAttribute("data-slot", "badge");
  });

  test("merges variant classes onto rendered element", () => {
    render(
      <Badge render={<a href="#" />} variant="secondary">
        Styled Link
      </Badge>
    );
    const link = screen.getByText("Styled Link");
    expect(link.tagName).toBe("A");
    expect(link).toHaveClass("bg-secondary");
    expect(link).toHaveClass("text-secondary-foreground");
  });
});
