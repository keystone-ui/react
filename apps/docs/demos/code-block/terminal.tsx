"use client";

import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockTitle,
} from "@keystoneui/react/code-block";

const output = `$ pnpm smoke:install
✔ vite-src / ui
✔ next-root / ui
✔ custom-ui-alias / ui

OK — 54 install(s) typechecked.`;

/** The small size, with wrapping, for tool output and logs. */
export default function CodeBlockTerminal() {
  return (
    <CodeBlock className="w-full max-w-lg" code={output} size="sm" wrap>
      <CodeBlockHeader>
        <CodeBlockTitle>Terminal</CodeBlockTitle>
        <CodeBlockActions>
          <CodeBlockCopyButton />
        </CodeBlockActions>
      </CodeBlockHeader>
      <CodeBlockContent />
    </CodeBlock>
  );
}
