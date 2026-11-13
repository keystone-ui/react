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

/** A token with no break opportunity: a URL, a hash or a base64 string. */
const LONG_TOKEN = `https://example.com/${"a".repeat(180)}`;

/** The top of a line's first character, relative to the line's own box. */
function firstCharTop(line: HTMLElement) {
  const text = document
    .createTreeWalker(line, NodeFilter.SHOW_TEXT)
    .nextNode() as Text;
  const range = document.createRange();
  range.setStart(text, 0);
  range.setEnd(text, 1);
  const charBox = range.getBoundingClientRect();
  const lineBox = line.getBoundingClientRect();
  // Two empty rectangles would compare equal; the line must be rendered.
  expect(charBox.width).toBeGreaterThan(0);
  expect(charBox.height).toBeGreaterThan(0);
  expect(lineBox.height).toBeGreaterThan(0);
  return charBox.top - lineBox.top;
}

/**
 * `wrap` wraps a line that has no break opportunity instead of scrolling, and
 * a wrapped line keeps its number beside its first row and its background on
 * every row. Without `wrap` the same line still scrolls, and its highlight
 * still reaches the end of the scroll.
 */
export const WrapLongToken: Story = {
  args: { code: `${LONG_TOKEN}\nshort`, highlightLines: [1] },
  render: (args) => (
    // A block parent, so the width is fixed and no grid or flex item minimum
    // stretches the blocks.
    <div style={{ width: 320 }}>
      <CodeBlock {...args} data-testid="wrap" wrap>
        <CodeBlockContent />
      </CodeBlock>
      <CodeBlock
        {...args}
        className="mt-4"
        data-testid="numbered"
        lineNumbers
        wrap
      >
        <CodeBlockContent />
      </CodeBlock>
      <CodeBlock {...args} className="mt-4" data-testid="scroll">
        <CodeBlockContent />
      </CodeBlock>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const parts = (id: string) => {
      const root = canvasElement.querySelector(
        `[data-testid='${id}']`
      ) as HTMLElement;
      const pre = root.querySelector("pre") as HTMLElement;
      const [long, short] = root.querySelectorAll<HTMLElement>("[data-line]");
      return { pre, long, short };
    };

    // Wrapped: nothing overflows sideways, the long line takes several rows,
    // and its highlight spans the region's width on all of them.
    const wrap = parts("wrap");
    await expect(wrap.pre.scrollWidth).toBeLessThanOrEqual(
      wrap.pre.clientWidth
    );
    const longBox = wrap.long.getBoundingClientRect();
    await expect(longBox.height).toBeGreaterThan(
      wrap.short.getBoundingClientRect().height * 2
    );
    // `clientWidth` is rounded, so allow a pixel.
    await expect(
      Math.abs(longBox.width - wrap.pre.clientWidth)
    ).toBeLessThanOrEqual(1);
    await expect(getComputedStyle(wrap.long).backgroundColor).not.toBe(
      "rgba(0, 0, 0, 0)"
    );

    // Numbered and wrapped: the code starts on the same row as its number,
    // as it does on a short line.
    const numbered = parts("numbered");
    await expect(numbered.pre.scrollWidth).toBeLessThanOrEqual(
      numbered.pre.clientWidth
    );
    await expect(firstCharTop(numbered.long)).toBe(
      firstCharTop(numbered.short)
    );

    // Not wrapped: the line scrolls, and at the end of the scroll the
    // highlight still reaches the region's right edge.
    const scroll = parts("scroll");
    await expect(scroll.pre.scrollWidth).toBeGreaterThan(
      scroll.pre.clientWidth
    );
    scroll.pre.scrollLeft = scroll.pre.scrollWidth;
    const preBox = scroll.pre.getBoundingClientRect();
    await expect(
      Math.round(scroll.long.getBoundingClientRect().right)
    ).toBeGreaterThanOrEqual(
      Math.round(preBox.left + scroll.pre.clientLeft + scroll.pre.clientWidth)
    );
    scroll.pre.scrollLeft = 0;
  },
};

/** Spaces only, a tab only, then a truly empty line (highlighted). */
const WHITESPACE_LINES = "alpha\n   \n\t\n\nomega";

/** What a user's drag-select over the block's code would copy. */
function selectedText(root: HTMLElement) {
  const selection = window.getSelection() as Selection;
  selection.selectAllChildren(root.querySelector("code") as HTMLElement);
  const text = selection.toString();
  selection.removeAllRanges();
  return text;
}

/**
 * Wrapped and numbered, a line of only spaces or only a tab still selects and
 * copies its white space, exactly as the same block does unwrapped, and a
 * truly empty highlighted line keeps its height and background.
 */
export const WrapWhitespaceLines: Story = {
  args: { code: WHITESPACE_LINES, highlightLines: [4] },
  render: (args) => (
    <div style={{ width: 320 }}>
      <CodeBlock {...args} data-testid="wrapped" lineNumbers wrap>
        <CodeBlockContent />
      </CodeBlock>
      <CodeBlock {...args} className="mt-4" data-testid="unwrapped" lineNumbers>
        <CodeBlockContent />
      </CodeBlock>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const root = (id: string) =>
      canvasElement.querySelector(`[data-testid='${id}']`) as HTMLElement;
    const wrapped = selectedText(root("wrapped"));
    const unwrapped = selectedText(root("unwrapped"));

    await expect(JSON.stringify(wrapped)).toBe(JSON.stringify(unwrapped));
    await expect(wrapped).toContain("   ");
    await expect(wrapped).toContain("\t");
    await expect(wrapped).not.toMatch(/\d/);

    const empty = root("wrapped").querySelector<HTMLElement>(
      "[data-line='4']"
    ) as HTMLElement;
    await expect(empty.getBoundingClientRect().height).toBeGreaterThan(0);
    await expect(getComputedStyle(empty).backgroundColor).not.toBe(
      "rgba(0, 0, 0, 0)"
    );
  },
};
