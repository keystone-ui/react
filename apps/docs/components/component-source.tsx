import { CodeBlock, Pre } from "fumadocs-ui/components/codeblock";

import { getDemoFile } from "@/demos/files";
import { getHighlightedSource } from "@/lib/highlight-source";

interface ComponentSourceProps {
  name: string;
}

/**
 * Server component. The highlighted code reaches the client `<Pre>` as one
 * HTML string (see lib/highlight-source.ts), not as an element per token.
 * The copy button reads `textContent`, so it is unaffected.
 */
export async function ComponentSource({ name }: ComponentSourceProps) {
  const file = getDemoFile(name);

  if (!file) {
    return null;
  }

  let highlighted: Awaited<ReturnType<typeof getHighlightedSource>>;
  try {
    highlighted = await getHighlightedSource(file);
  } catch {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-3 text-red-600 text-sm">
        Could not read source file: {file}
      </div>
    );
  }

  return (
    <CodeBlock
      className="my-0 rounded-none border-transparent"
      keepBackground={false}
    >
      <Pre
        {...highlighted.preProps}
        // biome-ignore lint/security/noDangerouslySetInnerHtml: server-rendered shiki output for a file in this repo; one string instead of ~1,700 Flight nodes
        dangerouslySetInnerHTML={{ __html: highlighted.html }}
      />
    </CodeBlock>
  );
}
