import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockTitle,
} from "./code-block";

const SOURCE = `import { Button } from "@/components/ui/button"

export function Save() {
  return <Button>Save</Button>
}
`;

const LEADING_DIGIT = /^\d/;

function lines(container: HTMLElement) {
  return [...container.querySelectorAll<HTMLElement>("[data-line]")];
}

describe("CodeBlock", () => {
  it("renders one line per source line, ignoring the trailing newline", () => {
    const { container } = render(
      <CodeBlock code={SOURCE}>
        <CodeBlockContent />
      </CodeBlock>
    );
    const rendered = lines(container);
    expect(rendered).toHaveLength(5);
    expect(rendered[0]).toHaveTextContent(
      'import { Button } from "@/components/ui/button"'
    );
    // An empty line keeps its height.
    expect(rendered[1].textContent).toBe(" ");
  });

  it("copies the whole code, not the rendered lines", async () => {
    render(
      <CodeBlock code={SOURCE}>
        <CodeBlockHeader>
          <CodeBlockTitle>save.tsx</CodeBlockTitle>
          <CodeBlockActions>
            <CodeBlockCopyButton />
          </CodeBlockActions>
        </CodeBlockHeader>
        <CodeBlockContent />
      </CodeBlock>
    );
    expect(screen.getByText("save.tsx")).toHaveAttribute(
      "data-slot",
      "code-block-title"
    );
    const writeText = vi.fn(() => Promise.resolve());
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
      writable: true,
    });
    await userEvent.click(screen.getByRole("button", { name: "Copy code" }));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith(SOURCE));
  });

  it("marks highlighted lines", () => {
    const { container } = render(
      <CodeBlock code={SOURCE} highlightLines={[4]}>
        <CodeBlockContent />
      </CodeBlock>
    );
    const highlighted = lines(container).filter((l) => l.dataset.highlighted);
    expect(highlighted.map((l) => l.dataset.line)).toEqual(["4"]);
    expect(highlighted[0]).toHaveClass("bg-accent");
  });

  it("reads +/- prefixes as diff lines only in diff mode", () => {
    const patch = "-const a = 1\n+const a = 2\n const b = 3";
    const { container, rerender } = render(
      <CodeBlock code={patch} diff>
        <CodeBlockContent />
      </CodeBlock>
    );
    expect(lines(container).map((l) => l.dataset.diff)).toEqual([
      "remove",
      "add",
      undefined,
    ]);
    expect(lines(container)[1]).toHaveClass("bg-success/10");

    rerender(
      <CodeBlock code={patch}>
        <CodeBlockContent />
      </CodeBlock>
    );
    expect(lines(container).every((l) => l.dataset.diff === undefined)).toBe(
      true
    );
  });

  it("numbers lines with a CSS counter, so the numbers are never copied", () => {
    const { container } = render(
      <CodeBlock code={SOURCE} lineNumbers>
        <CodeBlockContent />
      </CodeBlock>
    );
    const pre = container.querySelector("pre");
    expect(pre).toHaveAttribute("data-line-numbers");
    expect(lines(container)[0].textContent).not.toMatch(LEADING_DIGIT);
    expect(lines(container)[0].className).toContain("counter(code-line)");
  });

  it("wraps on request and is a focusable scroll region otherwise", () => {
    const { container } = render(
      <CodeBlock code={SOURCE} wrap>
        <CodeBlockContent />
      </CodeBlock>
    );
    const pre = container.querySelector("pre");
    expect(pre).toHaveClass("whitespace-pre-wrap");
    expect(pre).toHaveAttribute("tabindex", "0");
  });

  it("renders highlighted markup passed as children instead of lines", () => {
    const { container } = render(
      <CodeBlock code={SOURCE}>
        <CodeBlockContent>
          <span className="token keyword">import</span>
        </CodeBlockContent>
      </CodeBlock>
    );
    expect(lines(container)).toHaveLength(0);
    expect(container.querySelector(".token")).toHaveTextContent("import");
  });

  it("throws a clear error outside CodeBlock", () => {
    expect(() => render(<CodeBlockContent />)).toThrow(
      "CodeBlockContent must be used within <CodeBlock>."
    );
  });
});
