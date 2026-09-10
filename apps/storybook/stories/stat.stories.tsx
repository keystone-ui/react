import { Card, CardContent } from "@keystoneui/react/card";
import { StatDelta, StatValue } from "@keystoneui/react/stat";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

const meta = {
  title: "Components/Stat",
  component: StatValue,
  parameters: {
    docs: {
      description: {
        component: `
The headline number of a metric, and its change.

\`\`\`tsx
import { deltaTone, StatDelta, StatValue } from "@keystoneui/react/stat";
\`\`\`

Deliberately just two parts plus a helper, composed into a \`Card\` rather than
wrapping one. A KPI tile is a Card with a label, a number and a change; giving
that its own root would duplicate Card's surface system, and \`Card\` +
\`CardContent\` already produces it.

**Colour comes from what the metric means, not from the sign of the delta.**
Revenue rising is good; p95 latency rising is not. \`StatDelta\` takes a
\`direction\` (\`"up-is-good"\` | \`"down-is-good"\` | \`"neutral"\`), and the arrow
follows the *sign* while the colour follows the *tone* — so a green down-arrow
is correct for a \`down-is-good\` metric that improved.

Formatting is not handled here: pass display text as \`children\` and the signed
number as \`value\`. Formatting a delta means picking a locale, a digit count and
a unit, none of which a component should decide for every consumer.
        `,
      },
    },
  },
} satisfies Meta<typeof StatValue>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card className="mx-auto w-full max-w-xs" size="sm">
      <CardContent className="flex flex-col gap-1">
        <div className="font-medium text-muted-foreground text-xs">
          Merged PRs
        </div>
        <StatValue>
          128
          <StatDelta direction="up-is-good" value={0.12}>
            +12%
          </StatDelta>
        </StatValue>
        <div className="text-muted-foreground text-xs">94 opened</div>
      </CardContent>
    </Card>
  ),
};

export const Direction: Story = {
  // Resolved colour, not class name: a `dark:` rule or a later utility could
  // override the class while the test still passed. This is the assertion that
  // proves tone comes from direction x sign rather than from the sign alone.
  play: async ({ canvasElement }) => {
    const deltas = [
      ...canvasElement.querySelectorAll('[data-slot="stat-delta"]'),
    ] as HTMLElement[];

    // Revenue rose (up-is-good) and p95 latency fell (down-is-good): opposite
    // signs, same tone, so they must resolve to the same colour.
    const revenue = deltas[0];
    const latency = deltas[2];
    await expect(revenue.dataset.tone).toBe("positive");
    await expect(latency.dataset.tone).toBe("positive");
    await expect(getComputedStyle(latency).color).toBe(
      getComputedStyle(revenue).color
    );

    // Signups fell (up-is-good): negative, and a different colour.
    const signups = deltas[1];
    await expect(signups.dataset.tone).toBe("negative");
    await expect(getComputedStyle(signups).color).not.toBe(
      getComputedStyle(revenue).color
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "The same delta reads differently depending on what the metric means. Note the third and fourth rows: the arrow follows the sign, the colour follows the tone.",
      },
    },
  },
  render: () => (
    <div className="mx-auto flex w-full max-w-xl flex-col divide-y">
      {(
        [
          ["Revenue", "$48.2k", 0.12, "+12%", "up-is-good"],
          ["Signups", "1,204", -0.06, "-6%", "up-is-good"],
          ["p95 latency", "212ms", -0.18, "-18%", "down-is-good"],
          ["Error rate", "0.4%", 0.09, "+9%", "down-is-good"],
          ["Headcount", "86", 0.03, "+3%", "neutral"],
        ] as const
      ).map(([label, value, delta, deltaLabel, direction]) => (
        <div className="py-3" key={label}>
          <div className="font-medium text-muted-foreground text-xs">
            {label}
          </div>
          <StatValue className="text-xl">
            {value}
            <StatDelta direction={direction} value={delta}>
              {deltaLabel}
            </StatDelta>
          </StatValue>
        </div>
      ))}
    </div>
  ),
};

export const KpiRow: Story = {
  name: "KPI Row",
  parameters: {
    docs: {
      description: {
        story:
          "A row of metrics in outline cards. `[&>*]:min-w-0` on the grid is load-bearing: grid children default to `min-content`, so a long value would otherwise push the track open and hand the document a horizontal scrollbar.",
      },
    },
  },
  render: () => (
    <div className="grid w-full gap-4 sm:grid-cols-2 xl:grid-cols-4 [&>*]:min-w-0">
      {(
        [
          ["Merged PRs", "128", 0.12, "+12%", "up-is-good", "94 opened"],
          [
            "Pickup p50",
            "3h 12m",
            -0.08,
            "-8%",
            "down-is-good",
            "to first review",
          ],
          [
            "Review wait p50",
            "1d 4h",
            0.04,
            "+4%",
            "down-is-good",
            "ready to approved",
          ],
          ["Active authors", "24", null, null, "neutral", "no prior period"],
        ] as const
      ).map(([label, value, delta, deltaLabel, direction, sublabel]) => (
        <Card key={label} size="sm" variant="outline">
          <CardContent className="flex flex-col gap-1">
            <div className="font-medium text-muted-foreground text-xs">
              {label}
            </div>
            <StatValue>
              {value}
              {delta === null ? null : (
                <StatDelta direction={direction} value={delta}>
                  {deltaLabel}
                </StatDelta>
              )}
            </StatValue>
            <div className="text-muted-foreground text-xs">{sublabel}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  ),
};
