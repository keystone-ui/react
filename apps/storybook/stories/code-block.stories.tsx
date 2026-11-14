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

/**
 * A focused part's outline as the user sees it: the computed style, and any
 * ancestor that hides overflow and would clip it. The library's outline is
 * Button's: 2px solid at offset 2px (the browser's own ring is `auto` 1px).
 */
function readFocusOutline(el: HTMLElement) {
  const style = getComputedStyle(el);
  const reach =
    Number.parseFloat(style.outlineOffset) +
    Number.parseFloat(style.outlineWidth);
  const box = el.getBoundingClientRect();
  const clippedBy: string[] = [];
  for (let a = el.parentElement; a; a = a.parentElement) {
    const s = getComputedStyle(a);
    if (s.overflowX === "visible" && s.overflowY === "visible") {
      continue;
    }
    const b = a.getBoundingClientRect();
    const left = b.left + a.clientLeft;
    const top = b.top + a.clientTop;
    if (
      box.left - reach < left - 0.5 ||
      box.top - reach < top - 0.5 ||
      box.right + reach > left + a.clientWidth + 0.5 ||
      box.bottom + reach > top + a.clientHeight + 0.5
    ) {
      clippedBy.push(a.dataset.slot ?? a.tagName.toLowerCase());
    }
  }
  return {
    focusVisible: el.matches(":focus-visible"),
    style: style.outlineStyle,
    width: style.outlineWidth,
    offset: style.outlineOffset,
    clippedBy,
  };
}

/** Focus `el`, let its colour transition settle, read, and blur. */
async function focusAndRead(el: HTMLElement) {
  el.focus();
  await new Promise((r) => setTimeout(r, 300));
  const outline = readFocusOutline(el);
  el.blur();
  return outline;
}

const LIBRARY_OUTLINE = {
  focusVisible: true,
  style: "solid",
  width: "2px",
  offset: "2px",
  clippedBy: [],
};

/** Corner radii, clockwise from top-left. */
function cornerRadii(el: HTMLElement) {
  const s = getComputedStyle(el);
  return [
    s.borderTopLeftRadius,
    s.borderTopRightRadius,
    s.borderBottomRightRadius,
    s.borderBottomLeftRadius,
  ];
}

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
  // The scroll region draws the library's keyboard focus outline, not the
  // browser's 1px `auto` ring. The root clips overflow, so the outline sits
  // inside the region (offset -2px) where it can be seen.
  play: async ({ canvasElement }) => {
    const region = canvasElement.querySelector(
      "[data-slot='code-block-content']"
    ) as HTMLElement;
    await expect(await focusAndRead(region)).toEqual({
      ...LIBRARY_OUTLINE,
      offset: "-2px",
    });
    // The inset outline follows the root's corners where the region meets
    // them, so the root's rounding does not cut it; the edge under the
    // header stays square.
    const [, , rootBottom] = cornerRadii(
      region.closest("[data-slot='code-block']") as HTMLElement
    );
    await expect(rootBottom).not.toBe("0px");
    await expect(cornerRadii(region)).toEqual([
      "0px",
      "0px",
      rootBottom,
      rootBottom,
    ]);
  },
};

export const LineNumbers: Story = {
  args: { code: SOURCE, highlightLines: [4], lineNumbers: true },
  render: (args) => (
    <CodeBlock {...args} className="max-w-lg">
      <CodeBlockContent />
    </CodeBlock>
  ),
  play: async ({ canvasElement }) => {
    // Without a header the region shares all four corners with the root.
    const region = canvasElement.querySelector(
      "[data-slot='code-block-content']"
    ) as HTMLElement;
    const root = region.closest("[data-slot='code-block']") as HTMLElement;
    await expect(cornerRadii(root)[0]).not.toBe("0px");
    await expect(cornerRadii(region)).toEqual(cornerRadii(root));

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
