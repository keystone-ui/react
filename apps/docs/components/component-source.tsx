import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { highlight } from "fumadocs-core/highlight";
import { CodeBlock, Pre } from "fumadocs-ui/components/codeblock";

import { getDemo } from "@/demos";
import { getAppDir } from "@/lib/resolve-app-dir";

interface ComponentSourceProps {
  name: string;
}

export async function ComponentSource({ name }: ComponentSourceProps) {
  const demo = getDemo(name);

  if (!demo?.file) {
    return null;
  }

  const appDir = getAppDir();
  const filePath = join(appDir, "demos", demo.file);
  console.error(
    `[ComponentSource] name=${name} appDir=${appDir} filePath=${filePath}`
  );
  let code: string;

  try {
    code = await readFile(filePath, "utf-8");
  } catch (err) {
    console.error(`[ComponentSource] FAILED to read ${filePath}:`, err);
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-3 text-red-600 text-sm">
        Could not read source file: {demo.file}
      </div>
    );
  }

  const highlighted = await highlight(code.trimEnd(), { lang: "tsx" });

  return (
    <CodeBlock keepBackground={false}>
      <Pre>{highlighted}</Pre>
    </CodeBlock>
  );
}
