"use client";

import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockTitle,
} from "@keystoneui/react/code-block";

const code = `import { Button } from "@/components/ui/button";

export function SaveButton() {
  return <Button>Save changes</Button>;
}`;

export default function CodeBlockDefault() {
  return (
    <CodeBlock className="w-full max-w-lg" code={code}>
      <CodeBlockHeader>
        <CodeBlockTitle>save-button.tsx</CodeBlockTitle>
        <CodeBlockActions>
          <CodeBlockCopyButton />
        </CodeBlockActions>
      </CodeBlockHeader>
      <CodeBlockContent />
    </CodeBlock>
  );
}
