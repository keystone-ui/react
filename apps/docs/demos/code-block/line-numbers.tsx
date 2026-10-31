"use client";

import { CodeBlock, CodeBlockContent } from "@keystoneui/react/code-block";

const code = `const total = items.reduce((sum, item) => {
  return sum + item.price * item.quantity;
}, 0);

const tax = total * TAX_RATE;
const grandTotal = total + tax;`;

/** Line numbers are a CSS counter, so selecting and copying skips them. */
export default function CodeBlockLineNumbers() {
  return (
    <CodeBlock
      className="w-full max-w-lg"
      code={code}
      highlightLines={[5, 6]}
      lineNumbers
    >
      <CodeBlockContent />
    </CodeBlock>
  );
}
