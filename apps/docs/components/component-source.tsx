import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { highlight } from "fumadocs-core/highlight";
import { CodeBlock, Pre } from "fumadocs-ui/components/codeblock";

import { getDemoFile } from "@/demos/files";

interface ComponentSourceProps {
  name: string;
}

export async function ComponentSource({ name }: ComponentSourceProps) {
  const file = getDemoFile(name);

  if (!file) {
    return null;
  }

  const filePath = join(process.cwd(), "demos", file);
  let code: string;

  try {
    code = await readFile(filePath, "utf-8");
  } catch {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-3 text-red-600 text-sm">
        Could not read source file: {file}
      </div>
    );
  }

  const highlighted = await highlight(code.trimEnd(), { lang: "tsx" });

  return (
    <CodeBlock
      className="my-0 rounded-none border-transparent"
      keepBackground={false}
    >
      <Pre>{highlighted}</Pre>
    </CodeBlock>
  );
}
