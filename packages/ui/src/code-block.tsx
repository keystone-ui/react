"use client";

import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { createContext, useContext, useMemo } from "react";

import { CopyButton, type CopyButtonProps } from "./copy-button";
import { cn } from "./utils";

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface CodeBlockContextValue {
  code: string;
  diff: boolean;
  highlight: ReadonlySet<number>;
  lineNumbers: boolean;
  wrap: boolean;
}

const CodeBlockContext = createContext<CodeBlockContextValue | null>(null);

function useCodeBlock(part: string): CodeBlockContextValue {
  const context = useContext(CodeBlockContext);
  if (!context) {
    throw new Error(`${part} must be used within <CodeBlock>.`);
  }
  return context;
}

// ---------------------------------------------------------------------------
// Variants
// ---------------------------------------------------------------------------

const codeBlockVariants = cva(
  "group/code-block flex min-w-0 flex-col overflow-hidden rounded-lg border border-border bg-muted/40 text-foreground",
  {
    variants: {
      size: {
        default: "text-[13px] [--code-block-pad:1rem]",
        sm: "text-xs [--code-block-pad:0.75rem]",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

// ---------------------------------------------------------------------------
// CodeBlock
// ---------------------------------------------------------------------------

export interface CodeBlockProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof codeBlockVariants> {
  /** The source shown by `CodeBlockContent` and copied by `CodeBlockCopyButton`. */
  code: string;
  /**
   * Read a leading `+` or `-` on each line as an added or removed line.
   * @default false
   */
  diff?: boolean;
  /** 1-based line numbers to highlight. */
  highlightLines?: readonly number[];
  /** @default false */
  lineNumbers?: boolean;
  /** Wrap long lines instead of scrolling. @default false */
  wrap?: boolean;
}

/**
 * Code, terminal output, logs and diffs, with an optional header.
 *
 * Plain text by design: no highlighter ships with it. Pass the highlighted
 * markup of your choice as `CodeBlockContent`'s children and the frame, header
 * and copy button still work; the line features need the plain `code`.
 */
function CodeBlock({
  className,
  code,
  diff = false,
  highlightLines,
  lineNumbers = false,
  size,
  wrap = false,
  ...props
}: CodeBlockProps) {
  const value = useMemo<CodeBlockContextValue>(
    () => ({
      code,
      diff,
      highlight: new Set(highlightLines),
      lineNumbers,
      wrap,
    }),
    [code, diff, highlightLines, lineNumbers, wrap]
  );

  return (
    <CodeBlockContext.Provider value={value}>
      <div
        className={cn(codeBlockVariants({ size }), className)}
        data-size={size ?? "default"}
        data-slot="code-block"
        {...props}
      />
    </CodeBlockContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Header
// ---------------------------------------------------------------------------

function CodeBlockHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex min-h-10 items-center gap-2 border-border border-b bg-muted/60 py-1 ps-(--code-block-pad) pe-1.5 group-data-[size=sm]/code-block:min-h-8",
        className
      )}
      data-slot="code-block-header"
      {...props}
    />
  );
}

function CodeBlockTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "min-w-0 flex-1 truncate font-medium font-mono text-muted-foreground text-xs",
        className
      )}
      data-slot="code-block-title"
      {...props}
    />
  );
}

function CodeBlockActions({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("ms-auto flex shrink-0 items-center gap-1", className)}
      data-slot="code-block-actions"
      {...props}
    />
  );
}

/** Copies the block's `code`. */
function CodeBlockCopyButton({
  "aria-label": ariaLabel = "Copy code",
  size = "icon-xs",
  ...props
}: Omit<CopyButtonProps, "value">) {
  const { code } = useCodeBlock("CodeBlockCopyButton");
  return (
    <CopyButton
      aria-label={ariaLabel}
      data-slot="code-block-copy-button"
      size={size}
      value={code}
      {...props}
    />
  );
}

// ---------------------------------------------------------------------------
// Content
// ---------------------------------------------------------------------------

const TRAILING_NEWLINE = /\n$/;

type DiffMark = "add" | "remove" | undefined;

function diffMark(line: string): DiffMark {
  if (line.startsWith("+")) {
    return "add";
  }
  if (line.startsWith("-")) {
    return "remove";
  }
}

/**
 * The code itself. Renders `code` line by line, or your highlighted markup
 * when you pass children.
 */
function CodeBlockContent({
  children,
  className,
  ...props
}: React.ComponentProps<"pre">) {
  const { code, diff, highlight, lineNumbers, wrap } =
    useCodeBlock("CodeBlockContent");
  const lines = code.replace(TRAILING_NEWLINE, "").split("\n");

  return (
    <pre
      className={cn(
        "m-0 overflow-x-auto py-(--code-block-pad) font-mono leading-relaxed [counter-reset:code-line]",
        wrap ? "whitespace-pre-wrap break-words" : "whitespace-pre",
        className
      )}
      data-line-numbers={lineNumbers || undefined}
      data-slot="code-block-content"
      data-wrap={wrap || undefined}
      // A horizontally scrolling region must be reachable by keyboard (WCAG
      // 2.1.1; axe's scrollable-region-focusable).
      // biome-ignore lint/a11y/noNoninteractiveTabindex: scroll container
      tabIndex={0}
      {...props}
    >
      <code className="block min-w-fit">
        {children ??
          lines.map((line, index) => {
            const number = index + 1;
            const mark = diff ? diffMark(line) : undefined;
            return (
              <span
                className={cn(
                  "block px-(--code-block-pad)",
                  // Line numbers are a CSS counter, so selecting and copying
                  // the code never picks them up.
                  lineNumbers &&
                    "before:me-4 before:inline-block before:w-[2ch] before:select-none before:text-end before:text-muted-foreground/70 before:content-[counter(code-line)] before:[counter-increment:code-line]",
                  highlight.has(number) && "bg-accent",
                  mark === "add" && "bg-success/10",
                  mark === "remove" && "bg-destructive/10"
                )}
                data-diff={mark}
                data-highlighted={highlight.has(number) || undefined}
                data-line={number}
                // Lines are positional and never reorder.
                // biome-ignore lint/suspicious/noArrayIndexKey: a line's index is its identity
                key={index}
              >
                {line || " "}
              </span>
            );
          })}
      </code>
    </pre>
  );
}

export {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockTitle,
  codeBlockVariants,
};
