import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockTitle,
} from "@keystoneui/react/code-block";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";

const meta = {
  title: "Components/CodeBlock",
  component: CodeBlock,
  parameters: {
    docs: {
      description: {
        component:
          "Code, terminal output, logs and diffs, with an optional header and copy button. Plain text: pass highlighted markup as CodeBlockContent's children to bring your own highlighter.",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof CodeBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

const SOURCE = `import { Button } from "@/components/ui/button";

export function SaveButton() {
  return <Button>Save changes</Button>;
}`;

export const Default: Story = {
  args: { code: SOURCE },
  render: (args) => (
    <CodeBlock {...args} className="max-w-lg">
      <CodeBlockHeader>
        <CodeBlockTitle>save-button.tsx</CodeBlockTitle>
        <CodeBlockActions>
          <CodeBlockCopyButton />
        </CodeBlockActions>
      </CodeBlockHeader>
      <CodeBlockContent />
    </CodeBlock>
  ),
};

export const LineNumbers: Story = {
  args: { code: SOURCE, highlightLines: [4], lineNumbers: true },
  render: (args) => (
    <CodeBlock {...args} className="max-w-lg">
      <CodeBlockContent />
    </CodeBlock>
  ),
  play: async ({ canvasElement }) => {
    const lines = canvasElement.querySelectorAll<HTMLElement>("[data-line]");
    // The number is generated content, so the line's own text never holds it
    // and a copy of the selection never includes it.
    const marker = getComputedStyle(lines[0], "::before").content;
    await expect(marker).not.toBe("none");
    await expect(lines[0].textContent?.startsWith("1")).toBe(false);
    await expect(getComputedStyle(lines[3]).backgroundColor).not.toBe(
      getComputedStyle(lines[2]).backgroundColor
    );
  },
};

export const Diff: Story = {
  args: {
    code: " function a() {\n-  return 1;\n+  return 2;\n }",
    diff: true,
  },
  render: (args) => (
    <CodeBlock {...args} className="max-w-lg">
      <CodeBlockContent />
    </CodeBlock>
  ),
  play: async ({ canvasElement }) => {
    const [, removed, added] =
      canvasElement.querySelectorAll<HTMLElement>("[data-line]");
    await expect(removed.dataset.diff).toBe("remove");
    await expect(added.dataset.diff).toBe("add");
    await expect(getComputedStyle(added).backgroundColor).not.toBe(
      "rgba(0, 0, 0, 0)"
    );
  },
};

export const Terminal: Story = {
  args: {
    code: "$ pnpm smoke:install\n✔ vite-src / ui\n\nOK — 54 install(s) typechecked.",
    size: "sm",
    wrap: true,
  },
  render: (args) => (
    <CodeBlock {...args} className="max-w-sm">
      <CodeBlockHeader>
        <CodeBlockTitle>Terminal</CodeBlockTitle>
        <CodeBlockActions>
          <CodeBlockCopyButton />
        </CodeBlockActions>
      </CodeBlockHeader>
      <CodeBlockContent />
    </CodeBlock>
  ),
  play: async ({ canvasElement }) => {
    const pre = within(canvasElement).getByText(
      (_, el) => el?.tagName === "PRE"
    );
    await expect(getComputedStyle(pre).whiteSpace).toBe("pre-wrap");
    // The scroll region is reachable by keyboard.
    await expect(pre.tabIndex).toBe(0);
  },
};
