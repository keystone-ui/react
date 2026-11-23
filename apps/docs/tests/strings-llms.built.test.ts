/**
 * The Strings page's English rows reach the prerendered text route that MCP
 * `get_docs("strings")` fetches. `strings-docs.test.ts` pins the rows in the
 * MDX source; this pins them in the built `/llms.mdx/docs/components/strings`
 * body.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const BODY = join(
  import.meta.dirname,
  "../.next/server/app/llms.mdx/docs/components/strings.body"
);

describe("/llms.mdx/docs/components/strings", () => {
  it("carries Modal's English rows", () => {
    const body = readFileSync(BODY, "utf-8");
    expect(body).toContain("| `modal.close` | Close |");
    expect(body).toContain("| `modal.footerClose` | Close |");
  });
});
