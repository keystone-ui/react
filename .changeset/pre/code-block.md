---
"@keystoneui/react": minor
---

Add `CodeBlock`: code, terminal output, logs and diffs, with an optional header and copy button.

```tsx
<CodeBlock code={source} lineNumbers highlightLines={[4]}>
  <CodeBlockHeader>
    <CodeBlockTitle>save-button.tsx</CodeBlockTitle>
    <CodeBlockActions>
      <CodeBlockCopyButton />
    </CodeBlockActions>
  </CodeBlockHeader>
  <CodeBlockContent />
</CodeBlock>
```

- `lineNumbers` numbers lines with a CSS counter, so a copied selection never includes them.
- `highlightLines` takes 1-based line numbers.
- `diff` reads a leading `+` / `-` as an added / removed line, tinted from `--success` / `--destructive`.
- `wrap` wraps long lines, and `size="sm"` suits tool output.
- No highlighter ships with it: pass your highlighter's markup as `CodeBlockContent`'s children, and the copy button still copies the plain `code`.
