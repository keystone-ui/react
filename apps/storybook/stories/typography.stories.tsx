import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";

const meta = {
  title: "Components/Typography",
  parameters: {
    docs: {
      description: {
        component: `
Keystone UI does not ship typography styles by default. These examples show how to use Tailwind CSS utility classes to style headings, paragraphs, lists, and other text elements.

\`\`\`tsx
<h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
  Heading 1
</h1>
<p className="leading-7 not-first:mt-6">
  Paragraph text
</p>
\`\`\`

## Styles

- **H1** — \`text-4xl font-extrabold tracking-tight\`
- **H2** — \`text-3xl font-semibold tracking-tight border-b\`
- **H3** — \`text-2xl font-semibold tracking-tight\`
- **H4** — \`text-xl font-semibold tracking-tight\`
- **Paragraph** — \`leading-7\`
- **Lead** — \`text-xl text-muted-foreground\`
- **Large** — \`text-lg font-semibold\`
- **Small** — \`text-sm leading-none font-medium\`
- **Muted** — \`text-sm text-muted-foreground\`
- **Blockquote** — \`border-l-2 pl-6 italic\`
- **Inline Code** — \`bg-muted rounded px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold\`
`,
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <div className="max-w-2xl">
      <h1 className="scroll-m-20 text-balance font-extrabold text-4xl tracking-tight">
        The Craft of Interface Design
      </h1>
      <p className="not-first:mt-6 text-muted-foreground text-xl leading-7">
        In the early days of the web, interfaces were built with tables and
        inline styles. Designers had little control, and users had even less
        expectation. Then came a quiet revolution.
      </p>
      <h2 className="mt-10 scroll-m-20 border-b pb-2 font-semibold text-3xl tracking-tight transition-colors first:mt-0">
        The Component Era
      </h2>
      <p className="not-first:mt-6 leading-7">
        Designers and engineers began thinking in{" "}
        <a
          className="font-medium text-primary underline underline-offset-4"
          href="https://keystoneui.dev"
        >
          reusable building blocks
        </a>
        : buttons, inputs, cards, and modals that could be composed into any
        layout.
      </p>
      <blockquote className="mt-6 border-l-2 pl-6 italic">
        &quot;Good design is as little design as possible. Less, but
        better.&quot;
      </blockquote>
      <h3 className="mt-8 scroll-m-20 font-semibold text-2xl tracking-tight">
        Design Tokens
      </h3>
      <p className="not-first:mt-6 leading-7">
        Instead of hard-coding colors and spacing, teams adopted token systems
        that made themes swappable:
      </p>
      <ul className="my-6 ml-6 list-disc *:mt-2">
        <li>Semantic color tokens for intent, not appearance</li>
        <li>Spacing scales that enforce visual rhythm</li>
        <li>Typography presets for consistent hierarchy</li>
      </ul>
      <p className="not-first:mt-6 leading-7">
        With tokens in place, switching from a light theme to a dark theme
        became a single toggle rather than a rewrite.
      </p>
      <h3 className="mt-8 scroll-m-20 font-semibold text-2xl tracking-tight">
        Measuring Impact
      </h3>
      <div className="my-6 w-full overflow-y-auto">
        <table className="w-full">
          <thead>
            <tr className="m-0 border-t p-0 even:bg-muted">
              <th className="border px-4 py-2 text-left font-bold">Metric</th>
              <th className="border px-4 py-2 text-left font-bold">
                Before System
              </th>
              <th className="border px-4 py-2 text-left font-bold">
                After System
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="m-0 border-t p-0 even:bg-muted">
              <td className="border px-4 py-2 text-left">
                Inconsistent components
              </td>
              <td className="border px-4 py-2 text-left">47</td>
              <td className="border px-4 py-2 text-left">3</td>
            </tr>
            <tr className="m-0 border-t p-0 even:bg-muted">
              <td className="border px-4 py-2 text-left">
                Dev time per feature
              </td>
              <td className="border px-4 py-2 text-left">2 weeks</td>
              <td className="border px-4 py-2 text-left">3 days</td>
            </tr>
            <tr className="m-0 border-t p-0 even:bg-muted">
              <td className="border px-4 py-2 text-left">
                Design–dev handoff issues
              </td>
              <td className="border px-4 py-2 text-left">Frequent</td>
              <td className="border px-4 py-2 text-left">Rare</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="not-first:mt-6 leading-7">
        Typography, like color and spacing, is one of those foundations. Get it
        right once, and every page benefits.
      </p>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText("The Craft of Interface Design")
    ).toBeVisible();
    await expect(canvas.getByText("The Component Era")).toBeVisible();
    await expect(canvas.getByText("Design Tokens")).toBeVisible();
  },
};

export const Headings: Story = {
  render: () => (
    <div className="max-w-2xl space-y-6">
      <h1 className="scroll-m-20 text-balance font-extrabold text-4xl tracking-tight">
        H1 — The Craft of Interface Design
      </h1>
      <h2 className="scroll-m-20 border-b pb-2 font-semibold text-3xl tracking-tight first:mt-0">
        H2 — The Component Era
      </h2>
      <h3 className="scroll-m-20 font-semibold text-2xl tracking-tight">
        H3 — Design Tokens
      </h3>
      <h4 className="scroll-m-20 font-semibold text-xl tracking-tight">
        H4 — Utility classes keep styles co-located
      </h4>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const h1 = canvas.getByRole("heading", { level: 1 });
    const h2 = canvas.getByRole("heading", { level: 2 });
    const h3 = canvas.getByRole("heading", { level: 3 });
    const h4 = canvas.getByRole("heading", { level: 4 });
    await expect(h1).toBeVisible();
    await expect(h2).toBeVisible();
    await expect(h3).toBeVisible();
    await expect(h4).toBeVisible();
  },
};

export const Paragraph: Story = {
  render: () => (
    <div className="max-w-lg">
      <p className="not-first:mt-6 leading-7">
        Investing in shared foundations — tokens, components, and conventions —
        pays dividends across every product surface.
      </p>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/Investing in shared/)).toBeVisible();
  },
};

export const Blockquote: Story = {
  render: () => (
    <div className="max-w-lg">
      <blockquote className="mt-6 border-l-2 pl-6 italic">
        &quot;Good design is as little design as possible. Less, but
        better.&quot;
      </blockquote>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const blockquote = canvasElement.querySelector("blockquote");
    await expect(blockquote).toBeVisible();
  },
};

export const List: Story = {
  render: () => (
    <div className="max-w-lg">
      <ul className="my-6 ml-6 list-disc *:mt-2">
        <li>Semantic color tokens for intent, not appearance</li>
        <li>Spacing scales that enforce visual rhythm</li>
        <li>Typography presets for consistent hierarchy</li>
      </ul>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const items = canvas.getAllByRole("listitem");
    await expect(items).toHaveLength(3);
  },
};

export const InlineCode: Story = {
  name: "Inline Code",
  render: () => (
    <div className="max-w-lg">
      <p className="leading-7">
        Install the package with{" "}
        <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono font-semibold text-sm">
          @keystoneui/react
        </code>{" "}
        to get started.
      </p>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const code = canvasElement.querySelector("code");
    await expect(code).toBeVisible();
    await expect(canvas.getByText("@keystoneui/react")).toBeVisible();
  },
};

export const Lead: Story = {
  render: () => (
    <div className="max-w-lg">
      <p className="text-muted-foreground text-xl">
        A beautifully crafted component library built on Base UI primitives and
        styled with Tailwind CSS.
      </p>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/beautifully crafted/)).toBeVisible();
  },
};

export const TextSizes: Story = {
  name: "Text Sizes",
  render: () => (
    <div className="max-w-lg space-y-6">
      <div>
        <span className="mb-1 block text-muted-foreground text-xs">Large</span>
        <div className="font-semibold text-lg">Are you absolutely sure?</div>
      </div>
      <div>
        <span className="mb-1 block text-muted-foreground text-xs">Small</span>
        <small className="font-medium text-sm leading-none">
          Email address
        </small>
      </div>
      <div>
        <span className="mb-1 block text-muted-foreground text-xs">Muted</span>
        <p className="text-muted-foreground text-sm">
          Enter your email address.
        </p>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Are you absolutely sure?")).toBeVisible();
    await expect(canvas.getByText("Email address")).toBeVisible();
    await expect(canvas.getByText("Enter your email address.")).toBeVisible();
  },
};

const TYPESET_SAMPLE = (
  <>
    <h1>The Joke Tax Chronicles</h1>
    <p>
      Once upon a time, in a far-off land, there was a very lazy king who spent
      all day lounging on his throne. One day, his advisors came to him with a{" "}
      <a href="#problem">problem</a>: the kingdom was running out of money.
    </p>
    <h2>The King&apos;s Plan</h2>
    <p>
      The king thought long and hard, and finally came up with{" "}
      <strong>a brilliant plan</strong>: he would tax the jokes in the kingdom.
    </p>
    <blockquote>
      &ldquo;After all,&rdquo; he said, &ldquo;everyone enjoys a good joke, so
      it&apos;s only fair that they should pay for the privilege.&rdquo;
    </blockquote>
    <ul>
      <li>1st level of puns: 5 gold coins</li>
      <li>2nd level of jokes: 10 gold coins</li>
    </ul>
    <p>
      Run <code>pnpm add @keystoneui/react</code> to get started.
    </p>
  </>
);

/**
 * `class="typeset"` from base.css. The play test pins the contract the
 * docs promise: one --typeset-size rescales everything, a class on an
 * element beats the typeset rule, and appended content leaves what is
 * already rendered where it was.
 */
export const Typeset: Story = {
  render: () => (
    <div className="flex max-w-2xl flex-col gap-10">
      <article className="typeset" data-testid="typeset-default">
        {TYPESET_SAMPLE}
      </article>
      <article
        className="typeset [--typeset-size:0.875rem]"
        data-testid="typeset-small"
      >
        {TYPESET_SAMPLE}
      </article>
      <article className="typeset" data-testid="typeset-override">
        <p className="text-xs">A class on the element wins.</p>
      </article>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const px = (el: Element, prop: "fontSize" | "marginTop") =>
      Number.parseFloat(getComputedStyle(el)[prop]);

    const base = canvas.getByTestId("typeset-default");
    const small = canvas.getByTestId("typeset-small");
    const h1 = base.querySelector("h1") as HTMLElement;

    // Headings are em-relative to --typeset-size.
    await expect(px(h1, "fontSize")).toBeCloseTo(36, 0);
    await expect(
      px(small.querySelector("h1") as HTMLElement, "fontSize")
    ).toBeCloseTo(31.5, 0);

    // Block rhythm: the first block sits flush, the next gets the flow gap.
    await expect(px(h1, "marginTop")).toBe(0);
    await expect(
      px(base.querySelector("p") as HTMLElement, "marginTop")
    ).toBeGreaterThan(0);

    // :where() keeps the rules at (0,1,0), so text-xs beats them.
    const override = canvas
      .getByTestId("typeset-override")
      .querySelector("p") as HTMLElement;
    await expect(px(override, "fontSize")).toBe(12);

    // Streaming: appending a block must not move anything already rendered.
    const paragraphs = base.querySelectorAll("p");
    const last = paragraphs.item(paragraphs.length - 1);
    const before = last.getBoundingClientRect().top;
    const streamed = document.createElement("p");
    streamed.textContent = "A streamed token arrives.";
    base.append(streamed);
    await expect(last.getBoundingClientRect().top).toBe(before);
    streamed.remove();
  },
};
