"use client";

import {
  CodeBlock,
  CodeBlockContent,
  CodeBlockHeader,
  CodeBlockTitle,
} from "@keystoneui/react/code-block";

const patch = ` export function Price({ amount }: { amount: number }) {
-  return <span>{amount}</span>;
+  return <span className="tabular-nums">{format(amount)}</span>;
 }`;

/** A leading + or - marks an added or removed line. */
export default function CodeBlockDiff() {
  return (
    <CodeBlock className="w-full max-w-lg" code={patch} diff>
      <CodeBlockHeader>
        <CodeBlockTitle>price.tsx</CodeBlockTitle>
      </CodeBlockHeader>
      <CodeBlockContent />
    </CodeBlock>
  );
}
