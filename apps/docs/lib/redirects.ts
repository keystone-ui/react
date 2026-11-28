/**
 * Every docs URL that moved, old path to new path. next.config.ts serves
 * each as a permanent redirect, and tests/redirects.test.ts checks that no
 * destination is itself a moved path and every destination is a real page.
 *
 * Never delete an entry: old URLs are printed in published package READMEs
 * and in the MCP server's setup output, so they must redirect forever.
 */
export const DOCS_REDIRECTS: Readonly<Record<string, string>> = {
  "/docs/getting-started": "/docs",
  "/docs/getting-started/quick-start": "/docs/installation/quick-start",
  "/docs/getting-started/registry": "/docs/installation/registry",
  "/docs/getting-started/theming": "/docs/theming",
  "/docs/getting-started/colors": "/docs/theming/colors",
  "/docs/getting-started/dark-mode": "/docs/theming/dark-mode",
  "/docs/getting-started/customization": "/docs/theming/customization",
  "/docs/getting-started/llms-txt": "/docs/agents/llms-txt",
  "/docs/rtl": "/docs/concepts/rtl",
};
